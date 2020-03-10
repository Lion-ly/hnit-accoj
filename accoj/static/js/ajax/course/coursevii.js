// 正确答案中包含的所有科目列表
let involve_subjects = Array(),
    business_list = Array();
// 页面加载完成填充数据
$(document).ready(function () {
    get_business_list();
    get_subsidiary_account_info();
});

/**
 * 分页标签li的激活状态控制
 */
function coursevii_li_control(business_no) {
    // 移除激活的li的.active
    $("li[id^=coursevii_split_li][class=active]").removeClass("active");
    let add_li_id = "coursevii_split_li_" + business_no;
    // 给当前li添加.active
    $("#" + add_li_id).addClass("active");
    // 填充业务信息
    business_no = parseInt(business_no);
    let business_index = business_no - 1,
        content = business_list[business_index]["content"],
        business_type = business_list[business_index]["business_type"];
    let em_no = business_index + 1;
    // 填充业务编号
    em_no = em_no < 10 ? "0" + em_no : em_no;
    $("#em_7").text(em_no);
    // 填充活动类型
    let business_type_7 = $("#business_type_7");
    business_type_7.removeClass();
    let business_type_class = "label label-" + "success"; //  初始化为筹资活动
    if (business_type === "投资活动") {
        business_type_class = "label label-" + "info";
    } else if (business_type === "经营活动") {
        business_type_class = "label label-" + "warning";
    }
    business_type_7.addClass(business_type_class);
    business_type_7.text(business_type);

    // 填充业务内容
    $("#business_content_7").text(content);
}

/**
 * 获取业务内容信息列表
 */
function get_business_list() {
    let data = $.param({"csrf_token": get_csrf_token()});
    $.ajax({
        url: "/get_business_list",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"]) {
                business_list = data["business_list"];
                involve_subjects = data["involve_subjects"];
                let firstOption = true,
                    dateNow = new Date();
                $("#yearNow").val(dateNow.getFullYear());
                $.each(involve_subjects, function (index, item) {
                    $("#anchorOption").before("<option>" + item + "</option>");
                    if (firstOption) {
                        $("#subjectSelect").val(item);
                        firstOption = false;
                    }
                });
                coursevii_li_control(1);
            }
        },
        error: function (err) {
            console.log(err.statusText + "Error");
        }
    });
}

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_subsidiary_account() {
    confirm_info("confirm_subsidiary_account_button", "submit_subsidiary_account_info");
}

/**
 * 保存明细账信息
 */
function save_subsidiary_account() {
    save_info("save_subsidiary_account_button", submit_subsidiary_account_info);
}

//==================================提交会计明细账信息==================================//
/**
 * 提交会计明细账信息
 * @param submit_type confirm or save
 */
function submit_subsidiary_account_info(submit_type) {
    let type_flag = null;
    if (submit_type === "confirm") {
        type_flag = true;
    } else if (submit_type === "save") {
        type_flag = false;
    } else {
        return;
    }
    let csrf_token = get_csrf_token(),
        subject = $("#subjectSelect").val();

    // 获取明细账数据
    let subsidiary_account_info = Array(),
        year = $("#yearNow").val();
    $("[id^=period1Vii1Row], [id^=period2Vii1Row], [id=Vii1RowEnd]").each(function () {
        let thisInput = $(this).find("input"),
            index = 0,
            month = $(thisInput[index++]).val(),
            day = $(thisInput[index++]).val(),
            word = $(thisInput[index++]).val(),
            no = $(thisInput[index++]).val(),
            summary = $(thisInput[index++]).val(),
            dr_money = "",
            cr_money = "";
        for (; index < 25; index++) {
            let money = $(thisInput[index]).val();
            dr_money += index < 15 ? money : "";
            cr_money += index < 15 ? "" : money;
        }
        let orientation = $(thisInput[index++]).val(),
            balance_money = "";
        for (; index < 36; index++) {
            balance_money += $(thisInput[index]);
        }
        let date = year + "-" + month + "-" + day;
        dr_money = dr_money ? parseFloat(dr_money) / 100 : dr_money;
        cr_money = cr_money ? parseFloat(cr_money) / 100 : cr_money;
        balance_money = balance_money ? parseFloat(balance_money) / 100 : balance_money;
        subsidiary_account_info.push({
            "date": date,
            "word": word,
            "no": no,
            "summary": summary,
            "dr_money": dr_money,
            "cr_money": cr_money,
            "orientation": orientation,
            "balance_money": balance_money
        })
    });

    let data = {
        "subsidiary_account_info": subsidiary_account_info,
        "submit_type": submit_type,
        "subject": subject,
    };
    data = JSON.stringify(data);

    $.ajax({
        url: "/submit_subsidiary_account_info",
        type: "post",
        data: data,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        cache: false,
        async: true,
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        },
        success: function (data) {
            if (data["result"] === true) {
                if (type_flag === true) {
                    show_message("submit_confirm_message", "提交成功！", "info", 1000);
                } else if (type_flag === false) {
                    show_message("course_vii1_message", "保存成功！", "info", 1000);
                }
                get_subsidiary_account_info();
            } else {
                if (type_flag === true) {
                    show_message("submit_confirm_message", data["message"], "danger", 1000, "提交失败！");
                } else if (type_flag === false) {
                    show_message("course_vii1_message", data["message"], "danger", 1000, "保存失败！");
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

//==================================获取会计明细账信息==================================//
let subsidiary_account_infos = "", // 保存本次课程全部信息，减少后端数据请求次数
    subsidiary_account_confirmed = "",
    subsidiary_account_saved = "";

/**
 * 从后端获取会计明细账信息
 */
function get_subsidiary_account_info() {
    let csrf_token = {"csrf_token": get_csrf_token()},
        data = $.param(csrf_token),
        subject = $("#subjectSelect").val();
    // 若subsidiary_account_infos不为空且请求的科目已经确认提交过，则不再发送数据请求
    if (subsidiary_account_infos && subsidiary_account_confirmed.indexOf(subject) !== -1) {
        map_subsidiary_account_info();
        return;
    }
    $.ajax({
        url: "/get_subsidiary_account_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                subsidiary_account_infos = data["subsidiary_account_infos"];
                subsidiary_account_confirmed = data["subsidiary_account_confirmed"];
                subsidiary_account_saved = data["subsidiary_account_saved"];
                map_subsidiary_account_info();
            } else {
                show_message("course_vii1_message", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })
}

//==================================将会计明细账信息映射到前端==================================//
let period1Vii1Row = 3,
    period2Vii1Row = 3;

/**
 * 将数据映射到前端
 */
function map_subsidiary_account_info() {
    let subject = $("#subjectSelect").val();
    if (involve_subjects.indexOf(subject) === -1) {
        return;
    }
    // 先重置明细账信息
    $("[id^=period1Vii1Row][id!=Vii1RowEnd][id!=period1Vii1Row1][id!=period1Vii1Row2][id!=period1Vii1RowLast]").remove();
    $("[id^=period2Vii1Row][id!=Vii1RowEnd][id!=period2Vii1Row1][id!=period2Vii1Row2][id!=period2Vii1RowLast]").remove();
    $("input").each(function () {
        let thisValue = $(this).val();
        if (["期初余额", "本期合计", "本年累计"].indexOf(thisValue) === -1) {
            $(this).val("");
        }
    });
    let confirmed = subsidiary_account_confirmed.indexOf(subject) !== -1,
        saved = subsidiary_account_saved.indexOf(subject) !== -1;
    // 将option染色
    if (subsidiary_account_saved || subsidiary_account_confirmed) {
        let $options = $("#subjectSelect").children();
        $.each($options, function (index, item) {
            let optionValue = $(item).val(),
                color = "#555";
            if (subsidiary_account_saved && subsidiary_account_saved.indexOf(optionValue) !== -1) {
                color = "#5bc0de";
            } else if (subsidiary_account_confirmed && subsidiary_account_confirmed.indexOf(optionValue) !== -1) {
                color = "#5cb85c";
            }
            $(item).css("color", color);
        });
    }

    // 如果已保存过则显示标签为保存状态，已提交过则更改标签为已提交标签
    let subsidiary_account_submit_span = $("#subsidiary_account_submit_span");
    if (confirmed || saved) {
        // 初始化为saved
        let span_text = "已保存",
            span_color = "#5bc0de";
        if (confirmed) {
            span_text = "已完成";
            span_color = "#5cb85c";
        }
        $("#subjectSelect").css("color", span_color);
        subsidiary_account_submit_span.css("color", span_color);
        subsidiary_account_submit_span.text(span_text);
        subsidiary_account_submit_span.show();
    } else {
        subsidiary_account_submit_span.hide();
        $("#subjectSelect").css("color", "#555");
    }

    if (!subsidiary_account_infos) return;
    let subsidiary_account_info = subsidiary_account_infos[subject];
    // 填充会计明细账信息
    if (!subsidiary_account_info) {
        // 明细账信息为空则返回
        return;
    }
    // 添加行
    let firstPeriod = true;
    period1Vii1Row = 3;
    period2Vii1Row = 3;
    for (let i = 2; i < subsidiary_account_info.length - 2; i++) {
        if (subsidiary_account_info.length === 7) break;
        if (firstPeriod && subsidiary_account_info[i]["summary"] === "本期合计") {
            firstPeriod = false;
            i += 3;
        }
        if (firstPeriod) {
            vii1_AddRow(true);
        } else {
            vii1_AddRow(false);
        }
    }
    // 填充信息
    let infoIndex = 0,
        firstRow = true;
    $("[id^=period1Vii1Row], [id^=period2Vii1Row], [id=Vii1RowEnd]").each(function () {
        let thisInputs = $(this).find("input"),
            date = subsidiary_account_info[infoIndex]["date"].split("-"),
            word = subsidiary_account_info[infoIndex]["word"],
            no = subsidiary_account_info[infoIndex]["no"],
            summary = subsidiary_account_info[infoIndex]["summary"],
            dr_money = subsidiary_account_info[infoIndex]["dr_money"],
            orientation = subsidiary_account_info[infoIndex]["orientation"],
            cr_money = subsidiary_account_info[infoIndex]["cr_money"],
            balance_money = subsidiary_account_info[infoIndex]["balance_money"],
            year = date[0];
        if (firstRow) {
            $("#yearNow").val(year);
            firstRow = false;
        }
        let month = date[1],
            day = date[2],
            prefix = "0000000000";
        dr_money = dr_money ? dr_money * 100 : dr_money;
        cr_money = cr_money ? cr_money * 100 : cr_money;
        balance_money = balance_money ? balance_money * 100 : balance_money;
        dr_money = dr_money ? dr_money.toString() : dr_money;
        cr_money = cr_money ? cr_money.toString() : cr_money;
        balance_money = balance_money ? balance_money.toString() : balance_money;
        dr_money = dr_money ? prefix.substring(0, 10 - dr_money.length) + dr_money : dr_money;
        cr_money = cr_money ? prefix.substring(0, 10 - cr_money.length) + cr_money : cr_money;
        balance_money = balance_money ? prefix.substring(0, 10 - balance_money.length) + balance_money : balance_money;
        let money = dr_money ? dr_money : "";
        money += cr_money ? cr_money : prefix;
        money += orientation ? orientation : "0";
        money += balance_money ? balance_money : prefix;
        let firstNum = true;
        $(thisInputs[0]).val(month);
        $(thisInputs[1]).val(day);
        $(thisInputs[2]).val(word);
        $(thisInputs[3]).val(no);
        $(thisInputs[4]).val(summary);
        for (let i = 5; i < 36; i++) {
            if (money) {
                if (i === 15 || i === 25 || i === 26) {
                    firstNum = true;
                }
                if (firstNum && money[i - 5] !== "0") {
                    $(thisInputs[i]).val(money[i - 5]);
                    firstNum = false;
                }
                if (!firstNum && i < money.length + 5)
                    $(thisInputs[i]).val(money[i - 5]);
            }
        }
        infoIndex++;
    });
}

//==================================提交科目余额表信息==================================//

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_acc_balance_sheet() {
    confirm_info("confirm_acc_balance_sheet_button", "submit_acc_balance_sheet_info");
}

/**
 * 保存科目余额表信息
 */
function save_acc_balance_sheet() {
    save_info("save_acc_balance_sheet_button", submit_acc_balance_sheet_info);
}


/**
 * 提交科目余额表信息
 * @param submit_type confirm or save
 */
function submit_acc_balance_sheet_info(submit_type) {
    let type_flag = null;
    if (submit_type === "confirm") {
        type_flag = true;
    } else if (submit_type === "save") {
        type_flag = false;
    } else {
        return;
    }
    let csrf_token = get_csrf_token(),
        acc_balance_sheet_infos = Array();

    $("[id^=vii2Row]").each(function () {
        let thisInputs = $(this).find("input"),
            inputIndex = 0,
            subject = $(this).attr("id") === "vii2RowLast" ? "sum" : $(thisInputs[0]).val();
        if (subject !== "sum") inputIndex = 1;
        let borrow_1 = $(thisInputs[inputIndex]).val(),
            lend_1 = $(thisInputs[inputIndex + 1]).val(),
            borrow_2 = $(thisInputs[inputIndex + 2]).val(),
            lend_2 = $(thisInputs[inputIndex + 3]).val(),
            borrow_3 = $(thisInputs[inputIndex + 4]).val(),
            lend_3 = $(thisInputs[inputIndex + 5]).val();
        acc_balance_sheet_infos.push({
            "subject": subject,
            "borrow_1": borrow_1,
            "lend_1": lend_1,
            "borrow_2": borrow_2,
            "lend_2": lend_2,
            "borrow_3": borrow_3,
            "lend_3": lend_3,
        })
    });

    let data = {
        "acc_balance_sheet_infos": acc_balance_sheet_infos,
        "submit_type": submit_type
    };
    data = JSON.stringify(data);
    $.ajax({
        url: "/submit_acc_balance_sheet_info",
        type: "post",
        data: data,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        cache: false,
        async: true,
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        },
        success: function (data) {
            if (data["result"] === true) {
                if (type_flag === true) {
                    show_message("submit_confirm_message", "提交成功！", "info", 1000);
                } else if (type_flag === false) {
                    show_message("course_vii2_message", "保存成功！", "info", 1000);
                }
                get_acc_balance_sheet_info();
            } else {
                if (type_flag === true) {
                    show_message("submit_confirm_message", data["message"], "danger", 1000, "提交失败！");
                } else if (type_flag === false) {
                    show_message("course_vii2_message", data["message"], "danger", 1000, "保存失败！");
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

//==================================获取科目余额表信息==================================//
let acc_balance_sheet_infos, // 保存本次课程全部信息，减少后端数据请求次数
    acc_balance_sheet_confirmed,
    acc_balance_sheet_saved;

/**
 * 从后端获取科目余额表信息
 */
function get_acc_balance_sheet_info() {

    let csrf_token = {"csrf_token": get_csrf_token()},
        data = $.param(csrf_token);
    // 若acc_balance_sheet_infos不为空且已经确认提交过，则不再发送数据请求
    if (acc_balance_sheet_infos && acc_balance_sheet_confirmed) {
        map_acc_balance_sheet_info();
        return;
    }
    $.ajax({
        url: "/get_acc_balance_sheet_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                acc_balance_sheet_infos = data["acc_balance_sheet_infos"];
                map_acc_balance_sheet_info();
            } else {
                show_message("course_vii2_message", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })
}

//==================================将科目余额表信息映射到前端==================================//
/**
 * 将数据映射到前端
 */
function map_acc_balance_sheet_info() {
    // 先重置科目余额表信息
    $("[id^=vii2Row][id!=vii2Row1][id!=vii2RowLast]").remove();
    $("input").val("");
    // 如果已保存过则显示标签为保存状态，已提交过则更改标签为已提交标签
    let confirmed = acc_balance_sheet_confirmed,
        acc_balance_sheet_submit_span = $("#acc_balance_sheet_submit_span");
    if (confirmed || acc_balance_sheet_saved) {
        // 初始化为saved
        let span_text = "已保存";
        let span_color = "#5bc0de";
        if (confirmed) {
            span_text = "已完成";
            span_color = "#5cb85c";
        }
        acc_balance_sheet_submit_span.css("color", span_color);
        acc_balance_sheet_submit_span.text(span_text);
        acc_balance_sheet_submit_span.show();
    } else {
        acc_balance_sheet_submit_span.hide();
    }

    if (!acc_balance_sheet_infos) return;
    // 创建行
    for (let i = 0; i < acc_balance_sheet_infos.length - 2; i++) {
        vii2_AddRow();
    }
    // 填充数据
    let index = 0;
    $("[id^=vii2Row]").each(function () {
        let thisInputs = $(this).find("input"),
            subject = acc_balance_sheet_infos[index]["subject"],
            borrow_1 = acc_balance_sheet_infos[index]["borrow_1"],
            lend_1 = acc_balance_sheet_infos[index]["lend_1"],
            borrow_2 = acc_balance_sheet_infos[index]["borrow_2"],
            lend_2 = acc_balance_sheet_infos[index]["lend_2"],
            borrow_3 = acc_balance_sheet_infos[index]["borrow_3"],
            lend_3 = acc_balance_sheet_infos[index]["lend_3"],
            inputIndex = 0;
        if (subject !== "sum") {
            $(thisInputs[inputIndex]).val(subject);
            inputIndex = 1;
        }
        $(thisInputs[inputIndex]).val(borrow_1);
        $(thisInputs[inputIndex + 1]).val(lend_1);
        $(thisInputs[inputIndex + 2]).val(borrow_2);
        $(thisInputs[inputIndex + 3]).val(lend_2);
        $(thisInputs[inputIndex + 4]).val(borrow_3);
        $(thisInputs[inputIndex + 5]).val(lend_3);
        index++;
    });
}

// ==================================事件控制==================================//
/*
 * @ # coursevii1 -> 登记各账户明细表 ? 表格增加行
 */
function vii1_AddRow(flag) {
    let obj = "period1Vii1RowLast",
        idPrefix = "period1Vii1Row",
        vii1Row = period1Vii1Row;
    if (!flag) {
        obj = "period2Vii1RowLast";
        idPrefix = "period2Vii1Row";
        vii1Row = period2Vii1Row++;
    } else {
        period1Vii1Row++;
    }
    let now_id = idPrefix + vii1Row;
    $("#" + obj).before(
        "<tr id='" + now_id + "'>"
        + "<td><label><input name='month' title='月' onkeyup='limit_number(this)'></label>"
        + "<td><label><input name='day' title='日' onkeyup='limit_number(this)'></label>"
        + "<td><label><input name='word' title='字' onkeyup='limit_number(this)'></label>"
        + "<td><label><input name='no' title='号' onkeyup='limit_number(this)'></label>"
        + "<td><label><input name='summary' onkeyup='illegalCharFilter(this)'></label></td>"

        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"

        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"

        + "<td><label><input name='orientation' onkeyup='limitJieDai(this)'></label></td>"

        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"

        + "<td style='width: 1%; border: 0; background: #ffffff'>"
        + "<div style='text-align: center'>"
        + "<a style='color: red; padding: 0 0' type='button' "
        + "class='btn' onclick='vii1_DeleteRow(this)'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>"
        + "</td>"
        + "</tr>"
    );
}


/*
 * @ # coursevii1 ->账户明细表 ? 表格删除行
 */
function vii1_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}

let vii2Row = 2;

/*
 * @ # coursevii2 -> 科目余额表 ? 表格增加行
 */
function vii2_AddRow() {
    let now_id = "vii2Row" + vii2Row;
    $("#vii2RowLast").before(
        "<tr id='" + now_id + "'>"
        + "<td><label><input name='subject' title='科目' onkeyup='illegalCharFilter(this)'></label></td>" +
        "<td><label><input name='borrow_1' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='lend_1' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='borrow_2' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='lend_2' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='borrow_3' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='lend_3' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>"
        + "<td style='padding: 0; border: 0'>"
        + "<div style='text-align: center'> "
        + "<a style='color: red' type='button' class='btn' onclick='vii2_DeleteRow(this)'><span class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div> "
        + "</td> "
        + "</tr>"
    );
    vii2Row++;
}


/*
 * @ # coursevii2 -> 科目余额表 ? 表格删除行
 */
function vii2_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}