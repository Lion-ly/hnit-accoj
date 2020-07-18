#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:57
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py.py
# @Software: PyCharm
from functools import wraps
from _datetime import datetime
from bson.json_util import dumps
from flask_socketio import emit
from flask import session, redirect, url_for, request, abort
from accoj.extensions import mongo
from werkzeug.security import generate_password_hash
import pandas as pd

ALLOWED_EXTENSIONS = {'zip', 'rar'}
MAX_BUSINESS_NO = 20


def login_required(func):
    """
    需要登陆
    :param func:
    :return:
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        if session.get('username'):
            return func(*args, **kwargs)
        else:
            return redirect(url_for('index.index'))

    return wrapper


def login_required_student(func):
    """
    需要学生权限

    :param func:
    :return:
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        if session.get("role") == "student":
            return func(*args, **kwargs)
        else:
            return redirect(url_for('index.index'))

    return wrapper


def login_required_teacher(func):
    """
    需要教师权限，只有后台才会用到这个装饰器

    :param func:
    :return:
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        if session.get("role") == "teacher":
            if session.get("teacher"):
                # 状态切换，从批改学生作业返回后台的时候
                session["username"] = session.get("teacher")
                session["teacher"] = None
            return func(*args, **kwargs)
        else:
            abort(403)

    return wrapper


def complete_required1(func):
    """
    需要第一次课程完成
    :param func:
    :return:
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        schedule = get_schedule()
        if schedule:
            schedule_confirm = schedule.get("schedule_confirm")
            if schedule_confirm.get("business_confirm"):
                return func(*args, **kwargs)
        return redirect("/coursei")

    return wrapper


def get_schedule():
    """
    获取进度表
    :return: dict: schedule_confirm, schedule_saved
    """
    company = mongo.db.company.find_one(dict(student_no=session.get("username")),
                                        dict(schedule_confirm=1, schedule_saved=1))
    if company:
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        return dict(schedule_confirm=schedule_confirm, schedule_saved=schedule_saved)


def limit_content_length(max_length):
    """
    上传数据最大限制
    :param max_length: Byte
    :return:
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cl = request.content_length
            if cl is not None and cl > max_length:
                abort(413)
            return func(*args, **kwargs)

        return wrapper

    return decorator


def is_number(s):
    """
    判断字符串能否转换为数字
    :param s: 字符串
    :return: 能转换为数字为True，否则为False
    """
    try:
        float(s)
        return True
    except ValueError:
        pass

    try:
        import unicodedata
        unicodedata.numeric(s)
        return True
    except (TypeError, ValueError):
        pass

    return False


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


def send_system_message(message_head: str, message_body: str):
    """
    发送系统消息

    :param message_head: message head
    :param message_body: message body
    :return: None
    """
    time = datetime.now()
    current_room = session.get('username')
    username = 'system'
    message = dict(room=current_room,
                   username=username,
                   message_head=message_head,
                   message_body=message_body,
                   time=time)
    mongo.db.message.insert_one(message)
    message = dumps(message)
    emit('new_room_message', message, room=current_room)


def parse_class_xlrd(class_xlrd: object):
    """
    解析班级学生信息excel表

    :param class_xlrd: flask.request.files['file']对象 班级学生信息excel表
    :return: [dict(student_no=str,
                   student_name=str,
                   student_school=str,
                   student_faculty=str,
                   student_class=str,
                   student_phone=str)]
    """
    class_info = pd.read_excel(class_xlrd)
    class_info = class_info.to_numpy()
    class_info_list = []
    for student_info in class_info:
        info_keys = ['student_no', 'student_name', 'student_school', 'student_faculty', 'student_class',
                     'student_phone']
        info_keys_len = len(info_keys)
        info_dict = {info_keys[i]: str(student_info[i]) for i in range(info_keys_len)}
        class_info_list.append(info_dict)
    return class_info_list


def create_account(student_no: str, student_name: str, password: str, role: str = "student",
                   student_faculty: str = "", student_class: str = "", student_school: str = "",
                   student_phone: str = "", teacher: str = ""):
    """
    创建账号
    :param teacher:
    :param student_phone:
    :param student_school:
    :param student_class:
    :param student_faculty:
    :param student_no: 学号
    :param role: 权限，可为'admin', 'teacher', 'student', 默认为'student'
    :param student_name:
    :param password:
    :return:
    """
    if not teacher and role == 'student':
        teacher = teacher
    mongo.db.user.update(dict(student_no=student_no),
                         {'$setOnInsert': dict(student_no=role,
                                               role=role,
                                               student_name=student_name,
                                               teacher=teacher,
                                               student_school=student_school,
                                               student_faculty=student_faculty,
                                               student_class=student_class,
                                               student_phone=student_phone,
                                               password=generate_password_hash(password))},
                         upsert=True)


def create_test_account():
    """
    创建测试账号
    :return:
    """
    # 创建管理员账号
    create_account(student_no="admin", role="admin", student_name="admin", password="accojOwner")
    # 创建教师账号
    create_account(student_no="teacher", role="teacher", student_name="teacher", password="123")
    # 创建学生账号
    with open('accoj/download/test.xlsx', 'rb') as f:
        user_infos = parse_class_xlrd(f)
        user_infos_len = len(user_infos)
        for i in range(0, user_infos_len):
            create_account(student_no=user_infos[i].get('student_no'),
                           student_name=user_infos[i].get('student_name'),
                           password='123',
                           role='student',
                           student_faculty=user_infos[i].get('student_faculty'),
                           student_class=user_infos[i].get('student_class'),
                           student_school=user_infos[i].get('student_school'),
                           student_phone=user_infos[i].get('student_phone'),
                           teacher='teacher')
