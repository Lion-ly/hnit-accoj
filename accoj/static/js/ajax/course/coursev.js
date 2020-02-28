/**
 * 科目改变事件
 * @param obj
 */
function subject_change(obj) {
    let now_subject = $(obj).val();
    $("li.active[role=presentation]").children().text(now_subject);
}

// 正确答案中包含的所有科目列表
let subject_list = Array("银行存款", "实收资本", "无形资产", "预付账款", "长期借款",
    "生产成本", "销售费用", "原材料", "固定资产", "交易性金融资产", "管理费用", "应付职工薪酬",
    "应付账款", "长期股权投资", "投资收益", "预收账款", "其他应收款");

/**
 * li改变事件
 * @param obj
 */
function coursevLiChange(obj) {
    subject_list_len = subject_list.length;
    let now_li_subject = $(obj).children().text();
    // 移除激活的li的.active
    $("li[id^=coursevli]").removeClass("active");
    // 给当前li添加.active
    $(obj).addClass("active");
    // 移除旧表
    $("[id^=ttable]").remove();
    // 增加新表
    if ($(obj).attr("id").startsWith("coursevli_left")) {
        tTableAppendLeft();
    } else if ($(obj).attr("id").startsWith("coursevli_right")) {
        tTableAppendRight();
    }
    // 获取li_list中包含的subject信息列表
    let li_subject_list = Array("");
    $("[id^=coursevli]").each(function () {
        let subject = $(this).children().text();
        li_subject_list.push(subject);
    });
    // 设置option列表的值
    let option_list = now_li_subject === "" ? "" : "<option name='coursev_option'>" + now_li_subject + "</option>";
    let first_option = "";
    $.each(subject_list, function (index, item) {
        // 当前li_list不存在对应subject
        if (li_subject_list.indexOf(item) === -1) {
            first_option = item;
            option_list += "<option name='coursev_option'>" + item + "</option>";
        }
    });
    $("#coursev_select").append(option_list);
    // 将表中option设为对应li标签
    if (now_li_subject !== "") {
        $("#coursev_select").val(now_li_subject);
    } else {
        $(obj).children().text(first_option);
        $("#coursev_select").val(first_option);
    }
}

/**
 * 删除Table和对应li标签
 * @param obj
 */
function deleteTableV(obj) {
    // 删除li标签
    $("li[id^=coursevli][class=active]").remove();
    // 删除Table
    $(obj).parent().parent().remove();
    // 点击li最后一个标签，防止当前页空白
    let coursevli_list = $("li[id^=coursevli]");
    let coursevli_list_len = $(coursevli_list).length;
    if (coursevli_list_len) {
        let last_li = $(coursevli_list[coursevli_list_len - 1]);
        coursevLiChange(last_li);
    }
}
