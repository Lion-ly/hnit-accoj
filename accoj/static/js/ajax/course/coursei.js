//==================================新增公司==================================//
function submit_company_infos() {
    var data = $('#company_form').serialize();
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
                alert("提交成功");
            } else if (data.hasOwnProperty("err_pos")) {
                var data_err_pos = data["err_pos"];
                for (var x = 0; x < data_err_pos.length; x++) {
                    var err_pos = data_err_pos[x]["err_pos"];
                    $("#" + err_pos).css({"border-style": "solid"});
                }
                alert(data["message"]);
            } else {
                getCompanyInfo();
                alert(data["message"])
            }
        },
        error: function (err) {
            console.log(err.statusText + "异常");
        }
    })

}

function getCompanyInfo() {
    // 获取公司信息
    var data = $.param({"csrf_token": csrf_token});
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
            company_info = data["company_info"];
            for (var prop in company_info) {
                if (!company_info.hasOwnProperty(prop)) continue;
                if (prop === "com_shareholder") {
                    com_shareholders = company_info[prop];
                    for (var i = 0; i < com_shareholders.length; i++) {
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
var rowNumI = 101;

function body_text_append(labelType, content) {
    var rowName = "row-" + rowNumI;
    var bg;
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
    var data = $.param({"business_type": labelType}) + "&" + $.param({"csrf_token": csrf_token});
    $.ajax({
        url: "/add_business",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                content = data["content"];
                body_text_append(labelType, content);
            } else {
                alert(data["message"]);
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
    var rowName = "row-" + rowNumI;
    $("#" + rowName).remove();
}

function i_DeleteRow() {
    // 撤销新增业务
    var data = $.param({"csrf_token": csrf_token});
    $.ajax({
        url: "/revoke_add_business",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                remove_business_row();
            } else {
                alert(data["message"])
            }
        },
        error: function (err) {
            console.log(err.statusText + "异常");
        }
    });
}

function submit_business_infos() {
    // 提交业务信息，提交成功后不可更改
    var data = $.param({"csrf_token": csrf_token});
    $.ajax({
        url: "/submit_business_infos",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            if (data["result"] === true) {
                $("#submit_business_button").attr("disable", "disable");
            } else {
                alert(data["message"]);
            }
        },
        error: function (err) {
            console.log(err.statusText + "异常")
        }
    });
}

function get_business_infos() {
    // 获取业务内容信息
    var data = $.param({"csrf_token": csrf_token});
    $.ajax({
        url: "/get_business_infos",
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
                content_list = data["content_list"];
                for (var i in content_list) {
                    if (!content_list.hasOwnProperty(i)) continue;
                    var labelType = content_list[i]["business_type"],
                        content = content_list[i]["content"];
                    body_text_append(labelType, content);
                }
                if (data["business_confirm"]) {
                    $("#submit_business_button").attr("disable", "disable");
                }
            } else {
                if (data["message"] !== "暂无业务")
                    alert(data["message"]);
            }
        },
        error: function (err) {
            console.log(err.statusText + "异常")
        }
    });
}