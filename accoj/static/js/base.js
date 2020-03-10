/*	@ 导航当前位置
 *  # courseBase
 *	? 控制导航栏的active，确定当前处于导航栏的位置
 */
let csrf_token;
$(function () {
    $("ul.navbar-nav").find("li").each(function () {
        let a = $(this).find("a:first")[0];
        let href = $(a).attr("href");
        if (href === location.pathname.split("_")[0]) {
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
    window.location.href = "{{url_for('index.index')}}";
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
        show_message("login_form", "请输入正确的邮箱", "warning", 2000)
    }
}

function findgetVCode(obj) {
    let $obj = $(obj);
    let second = 60;
    if (check_email($('#findpwd-email').val())) {
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
        show_message("findpwd_form", "请输入正确的邮箱", "warning", 2000)
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
    if (document.getElementById("show_message")) $("#show_message").remove();
    let div_content_base = "<div class='alert alert-" + message_type + "' id='show_message' style='text-align: center;display: none;margin-top: 20px;'> <strong>";
    let type = "提示！";
    if (message_type === "danger") {
        type = "错误！";
    } else if (message_type === "warning") {
        type = "警告！";
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

/**
 * 点击提交按钮
 * @param submit_deal_fun
 */
function show_submit_confirm(submit_deal_fun) {
    $("#submit_confirm_button").attr("onclick", submit_deal_fun);
    $("#submit_confirm_button").attr("disabled", false);
    $("#submit_confirm").modal('show');
}

/**
 * 将处理函数绑定到模态框的确认提交按钮
 * @param buttonID
 * @param submit_infoName String
 */
function bind_confirm_info(buttonID, submit_infoName) {
    show_submit_confirm(submit_infoName + "('confirm')");
    let confirm_button = $("#" + buttonID);
    confirm_button.attr("disabled", true);
    confirm_button.text("提交 2s");
    setTimeout(function () {
        confirm_button.text("提交 1s");
    }, 1000);
    setTimeout(function () {
        confirm_button.attr("disabled", false);
        confirm_button.text("提交");
    }, 2000);
}

/**
 * 保存信息
 * @param buttonID
 * @param submit_info function
 */
function bind_save_info(buttonID, submit_info) {
    submit_info("save");
    let save_button = $("#" + buttonID);
    save_button.attr("disabled", true);
    save_button.text("保存 2s");
    setTimeout(function () {
        save_button.text("保存 1s");
    }, 1000);
    setTimeout(function () {
        save_button.attr("disabled", false);
        save_button.text("保存");
    }, 2000);
}

/**
 * ajax提交完成
 */
function submit_confirm_clicked() {
    $("#submit_confirm_button").attr("disabled", true);
    // 定时自动关闭
    setTimeout(function () {
        $("#submit_confirm").modal('hide');
    }, 3000)
}

/**
 * 限制输入只能为数字
 * @param obj
 */
function limit_number(obj) {
    let reg = /\D/g;
    $(obj).val($(obj).val().replace(reg, ""));
}

function illegalCharFilter(obj) {
    let reg = /[${}().]/g;
    $(obj).val($(obj).val().replace(reg, ""))
}

/**
 * 限制只能输入`借`和`贷`
 * @param obj
 */
function limitJieDai(obj) {
    let reg = /[借贷平]/g;
    let thisValue = $(obj).val();
    if (thisValue && !thisValue.match(reg))
        $(obj).val("");
}

//==================================提交信息==================================//
/**
 * 提交信息
 * @param submit_type   "confirm" or "save"
 * @param url   like "/submit_info"
 * @param data  post data (JSON)
 * @param messageDivID  show message's divID
 * @param successFunc   success function if post successfully
 */
function submit_info(submit_type, url, data, messageDivID, successFunc) {
    let type_flag = null;
    if (submit_type === "confirm") {
        type_flag = true;
    } else if (submit_type === "save") {
        type_flag = false;
    } else {
        return;
    }
    let csrf_token = get_csrf_token();

    $.ajax({
        url: url,
        type: "post",
        data: data,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        cache: false,
        async: true,
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        },
        success: function (data) {
            if (data["result"] === true) {
                if (type_flag === true) {
                    show_message("submit_confirm_message", "提交成功！", "info", 1000);
                } else if (type_flag === false) {
                    show_message(messageDivID, "保存成功！", "info", 1000);
                }
                successFunc();
            } else {
                if (type_flag === true) {
                    show_message("submit_confirm_message", data["message"], "danger", 1000, "提交失败！");
                } else if (type_flag === false) {
                    show_message(messageDivID, data["message"], "danger", 1000, "保存失败！");
                }
            }
        },
        error: function (err) {
            console.log(err.statusText);
        },
        complete: function () {
            if (type_flag)
                submit_confirm_clicked();
        }
    });
}

//==================================获取信息==================================//
/**
 * 从后端获取信息
 * @param data  post data (JSON)
 * @param url   like "/submit_info"
 * @param successFunc   success function if post successfully
 * @param messageDivID  show message's divID
 */
function get_info(data, url, successFunc, messageDivID) {
    data = data ? data : {};
    let csrf_token = get_csrf_token();

    $.ajax({
        url: url,
        type: "post",
        data: data,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        cache: false,
        async: true,
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        },
        success: function (data) {
            if (data["result"] === true) {
                successFunc(data);
            } else {
                if (messageDivID)
                    show_message(messageDivID, data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })
}

/**
 * 将arrayBuffer转为Blob并下载
 * @param arrayBuffer
 * @param filename
 */
function downloadFile(arrayBuffer, filename) {
    let tmp = filename.split(",");
    let type = tmp[tmp.length - 1];
    type = type === "zip" ? type : "x-rar-compressed";
    let data = new Blob([arrayBuffer], {type: "application/" + type + ";charset=UTF-8"});
    let downloadUrl = window.URL.createObjectURL(data);
    let anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(data);
}

/**
 * UTC dat to yyyy-mm-dd
 * @param date
 * @returns {string}
 */
function formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}