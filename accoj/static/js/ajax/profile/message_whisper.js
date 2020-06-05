$(document).ready(function () {
    _init_();
});

function _init_() {
    window.socket = io();
    window.lastTime = "0";
    $(document).bind('beforeunload', function () {
        socket.emit('leave', {'room': '网络工程1701 - 湖南工学院'});
    });

    $("textarea[data-message-content]").keydown(function (e) {
        if (e.ctrlKey && e.keyCode == 13)
            $("button[data-send-message]").click();
    });
    window.uuId = get_current_user_id();
    $("button[data-send-message]").click(function () {
        sendMessage();
    });
    socket.on('connect', function () {
        // 连接时加入房间
        socket.emit('join', {'room': '网络工程1701 - 湖南工学院'});

    });
    socket.on('disconnect', function () {
        socket.emit('leave', {'room': '网络工程1701 - 湖南工学院'});
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

function addMessage(_data) {
    function addMessageContent(_data) {
        _data = JSON.parse(_data);
        let dataLength = _data.length,
            messages = "";
        for (let i = 0; i < dataLength; i++) {
            let message_body = _data[i].message_body,
                username = _data[i].username,
                time = _data[i].time.$date;
            message_body = unicodeToChar(message_body);
            // if (time - window.lastTime > 5 * 60 * 1000) // 消息间隔时间在五分钟内则不显示时间戳
            //                messages += "<time>" + formatDateCN(time) + "</time>";
            window.lastTime = time;

            if (username == uuId) {
                messages += "<div data-message class=\"msg-item msg-item-right\">" +
                    "<p style='text-align: right;margin-bottom: 0'><small class='time-stamp'>" + formatDateCN(time) + "</small><br/>" + message_body + "</p>" +
                    "<img src=\"\" alt=\"\">" +
                    "</div>";
            } else {
                messages += "<div data-message class=\"msg-item msg-item-left\">" +
                    "<img src=\"\" alt=\"\">" +
                    "<p style='margin-bottom: 0'><small class='nickname'>" + username + "</small>&nbsp;<small class='time-stamp'>" + formatDateCN(time) + "</small>" + "<br/>" + message_body + "</p>" +
                    "</div>";
            }
        }
        $('div[data-message-box]').append(messages);
        scrollToBottom();
    }

    // 清空原消息框
    $('div[data-message-box]').html("");
    addMessageContent(_data);
}

function showNewMessage(_data) {
    // 显示新消息
    _data = JSON.parse(_data);
    let messages = "",
        message_body = _data.message_body,
        username = _data.username,
        time = _data.time.$date;

    message_body = unicodeToChar(message_body);
    // if (time - window.lastTime > 5 * 60 * 60) // 消息间隔时间在五分钟内则不显示时间戳
    //    messages += "<time>" + formatDateCN(time) + "</time>";
    window.lastTime = time;

    if (username == uuId) {
        messages += "<div data-message class=\"msg-item msg-item-right\">" +
            "<p style='text-align: right;margin-bottom: 0'><small class='time-stamp'>" + formatDateCN(time) + "</small><br/>" + message_body + "</p>" +
            "<img src=\"\" alt=\"\">" +
            "</div>";
    } else {
        messages += "<div data-message class=\"msg-item msg-item-left\">" +
            "<img src=\"\" alt=\"\">" +
            "<p style='margin-bottom: 0'><small>" + username + "</small>&nbsp;<small class='time-stamp'>" + formatDateCN(time) + "</small>" + "<br/>" + message_body + "</p>" +
            "</div>";
    }
    $('div[data-message-box]').append(messages);
    scrollToBottom();
}

function sendMessage() {
    // 发送消息
    let $messageContent = $("textarea[data-message-content]"),
        messageContent = $messageContent.val();
    socket.emit('new_room_message', messageContent);
    // 发送后清空输入框
    $messageContent.val("");
}

function scrollToBottom() {
    // 消息滚动到底部
    let $messageBox = $('div[data-message-box]');
    $messageBox.scrollTop($messageBox[0].scrollHeight);
}