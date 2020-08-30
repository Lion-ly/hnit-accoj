#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:57
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py.py
# @Software: PyCharm
import json
import datetime
from functools import wraps
import pandas as pd
from flask import session, redirect, url_for, request, abort, jsonify, render_template
from werkzeug.security import generate_password_hash
from accoj.extensions import mongo, redis_cli
from accoj.exception import CreatAccountError

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


def course_time_open_required(course_no: int):
    """
    需要课程时间开启
    :return:
    """

    def func_wrapper(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            flag = is_course_time_open(course_no)
            if not flag:
                return render_template('course/notOpen.html')
            return func(*args, **kwargs)

        return wrapper

    return func_wrapper


def course_time_not_end_required(course_no: int):
    def func_wrapper(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            flag = is_course_time_open(course_no)
            if flag == -1:
                return jsonify(result=False, message="提交已截止！")
            return func(*args, **kwargs)

        return wrapper

    return func_wrapper


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


def is_course_time_open(course_no: int) -> int:
    """
    判断班级课程时间是否开启/结束/截止
    :param course_no: 课程号（1~10）
    :return: 0->未开启
             1->已开启
             -1->已截止
    """
    class_name = session.get("class_name")
    flag = 0
    try:
        time_info = redis_cli[f'classes:{class_name}']
    except KeyError:
        return 0
    if time_info:
        time_info = time_info.decode('utf-8')
    time_info = json.loads(time_info)
    course_time = time_info.get('time').get(str(course_no))
    start_time = course_time.get('start')
    end_time = course_time.get('end')
    try:
        end_time = datetime.datetime.strptime(end_time, '%Y-%m-%dT%H:%M')
        start_time = datetime.datetime.strptime(start_time, '%Y-%m-%dT%H:%M')
    except ValueError:
        return 0
    is_open = course_time.get('is_open')
    if not is_open:
        flag = 0
    else:
        now_time = datetime.datetime.now()
        if start_time <= now_time < end_time:
            flag = 1
        elif now_time >= end_time:
            flag = -1
    return flag


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


def send_system_message(message_head: str, message_body: str, room: str, username: str = 'system'):
    """
    发送系统消息

    :param message_head: message head
    :param message_body: message body
    :param room: room name
    :param username: to people username
    :return: None
    """
    time = datetime.datetime.now()
    message = dict(room=room,
                   username=username,
                   message_head=message_head,
                   message_body=message_body,
                   time=time)
    mongo.db.message.insert_one(message)


def send_system_message_batch(messages: list):
    """
    批量发送系统消息
    :param messages: [{message_head: "", message_body: "", "username": "", "room": ""}]
    :return: None
    """
    time = datetime.datetime.now()
    _messages = []
    for message in messages:
        message_head = message.get('message_head')
        message_body = message.get('message_body')
        room = message.get('room')
        username = message.get('username')
        message = dict(room=room,
                       username=username,
                       message_head=message_head,
                       message_body=message_body,
                       time=time)
        _messages.append(message)
    mongo.db.message.insert_many(_messages)


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
    teacher = 'teacher' if not teacher and role == 'student' else teacher
    mongo.db.user.update(dict(student_no=student_no),
                         {'$setOnInsert': dict(student_no=student_no,
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
    try:
        create_account_from_excel('accoj/download/test.xlsx')
        create_account_from_excel('accoj/download/test1.xlsx')
        create_account_from_excel('accoj/download/test2.xlsx')
        print('INFO: Create test account successfully!')
    except CreatAccountError:
        raise CreatAccountError()


def create_account_from_excel(filename: str):
    with open(filename, 'rb') as f:
        user_infos = parse_class_xlrd(f)
        if not user_infos:
            print(f'Named \'{filename}\' is empty, Create account Fail!')
            return
        class_name = f'{user_infos[0].get("student_school")}-{user_infos[0].get("student_class")}'
        students = []
        for user_info in user_infos:
            student_no = user_info.get('student_no')
            students.append(student_no)
            create_account(student_no=student_no,
                           student_name=user_info.get('student_name'),
                           password='123',
                           role='student',
                           student_faculty=user_info.get('student_faculty'),
                           student_class=user_info.get('student_class'),
                           student_school=user_info.get('student_school'),
                           student_phone=user_info.get('student_phone'),
                           teacher='teacher')
        create_class(class_name, students)


def create_class(class_name: str, students: list, teacher: str = 'teacher'):
    _time = {"1" : {"start": "", "end": "", "is_open": False},
             "2" : {"start": "", "end": "", "is_open": False},
             "3" : {"start": "", "end": "", "is_open": False},
             "4" : {"start": "", "end": "", "is_open": False},
             "5" : {"start": "", "end": "", "is_open": False},
             "6" : {"start": "", "end": "", "is_open": False},
             "7" : {"start": "", "end": "", "is_open": False},
             "8" : {"start": "", "end": "", "is_open": False},
             "9" : {"start": "", "end": "", "is_open": False},
             "10": {"start": "", "end": "", "is_open": False}}
    mongo.db.classes.update(dict(class_name=class_name),
                            {'$setOnInsert': dict(teacher=teacher,
                                                  students=students,
                                                  time=_time)},
                            upsert=True)
    if not redis_cli.get(f'classes:{class_name}'):
        redis_cli[f'classes:{class_name}'] = json.dumps({"time": _time, "teacher": teacher})


def redis_connect_test():
    """redis连接测试"""
    redis_cli['status'] = 'success'
    status = redis_cli['status'].decode('utf-8')
    if status:
        redis_cli.delete('status')
        print(f"INFO: redis test {status}!")
    else:
        print(f"ERROR: redis test Fail!")
