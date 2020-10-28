$(function () {
    $($("#notice_subject")).bind('keydown', function (event) {
        if (event.keyCode == 9) {
            event.preventDefault();
            var indent = '    ';
            var start = this.selectionStart;
            var end = this.selectionEnd;
            var selected = window.getSelection().toString();
            selected = indent + selected.replace(/\n/g, '\n' + indent);
            this.value = this.value.substring(0, start) + selected + this.value.substring(end);
            this.setSelectionRange(start + indent.length, start + selected.length);
            return false;
        }
    });

    $('#confirm_commit').click(function () {
        let csrf_token = get_csrf_token();
        let data = {
            'notice_subject': $("#notice_subject").val(),
            'notice_text': $("#notice_text").val(),
            'notice_abstract': $("#notice_abstract").val()
        };
        data = JSON.stringify(data);


        $.ajax({
            url: "/admin/release_announcement",
            type: "POST",
            data: data,
            dataType: 'json',
            async: true,
            cache: false,
            contentType: "application/json",
            beforeSend: function (xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrf_token);
                }
            },
            success: function (data) {
                if (data["result"] == true) {
                    show_message("notice_form", "发布成功", "info", 1000);
                    $('#myModal').modal('hide');
                } else {
                    show_message("notice_form", "该主题已存在", "danger", 1000);
                    $('#myModal').modal('hide');
                }
            }
        })

    })

    $('textarea').on('keydown', function (e) {
        if (e.keyCode == 9) {
            e.preventDefault();
            var indent = '    ';
            var start = this.selectionStart;
            var end = this.selectionEnd;
            var selected = window.getSelection().toString();
            selected = indent + selected.replace(/\n/g, '\n' + indent);
            this.value = this.value.substring(0, start) + selected + this.value.substring(end);
            this.setSelectionRange(start + indent.length, start + selected.length);
        }
    })
    $('.is_topping').click(function () {
        // 置顶
        let $a_text = $(this);
        let data = {"is_topping": $a_text.text(), "notice_subject": $a_text.parent().prev().children("a").text()},
            csrf_token = get_csrf_token(),
            url = '/admin/is_topping';
        data = JSON.stringify(data)
        $.ajax({
            url: url,
            type: "post",
            data: data,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            cache: false,
            async: true,
            beforeSend: function (xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrf_token);
                }
            },
            success: function (data) {
                let result = data["result"];
                if (result == true) {
                    $a_text.text(data["message"]);
                } else {
                    show_message("edit_table", "已存在置顶", "danger", 1000);
                }
            },
            error: function (err) {
                console.log(err.statusText);
            }
        })

    })

    $('.is_modify').click(function () {
        // 编辑
        let $a_text = $(this);
        let data = {"notice_subject": $a_text.parent().prev().prev().children("a").text()},
            csrf_token = get_csrf_token(),
            url = '/admin/is_modify';
        data = JSON.stringify(data)
        $.ajax({
            url: url,
            type: "post",
            data: data,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            cache: false,
            async: true,
            beforeSend: function (xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrf_token);
                }
            },
            success: function (data) {
                let result = data["flag"];
                data = data.hasOwnProperty("data") ? data["data"] : data;
                if (result === true) {
                    setTimeout("location.href='http://localhost/admin/announcement';", 1000)
                }
            },
            error: function (err) {
                console.log(err.statusText);
            }
        })

    })

})
