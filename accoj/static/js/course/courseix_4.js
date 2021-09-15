let ix4_infos,
    ix4_confirmed,
    ix4_saved,
    answer_infos = "",
    scores = 0,
    permission = 0,
    teacher_scores = 0;

$(document).ready(function () {
    function init() {
        ix4Bind();
        get_ix4_info(true);
    }

    init();
});

//======================================提交比率分析法信息======================================//
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
function map_ix4_info(data, isFromButton) {

    data = data ? data : "";
    ix4_infos = data ? data["ix4_infos"] : ix4_infos;
    ix4_confirmed = data ? data["ix4_confirmed"] : ix4_confirmed;
    ix4_saved = data ? data["ix4_saved"] : ix4_saved;
    answer_infos = data ? data["answer_infos"] : answer_infos;
    scores = data["scores"] ? data["scores"]["student_score"] : scores;
    teacher_scores = data["scores"] ? data["scores"]["teacher_score"] : teacher_scores;
    permission = data ? data["permission"] : permission;

    //填充团队题目
    if (permission) {
        $("#selfQuestion").html("本题");

    } else {
        $("#selfQuestion").html("无");
    }


    if (answer_infos) {
        showAnswerButton();
        isFromButton = 1;
        $("button[data-answer]").text("查看答案");
    }

    // `完成状态`标签控制
    spanStatusCtr(ix4_confirmed, ix4_saved, "ix4_span");

    if (!ix4_infos) return;
    // 填充数据
    if (ix4_saved) Ix4PaddingData(ix4_infos, isFromButton);
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
    infos["conclusion"] = $("#Conclusion").val();
    return {[infosName]: infos};
}

/**
 * 填充数据
 * @param data
 * @param isFromButton
 */
function Ix4PaddingData(data, isFromButton) {
    function padding() {
        let divID = "ix4",
            inputs = $("#" + divID).find("input"),
            flag = true;

        $.each(inputs, function (index, item) {
            let $item = $(item),
                name = $item.attr("name").replace(/End|Last/, ""),
                period = "period_end";
            if (!flag) period = "period_last";
            try {
                let value = data[name][period] ? data[name][period] + "%" : "";
                $item.val(value);
            } catch (e) {
                console.log(e);
            }
            flag = !flag;
        });
        let conclusion = data["conclusion"];
        $("#Conclusion").val(conclusion);
    }

    if (!data) return;
    if (isFromButton) {
        removeAllError();
        let nowTotalScore = 20,
            totalScore = 100;
        showScoreEm(scores, nowTotalScore, totalScore, 1, 1);
        showScoreEm(teacher_scores, nowTotalScore, teacher_scores, 2, 2);
        if (isFromButton === 2) ix4ResetInfo();
    }
    padding();
}

//===============================================事件控制===============================================//
/**
 * 事件绑定
 */
function ix4Bind() {
    function map_answer() {
        spanStatusCtr(true, true, "submit_status_span");
        Ix4PaddingData(answer_infos, true, 2);
    }

    bind_confirm_info("submit_ix4_info");
    bind_save_info(submit_ix4_info);
    bindAnswerSource("", map_ix4_info, map_answer);

    let $inputs = $("#ix4").find("input"),
        $conclusions = $("#Conclusion");
    bindLimitPercent($inputs);
    bindIllegalCharFilter($conclusions);
    bind_score("teacher_correct", "ratio_analysis", "course_ix4_message_1");
}

/**
 * 重置信息
 */
function ix4ResetInfo() {
    $("#ix4").find("input").val("");
}
