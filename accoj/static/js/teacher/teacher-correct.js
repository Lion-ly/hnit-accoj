$(document).ready(function () {
    getStudentInfo();
    $("#correct_homework").click(correct_homework);
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
        ajax: {url: '/api/get_student_info_correct'},
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
            {"data": "ten"},
            {"data": "correct_schedule"}
        ]
    });
}

function correct_homework() {
    function successFun(data) {
        window.location.replace('/courseix');
    }

    let data = {api: 'correct_homework'};
    data.student_no = $("#input_sdudent_no").val();
    get_data(data, successFun, '/api/teacher_api', 'messageInfoBox');
}