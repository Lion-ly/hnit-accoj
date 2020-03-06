// 页面加载完成填充数据
$(document).ready(function () {
    get_balance_sheet_info();
});

//==================================提交会计平衡表信息==================================//

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_balance_sheet() {
    show_submit_confirm("submit_balance_sheet_info('confirm')");
    let confirm_balance_sheet_button = $("#confirm_balance_sheet_button");
    confirm_balance_sheet_button.attr("disabled", true);
    confirm_balance_sheet_button.text("提交 2s");
    setTimeout(function () {
        confirm_balance_sheet_button.text("提交 1s");
    }, 1000);
    setTimeout(function () {
        confirm_balance_sheet_button.attr("disabled", false);
    }, 2000);
}

/**
 * 保存会计平衡表信息
 */
function save_balance_sheet() {
    submit_balance_sheet_info("save");
    let save_balance_sheet_button = $("#save_balance_sheet_button");
    save_balance_sheet_button.attr("disabled", true);
    save_balance_sheet_button.text("保存 2s");
    setTimeout(function () {
        save_balance_sheet_button.text("保存 1s");
    }, 1000);
    setTimeout(function () {
        save_balance_sheet_button.attr("disabled", false);
        save_balance_sheet_button.text("保存");
    }, 2000);
}


/**
 * 提交会计平衡表信息
 * @param submit_type confirm or save
 */
function submit_balance_sheet_info(submit_type) {
    let type_flag = null;
    if (submit_type === "confirm") {
        type_flag = true;
    } else if (submit_type === "save") {
        type_flag = false;
    } else {
        return;
    }
    let csrf_token = get_csrf_token();
    let accounting_period_1 = Array();
    let accounting_period_2 = Array();

    $("[id^=period1_row], [id=period1_last]").each(function () {
        let tds = $(this).children();
        let subject = $(this).attr("id") === "period1_last" ? "sum" : $(tds[0]).children().children().val();
        let borrow_1 = $(tds[1]).children().children().val();
        let lend_1 = $(tds[2]).children().children().val();
        let borrow_2 = $(tds[3]).children().children().val();
        let lend_2 = $(tds[4]).children().children().val();
        let borrow_3 = $(tds[5]).children().children().val();
        let lend_3 = $(tds[6]).children().children().val();
        accounting_period_1.push({
            "subject": subject,
            "borrow_1": borrow_1,
            "lend_1": lend_1,
            "borrow_2": borrow_2,
            "lend_2": lend_2,
            "borrow_3": borrow_3,
            "lend_3": lend_3,
        })
    });
    $("[id^=period2_row], [id=period2_last]").each(function () {
        let tds = $(this).children();
        let subject = $(this).attr("id") === "period2_last" ? "sum" : $(tds[0]).children().children().val();
        let borrow_1 = $(tds[1]).children().children().val();
        let lend_1 = $(tds[2]).children().children().val();
        let borrow_2 = $(tds[3]).children().children().val();
        let lend_2 = $(tds[4]).children().children().val();
        let borrow_3 = $(tds[5]).children().children().val();
        let lend_3 = $(tds[6]).children().children().val();
        accounting_period_2.push({
            "subject": subject,
            "borrow_1": borrow_1,
            "lend_1": lend_1,
            "borrow_2": borrow_2,
            "lend_2": lend_2,
            "borrow_3": borrow_3,
            "lend_3": lend_3,
        })
    });

    let data = {
        "balance_sheet_infos": {"accounting_period_1": accounting_period_1, "accounting_period_2": accounting_period_2},
        "submit_type": submit_type
    };
    data = JSON.stringify(data);
    $.ajax({
        url: "/submit_balance_sheet_info",
        type: "post",
        data: data,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        cache: false,
        async: true,
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        },
        success: function (data) {
            if (data["result"] === true) {
                if (type_flag === true) {
                    show_message("submit_confirm_message", "提交成功！", "info", 1000);
                } else if (type_flag === false) {
                    show_message("course_ii_message", "保存成功！", "info", 1000);
                }
                get_balance_sheet_info();
            } else {
                if (type_flag === true) {
                    show_message("submit_confirm_message", data["message"], "danger", 1000, "提交失败！");
                } else if (type_flag === false) {
                    show_message("course_ii_message", data["message"], "danger", 1000, "保存失败！");
                }
            }
        },
        error: function (err) {
            console.log(err.statusText);
        },
        complete: function () {
            submit_confirm_clicked();
        }
    });
}

//==================================获取会计平衡表信息==================================//
let balance_sheet_infos; // 保存本次课程全部信息，减少后端数据请求次数，分页由前端完成
/**
 * 从后端获取会计平衡表信息
 */
function get_balance_sheet_info() {

    let csrf_token = {"csrf_token": get_csrf_token()};
    let data = $.param(csrf_token);
    // 若balance_sheet_info不为空且请求的业务编号已经确认提交过，则不再发送数据请求
    if (balance_sheet_infos && balance_sheet_infos["confirmed"] === true) {
        map_balance_sheet_info();
        return;
    }
    $.ajax({
        url: "/get_balance_sheet_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                balance_sheet_infos = data["balance_sheet_infos"];
                map_balance_sheet_info();
            } else {
                show_message("course_ii_message", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })
}

/**
 * 将数据映射到前端
 */
function map_balance_sheet_info() {
    if (!balance_sheet_infos) return;
    // 先清空数据
    $("[id^=period1_row][id!=period1_row_1], [id^=period2_row][id!=period1_row_2]").remove();
    $(":input").val("");
    // 如果已保存过则显示标签为保存状态，已提交过则更改标签为已提交标签
    let confirmed = balance_sheet_infos["confirmed"];
    let saved = balance_sheet_infos["saved"];
    let accounting_period_1 = balance_sheet_infos["accounting_period_1"];
    let accounting_period_2 = balance_sheet_infos["accounting_period_2"];
    let balance_sheet_submit_span = $("#balance_sheet_submit_span");
    if (confirmed || saved) {
        // 初始化为saved
        let span_text = "已保存";
        let span_color = "#5bc0de";
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
        v_AddRow("period1");
    }
    for (let i = 0; i < accounting_period_2.length - 2; i++) {
        v_AddRow("period2");
    }
    // 填充数据
    let index = 0;
    $("[id^=period1_row], [id=period1_last]").each(function () {
        let tds = $(this).children();
        let subject = accounting_period_1[index]["subject"];
        let borrow_1 = accounting_period_1[index]["borrow_1"];
        let lend_1 = accounting_period_1[index]["lend_1"];
        let borrow_2 = accounting_period_1[index]["borrow_2"];
        let lend_2 = accounting_period_1[index]["lend_2"];
        let borrow_3 = accounting_period_1[index]["borrow_3"];
        let lend_3 = accounting_period_1[index]["lend_3"];
        if (subject !== "sum") {
            $(tds[0]).children().children().val(subject);
        }
        $(tds[1]).children().children().val(borrow_1);
        $(tds[2]).children().children().val(lend_1);
        $(tds[3]).children().children().val(borrow_2);
        $(tds[4]).children().children().val(lend_2);
        $(tds[5]).children().children().val(borrow_3);
        $(tds[6]).children().children().val(lend_3);
        index++;
    });
    index = 0;
    $("[id^=period2_row], [id=period2_last]").each(function () {
        let tds = $(this).children();
        let subject = accounting_period_2[index]["subject"];
        let borrow_1 = accounting_period_2[index]["borrow_1"];
        let lend_1 = accounting_period_2[index]["lend_1"];
        let borrow_2 = accounting_period_2[index]["borrow_2"];
        let lend_2 = accounting_period_2[index]["lend_2"];
        let borrow_3 = accounting_period_2[index]["borrow_3"];
        let lend_3 = accounting_period_2[index]["lend_3"];
        if (subject !== "sum") {
            $(tds[0]).children().children().val(subject);
        }
        $(tds[1]).children().children().val(borrow_1);
        $(tds[2]).children().children().val(lend_1);
        $(tds[3]).children().children().val(borrow_2);
        $(tds[4]).children().children().val(lend_2);
        $(tds[5]).children().children().val(borrow_3);
        $(tds[6]).children().children().val(lend_3);
        index++;
    });
}

// ==================================事件控制==================================//
let period1_row = 2;
let period2_row = 2;

/*
 * @ # coursev_2 -> 平衡表 ? 表格增加行
 */
function v_AddRow(period) {
    let period_row_id = "period1_row_" + period1_row;
    if (period === "period2") {
        period_row_id = "period2_row_" + period1_row;
        period2_row++;
    } else {
        period1_row++;
    }
    $("#" + period + "_last").before(
        "<tr id='" + period_row_id + "'>"
        + "<td><label><input name=\"subject\" title=\"科目\" onkeyup=\"illegalCharFilter(this)\"></label></td>" +
        "<td><label><input name=\"borrow_1\" title=\"金额￥\"" +
        "                                              onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input name=\"lend_1\" title=\"金额￥\"" +
        "                                              onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input name=\"borrow_2\" title=\"金额￥\"" +
        "                                              onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input name=\"lend_2\" title=\"金额￥\"" +
        "                                              onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input name=\"borrow_3\" title=\"金额￥\"" +
        "                                              onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input name=\"lend_3\" title=\"金额￥\"" +
        "                                              onkeyup=\"limit_number(this)\"></label></td>"
        + "<td style='padding: 0; border: 0'>"
        + "<div style='text-align: center'> "
        + "<a style='color: red' type='button' class='btn' onclick='v_DeleteRow(this)'><span class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div> "
        + "</td> "
        + "</tr>"
    );
}


/*
 * @ # coursev_2 -> 平衡表 ? 表格删除行
 */
function v_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}