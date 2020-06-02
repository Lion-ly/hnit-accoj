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
