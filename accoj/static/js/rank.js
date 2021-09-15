$(document).ready(function () {
    _init_();
});

function _init_() {
    $.fn.dataTable.ext.errMode = "throw";
    let csrf_token = get_csrf_token();
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (
                !/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) &&
                !this.crossDomain
            ) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        },
    });
    drawTable("bootstrap-data-table", "/api/get_user_rank");
    drawTeamTable("teamRank", "/api/get_team_rank");
}

/**
 * 绘制排行榜
 * @param {*} targetId
 * @param {*} url
 */
function drawTable(targetId, url) {
    $(`#${targetId}`).DataTable({
        ajax: {url},
        order: [[4, "desc"]],
        columns: [
            {data: "rank"},
            {data: "student_no"},
            {data: "student_class"},
            {data: "student_name"},
            {data: "sum_score"},
            {data: "one"},
            {data: "two"},
            {data: "three"},
            {data: "four"},
            {data: "five"},
            {data: "six"},
            {data: "seven"},
            {data: "eight"},
            {data: "nine"},
            {data: "ten"},
        ],
    });
}

function drawTeamTable(targetId, url) {
    $(`#${targetId}`).DataTable({
        ajax: {url},
        order: [[4, "desc"]],
        columns: [
            {data: "rank_rank"},
            {data: "team_name"},
            {data: "team_class"},
            {data: "sum_score"},
            {data: "one"},
            {data: "two"},
            {data: "three"},
            {data: "four"},
            {data: "five"},
            {data: "six"},
            {data: "seven"},
            {data: "eight"},
            {data: "nine"},
            {data: "ten"},
        ],
    });
}


function tags(target) {
    if (target == 0) {
        $(".page-item").eq(0).attr("class", "page-item active");
        $(".page-item").eq(1).attr("class", "page-item");
        $(".tagsItem").eq(1).hide();
        $(".tagsItem").eq(0).show();
    }
    if (target == 1) {
        $(".page-item").eq(1).attr("class", "page-item active");
        $(".page-item").eq(0).attr("class", "page-item");
        $(".tagsItem").eq(0).hide();
        $(".tagsItem").eq(1).show();
    }
}
