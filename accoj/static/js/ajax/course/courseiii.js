let subject_infos = Array(),
    subject_confirmed = Array(),
    subject_saved = Array(),
    answer_infos = "",
    scores = "";

$(document).ready(function () {
    function init() {
        iiiBind();
        getBusinessList();
        get_subject_info(true);
    }

    init();
});

//==================================提交会计科目信息==================================//
/**
 * 提交会计科目信息
 * @param submit_type confirm or save
 */
function submit_subject_info(submit_type) {

    let data = iiiGetInput();
    data["submit_type"] = submit_type;

    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_subject_info",
        messageDivID = "course_iii_message",
        successFunc = get_subject_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);

}

//==================================获取会计科目信息==================================//
/**
 * 从后端获取会计要素信息
 */
function get_subject_info(isFromSubmit = false) {

    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text());
    if (nowBusinessNo < 0 || nowBusinessNo > 20) {
        return;
    }
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!subject_saved.length || subject_saved.indexOf(nowBusinessNo - 1) === -1) {
            //  若未保存，则不向后台请求数据
            iiiResetInfo();
            return;
        }
    }

    // 若请求的业务编号已经确认提交过，则不再发送数据请求
    if (subject_confirmed.length > 0 && subject_confirmed.indexOf(nowBusinessNo - 1) !== -1) {
        map_subject_info();
        return;
    }

    // 获取数据
    let data = {},
        url = "/get_subject_info",
        successFunc = map_subject_info,
        messageDivID = "course_iii_message";
    get_info(data, url, successFunc, messageDivID);

}

/**
 * 将数据映射到前端
 * @param data
 * @param isFromButton
 */
function map_subject_info(data, isFromButton) {
    iiiResetInfo();
    data = data ? data : "";
    subject_infos = data ? data["subject_infos"] : subject_infos;
    subject_confirmed = data ? data["subject_confirmed"] : subject_confirmed;
    subject_saved = data ? data["subject_saved"] : subject_saved;
    answer_infos = data ? data["answer_infos"] : answer_infos;
    scores = data ? data["scores"] : scores;

    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        business_index = nowBusinessNo - 1,
        confirmed = subject_confirmed ? subject_confirmed.indexOf(business_index) !== -1 : false,
        saved = subject_saved ? subject_saved.indexOf(business_index) !== -1 : false;

    if (answer_infos) {
        showAnswerButton();
        confirmed = true;
        saved = true;
        isFromButton = 1;
        $("button[data-answer]").text("查看答案");
        let buttons = ["button[data-save]", "button[data-confirm]", "button[data-all-to-1]",
            "button[data-all-to-2]", "button[data-to-all-1]", "button[data-to-all-2]"];
        buttons = buttons.join();
        $(buttons).prop("disabled", true);
    }
    // `完成状态`标签控制
    spanStatusCtr(confirmed, saved, "submit_status_span");

    // 如果已保存
    if (saved) iiiPaddingData(subject_infos, isFromButton);
}

// ===============================获取和填充数据===============================//
/**
 * 获取数据
 * @returns {Object}
 */
function iiiGetInput() {
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        business_no = nowBusinessNo,
        subject_infos = Array(),
        right_box = $("#plusbox"),
        left_box = $("#minusbox"),
        right_input = right_box.children().children(":input"),
        left_input = left_box.children().children(":input"),
        right_inputLen = right_input.length,
        left_inputLen = left_input.length,
        is_up = true,
        data;
    for (let i = 0; i < right_inputLen; i++) {
        let subject = $(right_input[i]).attr("name");
        subject_infos.push({"subject": subject, "is_up": is_up});
    }
    is_up = false;
    for (let i = 0; i < left_inputLen; i++) {
        let subject = $(left_input[i]).attr("name");
        subject_infos.push({"subject": subject, "is_up": is_up});
    }
    data = {"subject_infos": subject_infos, "business_no": business_no};
    return data;
}

/**
 * 填充数据
 * @param data
 * @param isFromButton
 */
function iiiPaddingData(data, isFromButton) {
    function padding() {
        // 填充会计科目信息
        let subject_info = data,
            rightbox_subject_array = Array(),
            leftbox_subject_array = Array(),
            error_pos = Array(),
            infoLen = subject_info.length,
            flag = false, j = 0;
        t_infoLen = isFromButton === 1 ? answer_info.length : t_infoLen;

        for (let i = 0; i < infoLen; i++) {
            let subject = subject_info[i]["subject"],
                is_up = subject_info[i]["is_up"];
            if (is_up) rightbox_subject_array.push(subject);
            else leftbox_subject_array.push(subject);
            if (isFromButton === 1) {
                for (let i = 0; i < t_infoLen; i++) {
                    let t_subject = answer_info[i]["subject"],
                        t_is_up = answer_info[i]["is_up"];
                    flag = false;
                    if (subject === t_subject) {
                        flag = is_up === t_is_up;
                        break;
                    }
                }
                if (!flag) {
                    let $subject = $("input[name=" + subject + "]");
                    error_pos.push($subject);
                }
            }
        }
        input_moveTo_center("plusbox", rightbox_subject_array);
        input_moveTo_center("minusbox", leftbox_subject_array);
        if (isFromButton === 1) {
            for (let i = 0; i < t_infoLen; i++) {
                let t_subject = answer_info[i]["subject"],
                    t_is_up = answer_info[i]["is_up"];

                flag = false;
                for (j = 0; j < infoLen; j++) {
                    let subject = subject_info[j]["subject"],
                        is_up = subject_info[j]["is_up"];

                    if (subject === t_subject) {
                        flag = is_up === t_is_up;
                        break;
                    }
                }
                if (!flag) {
                    let $subject = $("input[name=" + t_subject + "]");
                    error_pos.push($subject);
                }
            }
            // 标出错误位置
            for (let i = 0; i < error_pos.length; i++) hasError(error_pos[i]);
        }
    }

    if (!data) return;
    if (isFromButton) removeAllError();
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        index = nowBusinessNo - 1, t_infoLen = 0, answer_info = "";
    if (isFromButton) {
        let nowScore = scores[index * 2],
            nowTotalScore = scores[index * 2 + 1],
            totalScore = scores[scores.length - 1];
        showScoreEm(nowScore, nowTotalScore, totalScore);
        if (isFromButton === 1) answer_info = answer_infos[index];
        else if (isFromButton === 2) iiiResetInfo();
    }
    data = data[index];
    padding(data);
}

// ==================================事件控制==================================//
/**
 * 事件绑定
 */
function iiiBind() {
    function map_answer() {
        spanStatusCtr(true, true, "submit_status_span");
        iiiPaddingData(answer_infos, 2);
    }

    bind_confirm_info("submit_subject_info");
    bind_save_info(submit_subject_info);
    bindAnswerSource("", map_subject_info, map_answer);
    $("button[data-to-all-1]").click(function () {
        to_all('plusbox');
    });
    $("button[data-to-all-2]").click(function () {
        to_all('minusbox');
    });
    $("button[data-all-to-1]").click(function () {
        all_to('plusbox');
    });
    $("button[data-all-to-2]").click(function () {
        all_to('minusbox');
    });
    pageSplitBind(function (business_no) {
        businessLiControl(business_no);
        get_subject_info();
    }, 20);
}

/**
 * 往box中添加会计科目
 * @param box plusbox or minusbox(string)
 * @param subject_array (string array)
 */
function input_moveTo_center(box, subject_array) {
    for (let i = 0; i < subject_array.length; i++) {
        let input_select = ":input[name=" + subject_array[i] + "]",
            input_tmp = $(input_select);
        $(input_tmp).prop("checked", true);
    }
    if (box === "plusbox") {
        all_to('plusbox');
    } else if (box === "minusbox") {
        all_to('minusbox');
    }
    let input_tmp = $("#minusbox, #plusbox").children().children(":input");
    for (let i = 0; i < input_tmp.length; i++) {
        $(input_tmp[i]).prop("checked", false);
    }
}

/**
 * 清空两个box
 */
function iiiResetInfo() {
    if (!answer_infos) $("#submit_status_span").hide();
    let input_tmp = $("#minusbox, #plusbox").children().children(":input"),
        input_tmpLen = input_tmp.length;
    for (let i = 0; i < input_tmpLen; i++) {
        $(input_tmp[i]).prop("checked", true);
    }
    to_all('plusbox');
    to_all('minusbox');
    $("#allbox").find("input").prop("checked", false);
}

/**
 *  穿梭框
 */
function all_to(obj) {
    let $objbox = $('#' + obj),
        $allboxChecked = $('#allbox input:checked');
    for (let i = 0; i < $allboxChecked.length; i++) {
        $objbox.append(
            $($allboxChecked[i]).parent()
        );
    }
}

function to_all(obj) {
    let $objboxChecked = $('#' + obj + ' input:checked');
    for (let i = 0; i < $objboxChecked.length; i++) {
        let data_type = $($objboxChecked[i]).attr("data-type"),
            objbox = $('#' + data_type);
        objbox.append(
            $($objboxChecked[i]).parent()
        );
    }
}