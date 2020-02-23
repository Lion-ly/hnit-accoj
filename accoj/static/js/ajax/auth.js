$(function () {
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
                    show_message("signin_form", data["message"], "danger", 1000);
                }
            },
            error: function (err) {
                console.log(err.statusText + "异常");
            }
        })

    })
});

$(function () {
    $('#login_button').click(function () {
        var data = $('#login_form').serialize();
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
        var data = $('#update_pwd_form').serialize();
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
                    show_message("update_pwd_form", data["message"], "info", 1000, "更改失败!");
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
        $("#signin-password").val($.cookie("psw"));
    }

});

/*
把输入的值保存到cookie，保存期为7天
 */

function save_cookies() {
    if ($("#signin-rememberme").prop("checked")) {
        var stu = $("#signin-studentid").val();
        var psw = $("#signin-password").val();
        $.cookie("remember", "true", {expires: 7});
        $.cookie("studentid", stu, {expires: 7});
        $.cookie("psw", psw, {expires: 7});
    } else {
        $.cookie("remember", "false", {expires: -1});
        $.cookie("studentid", "", {expires: -1});
        $.cookie("psw", "", {expires: -1});
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
                        $('#login_form').append("<div class='alert alert-info' id='login_info' style='text-align: center'> <strong>发送邮件成功，请注意查收</strong></div>")
                        setTimeout("$('#login_info').remove()", 3000)
                    } else {
                        $('#login_form').append("<div class='alert alert-danger' id='login_danger' style='text-align: center'> <strong>发送邮件失败</strong></div>")
                        setTimeout("$('#login_danger').remove()", 3000)
                    }
                }

            })
        } else {
            $('#login_form').append("<div class='alert alert-danger' id='login_danger' style='text-align: center'> <strong>请输入正确的邮箱</strong></div>")
            setTimeout("$('#login_danger').remove()", 1000)
        }
    })
});
