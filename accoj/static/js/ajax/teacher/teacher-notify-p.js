$(document).ready(function () {
    $.fn.dataTable.ext.errMode = 'throw';
    $('#data-table').DataTable({
        retrieve: true,
        columnDefs: [
            {'orderable': false, 'targets': 7}
        ]
    });
});


function selectAll() {
    $('input[class=switch-input]').each(function (index, item) {
        $item = $(item);
        $item.prop('checked', !$item.prop('checked'));
    })
}