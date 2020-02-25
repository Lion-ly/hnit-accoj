// 页面加载完成填充数据
$(document).ready(function () {
    get_subject_info(1);
});
//==================================提交会计科目信息==================================//
let now_business_no = 1;

/**
 * 分页标签li的激活状态控制
 */
function courseiii_li_control(business_no) {
    // 移除激活的li的.active
    $("li[id^=courseiii_split_li][class=active]").removeClass("active");
    let add_li_id = "courseiii_split_li_" + business_no;
    // 给当前li添加.active
    $("#" + add_li_id).addClass("active");
}

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function submit_subject() {
    show_submit_confirm("submit_subject_info()");
}

/**
 * 提交会计科目信息
 */
function submit_subject_info() {
    let business_no = now_business_no;
    let subject_infos = Array();
    let csrf_token = {"csrf_token": get_csrf_token()};
    let data = $.param(csrf_token);
    let right_box = $("#rightbox");
    let left_box = $("#leftbox");
    let right_input = right_box.children().children(":input");
    let left_input = left_box.children().children(":input");
    let is_up = true;
    for (let i = 0; i < right_input.length; i++) {
        let subject = $(right_input[i]).val();
        subject_infos.push({"subject": subject, "is_up": is_up});
    }
    is_up = false;
    for (let i = 0; i < left_input.length; i++) {
        let subject = $(left_input[i]).val();
        subject_infos.push({"subject": subject, "is_up": is_up});
    }
    // 需要将数组转换成JSON格式Flask才能正确解析
    subject_infos = JSON.stringify(subject_infos);
    subject_infos = {"subject_infos": subject_infos};
    data += "&" + $.param(subject_infos) + "&" + $.param({"business_no": business_no});
    $.ajax({
        url: "/submit_subject_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                show_message("submit_confirm_message", "提交成功", "info", 1000);
                get_subject_info(business_no);
            } else {
                show_message("submit_confirm_message", data["message"], "danger", 1000);
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
function get_subject_info(business_no) {
    now_business_no = parseInt(business_no);
    courseiii_li_control(business_no);
    let csrf_token = {"csrf_token": get_csrf_token()};
    let data = $.param(csrf_token);
    if (business_list) {
        // 若请求的业务编号已经获取过且确认提交过，则不再发送数据请求
        for (let i = 0; i < business_list.length; i++) {
            if (business_no === business_list[i]["business_no"] && business_list[i]["confirmed"] === true) {
                map_subject_info(business_no);
                return;
            }
        }
    }
    $.ajax({
        url: "/get_subject_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                business_list = data["business_list"];
                map_subject_info(business_no);
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
function map_subject_info(business_no) {
    business_no = parseInt(business_no);
    let business_index = -1;
    for (let i = 0; i < business_list.length; i++) {
        if (business_no === business_list[i]["business_no"]) {
            business_index = i;
            break;
        }
    }
    // 先清空box
    clear_box();
    if (business_index === -1) return;

    let content = business_list[business_index]["content"];
    let business_type = business_list[business_index]["business_type"];
    let confirmed = business_list[business_index]["confirmed"];
    let subject_infos = business_list[business_index]["subject_infos"];
    let em_no = business_index + 1;
    // 填充业务编号
    em_no = em_no < 10 ? "0" + em_no : em_no;
    $("#em_3").text(em_no);
    // 如果已确认过则添加已提交完成标签
    let subject_confirmed_span = $("#subject_confirmed_span");
    if (confirmed) {
        subject_confirmed_span.show();
    } else {
        subject_confirmed_span.hide();
    }

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

    // 填充业务内容
    $("#business_content_3").text(content);

    // 填充会计科目信息
    if (!subject_infos) return; // 没有信息则返回

    let rightbox_subject_array = Array();
    let leftbox_subject_array = Array();
    for (let i = 0; i < subject_infos.length; i++) {
        let subject = subject_infos[i]["subject"];
        let is_up = subject_infos[i]["is_up"];
        if(is_up){
            rightbox_subject_array.push(subject);
        }else{
            leftbox_subject_array.push(subject);
        }
    }
    input_moveTo_center("rightbox", rightbox_subject_array);
    input_moveTo_center("leftbox", leftbox_subject_array);
}

/**
 * 往box中添加会计科目
 * @param box rightbox or leftbox(string)
 * @param subject_array (string array)
 */
function input_moveTo_center(box, subject_array) {
    for (let i = 0; i < subject_array.length; i++) {
        let input_select = ":input[value=" + subject_array[i] + "]";
        let input_tmp = $("#centerbox").children().children(input_select);
        $(input_tmp).prop("checked", "checked");
    }
    if (box === "rightbox") {
        ctor();
    } else if (box === "leftbox") {
        ctol();
    }
}

/**
 * 清空两个box
 */
function clear_box() {
    let input_tmp = $("#leftbox, #rightbox").children().children(":input");
    for (let i = 0; i < input_tmp.length; i++) {
        $(input_tmp[i]).prop("checked", "checked");
    }
    ctol_cancel();
    ctor_cancel();
}