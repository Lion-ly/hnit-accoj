// 页面加载完成填充数据
$(document).ready(function () {
    get_key_element_info(1);
});
//==================================提交会计要素信息==================================//
let now_business_no = 1;

/**
 * 分页标签li的激活状态控制
 */
function courseii_li_control(business_no) {
    // 移除激活的li的.active
    $("li[id^=courseii_split_li][class=active]").removeClass("active");
    let add_li_id = "courseii_split_li_" + business_no;
    // 给当前li添加.active
    $("#" + add_li_id).addClass("active");
}

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_key_element() {
    show_submit_confirm("submit_key_element_info('confirm')");
    let confirm_key_element_button = $("#confirm_key_element_button");
    confirm_key_element_button.attr("disabled", true);
    confirm_key_element_button.text("提交 2s");
    setTimeout(function () {
        confirm_key_element_button.text("提交 1s");
    }, 1000);
    setTimeout(function () {
        confirm_key_element_button.attr("disabled", false);
    }, 2000);
}

/**
 * 保存会计要素信息
 */
function save_key_element() {
    submit_key_element_info("save");
    let save_key_element_button = $("#save_key_element_button");
    save_key_element_button.attr("disabled", true);
    save_key_element_button.text("保存 2s");
    setTimeout(function () {
        save_key_element_button.text("保存 1s");
    }, 1000);
    setTimeout(function () {
        save_key_element_button.attr("disabled", false);
        save_key_element_button.text("保存");
        confirm_entry_button.text("提交");
    }, 2000);
}


/**
 * 提交会计要素信息
 * @param submit_type confirm or save
 */
function submit_key_element_info(submit_type) {
    let type_flag = null;
    if (submit_type === "confirm") {
        type_flag = true;
    } else if (submit_type === "save") {
        type_flag = false;
    } else {
        return;
    }
    let business_no = now_business_no;
    let key_element_infos = Array();
    let csrf_token = {"csrf_token": get_csrf_token()};
    let data = $.param(csrf_token);
    let aers = $("input[id^=aer]");
    let aers_len = aers.length;
    let check_box = $("input[id^=check]");
    let check_box_len = check_box.length;
    let affect_type;
    // 获取对会计等式影响类型的选项
    for (let i = 0; i < aers_len; i++) {
        if ($(aers[i]).is(":checked")) {
            affect_type = $(aers[i]).val();
            break;
        }
    }
    affect_type = {"affect_type": parseFloat(affect_type)};
    // 获取已勾选的要素选项
    for (let i = 0; i < check_box_len; i++) {
        if ($(check_box[i]).is(':checked')) {
            let key_elem_id = "key_elem" + (i + 1);
            let key_elem = $("#" + key_elem_id);
            let key_element = key_elem.attr("name");
            let is_up = key_element[0] === "+";
            key_element = key_element.replace(/^\+|^-/, "");
            let money = parseFloat(key_elem.val());
            key_element_infos.push({"key_element": key_element, "money": money, "is_up": is_up});
        }
    }
    // 需要将数组转换成JSON格式Flask才能正确解析
    key_element_infos = JSON.stringify(key_element_infos);
    key_element_infos = {"key_element_infos": key_element_infos};
    data += "&" + $.param(affect_type) + "&" + $.param(key_element_infos) + "&" + $.param({"business_no": business_no})
        + "&" + $.param({"submit_type": submit_type});
    $.ajax({
        url: "/submit_key_element_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                if (type_flag === true) {
                    show_message("submit_confirm_message", "提交成功！", "info", 1000);
                } else if (type_flag === false) {
                    show_message("course_ii_message", "保存成功！", "info", 1000);
                }
                get_key_element_info(business_no);
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

//==================================获取会计要素信息==================================//
let business_list; // 保存本次课程全部信息，减少后端数据请求次数，分页由前端完成
/**
 * 从后端获取会计要素信息
 * @param business_no
 */
function get_key_element_info(business_no) {
    now_business_no = parseInt(business_no);
    if (now_business_no < 0 || now_business_no > 20) {
        return;
    }
    courseii_li_control(business_no);
    let csrf_token = {"csrf_token": get_csrf_token()};
    let data = $.param(csrf_token);
    // 若business_list不为空且请求的业务编号已经确认提交过，则不再发送数据请求
    if (business_list && business_list[now_business_no - 1]["confirmed"] === true) {
        map_key_element_info(business_no);
        return;
    }
    $.ajax({
        url: "/get_key_element_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                business_list = data["business_list"];
                map_key_element_info(business_no);
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
 * @param business_no
 */
function map_key_element_info(business_no) {
    let key_element_num_dict = {"资产": 1, "负债": 3, "收入": 5, "费用": 7, "利润": 9, "所有者权益": 11};
    business_no = parseInt(business_no);
    let business_index = business_no - 1;
    let affect_type = business_list[business_index]["affect_type"];
    let content = business_list[business_index]["content"];
    let business_type = business_list[business_index]["business_type"];
    let confirmed = business_list[business_index]["confirmed"];
    let saved = business_list[business_index]["saved"];
    let key_element_infos = business_list[business_index]["key_element_infos"];
    let affect_type_id = "aer" + affect_type;
    let em_no = business_index + 1;
    // 填充业务编号
    em_no = em_no < 10 ? "0" + em_no : em_no;
    $("#em_2").text(em_no);
    // 如果已保存过则显示标签为保存状态，已提交过则更改标签为已提交标签
    let key_element_submit_span = $("#key_element_submit_span");
    if (confirmed || saved) {
        // 初始化为saved
        let span_text = "已保存";
        let span_color = "#5bc0de";
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
    // 填充影响类型
    $("#" + affect_type_id).prop("checked", true);
    // 填充会计要素信息
    if (!key_element_infos || !key_element_infos.length) {
        // 要素信息为空，输入内容恢复初始状态
        $("[id^=key_elem]").val("");
        $("[id^=check]").prop("checked", false);
        $("#aer1").prop("checked", true);
        return;
    }
    key_element_infos = JSON.parse(key_element_infos); // 因为key_element_infos是JSON数组，所以需要解析
    for (let i = 0; i < key_element_infos.length; i++) {
        let key_element = key_element_infos[i]["key_element"];
        let money = key_element_infos[i]["money"];
        let is_up = key_element_infos[i]["is_up"];
        let key_element_num = key_element_num_dict[key_element];
        if (!is_up) key_element_num = key_element_num_dict[key_element] + 1;
        let key_element_id = "key_elem" + key_element_num;
        let check_id = "check" + key_element_num;
        $("#" + check_id).prop("checked", true);
        $("#" + key_element_id).val(money);
    }
}