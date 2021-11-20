let subsidiary_account_infos = "",
    subsidiary_account_confirmed = Array(),
    subsidiary_account_saved = Array(),
    involve_subjects = Array(),
    permission = 0,
    period1Vii1Row = 2, period2Vii1Row = 2,
    acc_balance_sheet_infos = "",
    acc_balance_sheet_confirmed = "",
    acc_balance_sheet_saved = "",
    vii2Row = 2,
    answer_infos1 = "", answer_infos2 = "",
    scores1 = "", scores2 = "";
$(document).ready(function () {
    function init() {
        viiBind();
        get_involve_subjects();
    }

    init();
});

/**
 * 获取获取科目列表
 */
function get_involve_subjects() {
    function successFunc(data) {
        involve_subjects = data["involve_subjects"]["involve_subjects_2"];
        let firstOption = true;

        $.each(involve_subjects, function (index, item) {
            $("#subjectSelect").append("<option>" + item + "</option>");
            if (firstOption) {
                $("#subjectSelect").val(item);
                firstOption = false;
            }
        });
        get_subsidiary_account_info(true);
        get_acc_balance_sheet_info(true);
    }

    // 获取数据
    get_info({}, "/get_business_list", successFunc, "");
}

//==================================提交会计明细账信息==================================//
/**
 * 提交会计明细账信息
 * @param submit_type confirm or save
 */
function submit_subsidiary_account_info(submit_type) {

    let data = vii1GetInput();
    data["submit_type"] = submit_type;
    data = JSON.stringify(data);
    // 提交数据
    let url = "/submit_subsidiary_account_info",
        messageDivID = "course_vii1_message",
        successFunc = get_subsidiary_account_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

//==================================获取会计明细账信息==================================//
/**
 * 从后端获取会计明细账信息
 */
function get_subsidiary_account_info(isFromSubmit = false) {

    // 重置信息
    vii1ResetInfo();
    let subject = $("#subjectSelect").val();
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!subsidiary_account_saved.length || subsidiary_account_saved.indexOf(subject) === -1)
            //  若未保存，则不向后台请求数据
            return;
    }
    // 若请求的科目已经确认提交过，则不再发送数据请求
    if (subsidiary_account_confirmed && subsidiary_account_confirmed.indexOf(subject) !== -1) {
        map_subsidiary_account_info();
        return;
    }

    // 获取数据
    let url = "/get_subsidiary_account_info",
        successFunc = map_subsidiary_account_info,
        messageDivID = "course_vii1_message";
    get_info({}, url, successFunc, messageDivID);

}

//==================================将会计明细账信息映射到前端==================================//
/**
 * 将数据映射到前端
 */
function map_subsidiary_account_info(data, isFromButton) {
    data = data ? data : "";
    subsidiary_account_infos = data ? data["subsidiary_account_infos"] : subsidiary_account_infos;
    subsidiary_account_confirmed = data ? data["subsidiary_account_confirmed"] : subsidiary_account_confirmed;
    subsidiary_account_saved = data ? data["subsidiary_account_saved"] : subsidiary_account_saved;
    answer_infos1 = data ? data["answer_infos"] : answer_infos1;
    scores1 = data ? data["scores"] : scores1;

    let $subjectSelect = $("#subjectSelect"),
        subject = $subjectSelect.val();
    if (involve_subjects.indexOf(subject) === -1 || !subsidiary_account_infos) {
        return;
    }

    // option颜色控制
    let nowSubject = $subjectSelect.val();
    if (subsidiary_account_saved || subsidiary_account_confirmed) {
        let $options = $subjectSelect.children();
        $.each($options, function (index, item) {
            let $item = $(item),
                optionValue = $item.val(),
                color = "#555";
            if (subsidiary_account_confirmed && subsidiary_account_confirmed.indexOf(optionValue) !== -1) {
                color = "#5cb85c";
            } else if (subsidiary_account_saved && subsidiary_account_saved.indexOf(optionValue) !== -1) {
                color = "#5bc0de";
            }
            $item.css("color", color);
            if (optionValue === nowSubject) $subjectSelect.css("color", color);
        });
    } else return;

    let confirmed = false,
        saved = false;

    $.each(subsidiary_account_saved, function (index, item) {
        saved = subsidiary_account_saved.indexOf(item) === -1;
    });
    $.each(subsidiary_account_confirmed, function (index, item) {
        confirmed = subsidiary_account_confirmed.indexOf(item) === -1;
    });
    if (answer_infos1) {
        let $answer = $("button[data-answer-1]");
        showAnswerButton($answer);
        confirmed = true;
        saved = true;
        isFromButton = 1;
        $answer.text("查看答案");
    }
    // `完成状态`标签控制
    spanStatusCtr(confirmed, saved, "subsidiary_account_submit_span");

    if (!subsidiary_account_infos) return;

    let subsidiary_account_info = subsidiary_account_infos[subject];
    // 填充会计明细账信息
    if (!subsidiary_account_info) {
        // 明细账信息为空则返回
        return;
    }
    vii1PaddingData(subsidiary_account_infos, isFromButton);
}

//==================================提交科目余额表信息==================================//
/**
 * 提交科目余额表信息
 * @param submit_type confirm or save
 */
function submit_acc_balance_sheet_info(submit_type) {
    let data = vii2GetInput();
    data["submit_type"] = submit_type;

    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_acc_balance_sheet_info",
        messageDivID = "course_vii2_message",
        successFunc = get_acc_balance_sheet_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

//==================================获取科目余额表信息==================================//
/**
 * 从后端获取科目余额表信息
 */
function get_acc_balance_sheet_info(isFromSubmit = false) {

    // 重置信息
    vii2ResetInfo();
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!acc_balance_sheet_saved)
            //  若未保存，则不向后台请求数据
            return;
    }
    // 若acc_balance_sheet_infos不为空且已经确认提交过，则不再发送数据请求
    if (acc_balance_sheet_confirmed) {
        map_acc_balance_sheet_info();
        return;
    }

    //  获取数据
    let data = {},
        url = "/get_acc_balance_sheet_info",
        successFunc = map_acc_balance_sheet_info,
        messageDivID = "course_vii2_message";
    get_info(data, url, successFunc, messageDivID);

}

//==================================将科目余额表信息映射到前端==================================//
/**
 * 将数据映射到前端
 */
function map_acc_balance_sheet_info(data, isFromButton) {
    data = data ? data : "";
    acc_balance_sheet_infos = data ? data["acc_balance_sheet_infos"] : acc_balance_sheet_infos;
    acc_balance_sheet_confirmed = data ? data["acc_balance_sheet_confirmed"] : acc_balance_sheet_confirmed;
    acc_balance_sheet_saved = data ? data["acc_balance_sheet_infos"] : acc_balance_sheet_saved;
    answer_infos2 = data ? data["answer_infos"] : answer_infos2;
    scores2 = data ? data["scores"] : scores2;
    permission = data ? data["permission"] : permission;

    //填充团队题目
    if (!permission) {
        $("#selfQuestion").html("登记各账户明细账");
    }
    if (permission) {
        $("#selfQuestion").html("登记科目余额表");
    }

    if (answer_infos2) {
        let $answer = $("button[data-answer-2]");
        showAnswerButton($answer);
        isFromButton = 1;
        $answer.text("查看答案");
    }
    // `完成状态`标签控制
    spanStatusCtr(acc_balance_sheet_confirmed, acc_balance_sheet_saved, "acc_balance_sheet_submit_span");

    if (!acc_balance_sheet_infos) return;
    vii2PaddingData(acc_balance_sheet_infos, isFromButton);
}

// ===============================获取和填充数据===============================//
/**
 * 获取数据
 * @returns {Object}
 */
function vii1GetInput() {
    // 获取明细账数据
    let subject = $("#subjectSelect").val(),
        subsidiary_account_info = Array(),
        year = $("#yearNow").val(),
        data;
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
            balance_money += $(thisInput[index]).val();
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

    data = {
        "subsidiary_account_info": subsidiary_account_info,
        "subject": subject,
    };

    return data;
}

/**
 * 填充数据
 * @param data
 * @param isFromButton
 */
function vii1PaddingData(data, isFromButton) {
    function padding() {
        // 填充明细账数据
        let infos = data;
        // 添加行
        let firstPeriod = true;
        for (let i = 1; i < infos.length - 2; i++) {
            if (infos.length === 4) break;
            // console.log("i: " + i + "  firstPeriod: " + firstPeriod);
            // console.log("infos[i][\"summary\"]: " + infos[i]["summary"]);
            if (firstPeriod && infos[i]["summary"] === "本期合计") {
                firstPeriod = false;
                continue;
            }
            if (firstPeriod) vii1_AddRow(true);
            else vii1_AddRow(false);
        }
        // 填充信息
        let infoIndex = 0,
            firstRow = true;
        $("[id^=period1Vii1Row], [id^=period2Vii1Row], [id=Vii1RowEnd]").each(function () {
            //console.log(infoIndex);
            let thisInputs = $(this).find("input"),
                info = infos[infoIndex],
                word = info["word"],
                no = info["no"],
                summary = info["summary"],
                dr_money = info["dr_money"],
                orientation = info["orientation"],
                cr_money = info["cr_money"],
                balance_money = info["balance_money"],
                date = info["date"];
            date = date ? date : "2020--";
            date = date.split("-");
            let year = date[0];
            if (firstRow) {
                let dateTmp = new Date();
                year = year ? year : dateTmp.getFullYear();
                $("#yearNow").val(year);
                firstRow = false;
            }
            let month = date[1],
                day = date[2],
                prefix = "0000000000";
            dr_money = dr_money ? dr_money * 1000 / 10 : dr_money;
            cr_money = cr_money ? cr_money * 1000 / 10 : cr_money;
            balance_money = balance_money ? balance_money * 1000 / 10 : balance_money;
            dr_money = parseInt(dr_money);
            cr_money = parseInt(cr_money);
            balance_money = parseInt(balance_money);
            dr_money = dr_money ? dr_money.toString() : dr_money;
            cr_money = cr_money ? cr_money.toString() : cr_money;
            balance_money = balance_money ? balance_money.toString() : balance_money;
            dr_money = dr_money ? prefix.substring(0, 10 - dr_money.length) + dr_money : dr_money;
            cr_money = cr_money ? prefix.substring(0, 10 - cr_money.length) + cr_money : cr_money;
            balance_money = balance_money ? prefix.substring(0, 10 - balance_money.length) + balance_money : balance_money;
            let money = dr_money ? dr_money : prefix;
            money += cr_money ? cr_money : prefix;
            money += orientation ? orientation : "0";
            money += balance_money ? balance_money : prefix;
            let firstNum = true;
            if (isFromButton !== 2) {
                $(thisInputs[0]).val(month);
                $(thisInputs[1]).val(day);
                $(thisInputs[2]).val(word);
                $(thisInputs[3]).val(no);
                $(thisInputs[4]).val(summary);
            }
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

    if (!data) return;
    let subject = $("#subjectSelect").val();
    data = data[subject];
    if (isFromButton) {
        removeAllError();
        let nowTotalScore = 60,
            totalScore = 100;
        showScoreEm(scores1, nowTotalScore, scores1, 1, 1);
        vii1ResetInfo();
    }
    padding();
}

/**
 * 获取数据
 * @returns {Object}
 */
function vii2GetInput() {
    // 获取科目余额表数据
    let acc_balance_sheet_infos = Array(),
        data;

    $("[id^=vii2Row]").each(function () {
        let $this = $(this),
            $thisInputs = $this.find("input"),
            subject = $this.attr("id") === "vii2RowLast" ? "sum" : $($thisInputs[0]).val(),
            keys = ["borrow_1", "lend_1", "borrow_2", "lend_2", "borrow_3", "lend_3"],
            content = Object(), index = 0;

        content["subject"] = subject;
        $thisInputs.each(function (t_index, item) {
            let $item = $(item),
                value = $item.val();
            if (subject !== "sum" || t_index != 0) {
                content[keys[index]] = parseFloat(value);
                if (t_index !== 0) index++;
            } else content[keys[index++]] = parseFloat(value);
        });
        acc_balance_sheet_infos.push(content);
    });

    data = {"acc_balance_sheet_infos": acc_balance_sheet_infos};
    return data;
}

/**
 * 填充数据
 * @param data
 * @param isFromButton
 */
function vii2PaddingData(data, isFromButton) {
    function padding() {
        // 填充科目余额表数据
        let info = data,
            info_cp = "",
            error_pos = Array();
        // 创建行
        for (let i = 0; i < info.length - 2; i++) vii2_AddRow();
        if (isFromButton === 1)
            info_cp = answer_infos2;
        // 填充数据
        let index = 0;
        $("[id^=vii2Row]").each(function () {
            let $this = $(this),
                t_info_cp = "",  // 答案的行
                $thisInputs = $this.find("input"),
                $thisInputs0 = $($thisInputs[0]),
                keys = ["borrow_1", "lend_1", "borrow_2", "lend_2", "borrow_3", "lend_3"],
                subject = info[index]["subject"],
                inputIndex = 0;
            if (subject !== "sum") $thisInputs0.val(subject);

            if (isFromButton === 1) {
                for (let i = 0; i < info_cp.length; i++) {
                    if (subject === info_cp[i]["subject"]) {
                        t_info_cp = info_cp[i];
                        break;
                    }
                }
                if (!t_info_cp) error_pos.push($thisInputs0);
            }

            $thisInputs.each(function (t_index, item) {
                let $item = $(item),
                    value = info[index][keys[inputIndex]],
                    value_cp = t_info_cp ? t_info_cp[keys[inputIndex]] : "";
                value = value ? value : 0;
                if (subject === "sum" && t_index === 0) {
                    $item.val(value);
                    if (value_cp != value) error_pos.push($item);
                    //if (value_cp == 0 && !value) error_pos.pop();
                    inputIndex++;
                } else if (t_index !== 0) {
                    $item.val(value);
                    if (t_info_cp) {
                        if (value_cp != value) error_pos.push($item);
                        //if (value_cp == 0 && !value) error_pos.pop();
                    } else if (isFromButton === 1 && !t_info_cp) error_pos.push($item);
                    inputIndex++;
                }
            });
            index++;
        });
    }

    if (!data) return;
    if (isFromButton) {
        removeAllError();
        vii2ResetInfo();
        let nowTotalScore = 40,
            totalScore = 100;
        showScoreEm(scores2, nowTotalScore, scores2, 2, 2);
    }
    padding();
}

// ==================================事件控制==================================//
/**
 * 事件绑定
 */
function viiBind() {
    function map_answer1() {
        spanStatusCtr(true, true, "subsidiary_account_submit_span");
        vii1PaddingData(answer_infos1, 2);
    }

    function map_answer2() {
        spanStatusCtr(true, true, "acc_balance_sheet_submit_span");
        vii2PaddingData(answer_infos2, 2);
    }

    bind_confirm_info("submit_subsidiary_account_info", $("button[data-confirm-1]"));
    bind_save_info(submit_subsidiary_account_info, $("button[data-save-1]"));

    bind_confirm_info("submit_acc_balance_sheet_info", $("button[data-confirm-2]"));
    bind_save_info(submit_acc_balance_sheet_info, $("button[data-save-2]"));

    bindAnswerSource($("button[data-answer-1]"), map_subsidiary_account_info, map_answer1);
    bindAnswerSource($("button[data-answer-2]"), map_acc_balance_sheet_info, map_answer2);
    bindIllegalCharFilter();
    bindRealNumber();
    bindLimitNumber();
    bindLimitJieDai();
    $("a[data-vii1-addRow-1]").click(function () {
        vii1_AddRow(true);
    });
    $("a[data-vii1-addRow-2]").click(function () {
        vii1_AddRow(false);
    });
    $("a[data-vii2-addRow]").click(function () {
        vii2_AddRow();
    });
    $("select[data-get-account-info]").change(function () {
        get_subsidiary_account_info();
    });
}

/**
 * 重置明细账信息
 */
function vii1ResetInfo() {
    period1Vii1Row = 2;
    period2Vii1Row = 2;
    $("[id^=period1Vii1Row][id!=Vii1RowEnd][id!=period1Vii1Row1][id!=period1Vii1RowLast]").remove();
    $("[id^=period2Vii1Row][id!=Vii1RowEnd][id!=period2Vii1RowLast]").remove();
    $("#subjectSelect").css("color", "#555");
    $("#first").find("input").each(function () {
        let thisValue = $(this).val();
        if (["期初余额", "本期合计", "本年累计"].indexOf(thisValue) === -1) {
            $(this).val("");
        }
    });
    let dateTmp = new Date(),
        year = dateTmp.getFullYear();
    $("#yearNow").val(year);
}

/**
 * 重置科目余额表信息
 */
function vii2ResetInfo() {
    vii2Row = 2;
    $("[id^=vii2Row][id!=vii2Row1][id!=vii2RowLast]").remove();
    $("#second").find("input").val("");
}

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
        + "<td><label><input name='month' title='月' onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input name='day' title='日' onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input name='word' title='字' data-illegal-char></label></td>"
        + "<td><label><input name='no' title='号'onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input name='summary' onkeyup='illegalCharFilter(this)'></label></td>"
        + "<td colspan='10' id='borrow" + now_id + "' style='display: none;'  ></td>"
        + "<td class='borrow" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='borrow" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='borrow" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='borrow" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='borrow" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='borrow" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='borrow" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='borrow" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='borrow" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='borrow" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td colspan='10' id='lend" + now_id + "' style='display: none;' ></td>"
        + "<td class='lend" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='lend" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='lend" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='lend" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='lend" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='lend" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='lend" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='lend" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='lend" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='lend" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"

        + "<td ><label><input name='orientation' onkeyup='limitJieDai(this)'></label></td>"
        + "<td colspan='10' id='balance" + now_id + "' style='display: none;' ></td>"
        + "<td class='balance" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='balance" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='balance" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='balance" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='balance" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='balance" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='balance" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='balance" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='balance" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td class='balance" + now_id + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"

        + "<td class='acc-unborder'>"
        + "<div class='acc-minus'>"
        + "<a type='button' "
        + "class='btn' onclick='vii1_DeleteRow(this)' data-toggle='tooltip' data-placement='left' title='删除行'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>"
        + "</td>"
        + "</tr>"
    );
    let $nowid = $("#" + now_id);
    $nowid.find("a[data-toggle]").tooltip();
}


/*
 * @ # coursevii1 ->账户明细表 ? 表格删除行
 */
function vii1_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}

/*
 * @ # coursevii2 -> 科目余额表 ? 表格增加行
 */
function vii2_AddRow() {
    let now_id = "vii2Row" + vii2Row;
    $("#vii2RowLast").before(
        "<tr id='" + now_id + "'>" +
        "<td><label><input name='subject' title='科目' onkeyup='illegalCharFilter(this)'></label></td>" +
        "<td><label><input name='borrow_1' title='金额￥' " +
        "></label></td>" +
        "<td><label><input name='lend_1' title='金额￥' " +
        "></label></td>" +
        "<td><label><input name='borrow_2' title='金额￥' " +
        "></label></td>" +
        "<td><label><input name='lend_2' title='金额￥' " +
        "></label></td>" +
        "<td><label><input name='borrow_3' title='金额￥' " +
        "></label></td>" +
        "<td><label><input name='lend_3' title='金额￥' " +
        "></label></td>"
        + "<td class='acc-unborder'>"
        + "<div class='acc-minus'> "
        + "<a type='button' class='btn' onclick='vii2_DeleteRow(this)' data-toggle='tooltip' data-placement='left' title='删除行'>"
        + "<span class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div> "
        + "</td> "
        + "</tr>"
    );
    let $nowid = $("#" + now_id);
    bindRealNumber($nowid.find("input[name!=subject]"));
    $nowid.find("a[data-toggle]").tooltip();
    vii2Row++;
}


/*
 * @ # coursevii2 -> 科目余额表 ? 表格删除行
 */
function vii2_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}