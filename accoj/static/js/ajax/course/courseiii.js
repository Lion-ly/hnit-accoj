// 页面加载完成填充数据
$(document).ready(function () {
    getBusinessList();
    get_subject_info(true);
});
//==================================提交会计科目信息==================================//
let now_business_no = 1;

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_subject() {
    bind_confirm_info("confirm_subject_button", "submit_subject_info");
}

/**
 * 保存科目信息
 */
function save_subject() {
    bind_save_info("save_subject_button", submit_subject_info);
}

/**
 * 提交会计科目信息
 * @param submit_type confirm or save
 */
function submit_subject_info(submit_type) {

    let data = iiiGetInput();
    data["submit_type"] = submit_type;

    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_subject_info",
        messageDivID = "course_iii_message",
        successFunc = get_subject_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);

}

//==================================获取会计要素信息==================================//
let subject_infos = Array(), // 保存本次课程全部信息，减少后端数据请求次数，分页由前端完成
    subject_confirmed = Array(),
    subject_saved = Array();

/**
 * 从后端获取会计要素信息
 */
function get_subject_info(isFromSubmit = false) {

    // 清空信息
    iiiResetInfo();
    if (now_business_no < 0 || now_business_no > 20) {
        return;
    }
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!subject_saved.length || subject_saved.indexOf(now_business_no - 1) === -1)
        //  若未保存，则不向后台请求数据
            return;
    }

    // 若请求的业务编号已经确认提交过，则不再发送数据请求
    if (subject_confirmed.length > 0 && subject_confirmed.indexOf(now_business_no - 1) !== -1) {
        map_subject_info();
        return;
    }

    // 获取数据
    let data = {},
        url = "/get_subject_info",
        successFunc = map_subject_info,
        messageDivID = "course_iii_message";
    get_info(data, url, successFunc, messageDivID);

}

/**
 * 将数据映射到前端
 * @param data
 */
function map_subject_info(data) {
    data = data ? data : "";
    subject_infos = data ? data["subject_infos"] : subject_infos;
    subject_confirmed = data ? data["subject_confirmed"] : subject_confirmed;
    subject_saved = data ? data["subject_saved"] : subject_saved;

    let business_index = now_business_no - 1,
        confirmed = subject_confirmed ? subject_confirmed.indexOf(business_index) !== -1 : false,
        saved = subject_saved ? subject_saved.indexOf(business_index) !== -1 : false;

    if (now_business_no < 0 || now_business_no > 20) return;

    // `完成状态`标签控制
    spanStatusCtr(confirmed, saved, "submit_status_span");

    // 如果已保存
    if (saved) iiiPaddingData(subject_infos[business_index]);
}

// ===============================获取和填充数据===============================//
/**
 * 获取数据
 * @returns {Object}
 */
function iiiGetInput() {
    let business_no = now_business_no,
        subject_infos = Array(),
        right_box = $("#plusbox"),
        left_box = $("#minusbox"),
        right_input = right_box.children().children(":input"),
        left_input = left_box.children().children(":input"),
        right_inputLen = right_input.length,
        left_inputLen = left_input.length,
        is_up = true,
        data;
    for (let i = 0; i < right_inputLen; i++) {
        let subject = $(right_input[i]).val();
        subject_infos.push({"subject": subject, "is_up": is_up});
    }
    is_up = false;
    for (let i = 0; i < left_inputLen; i++) {
        let subject = $(left_input[i]).val();
        subject_infos.push({"subject": subject, "is_up": is_up});
    }
    data = {"subject_infos": subject_infos, "business_no": business_no};
    return data;
}

/**
 * 填充数据
 * @param data
 */
function iiiPaddingData(data) {
    if (!data["subject_info"]) return;
    // 填充会计科目信息
    let subject_info = data["subject_info"],
        rightbox_subject_array = Array(),
        leftbox_subject_array = Array();
    for (let i = 0; i < subject_info.length; i++) {
        let subject = subject_info[i]["subject"],
            is_up = subject_info[i]["is_up"];
        if (is_up) {
            rightbox_subject_array.push(subject);
        } else {
            leftbox_subject_array.push(subject);
        }
    }
    input_moveTo_center("plusbox", rightbox_subject_array);
    input_moveTo_center("minusbox", leftbox_subject_array);
}

// ==================================事件控制==================================//

/**
 * 分页标签li的激活状态控制
 */
function courseiii_li_control(business_no) {
    now_business_no = courseLiCtrl(business_no, now_business_no);
    get_subject_info();
}

/**
 * 往box中添加会计科目
 * @param box plusbox or minusbox(string)
 * @param subject_array (string array)
 */
function input_moveTo_center(box, subject_array) {
    for (let i = 0; i < subject_array.length; i++) {
        let input_select = ":input[value=" + subject_array[i] + "]",
            input_tmp = $(input_select);
        $(input_tmp).prop("checked", true);
    }
    if (box === "plusbox") {
        all_to('plusbox');
    } else if (box === "minusbox") {
        all_to('minusbox');
    }
    let input_tmp = $("#minusbox, #plusbox").children().children(":input");
    for (let i = 0; i < input_tmp.length; i++) {
        $(input_tmp[i]).prop("checked", false);
    }
}

/**
 * 清空两个box
 */
function iiiResetInfo() {
    let input_tmp = $("#minusbox, #plusbox").children().children(":input"),
        input_tmpLen = input_tmp.length;
    for (let i = 0; i < input_tmpLen; i++) {
        $(input_tmp[i]).prop("checked", true);
    }
    to_all('plusbox');
    to_all('minusbox');
    for (let i = 0; i < input_tmpLen; i++) {
        $(input_tmp[i]).prop("checked", false);
    }
}

/**
 *  穿梭框
 */
function all_to(obj) {
    let $objbox = $('#' + obj),
        $allboxChecked = $('#allbox input:checked');
    for (let i = 0; i < $allboxChecked.length; i++) {
        $objbox.append(
            $($allboxChecked[i]).parent()
        );
    }
}

function to_all(obj) {
    let $objboxChecked = $('#' + obj + ' input:checked');
    for (let i = 0; i < $objboxChecked.length; i++) {
        let data_type = $($objboxChecked[i]).attr("data-type"),
            objbox = $('#' + data_type);
        objbox.append(
            $($objboxChecked[i]).parent()
        );
    }
}