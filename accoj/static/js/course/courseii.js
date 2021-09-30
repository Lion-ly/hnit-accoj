let key_element_infos = Array(), // 保存本次课程全部信息，减少后端数据请求次数，分页由前端完成
    key_element_confirmed = Array(),
    key_element_saved = Array(),
    permission = Array(),
    answer_infos = "",
    scores = "";
$(document).ready(function () {
    function init() {
        iiBind();
        getBusinessList();
        get_key_element_info(true);
    }

    init();
});

//==================================提交会计要素信息==================================//
/**
 * 提交会计要素信息
 * @param submit_type confirm or save
 */
function submit_key_element_info(submit_type) {
    let data = {};
    let emptyinfos = {"affect_type": 0, "info": []};
    //提交保存数据
    if (submit_type == 'save') {
        data = iiGetInput();
        data["submit_type"] = submit_type;

    }
    //提交提交数据
    if (submit_type == 'confirm') {
        data["key_element_infos"] = key_element_infos;
        data["submit_type"] = submit_type;
        for (let i = 0; i < 20; i++) {
            if (!data.key_element_infos[i]) {
                data.key_element_infos[i] = emptyinfos
            }
        }
    }
    data = JSON.stringify(data);

    // 提交数据
    let url = "/submit_key_element_info",
        messageDivID = "course_ii_message",
        successFunc = get_key_element_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);

}

//==================================获取会计要素信息==================================//
/**
 * 从后端获取会计要素信息
 */
function get_key_element_info(isFromSubmit = false) {
    iiDisabledInput(false);
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text());

    if (nowBusinessNo < 0 || nowBusinessNo > 20) {
        return;
    }
    if (nowBusinessNo == 20) {
        $("button[data-confirm]").show();
    } else {
        $("button[data-confirm]").hide();
    }


    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!key_element_saved.length || key_element_saved.indexOf(nowBusinessNo - 1) === -1) {
            //  若未保存，则不向后台请求数, 清空信息
            iiResetInfo();
            return;
        }
    }

    // 若请求的业务编号已经确认提交过，则不再发送数据请求
    if (key_element_confirmed.length > 0 && key_element_confirmed.indexOf(nowBusinessNo - 1) !== -1) {
        map_key_element_info();
        return;
    }
    // 获取数据
    let data = {},

        url = "/get_key_element_info",
        successFunc = map_key_element_info,
        messageDivID = "course_ii_message";
    get_info(data, url, successFunc, messageDivID);

}

/**
 * 将数据映射到前端
 * @param data
 * @param isFromButton
 */
function map_key_element_info(data, isFromButton) {
    // 清空信息
    iiResetInfo();
    data = data ? data : "";
    key_element_infos = data ? data["key_element_infos"] : key_element_infos;
    key_element_confirmed = data ? data["key_element_confirmed"] : key_element_confirmed;
    key_element_saved = data ? data["key_element_saved"] : key_element_saved;
    answer_infos = data ? data["answer_infos"] : answer_infos;
    scores = data ? data["scores"] : scores;
    permission = data ? data["permission"] : permission;

    //填充团队题目
    $("#selfQuestion").html('' + permission.map((cur) => {
        return cur + 1
    }).sort((a, b) => {
        return a - b
    }).join(","));

    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        business_index = nowBusinessNo - 1,
        confirmed = key_element_confirmed ? key_element_confirmed.indexOf(business_index) !== -1 : false,
        saved = key_element_saved ? key_element_saved.indexOf(business_index) !== -1 : false;
    if (answer_infos) {
        showAnswerButton();
        confirmed = true;
        saved = true;
        isFromButton = 1;
        $("button[data-answer]").text("查看答案");
    }
    // `完成状态`标签控制
    spanStatusCtr(confirmed, saved, "submit_status_span");

    // 如果已保存
    if (saved) iiPaddingData(key_element_infos, isFromButton);
}


// ===============================获取和填充数据===============================//
/**
 * 获取数据
 * @returns {Object}
 */
function iiGetInput() {
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        business_no = nowBusinessNo,
        key_element_infos = Array(),
        aers = $("input[id^=aer]"),
        aers_len = aers.length,
        check_box = $("input[id^=check]"),
        check_box_len = check_box.length,
        affect_type,
        data;

    // 获取对会计等式影响类型的选项
    for (let i = 0; i < aers_len; i++) {
        if ($(aers[i]).is(":checked")) {
            affect_type = $(aers[i]).val();
            break;
        }
    }
    affect_type = parseInt(affect_type);
    // 获取已勾选的要素选项
    for (let i = 0; i < check_box_len; i++) {
        if ($(check_box[i]).is(':checked')) {
            let key_elem_id = "key_elem" + (i + 1),
                key_elem = $("#" + key_elem_id),
                key_element = key_elem.attr("name"),
                is_up = key_element[0] === "+",
                money = parseFloat(key_elem.val());
            key_element = key_element.replace(/^\+|^-/, "");
            key_element_infos.push({"key_element": key_element, "money": money, "is_up": is_up});
        }
    }
    key_element_infos = {"affect_type": affect_type, "info": key_element_infos};

    data = {
        "key_element_infos": key_element_infos,
        "business_no": business_no,
    };
    return data;
}

/**
 * 填充数据
 * @param data
 * @param isFromButton
 */
function iiPaddingData(data, isFromButton) {
    function padding(t_data) {
        let affect_type = t_data["affect_type"],
            key_element_info = t_data["info"],
            key_element_num_dict = {"资产": 1, "负债": 3, "收入": 5, "费用": 7, "利润": 9, "所有者权益": 11},
            $affect_type = $("#" + "aer" + affect_type),
            error_pos = Array();
        // 填充影响类型
        $affect_type.prop("checked", true);
        if (isFromButton === 1) {
            if (answer_info["affect_type"] !== affect_type && answer_info["affect_type"])
                hasError($affect_type);
            answer_info = answer_info["info"];
            t_infoLen = answer_info.length;
        }
        // 填充会计要素信息
        let infoLen = key_element_info.length,
            j = 0, flag = false;
        for (let i = 0; i < infoLen; i++) {
            let key_element = key_element_info[i]["key_element"],
                money = key_element_info[i]["money"],
                is_up = key_element_info[i]["is_up"],
                key_element_num = key_element_num_dict[key_element];

            if (!is_up) key_element_num = key_element_num_dict[key_element] + 1;
            let key_element_id = "key_elem" + key_element_num,
                check_id = "check" + key_element_num;
            let $checkbox = $("#" + check_id),
                $key_element = $("#" + key_element_id);
            $checkbox.prop("checked", true);
            $key_element.val(money);

            if (isFromButton === 1) {
                for (j = 0; j < t_infoLen; j++) {
                    let t_key_element = answer_info[j]["key_element"];
                    let t_is_up = answer_info[j]["is_up"];

                    if (t_key_element === key_element && t_is_up === is_up) {
                        let t_money = answer_info[j]["money"];
                        flag = money === t_money;
                        break;
                    }
                }
                if (!flag) error_pos.push($key_element);
            }
        }
        if (isFromButton === 1) {
            for (let i = 0; i < t_infoLen; i++) {
                let t_key_element = answer_info[i]["key_element"],
                    t_is_up = answer_info[i]["is_up"],
                    t_money = answer_info[i]["money"];


                flag = false;
                for (j = 0; j < infoLen; j++) {
                    let key_element = key_element_info[j]["key_element"],
                        is_up = key_element_info[j]["is_up"],
                        money = key_element_info[j]["money"];

                    if (key_element === t_key_element && t_is_up === is_up) {
                        flag = money === t_money;
                        break;
                    }
                }
                if (!flag) {
                    let key_element_num = key_element_num_dict[t_key_element];
                    if (!t_is_up) key_element_num = key_element_num_dict[t_key_element] + 1;
                    let key_element_id = "key_elem" + key_element_num,
                        $key_element = $("#" + key_element_id);
                    error_pos.push($key_element);
                }
            }
            // 标出错误位置
            for (let i = 0; i < error_pos.length; i++) hasError(error_pos[i]);
        }
        // if (key_element_confirmed.indexOf(index) !== -1) iiDisabledInput(true);
        if (key_element_confirmed.length > 0) iiDisabledInput(true);
    }

    if (!data && !isFromButton) return;
    if (isFromButton) removeAllError();
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        index = nowBusinessNo - 1, t_infoLen = 0, answer_info = "";
    if (isFromButton) {
        let nowScore = scores[index * 2],
            nowTotalScore = scores[index * 2 + 1],
            totalScore = scores[scores.length - 1];
        showScoreEm(nowScore, nowTotalScore, totalScore);
        if (isFromButton === 1) answer_info = answer_infos[index];
        else if (isFromButton === 2) iiResetInfo();
    }
    data = data[index];
    padding(data);
}

// ==================================事件控制==================================//
/**
 * 事件绑定
 */
function iiBind() {
    function map_answer() {
        spanStatusCtr(true, true, "submit_status_span");
        iiPaddingData(answer_infos, 2);
    }

    bind_confirm_info("submit_key_element_info");
    bind_save_info(submit_key_element_info);
    bindAnswerSource("", map_key_element_info, map_answer);
    bindRealNumber();
    pageSplitBind(function (business_no) {
        businessLiControl(business_no);
        get_key_element_info();
    }, 20);
}

/**
 * 清空会计要素信息
 */
function iiResetInfo() {
    if (!answer_infos) $("#submit_status_span").hide();
    $("[id^=key_elem]").val("");
    $("[id^=check]").prop("checked", false);
    $("#aer1").prop("checked", true);
}

/**
 * 禁用编辑
 */
function iiDisabledInput(flag) {
    let $aers = $("input[id^=aer]"),
        $check_box = $("input[id^=check]"),
        $key_elem = $("[id^=key_elem]"),
        $button = $("button[data-save], button[data-confirm]");
    flag = flag ? flag : false;
    $button.prop("disabled", flag);
    $aers.prop("disabled", flag);
    $check_box.prop("disabled", flag);
    if (flag) $key_elem.attr("readonly", "readonly");
    else $key_elem.removeAttr("readonly");
    $key_elem.addClass("acc-white-bg");
}