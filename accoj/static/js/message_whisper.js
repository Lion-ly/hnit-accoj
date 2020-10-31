let nowRoom = "";
$(document).ready(function () {
    _init_();
});

function _init_() {
    getClassName();
    bindButton();
}

function getClassName() {
    let data = {},
        successFunc = function (_data) {
            appendClass(_data.class_name);
            nowRoom = _data.class_name[0];
            _init_socket();
        },
        url = '/api/get_class_name';
    get_data(data, successFunc, url);
}

function appendClass(classes) {
    let isFirst = true,
        isActive = "active";
    for (let i = 0; i < classes.length; i++) {
        if (isFirst) {
            isFirst = false;
            nowRoom = classes[i];
            $("#room-name").text(nowRoom);
        } else {
            isActive = "";
        }

        $("#room-list").append(
            "<article id='" + classes[i] + "' data-class-div class='" + isActive + "'>" +
            "   <img src='' alt=''>" +
            "   <div class='user-info'>" +
            "       <span>" + classes[i].split('-')[1] + "</span>" +
            "       <span data-span-summary></span>" +
            "   </div>" +
            "</article>");

        $("#" + classes[i]).click(function () {
            if (nowRoom === $(this).prop("id")) return;
            $("article[data-class-div]").removeClass('active');
            $(this).addClass('active');
            socket.disconnect();
            nowRoom = classes[i];
            _init_socket();
            $("#room-name").text(nowRoom);
        });
    }
}

function bindButton() {
    $("#message-content").keyup(function () {
        let wordsLength = $("#message-content").val().length,
            wordsContent = $("#message-content").val();
        $("#now-words").text(wordsLength);
        $("#message-content").val(wordsContent.substr(0, 200));
    });
    $("#message-content").keydown(function (e) {
        if (e.ctrlKey && e.keyCode == 13)
            $("button[data-send-message]").click();
    });
    $("button[data-send-message]").click(function () {
        sendMessage();
    });
}

function _init_socket() {
    window.socket = io();
    window.lastTime = "0";
    window.uuId = get_current_user_id();
    window.onbeforeunload = function () {
        socket.emit('leave', {'room': nowRoom});
        e.returnValue = 'onbeforeunload';
    };
    socket.on('connect', function () {
        // 连接时加入房间
        joinRoom(nowRoom);
    });
    socket.on('disconnect', function () {
        leaveRoom(nowRoom)
    });
    socket.on('status', function (_data) {
        console.log(_data);
    });
    socket.on('add_message', function (_data) {
        addMessage(_data);
    });
    socket.on('new_room_message', function (_data) {
        showNewMessage(_data);
    });
}

function leaveRoom(roomName) {
    socket.emit('leave', {'room': roomName});
}

function joinRoom(roomName) {
    socket.emit('join', {'room': roomName});
}


function addMessage(_data) {
    function addMessageContent(_data) {
        _data = JSON.parse(_data);
        let dataLength = _data.length,
            messages = "";
        for (let i = 0; i < dataLength; i++) {
            let message_body = _data[i].message_body,
                username = _data[i].username,
                student_name = _data[i].student_name,
                nick_name = _data[i].nick_name,
                time = _data[i].time.$date;
            message_body = unicodeToChar(message_body);
            // if (time - window.lastTime > 5 * 60 * 1000) // 消息间隔时间在五分钟内则不显示时间戳
            //                messages += "<time>" + formatDateCN(time) + "</time>";
            window.lastTime = time;
            time = formatDateCN(time);

            if (username == uuId) {
                messages += "<div data-message class=\"msg-item msg-item-right\">" +
                    "<p style='text-align: right;margin-bottom: 0'><small class='time-stamp'>" + time + "</small><br/>" + message_body + "</p>" +
                    "<img src=\"\" alt=\"\">" +
                    "</div>";
            } else {
                username = student_name ? student_name : username;
                username = nick_name ? nick_name : username;
                messages += "<div data-message class=\"msg-item msg-item-left\">" +
                    "<img src=\"\" alt=\"\">" +
                    "<p style='margin-bottom: 0'><small class='nickname'>" + username + "</small>&nbsp;<small class='time-stamp'>" + time + "</small>" + "<br/>" + message_body + "</p>" +
                    "</div>";
            }
        }
        $('#message-box').append(messages);
        scrollToBottom();
    }

    // 清空原消息框
    $('#message-content').html("");
    $('#message-box').html("");
    addMessageContent(_data);
}

function showNewMessage(_data) {
    // 显示新消息
    _data = JSON.parse(_data);
    let messages = "",
        message_body = _data.message_body,
        username = _data.username,
        student_name = _data.student_name,
        nick_name = _data.nick_name,
        time = _data.time.$date;

    message_body = unicodeToChar(message_body);
    // if (time - window.lastTime > 5 * 60 * 60) // 消息间隔时间在五分钟内则不显示时间戳
    //    messages += "<time>" + formatDateCN(time) + "</time>";
    window.lastTime = time;
    time = formatDateCN(time);

    if (username == uuId) {
        messages += "<div data-message class=\"msg-item msg-item-right\">" +
            "<p style='text-align: right;margin-bottom: 0'><small class='time-stamp'>" + time + "</small><br/>" + message_body + "</p>" +
            "<img src=\"\" alt=\"\">" +
            "</div>";
    } else {
        username = student_name ? student_name : username;
        username = nick_name ? nick_name : username;
        messages += "<div data-message class=\"msg-item msg-item-left\">" +
            "<img src=\"\" alt=\"\">" +
            "<p style='margin-bottom: 0'><small>" + username + "</small>&nbsp;<small class='time-stamp'>" + time + "</small>" + "<br/>" + message_body + "</p>" +
            "</div>";
    }
    $('#message-box').append(messages);
    scrollToBottom();
}

function sendMessage() {
    // 发送消息
    let $messageContent = $("#message-content"),
        messageContent = $messageContent.val();
    messageContent = messageContent.substr(0, 200);
    socket.emit('new_room_message', messageContent);
    // 发送后清空输入框
    $messageContent.val("");
    $("#now-words").text(0);
}

function scrollToBottom() {
    // 消息滚动到底部
    let $messageBox = $('#message-box');
    $messageBox.scrollTop($messageBox[0].scrollHeight);
}