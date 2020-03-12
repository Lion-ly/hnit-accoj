// 页面加载完成填充数据
$(document).ready(function () {
    bindControlCoursex();
    get_coursex_info();
});

//======================================提交杜邦分析法信息======================================//

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_coursex() {
    bind_confirm_info("confirm_coursex_button", "submit_coursex_info");
}

/**
 * 保存杜邦分析法信息
 */
function save_coursex() {
    bind_save_info("save_coursex_button", submit_coursex_info);
}


/**
 * 提交杜邦分析法信息
 * @param submit_type confirm or save
 */
function submit_coursex_info(submit_type) {
    // 获取用户输入
    let data = coursexGetInput();
    data["submit_type"] = submit_type;
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_coursex_info",
        messageDivID = "course_coursex_message",
        successFunc = get_coursex_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

//======================================获取杜邦分析法信息======================================//
let coursex_infos, // 保存本次课程全部信息，减少后端数据请求次数
    coursex_confirmed,
    coursex_saved;

/**
 * 从后端获取杜邦分析法信息
 */
function get_coursex_info() {

    // 若coursex_infos不为空且已经确认提交过，则不再发送数据请求
    if (coursex_infos && coursex_confirmed) {
        map_coursex_info();
        return;
    }

    //  获取数据
    let data = {},
        url = "/get_coursex_info",
        successFunc = map_coursex_info,
        messageDivID = "course_coursex_message";
    get_info(data, url, successFunc, messageDivID);

}

//==================================将杜邦分析法信息映射到前端==================================//
/**
 * 将数据映射到前端
 */
function map_coursex_info(data) {

    data = data ? data : "";
    coursex_infos = data ? data["coursex_infos"] : coursex_infos;
    coursex_confirmed = data ? data["coursex_confirmed"] : coursex_confirmed;
    coursex_saved = data ? data["coursex_saved"] : coursex_saved;
    // 重置输入
    $("#coursexData").find("input").val("");
    // `完成状态`标签控制
    spanStatusCtr(coursex_confirmed, coursex_saved, "coursex_span");

    if (!coursex_infos) return;
    // 填充数据
    CoursexPaddingData(coursex_infos);
}

//===========================================获取和填充数据===========================================//
/**
 * 获取用户输入信息
 * @returns {Object}
 */
function coursexGetInput() {
    let divId = "coursexData",
        infosName = "coursex_infos";
    let infos = Object(),
        inputs = $("#" + divId).find("input");

    $.each(inputs, function (index, item) {
        let project = $(item).attr("name"),
            value = $(item).val();

        if (!infos.hasOwnProperty(project)) infos[project] = Object();
        infos[project] = parseFloat(value);
    });
    infos["conclusion"] = $("#" + divId + "Conclusion").val();
    return {[infosName]: infos};
}

/**
 * 填充数据
 * @param data
 */
function CoursexPaddingData(data) {
    let divID = "coursexData",
        inputs = $("#" + divID).find("input");

    $.each(inputs, function (index, item) {
        let name = $(item).attr("name"),
            value = data[name] ? data[name] : "";

        value = name.match(/率$/) ? (value ? value + "%" : "") : value;
        $(item).val(value);
    });
    let conclusion = data["conclusion"];
    $("#" + divID + "Conclusion").val(conclusion);
}

//===============================================事件控制===============================================//

/**
 * 将事件`处理函数`绑定
 */
function bindControlCoursex() {
    let inputs1 = $("#coursexData").find("input");

    $.each(inputs1, function (index, item) {
        let name = $(item).attr("name"),
            limit = "LimitPercent(this)";
        if (!name.match(/率$/)) limit = "RealNumber(this)";
        $(item).attr("onchange", limit);
    });

    $("#coursexDataConclusion").attr("onkeyup", "illegalCharFilter(this)");
}