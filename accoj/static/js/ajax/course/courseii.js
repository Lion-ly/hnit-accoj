// 页面加载完成填充数据
$(document).ready(function () {
    get_key_element_info(1);
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

    let business_no = now_business_no,
        key_element_infos = Array(),
        aers = $("input[id^=aer]"),
        aers_len = aers.length,
        check_box = $("input[id^=check]"),
        check_box_len = check_box.length,
        affect_type;
    // 获取对会计等式影响类型的选项
    for (let i = 0; i < aers_len; i++) {
        if ($(aers[i]).is(":checked")) {
            affect_type = $(aers[i]).val();
            break;
        }
    }
    affect_type = parseFloat(affect_type);
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

    let data = {
        "affect_type": affect_type,
        "key_element_infos": key_element_infos,
        "business_no": business_no,
        "submit_type": submit_type
    };
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_key_element_info",
        messageDivID = "course_ii_message",
        successFunc = get_key_element_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);

}

//==================================获取会计要素信息==================================//
let business_list; // 保存本次课程全部信息，减少后端数据请求次数，分页由前端完成
/**
 * 从后端获取会计要素信息
 */
function get_key_element_info() {

    if (now_business_no < 0 || now_business_no > 20) {
        return;
    }
    // 若business_list不为空且请求的业务编号已经确认提交过，则不再发送数据请求
    if (business_list && business_list[now_business_no - 1]["confirmed"] === true) {
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
    business_list = data ? data["business_list"] : business_list;

    let key_element_num_dict = {"资产": 1, "负债": 3, "收入": 5, "费用": 7, "利润": 9, "所有者权益": 11},
        business_index = now_business_no - 1,
        affect_type = business_list[business_index]["affect_type"],
        content = business_list[business_index]["content"],
        business_type = business_list[business_index]["business_type"],
        confirmed = business_list[business_index]["confirmed"],
        saved = business_list[business_index]["saved"],
        key_element_infos = business_list[business_index]["key_element_infos"],
        affect_type_id = "aer" + affect_type,
        em_no = business_index + 1;
    // 填充业务编号
    em_no = em_no < 10 ? "0" + em_no : em_no;
    $("#em_2").text(em_no);
    // 如果已保存过则显示标签为保存状态，已提交过则更改标签为已提交标签
    let key_element_submit_span = $("#key_element_submit_span");
    if (confirmed || saved) {
        // 初始化为saved
        let span_text = "已保存",
            span_color = "#5bc0de";
        if (confirmed) {
            span_text = "已完成";
            span_color = "#5cb85c";
        }
        key_element_submit_span.css("color", span_color);
        key_element_submit_span.text(span_text);
        key_element_submit_span.show();
    } else {
        key_element_submit_span.hide();
    }
    // 填充类型
    let business_type_2 = $("#business_type_2");
    business_type_2.removeClass();
    let business_type_class = "label label-" + "success"; //  初始化为筹资活动
    if (business_type === "投资活动") {
        business_type_class = "label label-" + "info";
    } else if (business_type === "经营活动") {
        business_type_class = "label label-" + "warning";
    }
    business_type_2.addClass(business_type_class);
    business_type_2.text(business_type);
    // 填充业务内容
    $("#business_content_2").text(content);
    // 先清空会计要素信息
    $("[id^=key_elem]").val("");
    $("[id^=check]").prop("checked", false);
    $("#aer1").prop("checked", true);
    if (!key_element_infos || !key_element_infos.length) {
        // 要素信息为空
        return;
    }
    // 填充影响类型
    $("#" + affect_type_id).prop("checked", true);
    // 填充会计要素信息
    for (let i = 0; i < key_element_infos.length; i++) {
        let key_element = key_element_infos[i]["key_element"],
            money = key_element_infos[i]["money"],
            is_up = key_element_infos[i]["is_up"],
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
    // 移除激活的li的.active
    $("li[id^=courseii_split_li][class=active]").removeClass("active");
    let add_li_id = "courseii_split_li_" + business_no;
    // 给当前li添加.active
    $("#" + add_li_id).addClass("active");
    now_business_no = business_no;
    get_key_element_info();
}