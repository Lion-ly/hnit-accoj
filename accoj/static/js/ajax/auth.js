$(function () {
    $('#signin_button').click(function () {
        data = $('#signin_form').serialize();
        $.ajax({
            url: "/signin",
            type: "post",
            data: data,
            dataType: "json",
            async: true,
            success: function (data) {
                if (data["result"] === "true") {
                    $('#signin_form').append("<div class='alert alert-info' style='text-align: center'> <strong>登陆成功 1s后自动跳转</strong></div>");
                    setTimeout("location.href='localhost:80';location.reload();", 1000)
                } else {
                    $('#signin_form').append("<div class='alert alert-danger' id='signin_danger' style='text-align: center'> <strong>" + data["message"] + "</strong></div>");
                    setTimeout("$('#signin_danger').remove()", 1000)
                }
            },
            error: function (e) {

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
                    $('#login_form').append("<div class='alert alert-info' style='text-align: center'> <strong>注册成功 1s后自动跳转</strong></div>");
                    setTimeout("location.href='localhost:80';location.reload();", 1000)
                } else {
                    $('#login_form').append("<div class='alert alert-danger' id='login_danger' style='text-align: center'> <strong>" + data["message"] + "</strong></div>");
                    setTimeout("$('#login_danger').remove()", 1000)
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
                    $('#update_pwd_form').append("<div class='alert alert-info' style='text-align: center'> <strong>更改成功 1s后自动跳转</strong></div>");
                    setTimeout("location.href='localhost:80';location.reload();", 1000)
                } else {
                    $('#update_pwd_form').append("<div class='alert alert-danger' id='login_danger' style='text-align: center'> <strong>" + data["message"] + "</strong></div>");
                    setTimeout("$('#login_danger').remove()", 1000)
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