// 首页
$(document).ready(function () {
    _init_();
});

function _init_() {
    function successFunc(news) {
        // Todo
        // 获取到的新闻数据处理（共10条，不用全部展示，展示前三即可，要求实现more查看更多和收起）
        news = JSON.parse(news);
        // 解析后数据格式为字典数组 {a_href: "#link",  新闻链接
                                // title_text: "",   标题
                                // content_text: "", 摘要
                                // span_text: ""     例：责编：小张 （此字段可忽略）
                                // time_text: ""}    时间
    }

    get_news(successFunc);
}

function get_news(successFunc) {
    // 获取新闻
    let data = {},
        csrf_token = get_csrf_token(),
        url = '/api/get_news';

    $.ajax({
        url: url,
        type: "get",
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
            let result = data["result"];
            data = data.hasOwnProperty("data") ? data["data"] : data;
            if (result === true) {
                successFunc(data);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })
}