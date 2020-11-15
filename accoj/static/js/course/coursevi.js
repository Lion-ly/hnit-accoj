let acc_document_infos = Array(),
    acc_document_confirmed = Array(),
    acc_document_saved = Array(),
    answer_infos = "",
    scores = "",
    row_num = 2,
    fileContent;

$(document).ready(function () {
    function init() {
        viBind();
        getBusinessList();
        get_acc_document_info(true);
    }

    init();
});

//==================================提交会计凭证信息==================================//
/**
 * 提交会计凭证信息
 * @param submit_type confirm or save
 */
function submit_acc_document_info(submit_type) {
    let data = viGetInput();
    data["submit_type"] = submit_type;
    data = JSON.stringify(data);
    // 提交数据
    let url = "/submit_acc_document_info",
        messageDivID = "course_vi_message",
        successFunc = get_acc_document_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

//==================================获取会计凭证信息==================================//
/**
 * 从后端获取会计凭证信息
 */
function get_acc_document_info(isFromSubmit = false) {
    DisableButton(false);
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text());
    if (nowBusinessNo < 0 || nowBusinessNo > 20) return;
    if (!isFromSubmit) {
        //  若不是从按钮或第一次加载调用
        if (!acc_document_saved.length || acc_document_saved.indexOf(nowBusinessNo - 1) === -1) {
            //  若未保存，则不向后台请求数据
            viResetInfo();
            return;
        }
    }
    // 若请求的业务编号已经确认提交过，则不再发送数据请求
    if (acc_document_confirmed.length > 0 && acc_document_confirmed.indexOf(nowBusinessNo - 1) !== -1) {
        map_acc_document_info();
        return;
    }
    // 获取数据
    let data = {},
        url = "/get_acc_document_info",
        successFunc = map_acc_document_info,
        messageDivID = "course_vi_message";
    get_info(data, url, successFunc, messageDivID);
}

/**
 * 将数据映射到前端
 * @param data
 * @param isFromButton
 */
function map_acc_document_info(data, isFromButton) {
    viResetInfo();
    data = data ? data : "";
    acc_document_infos = data ? data["acc_document_infos"] : acc_document_infos;
    acc_document_confirmed = data ? data["acc_document_confirmed"] : acc_document_confirmed;
    acc_document_saved = data ? data["acc_document_saved"] : acc_document_saved;
    answer_infos = data ? data["answer_infos"] : answer_infos;
    scores = data ? data["scores"] : scores;

    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        business_index = nowBusinessNo - 1,
        confirmed = acc_document_confirmed ? acc_document_confirmed.indexOf(business_index) !== -1 : false,
        saved = acc_document_saved ? acc_document_saved.indexOf(business_index) !== -1 : false;
    if (confirmed) DisableButton(true);
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
    if (saved) viPaddingData(acc_document_infos, isFromButton);
}

// ===============================获取和填充数据===============================//
/**
 * 获取数据
 * @returns {Object}
 */
function viGetInput() {
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        business_no = nowBusinessNo,
        data, acc_document_infos,
        doc_no,                     // 会计凭证编号
        date,                       // 日期
        doc_nums,                   // 单据数量
        contents = Array();

    doc_no = $("input[name=doc_no]").val();
    date = $("input[name=date]").val();
    doc_nums = $("input[name=doc_nums]").val();

    $("tr[id^=vi_row]").each(function () {
            let summary,             //摘要
                general_account,     //总账科目
                detail_account,      //明细科目
                dr_money = "",       //借方金额
                cr_money = "",       //贷方金额
                thisId = $(this).attr("id"),
                thisInput = $(this).find("input");
            if (thisId === "vi_rowLast") {
                summary = general_account = detail_account = "sum";
                for (let i = 0; i < 20; i++) {
                    let money = $(thisInput[i]).val();
                    dr_money += i < 10 ? money : "";
                    cr_money += i < 10 ? "" : money;
                }
            } else {
                summary = $(thisInput[0]).val();
                general_account = $(thisInput[1]).val();
                detail_account = $(thisInput[2]).val();
                for (let i = 3; i < 23; i++) {
                    let money = $(thisInput[i]).val();
                    dr_money += i < 13 ? money : "";
                    cr_money += i < 13 ? "" : money;
                }
            }
            dr_money = dr_money ? parseFloat(dr_money) / 100 : dr_money;
            cr_money = cr_money ? parseFloat(cr_money) / 100 : cr_money;
            contents.push({
                "summary": summary,
                "general_account": general_account,
                "detail_account": detail_account,
                "dr_money": dr_money,
                "cr_money": cr_money
            })
        }
    );
    fileContent = fileContent ? fileContent : {"filename": "", "content": ""};
    let filename = fileContent["filename"] ? fileContent["filename"] : $("#vi_downloadSpan").text();
    fileContent["content"] = JSON.stringify(Array.from(new Uint8Array(fileContent["content"])));

    acc_document_infos = {
        "doc_no": doc_no,
        "date": date,
        "doc_nums": doc_nums,
        "contents": contents,
        "file": fileContent,
        "filename": filename
    };
    data = {
        "acc_document_infos": acc_document_infos,
        "business_no": business_no
    };
    return data;
}

/**
 * 填充数据
 * @param data
 * @param isFromButton
 */
function viPaddingData(data, isFromButton) {
    function padding(t_data) {
        function push_err_pos(iD, fl) {
            if (fl) return;
            let $iD = $("#" + iD);
            error_pos.push($iD);
        }

        let acc_document_info = t_data,
            doc_no = acc_document_info["doc_no"],
            date = acc_document_info["date"],
            doc_nums = acc_document_info["doc_nums"],
            contents = acc_document_info["contents"],
            error_pos = Array(),
            flag = false;
        t_contentLen = isFromButton === 1 ? contents_cp.length : t_contentLen;

        if (acc_document_info) {
            let filename = acc_document_info["filename"];
            if (filename) {
                $("#vi_downloadFile_button").show();
                $("#vi_downloadSpan").text(filename);
            }
        } else {
            $("#vi_downloadFile_button").hide();
            $("#vi_downloadSpan").text("")
        }

        date = date ? formatDate(date) : date;
        $("input[name=doc_no]").val(doc_no);
        $("input[name=date]").val(date);
        $("input[name=doc_nums]").val(doc_nums);

        // 添加行
        for (let i = 1; i < contents.length - 1; i++) vi_AddRow();

        let contents_index = 0;
        $("tr[id^=vi_row]").each(function () {
                let summary = contents[contents_index]["summary"],                      //摘要
                    general_account = contents[contents_index]["general_account"],      //总账科目
                    detail_account = contents[contents_index]["detail_account"],        //明细科目
                    dr_money = contents[contents_index]["dr_money"],                    //借方金额
                    cr_money = contents[contents_index]["cr_money"],                    //贷方金额
                    thisId = $(this).attr("id"),
                    thisInput = $(this).find("input"),
                    prefix = "0000000000";

                if (isFromButton === 1) {
                    //flag = 0;
                    flag = false;
                    for (let i = 0; i < t_contentLen; i++) {
                        let t_general_account = contents_cp[i]["general_account"],
                            t_dr_money = contents_cp[i]["dr_money"],
                            t_cr_money = contents_cp[i]["cr_money"];
                        if (general_account === t_general_account) {
                            // if (dr_money != t_dr_money) flag += 1;
                            // if (cr_money != t_cr_money) flag += 2;
                            if (dr_money == t_dr_money && cr_money == t_cr_money) flag = true;
                            break;
                        }
                    }
                    push_err_pos(thisId, flag);
                }

                dr_money = dr_money ? dr_money * 1000 / 10 : dr_money;
                cr_money = cr_money ? cr_money * 1000 / 10 : cr_money;
                dr_money = dr_money ? parseInt(dr_money).toString() : dr_money;
                cr_money = cr_money ? parseInt(cr_money).toString() : cr_money;
                dr_money = dr_money ? prefix.substring(0, 10 - dr_money.length) + dr_money : dr_money;
                cr_money = cr_money ? prefix.substring(0, 10 - cr_money.length) + cr_money : cr_money;
                let money = dr_money ? dr_money : prefix;
                money += cr_money ? cr_money : "";
                let firstNum = true;
                if (thisId === "vi_rowLast") {
                    for (let i = 0; i < 20; i++) {
                        if (money) {
                            if (i === 10) {
                                firstNum = true;
                            }
                            if (firstNum && money[i] !== "0") {
                                $(thisInput[i]).val(money[i]);
                                firstNum = false;
                            }
                            if (!firstNum && i < money.length)
                                $(thisInput[i]).val(money[i]);
                        }
                    }
                } else {
                    $(thisInput[0]).val(summary);
                    $(thisInput[1]).val(general_account);
                    $(thisInput[2]).val(detail_account);
                    for (let i = 3; i < 23; i++) {
                        if (money) {
                            if (i === 13) {
                                firstNum = true;
                            }
                            if (firstNum && money[i - 3] !== "0") {
                                $(thisInput[i]).val(money[i - 3]);
                                firstNum = false;
                            }
                            if (!firstNum && i < money.length + 3)
                                $(thisInput[i]).val(money[i - 3]);
                        }
                    }
                }
                contents_index++;
            }
        );
        if (isFromButton) viDisabledInput();
        if (isFromButton === 1) for (let i = 0; i < error_pos.length; i++) hasError(error_pos[i]);
    }

    if (!data && !isFromButton) return;
    if (isFromButton) removeAllError();
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        index = nowBusinessNo - 1, t_contentLen = 0, answer_info = "", contents_cp = "";
    if (isFromButton) {
        let nowScore = scores[index * 3],
            nowTotalScore = scores[3*index+2],
            totalScore = scores[scores.length - 1];

        showScoreEm(nowScore, nowTotalScore, totalScore);
        if (isFromButton === 1) {
            answer_info = answer_infos[index];
            contents_cp = answer_info["contents"];
        } else if (isFromButton === 2) viResetInfo();
    }
    data = data[index];
    padding(data);
}

/**
 * 下载文件
 */
function vi_downloadFile() {
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        data = {"business_no": nowBusinessNo};

    data = JSON.stringify(data);

    function successFunc(data) {
        let file = data["file"],
            filename = file["filename"],
            content = file["content"],
            arrayBuffer = new Uint8Array(JSON.parse(content)).buffer;
        downloadFile(arrayBuffer, filename);
    }

    // 获取数据
    let url = "/download_acc_document_info",
        messageDivID = "course_vi_message";
    get_info(data, url, successFunc, messageDivID);
}

// ==================================事件控制==================================//
/**
 * 事件绑定
 */
function viBind() {
    function map_answer() {
        spanStatusCtr(true, true, "submit_status_span");
        viPaddingData(answer_infos, 2);
    }

    bind_confirm_info("submit_acc_document_info");
    bind_save_info(submit_acc_document_info);
    bindAnswerSource("", map_acc_document_info, map_answer);
    bindIllegalCharFilter();
    bindRealNumber();
    bindLimitNumber();
    $("a[data-vi-addRow]").click(function () {
        vi_AddRow();
    });
    $("input[data-get-file]").change(function () {
        getfileContents();
    });
    $("button[data-download-file]").change(function () {
        vi_downloadFile();
    });
    pageSplitBind(function (business_no) {
        businessLiControl(business_no);
        get_acc_document_info();
    }, 20);
    bind_score("teacher_correct", "acc_document", "correct_message")
}

/**
 * 重置凭证信息
 */
function viResetInfo() {
    row_num = 2;
    if (!answer_infos) $("#submit_status_span").hide();
    $("tr[id^=vi_row][id!=vi_row1][id!=vi_rowLast]").remove();
    $("input").val("");
    $("#vi_downloadFile_button").hide();
    $("#vi_downloadSpan").text("");
}

/**
 * 禁用编辑
 */
function viDisabledInput() {
    let $inputs = $("div[class=courseBody]").find("input"),
        $aLabels = $("a[type=button][data-toggle]"),
        $button = $("button[data-save], button[data-confirm]");
    $button.prop("disabled", true);
    $inputs.attr("readonly", "readonly");
    $aLabels.attr({"disabled": true, "onclick": ""});
    $aLabels.unbind("click");
}

/*
 * @ # coursevi ? 表格增加行
 */
function vi_AddRow() {
    $("#vi_rowLast").before(
        "<tr id='vi_row" + row_num + "'>" +
        "<td><label><input name='summary' onkeyup='illegalCharFilter(this)'></label></td>" +
        "<td><label><input name='general_account' onkeyup='illegalCharFilter(this)'></label></td>" +
        "<td><label><input name='detail_account' onkeyup='illegalCharFilter(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<th class='acc-unborder'>"
        + "<div class='acc-minus'>"
        + "<a type='button' "
        + "class='btn' onclick='vi_DeleteRow(this)' data-toggle='tooltip' data-placement='left' title='删除行'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>"
        + "</th>"
        + "</tr>"
    );
    $("#" + "vi_row" + row_num).find("a[data-toggle]").tooltip();
    row_num++;
}


/*
 * @ # coursevi ? 表格删除行
 */
function vi_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}

/**
 * 返回包含文件名和ArrayBuffer类型的文件内容
 */
function getfileContents() {
    let files = $("#uploadFiles").prop("files");

    function setupReader(file) {
        let reader = new FileReader(),
            name = file.name;
        reader.readAsArrayBuffer(file);
        reader.onload = function (e) {
            // get file content
            let content = e.target.result;
            fileContent = {"filename": name, "content": content};
        }
    }

    for (let i = 0; i < files.length; i++) setupReader(files[i]);
}
