// 页面加载完成填充数据
$(document).ready(function () {
    get_entry_info(1);
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

    let business_no = now_business_no,
        entry_infos = Array(),
        crSubjects = $("[id^=subject1]"),    // 借记科目input列表
        drSubjects = $("[id^=subject0]"),    // 贷记科目input列表
        crMoneys = $("[id^=money1]"),        // 借记金额input列表
        drMoneys = $("[id^=money0]"),        // 贷记金额input列表
        crSubjectsLen = crSubjects.length,
        drSubjectsLen = drSubjects.length,
        is_dr = true;   // 是否借记
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
    let data = {"entry_infos":entry_infos, "business_no": business_no, "submit_type": submit_type};
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_entry_info",
        messageDivID = "course_iv_message",
        successFunc = get_entry_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);

}

//==================================获取会计分录信息==================================//
let business_list; // 保存本次课程全部信息，减少后端数据请求次数，分页由前端完成
/**
 * 从后端获取会计分录信息
 */
function get_entry_info() {
    if (now_business_no < 0 || now_business_no > 20) {
        return;
    }
    // 若business_list不为空且请求的业务编号已经确认提交过，则不再发送数据请求
    if (business_list && business_list[now_business_no - 1]["confirmed"] === true) {
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
    business_list = data ? data["business_list"] : business_list;

    let business_index = now_business_no - 1;
    // 先重置分录信息
    clear_entry();

    let content = business_list[business_index]["content"],
        business_type = business_list[business_index]["business_type"],
        confirmed = business_list[business_index]["confirmed"],
        saved = business_list[business_index]["saved"],
        entry_infos = business_list[business_index]["entry_infos"],
        em_no = business_index + 1;
    // 填充业务编号
    em_no = em_no < 10 ? "0" + em_no : em_no;
    $("#em_4").text(em_no);
    // 填充活动类型
    let business_type_4 = $("#business_type_4");
    business_type_4.removeClass();
    let business_type_class = "label label-" + "success"; //  初始化为筹资活动
    if (business_type === "投资活动") {
        business_type_class = "label label-" + "info";
    } else if (business_type === "经营活动") {
        business_type_class = "label label-" + "warning";
    }
    business_type_4.addClass(business_type_class);
    business_type_4.text(business_type);

    // 如果已保存过则显示标签为保存状态，已提交过则更改标签为已提交标签
    let entry_submit_span = $("#entry_submit_span");
    if (confirmed || saved) {
        // 初始化为saved
        let span_text = "已保存",
            span_color = "#5bc0de";
        if (confirmed) {
            span_text = "已完成";
            span_color = "#5cb85c";
        }
        entry_submit_span.css("color", span_color);
        entry_submit_span.text(span_text);
        entry_submit_span.show();
    } else {
        entry_submit_span.hide();
    }
    // 填充业务内容
    $("#business_content_4").text(content);

    // 填充会计分录信息
    if (!entry_infos || !entry_infos.length) {
        // 分录信息为空则返回
        return;
    }
    let borrow_first = true;    // 借记第一行标记
    let loan_first = true;     // 贷记第一行标记
    for (let i = 0; i < entry_infos.length; i++) {
        let subject = entry_infos[i]["subject"],
            money = entry_infos[i]["money"],
            is_dr = entry_infos[i]["is_dr"];
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
    // 移除激活的li的.active
    $("li[id^=courseiv_split_li][class=active]").removeClass("active");
    let add_li_id = "courseiv_split_li_" + business_no;
    // 给当前li添加.active
    $("#" + add_li_id).addClass("active");
    now_business_no = business_no;
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
        + "<td class='ats-tablecolor-f' style='border-right: 0;padding: 4px'></td>"
        + "<td class='ats-tablecolor-f' style='border-left: 0;4px'></td>"
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
