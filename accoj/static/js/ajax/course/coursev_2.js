// 页面加载完成填充数据
$(document).ready(function () {
    get_balance_sheet_info();
});

//==================================提交会计平衡表信息==================================//

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_balance_sheet() {
    bind_confirm_info("confirm_balance_sheet_button", "submit_balance_sheet_info");
}

/**
 * 保存会计平衡表信息
 */
function save_balance_sheet() {
    bind_save_info("save_balance_sheet_button", submit_balance_sheet_info);
}


/**
 * 提交会计平衡表信息
 * @param submit_type confirm or save
 */
function submit_balance_sheet_info(submit_type) {
    let accounting_period_1 = Array(),
        accounting_period_2 = Array();

    $("[id^=period1_row], [id=period1_last], [id^=period2_row], [id=period2_last]").each(function () {
        let thisInputs = $(this).find("input"),
            inputIndex = 0,
            subject = $(this).attr("id").endsWith("last") ? "sum" : $(thisInputs[0]).val();
        if (subject !== "sum") inputIndex = 1;
        let borrow_1 = $(thisInputs[inputIndex]).val(),
            lend_1 = $(thisInputs[inputIndex + 1]).val(),
            borrow_2 = $(thisInputs[inputIndex + 2]).val(),
            lend_2 = $(thisInputs[inputIndex + 3]).val(),
            borrow_3 = $(thisInputs[inputIndex + 4]).val(),
            lend_3 = $(thisInputs[inputIndex + 5]).val();
        let content = {
            "subject": subject,
            "borrow_1": borrow_1,
            "lend_1": lend_1,
            "borrow_2": borrow_2,
            "lend_2": lend_2,
            "borrow_3": borrow_3,
            "lend_3": lend_3,
        };
        if ($(this).attr("id").startsWith("period1"))
            accounting_period_1.push(content);
        else accounting_period_2.push(content);
    });

    let data = {
        "balance_sheet_infos": {"accounting_period_1": accounting_period_1, "accounting_period_2": accounting_period_2},
        "submit_type": submit_type
    };
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_balance_sheet_info",
        messageDivID = "course_v_2_message",
        successFunc = get_balance_sheet_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);

}

//==================================获取会计平衡表信息==================================//
let balance_sheet_infos; // 保存本次课程全部信息，减少后端数据请求次数
/**
 * 从后端获取会计平衡表信息
 */
function get_balance_sheet_info() {

    // 若balance_sheet_info不为空且已经确认提交过，则不再发送数据请求
    if (balance_sheet_infos && balance_sheet_infos["confirmed"] === true) {
        map_balance_sheet_info();
        return;
    }

    // 获取数据
    let data = {},
        url = "/get_balance_sheet_info",
        successFunc = map_balance_sheet_info,
        messageDivID = "course_v_2_message";
    get_info(data, url, successFunc, messageDivID);

}

/**
 * 将数据映射到前端
 */
function map_balance_sheet_info(data) {
    data = data ? data : "";
    balance_sheet_infos = data ? data["balance_sheet_infos"] : balance_sheet_infos;

    if (!balance_sheet_infos) return;
    // 先清空数据
    $("[id^=period1_row][id!=period1_row_1], [id^=period2_row][id!=period2_row_1]").remove();
    $("input").val("");
    // 如果已保存过则显示标签为保存状态，已提交过则更改标签为已提交标签
    let confirmed = balance_sheet_infos["confirmed"],
        saved = balance_sheet_infos["saved"],
        accounting_period_1 = balance_sheet_infos["accounting_period_1"],
        accounting_period_2 = balance_sheet_infos["accounting_period_2"],
        balance_sheet_submit_span = $("#balance_sheet_submit_span");
    if (confirmed || saved) {
        // 初始化为saved
        let span_text = "已保存",
            span_color = "#5bc0de";
        if (confirmed) {
            span_text = "已完成";
            span_color = "#5cb85c";
        }
        balance_sheet_submit_span.css("color", span_color);
        balance_sheet_submit_span.text(span_text);
        balance_sheet_submit_span.show();
    } else {
        balance_sheet_submit_span.hide();
    }
    // 创建行
    for (let i = 0; i < accounting_period_1.length - 2; i++) {
        v2_AddRow("period1");
    }
    for (let i = 0; i < accounting_period_2.length - 2; i++) {
        v2_AddRow("period2");
    }
    // 填充数据
    let accounting_period = accounting_period_1;
    let index = 0;
    $("[id^=period1_row], [id=period1_last], [id^=period2_row], [id=period2_last]").each(function () {
        let thisInputs = $(this).find("input");
        if ($(this).attr("id") === "period2_row_1") {
            accounting_period = accounting_period_2;
            index = 0;
        }
        let subject = accounting_period[index]["subject"],
            borrow_1 = accounting_period[index]["borrow_1"],
            lend_1 = accounting_period[index]["lend_1"],
            borrow_2 = accounting_period[index]["borrow_2"],
            lend_2 = accounting_period[index]["lend_2"],
            borrow_3 = accounting_period[index]["borrow_3"],
            lend_3 = accounting_period[index]["lend_3"],
            inputIndex = 0;
        if (subject !== "sum") {
            $(thisInputs[inputIndex]).val(subject);
            inputIndex = 1;
        }
        $(thisInputs[inputIndex]).val(borrow_1);
        $(thisInputs[inputIndex + 1]).val(lend_1);
        $(thisInputs[inputIndex + 2]).val(borrow_2);
        $(thisInputs[inputIndex + 3]).val(lend_2);
        $(thisInputs[inputIndex + 4]).val(borrow_3);
        $(thisInputs[inputIndex + 5]).val(lend_3);
        index++;
    });
}

// ==================================事件控制==================================//
let period1_row = 2,
    period2_row = 2;

/*
 * @ # coursev_2 -> 平衡表 ? 表格增加行
 */
function v2_AddRow(period) {
    let period_row_id = "period1_row_" + period1_row;
    if (period === "period2") {
        period_row_id = "period2_row_" + period1_row;
        period2_row++;
    } else {
        period1_row++;
    }
    $("#" + period + "_last").before(
        "<tr id='" + period_row_id + "'>"
        + "<td><label><input name='subject' title='科目' onkeyup='illegalCharFilter(this)'></label></td>" +
        "<td><label><input name='borrow_1' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='lend_1' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='borrow_2' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='lend_2' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='borrow_3' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='lend_3' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>"
        + "<td style='padding: 4px; border: 0'>"
        + "<div style='text-align: center'> "
        + "<a style='color: red;padding: 0' type='button' class='btn' onclick='v2_DeleteRow(this)'><span class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div> "
        + "</td> "
        + "</tr>"
    );
}


/*
 * @ # coursev_2 -> 平衡表 ? 表格删除行
 */
function v2_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}