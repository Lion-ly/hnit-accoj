$(document).ready(function () {
    _init_();
});

function _init_() {
    $.fn.dataTable.ext.errMode = 'throw';
    let csrf_token = get_csrf_token();
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        }
    });
    $('#bootstrap-data-table').DataTable({
        ajax: {url: '/api/get_user_rank'},
        order: [[4, 'desc']],
        "columns": [
            {"data": "rank"},
            {"data": "student_no"},
            {"data": "student_class"},
            {"data": "student_name"},
            {"data": "sum_score"},
            {"data": "one"},
            {"data": "two"},
            {"data": "three"},
            {"data": "four"},
            {"data": "five"},
            {"data": "six"},
            {"data": "seven"},
            {"data": "eight"},
            {"data": "nine"},
            {"data": "ten"}
        ]
    });
}
