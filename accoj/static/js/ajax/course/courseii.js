// 页面加载完成填充数据
$(document).ready(function () {
    getBusinessList();
    get_key_element_info(true);
});
//==================================提交会计要素信息==================================//
let now_business_no = 1;

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_key_element() {
    bind_confirm_info("confirm_key_element_button", "submit_key_element_info");
}

/**
 * 保存会计要素信息
 */
function save_key_element() {
    bind_save_info("save_key_element_button", submit_key_element_info);
}


/**
 * 提交会计要素信息
 * @param submit_type confirm or save
 */
function submit_key_element_info(submit_type) {

    let data = iiGetInput();
    data["submit_type"] = submit_type;
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_key_element_info",
        messageDivID = "course_ii_message",
        successFunc = get_key_element_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);

}

//==================================获取会计要素信息==================================//
let key_element_infos = Array(), // 保存本次课程全部信息，减少后端数据请求次数，分页由前端完成
    key_element_confirmed = Array(),
    key_element_saved = Array();

/**
 * 从后端获取会计要素信息
 */
function get_key_element_info(isFromSubmit = false) {

    // 清空信息
    iiResetInfo();

    if (now_business_no < 0 || now_business_no > 20) {
        return;
    }
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!key_element_saved.length || key_element_saved.indexOf(now_business_no - 1) === -1)
        //  若未保存，则不向后台请求数据
            return;
    }

    // 若请求的业务编号已经确认提交过，则不再发送数据请求
    if (key_element_confirmed.length > 0 && key_element_confirmed.indexOf(now_business_no - 1) !== -1) {
        map_key_element_info();
        return;
    }
    // 获取数据
    let data = {},
        url = "/get_key_element_info",
        successFunc = map_key_element_info,
        messageDivID = "course_ii_message";
    get_info(data, url, successFunc, messageDivID);

}

/**
 * 将数据映射到前端
 * @param data
 */
function map_key_element_info(data) {
    data = data ? data : "";
    key_element_infos = data ? data["key_element_infos"] : key_element_infos;
    key_element_confirmed = data ? data["key_element_confirmed"] : key_element_confirmed;
    key_element_saved = data ? data["key_element_saved"] : key_element_saved;

    let business_index = now_business_no - 1,
        confirmed = key_element_confirmed ? key_element_confirmed.indexOf(business_index) !== -1 : false,
        saved = key_element_saved ? key_element_saved.indexOf(business_index) !== -1 : false;

    // `完成状态`标签控制
    spanStatusCtr(confirmed, saved, "submit_status_span");

    // 如果已保存
    if (saved) iiPaddingData(key_element_infos[business_index]);
}


// ===============================获取和填充数据===============================//
/**
 * 获取数据
 * @returns {Object}
 */
function iiGetInput() {
    let business_no = now_business_no,
        key_element_infos = Array(),
        aers = $("input[id^=aer]"),
        aers_len = aers.length,
        check_box = $("input[id^=check]"),
        check_box_len = check_box.length,
        affect_type,
        data;

    // 获取对会计等式影响类型的选项
    for (let i = 0; i < aers_len; i++) {
        if ($(aers[i]).is(":checked")) {
            affect_type = $(aers[i]).val();
            break;
        }
    }
    affect_type = parseInt(affect_type);
    // 获取已勾选的要素选项
    for (let i = 0; i < check_box_len; i++) {
        if ($(check_box[i]).is(':checked')) {
            let key_elem_id = "key_elem" + (i + 1),
                key_elem = $("#" + key_elem_id),
                key_element = key_elem.attr("name"),
                is_up = key_element[0] === "+",
                money = parseFloat(key_elem.val());
            key_element = key_element.replace(/^\+|^-/, "");
            key_element_infos.push({"key_element": key_element, "money": money, "is_up": is_up});
        }
    }
    key_element_infos = {"affect_type": affect_type, "info": key_element_infos};

    data = {
        "key_element_infos": key_element_infos,
        "business_no": business_no,
    };
    return data;
}

/**
 * 填充数据
 * @param data
 */
function iiPaddingData(data) {
    if (!data) return;
    let affect_type = data["affect_type"],
        key_element_info = data["info"],
        key_element_num_dict = {"资产": 1, "负债": 3, "收入": 5, "费用": 7, "利润": 9, "所有者权益": 11},
        affect_type_id = "aer" + affect_type;
    // 填充影响类型
    $("#" + affect_type_id).prop("checked", true);
    // 填充会计要素信息
    for (let i = 0; i < key_element_info.length; i++) {
        let key_element = key_element_info[i]["key_element"],
            money = key_element_info[i]["money"],
            is_up = key_element_info[i]["is_up"],
            key_element_num = key_element_num_dict[key_element];
        if (!is_up) key_element_num = key_element_num_dict[key_element] + 1;
        let key_element_id = "key_elem" + key_element_num,
            check_id = "check" + key_element_num;
        $("#" + check_id).prop("checked", true);
        $("#" + key_element_id).val(money);
    }
}

// ==================================事件控制==================================//
/**
 * 分页标签li的激活状态控制
 */
function courseii_li_control(business_no) {
    now_business_no = courseLiCtrl(business_no, now_business_no);
    get_key_element_info();
}

/**
 * 清空会计要素信息
 */
function iiResetInfo() {
    $("[id^=key_elem]").val("");
    $("[id^=check]").prop("checked", false);
    $("#aer1").prop("checked", true);
}