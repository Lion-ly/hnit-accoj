/*	@ 导航当前位置
 *  # courseBase
 *	? 控制导航栏的active，确定当前处于导航栏的位置
 */

$(function () {
    $(".navbar-nav").find("li").each(function () {
        var a = $(this).find("a:first")[0];
        if ($(a).attr("href") === location.pathname) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
});


/*	@ 返回首页
 *  # base -> 会计实训系统Accountiong training system
 *	? 页面跳转
 */
function gohome() {
    window.location.href = "{{url_for('accoj.index')}}";
}


/*	@ 信息提示
 *	# base -> 注册/忘记了
 *	? 密保邮箱提示信息
 */
$(function () {
    $("#register-help").tooltip();
});
$(function () {
    $("#findpwd-help").tooltip();
});


/*	@ 验证码
 *	# base -> 注册/忘记了
 *	? "发送验证码"->"重发x(s)"
 */
function getVCode(obj) {
    var $obj = $(obj);
    var second = 60;
    if (check_email($('#login-email').val())) {
        var stop = setInterval(
            function () {
                if (second > 0) {
                    $obj.attr("disabled", true);
                    var message = "重发(" + second + "s)";
                    $obj.text(message);
                    second--;
                } else {
                    clearTimeout(stop);
                    $obj.text("发送验证码");
                    $obj.attr("disabled", false);
                }
            }
            , 1000);
    } else {
        $('#login_form').append("<div class='alert alert-danger' id='login_danger' style='text-align: center'> <strong>请输入正确的邮箱</strong></div>")
        setTimeout("$('#login_danger').remove()", 1000)
    }
}


/*
验证邮箱格式
 */

function check_email(email) {
    var myreg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    if (myreg.test(email)) {
        return true;
    }
    return false;
}

/**
 *
 * @param id
 * @param message
 * @param message_type danger or info
 * @param timeout ms
 */
function show_message(id, message, message_type, timeout) {
    if(document.getElementById("show_message")) return;
    $('#' + id).append("<div class='alert alert-" + message_type + "' id='show_message' style='text-align: center'> <strong>" + message + "</strong></div>");
    setTimeout("$('#show_message').remove()", timeout);
}