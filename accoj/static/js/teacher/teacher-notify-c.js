$(document).ready(function () {
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
        ajax: {url: '/api/get_class_info'},
        retrieve: true,
        columns: [
            {"data": "num"},
            {"data": "student_school"},
            {"data": "student_faculty"},
            {"data": "student_class"},
            {"data": "t"}
        ]
    });
});

function selectAll() {
    $('input[class=switch-input]').each(function (index, item) {
        $item = $(item);
        $item.prop('checked', !$item.prop('checked'));
    })
}