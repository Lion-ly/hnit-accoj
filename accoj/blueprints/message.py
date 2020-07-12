"""
消息管理系统
"""
from accoj.extensions import (socketio,
                              mongo)
from flask_socketio import (join_room,
                            leave_room,
                            emit)
from _datetime import datetime
from bson.json_util import dumps
from flask import session


@socketio.on('join')
def on_join(data: dict):
    username = session.get('username')
    room = data.get('room')
    # test
    # if room == username:
    #    message_head = "作业提交时间截至通知"
    #    message_body = "请及时完成作业。将于2020-06-05 00:00 截止 当前状态：待提交"
    #    send_system_message(message_head=message_head, message_body=message_body)
    join_room(room)
    session['current_room'] = room
    print(username + ' 进入了房间 ' + room)
    messages = mongo.db.message.find({'room': room}, dict(_id=0))
    messages = dumps(messages)
    emit('status', username + ' 进入了房间 ' + room, room=room)
    emit('add_message', messages, room=room)


@socketio.on('leave')
def on_leave(data: dict):
    username = session.get('username')
    room = data.get('room')
    leave_room(room)
    print(username + ' 离开了房间 ' + room)
    emit('status', username + ' 离开了房间 ' + room, room=room)


@socketio.on('new_room_message')
def new_room_message(message_body: str):
    username = session.get('username')
    current_room = session.get('current_room')
    time = datetime.now()
    post = dict(room=current_room,
                username=username,
                message_body=message_body,
                time=time)
    mongo.db.message.insert_one(post)
    post = dumps(post)

    emit('new_room_message', post, room=current_room)