/*	@ 导航当前位置
 *  # courseBase
 *	? 控制导航栏的active，确定当前处于导航栏的位置
 */

$(function () {
    $(".navbar-nav").find("li").each(function () {
        let a = $(this).find("a:first")[0];
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
    let $obj = $(obj);
    let second = 60;
    if (check_email($('#login-email').val())) {
        let stop = setInterval(
            function () {
                if (second > 0) {
                    $obj.attr("disabled", true);
                    let message = "重发(" + second + "s)";
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
        $('#login_form').append("<div class='alert alert-danger' id='login_danger' style='text-align: center'> <strong>请输入正确的邮箱</strong></div>");
        setTimeout("$('#login_danger').remove()", 1000)
    }
}


/*
验证邮箱格式
 */

function check_email(email) {
    let myreg = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    return myreg.test(email);
}

/**
 *
 * @param id
 * @param message
 * @param message_type danger or info
 * @param timeout ms
 * @param message_head
 */
function show_message(id, message, message_type, timeout, message_head = false) {
    if (document.getElementById("show_message")) return;
    let div_content_base = "<div class='alert alert-" + message_type + "' id='show_message' style='text-align: center;display: none;'> <strong>";
    let type = "提示!";
    if (message_type === "danger") {
        type = "错误!";
    } else if (message_type === "warning") {
        type = "警告!";
    }
    if (message_head) {
        type = message_head;
    }
    let div_content = div_content_base + type + "</strong>" + message + "</div>";
    $('#' + id).append(div_content);
    let show_message_tmp = $('#show_message');
    // 淡入效果
    show_message_tmp.fadeIn(timeout);
    // 淡出效果
    setTimeout(function () {
        show_message_tmp.fadeOut(timeout);
    }, timeout * 1.5);
    // 移除div(重复使用)
    setTimeout(function () {
        show_message_tmp.remove()
    }, timeout * 2.5);
}

function show_submit_confirm(submit_deal_fun) {
    submit_confirm_append(submit_deal_fun);
    $('#submit_confirm').modal('show');
}

function close_submit_confirm() {
    $('#submit_confirm').modal('hide');
}

function remove_submit_confirm() {
    $('#submit_confirm').remove();
}

function submit_confirm_append(submit_deal_fun) {
    let div_content = "<!-- 确认提交模态框（Modal） -->" +
        '        <div class="modal fade" id="submit_confirm" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '            <div class="modal-dialog">' +
        '                <div class="modal-content">' +
        '                     <div class="modal-header">' +
        '                        <button type="button" class="close" data-dismiss="modal"' +
        '                                aria-hidden="true">×' +
        '                        </button>' +
        '                        <h4 class="modal-title" id="myModalLabel" style="text-align: center">' +
        '                            确认提交' +
        '                        </h4>' +
        '                    </div>' +
        '                    <div id="submit_confirm_message_origin" class="alert alert-info" style="text-align: center">' +
        '		                <strong>提示！</strong>确认提交后将不可更改。' +
        '	                 </div>' +
        '                    <div id="submit_confirm_message">' +
        '                    </div>' +
        '                    <div class="modal-footer">' +
        '                        <button type="button" class="btn btn-default"' +
        '                                data-dismiss="modal">关闭' +
        '                        </button>' +
        '                        <button type="button" class="btn btn-primary" id="submit_confirm_button" onclick="' + submit_deal_fun + '">' +
        '                            确认提交' +
        '                        </button>' +
        '                    </div>' +
        '                </div><!-- /.modal-content -->' +
        '            </div><!-- /.modal-dialog -->' +
        '        </div><!-- /.modal -->';
    $("#base_header").append(div_content);
}