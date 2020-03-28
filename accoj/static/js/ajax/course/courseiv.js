let entry_infos = Array(),
    entry_confirmed = Array(),
    entry_saved = Array();
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

    let data = ivGetInput();
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
    // 先清空信息
    ivResetInfo();
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text());
    if (nowBusinessNo < 0 || nowBusinessNo > 20) {
        return;
    }
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!entry_saved.length || entry_saved.indexOf(nowBusinessNo - 1) === -1)
            //  若未保存，则不向后台请求数据
            return;
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
 */
function map_entry_info(data) {
    data = data ? data : "";
    entry_infos = data ? data["entry_infos"] : entry_infos;
    entry_confirmed = data ? data["entry_confirmed"] : entry_confirmed;
    entry_saved = data ? data["entry_saved"] : entry_saved;

    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        business_index = nowBusinessNo - 1,
        confirmed = entry_confirmed ? entry_confirmed.indexOf(business_index) !== -1 : false,
        saved = entry_saved ? entry_saved.indexOf(business_index) !== -1 : false;

    // `完成状态`标签控制
    spanStatusCtr(confirmed, saved, "submit_status_span");

    // 如果已保存
    if (saved) ivPaddingData(entry_infos[business_index]);
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
        entry_infos.push({"subject": subject, "money": money, "is_dr": is_dr});
    }
    is_dr = false;
    for (let i = 0; i < drSubjectsLen; i++) {
        let subject = $(drSubjects[i]).val();
        let money = $(drMoneys[i]).val();
        entry_infos.push({"subject": subject, "money": money, "is_dr": is_dr});
    }
    data = {"entry_infos": entry_infos, "business_no": business_no};
    return data;
}

/**
 * 填充数据
 * @param data
 */
function ivPaddingData(data) {
    if (!data["entry_info"]) return;

    let entry_info = data["entry_info"],
        borrow_first = true,    // 借记第一行标记
        loan_first = true;      // 贷记第一行标记
    for (let i = 0; i < entry_info.length; i++) {
        let subject = entry_info[i]["subject"],
            money = entry_info[i]["money"],
            is_dr = entry_info[i]["is_dr"];
        if (is_dr) {
            // 若果是借记
            if (borrow_first) {
                // 借记第一行
                $("#subject1").val(subject);
                $("#money1").val(money);
                borrow_first = false;
                continue;
            }
            iv_AddRow("borrow", subject, money)
        } else {
            if (loan_first) {
                // 贷记第一行
                $("#subject0").val(subject);
                $("#money0").val(money);
                loan_first = false;
                continue;
            }
            iv_AddRow("loan", subject, money)
        }
    }
}

// ==================================事件控制==================================//
/**
 * 事件绑定
 */
function ivBind() {
    bind_confirm_info("submit_entry_info");
    bind_save_info(submit_entry_info);
    bindAnswerSource();
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
 * 重置分录信息
 */
function ivResetInfo() {
    // 清空第一栏借贷信息
    $("#subject1").val("");
    $("#subject0").val("");
    $("#money1").val("");
    $("#money0").val("");
    // 移除其他行
    let removeRows = $("[id^=subject1_], [id^=subject0_]"),
        removeRowsLen = removeRows.length;
    if (!removeRowsLen) return;
    for (let i = 0; i < removeRowsLen; i++) {
        $(removeRows[i]).parent().parent().remove();
    }
    $("#submit_status_span").hide();
}

/*
 * @ # courseiv ? 表格增加行
 */
let rowNumIv = 1;

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
