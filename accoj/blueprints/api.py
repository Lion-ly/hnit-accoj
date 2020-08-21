#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/6/11 22:09
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : api.py
# @Software: PyCharm
import datetime
import os
import json
from flask import Blueprint, jsonify, request, session, send_from_directory, current_app
from bson.json_util import dumps
from accoj.blueprints import get_schedule
from accoj.utils import parse_class_xlrd, login_required_teacher, login_required
from accoj.extensions import mongo, redis_cli
from accoj.emails import assign_email

api_bp = Blueprint('api', __name__)


@api_bp.route('/get_user_rank', methods=['GET'])
def get_user_rank():
    # 获取所有的成绩信息
    scores_info = mongo.db.rank.find({}, {'_id': 0})
    scores_info_sorted = sorted(scores_info, key=lambda e: (e.__getitem__('sum_score')), reverse=True)
    scores_info_sorted_len = len(scores_info_sorted)
    for i in range(0, scores_info_sorted_len):
        scores_info_sorted[i]['rank'] = i + 1
    result, data = True, scores_info_sorted
    return jsonify(result=result, data=data)


@api_bp.route('/profile_api', methods=['POST'])
@login_required
def profile_api():
    """
    个人中心api
    """

    def get_user_profile():
        """获取用户个人信息"""
        result, data = False, None
        user = mongo.db.user.find_one(dict(student_no=student_no),
                                      dict(_id=0, password=0, role=0))
        if user:
            result, data = True, user
        return jsonify(result=result, data=data)

    def submit_user_profile(_data: dict):
        """保存用户个人信息"""
        result, data, message = False, None, ''

        user = mongo.db.user.find_one(dict(student_no=student_no),
                                      dict(_id=1))
        if user:
            _data.pop('api')
            update_data = dict(
                nick_name=_data.get('nick_name'),
                student_sex=_data.get('student_sex'),
                personalized_signature=_data.get('personalized_signature'),
                student_borth=_data.get('student_borth'))
            mongo.db.user.update(dict(student_no=student_no),
                                 {'$set': update_data})
            result, data, message = True, None, '保存成功！'
        return jsonify(result=result, data=data, message=message)

    def get_user_schedule():
        data = get_schedule(student_no)
        if data:
            result, data = True, data
        else:
            data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            result, data = True, data
        return jsonify(result=result, data=data)

    def get_user_score():
        a_keys = ['_id', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
        a_values = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        search_dict = dict(zip(a_keys, a_values))
        data_tmp = mongo.db.rank.find_one({'student_no': student_no}, search_dict)
        if data_tmp:
            data = list(data_tmp.values())
            result = True
            print('score')
        else:
            result = True
            data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            print('no score')
        return jsonify(result=result, data=data)

    json_data = request.get_json()
    _api = json_data.get('api')
    get_api_dict = dict(get_user_profile=get_user_profile,
                        get_user_schedule=get_user_schedule,
                        get_user_score=get_user_score)
    submit_api_dict = dict(submit_user_profile=submit_user_profile)
    student_no = session.get('username')
    if _api in get_api_dict:
        return get_api_dict[_api]()
    elif _api in submit_api_dict:
        return submit_api_dict[_api](json_data)
    return jsonify(result=False, data=None)


@api_bp.route('/teacher_api', methods=['POST'])
@login_required_teacher
def teacher_api():
    """
    教师后台api
    """

    def get_manage_time_info_from_redis():
        teacher = username
        time_infos = []
        for key in redis_cli.scan_iter('classes:*'):
            time_info = json.loads(redis_cli[key].decode('utf-8'))
            _teacher = time_info.get('teacher')
            time = time_info.get('time')
            class_name = key.decode('utf-8').split(':')[-1]
            # print(f"class_name: {class_name}")
            if teacher == _teacher:
                time_infos.append({'class_name': class_name, 'time': time})
        return time_infos

    def get_manage_time_info():
        """获取时间管理信息"""
        result, data = False, None

        time_infos = get_manage_time_info_from_redis()
        # print(f"1. timeInfos:{time_infos}")
        if time_infos:
            result = True
            data = json.dumps(time_infos)
        # print(f"2. timeInfos:{data}")
        return jsonify(result=result, data=data)

    def get_class_list():
        """获取班级列表"""
        result, data = False, None
        users = mongo.db.user.find(dict(teacher=username),
                                   dict(_id=0, student_school=1, student_faculty=1, student_class=1))
        if users:
            class_info = list()
            for user in users:
                e_dic = dict(student_school=user.get('student_school'),
                             student_faculty=user.get('student_faculty'),
                             student_class=user.get('student_class'))
                class_info.append(e_dic) if e_dic not in class_info else None
            class_info = dumps(class_info)
            result, data = True, class_info
        return jsonify(result=result, data=data)

    def correct_homework(_data: dict):
        """批改作业"""
        result, data = False, None
        student_no = _data.get('student_no')
        if mongo.db.company.find_one({'student_no': student_no}):
            # teacher字段记录教师账号id（状态记忆，role不变，返回教师后台的时候会再次转换回去,teacher字段设为空）
            session['teacher'] = username
            session['username'] = student_no  # 权限转换
            result = True
        return jsonify(result=result, data=data)

    def submit_manage_time_info(_data: dict):
        result, data = False, None
        class_name = _data.get('class_name')
        time = _data.get('time')
        teacher = username
        if redis_cli[f'classes:{class_name}']:
            redis_cli[f'classes:{class_name}'] = json.dumps({'time': time, 'teacher': teacher})
            mongo.db.classes.update({'class_name': class_name}, {'$set': {'time': time}})
            result = True
        time_infos = get_manage_time_info_from_redis()
        if time_infos:
            result = True
            data = json.dumps(time_infos)
        return jsonify(result=result, data=data)

    json_data = request.get_json()
    _api = json_data.get('api')
    get_api_dict = dict(get_class_list=get_class_list, get_manage_time_info=get_manage_time_info)
    submit_api_dict = dict(correct_homework=correct_homework, submit_manage_time_info=submit_manage_time_info)
    username = session.get('username')
    if _api in get_api_dict:
        return get_api_dict[_api]()
    elif _api in submit_api_dict:
        return submit_api_dict[_api](json_data)
    return jsonify(result=False, data=None)


@api_bp.route('/add_class', methods=['POST'])
@login_required_teacher
def add_class():
    """添加班级"""
    f = request.files['file']
    class_info = parse_class_xlrd(f)
    result, message = assign_email(user_infos=class_info)
    return jsonify(result=result, message=message)


@api_bp.route('/download_attached', methods=['GET'])
@login_required_teacher
def download_attached():
    """下载添加班级示例附件"""
    path = current_app.config['DOWNLOAD_FOLD']
    path = os.path.join(current_app.root_path, path)
    return send_from_directory(path, filename='添加班级格式.xlsx', as_attachment=True)


@api_bp.route('/manage_time', methods=['POST'])
@login_required_teacher
def manage_time():
    """时间管理"""

    def time_validate(text: str):
        try:
            datetime.datetime.strptime(text, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return False

    def format_check(time: dict):
        for v, k in time:
            if not time_validate(v['start']) or not time_validate(v['end']):
                return False
        return True

    result, data = False, None
    json_data = request.get_json()
    class_name = json_data.get('class_name')
    _time = json_data.get('time')
    is_ok = format_check(_time)
    if is_ok:
        _data = mongo.db.classes.update()({'class_name': class_name},
                                          {'$set': {'time': _time}})
        if _data:
            result = True
            redis_cli[f'classes:{class_name}'] = json.dumps({'time': _time})
    return jsonify(result=result, data=data)


@api_bp.route('/get_student_info_correct', methods=['GET'])
@login_required_teacher
def get_student_info_correct():
    """
    教师后台->批改作业  表格信息
    :return:
    """
    # get_classes_time("湖南工学院-网络工程1701", 1)
    username = session.get('username')
    _user_info = mongo.db.user.find(dict(teacher=username),
                                    dict(_id=0, student_no=1, student_name=1, student_school=1,
                                         student_faculty=1, student_class=1))
    user_info = list()
    for user in _user_info:
        e_dic = dict(student_no=user.get('student_no'),
                     student_name=user.get('student_name'),
                     student_school=user.get('student_school'),
                     student_faculty=user.get('student_faculty'),
                     student_class=user.get('student_class'),
                     t='<button type="button" class="btn btn-outline-info">开始批改</a>')
        user_info.append(e_dic)
    for i, e in enumerate(user_info):
        user_info[i]['num'] = i + 1
        user_info[i]['correct_schedule'] = "0%"
    result, data = True, user_info
    return jsonify(result=result, data=data)


@api_bp.route('/commit_correct', methods=['POST'])
# @login_required_teacher
def commit_correct():
    """教师提交作业评分"""
    result, data = False, {'message': ''}
    if session.get('role') != 'teacher':
        return jsonify(result=result, data=data)
    err_message = '评分不符合规范或学生未完成作业'
    username = session.get('username')
    schedule_confirm = mongo.db.company.find_one(dict(student_no=username), dict(schedule_confirm=1))
    if not schedule_confirm:
        err_message = '所选账号不存在或该用户未完成作业'
        return jsonify(result=False, data={'message': err_message})
    titles = {'trend_analysis', 'common_ratio_analysis',  # 报表名
              'ratio_analysis', 'dupont_analysis'}
    categories = {'first', 'second'}  # first（负债表） 或 second（利润表）
    json_data = request.get_json()
    title = json_data.get('title')
    category = json_data.get('category')
    score = json_data.get('score')  # 分数
    if title in titles:
        if title in {'trend_analysis', 'common_ratio_analysis'}:
            # 趋势分析法 / 共同比分析法
            if score and 0 <= score <= 5 and category in categories and schedule_confirm.get(f'{title}_confirm').get(
                    category):
                result = True
                mongo.db.company.update({'student_no': username},
                                        {'$set': {f'evaluation.{title}_score.{category}.teacher_score': score}})
        elif title == 'ratio_analysis':
            # 比率分析法
            if score and 0 <= score <= 5 and schedule_confirm.get(f'{title}_confirm'):
                result = True
                mongo.db.company.update({'student_no': username},
                                        {'$set': {f'evaluation.{title}_score.teacher_score': score}})
        elif title == 'dupont_analysis':
            # 杜邦分析法
            if score and 0 <= score <= 70 and schedule_confirm.get(f'{title}_confirm'):
                result = True
                mongo.db.company.update({'student_no': username},
                                        {'$set': {f'evaluation.{title}_score.teacher_score': score}})
    if not result:
        data['message'] = err_message
    return jsonify(result=result, data=data)


@api_bp.route('/get_student_info_notify_c', methods=['GET'])
@login_required_teacher
def get_student_info_notify_c():
    """
    教师后台->发送通知->班级通知  表格信息
    :return:
    """
    username = session.get('username')
    _class_info = mongo.db.user.find(dict(teacher=username),
                                     dict(_id=0, student_school=1, student_faculty=1, student_class=1))
    class_info = list()
    for _class in _class_info:
        e_dic = dict(student_school=_class.get('student_school'),
                     student_faculty=_class.get('student_faculty'),
                     student_class=_class.get('student_class'),
                     t='<input type="checkbox" class="switch-input">')
        class_info.append(e_dic) if e_dic not in class_info else None
    for i, e in enumerate(class_info):
        class_info[i]['num'] = i + 1
    result, data = True, class_info
    return jsonify(result=result, data=data)


@api_bp.route('/get_student_info_notify_p', methods=['GET'])
@login_required_teacher
def get_student_info_notify_p():
    """
    教师后台->发送通知->个人通知  表格信息
    :return:
    """
    username = session.get('username')
    _user_info = mongo.db.user.find(dict(teacher=username),
                                    dict(_id=0, student_no=1, student_name=1, student_school=1,
                                         student_faculty=1, student_class=1))
    user_info = list()
    for user in _user_info:
        e_dic = dict(student_no=user.get('student_no'),
                     student_name=user.get('student_name'),
                     student_school=user.get('student_school'),
                     student_faculty=user.get('student_faculty'),
                     student_class=user.get('student_class'),
                     t='<input type="checkbox" class="switch-input">')
        user_info.append(e_dic)
    for i, e in enumerate(user_info):
        user_info[i]['num'] = i + 1
    result, data = True, user_info
    return jsonify(result=result, data=data)


@api_bp.route('teacher_notify_c')
@login_required_teacher
def teacher_notify_c():
    result, data = False, {}
    username = session.get('username')
    json_data = request.get_json()
    class_name = json_data.get('class_name')
    message_body = json_data.get('message_body')
    message_head = '教师通知'
    _time = datetime.datetime.now()
    students = mongo.db.classes.find({'class_name': class_name})
    if students:
        result = True
        insert_doc = [
            {'room': student, 'username': username, 'message_head': message_head, 'message_body': message_body,
             'time': _time} for student in students]
        mongo.db.message.insert_many(insert_doc)
    return jsonify(result=result, data=data)


@api_bp.route('teacher_notify_p')
@login_required_teacher
def teacher_notify_p():
    result, data = False, {}
    username = session.get('username')
    json_data = request.get_json()
    student_no = json_data.get('student_no')
    message_body = json_data.get('message_body')
    message_head = '教师通知'
    _time = datetime.datetime.now()
    user = mongo.db.user.find({'student_no': student_no})
    if user:
        result = True
        insert_doc = {'room'        : student_no, 'username': username, 'message_head': message_head,
                      'message_body': message_body, 'time': _time}
        mongo.db.message.insert(insert_doc)
    return jsonify(result=result, data=data)


@api_bp.route('/get_news', methods=['GET'])
def get_news():
    """获取新闻"""
    result, data = False, None
    news = mongo.db.news_spider.find()
    if news:
        data = dumps(news)
        result = True
    return jsonify(result=result, data=data)
