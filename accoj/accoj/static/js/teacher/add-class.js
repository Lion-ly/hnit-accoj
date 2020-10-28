$(document).ready(function () {
    _init_();
});

function _init_() {
    bind_e();
    get_class_list();
}

function bind_e() {
    $("#add_class").click(function () {
        let formData = new FormData(),
            csrf_token = get_csrf_token();
        formData.append('file', $('#upload_file')[0].files[0]);

        $.ajax({
            url: '/api/add_class',
            type: 'POST',
            data: formData,
            processData: false,  // tell jQuery not to process the data
            contentType: false,  // tell jQuery not to set contentType
            cache: false,
            async: true,
            beforeSend: function (xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrf_token);
                }
            },
            success: function (data) {
                let result = data["result"];
                data = data.hasOwnProperty("message") ? data["message"] : data;
                if (result === true)
                    show_message('show-message-tips', data, 'info', 2000);
                else
                    show_message('show-message-tips', data, 'danger', 3000);
            },
            error: function (err) {
                console.log(err.statusText);
            }
        });
    });
}

function get_class_list() {
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
        ajax: {url: '/teacher/get_class_list'},
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
        ]
    });
    /*
    function plotClassChart(_data) {
        _data = JSON.parse(_data);
        console.log(_data);
        let t_body = '',
            $table_body = $("#table-body"),
            _dataLen = _data.length;
        for (let i = 0; i < _dataLen; i++) {
            let student_school = _data[i].student_school,
                student_faculty = _data[i].student_faculty,
                student_class = _data[i].student_class;
            t_body += '<tr>' +
                '<th scope="row">' + (i + 1) + '</th>' +
                '<td>' + student_school + '</td>' +
                '<td>' + student_faculty + '</td>' +
                '<td>' + student_class + '</td>' +
                '</tr>'
        }
        $table_body.append(t_body);
    }

    let data = {api: 'get_class_list'},
        url = '/api/teacher_api',
        successFunc = plotClassChart;
    get_data(data, successFunc, url);
     */
}