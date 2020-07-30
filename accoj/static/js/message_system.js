$(document).ready(function () {
    _init_();
});

function _init_() {
    window.socket = io();
    window.lastTime = "0";
    window.uuId = get_current_user_id();
    window.currentRoom = uuId;
        window.onbeforeunload = function () {
        socket.emit('leave', {'room': currentRoom});
        e.returnValue = 'onbeforeunload';
    };

    socket.on('connect', function () {
        // 连接时加入房间
        socket.emit('join', {'room': currentRoom});

    });
    socket.on('disconnect', function () {
        // 断开连接时离开房间
        socket.emit('leave', {'room': currentRoom});
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
                message_head = _data[i].message_head,
                time = _data[i].time.$date;
            message_body = unicodeToChar(message_body);
            window.lastTime = time;
            time = formatDateCN(time);

            messages += '<div class="msg-item msg-item-left">' +
                '<p><span class="small font-weight-bold">' + message_head + '</span>' +
                '<span class="time small">' + "&nbsp;" + time + '</span>' +
                '<br/>' + message_body + '</p>' +
                '</div>';
        }
        $('div[data-message-box]').append(messages);
        scrollToBottom();
    }

    addMessageContent(_data);
}

function showNewMessage(_data) {
    // 显示新消息
    _data = JSON.parse(_data);
    let messages = "",
        message_body = _data.message_body,
        message_type = _data[i].message_type,
        time = _data.time.$date;

    message_body = unicodeToChar(message_body);
    window.lastTime = time;

    messages += '<div class="msg-item msg-item-left">' +
        '<p><span class="small font-weight-bold">' + message_type + '</span>' +
        '<span class="time small">' + time + '</span>' +
        '<br/>' + message_body + '</p>' +
        '</div>';
    $('div[data-message-box]').append(messages);
    scrollToBottom();
}


function scrollToBottom() {
    // 消息滚动到底部
    let $messageBox = $('div[data-message-box]');
    $messageBox.scrollTop($messageBox[0].scrollHeight);
}