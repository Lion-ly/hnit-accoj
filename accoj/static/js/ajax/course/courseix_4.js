// 页面加载完成填充数据
$(document).ready(function () {
    bindControlIx4();
    get_ix4_info(true);
});

//======================================提交比率分析法信息======================================//

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_ix4() {
    bind_confirm_info("confirm_ix4_button", "submit_ix4_info");
}

/**
 * 保存比率分析法信息
 */
function save_ix4() {
    bind_save_info("save_ix4_button", submit_ix4_info);
}


/**
 * 提交比率分析法信息
 * @param submit_type confirm or save
 */
function submit_ix4_info(submit_type) {
    // 获取用户输入
    let data = ix4GetInput();
    data["submit_type"] = submit_type;
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_ix4_info",
        messageDivID = "course_ix4_message",
        successFunc = get_ix4_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

//======================================获取比率分析法信息======================================//
let ix4_infos, // 保存本次课程全部信息，减少后端数据请求次数
    ix4_confirmed,
    ix4_saved;

/**
 * 从后端获取比率分析法信息
 */
function get_ix4_info(isFromSubmit = false) {
    // 重置信息
    ix4ResetInfo();
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!ix4_saved)
        //  若未保存，则不向后台请求数据
            return;
    }
    // 若ix4_infos不为空且已经确认提交过，则不再发送数据请求
    if (ix4_infos && ix4_confirmed) {
        map_ix4_info();
        return;
    }

    //  获取数据
    let data = {},
        url = "/get_ix4_info",
        successFunc = map_ix4_info,
        messageDivID = "course_ix4_message";
    get_info(data, url, successFunc, messageDivID);

}

//==================================将比率分析法信息映射到前端==================================//
/**
 * 将数据映射到前端
 */
function map_ix4_info(data) {

    data = data ? data : "";
    ix4_infos = data ? data["ix4_infos"] : ix4_infos;
    ix4_confirmed = data ? data["ix4_confirmed"] : ix4_confirmed;
    ix4_saved = data ? data["ix4_saved"] : ix4_saved;

    // `完成状态`标签控制
    spanStatusCtr(ix4_confirmed, ix4_saved, "ix4_span");

    if (!ix4_infos) return;
    // 填充数据
    if(ix4_saved) Ix4PaddingData(ix4_infos);
}

//===========================================获取和填充数据===========================================//
/**
 * 获取用户输入信息
 * @returns {Object}
 */
function ix4GetInput() {
    let divId = "ix4",
        infosName = "ix4_infos";
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
 */
function Ix4PaddingData(data) {
    let divID = "ix4",
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
}

//===============================================事件控制===============================================//
/**
 * 重置信息
 */
function ix4ResetInfo() {
    $("#ix4").find("input").val("");
}

/**
 * 将事件`处理函数`绑定
 */
function bindControlIx4() {
    let inputs1 = $("#ix4").find("input"),
        limit = "LimitPercent(this)";

    $.each(inputs1, function (index, item) {
        $(item).attr("onchange", limit);
    });

}