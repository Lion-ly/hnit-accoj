let businesses = "",
    business_confirmed = "";
//==================================新增公司==================================//
$(document).ready(function () {
    function init() {
        iBind();
        $("#menu").children().children().each(function (index, item) {
            if (index) $(item).children().attr("data-original-title", "未开放");
        });
        get_company_info();
        get_business_info();
    }

    init();
});

/**
 * 提交公司信息
 */
function submit_company_info(submit_type) {
    function successFunc() {
        $(":text").css({"border-style": "none"});
        $("#com_business_scope").css({"border-style": "none"});
        get_company_info();
    }

    function failedFunc(data) {
        if (data.hasOwnProperty("err_pos")) {
            // 提交失败，标出出错位置
            let data_err_pos = data["err_pos"];
            for (let x = 0; x < data_err_pos.length; x++) {
                let err_pos = data_err_pos[x]["err_pos"];
                hasError($("#" + err_pos), "格式错误");
            }
        }
    }

    // 提交公司信息
    let url = "/submit_company_info",
        data = JSON.stringify(iGetInput()),
        messageDivID = "submit_confirm_message";
    submit_info(submit_type, url, data, messageDivID, successFunc, failedFunc);
}

/**
 * 从后端获取获取公司信息
 */
function get_company_info() {
    let data = {},
        url = "/get_company_info",
        successFunc = paddingCompany,
        messageDivID = "course_i1_message";
    get_info(data, url, successFunc, messageDivID);
}

// ===============================获取和填充数据===============================//
/**
 * 获取数据
 * @returns {Object}
 */
function iGetInput() {
    function getFormData($form) {
        let unindexed_array = $form.serializeArray();
        let indexed_array = {};

        $.map(unindexed_array, function (n, i) {
            indexed_array[n['name']] = n['value'];
        });

        return indexed_array;
    }

    return getFormData($('#company_form'));
}

/**
 * 填充公司信息
 * @param data
 */
function paddingCompany(data) {
    // 公司已经创立过，将值填充，表单不可编辑
    $("#company_confirmed_span").show();
    $(":text").attr("readonly", "readonly");
    $("textarea").attr("readonly", "readonly");
    let company_info = data["company_info"];
    for (let prop in company_info) {
        if (!company_info.hasOwnProperty(prop)) continue;
        if (prop === "com_shareholder") {
            let com_shareholders = company_info[prop];
            for (let i = 0; i < com_shareholders.length; i++) {
                $("#com_shareholder_" + (i + 1)).val(com_shareholders[i]);
                $("#submit_company_button").attr("disabled", "disabled");
            }
        } else {
            $("#" + prop).val(company_info[prop]);
        }
    }
}

//==================================生成业务==================================//
/**
 * 生成业务
 */
function create_business() {
    let data = {},
        url = "/create_business",
        successFunc = get_business_info,
        messageDivID = "create_business_message";
    get_info(data, url, successFunc, messageDivID);
}

/**
 * 提交业务信息，提交成功后不可更改
 */
function submit_business_info(submit_type) {
    let url = "/submit_business_info",
        data = {},
        messageDivID = "submit_confirm_message",
        successFunc = get_business_info;
    submit_info(submit_type, url, data, messageDivID, successFunc);
}

/**
 * 从后端获取获取业务内容信息
 */
function get_business_info() {
    if (business_confirmed) {
        $("#menu").children().children().each(function (index, item) {
            $(item).children().attr("data-original-title", "已开放");
        });
        paddingBusiness();
        return;
    }
    let data = {},
        url = "/get_business_info",
        successFunc = paddingBusiness,
        messageDivID = "course_i2_message";
    get_info(data, url, successFunc, messageDivID);
}

// ===============================获取和填充数据===============================//
/**
 * 填充业务信息
 * @param data
 */
function paddingBusiness(data) {
    businesses = data ? data["businesses"] : businesses;
    business_confirmed = data ? data["confirmed"] : business_confirmed;
    let periodNo = parseInt($("li[data-page-control][class=active]").children().text());
    if (!businesses) return;

    let $createBusiness = $("#createBusiness");
    $("#businessPeriod").show();
    $createBusiness.addClass("btn-warning").removeClass("btn-success");
    $createBusiness.text("重新生成");
    if (business_confirmed) {
        $("#business_confirmed_span").show();
        $createBusiness.attr("disabled", "disabled");
        $("#submit_business_button").attr("disabled", "disabled");
    }
    $("#menu").children().children().each(function (index, item) {
        $(item).children().attr("data-original-title", "已开放");
    });
    resetBusiness();
    let [low, high] = [1, 10];
    if (periodNo === 2) [low, high] = [11, 20];
    for (let i = low; i <= high; i++) {
        let business = businesses[i - 1],
            labelType = business["business_type"],
            content = business["content"];
        body_text_append(labelType, content, i);
    }
}

// ==================================事件控制==================================//
/**
 * 事件绑定
 */
function iBind() {
    // 提交公司信息按钮绑定
    bind_confirm_info("submit_company_info", $("#submit_company_button"));
    // 提交业务信息按钮绑定
    bind_confirm_info("submit_business_info", $("#submit_business_button"));
    $("#createBusiness").click(function () {
        create_business();
    });
    $("#company_form").find("input").each(function (index, item) {
        $(item).focus(function () {
            removeError(item);
        });
    });
    // 分页绑定
    pageSplitBind(function () {
        get_business_info();
    }, 2);
}

/**
 * 增加业务行
 * @param labelType
 * @param content
 * @param businessNo
 */
function body_text_append(labelType, content, businessNo) {
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
        "<tr class='acc-table-format-1-2'>"
        + "<th style='background-color: " + bg + ";'>"
        + labelType
        + "</th>"
        + "<td>"
        + "<strong style='color: " + bg + "'>" + businessNo + ".&nbsp;&nbsp;</strong>"
        + content
        + "</td>"
        + "</tr>"
    );
}

/**
 * 清空业务信息
 */
function resetBusiness() {
    $("#body-text").children("[hidden!=hidden]").remove();
}