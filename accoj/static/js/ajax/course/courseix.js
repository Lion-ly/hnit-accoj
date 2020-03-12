// 页面加载完成填充数据
$(document).ready(function () {
    bindControlIx();
    get_ixFirst_info();
    get_ixSecond_info();
});

//======================================提交资产负债表信息======================================//

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_ixFirst() {
    bind_confirm_info("confirm_ixFirst_button", "submit_ixFirst_info");
}

/**
 * 保存资产负债表信息
 */
function save_ixFirst() {
    bind_save_info("save_ixFirst_button", submit_ixFirst_info);
}


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
let ixFirst_infos, // 保存本次课程全部信息，减少后端数据请求次数
    ixFirst_confirmed,
    ixFirst_saved;

/**
 * 从后端获取资产负债表信息
 */
function get_ixFirst_info() {

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
function map_ixFirst_info(data) {
    console.log("data: " + data);
    console.log("ixFirst_infos: " + data["ixFirst_infos"]);
    console.log("ixFirst_confirmed: " + data["ixFirst_confirmed"]);
    console.log("ixFirst_saved: " + data["ixFirst_saved"]);
    data = data ? data : "";
    ixFirst_infos = data ? data["ixFirst_infos"] : ixFirst_infos;
    ixFirst_confirmed = data ? data["ixFirst_confirmed"] : ixFirst_confirmed;
    ixFirst_saved = data ? data["ixFirst_saved"] : ixFirst_saved;
    // 重置输入
    $("#ixFirst").find("input").val("");
    // `完成状态`标签控制
    spanStatusCtr(ixFirst_confirmed, ixFirst_saved, "ixFirst_span");

    if (!ixFirst_infos) return;
    // 填充数据
    IxPaddingData(ixFirst_infos, true);
}

//============================================提交利润表信息============================================//

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_ixSecond() {
    bind_confirm_info("confirm_ixSecond_button", "submit_ixSecond_info");
}

/**
 * 保存利润表信息
 */
function save_ixSecond() {
    bind_save_info("save_ixSecond_button", submit_ixSecond_info);
}


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
let ixSecond_infos, // 保存本次课程全部信息，减少后端数据请求次数
    ixSecond_confirmed,
    ixSecond_saved;

/**
 * 从后端获取利润表信息
 */
function get_ixSecond_info() {

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
function map_ixSecond_info(data) {

    data = data ? data : "";
    ixSecond_infos = data ? data["ixSecond_infos"] : ixSecond_infos;
    ixSecond_confirmed = data ? data["ixSecond_confirmed"] : ixSecond_confirmed;
    ixSecond_saved = data ? data["ixSecond_saved"] : ixSecond_saved;
    // 重置输入
    $("#ixSecond").find("input").val("");
    // `完成状态`标签控制
    spanStatusCtr(ixSecond_confirmed, ixSecond_saved, "ixSecond_span");

    if (!ixSecond_infos) return;
    // 填充数据
    IxPaddingData(ixSecond_infos, false);
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
function IxPaddingData(data, isFirst) {
    let divID = "ixFirst";
    if (!isFirst) divID = "ixSecond";
    let flag = true,
        inputs = $("#" + divID).find("input");

    $.each(inputs, function (index, item) {
        let name = $(item).attr("name").replace(/End|Last/, ""),
            period = "period_end",
            percent = "";

        if (!flag) {
            period = "period_last";
            percent = "%"
        }
        let value = data[name][period] ? data[name][period] + percent : "";
        $(item).val(value);
        flag = !flag;
    });
    let conclusion = data["conclusion"];
    $("#" + divID + "Conclusion").val(conclusion);
}

//===============================================事件控制===============================================//
let firstChange = true,
    periodEndData = Object(),
    periodLastData = Object();

/**
 * 将事件`处理函数`绑定
 */
function bindControlIx() {
    let inputs1 = $("#ixFirst").find("input"),
        inputs2 = $("#ixSecond").find("input"),
        conclusions = $("[id^=ix][id$=Conclusion]"),
        flag = true;

    $.each(inputs1, function (index, item) {
        let limit = "LimitPercent(this)";
        if (flag) limit = "RealNumber(this)";
        $(item).attr("onchange", limit);
        flag = !flag;
    });
    flag = true;
    $.each(inputs2, function (index, item) {
        $(item).attr("onchange", "eventChangeIx(this)");
    });

    $.each(conclusions, function (index, item) {
        $(item).attr("onkeyup", "illegalCharFilter(this)");
    });
}

/**
 * 用户输入数据改变事件响应函数
 * @param obj
 */
function eventChangeIx(obj) {
    let name = $(obj).attr("name"),
        isEnd = name.endsWith("End");

    if (isEnd) RealNumber(obj);
    else LimitPercent(obj);

    if (firstChange) {
        let Data = ixGetInput(false);
        Data = Data["ixSecond_infos"];
        for (let key in Data) {
            if (Data.hasOwnProperty(key)) {
                periodEndData[key] = Data[key]["period_end"];
                periodLastData[key] = Data[key]["period_last"];
            }
        }
        firstChange = false;
    }


    let value = parseFloat($(obj).val());
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
    $("#ixSecond").find("input[name=" + inputName + "]").val(result);

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
    $("#ixSecond").find("input[name=" + inputName + "]").val(result);

    // 计算净利润
    inputName = isEnd ? "净利润End" : "净利润Last";
    data = isEnd ? periodEndData : periodLastData;
    result = 0;
    result += data.hasOwnProperty("利润总额") ? data["利润总额"] : result;
    result -= data.hasOwnProperty("所得税费用") ? data["所得税费用"] : result;
    $("#ixSecond").find("input[name=" + inputName + "]").val(result);
}