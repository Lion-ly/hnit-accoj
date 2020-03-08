// 页面加载完成填充数据
$(document).ready(function () {
    get_acc_document_info(1);
});
let fileContent = "";
//==================================提交会计凭证信息==================================//
let now_business_no = 1;

/**
 * 分页标签li的激活状态控制
 */
function courseiv_li_control(business_no) {
    // 移除激活的li的.active
    $("li[id^=courseiv_split_li][class=active]").removeClass("active");
    let add_li_id = "courseiv_split_li_" + business_no;
    // 给当前li添加.active
    $("#" + add_li_id).addClass("active");
}

/**
 * 将处理函数绑定到模态框的确认提交按钮
 */
function confirm_acc_document() {
    show_submit_confirm("submit_acc_document_info('confirm')");
    let confirm_acc_document_button = $("#confirm_acc_document_button");
    confirm_acc_document_button.attr("disabled", true);
    confirm_acc_document_button.text("提交 2s");
    setTimeout(function () {
        confirm_acc_document_button.text("提交 1s");
    }, 1000);
    setTimeout(function () {
        confirm_acc_document_button.attr("disabled", false);
        confirm_acc_document_button.text("提交");
    }, 2000);
}

/**
 * 保存凭证信息
 */
function save_acc_document() {
    submit_acc_document_info("save");
    let save_acc_document_button = $("#save_acc_document_button");
    save_acc_document_button.attr("disabled", true);
    save_acc_document_button.text("保存 2s");
    setTimeout(function () {
        save_acc_document_button.text("保存 1s");
    }, 1000);
    setTimeout(function () {
        save_acc_document_button.attr("disabled", false);
        save_acc_document_button.text("保存");
    }, 2000);
}

/**
 * 提交会计凭证信息
 * @param submit_type confirm or save
 */
function submit_acc_document_info(submit_type) {
    let type_flag = null;
    if (submit_type === "confirm") {
        type_flag = true;
    } else if (submit_type === "save") {
        type_flag = false;
    } else {
        return;
    }
    let csrf_token = get_csrf_token();
    let business_no = now_business_no;
    let data, acc_document_infos;
    let doc_no;                     // 会计凭证编号
    let date;                       // 日期
    let doc_nums;                   // 单据数量
    let contents = Array();

    doc_no = $("input[name=doc_no]").val();
    date = $("input[name=date]").val();
    doc_nums = $("input[name=doc_nums]").val();

    $("tr[id^=vi_row]").each(function () {
            let summary;            //摘要
            let general_account;    //总账科目
            let detail_account;     //明细科目
            let dr_money = "";       //借方金额
            let cr_money = "";       //贷方金额
            let thisId = $(this).attr("id");
            let thisInput = $(this).find("input");
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
            dr_money = dr_money ? dr_money / 100 : dr_money;
            cr_money = cr_money ? cr_money / 100 : cr_money;
            contents.push({
                "summary": summary,
                "general_account": general_account,
                "detail_account": detail_account,
                "dr_money": parseInt(dr_money),
                "cr_money": parseInt(cr_money)
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
        "submit_type": submit_type,
        "business_no": business_no
    };
    data = JSON.stringify(data);

    $.ajax({
        url: "/submit_acc_document_info",
        type: "post",
        data: data,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        cache: false,
        async: true,
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        },
        success: function (data) {
            if (data["result"] === true) {
                if (type_flag === true) {
                    show_message("submit_confirm_message", "提交成功！", "info", 1000);
                } else if (type_flag === false) {
                    show_message("course_vi_message", "保存成功！", "info", 1000);
                }
                get_acc_document_info(business_no);
            } else {
                if (type_flag === true) {
                    show_message("submit_confirm_message", data["message"], "danger", 1000, "提交失败！");
                } else if (type_flag === false) {
                    show_message("course_vi_message", data["message"], "danger", 1000, "保存失败！");
                }
            }
        },
        error: function (err) {
            console.log(err.statusText);
        },
        complete: function () {
            submit_confirm_clicked();
        }
    });
}

//==================================获取会计凭证信息==================================//
let business_list; // 保存本次课程全部信息，减少后端数据请求次数，分页由前端完成
/**
 * 从后端获取会计凭证信息
 * @param business_no
 */
function get_acc_document_info(business_no) {
    now_business_no = parseInt(business_no);
    if (now_business_no < 0 || now_business_no > 20) {
        return;
    }
    courseiv_li_control(business_no);
    let csrf_token = {"csrf_token": get_csrf_token()};
    let data = $.param(csrf_token);
    // 若business_list不为空且请求的业务编号已经确认提交过，则不再发送数据请求
    if (business_list && business_list[now_business_no - 1]["confirmed"] === true) {
        map_acc_document_info(business_no);
        return;
    }
    $.ajax({
        url: "/get_acc_document_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                business_list = data["business_list"];
                map_acc_document_info(business_no);
            } else {
                show_message("course_vi_message", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })
}

/**
 * 将数据映射到前端
 * @param business_no
 */
function map_acc_document_info(business_no) {
    business_no = parseInt(business_no);
    let business_index = business_no - 1;
    // 先重置凭证信息
    $("tr[id^=vi_row][id!=vi_row1][id!=vi_rowLast]").remove();
    $(":input").val("");

    let content = business_list[business_index]["content"];
    let business_type = business_list[business_index]["business_type"];
    let confirmed = business_list[business_index]["confirmed"];
    let saved = business_list[business_index]["saved"];
    let acc_document_infos = business_list[business_index]["acc_document_infos"];
    if (acc_document_infos) {
        let filename = acc_document_infos["filename"];
        if (filename) {
            $("#vi_downloadFile_button").show();
            $("#vi_downloadSpan").text(filename);
        }
    } else {
        $("#vi_downloadFile_button").hide();
        $("#vi_downloadSpan").text("")
    }
    let em_no = business_index + 1;
    // 填充业务编号
    em_no = em_no < 10 ? "0" + em_no : em_no;
    $("#em_6").text(em_no);
    // 填充活动类型
    let business_type_6 = $("#business_type_6");
    business_type_6.removeClass();
    let business_type_class = "label label-" + "success"; //  初始化为筹资活动
    if (business_type === "投资活动") {
        business_type_class = "label label-" + "info";
    } else if (business_type === "经营活动") {
        business_type_class = "label label-" + "warning";
    }
    business_type_6.addClass(business_type_class);
    business_type_6.text(business_type);

    // 如果已保存过则显示标签为保存状态，已提交过则更改标签为已提交标签
    let acc_document_submit_span = $("#acc_document_submit_span");
    if (confirmed || saved) {
        // 初始化为saved
        let span_text = "已保存";
        let span_color = "#5bc0de";
        if (confirmed) {
            span_text = "已完成";
            span_color = "#5cb85c";
        }
        acc_document_submit_span.css("color", span_color);
        acc_document_submit_span.text(span_text);
        acc_document_submit_span.show();
    } else {
        acc_document_submit_span.hide();
    }
    // 填充业务内容
    $("#business_content_6").text(content);

    // 填充会计凭证信息
    if (!acc_document_infos) {
        // 凭证信息为空则返回
        return;
    }
    let doc_no = acc_document_infos["doc_no"];
    let date = acc_document_infos["date"];
    let doc_nums = acc_document_infos["doc_nums"];
    let contents = acc_document_infos["contents"];
    date = formatDate(date);
    $("input[name=doc_no]").val(doc_no);
    $("input[name=date]").val(date);
    $("input[name=doc_nums]").val(doc_nums);

    // 添加行
    for (let i = 1; i < contents.length - 1; i++) {
        vi_AddRow();
    }

    let contents_index = 0;
    $("tr[id^=vi_row]").each(function () {
            let summary = contents[contents_index]["summary"];                      //摘要
            let general_account = contents[contents_index]["general_account"];      //总账科目
            let detail_account = contents[contents_index]["detail_account"];        //明细科目
            let dr_money = contents[contents_index]["dr_money"];                    //借方金额
            let cr_money = contents[contents_index]["cr_money"];                    //贷方金额
            let thisId = $(this).attr("id");
            let thisInput = $(this).find("input");
            let prefix = "0000000000";
            dr_money = dr_money ? dr_money * 100 : dr_money;
            cr_money = cr_money ? cr_money * 100 : cr_money;
            dr_money = dr_money ? dr_money.toString() : dr_money;
            cr_money = cr_money ? cr_money.toString() : cr_money;
            dr_money = dr_money ? prefix.substring(0, 10 - dr_money.length) + dr_money : dr_money;
            cr_money = cr_money ? prefix.substring(0, 10 - cr_money.length) + cr_money : cr_money;
            let money = dr_money ? dr_money : "";
            money += cr_money ? cr_money : "";
            let firstNum = true;
            if (thisId === "vi_rowLast") {
                for (let i = 0; i < 20; i++) {
                    if (money) {
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
}


function vi_downloadFile() {
    let business_no = now_business_no;
    let csrf_token = {"csrf_token": get_csrf_token()};
    let data = $.param(csrf_token) + "&" + $.param({"business_no": business_no});
    $.ajax({
        url: "/download_acc_document_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                let file = data["file"];
                let filename = file["filename"];
                let content = file["content"];
                let arrayBuffer = new Uint8Array(JSON.parse(content)).buffer;
                downloadFile(arrayBuffer, filename);
            } else {
                show_message("course_vi_message", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })
}

// ==================================事件控制==================================//
let row_num = 2;

/*
 * @ # coursevi ? 表格增加行
 */
function vi_AddRow() {
    $("#vi_rowLast").before(
        "<tr id='vi_row" + row_num + "'>"
        + "<td><label><input name=\"summary\" onkeyup=\"illegalCharFilter(this)\"></label></td>" +
        "<td><label><input name=\"general_account\" onkeyup=\"illegalCharFilter(this)\"></label></td>" +
        "<td><label><input name=\"detail_account\" onkeyup=\"illegalCharFilter(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>" +
        "<td><label><input onkeyup=\"limit_number(this)\"></label></td>"
        + "<th style='width: 4%; border: 0; background: #ffffff;padding: 4px'>"
        + "<div style='text-align: center'>"
        + "<a style='color: red; padding: 0 0' type='button' "
        + "class='btn' onclick='vi_DeleteRow(this)'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>"
        + "</th>"
        + "</tr>"
    );
    row_num++;
}


/*
 * @ # coursevi ? 表格删除行
 */
function vi_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}

/**
 * 返回包含文件名和文件内容的Array
 */
function getfileContents() {
    let files = $("#uploadFiles").prop("files");

    function setupReader(file) {
        let reader = new FileReader();
        let name = file.name;
        reader.readAsArrayBuffer(file);
        reader.onload = function (e) {
            // get file content
            let content = e.target.result;
            fileContent = {"filename": name, "content": content};
        }
    }

    for (let i = 0; i < files.length; i++) {
        setupReader(files[i]);
    }
}
