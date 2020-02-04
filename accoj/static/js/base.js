//控制li标签active状态
$(function () {
    $(".nav").find("li").each(function () {
        const a = $(this).find("a:first")[0];
        if ($(a).attr("href") === location.pathname) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
});