// 页面加载完成填充数据
$(document).ready(function () {
    bindControlIx2();
    get_ix2First_info(true);
    get_ix2Second_info(true);
});

//======================================提交资产负债表信息======================================//

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_ix2First() {
    bind_confirm_info("confirm_ix2First_button", "submit_ix2First_info");
}

/**
 * 保存资产负债表信息
 */
function save_ix2First() {
    bind_save_info("save_ix2First_button", submit_ix2First_info);
}


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
let ix2First_infos, // 保存本次课程全部信息，减少后端数据请求次数
    ix2First_confirmed,
    ix2First_saved;

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
function map_ix2First_info(data) {

    data = data ? data : "";
    ix2First_infos = data ? data["ix2First_infos"] : ix2First_infos;
    ix2First_confirmed = data ? data["ix2First_confirmed"] : ix2First_confirmed;
    ix2First_saved = data ? data["ix2First_saved"] : ix2First_saved;

    // `完成状态`标签控制
    spanStatusCtr(ix2First_confirmed, ix2First_saved, "ix2First_span");

    if (!ix2First_infos) return;
    // 填充数据
    Ix2PaddingData(ix2First_infos, true);
}

//============================================提交利润表信息============================================//

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_ix2Second() {
    bind_confirm_info("confirm_ix2Second_button", "submit_ix2Second_info");
}

/**
 * 保存利润表信息
 */
function save_ix2Second() {
    bind_save_info("save_ix2Second_button", submit_ix2Second_info);
}


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
let ix2Second_infos, // 保存本次课程全部信息，减少后端数据请求次数
    ix2Second_confirmed,
    ix2Second_saved;

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
function map_ix2Second_info(data) {

    data = data ? data : "";
    ix2Second_infos = data ? data["ix2Second_infos"] : ix2Second_infos;
    ix2Second_confirmed = data ? data["ix2Second_confirmed"] : ix2Second_confirmed;
    ix2Second_saved = data ? data["ix2Second_saved"] : ix2Second_saved;

    // `完成状态`标签控制
    spanStatusCtr(ix2Second_confirmed, ix2Second_saved, "ix2Second_span");

    if (!ix2Second_infos) return;
    // 填充数据
    if (ix2Second_saved) Ix2PaddingData(ix2Second_infos, false);
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
 */
function Ix2PaddingData(data, isFirst) {
    data = isFirst ? data["new_balance_sheet_infos"] : data["profit_statement_infos"];
    let divID = isFirst ? "ix2First" : "ix2Second",
        inputs = $("#" + divID).find("input"),
        flag = true;

    $.each(inputs, function (index, item) {
        let name = $(item).attr("name").replace(/End|Last/, ""),
            period = "period_end";

        if (!flag) period = "period_last";
        let value = data[name][period] ? data[name][period] + "%" : "";
        $(item).val(value);
        flag = !flag;
    });
    let conclusion = data["conclusion"];
    $("#" + divID + "Conclusion").val(conclusion);
}

//===============================================事件控制===============================================//
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

let firstChange = true,
    periodEndData = Object(),
    periodLastData = Object();

/**
 * 将事件`处理函数`绑定
 */
function bindControlIx2() {
    let inputs1 = $("#ix2First").find("input"),
        inputs2 = $("#ix2Second").find("input"),
        conclusions = $("[id^=ix2][id$=Conclusion]"),
        limit = "LimitPercent(this)";

    $.each(inputs1, function (index, item) {
        $(item).attr("onchange", limit);
    });
    $.each(inputs2, function (index, item) {
        $(item).attr("onchange", "eventChangeIx2(this)");
    });

    $.each(conclusions, function (index, item) {
        $(item).attr("onkeyup", "illegalCharFilter(this)");
    });
}

/**
 * 用户输入数据改变事件响应函数
 * @param obj
 */
function eventChangeIx2(obj) {
    LimitPercent(obj);
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