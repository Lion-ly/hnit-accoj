//==================================获取信息==================================//
/**
 * 从后端获取信息
 * @param data
 * 要发送的内容(json格式，如需要请求用户个人信息页面内容，data={api: 'get_user_profile'}) 用户个人信息
 *                                                               get_user_schedule   用户进度表
 *                                                               get_user_score      用户得分统计
 *                                                               get_user_rank       用户排行榜
 * @param successFunc   success function if post successfully
 * @param url   "/api/profile_api" or "/api/teacher_api"
 * @param messageDivID
 */
function get_data(data, successFunc, url, messageDivID) {
    data = data ? data : {};
    data = JSON.stringify(data);
    url = url ? url : '/api/profile_api';
    let csrf_token = get_csrf_token();

    $.ajax({
        url: url,
        type: "post",
        data: data,
        dataType: "json", // 返回json格式数据
        contentType: "application/json;charset=utf-8", // 发送的数据格式
        cache: false,
        async: true,
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        },
        success: function (data) {
            let result = data["result"], message = '';
            message = data.hasOwnProperty("message") ? data["message"] : message;
            data = data.hasOwnProperty("data") ? data["data"] : data;
            if (result === true) {
                // 请求成功，调用回调函数
                successFunc(data);
                if (messageDivID && message)
                    show_message(messageDivID, message, 'info', 2000);
            } else {
                if (messageDivID && message)
                    show_message(messageDivID, message, 'danger', 3000);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })
}

function formatDateCN(date) {
    // 日期格式化,date为毫秒数
    let d = new Date(new Date(date).toUTCString()),
        month = '' + (d.getUTCMonth() + 1),
        day = '' + d.getUTCDate(),
        year = d.getUTCFullYear(),
        hour = d.getUTCHours(),
        minute = d.getUTCMinutes();

    hour = hour.toString();
    minute = minute.toString();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    if (hour.length < 2)
        hour = '0' + hour;
    if (minute.length < 2)
        minute = '0' + minute;

    return year + "年" + month + "月" + day + "日 " + hour + ":" + minute;
}

function unicodeToChar(text) {
    // unicode转字符
    return text.replace(/\\u[\dA-F]{4}/gi,
        function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        });
}

/**
 * 显示提示信息
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