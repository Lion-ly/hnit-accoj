$(document).ready(function () {
    _init_();
});

function _init_() {
    getStudentInfoNotifyP();
    $("#selectAll").click(selectAll);
    $("#confirmSend").click(sendPersonalNotify);

}

function getStudentInfoNotifyP() {
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

function sendPersonalNotify() {
    // 发送个人通知
    let $checkeds = $(".switch-input:checked"),
        message_body = $("#messageContent").val(),
        students = [];
    $checkeds.each(function () {
        let student_no = $(this).parent().parent().children(":first").next().text();
        students.push(student_no);
    });
    let data = {"api": "send_personal_notify", "message_body": message_body, "students": students},
        url = "/api/teacher_api",
        messageDivID = "messageInfoBox",
        successFunc = function () {
        };
    if (students.length < 1) show_message(messageDivID, '未选择要发送的学生！', 'danger', 2000);
    else if (!message_body) show_message(messageDivID, '消息内容不能为空！', 'danger', 2000);
    else get_data(data, successFunc, url, messageDivID);
}