$(function () {
    $('#company_form_button').click(function () {
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
                if (data["result"] === "true") {
                    $(":text").css({"border-style": "none"});
                    $("#com_business_scope").css({"border-style": "none"});
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

    })
});

function getCompanyInfo() {
    // 获取公司信息
    var data = $('#company_form').serialize();
    $.ajax({
        url: "/get_company_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            // 公司已经创立过，将值填充，并将按钮置为不可点击以及表单不可编辑
            $("#company_form_button").attr("disabled", true);
            $(":text").attr("readonly", "readonly");
            $("textarea").attr("readonly", "readonly");
            company_info = data["company_info"];
            for (var prop in company_info) {
                if (prop === "com_shareholder") {
                    com_shareholders = company_info[prop];
                    for (var i = 0; i < com_shareholders.length; i++) {
                        $("#com_shareholder_" + i).val(com_shareholders[i]["com_shareholder"]);
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

$(function () {
    // CreateCompany-li标签获取公司信息数据
    $('#CreateCompany-li').click(getCompanyInfo());
});
