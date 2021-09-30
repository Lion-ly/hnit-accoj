let entry_infos = Array(),
    entry_confirmed = Array(),
    entry_saved = Array(),
    permission = Array(),
    answer_infos = "",
    scores = "",
    rowNumIv = 1;
$(document).ready(function () {
    function init() {
        ivBind();
        getBusinessList();
        get_entry_info(true);
    }

    init();
});

//==================================提交会计分录信息==================================//
/**
 * 提交会计分录信息
 * @param submit_type confirm or save
 */
function submit_entry_info(submit_type) {


    let data = {};
    //提交保存数据
    if (submit_type == 'save') {
        data = ivGetInput();
        data["submit_type"] = submit_type;

    }
    //提交提交数据
    if (submit_type == 'confirm') {
        data["entry_infos"] = entry_infos;
        data["submit_type"] = submit_type;

    }
    console.log(data);


    data["submit_type"] = submit_type;
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_entry_info",
        messageDivID = "course_iv_message",
        successFunc = get_entry_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);

}

//==================================获取会计分录信息==================================//
/**
 * 从后端获取会计分录信息
 */
function get_entry_info(isFromSubmit = false) {
    DisableButton(false);
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text());
    if (nowBusinessNo < 0 || nowBusinessNo > 20) return;
    if (nowBusinessNo == 20) {
        $("button[data-confirm]").show();
    } else {
        $("button[data-confirm]").hide();
    }
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!entry_saved.length || entry_saved.indexOf(nowBusinessNo - 1) === -1) {
            //  若未保存，则不向后台请求数据
            ivResetInfo();
            return;
        }
    }

    // 若请求的业务编号已经确认提交过，则不再发送数据请求
    if (entry_confirmed.length > 0 && entry_confirmed.indexOf(nowBusinessNo - 1) !== -1) {
        map_entry_info();
        return;
    }

    // 获取数据
    let data = {},
        url = "/get_entry_info",
        successFunc = map_entry_info,
        messageDivID = "course_iv_message";
    get_info(data, url, successFunc, messageDivID);

}

/**
 * 将数据映射到前端
 * @param data
 * @param isFromButton
 */
function map_entry_info(data, isFromButton) {
    ivResetInfo();
    data = data ? data : "";
    entry_infos = data ? data["entry_infos"] : entry_infos;
    entry_confirmed = data ? data["entry_confirmed"] : entry_confirmed;
    entry_saved = data ? data["entry_saved"] : entry_saved;
    answer_infos = data ? data["answer_infos"] : answer_infos;
    scores = data ? data["scores"] : scores;
    permission = data ? data["permission"] : permission;

    //填充团队题目
    $("#selfQuestion").html('' + permission.map((cur) => {
        return cur + 1
    }).sort((a, b) => {
        return a - b
    }).join(","));

    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        business_index = nowBusinessNo - 1,
        confirmed = entry_confirmed ? entry_confirmed.indexOf(business_index) !== -1 : false,
        saved = entry_saved ? entry_saved.indexOf(business_index) !== -1 : false;
    if (confirmed) DisableButton(true);
    if (answer_infos) {
        showAnswerButton();
        confirmed = true;
        saved = true;
        isFromButton = 1;
        $("button[data-answer]").text("查看答案");
    }
    // `完成状态`标签控制
    spanStatusCtr(confirmed, saved, "submit_status_span");

    // 如果已保存
    if (saved) ivPaddingData(entry_infos, isFromButton);
}

// ===============================获取和填充数据===============================//
/**
 * 获取数据
 * @returns {Object}
 */
function ivGetInput() {
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        business_no = nowBusinessNo,
        entry_infos = Array(),
        crSubjects = $("[id^=subject1]"),    // 借记科目input列表
        drSubjects = $("[id^=subject0]"),    // 贷记科目input列表
        crMoneys = $("[id^=money1]"),        // 借记金额input列表
        drMoneys = $("[id^=money0]"),        // 贷记金额input列表
        crSubjectsLen = crSubjects.length,
        drSubjectsLen = drSubjects.length,
        is_dr = true,   // 是否借记
        data;
    for (let i = 0; i < crSubjectsLen; i++) {
        let subject = $(crSubjects[i]).val();
        let money = $(crMoneys[i]).val();
        money = parseFloat(money);
        entry_infos.push({"subject": subject, "money": money, "is_dr": is_dr});
    }
    is_dr = false;
    for (let i = 0; i < drSubjectsLen; i++) {
        let subject = $(drSubjects[i]).val();
        let money = $(drMoneys[i]).val();
        money = parseFloat(money);
        entry_infos.push({"subject": subject, "money": money, "is_dr": is_dr});
    }
    data = {"entry_infos": entry_infos, "business_no": business_no};
    return data;
}

/**
 * 填充数据
 * @param data
 * @param isFromButton
 */
function ivPaddingData(data, isFromButton) {
    function padding() {
        function push_err_pos(sub, fl, isDR) {
            isDR = isDR ? 1 : 0;
            if (fl === 0 || !sub) return;
            let $subject = $("input[value=" + sub + "][id$=" + isDR + "]"),
                $money = $subject.parent().parent().next().find("input");
            if (!$subject.length || !$money.length) return;
            if (fl) error_pos.push($money);
            else error_pos.push($money, $subject);
        }

        let entry_info = data,
            borrow_first = true,    // 借记第一行标记
            loan_first = true,      // 贷记第一行标记
            error_pos = Array(),
            flag = false;
        t_infoLen = isFromButton === 1 ? answer_info.length : t_infoLen;

        for (let i = 0; i < entry_info.length; i++) {
            let subject = entry_info[i]["subject"],
                money = entry_info[i]["money"],
                is_dr = entry_info[i]["is_dr"];
            if (is_dr) {
                // 若果是借记
                if (borrow_first) {
                    // 借记第一行
                    $("#subject1").attr("value", subject);
                    $("#subject1").val(subject);
                    $("#money1").attr("value", money);
                    $("#money1").val(money);
                    borrow_first = false;
                } else iv_AddRow(true, subject, money)
            } else {
                if (loan_first) {
                    // 贷记第一行
                    $("#subject0").attr("value", subject);
                    $("#subject0").val(subject);
                    $("#money0").attr("value", money);
                    $("#money0").val(money);
                    loan_first = false;
                } else iv_AddRow(false, subject, money)
            }
            if (isFromButton === 1) {
                flag = false;
                for (let i = 0; i < t_infoLen; i++) {
                    let t_subject = answer_info[i]["subject"],
                        t_is_dr = answer_info[i]["is_dr"],
                        t_money = answer_info[i]["money"];
                    if (subject === t_subject && is_dr === t_is_dr) {
                        flag = t_money == money;
                        flag = flag ? 0 : 1;
                        break;
                    }
                }
                push_err_pos(subject, flag, is_dr);
            }
        }
        if (isFromButton) ivDisabledInput();
        if (isFromButton === 1) for (let i = 0; i < error_pos.length; i++) hasError(error_pos[i]);
    }

    if (!data) return;
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        index = nowBusinessNo - 1, t_infoLen = 0, answer_info = "";
    if (isFromButton) {
        removeAllError();
        let nowScore = scores[index * 2],
            nowTotalScore = scores[index * 2 + 1],
            totalScore = scores[scores.length - 1];
        showScoreEm(nowScore, nowTotalScore, totalScore);
        if (isFromButton === 1) answer_info = answer_infos[index];
        if (isFromButton === 2) ivResetInfo();
    }
    data = data[index];
    padding();
}

// ==================================事件控制==================================//
/**
 * 事件绑定
 */
function ivBind() {
    function map_answer() {
        spanStatusCtr(true, true, "submit_status_span");
        ivPaddingData(answer_infos, 2);
    }

    bind_confirm_info("submit_entry_info");
    bind_save_info(submit_entry_info);
    bindAnswerSource("", map_entry_info, map_answer);
    bindIllegalCharFilter();
    bindRealNumber();
    $("a[data-iv-addRow-1]").click(function () {
        iv_AddRow(true);
    });
    $("a[data-iv-addRow-2]").click(function () {
        iv_AddRow(false);
    });
    pageSplitBind(function (business_no) {
        businessLiControl(business_no);
        get_entry_info();
    }, 20);
}

/**
 * 重置信息
 */
function ivResetInfo() {
    if (!answer_infos) $("#submit_status_span").hide();
    rowNumIv = 1;
    // 清空第一栏借贷信息
    $("#subject1").val("");
    $("#subject0").val("");
    $("#money1").val("");
    $("#money0").val("");
    // 移除其他行
    let removeRows = $("[id^=subject1_], [id^=subject0_]"),
        removeRowsLen = removeRows.length;
    if (!removeRowsLen) return;
    for (let i = 0; i < removeRowsLen; i++)
        $(removeRows[i]).parent().parent().remove();
}

/*
 * @ # courseiv ? 表格增加行
 */
function iv_AddRow(flag, subject = "", money = "") {
    let type = "0",
        anchorName = "loanRowAfter";
    if (flag) {
        type = "1";
        anchorName = "borrowRowAfter";
    }
    $("#" + anchorName).before(
        "<tr class='acc-table-format-4-1'>"
        + "<td class='acc-unedit'></td>"
        + "<td class='acc-unedit'></td>"
        + "<td><input type='text' id='subject" + type + "_" + rowNumIv + "' name='subject' placeholder='科目' value='" + subject + "' onkeyup='illegalCharFilter(this)'></td>"
        + "<td><input type='text' id='money" + type + "_" + rowNumIv + "' name='money' placeholder='0.0' value='" + money + "' onchange='RealNumber(this)' onfocus='removeError(this)'></td>"
        + "<td>"
        + "<div class='acc-minus'>"
        + "<a type='button' class='btn' onclick='iv_DeleteRow(this)' data-toggle='tooltip' data-placement='left' title='删除行'><span class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>"
        + "</td>"
        + "</tr>"
    );
    let $delete = $("#" + "money" + type + "_" + rowNumIv).parent().next().find("a");
    $delete.tooltip();
    rowNumIv += 1;
}


/*
 * @ # courseiv ? 表格删除行
 */
function iv_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
    rowNumIv -= 1;
}

/**
 * 禁用编辑
 */
function ivDisabledInput() {
    let $inputs = $("input[id^=subject], input[id^=money]"),
        $aLabels = $("a[type=button][data-toggle]"),
        $button = $("button[data-save], button[data-confirm]");
    $button.prop("disabled", true);
    $inputs.attr("readonly", "readonly");
    $aLabels.attr({"disabled": true, "onclick": ""});
    $aLabels.unbind("click");
}
