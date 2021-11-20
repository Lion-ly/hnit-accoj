let coursex_infos,
    coursex_confirmed,
    coursex_saved,
    answer_infos = "",
    scores = "",
    teacher_scores = 0;
$(document).ready(function () {
    function init() {
        xBind();
        get_coursex_info(true);
    }

    init();
});

//======================================提交杜邦分析法信息======================================//
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
/**
 * 从后端获取杜邦分析法信息
 */
function get_coursex_info(isFromSubmit = false) {
    // 重置信息
    xResetInfo();
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!coursex_saved)
            //  若未保存，则不向后台请求数据
            return;
    }
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
function map_coursex_info(data, isFromButton) {

    data = data ? data : "";
    coursex_infos = data ? data["coursex_infos"] : coursex_infos;
    coursex_confirmed = data ? data["coursex_confirmed"] : coursex_confirmed;
    coursex_saved = data ? data["coursex_saved"] : coursex_saved;
    answer_infos = data ? data["answer_infos"] : answer_infos;
    scores = data["scores"] ? data["scores"]["student_score"] : scores;
    teacher_scores = data["scores"] ? data["scores"]["teacher_score"] : teacher_scores;

    if (answer_infos) {
        showAnswerButton();
        isFromButton = 1;
        $("button[data-answer]").text("查看答案");
    }

    // `完成状态`标签控制
    spanStatusCtr(coursex_confirmed, coursex_saved, "coursex_span");

    if (!coursex_infos) return;
    // 填充数据
    CoursexPaddingData(coursex_infos, isFromButton);
}

//===========================================获取和填充数据===========================================//
/**
 * 获取用户输入信息
 * @returns {Object}
 */
function coursexGetInput() {
    let divId = "#coursexData",
        infosName = "coursex_infos";
    let infos = Object(),
        $inputs = $(divId).find("input");

    $.each($inputs, function (index, item) {
        if (index !== $inputs.length) {
            let project = $(item).attr("name"),
                value = $(item).val();

            if (!infos.hasOwnProperty(project)) infos[project] = Object();
            infos[project] = parseFloat(value);
        }
    });
    infos["conclusion"] = $(divId + "Conclusion").val();
    return {[infosName]: infos};
}

/**
 * 填充数据
 * @param data
 * @param isFromButton
 */
function CoursexPaddingData(data, isFromButton) {
    function padding() {
        let divID = "coursexData",
            $inputs = $("#" + divID).find("input");

        $.each($inputs, function (index, item) {
            if (index !== $inputs.length) {
                let name = $(item).attr("name"),
                    value = data[name] ? data[name] : "";
                value = name.match(/[率数]$/) ? (value ? value + "%" : "") : value;
                $(item).val(value);
            }
        });
        let conclusion = data["conclusion"];
        $("#" + divID + "Conclusion").val(conclusion);
    }

    if (!data) return;
    if (isFromButton) {
        removeAllError();
        let nowTotalScore = 100,
            totalScore = 100;
        showScoreEm(scores, nowTotalScore, totalScore, 1, 1);
        showScoreEm(teacher_scores, nowTotalScore, teacher_scores, 2, 2);
        if (isFromButton === 2) xResetInfo();
    }
    padding();
}

//===============================================事件控制===============================================//
/**
 * 事件绑定
 */
function xBind() {
    function map_answer() {
        spanStatusCtr(true, true, "submit_status_span");
        CoursexPaddingData(answer_infos, true, 2);
    }

    bind_confirm_info("submit_coursex_info");
    bind_save_info(submit_coursex_info);
    bindAnswerSource("", map_coursex_info, map_answer);

    let $inputs = $("#coursexData").find("input"),
        $conclusions = $("#coursexDataConclusion");
    $inputs.each(function (index, item) {
        if (index !== $inputs.length - 1) {
            let name = $(item).attr("name");
            if (!name.match(/[率数]$/)) bindRealNumber($(item));
            else bindLimitPercent($(item));
        }
    });
    bindIllegalCharFilter($conclusions);
    bind_score("teacher_correct", "dupont_analysis", "course_x_message_1");
}

/**
 * 重置信息
 */
function xResetInfo() {
    $("#coursexData").find("input").val("");
}
