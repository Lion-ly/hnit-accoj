//==================================获取信息==================================//
/**
 * 从后端获取信息
 * @param data
 * 要发送的内容(json格式，如需要请求用户个人信息页面内容，data={api: 'get_user_profile'}) 用户个人信息
 *                                                               get_user_schedule   用户进度表
 *                                                               get_user_score      用户得分统计
 *                                                               get_user_rank       用户排行榜
 * @param successFunc   success function if post successfully
 * @param url   "/profile_api" or "/teacher_api"
 */
function get_data(data, successFunc, url) {
    data = data ? data : {};
    data = JSON.stringify(data);
    url = url ? url : '/profile_api';
    let csrf_token = get_csrf_token();

    $.ajax({
        url: url,
        type: "post",
        data: data,
        dataType: "json", // 返回json格式数据
        contentType: "application/json;charset=utf-8",
        cache: false,
        async: true,
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        },
        success: function (data) {
            let result = data["result"];
            data = data.hasOwnProperty("data") ? data["data"] : data;
            if (result === true) {
                // 请求成功，调用回调函数
                successFunc(data);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })
}

function formatDateCN(date) {
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
    return text.replace(/\\u[\dA-F]{4}/gi,
        function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        });
}