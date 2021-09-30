let acc_document_infos = Array(),
    acc_document_confirmed = Array(),
    acc_document_saved = Array(),
    permission = Array(),
    answer_infos = "",
    scores = "",
    row_num = 2,
    fileContent
    ;

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
    DisableButton(false);

    let data = {};
    let file = {filename: "", content: "[]"};
    //提交保存数据
    if (submit_type == 'save') {
        data = viGetInput();
        data["submit_type"] = submit_type;

    }

    //提交提交数据
    if (submit_type == 'confirm') {
        let allData = [];
        let emptyinfos = {
            "doc_no": '',
            "date": '',
            "doc_nums": '',
            "contents": [],
            "filename": ''
        };

        //拷贝数据
        acc_document_infos.forEach(function (item) {
            allData.push(item);
        })
        for (i = 0; i < 20; i++) {
            if (!allData[i]) {

                allData[i] = emptyinfos
            }
        }
        nowPageData = viGetInput();
        allData[19] = nowPageData.acc_document_infos;

        allData.forEach(function (item, index) {
            if (item.date) {
                item.date = formatDate(item.date)
            }

            if (index < 19) {
                item.file = file
            }
        })


        data["acc_document_infos"] = allData;
        data["submit_type"] = submit_type;

    }
    console.log(data)
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
    if (nowBusinessNo == 20) {
        $("button[data-confirm]").show();
    } else {
        $("button[data-confirm]").hide();
    }
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
    permission = data ? data["permission"] : permission;

    //填充团队题目
    $("#selfQuestion").html('' + permission.map((cur) => {
        return cur + 1
    }).sort((a, b) => {
        return a - b
    }).join(","));

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
            nowTotalScore = scores[3 * index + 2],
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
 * 从后端获取文件
 */
function get_File(control) {
    let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text()),
        data = {"business_no": nowBusinessNo};

    data = JSON.stringify(data);
    function successFunc(data) {
        let file = data["file"],
            filename = file["filename"],
            content = file["content"],
            arrayBuffer = new Uint8Array(JSON.parse(content)).buffer;
        control(arrayBuffer, filename);
    }
    // 获取数据
    let url = "/download_acc_document_info",
        messageDivID = "download_message";
    get_info(data, url, successFunc, messageDivID);

}


/**
 * 下载文件
 */
function vi_downloadFile() {

    get_File(control);

    function control(arrayBuffer, filename) {

        downloadFile(arrayBuffer, filename);
    }


}

//获取临时url
function getObjectURL(file) {
    var url = null;
    if (window.createObjectURL != undefined) { // basic
        url = window.createObjectURL(file);
    } else if (window.URL != undefined) { // mozilla(firefox)
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL != undefined) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}

/**
 * 预览文件
 */
function previewpic() {

    get_File(control);

    function control(arrayBuffer, filename) {

        let blob = new Blob([arrayBuffer], {type: "application/jpg;charset=UTF-8"});

        $('#imga').attr('src', getObjectURL(blob));
        $('#exampleModal').modal('show');
    }

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
    $("button[data-download-file]").click(function () {
        vi_downloadFile();
    });

    pageSplitBind(function (business_no) {

        get_acc_document_info();
        businessLiControl(business_no);

        nowpage = business_no;

    }, 20);
    bind_score("teacher_correct", "acc_document", "correct_message");
    //上传模态框居中
    $('#uploader').on('show.bs.modal', function (e) {
        // 关键代码，如没将modal设置为 block，则$modala_dialog.height() 为零
        $(this).css('display', 'block');
        var modalHeight = $(window).height() / 2 - $('#uploader .modal-dialog').height() / 2;
        $(this).find('.modal-dialog').css({
            'margin-top': modalHeight
        });
    });
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
        "<td colspan='10' id='borrow" + row_num + "' style='display: none;'  ></td>" +
        "<td class='borrow" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='borrow" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='borrow" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='borrow" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='borrow" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='borrow" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='borrow" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='borrow" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='borrow" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='borrow" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td colspan='10' id='lend" + row_num + "' style='display: none;' ></td>" +
        "<td class='lend" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='lend" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='lend" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='lend" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='lend" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='lend" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='lend" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='lend" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='lend" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>" +
        "<td class='lend" + row_num + "' onclick='input_replace_on(event)'><label><input onkeyup='limit_number(this)'></label></td>"
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
        if (file.size / 1024 > 100) { //大于100k，进行压缩上传
            photoCompress(file, {
                quality: 0.2
            }, function (base64Codes) {
                let bl = convertBase64UrlToBlob(base64Codes);

                reader.readAsArrayBuffer(bl);
                reader.onload = function (e) {
                    // get file content
                    let content = e.target.result;
                    fileContent = {"filename": name, "content": content};
                }
            });
        } else {
            reader.readAsArrayBuffer(file);
            reader.onload = function (e) {
                // get file content
                let content = e.target.result;
                fileContent = {"filename": name, "content": content};
            }
        }

    }

    for (let i = 0; i < files.length; i++) {
        setupReader(files[i]);
    }
}

/**
 *压缩图片
 *三个参数
 *file：一个是文件(类型是图片格式)，
 *w：一个是文件压缩的后宽度，宽度越小，字节越小
 *objDiv：一个是容器或者回调函数
 *photoCompress()
 **/
function photoCompress(file, w, objDiv) {
    let ready = new FileReader();
    ready.readAsDataURL(file);
    ready.onload = function () {
        let re = this.result;
        canvasDataURL(re, w, objDiv)
    }
}
function canvasDataURL(path, obj, callback) {
    let img = new Image();
    img.src = path;
    img.onload = function () {
        let that = this;
        // 默认按比例压缩
        let w = that.width,
            h = that.height,
            scale = w / h;
        w = obj.width || w;
        h = obj.height || (w / scale);
        let quality = 0.7;  // 默认图片质量为0.7
        //生成canvas
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        // 创建属性节点
        let anw = document.createAttribute("width");
        anw.nodeValue = w;
        let anh = document.createAttribute("height");
        anh.nodeValue = h;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        ctx.drawImage(that, 0, 0, w, h);
        // 图像质量
        if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
            quality = obj.quality;
        }
        // quality值越小，所绘制出的图像越模糊
        let base64 = canvas.toDataURL('image/jpeg', quality);
        // 回调函数返回base64的值
        callback(base64);
    }
}
/**
 * 将以base64的图片url数据转换为Blob
 * @param urlData
 * 用url方式表示的base64图片数据
 */
function convertBase64UrlToBlob(urlData) {
    let arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
}