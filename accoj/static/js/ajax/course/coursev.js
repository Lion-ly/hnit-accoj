// 正确答案中包含的所有科目列表
let subject_list = Array("银行存款", "实收资本", "无形资产", "预付账款", "长期借款",
    "生产成本", "销售费用", "原材料", "固定资产", "交易性金融资产", "管理费用", "应付职工薪酬",
    "应付账款", "长期股权投资", "投资收益", "预收账款", "其他应收款");
// let subject_list = Array();
let pageNum = 0;
let ledger_dict; // 嵌套字典，保存本次课程全部信息，减少后端数据请求次数
// 当前所选科目
let now_subject = "";
// 页面加载完成填充数据
$(document).ready(function () {
    // 第一次，先获取数据
    get_ledger_info(now_subject);
    // 创建已保存或已提交的标签
    for (let key in ledger_dict) {
        if (!ledger_dict.hasOwnProperty(key)) continue;
        let lcr = "left";
        let subject = ledger_dict[key];
        if (!ledger_dict[key]["is_left"]) {
            lcr = "right";
        }
        let coursevli_id = "coursevli_" + lcr + pageNum;
        $("#coursev_li_tabs").before(
            "<li role='presentation' class='active' onclick='coursevLiChange(this, true)' id='" + coursevli_id + "'>" +
            "<a>" + subject + "</a></li>"
        );
        pageNum++;
    }
    // 点击第一个标签
    let coursevli_list = $("li[id^=coursevli]");
    let coursevli_list_len = $(coursevli_list).length;
    if (coursevli_list_len) {
        let last_li = $(coursevli_list[0]);
        coursevLiChange(last_li);
    }
});

/*
 * @ # coursev ? 表格增加行
 */
function v_AddLeftRow(obj, pm, business_no = "", money = "") {
    let is_dr = "dr";
    if (!pm) {
        is_dr = "cr";
    }
    $(obj).parent().parent().parent().after(
        "<tr><td><div style='text-align: left'>"
        + "<a style='color: red; padding: 0 0' type='button' "
        + "class='btn' onclick='v_DeleteRowT(this)'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>" + "</td>"
        + "<td><input title='业务编号' type='number' name='business_no' value='" + business_no
        + "' placeholder='0'></td>"
        + "<td><input title='金额 ' type='number' name='" + is_dr + "' value='" + money + "'"
        + " placeholder='0'></td></tr>");
}

function v_AddRightRow(obj, pm, business_no = "", money = "") {
    let is_dr = "cr";
    if (!pm) {
        is_dr = "dr";
    }
    $(obj).parent().parent().parent().after(
        "<tr>"
        + "<td><input title='业务编号' type='number' name='business_no' value='" + business_no
        + "' placeholder='0'></td>"
        + "<td><input title='金额 ' type='number' name='" + is_dr + "' value='" + money + "'"
        + " name='" + is_dr + "' id='' placeholder='0'></td>"
        + "<td style='width: 40%;'>" + "<div style='text-align: right'>"
        + "<a style='color: red; padding: 0 0' "
        + "type='button' class='btn' onclick='v_DeleteRowT(this)'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>" + "</td>" + "</tr>");
}

function v_DeleteRowT(obj) {
    $(obj).parent().parent().parent().remove();
}


/**
 * 增加左T表
 */
function tTableAppendLeft() {
    let content = '' +
        '<div role="form" class="" id="ttableLeft">' +
        '        <div style="text-align:right;">' +
        '           <button style="color: red; font-size: 18px; margin-right: 6px; padding: 0; background-color: #ffffff" type="button"' +
        '               class="btn" title="删除此表"  onclick="deleteTableV(this)"><span class="glyphicon glyphicon-remove"></span></button>' +
        '        </div>' +
        '        <div align="center" style="margin-top: 80px;margin-bottom: 100px">' +
        '            <table class="table table-bordered" style="border: 0; width: 50%; margin-bottom: 0">' +
        '                <tbody>' +
        '                <tr>' +
        '                    <th style="text-align: center; vertical-align: middle; border: 0; width: 33%">借方</th>' +
        '                    <th style="border: 0; width: 33%">' +
        '                    <select id="coursev_select" class="form-control pull-right" onchange="subject_change(this)">' +
        '                    </select></th>' +
        '                    <th style="text-align: center; vertical-align: middle; border: 0; width: 33%">贷方</th>' +
        '                </tr>' +
        '                </tbody>' +
        '            </table>' +
        '            <table class="table table-bordered" style="border: 0; width: 50%;">' +
        '                <tbody>' +
        '                <tr>' +
        '                    <td style="width: 50%; border-left: 0">' +
        '                        <div style="text-align: right">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <td style="width: 40%;">' +
        '                                        <div style="text-align: left"><a id="v_AddRowDr" style="color: green; padding: 0 0" type="button"' +
        '                                                             class="btn"' +
        '                                                             onclick="v_AddLeftRow(this, true)"><span' +
        '                                                class="glyphicon glyphicon-plus-sign"></span></a></div>' +
        '                                    </td>' +
        '                                    <th style="width: 30%;">期初余额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="opening_balance" placeholder="0"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0">' +
        '                        <div style="text-align: left">' +
        '                            <table id="ttable-01" class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <th style="width: 30%;"></th>' +
        '                                    <td style="width: 30%;"></td>' +
        '                                    <td style="width: 40%;">' +
        '                                        <div style="text-align: right"><a id="v_AddRowCr" style="color: green; padding: 0 0" type="button"' +
        '                                                              class="btn"' +
        '                                                              onclick="v_AddRightRow(this,false)"><span' +
        '                                                class="glyphicon glyphicon-plus-sign"></span></a></div>' +
        '                                    </td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                </tr>' +
        '                <tr>' +
        '                    <td style="width: 50%; border-left: 0; border-bottom: 0">' +
        '                        <div style="text-align: right">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <td style="width: 40%;"></td>' +
        '                                    <th style="width: 30%;">本期发生额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="current_amount_dr" id="" placeholder="0"></td>' +
        '                                </tr>' +
        '                                <tr>' +
        '                                    <td></td>' +
        '                                    <th>期末余额</th>' +
        '                                    <td><input type="number" name="ending_balance" id="" placeholder="0"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0; border-bottom: 0">' +
        '                        <div style="text-align: left">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <th style="width: 30%;">本期发生额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="current_amount_cr" id="" placeholder="0"></td>' +
        '                                    <td style="width: 40%;"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                </tr>' +
        '                </tbody>' +
        '            </table>' +
        '        </div>' +
        '    </div>';
    $('#TTablePage').append(content);
}

/**
 * 增加右T表
 */
function tTableAppendRight() {
    let content = '' +
        '    <div role="tabpanel" class="" id="ttableRight">' +
        '        <div style="text-align:right;">' +
        '           <button style="color: red; font-size: 18px; margin-right: 6px; padding: 0; background-color: #ffffff" type="button"' +
        '               class="btn" title="删除此表" onclick="deleteTableV(this)"><span class="glyphicon glyphicon-remove"></span></button>' +
        '        </div>' +
        '        <div align="center" style="margin-top: 80px;margin-bottom: 100px">' +
        '            <table class="table table-bordered" style="border: 0; width: 50%; margin-bottom: 0">' +
        '                <tbody>' +
        '                <tr>' +
        '                    <th style="text-align: center; vertical-align: middle; border: 0; width: 33%">借方</th>' +
        '                    <th style="border: 0; width: 33%"><select id="coursev_select" class="form-control pull-right"' +
        '                                                              onchange="subject_change(this)">' +
        '                    </select></th>' +
        '                    <th style="text-align: center; vertical-align: middle; border: 0; width: 33%">贷方</th>' +
        '                </tr>' +
        '                </tbody>' +
        '            </table>' +
        '            <table class="table table-bordered" style="border: 0; width: 50%">' +
        '                <tbody>' +
        '                <tr>' +
        '                    <td style="width: 50%; border-left: 0">' +
        '                        <div style="text-align: right">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <td style="width: 40%;">' +
        '                                        <div style="text-align: left"><a id="v_AddRowDr" style="color: green; padding: 0 0" type="button"' +
        '                                                             class="btn" onclick="v_AddLeftRow(this,false)"><span' +
        '                                                class="glyphicon glyphicon-plus-sign"></span></a></div>' +
        '                                    </td>' +
        '                                    <th style="width: 30%;"></th>' +
        '                                    <td style="width: 30%;"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0">' +
        '                        <div style="text-align: left">' +
        '                            <table id="ttable-01" class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <th style="width: 30%;">期初余额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="" id="" placeholder="0"></td>' +
        '                                    <td style="width: 40%;">' +
        '                                        <div style="text-align: right"><a id="v_AddRowCr" style="color: green; padding: 0 0" type="button"' +
        '                                                              class="btn"' +
        '                                                              onclick="v_AddRightRow(this,true)"><span' +
        '                                                class="glyphicon glyphicon-plus-sign"></span></a></div>' +
        '                                    </td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                </tr>' +
        '                <tr>' +
        '                    <td style="width: 50%; border-left: 0; border-bottom: 0">' +
        '                        <div style="text-align: right">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <td style="width: 40%;"></td>' +
        '                                    <th style="width: 30%;">本期发生额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="" id="" placeholder="0"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0; border-bottom: 0">' +
        '                        <div style="text-align: left">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <th style="width: 30%;">本期发生额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="" id="" placeholder="0"></td>' +
        '                                    <td style="width: 40%;"></td>' +
        '                                </tr>' +
        '                                <tr>' +
        '                                    <th>期末余额</th>' +
        '                                    <td><input type="number" name="" id="" placeholder="0"></td>' +
        '                                    <td></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                </tr>' +
        '                </tbody>' +
        '            </table>' +
        '        </div>' +
        '    </div>';
    $('#TTablePage').append(content);
}

let subject_list_len = 0;

function v_createNewPage(obj, lcr) {
    let ledgerNum = $("li[id^=coursevli]").length;
    if (subject_list_len && ledgerNum >= subject_list_len) {
        show_message("course_v_message", "账户设置达到上限", "danger", 1000, "新增失败");
        return;
    }
    // 移除旧表
    $("[id^=ttable]").remove();
    // 移除激活的li的.active
    $("li[id^=coursevli]").removeClass("active");
    switch (lcr) {
        case "left":
            tTableAppendLeft();
            break;
        case "center":
            $('#TTablePage').append(

            );
            break;
        case "right":
            tTableAppendRight();
            break;
    }
    let coursevli_id = "coursevli_" + lcr + pageNum;
    $(obj).parent().parent().parent().before(
        "<li role='presentation' class='active' onclick='coursevLiChange(this)' id='" + coursevli_id + "'>" +
        "<a></a></li>"
    );
    coursevLiChange($("#" + coursevli_id));
    pageNum++;
}

//==================================提交会计账户信息==================================//
/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_ledger() {
    show_submit_confirm("submit_ledger_info('confirm')");
    let confirm_ledger_button = $("#confirm_ledger_button");
    confirm_ledger_button.attr("disabled", true);
    confirm_ledger_button.text("提交 2s");
    setTimeout(function () {
        confirm_ledger_button.text("提交 1s");
    }, 1000);
    setTimeout(function () {
        confirm_ledger_button.attr("disabled", false);
        confirm_ledger_button.text("提交");
    }, 2000);
}

/**
 * 保存账户信息
 */
function save_ledger() {
    submit_ledger_info("save");
    let save_ledger_button = $("#save_ledger_button");
    save_ledger_button.attr("disabled", true);
    save_ledger_button.text("保存 2s");
    setTimeout(function () {
        save_ledger_button.text("保存 1s");
    }, 1000);
    setTimeout(function () {
        save_ledger_button.attr("disabled", false);
        save_ledger_button.text("保存");
    }, 2000);
}

/**
 * 提交会计账户信息
 * @param submit_type confirm or save
 */
function submit_ledger_info(submit_type) {
    let type_flag = null;
    if (submit_type === "confirm") {
        type_flag = true;
    } else if (submit_type === "save") {
        type_flag = false;
    } else {
        return;
    }
    let ledger_infos = {};
    let csrf_token = {"csrf_token": get_csrf_token()};
    let data = $.param(csrf_token);
    let subject = $("#coursev_select").val();                           //  科目
    let is_left = $("li.active[id^=coursevli]").attr("id").startsWith("coursevli_left");  //  是否为左T表
    let opening_balance = $("input[name=opening_balance]").val();       //  期初余额
    let current_amount_dr = $("input[name=current_amount_dr]").val();   //  本期发生额借记方
    let current_amount_cr = $("input[name=current_amount_cr]").val();   //  本期发生额贷记方
    let ending_balance = $("input[name=ending_balance]").val();         //  期末余额

    ledger_infos["subject"] = subject;
    ledger_infos["is_left"] = is_left;
    ledger_infos["opening_balance"] = opening_balance;
    ledger_infos["current_amount_dr"] = current_amount_dr;
    ledger_infos["current_amount_cr"] = current_amount_cr;
    ledger_infos["ending_balance"] = ending_balance;

    let dr_array = Array();     //  借方信息列表
    let cr_array = Array();     //  贷方信息列表
    $("input[name=dr]").each(function () {
        let business_no = $(this).parent().prev().children().val();
        let money = $(this).val();
        dr_array.push({"business_no": business_no, "money": money});
    });
    $("input[name=cr]").each(function () {
        let business_no = $(this).parent().prev().children().val();
        let money = $(this).val();
        cr_array.push({"business_no": business_no, "money": money});
    });
    ledger_infos["dr"] = dr_array;
    ledger_infos["cr"] = cr_array;
    // 如果JS Object包含数组需要转换成JSON格式Flask才能正确解析，反之同理
    ledger_infos = JSON.stringify(ledger_infos);
    ledger_infos = {"ledger_infos": ledger_infos};
    data += "&" + $.param(ledger_infos) + "&" + $.param({subject: ledger_infos}) + "&" + $.param({"submit_type": submit_type});
    $.ajax({
        url: "/submit_ledger_info",
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
                    show_message("course_v_message", "保存成功！", "info", 1000);
                }
                get_ledger_info(subject);
            } else {
                if (type_flag === true) {
                    show_message("submit_confirm_message", data["message"], "danger", 1000, "提交失败！");
                } else if (type_flag === false) {
                    show_message("course_v_message", data["message"], "danger", 1000, "保存失败！");
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
/**
 * 从后端获取会计要素信息
 * @param subject
 */
function get_ledger_info(subject) {
    now_subject = subject;
    let csrf_token = {"csrf_token": get_csrf_token()};
    let data = $.param(csrf_token);
    // 若ledger_dict不为空且请求的账户已经确认提交过，则不再发送数据请求
    if (ledger_dict && ledger_dict.hasOwnProperty(now_subject) && ledger_dict[now_subject]["confirmed"] === true) {
        map_ledger_info(subject);
        return;
    }
    $.ajax({
        url: "/get_ledger_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                ledger_dict = data["ledger_dict"];
                map_ledger_info(subject);
            } else {
                show_message("course_v_message", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })
}

/**
 * 将数据映射到前端
 * @param subject
 */
function map_ledger_info(subject) {
    let ledger_infos = ledger_dict.hasOwnProperty("subject") ? ledger_dict(subject) : "";
    if (!ledger_infos) {
        // 账户信息为空则返回
        return;
    }
    let confirmed = ledger_dict["confirmed"];
    let saved = ledger_dict["saved"];
    let is_left = ledger_infos["is_left"];
    let opening_balance = ledger_infos["opening_balance"];
    let current_amount_dr = ledger_infos["current_amount_dr"];
    let current_amount_cr = ledger_infos["current_amount_cr"];
    let ending_balance = ledger_infos["ending_balance"];
    let dr_array = ledger_infos["dr"];
    let cr_array = ledger_infos["cr"];

    //  移除旧表
    $("[id=ttableLeft], [id=tttableRight]").remove();
    //  创建新表
    if (is_left) {
        $("#createNewTableLeft").click();
    } else {
        $("#createNewTableRight").click();
    }
    // 填充科目
    $("#coursev_select").append("<option name='coursev_option'>" + now_subject + "</option>");
    // 增加行
    for (let i = 0; i < dr_array.length; i++) {
        $("#v_addRowDr").click();
    }
    for (let i = 0; i < cr_array.length; i++) {
        $("#v_addRowCr").click();
    }
    // 填充会计账户信息
    $("input[name=opening_balance]").val(opening_balance);
    $("input[name=current_amount_dr]").val(current_amount_dr);
    $("input[name=current_amount_cr]").val(current_amount_cr);
    $("input[name=ending_balance]").val(ending_balance);
    let dr_index = 0;
    let cr_index = 0;
    //  填充借记
    $("input[name=dr]").each(function () {
        $(this).parent().prev().children().val(dr_array[dr_index]["business_no"]);
        $(this).val(dr_array[dr_index]["money"]);
        dr_index += 1;
    });
    // 填充贷记
    $("input[name=cr]").each(function () {
        $(this).parent().prev().children().val(dr_array[cr_index]["business_no"]);
        $(this).val(dr_array[cr_index]["money"]);
        cr_index += 1;
    });

    // 如果已保存过则将li标签设为为保存状态的颜色，已提交过同上
    let now_active_li = $("li.active[id^=coursevLi]");
    if (confirmed || saved) {
        now_active_li.attr("onclick", "coursevLiChange(this, true)");
        $("#coursev_select").attr("disabled", true);
        // 初始化为saved
        let li_color = "#5bc0de";
        if (confirmed) {
            li_color = "#5cb85c";
        }
        now_active_li.css("color", li_color);
    }
}

//==================================事件控制==================================//
/**
 * 科目改变事件
 * @param obj
 */
function subject_change(obj) {
    let now_subject = $(obj).val();
    $("li.active[role=presentation]").children().text(now_subject);
}

/**
 * li改变事件
 * @param obj
 * @param role
 */
function coursevLiChange(obj, role = false) {
    subject_list_len = subject_list.length;
    let now_li_subject = $(obj).children().text();
    // 移除激活的li的.active
    $("li[id^=coursevli]").removeClass("active");
    // 给当前li添加.active
    $(obj).addClass("active");
    if (!role) {
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
                if (!first_option) {
                    first_option = item;
                }
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
    } else {
        get_ledger_info(now_li_subject);
    }
}

/**
 * 删除Table和对应li标签
 * @param obj
 */
function deleteTableV(obj) {
    // 删除li标签
    if (ledger_dict && ledger_dict.hasOwnProperty(now_subject) && ledger_dict[now_subject]["confirmed"]) {
        show_message("course_v_message", "已经提交过, 不可删除", "danger", 1000, "删除失败");
    }
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
