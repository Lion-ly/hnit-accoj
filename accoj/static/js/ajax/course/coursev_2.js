let balance_sheet_infos = "",
    balance_sheet_confirmed = "",
    balance_sheet_saved = "",
    period1_row = 2,
    period2_row = 2,
    answer_infos = "",
    scores = "";

$(document).ready(function () {
    function init() {
        v2Bind();
        get_balance_sheet_info(true);
    }

    init();
});

//==================================提交会计平衡表信息==================================//
/**
 * 提交会计平衡表信息
 * @param submit_type confirm or save
 */
function submit_balance_sheet_info(submit_type) {
    let data = v2GetInput();
    data["submit_type"] = submit_type;

    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_balance_sheet_info",
        messageDivID = "course_v_2_message",
        successFunc = get_balance_sheet_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);

}

//==================================获取会计平衡表信息==================================//
/**
 * 从后端获取会计平衡表信息
 */
function get_balance_sheet_info(isFromSubmit = false) {
    DisableButton(false);
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!balance_sheet_saved || balance_sheet_saved)
            //  若未保存，则不向后台请求数据
            return;
    }

    // 若已经确认提交过，则不再发送数据请求
    if (balance_sheet_confirmed) {
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
function map_balance_sheet_info(data, isFromButton) {
    // 先清空数据
    v2Reset();
    data = data ? data : "";
    balance_sheet_infos = data ? data["balance_sheet_infos"] : balance_sheet_infos;
    balance_sheet_confirmed = data ? data["balance_sheet_confirmed"] : balance_sheet_confirmed;
    balance_sheet_saved = data ? data["balance_sheet_saved"] : balance_sheet_saved;
    answer_infos = data ? data["answer_infos"] : answer_infos;
    scores = data ? data["scores"] : scores;

    if (!balance_sheet_infos) return;

    // 如果已保存过则显示标签为保存状态，已提交过则更改标签为已提交标签
    let confirmed = balance_sheet_confirmed,
        saved = balance_sheet_saved;
    if (confirmed) DisableButton(true);
    if (answer_infos) {
        showAnswerButton();
        confirmed = true;
        saved = true;
        isFromButton = 1;
        // $("button[data-answer]").text("查看答案");
    }
    // `完成状态`标签控制
    spanStatusCtr(confirmed, saved, "balance_sheet_submit_span");

    v2PaddingData(balance_sheet_infos, isFromButton);
}

// ===============================获取和填充数据===============================//
/**
 * 获取数据
 * @returns {Object}
 */
function v2GetInput() {
    let accounting_period_1 = Array(),
        accounting_period_2 = Array(),
        data;

    $("[id^=period1_row], [id=period1_last], [id^=period2_row], [id=period2_last]").each(function () {
        let $this = $(this),
            $thisInputs = $this.find("input"),
            subject = $this.attr("id").endsWith("last") ? "sum" : $($thisInputs[0]).val(),
            keys = ["borrow_1", "lend_1", "borrow_2", "lend_2", "borrow_3", "lend_3"],
            content = Object(),
            index = 0;
        content["subject"] = subject;
        $thisInputs.each(function (t_index, item) {
            if (subject !== "sum" || t_index != 0) {
                content[keys[index]] = $(item).val();
                if (t_index !== 0) index++;
            } else content[keys[index++]] = $(item).val();
        });

        if ($this.attr("id").startsWith("period1"))
            accounting_period_1.push(content);
        else accounting_period_2.push(content);
    });

    data = {
        "balance_sheet_infos": {"accounting_period_1": accounting_period_1, "accounting_period_2": accounting_period_2},
    };
    return data;
}

/**
 * 填充数据
 * @param data
 * @param isFromButton
 */
function v2PaddingData(data, isFromButton) {
    function padding() {
        let accounting_period_1 = data["accounting_period_1"],
            accounting_period_2 = data["accounting_period_2"];
        // 创建行
        for (let i = 0; i < accounting_period_1.length - 2; i++) v2_AddRow(true);
        for (let i = 0; i < accounting_period_2.length - 2; i++) v2_AddRow(false);

        // 填充数据
        let accounting_period = accounting_period_1,
            index = 0;
        $("[id^=period1_row], [id=period1_last], [id^=period2_row], [id=period2_last]").each(function () {
            let $this = $(this);
            if ($this.attr("id") === "period2_row_1") {
                accounting_period = accounting_period_2;
                index = 0;
            }
            let $thisInputs = $this.find("input"),
                keys = ["borrow_1", "lend_1", "borrow_2", "lend_2", "borrow_3", "lend_3"],
                subject = accounting_period[index]["subject"],
                inputIndex = 0;

            if (subject !== "sum") $($thisInputs[0]).val(subject);

            $thisInputs.each(function (t_index, item) {
                if (subject === "sum" && t_index === 0) {
                    $(item).val(accounting_period[index][keys[inputIndex++]]);
                } else if (t_index !== 0) $(item).val(accounting_period[index][keys[inputIndex++]]);
            });
            index++;
        });
    }

    if (!data) return;
    if (isFromButton) removeAllError();
    if (isFromButton) {
        let nowTotalScore = 40,
            totalScore = 40;
        showScoreEm(scores, nowTotalScore, totalScore);
        if (isFromButton === 2) v2Reset();
    }
    padding();
}

// ==================================事件控制==================================//
/**
 * 事件绑定
 */
function v2Bind() {
    function map_answer() {
        spanStatusCtr(true, true, "submit_status_span");
        v2PaddingData(answer_infos, 2);
    }
    bind_confirm_info("submit_balance_sheet_info");
    bind_save_info(submit_balance_sheet_info);
    bindAnswerSource("", map_balance_sheet_info, map_answer);
    bindIllegalCharFilter();
    bindRealNumber();
    $("a[data-v2-addRow-1]").click(function () {
        v2_AddRow(true);
    });
    $("a[data-v2-addRow-2]").click(function () {
        v2_AddRow(false);
    });
}

/**
 * 重置信息
 */
function v2Reset() {
    period1_row = 2;
    period2_row = 2;
    $("[id^=period1_row][id!=period1_row_1], [id^=period2_row][id!=period2_row_1]").remove();
    $("input").val("");
}

/*
 * @ # coursev_2 -> 平衡表 ? 表格增加行
 */
function v2_AddRow(flag) {
    let period = "period1",
        period_row_id = "period1_row_" + period1_row;
    if (!flag) {
        period = "period2";
        period_row_id = "period2_row_" + period1_row;
        period2_row++;
    } else {
        period1_row++;
    }
    $("#" + period + "_last").before(
        "<tr id='" + period_row_id + "'>"
        + "<td><label><input name='subject' title='科目' onkeyup='illegalCharFilter(this)'></label></td>" +
        "<td><label><input name='borrow_1' title='金额￥'" +
        "                                              onchange='RealNumber(this)' onfocus='removeError(this)'></label></td>" +
        "<td><label><input name='lend_1' title='金额￥'" +
        "                                              onchange='RealNumber(this)' onfocus='removeError(this)'></label></td>" +
        "<td><label><input name='borrow_2' title='金额￥'" +
        "                                              onchange='RealNumber(this)' onfocus='removeError(this)'></label></td>" +
        "<td><label><input name='lend_2' title='金额￥'" +
        "                                              onchange='RealNumber(this)' onfocus='removeError(this)'></label></td>" +
        "<td><label><input name='borrow_3' title='金额￥'" +
        "                                              onchange='RealNumber(this)' onfocus='removeError(this)'></label></td>" +
        "<td><label><input name='lend_3' title='金额￥'" +
        "                                              onchange='RealNumber(this)' onfocus='removeError(this)'></label></td>"
        + "<td class='acc-unborder'>"
        + "<div class='acc-minus'> "
        + "<a type='button' class='btn' onclick='v2_DeleteRow(this)' data-toggle='tooltip' data-placement='left' title='删除行'><span class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div> "
        + "</td> "
        + "</tr>"
    );
    $("#" + period_row_id).find("a[data-toggle]").tooltip();
}


/*
 * @ # coursev_2 -> 平衡表 ? 表格删除行
 */
function v2_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}