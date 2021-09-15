let involve_subjects = Object(),  // 正确答案中包含的所有科目列表
    pageNum = 0,
    ledger_infos,                // 嵌套字典，保存本次课程全部信息，减少后端数据请求次数
    ledger_confirmed = Object(),
    ledger_saved = Object(),
    permission = Object(),
    now_subject = "",            // 当前所选科目
    first = true,
    involve_subjects_len = 0,
    now_period = 1,
    answer_infos = "",
    scores = "";

// 页面加载完成填充数据
$(document).ready(function () {
    function init() {
        vBind();
        get_involve_subjects();
    }

    init();
});


/**
 * 获取科目列表
 */
function get_involve_subjects() {
    function successFunc(data) {
        involve_subjects = data["involve_subjects"];
        get_ledger_info(true, now_subject);
    }

    // 获取数据
    get_info({}, "/get_business_list", successFunc, "");
}

//==================================提交会计账户信息==================================//
/**
 * 提交会计账户信息
 * @param submit_type confirm or save
 */
function submit_ledger_info(submit_type) {
    let data = vGetInput();
    data["submit_type"] = submit_type;
    data["ledger_period"] = now_period;

    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_ledger_info",
        messageDivID = "course_v_message",
        successFunc = get_ledger_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);

}

//==================================获取会计账户信息==================================//
/**
 * 从后端获取会计账户信息
 * @param subject
 * @param isFromSubmit
 */
function get_ledger_info(isFromSubmit = false, subject = "") {
    now_subject = subject ? subject : now_subject;
    let confirmed_key = "ledger" + now_period + "_confirm",
        saved_key = "ledger" + now_period + "_saved",
        ledger_confirmed_tmp = ledger_confirmed[confirmed_key],
        ledger_saved_tmp = ledger_saved[saved_key];

    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!ledger_saved_tmp || ledger_saved_tmp.indexOf(subject) === -1)
            //  若未保存，则不向后台请求数据
            return;
    }
    // 若请求的账户已经确认提交过，则不再发送数据请求
    if (ledger_confirmed_tmp && ledger_confirmed_tmp.indexOf(subject) !== -1) {
        map_ledger_info();
        return;
    }

    function successFunc(data) {
        if (first) {
            initLi(data);
            first = false;
        }
        map_ledger_info(data);
    }

    // 获取数据
    let data = {},
        url = "/get_ledger_info",
        messageDivID = "course_v_message";
    get_info(data, url, successFunc, messageDivID);
}

/**
 * 将数据映射到前端
 * @param data
 * @param isFromButton
 */
function map_ledger_info(data, isFromButton) {
    data = data ? data : "";
    ledger_infos = data ? data["ledger_infos"] : ledger_infos;
    ledger_confirmed = data ? data["ledger_confirmed"] : ledger_confirmed;
    ledger_saved = data ? data["ledger_saved"] : ledger_saved;
    answer_infos = data ? data["answer_infos"] : answer_infos;
    scores = data ? data["scores"] : scores;
    permission = data ? data["permission"] : permission;

    //填充团队题目
    if (permission.ledger1_permission) {
        $("#selfQuestion").html("期间一");
    }
    if (permission.ledger2_permission) {
        $("#selfQuestion").html("期间二");
    }

    if (!ledger_infos) return;
    let info_key = "ledger_infos_" + now_period,
        ledger_infos_tmp = ledger_infos.hasOwnProperty(info_key) ? ledger_infos[info_key] : "";

    if (answer_infos) {
        showAnswerButton();
        isFromButton = 1;
        $("button[data-answer]").text("查看答案");
    }
    // console.log(ledger_infos_tmp);
    if (ledger_infos_tmp) {
        let ledger_info = ledger_infos_tmp.hasOwnProperty(now_subject) ? ledger_infos_tmp[now_subject] : "";
        // console.log(ledger_info);
        if (ledger_info) vPaddingData(ledger_info, isFromButton);
    }
}

//================================删除账户信息================================//
function delete_ledger_info(subject) {

    function successFunc() {
        get_ledger_info(true, subject);
    }

    let data = {"subject": subject, "ledger_period": now_period};
    data = JSON.stringify(data);

    let url = "/delete_ledger_info",
        messageDivID = "course_v_message";
    get_info(data, url, successFunc, messageDivID);

}

// ===============================获取和填充数据===============================//
/**
 * 获取数据
 * @returns {Object}
 */
function vGetInput() {
    let is_left = $("li.active[id^=coursevli]").attr("id").startsWith("coursevli_left"),  //  是否为左T表
        opening_balance = $("input[name=opening_balance]").val(),       //  期初余额
        current_amount_dr = $("input[name=current_amount_dr]").val(),   //  本期发生额借记方
        current_amount_cr = $("input[name=current_amount_cr]").val(),   //  本期发生额贷记方
        ending_balance = $("input[name=ending_balance]").val(),         //  期末余额
        data;

    let dr_array = Array(),     //  借方信息列表
        cr_array = Array();     //  贷方信息列表
    $("input[name=dr]").each(function () {
        let business_no = $(this).parent().prev().children().val(),
            money = $(this).val();
        dr_array.push({"business_no": business_no, "money": money});
    });
    $("input[name=cr]").each(function () {
        let business_no = $(this).parent().prev().children().val(),
            money = $(this).val();
        cr_array.push({"business_no": business_no, "money": money});
    });

    let ledger_info = {
        "subject": $("#coursev_select").val(),      //  科目
        "is_left": is_left,
        "opening_balance": opening_balance,
        "current_amount_dr": current_amount_dr,
        "current_amount_cr": current_amount_cr,
        "ending_balance": ending_balance,
        "dr": dr_array,
        "cr": cr_array
    };
    data = {"ledger_info": ledger_info};

    return data;
}

/**
 * 填充数据
 * @param data
 * @param isFromButton
 */
function vPaddingData(data, isFromButton) {
    function padding() {
        let confirmed_key = "ledger" + now_period + "_confirm",
            saved_key = "ledger" + now_period + "_saved",
            ledger_confirmed_tmp = ledger_confirmed[confirmed_key],
            ledger_saved_tmp = ledger_saved[saved_key];

        let ledger_info = data,
            confirmed = ledger_confirmed_tmp.indexOf(now_subject) !== -1,
            saved = ledger_saved_tmp.indexOf(now_subject) !== -1,
            is_left = ledger_info["is_left"],
            opening_balance = ledger_info["opening_balance"],
            current_amount_dr = ledger_info["current_amount_dr"],
            current_amount_cr = ledger_info["current_amount_cr"],
            ending_balance = ledger_info["ending_balance"],
            dr_array = ledger_info["dr"],
            cr_array = ledger_info["cr"];
        //  移除旧表
        $("[id=ttableLeft], [id=ttableRight]").remove();
        //  创建新表
        if (is_left) {
            tTableAppendLeft();
        } else tTableAppendRight();

        // 填充科目
        $("#coursev_select").append("<option name='coursev_option'>" + now_subject + "</option>");
        // 增加行
        for (let i = 0; dr_array && i < dr_array.length; i++) $("#v_AddRowDr").click();
        for (let i = 0; cr_array && i < cr_array.length; i++) $("#v_AddRowCr").click();
        // console.log("dr_array.length: " + dr_array.length);
        // console.log("cr_array.length: " + cr_array.length);
        // 填充会计账户信息
        $("input[name=opening_balance]").val(opening_balance);
        $("input[name=current_amount_dr]").val(current_amount_dr);
        $("input[name=current_amount_cr]").val(current_amount_cr);
        $("input[name=ending_balance]").val(ending_balance);
        let dr_index = 0,
            cr_index = 0;
        //  填充借记
        $("input[name=dr]").each(function () {
            $(this).parent().prev().children().val(dr_array[dr_index]["business_no"]);
            $(this).val(dr_array[dr_index]["money"]);
            dr_index += 1;
        });
        // 填充贷记
        $("input[name=cr]").each(function () {
            $(this).parent().prev().children().val(cr_array[cr_index]["business_no"]);
            $(this).val(cr_array[cr_index]["money"]);
            cr_index += 1;
        });

        // 如果已保存过则将li标签设为已保存状态的颜色，已提交过同上
        let now_active_li = $("li.active[id^=coursevli]");
        if (confirmed || saved) {
            now_active_li.attr("onclick", "coursevLiChange(this, true)");
            $("#coursev_select").attr("disabled", true);
            // 初始化为saved
            let li_color = "#5bc0de";
            if (confirmed) {
                li_color = "#5cb85c";
            }
            now_active_li.children().css("color", li_color);
        }
    }

    if (!data) return;
    if (isFromButton) {
        removeAllError();
        let nowTotalScore = 60,
            totalScore = scores.first + scores.second,
            score = now_period === 1 ? scores.first : scores.second;
        showScoreEm(score, nowTotalScore, totalScore);
    }
    padding();
}

//==================================事件控制==================================//
/**
 * 事件绑定
 */
function vBind() {
    function map_answer() {
        spanStatusCtr(true, true, "submit_status_span");
        let info_key = "ledger_infos_" + now_period,
            ledger_infos_tmp = answer_infos[info_key];
        vPaddingData(ledger_infos_tmp[now_subject], true);
    }

    bind_confirm_info("submit_ledger_info");
    bind_save_info(submit_ledger_info);
    bindAnswerSource("", map_ledger_info, map_answer);
    let $creatId1 = $("#createNewTableLeft"),
        $creatId2 = $("#createNewTableRight");
    $creatId1.click(function () {
        v_createNewPage($creatId1, "left");
    });
    $creatId2.click(function () {
        v_createNewPage($creatId2, "right");
    });
    $("button[data-change-period]").click(function () {
        changePeriod();
    });
}

/**
 * 科目改变事件
 * @param obj
 */
function subject_change(obj) {
    now_subject = $(obj).val();
    $("li.active[role=presentation]").children().text(now_subject);
}

/**
 * 账户会计期间切换
 */
function changePeriod() {
    let text = $("#ledgerPeriod").text();
    text = text[text.length - 1] === "一" ? "当前期间：期间二" : "当前期间：期间一";
    $("#ledgerPeriod").text(text);
    now_period = now_period === 1 ? 2 : 1;
    initLi();
}

/**
 * Li标签的初始化
 * @param data
 */
function initLi(data) {
    pageNum = 0;
    $("li[id^=coursevli]").remove();
    $("#TTablePage").children().remove();

    if (!ledger_infos && !first) return;
    // if (!data) return;

    let info_key = "ledger_infos_" + now_period,
        confirmed_key = "ledger" + now_period + "_confirm",
        saved_key = "ledger" + now_period + "_saved";
    if (data && (!(data["ledger_infos"]) || !data["ledger_saved"])) return;

    let ledger_infos_tmp = data ? data["ledger_infos"][info_key] : ledger_infos[info_key],
        ledger_confirmed_tmp = data ? data["ledger_confirmed"][confirmed_key] : ledger_confirmed[confirmed_key],
        ledger_saved_tmp = data ? data["ledger_saved"][saved_key] : ledger_saved[saved_key];

    // 创建已保存或已提交的标签
    for (let key in ledger_infos_tmp) {
        if (!ledger_infos_tmp.hasOwnProperty(key)) continue;
        let confirmed = ledger_confirmed_tmp.indexOf(key) !== -1,
            saved = ledger_saved_tmp.indexOf(key) !== -1;
        let li_color = "#337ab7";
        if (confirmed || saved) {
            li_color = confirmed ? "#5cb85c" : "#5bc0de";
        }
        let lcr = "left";
        let subject = key;
        if (!ledger_infos_tmp[key]["is_left"]) {
            lcr = "right";
        }
        let coursevli_id = "coursevli_" + lcr + pageNum;
        $("#coursev_li_new").before(
            "<li role='presentation' class='active' onclick='coursevLiChange(this, true)' id='" + coursevli_id + "'>" +
            "<a style='color: " + li_color + "'>" + subject + "</a></li>"
        );
        pageNum++;
    }
    // 点击第一个标签
    let coursevli_list = $("li[id^=coursevli]");
    let coursevli_list_len = $(coursevli_list).length;
    if (coursevli_list_len) {
        //  不为空则点击第一个标签
        let last_li = $(coursevli_list[0]);
        coursevLiChange(last_li);
    }
}

/**
 * li改变事件
 * @param obj
 * @param role
 */
function coursevLiChange(obj, role = false) {
    let key = "involve_subjects_" + now_period,
        involve_subjects_tmp = involve_subjects[key];
    involve_subjects_len = involve_subjects_tmp.length;
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
        $.each(involve_subjects_tmp, function (index, item) {
            // 当前li_list不存在对应subject
            if (li_subject_list.indexOf(item) === -1) {
                if (!first_option) {
                    first_option = item;
                    now_subject = item;
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
    }
    get_ledger_info(false, now_li_subject);
}

/**
 * 删除Table和对应li标签
 * @param obj
 */
function deleteTableV(obj) {

    let confirmed_key = "ledger" + now_period + "_confirm",
        saved_key = "ledger" + now_period + "_saved",
        ledger_confirmed_tmp = ledger_confirmed[confirmed_key],
        ledger_saved_tmp = ledger_saved[saved_key],
        subject = $("li[id^=coursevli][class=active]").children().text();

    if (ledger_confirmed_tmp && ledger_confirmed_tmp.length > 0 && ledger_confirmed_tmp.indexOf(subject) !== -1) {
        show_message("course_v_message", "已经提交过, 不可删除", "danger", 1000, "删除失败！");
        return;
    }
    if (ledger_confirmed_tmp && ledger_saved_tmp.length > 0 && ledger_saved_tmp.indexOf(subject) !== -1) {
        //  如果已保存才向后台发送删除请求
        delete_ledger_info(subject);
    }
    show_message("course_v_message", "删除成功！", "info", 1000);
    // 删除li标签
    $("li[id^=coursevli][class=active]").remove();
    // 删除Table
    $(obj).parent().parent().remove();
    // 点击li最后一个标签，防止当前页空白
    let coursevli_list = $("li[id^=coursevli]"),
        coursevli_list_len = $(coursevli_list).length;
    if (coursevli_list_len) {
        let last_li = $(coursevli_list[coursevli_list_len - 1]);
        coursevLiChange(last_li);
    }
}

/*
 * @ # coursev ? 表格增加行
 */
function v_AddLeftRow(obj, pm, business_no = "", money = "") {
    let is_dr = "dr";
    if (!pm) {
        is_dr = "cr";
    }
    $(obj).parent().parent().parent().after(
        "<tr><td><div class='acc-minus'>"
        + "<a type='button' "
        + "class='btn' onclick='v_DeleteRowT(this)'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>" + "</td>"
        + "<td><input class='acc-left' title='业务编号' onkeyup='limit_number(this)' name='business_no' value='" + business_no
        + "' placeholder='0'></td>"
        + "<td><input class='acc-left' title='金额 ' onchange='RealNumber(this)' onfocus='removeError(this)' name='" + is_dr + "' value='" + money + "'"
        + " placeholder='0'></td></tr>");
}

function v_AddRightRow(obj, pm, business_no = "", money = "") {
    let is_dr = "dr";
    if (!pm) {
        is_dr = "cr";
    }
    $(obj).parent().parent().parent().after(
        "<tr>"
        + "<td><input class='acc-right' onkeyup='limit_number(this)' title='业务编号' name='business_no' value='" + business_no
        + "' placeholder='0'></td>"
        + "<td><input class='acc-right' onchange='RealNumber(this)' onfocus='removeError(this)' title='金额 ' name='" + is_dr + "' value='" + money + "'"
        + " name='" + is_dr + "' placeholder='0'></td>"
        + "<td>" + "<div class='acc-minus'>"
        + "<a "
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
        '        <div class="acc-right">' +
        '           <button type="button"' +
        '               class="btn acc-btn-delete" onclick="deleteTableV(this)" data-toggle="tooltip" data-placement="left" title="删除账户"><span class="glyphicon glyphicon-remove"></span></button>' +
        '        </div>' +
        '        <div align="center">' +
        '            <table class="table table-bordered acc-unborder">' +
        '                <tbody>' +
        '                <tr class="acc-table-format-5-1">' +
        '                    <th class="acc-center acc-unborder">借方</th>' +
        '                    <th class="acc-center acc-unborder">' +
        '                    <select id="coursev_select" class="form-control pull-right" onchange="subject_change(this)">' +
        '                    </select></th>' +
        '                    <th class="acc-center acc-unborder">贷方</th>' +
        '                </tr>' +
        '                </tbody>' +
        '            </table>' +
        '            <table class="table table-bordered acc-unborder">' +
        '                <tbody>' +
        '                <tr>' +
        '                    <td style="width: 50%; border-left: 0">' +
        '                        <div class="acc-right">' +
        '                            <table class="acc-ttable">' +
        '                                <tbody>' +
        '                                <tr class="acc-table-format-5-2">' +
        '                                    <td></td>' +
        '                                    <td>业务编号</td>' +
        '                                    <td>金额</td>' +
        '                                </tr>' +
        '                                <tr class="acc-table-format-5-2">' +
        '                                    <td>' +
        '                                        <div class="acc-plus"><a id="v_AddRowDr" type="button"' +
        '                                                             class="btn"' +
        '                                                             onclick="v_AddLeftRow(this, true)"><span' +
        '                                                class="glyphicon glyphicon-plus-sign"></span></a></div>' +
        '                                    </td>' +
        '                                    <th>期初余额</th>' +
        '                                    <td><input name="opening_balance" placeholder="0" onchange="RealNumber(this)" onfocus="removeError(this)"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0">' +
        '                        <div class="acc-left">' +
        '                            <table id="ttable-01" class="acc-ttable">' +
        '                                <tbody>' +
        '                                <tr class="acc-table-format-5-3">' +
        '                                    <td>业务编号</td>' +
        '                                    <td>金额</td>' +
        '                                    <td>' +
        '                                        <div class="acc-plus"><a id="v_AddRowCr" type="button"' +
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
        '                        <div class="acc-right">' +
        '                            <table class="acc-ttable">' +
        '                                <tbody>' +
        '                                <tr class="acc-table-format-5-2">' +
        '                                    <td></td>' +
        '                                    <th>本期发生额</th>' +
        '                                    <td><input onchange="RealNumber(this)" onfocus="removeError(this)" name="current_amount_dr"  placeholder="0"></td>' +
        '                                </tr>' +
        '                                <tr class="acc-table-format-5-2">' +
        '                                    <td></td>' +
        '                                    <th>期末余额</th>' +
        '                                    <td><input onchange="RealNumber(this)" onfocus="removeError(this)" name="ending_balance" placeholder="0"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0; border-bottom: 0">' +
        '                        <div class="acc-left">' +
        '                            <table class="acc-ttable">' +
        '                                <tbody>' +
        '                                <tr class="acc-table-format-5-3">' +
        '                                    <th>本期发生额</th>' +
        '                                    <td><input onchange="RealNumber(this)" onfocus="removeError(this)" class="acc-right" name="current_amount_cr" placeholder="0"></td>' +
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
    $("#ttableLeft").find("button[data-toggle]").tooltip();
}

/**
 * 增加右T表
 */
function tTableAppendRight() {
    let content = '' +
        '    <div role="tabpanel" class="" id="ttableRight">' +
        '        <div class="acc-right">' +
        '           <button type="button"' +
        '               class="btn acc-btn-delete" onclick="deleteTableV(this)" data-toggle="tooltip" data-placement="left" title="删除账户"><span class="glyphicon glyphicon-remove"></span></button>' +
        '        </div>' +
        '        <div align="center">' +
        '            <table class="table table-bordered acc-unborder">' +
        '                <tbody>' +
        '                <tr class="acc-table-format-5-1">' +
        '                    <th class="acc-center acc-unborder">借方</th>' +
        '                    <th class="acc-center acc-unborder"><select id="coursev_select" class="form-control pull-right"' +
        '                                                              onchange="subject_change(this)">' +
        '                    </select></th>' +
        '                    <th class="acc-center acc-unborder">贷方</th>' +
        '                </tr>' +
        '                </tbody>' +
        '            </table>' +
        '            <table class="table table-bordered acc-unborder">' +
        '                <tbody>' +
        '                <tr>' +
        '                    <td style="width: 50%; border-left: 0">' +
        '                        <div class="acc-right">' +
        '                            <table class="acc-ttable">' +
        '                                <tbody>' +
        '                                <tr class="acc-table-format-5-2">' +
        '                                    <td>' +
        '                                        <div class="acc-plus"><a id="v_AddRowDr" type="button"' +
        '                                                             class="btn" onclick="v_AddLeftRow(this,true)"><span' +
        '                                                class="glyphicon glyphicon-plus-sign"></span></a></div>' +
        '                                    </td>' +
        '                                    <td>业务编号</td>' +
        '                                    <td>金额</td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0">' +
        '                        <div class="acc-left">' +
        '                            <table id="ttable-01" class="acc-ttable">' +
        '                                <tbody>' +
        '                                <tr class="acc-table-format-5-3">' +
        '                                    <td>业务编号</td>' +
        '                                    <td>金额</td>' +
        '                                    <td></td>' +
        '                                </tr>' +
        '                                <tr class="acc-table-format-5-3">' +
        '                                    <th>期初余额</th>' +
        '                                    <td><input onchange="RealNumber(this)" onfocus="removeError(this)" class="acc-right" name="opening_balance" placeholder="0"></td>' +
        '                                    <td>' +
        '                                        <div class="acc-plus"><a id="v_AddRowCr" type="button"' +
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
        '                        <div class="acc-right">' +
        '                            <table class="acc-ttable">' +
        '                                <tbody>' +
        '                                <tr class="acc-table-format-5-2">' +
        '                                    <td></td>' +
        '                                    <th>本期发生额</th>' +
        '                                    <td><input onchange="RealNumber(this)" onfocus="removeError(this)" name="current_amount_dr" placeholder="0"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0; border-bottom: 0">' +
        '                        <divclass="acc-left">' +
        '                            <table class="acc-ttable">' +
        '                                <tbody>' +
        '                                <tr class="acc-table-format-5-3">' +
        '                                    <th>本期发生额</th>' +
        '                                    <td><input onchange="RealNumber(this)" onfocus="removeError(this)" class="acc-right" name="current_amount_cr" placeholder="0"></td>' +
        '                                    <td></td>' +
        '                                </tr>' +
        '                                <tr class="acc-table-format-5-3">' +
        '                                    <th>期末余额</th>' +
        '                                    <td><input onchange="RealNumber(this)" onfocus="removeError(this)" class="acc-right" name="ending_balance"  placeholder="0"></td>' +
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
    $("#ttableRight").find("button[data-toggle]").tooltip();
}

function v_createNewPage(obj, lcr) {
    let ledgerNum = $("li[id^=coursevli]").length;
    if (involve_subjects_len && ledgerNum >= involve_subjects_len) {
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