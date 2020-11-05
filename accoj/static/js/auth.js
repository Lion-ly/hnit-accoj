$(document).ready(function () {
    $('#signin').keypress(function (e) {
        if (e.keyCode == 13) $('#signin_button').click();
    });
});


$(function () {
    $('#login_button').click(function () {
        let data = $('#login_form').serialize();
        $.ajax({
            url: "/login",
            type: "post",
            data: data,
            dataType: "json",
            async: true,
            success: function (data) {
                if (data["result"] === "true") {
                    show_message("login_form", "注册成功 1s后自动跳转", "info", 1000);
                    setTimeout("location.href='localhost:80';location.reload();", 1000)
                } else {
                    show_message("login_form", data["message"], "danger", 1000);
                }
            },
            error: function (e) {

            }
        })

    })
});

$(function () {
    $('#update_pwd_button').click(function () {
        let data = $('#update_pwd_form').serialize();
        $.ajax({
            url: "/update_password",
            type: "post",
            data: data,
            dataType: "json",
            async: true,
            success: function (data) {
                if (data["result"] === "true") {
                    show_message("update_pwd_form", "密码更改成功", "info", 1000);
                    setTimeout("location.href='localhost:80';location.reload();", 1000)
                } else {
                    show_message("update_pwd_form", data["message"], "danger", 1000, "更改失败!");
                }

            },
            error: function (e) {

            }
        })
    })
});

function login_select_change() {
    var faculty_selected = document.getElementById("login-faculty");
    var class_selected = document.getElementById("login-class");
    var arr1 = ["网络1701", "网络1702", "网络1703"];
    var arr2 = ["会计1701", "会计1702", "会计1702"];
    if (faculty_selected.options[0].selected === true) {
        for (var i = 0; i < arr1.length; i++) {
            class_selected.options[i].label = arr1[i];
        }
    } else if (faculty_selected.options[1].selected === true) {
        for (var i = 0; i < arr1.length; i++) {
            class_selected.options[i].label = arr2[i];
        }
    } else if (faculty_selected.options[2].selected === true) {

    }
}


/*
  加载时检查cookie的值
 */
$(function () {
    var rem = $.cookie('remember');
    if (rem) {
        $("#signin-rememberme").prop("checked", true);
        $("#signin-studentid").val($.cookie("studentid"));
    }

});

/*
把输入的值保存到cookie，保存期为7天
 */

function save_cookies() {
    if ($("#signin-rememberme").prop("checked")) {
        let stu = $("#signin-studentid").val();

        $.cookie("remember", "true", {expires: 7});
        $.cookie("studentid", stu, {expires: 7});
    } else {
        $.cookie("remember", "false", {expires: -1});
        $.cookie("studentid", "", {expires: -1});
    }
}

/*
ajax发送邮箱验证码
 */

$(function () {
    $("#register-getvcode").click(function () {
        if (check_email($('#login-email').val())) {
            var data = $('#login_form').serialize();
            $.ajax({
                url: "/VCode",
                type: "post",
                dataType: "json",
                data: data,
                async: true,
                success: function (data) {
                    if (data["result"] === "true") {
                        show_message("login_form", "邮件已发送，请注意查收哦", "info", 3000);
                    } else {
                        show_message("login_form", "邮件未能发送，请稍后重试", "danger", 3000)
                    }
                }

            })
        } else {
        }
    })
});

/*
找回密码发送验证码
 */
$(function () {
    $("#findpwd-getvcode").click(function () {
        if (check_email($('#findpwd-email').val())) {
            var data = $('#findpwd_form').serialize();
            $.ajax({
                url: "/VCode",
                type: "post",
                dataType: "json",
                data: data,
                async: true,
                success: function (data) {
                    if (data["result"] === "true") {
                        show_message("findpwd_form", "邮件已发送，请注意查收哦", "info", 3000);
                    } else {
                        show_message("findpwd_form", "邮件未能发送，请稍后重试", "danger", 3000)
                    }
                }

            })
        } else {
        }
    })
});
$(function () {
    $("#findpwd_button").click(function () {
        let data = $("#findpwd_form").serialize();
        $.ajax({
            url: "/findpsw",
            type: "post",
            dataType: "json",
            data: data,
            async: true,
            success: function (data) {
                if (data["result"] === "true") {
                    show_message("findpwd_form", "密码已重置，新密码请注意查收邮箱，即将跳转到首页", "info", 3000);
                    setTimeout("location.href='localhost:80';location.reload();", 4000);
                } else {
                    show_message("findpwd_form", data["message"], "danger", 1000);
                }

            },
            error: function () {

            }
        })
    })
});

$(function () {


    }
)

$(function () {
    if($("#modal_button").length){
        click_slider(modal_button);
    }
    if($("#traver_id").length) {
        click_slider(traver_id);
    }

});

function click_slider(id_name) {
    $(id_name).click(function () {
        $("#signin-password").val("");

        var slider = new SliderUnlock("#slider", {
            successLabelTip: "验证成功"
        }, function () {
            $('#signin_button').click(function () {
                save_cookies();
                data = $('#signin_form').serialize();
                $.ajax({
                    url: "/signin",
                    type: "post",
                    data: data,
                    dataType: "json",
                    async: true,
                    success: function (data) {
                        if (data["result"] === "true") {
                            show_message("signin_form", "登陆成功 1s后自动跳转", "info", 1000);
                            setTimeout("location.href='localhost:80';location.reload();", 1000);
                        } else {
                            slider.init();
                            slider.reset()
                            $("#label").text(">>");
                            $("#labelTip").text("拖动滑块验证")
                            show_message("signin_form", data["message"], "danger", 1000);

                        }
                    },
                    error: function (err) {
                        console.log(err.statusText + "异常");
                    }
                })
            })

        });
        $("#label").text(">>");
        $("#labelTip").text("拖动滑块验证")
        slider.init();
    })

}







