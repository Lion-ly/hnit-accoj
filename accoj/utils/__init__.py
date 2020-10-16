#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:57
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py.py
# @Software: PyCharm
import json
import datetime
from typing import List
from bson.json_util import dumps
from functools import wraps
from threading import Timer
import pandas as pd
from flask import (session,
                   redirect,
                   url_for, request,
                   abort,
                   jsonify,
                   render_template)
from werkzeug.security import generate_password_hash
from accoj.extensions import (mongo,
                              redis_cli)
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


def login_required_admin(func):
    """
    需要管理员权限

    :param func:
    :return:
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        if session.get("role") == "admin":
            return func(*args, **kwargs)
        else:
            return redirect(url_for('index.index'))

    return wrapper


def login_required_teacher(func):
    """
    需要教师权限，只有教师后台才会用到这个装饰器

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
                session["class_name"] = None
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
    time_info = redis_cli.get(f'classes:{class_name}')
    if time_info:
        time_info = time_info.decode('utf-8')
    else:
        return 0
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
    info_keys = ['student_no', 'student_name', 'student_school', 'student_faculty', 'student_class',
                 'student_phone']
    info_keys_len = len(info_keys)
    for student_info in class_info:
        if str(student_info[0]).encode('utf-8') in redis_cli.smembers('user'):
            return []
        info_dict = {info_keys[i]: str(student_info[i]) for i in range(info_keys_len)}
        class_info_list.append(info_dict)
    return class_info_list


def create_account(student_no: str, student_name: str, password: str = "123", role: str = "student",
                   student_faculty: str = "", student_class: str = "", student_school: str = "",
                   student_phone: str = "", teacher: str = ""):
    """
    创建账号

    :param student_no:
    :param student_name:
    :param password:
    :param role: 权限，可为'admin', 'teacher', 'student', 默认为'student'
    :param student_faculty:
    :param student_class:
    :param student_school:
    :param student_phone:
    :param teacher:
    :return:
    """
    if student_no.encode('utf-8') in redis_cli.smembers('user'):
        return False
    redis_cli.sadd('user', student_no)
    teacher = 'teacher' if not teacher and role == 'student' else teacher
    insert_dict = dict(student_no=student_no,
                       role=role,
                       student_name=student_name,
                       teacher=teacher,
                       student_school=student_school,
                       student_faculty=student_faculty,
                       student_class=student_class,
                       student_phone=student_phone,
                       password=generate_password_hash(password, salt_length=24),
                       status="通过审核")
    mongo.db.user.update(dict(student_no=student_no),
                         {'$setOnInsert': insert_dict},
                         upsert=True)
    redis_multi_push(redis_cli, 'user_info', [dumps(insert_dict)])
    if role == "student":
        insert_rank_score_student(student_no=student_no)
    return True


def create_test_account():
    """
    创建测试账号
    :return:
    """
    # 创建数据库管理员账号
    create_account(student_no="dbadmin", role="dbadmin", student_name="dbadmin", password="accojOwner")
    # 创建管理员帐号
    create_account(student_no="admin", role="admin", student_name="admin", password="accojOwner")
    # 创建教师账号
    create_account(student_no="teacher", role="teacher", student_name="teacher", password="123")
    # 创建学生账号
    try:
        create_account_from_excel('accoj/download/test.xlsx')
        # create_account_from_excel('accoj/download/test1.xlsx')
        # create_account_from_excel('accoj/download/test2.xlsx')
        print('INFO: Create test account successfully!')
    except CreatAccountError:
        raise CreatAccountError()


def create_account_from_excel(filename: str, user_infos=None, teacher: str = 'teacher'):
    flag = False
    f = None
    if not user_infos:
        flag = True
        f = open(filename, 'rb')
        _user_infos = parse_class_xlrd(f)
        # with open(filename, 'rb') as f:
    else:
        _user_infos = user_infos
    if not _user_infos:
        print(f'Named \'{filename}\' is empty, Create account Fail!')
        return
    class_name = f'{_user_infos[0].get("student_school")}-{_user_infos[0].get("student_class")}'
    students = []
    for user_info in _user_infos:
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
                       teacher=teacher)
    create_class(class_name, students, teacher)
    if flag:
        try:
            f.close()
        except AttributeError:
            pass


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


class RepeatingTimer(Timer):
    def run(self):
        while not self.finished.is_set():
            self.function(*self.args, **self.kwargs)
            self.finished.wait(self.interval)


def init_celery(app, celery):
    """Add flask app context to celery.Task"""
    TaskBase = celery.Task

    class ContextTask(TaskBase):
        abstract = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask


def redis_multi_push(_redis_cli, q, vals):
    """
    redis队列批量push
    :param _redis_cli: redis object
    :param q: queue name
    :param vals: values list
    :return:
    """
    pipe = _redis_cli.pipeline()
    for val in vals:
        pipe.lpush(q, val)
    pipe.execute()


def change_password(student_no: str, new_password: str):
    mongo.db.user.update({"student_no": student_no},
                         {"$set": {"password": generate_password_hash(new_password, salt_length=24)}})


#  -----rank集合存入成绩
def insert_rank_score(student_no: str, score: list):
    """
    rank集合存入成绩
    :param student_no: 学号
    :param score: 分数列表，[sum_score, one, two, three, four, five, six, seven, eight, nine, ten]
    :return:
    """
    user_info = mongo.db.user.find_one(dict(student_no=student_no),
                                       dict(_id=0, student_class=1, student_name=1))
    student_class = user_info.get("student_class")
    student_name = user_info.get("student_name")
    student_name = student_name if student_name else "Default"
    # 第一次更新时输入所有的键值  学号 班级 姓名 总分 各部分
    infos = {"student_no": student_no, "student_class": student_class, "student_name": student_name}
    score_keys = ['sum_score', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
    score_infos = dict(zip(score_keys, score))
    infos.update(score_infos)
    return infos


def insert_rank_score_student(student_no: str):
    """
    创建学生账号时存入成绩
    :param student_no: 学号
    :return:
    """
    score = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    infos = insert_rank_score(student_no=student_no, score=score)
    mongo.db.rank.insert(infos)


def update_business_rank_score():
    """
    对业务一录入分数进rank
    :return:
    """
    student_no = session.get("username")
    score = [100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    infos = insert_rank_score(student_no=student_no, score=score)
    mongo.db.rank.update({"student_no": student_no}, infos)


def update_rank(schedule_name, scores=None, student_no=None):
    """
    用户每次提交更新用户的排行榜集合中的成绩等信息
    :param student_no:
    :param schedule_name:
    :param scores:
    :return:
    """
    student_no = student_no if student_no else session.get("username")
    # 分数信息
    if scores:
        evaluation_scores = scores
    # 排行集合成绩信息
    user_score_info = mongo.db.rank.find_one(dict(student_no=student_no), dict(_id=0))

    def update_key_element():
        key_element_sum_score = evaluation_scores[-1]
        sum_score = user_score_info.get("sum_score")
        now_score = user_score_info.get('two')
        sum_score -= now_score if now_score else 0
        sum_score = round(sum_score + key_element_sum_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, two=key_element_sum_score)})

    def update_subject():
        subject_sum_score = evaluation_scores[-1]
        sum_score = user_score_info.get("sum_score")
        now_score = user_score_info.get('three')
        sum_score -= now_score if now_score else 0
        sum_score = round(sum_score + subject_sum_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, three=subject_sum_score)})

    def update_entry():
        entry_sum_score = evaluation_scores[-1]
        sum_score = user_score_info.get("sum_score")
        now_score = user_score_info.get('four')
        sum_score -= now_score if now_score else 0
        sum_score = round(sum_score + entry_sum_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, four=entry_sum_score)})

    # 第五部分得分
    # 账户得分
    def update_ledger():
        ledger_score_sum = scores.get("first") + scores.get("second")
        sum_score = user_score_info.get("sum_score")
        now_score = user_score_info.get('five')
        sum_score -= now_score if now_score else 0
        sum_score = round(sum_score + ledger_score_sum, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, five=round(ledger_score_sum, 2))})

    # 平衡表得分
    def update_balance_sheet():
        ledger_score_sum = user_score_info.get("five")
        ledger_score_sum += scores
        sum_score = user_score_info.get("sum_score")
        sum_score += scores
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=round(sum_score, 2), five=round(ledger_score_sum, 2))})

    # 第六部分 会计凭证部分得分
    def update_acc_document():
        acc_sum_score = evaluation_scores[-1]
        sum_score = user_score_info.get("sum_score")
        now_score = user_score_info.get('six')
        sum_score -= now_score if now_score else 0
        sum_score = round(acc_sum_score + sum_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, six=acc_sum_score)})

    # 会计账簿部分得分
    # 明细账
    def update_subsidiary_account():
        sum_score = user_score_info.get("sum_score")
        now_score = user_score_info.get('seven')
        sum_score -= now_score if now_score else 0
        sum_score = round(scores + sum_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, seven=scores)})

    # 科目余额表
    def update_acc_balance_sheet():
        sum_score = round(scores + user_score_info.get("sum_score"), 2)
        this_sum_score = user_score_info.get("seven")
        this_sum_score = round(this_sum_score + scores, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, seven=this_sum_score)})

    # 会计报表部分得分
    # 资产负债表
    def update_new_balance_sheet():
        sum_score = user_score_info.get("sum_score")
        now_score = user_score_info.get('eight')
        sum_score -= now_score if now_score else 0
        sum_score = round(scores + sum_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, eight=scores)})

    # 利润表
    def update_profit_statement():
        sum_score = round(scores + user_score_info.get("sum_score"), 2)
        this_sum_score = user_score_info.get("eight")
        this_sum_score = round(this_sum_score + scores, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, eight=this_sum_score)})

    # 会计报表部分得分
    # 趋势分析法得分
    def update_trend_analysis():
        sum_score = user_score_info.get("sum_score")
        now_score = user_score_info.get('nine')
        sum_score -= now_score if now_score else 0
        trend_analysis_score_sum = scores.get("first").get("student_score") + \
                                   scores.get("second").get("student_score")
        trend_teacher_score_1 = scores.get("first").get("teacher_score")
        trend_teacher_score_2 = scores.get("second").get("teacher_score")

        if trend_teacher_score_1 >= 0:
            trend_analysis_score_sum += trend_teacher_score_1
        if trend_teacher_score_2 >= 0:
            trend_analysis_score_sum += trend_teacher_score_2
        sum_score = round(sum_score + trend_analysis_score_sum, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, nine=round(trend_analysis_score_sum, 2))})

    # 共同比分析法
    def update_common_ratio_analysis():
        analysis_sum_score = user_score_info.get("nine")
        common_analysis_score = scores.get(
            "first").get("student_score") + scores.get("second").get("student_score")
        common_ratio_teacher_score_1 = scores.get("first").get("teacher_score")
        common_ratio_teacher_score_2 = scores.get("second").get("teacher_score")
        if common_ratio_teacher_score_1 >= 0:
            common_analysis_score += common_ratio_teacher_score_1
        if common_ratio_teacher_score_2 >= 0:
            common_analysis_score += common_ratio_teacher_score_2
        analysis_sum_score = round(analysis_sum_score + common_analysis_score, 2)
        sum_score = round(user_score_info.get("sum_score") + common_analysis_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, nine=analysis_sum_score)})

    def update_ratio_analysis():
        analysis_sum_score = user_score_info.get("nine")
        ratio_analysis_score = evaluation_scores.get("student_score")
        ratio_analysis_teacher_score = scores.get("teacher_score")
        if ratio_analysis_teacher_score >= 0:
            ratio_analysis_score += ratio_analysis_teacher_score

        analysis_sum_score += ratio_analysis_score
        sum_score = round(user_score_info.get("sum_score") + ratio_analysis_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, nine=analysis_sum_score)})

    def update_dupont_analysis():
        sum_score = user_score_info.get("sum_score")
        now_score = user_score_info.get('ten')
        sum_score -= now_score if now_score else 0
        dupont_analysis_sum_score = scores.get("student_score")
        dupont_analysis_teacher_score = scores.get("teacher_score")
        if dupont_analysis_teacher_score >= 0:
            dupont_analysis_sum_score += dupont_analysis_teacher_score

        sum_score = round(sum_score + dupont_analysis_sum_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, ten=round(dupont_analysis_sum_score, 2))})

    update_schedule_dict = dict(key_element=update_key_element,
                                subject=update_subject,
                                entry=update_entry,
                                # 会计账户和平衡表
                                ledger=update_ledger,
                                balance_sheet=update_balance_sheet,
                                acc_document=update_acc_document,
                                # 明细账和科目余额表
                                subsidiary_account=update_subsidiary_account,
                                acc_balance_sheet=update_acc_balance_sheet,
                                # 资产负债和利润表部分
                                new_balance_sheet=update_new_balance_sheet,
                                profit_statement=update_profit_statement,
                                # 第九部分 趋势分析  比率分析
                                trend_analysis=update_trend_analysis,
                                common_ratio_analysis=update_common_ratio_analysis,
                                ratio_analysis=update_ratio_analysis,
                                # 第十部分
                                dupont_analysis=update_dupont_analysis
                                )
    if schedule_name in update_schedule_dict:
        update_schedule_dict[schedule_name]()


def get_student_schedule(student_no: str):
    """
    获取学生做题进度

    :param student_no: 学号
    :return:
    """
    schedule_info = mongo.db.company.find_one(dict(student_no=student_no),
                                              dict(_id=0, schedule_confirm=1))
    # 判断是否有进度
    if schedule_info:
        data = []
        schedule_info = schedule_info.get("schedule_confirm")
        # 获取涉及的科目数量
        involve_subjects = mongo.db.company.find_one(dict(student_no=student_no),
                                                     dict(_id=0, involve_subjects=1)).get("involve_subjects")
        if not involve_subjects:
            return
        involve_subjects_1 = involve_subjects.get("involve_subjects_1")
        involve_subjects_2 = involve_subjects.get("involve_subjects_2")
        sum_subjects_len = len(set(involve_subjects_1 + involve_subjects_2))

        # 获取进度值
        trend_analysis_confirm = schedule_info.get("trend_analysis_confirm")
        common_ratio_analysis_confirm = schedule_info.get("common_ratio_analysis_confirm")

        if schedule_info.get("business_confirm"):
            data.append(100)

        key_element_schedule = int((len(schedule_info.get("key_element_confirm")) / 20) * 100)
        data.append(key_element_schedule)

        subject_schedule = int((len(schedule_info.get("subject_confirm")) / 20) * 100)
        data.append(subject_schedule)

        entry_schedule_schedule = int((len(schedule_info.get("entry_confirm")) / 20) * 100)
        data.append(entry_schedule_schedule)

        # ledger_confirm   25 25 50
        ledger__schedule = 0
        ledger__schedule += int(
            (len(schedule_info.get("ledger_confirm").get("ledger1_confirm")) / len(involve_subjects_1)) * 25)
        ledger__schedule += int(
            (len(schedule_info.get("ledger_confirm").get("ledger2_confirm")) / len(involve_subjects_2)) * 25)
        if schedule_info.get("balance_sheet_confirm"):
            ledger__schedule += 50
        data.append(ledger__schedule)

        acc_document_schedule = int((len(schedule_info.get("acc_document_confirm")) / 20) * 100)
        data.append(acc_document_schedule)

        # 会计账簿部分进度
        account_schedule = 0
        account_schedule += int(
            (len(schedule_info.get("subsidiary_account_confirm")) / sum_subjects_len) * 50)
        if schedule_info.get("acc_balance_sheet_confirm"):
            account_schedule += 50
        data.append(account_schedule)

        # 会计报表部分进度
        financial_statements_schecule = 0
        if schedule_info.get("new_balance_sheet_confirm"):
            financial_statements_schecule += 50
        if schedule_info.get("profit_statement_confirm"):
            financial_statements_schecule += 50
        data.append(financial_statements_schecule)

        # 因素分析未做  20*5 or 15*4+20*2
        analysis_schedule = 0
        if trend_analysis_confirm.get("first"):
            analysis_schedule += 20
        if trend_analysis_confirm.get("second"):
            analysis_schedule += 20
        if common_ratio_analysis_confirm.get("first"):
            analysis_schedule += 20
        if common_ratio_analysis_confirm.get("second"):
            analysis_schedule += 20
        if schedule_info.get("ratio_analysis_confirm"):
            analysis_schedule += 20
        data.append(analysis_schedule)

        # 杜邦
        dupont_schedule = 0
        if schedule_info.get("dupont_analysis_confirm"):
            dupont_schedule += 100
        data.append(dupont_schedule)

        return data


def init_course_confirm(course_no: int = 0, class_name: str = "", student_no: str = "") -> bool:
    """
    课程重做

    """

    def format_key(t_key):
        return f"{t_key}_confirm"

    def _redo(students: List[str]) -> bool:
        """
        :param students: student_no list
        :return: bool
        """
        if students == [] or course_no not in [i for i in range(2, 11)]:
            return False

        schedule_dic = {format_key("key_element")          : [],
                        format_key("subject")              : [],
                        format_key("entry")                : [],
                        format_key("ledger")               : {format_key("ledger1"): [], format_key("ledger2"): []},
                        format_key("balance_sheet")        : False,
                        format_key("acc_document")         : [],
                        format_key("subsidiary_account")   : [],
                        format_key("acc_balance_sheet")    : False,
                        format_key("new_balance_sheet")    : False,
                        format_key("profit_statement")     : False,
                        format_key("trend_analysis")       : {"first": False, "second": False},
                        format_key("common_ratio_analysis"): {"first": False, "second": False},
                        format_key("ratio_analysis")       : False,
                        format_key("dupont_analysis")      : False, }
        c_dict = {2 : ["key_element"],
                  3 : ["subject"],
                  4 : ["entry"],
                  5 : ["ledger", "balance_sheet"],
                  6 : ["acc_document"],
                  7 : ["subsidiary_account", "acc_balance_sheet"],
                  8 : ["new_balance_sheet", "profit_statement"],
                  9 : ["trend_analysis", "common_ratio_analysis", "ratio_analysis"],
                  10: ["dupont_analysis"]}
        num_dic = {2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine"}
        users, company_update_dict = [], {}
        if students:
            for student in students:
                users.extend([student, f"{student}_cp"])
            companies = mongo.db.company.find({"student_no": {"$in": users}}, {"student_no": 1})
            users = [company.get('student_no') for company in companies]
        for course in c_dict.get(course_no):
            _key = format_key(course)
            company_update_dict[f"schedule_confirm.{_key}"] = schedule_dic[_key]
        # 分数置0
        t_users = filter(lambda x:not x.endswith("_cp"), users)
        for user in t_users:
            score_key = num_dic.get(course_no)
            scores = mongo.db.rank.find_one({"student_no": user}, {score_key: True})
            old_score = scores.get(score_key)
            mongo.db.rank.update({"student_no": user},
                                 {"$set": {score_key: 0}, "$inc": {"sum_score": -old_score}})

        mongo.db.company.update({"student_no": {"$in": users}}, {"$set": company_update_dict})
        return True

    def redo_all():
        """
        全部重做
        :return:
        """
        students = mongo.db.user.find()
        _redo(students=list(students))

    def redo_by_class():
        """
        按班级重做
        :return:
        """
        _classes = mongo.db.classes.find_one({"class_name": class_name})
        if _classes:
            students = _classes.get('students')
            _redo(students=students)

    if course_no not in [i for i in range(2, 11)]:
        return False
    if class_name == "0" and not student_no:
        redo_all()
    elif class_name != "0":
        redo_by_class()
    elif student_no:
        _redo(students=[student_no])
    return True


def is_confirmed(course_no: int, company, infos_name) -> bool:
    """
    课程是否完成
    :param course_no:
    :param company:
    :param infos_name:
    :return:
    """
    confirm_flag = False
    schedule_confirm = company.get("schedule_confirm")
    confirmed = schedule_confirm.get("{}_confirm".format(infos_name))

    if course_no in [2, 3, 4, 6]:
        # 1.第二三四六次课6
        if len(confirmed) == MAX_BUSINESS_NO:
            confirm_flag = True
    elif infos_name in {"ledger", "subsidiary_account"}:
        # 2.“账户和明细账部分”
        involve_subjects = company.get("involve_subjects")
        involve_subjects_1 = involve_subjects.get("involve_subjects_1")
        involve_subjects_2 = involve_subjects.get("involve_subjects_2")
        if infos_name == "ledger":
            ledger1_confirm = confirmed.get("ledger1_confirm")
            ledger2_confirm = confirmed.get("ledger2_confirm")
            if ledger1_confirm and ledger2_confirm:
                if set(involve_subjects_1) == set(ledger1_confirm) and set(involve_subjects_2) == set(
                        ledger2_confirm):
                    confirm_flag = True
        elif infos_name == "subsidiary_account":
            if set(confirmed) == set(involve_subjects_2):
                confirm_flag = True
    else:
        # 3.其余部分
        td = {"trend_analysis", "common_ratio_analysis"}
        td = infos_name in td
        if (td and confirmed.get("first") and confirmed.get("second")) or (not td and confirmed):
            confirm_flag = True
    return confirm_flag
