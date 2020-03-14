// 页面加载完成填充数据
$(document).ready(function () {
    getBusinessList();
    get_entry_info();
});
//==================================提交会计分录信息==================================//
let now_business_no = 1;

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_entry() {
    bind_confirm_info("confirm_entry_button", "submit_entry_info");
}

/**
 * 保存分录信息
 */
function save_entry() {
    bind_save_info("save_entry_button", submit_entry_info);
}

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
let entry_infos = Array(); // 保存本次课程全部信息，减少后端数据请求次数，分页由前端完成
/**
 * 从后端获取会计分录信息
 */
function get_entry_info() {
    if (now_business_no < 0 || now_business_no > 20) {
        return;
    }
    // 若entry_infos不为空且请求的业务编号已经确认提交过，则不再发送数据请求
    if (entry_infos.length > 0 && entry_infos[now_business_no - 1]["confirmed"]) {
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

    let business_index = now_business_no - 1;
    // 先重置分录信息
    clear_entry();

    let confirmed = entry_infos[business_index]["confirmed"],
        saved = entry_infos[business_index]["saved"];

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
    let business_no = now_business_no,
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
 * 分页标签li的激活状态控制
 */
function courseiv_li_control(business_no) {
    now_business_no = parseInt(business_no);
    businessLiControl(business_no);
    get_entry_info();
}

/**
 * 重置分录信息
 */
function clear_entry() {
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
}

/*
 * @ # courseiv ? 表格增加行
 */
let rowNumIv = 1;

function iv_AddRow(obj, subject = "", money = "") {
    let type = "0";
    if (obj === "borrow") {
        type = "1";
    }
    $("#" + obj + "RowAfter").before(
        "<tr>"
        + "<td class='acc-unedit' style='border-right: 0;padding: 4px'></td>"
        + "<td class='acc-unedit' style='border-left: 0;4px'></td>"
        + "<td><input type='text' id='subject" + type + "_" + rowNumIv + "' name='subject' placeholder='科目' value='" + subject + "' onkeyup='illegalCharFilter(this)'></td>"
        + "<td><input type='text' id='money" + type + "_" + rowNumIv + "' name='money' placeholder='金额' value='" + money + "' onkeyup='illegalCharFilter(this)'></td>"
        + "<td style='padding:4px;border:0'>"
        + "<div style='text-align: center'>"
        + "<a style='color: red;padding: 0' type='button' class='btn' onclick='iv_DeleteRow(this)'><span class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>"
        + "</td>"
        + "</tr>"
    );
    rowNumIv += 1;
}


/*
 * @ # courseiv ? 表格删除行
 */
function iv_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
    rowNumIv -= 1;
}
