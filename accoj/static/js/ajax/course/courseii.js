//==================================提交会计要素信息==================================//
/**
 *
 */
let now_business_no = 1;

/**
 * 分页标签li的控制
 */
function courseii_li_control(business_no) {
    // 移除激活的li的.active
    $("li[id^=courseii_split_li][class=active]").removeClass("active");
    let add_li_id = "courseii_split_li_" + business_no;
    // 给当前li添加.active
    $("#" + add_li_id).addClass("active");
}

function submit_key_element_info() {
    let business_no = now_business_no;
    let key_element_infos = Array();
    let csrf_token = {"csrf_token": csrf_token};
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
            let key_elem_id = "key_elm" + i;
            let key_elem = $("#" + key_elem_id);
            let name = key_elem.attr("name");
            name = name.replace(/\+$|-$/, "");
            let value = parseFloat(key_elem.val());
            let is_up = name[name.length - 1] === "+";
            key_element_infos.push({"key_element": name, "money": value, "is_up": is_up});
        }
    }
    data += "&" + $.param(affect_type) + "&" + $.param(key_element_infos) + "&" + $.param({"business_no": business_no});
    $.ajax({
        url: "/submit_key_element_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                map_key_element_info(business_no);
                show_message("course_ii_message", "提交成功", "info", 1000);
            } else {
                show_message("course_ii_message", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    });
}

//==================================获取会计要素信息==================================//
/**
 *
 * @param business_no
 */
let key_element_infos_list; // 保存本次课程全部信息，减少后端数据请求次数，分页由前端完成
function get_key_element_info(business_no) {
    now_business_no = parseInt(business_no);
    courseii_li_control(business_no);
    let csrf_token = {"csrf_token": csrf_token};
    let data = $.param(csrf_token);
    // 若请求的业务编号已经获取过，则不再发送数据请求
    if (key_element_infos_list.length > parseInt(business_no)) {
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
                map_key_element_info(business_no);
                key_element_infos_list = data["key_element_infos_list"];
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
 *
 * @param business_no
 */
function map_key_element_info(business_no) {
    let key_element_num_dict = {"资产": 1, "负债": 3, "收入": 5, "费用": 7, "利润": 9, "所有者权益": 11};
    let affect_typ = key_element_infos_list[parseInt(business_no)]["affect_typ"];
    let key_element_infos = key_element_infos_list[parseInt(business_no)]["key_element_infos"];
    let affect_typ_id = "aer" + affect_typ;

    $("#" + affect_typ_id).prop("checked", true);

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