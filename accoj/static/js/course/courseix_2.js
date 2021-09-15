let ix2First_infos,
    ix2First_confirmed,
    ix2First_saved;
let ix2Second_infos, // 保存本次课程全部信息，减少后端数据请求次数
    ix2Second_confirmed,
    ix2Second_saved;
let firstChange = true,
    periodEndData = Object(),
    periodLastData = Object(),
    permission = Object,
    answer_infos1 = "",
    answer_infos2 = "",
    scores1 = 0,
    scores2 = 0,
    teacher_scores1 = 0,
    teacher_scores2 = 0;

$(document).ready(function () {
    function init() {
        ix2Bind();
        get_ix2First_info(true);
        get_ix2Second_info(true);
    }

    init();
});

//======================================提交资产负债表信息======================================//
/**
 * 提交资产负债表信息
 * @param submit_type confirm or save
 */
function submit_ix2First_info(submit_type) {
    // 获取用户输入
    let data = ix2GetInput(true);
    data["submit_type"] = submit_type;
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_ix2_first_info",
        messageDivID = "course_ix21_message",
        successFunc = get_ix2First_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

//======================================获取资产负债表信息======================================//
/**
 * 从后端获取资产负债表信息
 */
function get_ix2First_info(isFromSubmit = false) {
    // 重置信息
    ix21ResetInfo();
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!ix2First_saved)
            //  若未保存，则不向后台请求数据
            return;
    }
    // 若ix2First_infos不为空且已经确认提交过，则不再发送数据请求
    if (ix2First_infos && ix2First_confirmed) {
        map_ix2First_info();
        return;
    }

    //  获取数据
    let data = {},
        url = "/get_ix2_first_info",
        successFunc = map_ix2First_info,
        messageDivID = "course_ix21_message";
    get_info(data, url, successFunc, messageDivID);

}

//==================================将资产负债表信息映射到前端==================================//
/**
 * 将数据映射到前端
 */
function map_ix2First_info(data, isFromButton) {

    data = data ? data : "";
    ix2First_infos = data ? data["ix2First_infos"] : ix2First_infos;
    ix2First_confirmed = data ? data["confirm"]["first"] : ix2First_confirmed;
    ix2First_saved = data ? data["saved"]["first"] : ix2First_saved;
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
    spanStatusCtr(ix2First_confirmed, ix2First_saved, "ix2First_span");

    if (!ix2First_infos) return;
    // 填充数据
    Ix2PaddingData(ix2First_infos, true, isFromButton);
}

//============================================提交利润表信息============================================//
/**
 * 提交利润表信息
 * @param submit_type confirm or save
 */
function submit_ix2Second_info(submit_type) {
    // 获取用户输入
    let data = ix2GetInput(false);
    data["submit_type"] = submit_type;
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_ix2_second_info",
        messageDivID = "course_ix22_message",
        successFunc = get_ix2Second_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

//============================================获取利润表信息============================================//
/**
 * 从后端获取利润表信息
 */
function get_ix2Second_info(isFromSubmit = false) {
    // 重置信息
    ix22ResetInfo();
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!ix2Second_saved)
            //  若未保存，则不向后台请求数据
            return;
    }
    // 若ix2Second_infos不为空且已经确认提交过，则不再发送数据请求
    if (ix2Second_infos && ix2Second_confirmed) {
        map_ix2Second_info();
        return;
    }

    //  获取数据
    let data = {},
        url = "/get_ix2_second_info",
        successFunc = map_ix2Second_info,
        messageDivID = "course_ix22_message";
    get_info(data, url, successFunc, messageDivID);

}

//=======================================将利润表信息映射到前端=======================================//
/**
 * 将数据映射到前端
 */
function map_ix2Second_info(data, isFromButton) {

    data = data ? data : "";
    ix2Second_infos = data ? data["ix2Second_infos"] : ix2Second_infos;
    ix2Second_confirmed = data ? data["confirm"]["second"] : ix2Second_confirmed;
    ix2Second_saved = data ? data["saved"]["second"] : ix2Second_saved;
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
    spanStatusCtr(ix2Second_confirmed, ix2Second_saved, "ix2Second_span");

    if (!ix2Second_infos) return;
    // 填充数据
    if (ix2Second_saved) Ix2PaddingData(ix2Second_infos, false, isFromButton);
}

//===========================================获取和填充数据===========================================//
/**
 * 获取用户输入信息
 * @returns {Object}
 */
function ix2GetInput(isFirst) {
    let divId = "ix2First",
        infosName = "ix2First_infos";
    if (!isFirst) {
        divId = "ix2Second";
        infosName = "ix2Second_infos";
    }
    let infos = Object(),
        flag = true,
        inputs = $("#" + divId).find("input");

    $.each(inputs, function (index, item) {
        let project = $(item).attr("name").replace(/End|Last/, ""),
            value = $(item).val(),
            period = "period_end";

        if (!flag) period = "period_last";
        if (!infos.hasOwnProperty(project)) infos[project] = Object();
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
function Ix2PaddingData(data, isFirst, isFromButton) {
    function padding() {
        data = isFirst ? data["new_balance_sheet_infos"] : data["profit_statement_infos"];
        let divID = isFirst ? "ix2First" : "ix2Second",
            inputs = $("#" + divID).find("input"),
            flag = true;

        $.each(inputs, function (index, item) {
            let $item = $(item),
                name = $item.attr("name").replace(/End|Last/, ""),
                period = "period_end";
            //剔除分数输入框
            if (name == 'score') return;
            if (!flag) period = "period_last";
            let value = data[name][period] ? data[name][period] + "%" : "";
            $item.val(value);
            flag = !flag;
        });
        let conclusion = data["conclusion"];
        console.log(conclusion);
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
            if (isFirst) ix21ResetInfo();
            else ix22ResetInfo();
        }
    }
    padding();
}

//===============================================事件控制===============================================//
/**
 * 事件绑定
 */
function ix2Bind() {
    function map_answer1() {
        spanStatusCtr(true, true, "new_balance_sheet_span");
        Ix2PaddingData(answer_infos1, true, 2);
    }

    function map_answer2() {
        spanStatusCtr(true, true, "profit_statement_span");
        Ix2PaddingData(answer_infos2, false, 2);
    }

    bind_confirm_info("submit_ix2First_info", $("button[data-confirm-1]"));
    bind_save_info(submit_ix2First_info, $("button[data-save-1]"));

    bind_confirm_info("submit_ix2Second_info", $("button[data-confirm-2]"));
    bind_save_info(submit_ix2Second_info, $("button[data-save-2]"));

    bindAnswerSource($("button[data-answer-1]"), map_ix2First_info, map_answer1);
    bindAnswerSource($("button[data-answer-2]"), map_ix2Second_info, map_answer2);

    let $inputs1 = $("#ix2First").find("input[name!=score]"),
        $inputs2 = $("#ix2Second").find("input[name!=score]"),
        $conclusions = $("[id^=ix2][id$=Conclusion]");

    bindLimitPercent($inputs1);
    bindLimitPercent($inputs2);
    $inputs2.each(function (index, item) {
        $(item).change(function () {
            eventChangeIx2(item);
        });
    });
    bindIllegalCharFilter($conclusions);

    bind_score("teacher_correct1", "common_ratio_analysis", "course_ix2_message_1", "first");
    bind_score("teacher_correct2", "common_ratio_analysis", "course_ix2_message_2", "second");
}

/**
 * 资产负债表重置
 */
function ix21ResetInfo() {
    $("#ix2First").find("input").val("");
}

/**
 * 利润表重置
 */
function ix22ResetInfo() {
    $("#ix2Second").find("input").val("");
}

/**
 * 用户输入数据改变事件响应函数
 * @param obj
 */
function eventChangeIx2(obj) {
    let name = $(obj).attr("name"),
        isEnd = name.endsWith("End"),
        value = $(obj).val();
    if (value === "格式错误") return;
    value = parseFloat(value);
    if (firstChange) {
        let Data = ix2GetInput(false);
        Data = Data["ix2Second_infos"];
        for (let key in Data) {
            if (Data.hasOwnProperty(key)) {
                periodEndData[key] = Data[key]["period_end"];
                periodLastData[key] = Data[key]["period_last"];
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
    } else {
        periodLastData["营业利润"] = result;
    }
    $("#ix2Second").find("input[name=" + inputName + "]").val(result);

    // 计算利润总额
    inputName = isEnd ? "利润总额End" : "利润总额Last";
    data = isEnd ? periodEndData : periodLastData;
    result = 0;
    result += data.hasOwnProperty("营业利润") ? data["营业利润"] : result;
    result += data.hasOwnProperty("营业外收入") ? data["营业外收入"] : result;
    result -= data.hasOwnProperty("营业外支出") ? data["营业外支出"] : result;
    if (isEnd) {
        periodEndData["利润总额"] = result;
    } else {
        periodLastData["利润总额"] = result;
    }
    $("#ix2Second").find("input[name=" + inputName + "]").val(result);

    // 计算净利润
    inputName = isEnd ? "净利润End" : "净利润Last";
    data = isEnd ? periodEndData : periodLastData;
    result = 0;
    result += data.hasOwnProperty("利润总额") ? data["利润总额"] : result;
    result -= data.hasOwnProperty("所得税费用") ? data["所得税费用"] : result;
    $("#ix2Second").find("input[name=" + inputName + "]").val(result);
}