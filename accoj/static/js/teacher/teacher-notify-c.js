$(document).ready(function () {
    _init_();
});

function _init_() {
    getStudentInfoNotifyC();
    $("#selectAll").click(selectAll);
    $("#confirmSend").click(sendClassNotify);

}


function getStudentInfoNotifyC() {
    // 获取班级列表并渲染
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
        ajax: {url: '/api/get_student_info_notify_c'},
        retrieve: true,
        columnDefs: [
            {'orderable': false, 'targets': [0, 1, 2, 3, 4]}
        ],
        columns: [
            {"data": "num"},
            {"data": "student_school"},
            {"data": "student_faculty"},
            {"data": "student_class"},
            {"data": "t"}
        ]
    });
}

function selectAll() {
    // 全选按钮控制
    $('input[class=switch-input]').each(function (index, item) {
        $item = $(item);
        $item.prop('checked', !$item.prop('checked'));
    })
}

function sendClassNotify() {
    // 发送班级通知
    let $checkeds = $(".switch-input:checked"),
        message_body = $("#messageContent").val(),
        classes = [];
    $checkeds.each(function () {
        let school = $(this).parent().parent().children(":first").next().text(),
            _classes = $(this).parent().prev().text(),
            class_name = school + "-" + _classes;
        classes.push(class_name);
    });
    let data = {"api": "send_class_notify", "classes": classes, "message_body": message_body},
        url = "/api/teacher_api",
        messageDivID = "messageInfoBox",
        successFunc = function () {
        };
    if (classes.length < 1) show_message(messageDivID, '未选择要发送的班级！', 'danger', 2000);
    else if(!message_body) show_message(messageDivID, '消息内容不能为空！', 'danger', 2000);
    else get_data(data, successFunc, url, messageDivID);
}