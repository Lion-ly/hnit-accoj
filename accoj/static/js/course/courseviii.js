let new_balance_sheet_infos,
    new_balance_sheet_confirmed,
    new_balance_sheet_saved;
let profit_statement_infos,
    profit_statement_confirmed,
    profit_statement_saved;
let firstChange = true,
    periodEndData = Object(),
    periodLastData = Object(),
    answer_infos1 = "",
    answer_infos2 = "",
    permission = 0,
    scores1 = 0,
    scores2 = 0;

$(document).ready(function () {
    function init() {
        viiiBind();
        get_new_balance_sheet_info(true);
        get_profit_statement_info(true);
        get_company_info();
    }

    init();
});

//======================================提交资产负债表信息======================================//
/**
 * 提交资产负债表信息
 * @param submit_type confirm or save
 */
function submit_new_balance_sheet_info(submit_type) {
    // 获取用户输入
    let data = viiiGetInput(true);
    data["submit_type"] = submit_type;
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_new_balance_sheet_info",
        messageDivID = "course_viii1_message",
        successFunc = get_new_balance_sheet_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

//======================================获取资产负债表信息======================================//
/**
 * 从后端获取资产负债表信息
 */
function get_new_balance_sheet_info(isFromSubmit = false) {
    // 重置信息
    viii1ResetInfo();
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!new_balance_sheet_saved)
            //  若未保存，则不向后台请求数据
            return;
    }
    // 若new_balance_sheet_infos不为空且已经确认提交过，则不再发送数据请求
    if (new_balance_sheet_infos && new_balance_sheet_confirmed) {
        map_new_balance_sheet_info();
        return;
    }

    //  获取数据
    let data = {},
        url = "/get_new_balance_sheet_info",
        successFunc = map_new_balance_sheet_info,
        messageDivID = "course_viii1_message";
    get_info(data, url, successFunc, messageDivID);

}

/**
 * 从后端获取获取公司信息
 */
function get_company_info() {
    let data = {},
        url = "/get_company_info",
        successFunc = paddingCompany,
        messageDivID = "course_i1_message";
    get_info(data, url, successFunc, messageDivID);
}

//填充公司名称
function paddingCompany(data) {

    let company_info = data["company_info"];
    console.log(company_info.com_name);
    $("#com_name_1,#com_name_2").html("编制单位：" + company_info.com_name);

}

//==================================将资产负债表信息映射到前端==================================//
/**
 * 将数据映射到前端
 */
function map_new_balance_sheet_info(data, isFromButton) {

    data = data ? data : "";
    new_balance_sheet_infos = data ? data["new_balance_sheet_infos"] : new_balance_sheet_infos;
    new_balance_sheet_confirmed = data ? data["new_balance_sheet_confirmed"] : new_balance_sheet_confirmed;
    new_balance_sheet_saved = data ? data["new_balance_sheet_infos"] : new_balance_sheet_saved;
    answer_infos1 = data ? data["answer_infos"] : answer_infos1;
    scores1 = data ? data["scores"] : scores1;
    permission = data ? data["permission"] : permission;

    //填充团队题目
    if (permission) {
        $("#selfQuestion").html("资产负债表");
    }
    if (!permission) {
        $("#selfQuestion").html("利润表");
    }


    if (answer_infos1) {
        let $answer = $("button[data-answer-1]");
        showAnswerButton($answer);
        isFromButton = 1;
        $answer.text("查看答案");
    }
    // `完成状态`标签控制
    spanStatusCtr(new_balance_sheet_confirmed, new_balance_sheet_saved, "new_balance_sheet_span");

    if (!new_balance_sheet_infos) return;
    // 填充数据
    viiiPaddingData(new_balance_sheet_infos, true, isFromButton);
}

//============================================提交利润表信息============================================//
/**
 * 提交利润表信息
 * @param submit_type confirm or save
 */
function submit_profit_statement_info(submit_type) {
    // 获取用户输入
    let data = viiiGetInput(false);
    data["submit_type"] = submit_type;
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_profit_statement_info",
        messageDivID = "course_viii2_message",
        successFunc = get_profit_statement_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

//============================================获取利润表信息============================================//
/**
 * 从后端获取利润表信息
 */
function get_profit_statement_info(isFromSubmit = false) {

    // 重置信息
    viii2ResetInfo();
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!profit_statement_saved)
            //  若未保存，则不向后台请求数据
            return;
    }
    // 若profit_statement_infos不为空且已经确认提交过，则不再发送数据请求
    if (profit_statement_infos && profit_statement_confirmed) {
        map_profit_statement_info();
        return;
    }

    //  获取数据
    let data = {},
        url = "/get_profit_statement_info",
        successFunc = map_profit_statement_info,
        messageDivID = "course_viii2_message";
    get_info(data, url, successFunc, messageDivID);

}

//=======================================将利润表信息映射到前端=======================================//
/**
 * 将数据映射到前端
 */
function map_profit_statement_info(data, isFromButton) {

    data = data ? data : "";
    profit_statement_infos = data ? data["profit_statement_infos"] : profit_statement_infos;
    profit_statement_confirmed = data ? data["profit_statement_confirmed"] : profit_statement_confirmed;
    profit_statement_saved = data ? data["profit_statement_infos"] : profit_statement_saved;
    answer_infos2 = data ? data["answer_infos"] : answer_infos2;
    scores2 = data ? data["scores"] : scores2;

    if (answer_infos2) {
        let $answer = $("button[data-answer-2]");
        showAnswerButton($answer);
        isFromButton = 1;
        $answer.text("查看答案");
    }
    // `完成状态`标签控制
    spanStatusCtr(profit_statement_confirmed, profit_statement_saved, "profit_statement_span");

    if (!profit_statement_infos) return;
    // 填充数据
    viiiPaddingData(profit_statement_infos, false, isFromButton);
}

//===========================================获取和填充数据===========================================//
/**
 * 获取用户输入信息
 * @returns {Object}
 */
function viiiGetInput(isFirst) {
    let divId = "viiiFirst",
        infosName = "new_balance_sheet_infos";
    if (!isFirst) {
        divId = "viiiSecond";
        infosName = "profit_statement_infos";
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
    return {[infosName]: infos};
}

/**
 * 填充数据
 * @param data
 * @param isFirst
 * @param isFromButton
 */
function viiiPaddingData(data, isFirst, isFromButton) {
    function padding() {
        let divID = "viiiFirst";
        if (!isFirst) divID = "viiiSecond";
        let flag = true,
            inputs = $("#" + divID).find("input");

        $.each(inputs, function (index, item) {
            let $item = $(item),
                name = $item.attr("name").replace(/End|Last/, ""),
                period = "period_end";
            if (!flag) period = "period_last";
            let value = data[name][period];
            $item.val(value);
            flag = !flag;
        });
    }

    if (!data) return;
    if (isFromButton) {
        removeAllError();
        let nowTotalScore = isFirst ? 60 : 40,
            totalScore = scores1 + scores2,
            scores = isFirst ? scores1 : scores2;
        nowNum = isFirst ? 1 : 2;
        showScoreEm(scores, nowTotalScore, totalScore, nowNum, nowNum);
        if (isFromButton === 2) {
            if (isFirst) viii1ResetInfo();
            else viii2ResetInfo();
        }
    }
    padding();
}

//===============================================事件控制===============================================//
/**
 * 事件绑定
 */
function viiiBind() {
    function map_answer1() {
        spanStatusCtr(true, true, "new_balance_sheet_span");
        viiiPaddingData(answer_infos1, true, 2);
    }

    function map_answer2() {
        spanStatusCtr(true, true, "profit_statement_span");
        viiiPaddingData(answer_infos2, false, 2);
    }

    bind_confirm_info("submit_new_balance_sheet_info", $("button[data-confirm-1]"));
    bind_save_info(submit_new_balance_sheet_info, $("button[data-save-1]"));

    bind_confirm_info("submit_profit_statement_info", $("button[data-confirm-2]"));
    bind_save_info(submit_profit_statement_info, $("button[data-save-2]"));

    bindAnswerSource($("button[data-answer-1]"), map_new_balance_sheet_info, map_answer1);
    bindAnswerSource($("button[data-answer-2]"), map_profit_statement_info, map_answer2);

    let inputs1 = $("#viiiFirst").find("input"),
        inputs2 = $("#viiiSecond").find("input");
    bindRealNumber(inputs1);
    bindRealNumber(inputs2);
    $.each(inputs2, function (index, item) {
        $(item).change(function () {
            eventChangeViii(item);
        });
    });
}

/**
 * 资产负债表重置
 */
function viii1ResetInfo() {
    $("#viiiFirst").find("input").val("");
}

/**
 * 利润表重置
 */
function viii2ResetInfo() {
    $("#viiiSecond").find("input").val("");
}

/**
 * 用户输入数据改变事件响应函数
 * @param selector
 */
function eventChangeViii(selector) {
    function dealResult(name) {
        let v = data.hasOwnProperty(name) ? data[name] : 0;
        v = v ? v : 0;
        return parseFloat(v);
    }

    let name = $(selector).attr("name"),
        isEnd = name.endsWith("End"),
        value = $(selector).val();
    if (value === "格式错误") return;
    value = parseFloat(value);
    if (firstChange) {
        let Data = viiiGetInput(false);
        Data = Data["profit_statement_infos"];
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
    result += dealResult("营业收入");
    result -= dealResult("营业成本");
    result -= dealResult("税金及附加");
    result -= dealResult("销售费用");
    result -= dealResult("管理费用");
    result -= dealResult("财务费用");
    result -= dealResult("资产减值损失");
    result += dealResult("公允价值变动收益");
    result += dealResult("投资收益");
    if (isEnd) {
        periodEndData["营业利润"] = result;
    } else {
        periodLastData["营业利润"] = result;
        result = result.toFixed(2);
    }
    $("#viiiSecond").find("input[name=" + inputName + "]").val(result);

    // 计算利润总额
    inputName = isEnd ? "利润总额End" : "利润总额Last";
    data = isEnd ? periodEndData : periodLastData;
    result = 0;
    result += dealResult("营业利润");
    result += dealResult("营业外收入");
    result -= dealResult("营业外支出");
    if (isEnd) {
        periodEndData["利润总额"] = result;
    } else {
        periodLastData["利润总额"] = result;
        result = result.toFixed(2);
    }
    $("#viiiSecond").find("input[name=" + inputName + "]").val(result);

    // 计算净利润
    inputName = isEnd ? "净利润End" : "净利润Last";
    data = isEnd ? periodEndData : periodLastData;
    result = 0;
    result += dealResult("利润总额")
    result -= dealResult("所得税费用")
    result = isEnd ? result : result.toFixed(2);
    $("#viiiSecond").find("input[name=" + inputName + "]").val(result);
}