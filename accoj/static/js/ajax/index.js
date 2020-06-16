// 首页
$(document).ready(function () {
    _init_();
});

var template = '<div class="media">' +
    '<div class="media-body">\n' +
    '            <h4 class="media-heading"><a\n' +
    '                  href="{HREF}">{TITLE}</a>\n' +
    '            </h4>\n' +
    '            <div class="item-content">\n' +
    '                <p>\n' +
    '{CONTENT}' +
    '                </p>\n' +
    '            </div>\n' +
    '            <div class="item-info">\n' +
    '                <span>{AUTHOR}</span>\n' +
    '                <time class="small">{TIME}</time>\n' +
    '            </div>\n' +
    '        </div>' +
    '</div>';

var newsJSON;

function _init_() {
    function successFunc(news) {
        // Todo
        // 获取到的新闻数据处理（共10条，不用全部展示，展示前三即可，要求实现more查看更多和收起）
        newsJSON = JSON.parse(news);
        // 解析后数据格式为字典数组 {a_href: "#link",  新闻链接
        // title_text: "",   标题
        // content_text: "", 摘要
        // span_text: ""     例：责编：小张 （此字段可忽略）
        // time_text: ""}    时间
        items(3);
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


function show_news(){
    var $more = $('#more');
    var flag = $more.attr("class");
    var limit = flag === "fa fa-chevron-up" ? 3 : newsJSON.length;
    items(limit);
    $more.toggleClass("fa-chevron-down");
    $more.toggleClass("fa-chevron-up");
}

function items(limit){
    var items = $('.acc-notice');
    items.html("");
    for (var itemNum = 0;itemNum < limit;itemNum++) {
        items.append(
            template.replace("{HREF}", newsJSON[itemNum].a_href)
                .replace("{TITLE}", newsJSON[itemNum].title_text)
                .replace("{CONTENT}", newsJSON[itemNum].content_text)
                .replace("{AUTHOR}", newsJSON[itemNum].span_text)
                .replace("{TIME}", newsJSON[itemNum].time_text)
        );
    }
}