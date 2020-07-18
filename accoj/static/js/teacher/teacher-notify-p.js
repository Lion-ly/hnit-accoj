$(document).ready(function () {
    getStudentInfo();
});

function getStudentInfo() {
    $.fn.dataTable.ext.errMode = 'throw';
    let csrf_token = get_csrf_token();
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        }
    });
    $('#data-table').DataTable({
        ajax: {url: '/api/get_student_info_notify_p'},
        columnDefs: [
            {'orderable': false, 'targets': [0, 1, 2, 3, 4, 5, 6]}
        ],
        columns: [
            {"data": "num"},
            {"data": "student_no"},
            {"data": "student_name"},
            {"data": "student_school"},
            {"data": "student_faculty"},
            {"data": "student_class"},
            {"data": "t"}
        ]
    });
}

function selectAll() {
    $('input[class=switch-input]').each(function (index, item) {
        $item = $(item);
        $item.prop('checked', !$item.prop('checked'));
    })
}