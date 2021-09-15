// 首页
$(document).ready(function () {
    _init_();
    notice_init();

});

let template = '<div class="media">' +
    '<div class="media-body">\n' +
    '            <h4 class="media-heading"><a\n' +
    '                  href="#" onclick="window.open(\'{HREF}\');return false;">{TITLE}</a>\n' +
    '            </h4>\n' +
    '            <div class="item-content">\n' +
    '                <p>\n' +
    '{CONTENT}' +
    '                </p>\n' +
    '            </div>\n' +
    '            <div class="item-info">\n' +
    // '                <span>{AUTHOR}</span>\n' +
    '                <time class="small">{TIME}</time>\n' +
    '            </div>\n' +
    '        </div>' +
    '</div>';


let notice_template = '<div class="ntc-item">\n' +
    '<h4>\n' +
    '<a href="{HREF}">{notice}</a>\n' + '</h4>' +
    '{is_topping}</div>' +
    '<div class="nct-title"><p>{abstract}</p>' +
    '</div>' + "<time>{notice_time}</time>";

let newsJSON;
let noticeJSON;

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


// 加载新闻动作
function show_news() {
    scroll_go('.news', -50);
    let $more = $('#more');
    let flag = $more.attr("class");
    let limit = flag === "fa fa-chevron-up" ? 3 : newsJSON.length;
    items(limit);
    $more.toggleClass("fa-chevron-down");
    $more.toggleClass("fa-chevron-up");
}

// 将数据加载至页面
function items(limit) {
    let items = $('#news-list');
    items.html("");
    for (let itemNum = 0; itemNum < limit; itemNum++) {
        items.append(
            template.replace("{HREF}", newsJSON[itemNum].a_href)
                .replace("{TITLE}", newsJSON[itemNum].title_text)
                .replace("{CONTENT}", newsJSON[itemNum].content_text)
                // .replace("{AUTHOR}", newsJSON[itemNum].span_text)
                .replace("{TIME}", newsJSON[itemNum].time_text)
        );
    }
}

//滚动过去
function scroll_go(go) {
    let height = $(go).offset().top;
    $('html').animate({scrollTop: height + "px"}, 500);
}

function scroll_go(go, offset) {
    let height = $(go).offset().top + offset;
    $('html').animate({scrollTop: height + "px"}, 500);
}


function notice_init() {
    function successFunc_notice(notice) {
        noticeJSON = JSON.parse(notice);
        len = noticeJSON > 3 ? 3 : noticeJSON.length
        notice_items(len)

    }

    get_notice(successFunc_notice)
}

function get_notice(successFunc_notice) {
    // 获取公告
    let data = {},
        csrf_token = get_csrf_token(),
        url = '/api/get_notice';
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
                successFunc_notice(data);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })

}

// 获取前三个公告
function notice_items(limit) {
    let items = $('#notice-list');
    items.html("");
    for (let itemNum = 0; itemNum < limit; itemNum++) {
        if (noticeJSON[itemNum].is_topping === 0)
            items.append(
                notice_template.replace("{notice}", noticeJSON[itemNum].subject).replace("{notice_time}", noticeJSON[itemNum].timestamp.substr(0, 4) + "年" + noticeJSON[itemNum].timestamp.substr(5, 2) + "月" + noticeJSON[itemNum].timestamp.substr(8, 2) + "日").replace("{HREF}", "/notice?count=" + itemNum).replace("{abstract}", noticeJSON[itemNum].abstract).replace("{is_topping}", ""))
        else
            items.append(
                notice_template.replace("{notice}", noticeJSON[itemNum].subject).replace("{notice_time}", noticeJSON[itemNum].timestamp.substr(0, 4) + "年" + noticeJSON[itemNum].timestamp.substr(5, 2) + "月" + noticeJSON[itemNum].timestamp.substr(8, 2) + "日").replace("{HREF}", "/notice?count=" + itemNum).replace("{abstract}", noticeJSON[itemNum].abstract).replace("{is_topping}", "<span style=\"font-size: 18px;color: #5cb85c;\">【置顶】</span>"))

    }
}



