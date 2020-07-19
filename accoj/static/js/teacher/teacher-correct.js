$(document).ready(function () {
    getStudentInfo();
});

function getStudentInfo() {

    function bind_correct_homework() {
        let $trs = $($('#data-table').children()[1]).children();
        $trs.each(function () {
            $($($(this).children()[7]).children()).click(function () {
                correct_homework(this);
            });
        });
    }

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
        ajax: {url: '/api/get_student_info_correct'},
        columnDefs: [
            {'orderable': false, 'targets': [0, 1, 2, 3, 4, 5, 6, 7]}
        ],
        columns: [
            {"data": "num"},
            {"data": "student_no"},
            {"data": "student_name"},
            {"data": "student_school"},
            {"data": "student_faculty"},
            {"data": "student_class"},
            {"data": "correct_schedule"},
            {"data": "t"}
        ],
        'fnInitComplete': bind_correct_homework
    });
}

function correct_homework(obj) {
    function successFun(data) {
        window.location.replace('/courseix');
    }

    let data = {api: 'correct_homework'};
    data.student_no = $($(obj).parent().parent().children()[1]).text();
    get_data(data, successFun, '/api/teacher_api');
}