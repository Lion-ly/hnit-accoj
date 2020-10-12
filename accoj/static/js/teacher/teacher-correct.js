$(document).ready(function () {
    getStudentInfo();
    $("#correct_homework").click(correct_homework);
    $("#export_grades").click(export_grade);
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

function export_grade() {

    function successFun_grade(data) {
        let title = ['排名', '学号', '姓名', '班级', '第一部分', '第二部分', '第三部分', '第四部分', '第五部分', '第六部分', '第七部分', '第八部分', '第九部分', '第十部分', '总分'];
        let filter = ['correct_schedule'];
        let dataDict = {
            "rank": "",
            "student_no": "",
            "student_name": "",
            "student_class": "",
            "one": "",
            "two": "",
            "three": "",
            "four": "",
            "five": "",
            "six": "",
            "seven": "",
            "eight": "",
            "nine": "",
            "ten": "",
            "sum_score": ""
        }


        let dataList = new Array()
        for (let i = 0; i < 14; i++) {
            dataList[i] = new Array()
        }

        let cnt = 0
        for (let i = 0; i < data.length; i++) {
            for (var key in dataDict) {
                dataList[i][cnt++] = data[i][key]
            }
        }
        console.log(dataList);
        exportExcel(dataList, "成绩汇总", title, filter)
    }

    let data = {api: 'get_student_info_correct'}
    get_data(data, successFun_grade, '/api/get_student_info_correct', '下载成功')

}

