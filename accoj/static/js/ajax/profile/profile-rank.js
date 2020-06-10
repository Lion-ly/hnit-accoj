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
        ajax: {url: '/get_user_rank'},
        order: [[3, 'desc']],
        columnDefs: [
            {'orderable': false, 'targets': [0, 1, 2]}
        ]
    });
}
