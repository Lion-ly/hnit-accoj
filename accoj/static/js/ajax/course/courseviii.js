// 页面加载完成填充数据
$(document).ready(function () {
    bindControlViii();
    get_new_balance_sheet_info(true);
    get_profit_statement_info(true);
});

//======================================提交资产负债表信息======================================//

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_new_balance_sheet() {
    bind_confirm_info("confirm_new_balance_sheet_button", "submit_new_balance_sheet_info");
}

/**
 * 保存资产负债表信息
 */
function save_new_balance_sheet() {
    bind_save_info("save_new_balance_sheet_button", submit_new_balance_sheet_info);
}


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
let new_balance_sheet_infos, // 保存本次课程全部信息，减少后端数据请求次数
    new_balance_sheet_confirmed,
    new_balance_sheet_saved;

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

//==================================将资产负债表信息映射到前端==================================//
/**
 * 将数据映射到前端
 */
function map_new_balance_sheet_info(data) {

    data = data ? data : "";
    new_balance_sheet_infos = data ? data["new_balance_sheet_infos"] : new_balance_sheet_infos;
    new_balance_sheet_confirmed = data ? data["new_balance_sheet_confirmed"] : new_balance_sheet_confirmed;
    new_balance_sheet_saved = data ? data["new_balance_sheet_infos"] : new_balance_sheet_saved;

    // `完成状态`标签控制
    spanStatusCtr(new_balance_sheet_confirmed, new_balance_sheet_saved, "new_balance_sheet_span");

    if (!new_balance_sheet_infos) return;
    // 填充数据
    viiiPaddingData(new_balance_sheet_infos, true);
}

//============================================提交利润表信息============================================//

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_profit_statement() {
    bind_confirm_info("confirm_profit_statement_button", "submit_profit_statement_info");
}

/**
 * 保存利润表信息
 */
function save_profit_statement() {
    bind_save_info("save_profit_statement_button", submit_profit_statement_info);
}


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
let profit_statement_infos, // 保存本次课程全部信息，减少后端数据请求次数
    profit_statement_confirmed,
    profit_statement_saved;

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
function map_profit_statement_info(data) {

    data = data ? data : "";
    profit_statement_infos = data ? data["profit_statement_infos"] : profit_statement_infos;
    profit_statement_confirmed = data ? data["profit_statement_confirmed"] : profit_statement_confirmed;
    profit_statement_saved = data ? data["profit_statement_infos"] : profit_statement_saved;

    // `完成状态`标签控制
    spanStatusCtr(profit_statement_confirmed, profit_statement_saved, "profit_statement_span");

    if (!profit_statement_infos) return;
    // 填充数据
    viiiPaddingData(profit_statement_infos, false);
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
 */
function viiiPaddingData(data, isFirst) {
    let divID = "viiiFirst";
    if (!isFirst) divID = "viiiSecond";
    let flag = true,
        inputs = $("#" + divID).find("input");

    $.each(inputs, function (index, item) {
        let name = $(item).attr("name").replace(/End|Last/, ""),
            period = "period_end";
        if (!flag) period = "period_last";
        let value = data[name][period];
        $(item).val(value);
        flag = !flag;
    });
}

//===============================================事件控制===============================================//
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

let firstChange = true,
    periodEndData = Object(),
    periodLastData = Object();

/**
 * 将事件`处理函数`绑定
 */
function bindControlViii() {
    let inputs1 = $("#viiiFirst").find("input"),
        inputs2 = $("#viiiSecond").find("input");

    $.each(inputs1, function (index, item) {
        $(item).attr("onchange", "RealNumber(this)");
    });

    $.each(inputs2, function (index, item) {
        $(item).attr("onchange", "eventChangeViii(this)");
    });
}

/**
 * 用户输入数据改变事件响应函数
 * @param obj
 */
function eventChangeViii(obj) {
    RealNumber(obj);
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

    let name = $(obj).attr("name"),
        isEnd = name.endsWith("End"),
        value = parseFloat($(obj).val());
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
    $("#viiiSecond").find("input[name=" + inputName + "]").val(result);

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
    $("#viiiSecond").find("input[name=" + inputName + "]").val(result);

    // 计算净利润
    inputName = isEnd ? "净利润End" : "净利润Last";
    data = isEnd ? periodEndData : periodLastData;
    result = 0;
    result += data.hasOwnProperty("利润总额") ? data["利润总额"] : result;
    result -= data.hasOwnProperty("所得税费用") ? data["所得税费用"] : result;
    $("#viiiSecond").find("input[name=" + inputName + "]").val(result);
}