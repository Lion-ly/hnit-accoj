let ixFirst_infos, // 保存本次课程全部信息，减少后端数据请求次数
    ixFirst_confirmed,
    ixFirst_saved,
    ixSecond_infos,
    ixSecond_confirmed,
    ixSecond_saved,
    firstChange = true,
    permission = Object(),
    periodEndData = Object(),
    periodLastData = Object(),
    answer_infos1 = "",
    answer_infos2 = "",
    scores1 = 0,
    scores2 = 0,
    teacher_scores1 = 0,
    teacher_scores2 = 0;


$(document).ready(function () {
    function init() {
        ixBind();
        get_ixFirst_info(true);
        get_ixSecond_info(true);
    }

    init();
});

//======================================提交资产负债表信息======================================//
/**
 * 提交资产负债表信息
 * @param submit_type confirm or save
 */
function submit_ixFirst_info(submit_type) {
    // 获取用户输入
    let data = ixGetInput(true);
    data["submit_type"] = submit_type;
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_ix_first_info",
        messageDivID = "course_ix1_message",
        successFunc = get_ixFirst_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

//======================================获取资产负债表信息======================================//
/**
 * 从后端获取资产负债表信息
 */
function get_ixFirst_info(isFromSubmit = false) {

    // 重置信息
    ix1ResetInfo();
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!ixFirst_saved)
            //  若未保存，则不向后台请求数据
            return;
    }
    // 若ixFirst_infos不为空且已经确认提交过，则不再发送数据请求
    if (ixFirst_infos && ixFirst_confirmed) {
        map_ixFirst_info();
        return;
    }

    //  获取数据
    let data = {},
        url = "/get_ix_first_info",
        successFunc = map_ixFirst_info,
        messageDivID = "course_ix1_message";
    get_info(data, url, successFunc, messageDivID);

}

//==================================将资产负债表信息映射到前端==================================//
/**
 * 将数据映射到前端
 */
function map_ixFirst_info(data, isFromButton) {
    data = data ? data : "";
    ixFirst_infos = data ? data["ixFirst_infos"] : ixFirst_infos;
    ixFirst_confirmed = data ? data["confirm"]["first"] : ixFirst_confirmed;
    ixFirst_saved = data ? data["saved"]["first"] : ixFirst_saved;
    answer_infos1 = data ? data["answer_infos"] : answer_infos1;
    let scores = data ? data["scores"] : "";
    scores1 = scores ? scores["first"]["student_score"] : scores1;
    teacher_scores1 = scores ? scores["first"]["teacher_score"] : teacher_scores1;
    permission = data ? data["permission"] : permission;

    let selfQue = "无"
    //填充团队题目
    if (permission.first) {
        selfQue = "资产负债表"

    }
    if (permission.second) {
        selfQue += ",利润表"
    }
    $("#selfQuestion").html(selfQue);

    if (answer_infos1) {
        let $answer = $("button[data-answer-1]");
        showAnswerButton($answer);
        isFromButton = 1;
        $answer.text("查看答案");
    }
    // `完成状态`标签控制
    spanStatusCtr(ixFirst_confirmed, ixFirst_saved, "ixFirst_span");

    if (!ixFirst_infos) return;
    // 填充数据
    if (ixFirst_saved) IxPaddingData(ixFirst_infos, true, isFromButton);
}

//============================================提交利润表信息============================================//
/**
 * 提交利润表信息
 * @param submit_type confirm or save
 */
function submit_ixSecond_info(submit_type) {
    // 获取用户输入
    let data = ixGetInput(false);
    data["submit_type"] = submit_type;
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_ix_second_info",
        messageDivID = "course_ix2_message",
        successFunc = get_ixSecond_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

//============================================获取利润表信息============================================//
/**
 * 从后端获取利润表信息
 */
function get_ixSecond_info(isFromSubmit = false) {
    // 重置信息
    ix2ResetInfo();
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!ixSecond_saved)
            //  若未保存，则不向后台请求数据
            return;
    }
    // 若ixSecond_infos不为空且已经确认提交过，则不再发送数据请求
    if (ixSecond_infos && ixSecond_confirmed) {
        map_ixSecond_info();
        return;
    }

    //  获取数据
    let data = {},
        url = "/get_ix_second_info",
        successFunc = map_ixSecond_info,
        messageDivID = "course_ix2_message";
    get_info(data, url, successFunc, messageDivID);

}

//=======================================将利润表信息映射到前端=======================================//
/**
 * 将数据映射到前端
 */
function map_ixSecond_info(data, isFromButton) {

    data = data ? data : "";
    ixSecond_infos = data ? data["ixSecond_infos"] : ixSecond_infos;
    ixSecond_confirmed = data ? data["confirm"]["second"] : ixSecond_confirmed;
    ixSecond_saved = data ? data["saved"]["second"] : ixSecond_saved;
    answer_infos2 = data ? data["answer_infos"] : answer_infos2;
    let scores = data ? data["scores"] : "";
    scores2 = scores ? scores["second"]["student_score"] : scores2;
    teacher_scores2 = scores ? scores["second"]["teacher_score"] : teacher_scores2;

    if (answer_infos2) {
        let $answer = $("button[data-answer-2]");
        showAnswerButton($answer);
        isFromButton = 1;
        $answer.text("查看答案");
    }

    // `完成状态`标签控制
    spanStatusCtr(ixSecond_confirmed, ixSecond_saved, "ixSecond_span");

    if (!ixSecond_infos) return;
    // 填充数据
    if (ixSecond_saved) IxPaddingData(ixSecond_infos, false, isFromButton);
}

//===========================================获取和填充数据===========================================//
/**
 * 获取用户输入信息
 * @returns {Object}
 */
function ixGetInput(isFirst) {
    let divId = "ixFirst",
        infosName = "ixFirst_infos";
    if (!isFirst) {
        divId = "ixSecond";
        infosName = "ixSecond_infos";
    }
    let infos = Object(),
        flag = true,
        inputs = $("#" + divId).find("input");

    $.each(inputs, function (index, item) {
        let $item = $(item),
            project = $item.attr("name").replace(/End|Last/, ""),
            value = $item.val(),
            period = "period_end";
        if (!flag) period = "period_last";
        if (!infos.hasOwnProperty(project)) infos[project] = Object();
        infos[project][period] = parseFloat(value);
        infos[project][period] = parseFloat(value);
        flag = !flag;
    });
    infos["conclusion"] = $("#" + divId + "Conclusion").val();
    return {[infosName]: infos};
}

/**
 * 填充数据
 * @param data
 * @param isFirst
 * @param isFromButton
 */
function IxPaddingData(data, isFirst, isFromButton) {
    function padding() {
        data = isFirst ? data["new_balance_sheet_infos"] : data["profit_statement_infos"];
        let divID = isFirst ? "ixFirst" : "ixSecond",
            inputs = $("#" + divID).find("input"),
            flag = true;

        $.each(inputs, function (index, item) {
            let $item = $(item),
                name = $item.attr("name").replace(/End|Last/, ""),
                period = "period_end",
                percent = "";

            if (!flag) {
                period = "period_last";
                percent = "%"
            }
            if (data.hasOwnProperty(name)) {
                let value = data[name][period] ? data[name][period] + '' : "";
                //2021.6.10
                if (value.indexOf('%') == -1 && value !== '') {
                    value += percent
                }
                $item.val(value);
            }
            flag = !flag;
        });
        let conclusion = data["conclusion"];
        $("#" + divID + "Conclusion").val(conclusion);
    }

    if (!data) return;
    if (isFromButton) {
        removeAllError();
        let nowTotalScore = 20,
            totalScore = scores1 + scores2,
            scores = isFirst ? scores1 : scores2,
            nowNum = isFirst ? 1 : 2;
        showScoreEm(scores, nowTotalScore, totalScore, nowNum, nowNum);
        totalScore = teacher_scores1 + teacher_scores2,
            scores = isFirst ? teacher_scores1 : teacher_scores2,
            nowNum = isFirst ? 3 : 4;
        showScoreEm(scores, nowTotalScore, totalScore, nowNum, nowNum);
        if (isFromButton === 2) {
            if (isFirst) ix1ResetInfo();
            else ix2ResetInfo();
        }
    }
    padding();
}

//===============================================事件控制===============================================//
/**
 * 事件绑定
 */
function ixBind() {
    function map_answer1() {
        spanStatusCtr(true, true, "new_balance_sheet_span");
        IxPaddingData(answer_infos1, true, 2);
    }

    function map_answer2() {
        spanStatusCtr(true, true, "profit_statement_span");
        IxPaddingData(answer_infos2, false, 2);
    }

    bind_confirm_info("submit_ixFirst_info", $("button[data-confirm-1]"));
    bind_save_info(submit_ixFirst_info, $("button[data-save-1]"));

    bind_confirm_info("submit_ixSecond_info", $("button[data-confirm-2]"));
    bind_save_info(submit_ixSecond_info, $("button[data-save-2]"));

    bindAnswerSource($("button[data-answer-1]"), map_ixFirst_info, map_answer1);
    bindAnswerSource($("button[data-answer-2]"), map_ixSecond_info, map_answer2);

    let $inputs1 = $("#ixFirst").find("input[name!=score]"),
        $inputs2 = $("#ixSecond").find("input[name!=score]"),
        $conclusions = $("[id^=ix][id$=Conclusion]"),
        flag = true;

    $inputs1.each(function (index, item) {
        if (flag) bindRealNumber($(item));
        else bindLimitPercent($(item));
        flag = !flag;
    });
    flag = true;
    $inputs2.each(function (index, item) {
        $(item).blur(function () {
            eventChangeIx(item);
        });
        if (flag) bindRealNumber($(item));
        else bindLimitPercent($(item));
        flag = !flag;
    });

    bindIllegalCharFilter($conclusions);

    bind_score("teacher_correct1", "trend_analysis", "course_ix1_message_1", "first");
    bind_score("teacher_correct2", "trend_analysis", "course_ix1_message_2", "second");
}


/**
 * 资产负债表重置
 */
function ix1ResetInfo() {
    $("#ixFirst").find("input").val("");
}

/**
 * 利润表重置
 */
function ix2ResetInfo() {
    $("#ixSecond").find("input").val("");
}


/**
 * 用户输入数据改变事件响应函数
 * @param obj
 */
function eventChangeIx(obj) {
    let name = $(obj).attr("name"),
        isEnd = name.endsWith("End"),
        value = $(obj).val();
    //空白不作处理
    if (value === "") return;
    if (value === "格式错误") return;
    value = parseFloat(value);
    if (firstChange) {
        let Data = ixGetInput(false);
        Data = Data["ixSecond_infos"];
        for (let key in Data) {
            if (Data.hasOwnProperty(key)) {
                periodEndData[key] = isNaN(parseFloat(Data[key]["period_end"])) ? '' : parseFloat(Data[key]["period_end"]);
                periodLastData[key] = isNaN(parseFloat(Data[key]["period_last"])) ? '' : parseFloat(Data[key]["period_last"]);
            }

        }
        firstChange = false;
    }


    name = name.replace(/End|Last/, "");
    if (isEnd) {
        periodEndData[name] = value;
    } else {
        periodLastData[name] = value;
    }

    // 计算营业利润
    let inputName = isEnd ? "营业利润End" : "营业利润Last",
        data = isEnd ? periodEndData : periodLastData,
        result = 0;
    result += data.hasOwnProperty("营业收入") ? data["营业收入"] : result;
    result -= data.hasOwnProperty("营业成本") ? data["营业成本"] : result;
    result -= data.hasOwnProperty("税金及附加") ? data["税金及附加"] : result;
    result -= data.hasOwnProperty("销售费用") ? data["销售费用"] : result;
    result -= data.hasOwnProperty("管理费用") ? data["管理费用"] : result;
    result -= data.hasOwnProperty("财务费用") ? data["财务费用"] : result;
    result -= data.hasOwnProperty("资产减值损失") ? data["资产减值损失"] : result;
    result += data.hasOwnProperty("公允价值变动收益") ? data["公允价值变动收益"] : result;
    result += data.hasOwnProperty("投资收益") ? data["投资收益"] : result;
    if (isEnd) {
        periodEndData["营业利润"] = result;
        $("#ixSecond").find("input[name=" + inputName + "]").val(result);
    } else {
        periodLastData["营业利润"] = result;
        $("#ixSecond").find("input[name=" + inputName + "]").val(result + '%');
    }


    // 计算利润总额
    inputName = isEnd ? "利润总额End" : "利润总额Last";
    data = isEnd ? periodEndData : periodLastData;
    result = 0;
    result += data.hasOwnProperty("营业利润") ? data["营业利润"] : result;
    result += data.hasOwnProperty("营业外收入") ? data["营业外收入"] : result;
    result -= data.hasOwnProperty("营业外支出") ? data["营业外支出"] : result;
    if (isEnd) {
        periodEndData["利润总额"] = result;
        $("#ixSecond").find("input[name=" + inputName + "]").val(result);
    } else {
        periodLastData["利润总额"] = result;
        $("#ixSecond").find("input[name=" + inputName + "]").val(result + '%');
    }


    // 计算净利润
    inputName = isEnd ? "净利润End" : "净利润Last";
    data = isEnd ? periodEndData : periodLastData;
    result = 0;
    result += data.hasOwnProperty("利润总额") ? data["利润总额"] : result;
    result -= data.hasOwnProperty("所得税费用") ? data["所得税费用"] : result;
    if (isEnd) {
        $("#ixSecond").find("input[name=" + inputName + "]").val(result);

    } else {

        $("#ixSecond").find("input[name=" + inputName + "]").val(result + '%');
    }

}