$(document).ready(function () {
    $.fn.dataTable.ext.errMode = 'throw';
    $('#data-table').DataTable({
        retrieve: true,
        columnDefs: [
            {'orderable': false, 'targets': 7}
        ]
    });
});

function resetSelectAll() {
    $("#data-select-all").prop('checked', false);
    console.log("Table changed");
}

function selectAll() {
    $('input[class=switch-input]').each(function (index, item) {
        $item = $(item);
        $item.prop('checked', !$item.prop('checked'));
    })
}