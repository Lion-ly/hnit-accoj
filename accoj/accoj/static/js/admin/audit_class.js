$(document).ready(function () {
    _init_();
});

function _init_() {
    getUserList();

}

function getUserList() {
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
        ajax: {url: '/admin/get_audit_class'},
        /*
        columnDefs: [
            {'orderable': false, 'targets': [0, 1, 2, 3, 4, 5, 6, 8, 9, 10]}
        ],
        */
        columns: [
            {"data": "num"},
            {"data": "student_no"},
            {"data": "student_name"},
            {"data": "student_school"},
            {"data": "student_faculty"},
            {"data": "student_class"},
            {"data": "teacher"},
            {"data": "status"},
            {"data": "tmp"},
        ]
    });
}
