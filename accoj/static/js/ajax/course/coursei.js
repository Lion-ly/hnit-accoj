$(function () {
    $('#company_form_button').click(function () {
        var data = $('#company_form').serialize();
        $.ajax({
            url: "/company_form_submit",
            type: "post",
            data: data,
            dataType: "json",
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
                    alert(data["message"])
                }
            },
            error: function (e) {
                alert("error?:" + e);
            }
        })

    })
});