// 页面加载完成填充数据
$(document).ready(function () {
    get_subject_info(1);
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

    let business_no = now_business_no,
        subject_infos = Array(),
        right_box = $("#plusbox"),
        left_box = $("#minusbox"),
        right_input = right_box.children().children(":input"),
        left_input = left_box.children().children(":input"),
        right_inputLen = right_input.length,
        left_inputLen = left_input.length,
        is_up = true;
    for (let i = 0; i < right_inputLen; i++) {
        let subject = $(right_input[i]).val();
        subject_infos.push({"subject": subject, "is_up": is_up});
    }
    is_up = false;
    for (let i = 0; i < left_inputLen; i++) {
        let subject = $(left_input[i]).val();
        subject_infos.push({"subject": subject, "is_up": is_up});
    }
    let data = {"subject_infos": subject_infos, "business_no": business_no, "submit_type": submit_type};
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_subject_info",
        messageDivID = "course_iii_message",
        successFunc = get_subject_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);

}

//==================================获取会计要素信息==================================//
let business_list; // 保存本次课程全部信息，减少后端数据请求次数，分页由前端完成
/**
 * 从后端获取会计要素信息
 */
function get_subject_info() {

    if (now_business_no < 0 || now_business_no > 20) {
        return;
    }
    // 若business_list不为空且请求的业务编号已经确认提交过，则不再发送数据请求
    if (business_list && business_list[now_business_no - 1]["confirmed"] === true) {
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
    business_list = data ? data["business_list"] : business_list;

    let business_index = now_business_no - 1;

    // 先清空box
    clear_box();
    if (business_index === -1) return;

    let content = business_list[business_index]["content"],
        business_type = business_list[business_index]["business_type"],
        confirmed = business_list[business_index]["confirmed"],
        saved = business_list[business_index]["saved"],
        subject_infos = business_list[business_index]["subject_infos"],
        em_no = business_index + 1;
    // 填充业务编号
    em_no = em_no < 10 ? "0" + em_no : em_no;
    $("#em_3").text(em_no);
    // 填充活动类型
    let business_type_3 = $("#business_type_3");
    business_type_3.removeClass();
    let business_type_class = "label label-" + "success"; //  初始化为筹资活动
    if (business_type === "投资活动") {
        business_type_class = "label label-" + "info";
    } else if (business_type === "经营活动") {
        business_type_class = "label label-" + "warning";
    }
    business_type_3.addClass(business_type_class);
    business_type_3.text(business_type);

    // 如果已保存过则显示标签为保存状态，已提交过则更改标签为已提交标签
    let subject_submit_span = $("#subject_submit_span");
    if (confirmed || saved) {
        // 初始化为saved
        let span_text = "已保存",
            span_color = "#5bc0de";
        if (confirmed) {
            span_text = "已完成";
            span_color = "#5cb85c";
        }
        subject_submit_span.css("color", span_color);
        subject_submit_span.text(span_text);
        subject_submit_span.show();
    } else {
        subject_submit_span.hide();
    }
    // 填充业务内容
    $("#business_content_3").text(content);

    // 填充会计科目信息
    if (!subject_infos || !subject_infos.length) {
        // 科目信息为空则返回
        return;
    }
    let rightbox_subject_array = Array();
    let leftbox_subject_array = Array();
    for (let i = 0; i < subject_infos.length; i++) {
        let subject = subject_infos[i]["subject"],
            is_up = subject_infos[i]["is_up"];
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
    // 移除激活的li的.active
    $("li[id^=courseiii_split_li][class=active]").removeClass("active");
    let add_li_id = "courseiii_split_li_" + business_no;
    // 给当前li添加.active
    $("#" + add_li_id).addClass("active");
    now_business_no = business_no;
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
function clear_box() {
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