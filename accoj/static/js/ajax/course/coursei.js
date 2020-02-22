//==================================新增公司==================================//
$(document).ready(function () {
   get_company_info();
});
function company_form_submit() {
    let data = $('#company_form').serialize();
    // 提交表单
    $.ajax({
        url: "/company_form_submit",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                $(":text").css({"border-style": "none"});
                $("#com_business_scope").css({"border-style": "none"});
                $("#submit_company_button").attr("disabled", true);
                show_message("submit_company_button_div", "提交成功", "info", 1000);
                //alert("提交成功");
            } else if (data.hasOwnProperty("err_pos")) {
                let data_err_pos = data["err_pos"];
                for (let x = 0; x < data_err_pos.length; x++) {
                    let err_pos = data_err_pos[x]["err_pos"];
                    $("#" + err_pos).css({"border-style": "solid"});
                }
                show_message("submit_company_button_div", data["message"], "danger", 1000);
            } else {
                get_company_info();
                show_message("submit_company_button_div", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText + "异常");
        }
    })

}

function get_company_info() {
    // 获取公司信息
    let data = $.param({"csrf_token": csrf_token});
    $.ajax({
        url: "/get_company_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            // 公司已经创立过，将值填充，表单不可编辑
            $("#submit_company_button").attr("disabled", true);
            $(":text").attr("readonly", "readonly");
            $("textarea").attr("readonly", "readonly");
            let company_info = data["company_info"];
            for (let prop in company_info) {
                if (!company_info.hasOwnProperty(prop)) continue;
                if (prop === "com_shareholder") {
                    let com_shareholders = company_info[prop];
                    for (let i = 0; i < com_shareholders.length; i++) {
                        $("#com_shareholder_" + (i + 1)).val(com_shareholders[i]);
                    }
                } else {
                    $("#" + prop).val(company_info[prop]);
                }
            }
        },
        error: function (err) {
            console.log(err.statusText + "异常");
        }
    })

}

//==================================新增业务==================================//
let rowNumI = 101;

function body_text_append(labelType, content) {
    let rowName = "row-" + rowNumI;
    let bg;
    switch (labelType) {
        case "筹资活动":
            bg = "#5cb85c";
            break;
        case "投资活动":
            bg = "#5bc0de";
            break;
        case "经营活动":
            bg = "#f0ad4e";
            break;
    }
    $("#body-text").append(
        "<tr id='" + rowName + "'>"
        + "<th style='background-color: " + bg + ";width: 5%'>"
        + labelType
        + "</th>"
        + "<td style='text-align: left'>"
        + content
        + "</td>"
        +
        +"</tr>"
    );
    rowNumI++;
}

function addActivity(labelType) {
    // 新增业务
    let data = $.param({"business_type": labelType}) + "&" + $.param({"csrf_token": csrf_token});
    $.ajax({
        url: "/add_business",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                let content = data["content"];
                if (content.match("月1日")) {
                    labelType = "筹资活动";
                }
                body_text_append(labelType, content);
            } else {
                show_message("add_business_message", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText + "异常");
        }
    });
}

function remove_business_row() {
    if (rowNumI - 1 < 101) {
        rowNumI = 101;
    } else {
        rowNumI = rowNumI - 1;
    }
    let rowName = "row-" + rowNumI;
    $("#" + rowName).remove();
}

function revoke_add_business() {
    // 撤销新增业务
    let data = $.param({"csrf_token": csrf_token});
    $.ajax({
        url: "/revoke_add_business",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                show_message("add_business_message", data["message"], "info", 500);
                remove_business_row();
            } else {
                show_message("add_business_message", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText + "异常");
        }
    });
}

function submit_business_infos() {
    // 提交业务信息，提交成功后不可更改
    let data = $.param({"csrf_token": csrf_token});
    $.ajax({
        url: "/submit_business_infos",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                // $("#submit_business_button").attr("disable", "disable");
                show_message("submit_business_button_div", data["message"], "info", 1000);
            } else {
                show_message("submit_business_button_div", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText + "异常")
        }
    });
}

function get_business_info() {
    // 获取业务内容信息
    let data = $.param({"csrf_token": csrf_token});
    $.ajax({
        url: "/get_business_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                while (rowNumI > 101) {
                    remove_business_row();
                }
                let content_list = data["content_list"];
                for (let i in content_list) {
                    if (!content_list.hasOwnProperty(i)) continue;
                    let labelType = content_list[i]["business_type"],
                        content = content_list[i]["content"];
                    body_text_append(labelType, content);
                }
            } else {
                if (data["message"] !== "暂无业务")
                    show_message("submit_business_button_div", data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText + "异常")
        }
    });
}