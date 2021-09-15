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
import itertools
from bson.json_util import dumps
from flask import (Blueprint,
                   jsonify,
                   request,
                   session,
                   current_app,
                   send_from_directory)
from accoj.utils import (parse_class_xlrd,
                         login_required_teacher,
                         login_required,
                         send_system_message_batch,
                         create_account_from_excel,
                         get_student_schedule,
                         init_course_confirm,
                         manage_team_infos,
                         all_course_time_open_required, availability_of_the_team, send_system_message)
from accoj.extensions import mongo, redis_cli

api_bp = Blueprint('api', __name__)


@api_bp.route('/get_user_rank', methods=['GET'])
def get_user_rank():
    # 获取user 排行榜
    result, data = True, []
    scores_infos = redis_cli.zrange('rank', 0, -1, desc=True, withscores=True)
    scores_infos_len = len(scores_infos)
    if scores_infos_len:
        scores_info = [json.loads(scores_info[0]) for scores_info in scores_infos]
        for i in range(0, scores_infos_len):
            scores_info[i]['rank'] = i + 1
        result, data = True, scores_info
    return jsonify(result=result, data=data)


@api_bp.route('/get_team_rank', methods=['GET'])
def get_team_rank():
    # 获取team 排行榜
    result, data = True, []
    scores_infos = redis_cli.zrange('rank_team', 0, -1, desc=True, withscores=True)
    scores_infos_len = len(scores_infos)
    if scores_infos_len:
        scores_info = [json.loads(scores_info[0]) for scores_info in scores_infos]
        for i in range(0, scores_infos_len):
            scores_info[i]['rank_rank'] = i + 1
        result, data = True, scores_info
    return jsonify(result=result, data=data)


@api_bp.route('/profile_api', methods=['POST'])
@login_required
def profile_api():
    """
    个人中心api
    """

    def get_manage_time_info_from_redis():
        time_infos = []
        class_name = session.get('class_name')
        time_info = redis_cli.get(f'classes:{class_name}')
        time_info = json.loads(time_info)
        time = time_info.get('time')
        time_infos.append({'class_name': class_name, 'time': time})
        return time_infos

    def get_manage_time_info():
        """获取时间管理信息"""
        result, data = False, None

        time_infos = get_manage_time_info_from_redis()
        if time_infos:
            result = True
            data = json.dumps(time_infos)
        return jsonify(result=result, data=data)

    def get_user_profile():
        """获取用户个人信息"""
        result, data = False, None
        user = mongo.db.user.find_one(dict(student_no=member_no),
                                      dict(_id=0, password=0, role=0))
        if user:
            result, data = True, user
        return jsonify(result=result, data=data)

    def submit_user_profile(_data: dict):
        """保存用户个人信息"""
        result, data, message = False, None, ''

        user = mongo.db.user.find_one(dict(student_no=member_no),
                                      dict(_id=1))
        if user:
            _data.pop('api')
            update_data = dict(
                nick_name=_data.get('nick_name'),
                student_sex=_data.get('student_sex'),
                personalized_signature=_data.get('personalized_signature'),
                student_borth=_data.get('student_borth'))
            mongo.db.user.update(dict(student_no=member_no),
                                 {'$set': update_data})
            result, data, message = True, None, '保存成功！'
        return jsonify(result=result, data=data, message=message)

    def get_user_schedule():
        """学生团队做题进度"""
        data = get_student_schedule(student_no)
        if data:
            result, data = True, data
        else:
            data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            result, data = True, data
        return jsonify(result=result, data=data)

    def get_user_score():
        """获取各个(user and team)成绩"""
        a_keys = ['_id', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
        a_values = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        search_dict = dict(zip(a_keys, a_values))
        data = []
        data_tmp = mongo.db.rank_team.find_one({'team_no': student_no}, search_dict)
        data_tmp2 = mongo.db.rank.find_one({'student_no': member_no}, search_dict)
        if data_tmp and data_tmp2:
            data.append(list(data_tmp2.values()))
            data.append(list(data_tmp.values()))
            result = True
            # print('score')
        else:
            result = True
            data.append([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
            data.append([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
            # print('no score')
        return jsonify(result=result, data=data)

    def get_team_info():
        """获取团队信息"""
        result, data = False, None
        team = mongo.db.team.find_one(dict(team_no=student_no),
                                      dict(_id=0, leader_name=1, leader_no=1, team_name=1, member=1))
        if team:
            result, data = True, team
        return jsonify(result=result, data=data)

    def submit_team_infos(_data: dict):
        """提交团队信息, 修改团队姓名"""
        result, data, message = False, None, ""
        team_name = ""
        team_name = _data.get("team_name")
        if team_name != "":
            mongo.db.team.update_one({"team_no": student_no},
                                     {"$set": {"team_name": team_name}})
            mongo.db.rank_team.update_one({"team_no": student_no},
                                          {"$set": {"team_name": team_name}})
            result, data, message = True, None, "修改成功"
        return jsonify(result=result, data=data, message=message)

    json_data = request.get_json()
    _api = json_data.get('api')
    get_api_dict = dict(get_manage_time_info=get_manage_time_info,
                        get_user_profile=get_user_profile,
                        get_user_schedule=get_user_schedule,
                        get_user_score=get_user_score,
                        get_team_info=get_team_info)
    submit_api_dict = dict(submit_user_profile=submit_user_profile,
                           submit_team_infos=submit_team_infos)
    student_no = session.get('username')
    member_no = session.get("member_no")
    if _api in get_api_dict:
        return get_api_dict[_api]()
    elif _api in submit_api_dict:
        return submit_api_dict[_api](json_data)
    return jsonify(result=False, data=None)


@api_bp.route('/submit_redo', methods=['POST'])
@login_required
@availability_of_the_team
def submit_redo():
    """学生申请重做"""
    result, data, message = False, None, "申请失败！"
    json_data = request.get_json()
    course_no = json_data.get("course_no")
    reason = json_data.get("reason")
    team_no = session["username"]
    if int(course_no) in range(2, 11):
        flag = mongo.db.reform.find_one(dict(team_no=team_no,
                                             course_no=course_no))
        if flag:
            result, data, message = False, None, "已申请，教师还未处理！"
        else:
            time = datetime.datetime.now().strftime('%Y-%m-%d')
            team = mongo.db.team.find_one({"team_no": team_no}, {"_id": 0, "team_name": 1})
            team_name = team.get("team_no")
            mongo.db.reform.insert(dict(team_no=team_no,
                                        team_name=team_name,
                                        team_class=session["class_name"],
                                        team_student=session["student_name"],
                                        teacher=session["teacher"],
                                        course_no=course_no,
                                        reason=reason,
                                        time=time))
            result, data, message = True, None, "等待审核！"
    elif int(course_no) == 1:
        result, data, message = True, None, "不被允许！"
    return jsonify(result=result, data=data, message=message)


@api_bp.route('/teacher_api', methods=['POST'])
@login_required_teacher
def teacher_api():
    """
    教师后台api
    """

    def get_manage_time_info_from_redis():
        time_infos = []
        for key in redis_cli.scan_iter('classes:*'):
            time_info = json.loads(redis_cli[key])
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
        users = mongo.db.user.find(dict(teacher=teacher),
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

    def get_reform_infos():
        """获取申请重做学生信息"""
        result, data = False, None
        reform_infos = mongo.db.reform.find(dict(teacher=teacher),
                                            dict(_id=0, teacher=0))
        result, data = True, dumps(reform_infos)

        return jsonify(result=result, data=data)

    def no_group_student(_data: dict):
        """分班級，获取未分组的同学"""
        result, data = False, None
        data_ = {}
        school_class = _data.get('class_name').split('-')
        school_name = school_class[0]
        class_name = school_class[1]
        student_info = mongo.db.user.find(dict(student_class=class_name, student_school=school_name, team_no=""),
                                          dict(_id=0, student_name=1, student_no=1))
        data_['student_info'] = list(student_info) if student_info.count() != 0 else None
        team_info = mongo.db.team.find(dict(team_class=class_name, team_school=school_name),
                                       dict(_id=0, leader_name=1, leader_no=1, member=1))
        data_['team_info'] = list(team_info) if team_info.count() != 0 else None
        # data_ = dumps(data_, ensure_ascii=False)
        if data_:
            result, data = True, data_
        return jsonify(result=result, data=data)

    def submit_manage_group_info(_data: dict):
        """提交班级分组团队信息"""

        @all_course_time_open_required
        def intermediate_functions(flag=True):
            result, data, message = False, None, "保存失败！"
            if not flag:
                data, message = None, "保存失败，课程已开始或已结束！"
                return jsonify(result=result, data=data, message=message)
            teams = _data.get("team_infos")
            if class_name is not None and teams:
                team_infos = manage_team_infos(class_name=class_name, teams=teams, teacher=teacher)
                data = dict(team_infos=(list(team_infos if team_infos else None)))
                result, message = True, "保存成功！"
            return jsonify(result=result, data=data, message=message)

        class_name = _data.get("class_name")
        session["class_name"] = class_name
        return intermediate_functions()

    def correct_homework(_data: dict):
        """批改作业"""
        result, data, message = False, {}, "学号不存在或输入的用户未注册公司！"
        student_no = _data.get('student_no')
        company = mongo.db.company.find_one({'student_no': student_no})
        if company:
            user = mongo.db.team.find_one({'team_no': student_no})
            if user.get('teacher') == teacher:
                # teacher字段记录教师账号id（状态记忆，role不变，返回教师后台的时候会再次转换回去,teacher字段设为空）
                session['teacher'] = teacher
                session['username'] = student_no  # 权限转换
                session['class_name'] = user.get('team_school') + '-' + user.get('team_class')
                permission = mongo.db.team.find_one({"team_no": student_no},
                                                    {"_id": 0, "permission.{}_permission"
                                                    .format(student_no): 1})
                session["member_no"] = student_no
                session["permission"] = permission.get("permission") if permission else None
                result = True
            else:
                message = "输入的学号班级错误！"
        message = "" if result else message
        data["role"] = session["role"]
        return jsonify(result=result, data=data, message=message)

    def submit_manage_time_info(_data: dict):
        """提交时间管理信息"""
        result, data, message = False, None, "保存失败！"
        class_name = _data.get('class_name')
        time = _data.get('time')
        if redis_cli[f'classes:{class_name}']:
            redis_cli[f'classes:{class_name}'] = json.dumps({'time': time, 'teacher': teacher})
            mongo.db.classes.update({'class_name': class_name}, {'$set': {'time': time}})
            result = True
            send_class_notify({'message_body': "课程时间已改变，请注意查看课程时间！", 'classes': [class_name]},
                              is_from_system=True,
                              message_head="课程时间变更通知")
        time_infos = get_manage_time_info_from_redis()
        if time_infos:
            result = True
            data = json.dumps(time_infos)
        message = '保存成功！'
        return jsonify(result=result, data=data, message=message)

    def send_class_notify(_data: dict, is_from_system: bool = False, message_head: str = ""):
        """发送班级通知"""
        result, data, message = False, None, "发送通知失败！"
        message_body = _data.get('message_body')
        _classes = _data.get('classes')
        teacher_message_head = '发送班级通知成功'
        student_message_head = '教师：班级通知'
        classes = mongo.db.classes.find({"class_name": {"$in": _classes}}, {"students": True})
        students = []
        for c in classes:
            students.extend(c.get('students'))
        if students:
            if is_from_system:
                teacher_message_head = student_message_head = message_head
                username2 = 'system'
            else:
                username2 = teacher
            message_body = "To: " + str(_classes) + 4 * ' ' + "消息内容: " + message_body
            messages = [
                {'message_head': teacher_message_head, 'message_body': message_body, 'room': [teacher],
                 'username': 'system'},
                {'message_head': student_message_head, 'message_body': message_body, 'room': students,
                 'username': username2}]
            send_system_message_batch(messages)
            message, result = '发送通知成功！', True
        else:
            message = '发送通知失败，班级名错误！'
        return jsonify(result=result, data=data, message=message)

    def send_personal_notify(_data: dict):
        """发送个人通知"""
        result, data, message = False, None, '发送通知失败！'
        message_body = _data.get('message_body')
        students = _data.get('students')
        teacher_message_head = '发送个人通知成功'
        student_message_head = '教师:个人通知'
        users = mongo.db.user.find({"student_no": {"$in": students}}, {"student_no": True})
        students = [u.get('student_no') for u in users]
        if students:
            message_body = "To: " + str(students) + 4 * ' ' + "消息内容: " + message_body
            messages = [
                {'message_head': teacher_message_head, 'message_body': message_body, 'room': [teacher],
                 'username': 'system'},
                {'message_head': student_message_head, 'message_body': message_body, 'room': students,
                 'username': teacher}]
            send_system_message_batch(messages)
            message, result = '发送通知成功！', True
        else:
            message = '发送通知失败，学生学号错误！'
        return jsonify(result=result, data=data, message=message)

    json_data = request.get_json()
    _api = json_data.get('api')
    get_api_dict = dict(get_class_list=get_class_list,
                        get_manage_time_info=get_manage_time_info,
                        get_reform_infos=get_reform_infos)
    submit_api_dict = dict(correct_homework=correct_homework,
                           submit_manage_time_info=submit_manage_time_info,
                           send_class_notify=send_class_notify,
                           send_personal_notify=send_personal_notify,
                           no_group_student=no_group_student,
                           submit_manage_group_info=submit_manage_group_info)
    teacher = session.get('username')
    if _api in get_api_dict:
        return get_api_dict[_api]()
    elif _api in submit_api_dict:
        return submit_api_dict[_api](json_data)
    return jsonify(result=False, data=None)


@api_bp.route('/add_class', methods=['POST'])
@login_required_teacher
def add_class():
    """添加班级"""
    result, data, message = False, None, "上传失败，请检查Excel表格式!"
    teacher = session.get("username")
    f = request.files['file']
    '''
    try:
        class_info = parse_class_xlrd(f)
        if not class_info:
            return jsonify(result=result, message=message)
        for c in class_info:
            c.update({"teacher": teacher})
            c.update({"status": "审核中"})
        class_info = [dumps(c) for c in class_info]
        redis_multi_push(redis_cli, "user", class_info)
        result, message = True, "上传成功，等待管理员审核！"
    except Exception:
        pass
    '''
    try:
        class_infos = parse_class_xlrd(f)
        if not class_infos:
            return jsonify(result=result, message=message)
        create_account_from_excel("", class_infos, teacher=teacher)
        result, message = True, "班级添加成功！"
    except Exception:
        pass
    return jsonify(result=result, data=data, message=message)


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


@api_bp.route('/get_student_info_correct', methods=['GET', 'POST'])
@login_required_teacher
def get_student_info_correct():
    """
    教师后台->批改作业  表格信息
    :return:
    """
    teacher = session.get('username')
    result, data = False, []
    classes_dict = {}
    classes_infos = mongo.db.classes.find({}, dict(class_name=1, teacher=1))
    for c in classes_infos:
        classes_dict[c.get('class_name').split('-')[-1]] = c.get('teacher')
    scores_infos = redis_cli.zrange('rank_team', 0, -1, desc=True, withscores=True)
    scores_infos_len = len(scores_infos)
    if scores_infos_len:
        scores_info = [json.loads(scores_info[0]) for scores_info in scores_infos]
        for i in range(0, scores_infos_len):
            scores_info[i]['rank'] = i + 1
            scores_info[i]['correct_schedule'] = "0%"
        scores_info = list(filter(lambda x: classes_dict.get(x['team_class']) == teacher, scores_info))
        result, data = True, scores_info
    return jsonify(result=result, data=data)


@api_bp.route('/commit_correct', methods=['POST'])
@login_required_teacher
def commit_correct():
    """教师提交作业评分"""
    result, data = False, {'message': ''}
    if session.get('role') != 'teacher':
        return jsonify(result=result, data=data)
    err_message = '评分不符合规范或学生未完成作业'
    username = session.get("username")
    company = mongo.db.company.find_one(dict(student_no=username), dict(schedule_confirm=1, evaluation=1))
    schedule_confirm = company.get("schedule_confirm")
    evaluation = company.get("evaluation")
    if not schedule_confirm:
        err_message = '所选账号不存在或该用户未完成作业'
        return jsonify(result=False, data={'message': err_message})
    titles = {'trend_analysis', 'common_ratio_analysis',  # 报表名
              'ratio_analysis', 'dupont_analysis'}
    categories = {'first', 'second'}  # first（负债表） 或 second（利润表）
    json_data = request.get_json()
    title = json_data.get('title')
    category = json_data.get('category')
    score = int(json_data.get('score'))  # 分数
    if title in titles:
        t_confirm = schedule_confirm.get(f'{title}_confirm')
        if not t_confirm:
            data['message'] = err_message
            return jsonify(result=result, data=data)
        if title == 'acc_document':
            if category in t_confirm:
                result, data['message'] = True, "评分成功"
                mongo.db.company.update({'student_no': username},
                                        {'$set': {f'evaluation.{title}_score.{category}.teacher_score': score}})
        elif title in {'trend_analysis', 'common_ratio_analysis'}:
            # 趋势分析法 / 共同比分析法
            if score and 0 <= score <= 5 and category in categories and t_confirm.get(category):
                result, data['message'] = True, "评分成功"
                old_score = evaluation.get(f"{title}_score").get(category).get("teacher_score")
                new_score = score - old_score if old_score >= 0 else score
                mongo.db.company.update({'student_no': username},
                                        {'$set': {f'evaluation.{title}_score.{category}.teacher_score': score}})
                mongo.db.rank.update({'student_no': username},
                                     {'$inc': {'sum_score': new_score, 'nine': new_score}})
        elif title == 'ratio_analysis':
            # 比率分析法
            if score and 0 <= score <= 5 and t_confirm:
                result, data['message'] = True, "评分成功"
                old_score = evaluation.get(f"{title}_score").get("teacher_score")
                new_score = score - old_score if old_score >= 0 else score
                mongo.db.company.update({'student_no': username},
                                        {'$set': {f'evaluation.{title}_score.teacher_score': score}})
                mongo.db.rank.update({'student_no': username},
                                     {'$inc': {'sum_score': new_score, 'nine': new_score}})
        elif title == 'dupont_analysis':
            # 杜邦分析法
            if score and 0 <= score <= 70 and t_confirm:
                result, data['message'] = True, "评分成功"
                old_score = evaluation.get(f"{title}_score").get("teacher_score")
                new_score = score - old_score if old_score >= 0 else score
                mongo.db.company.update({'student_no': username},
                                        {'$set': {f'evaluation.{title}_score.teacher_score': score}})
                mongo.db.rank.update({'student_no': username},
                                     {'$inc': {'sum_score': new_score, 'ten': new_score}})
    if not result:
        data['message'] = err_message
    return jsonify(result=result, data=data, message=data['message'])


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
        insert_doc = {'room': student_no, 'username': username, 'message_head': message_head,
                      'message_body': message_body, 'time': _time}
        mongo.db.message.insert(insert_doc)
    return jsonify(result=result, data=data)


@api_bp.route('/get_news', methods=['GET'])
def get_news():
    """获取新闻"""
    result, data = False, None
    # news = mongo.db.news_spider.find()
    news = redis_cli.lrange('news', 0, 10)
    if news:
        # data = dumps(news)
        news = [json.loads(n) for n in news]
        data = dumps(news)
        result = True
    return jsonify(result=result, data=data)


@api_bp.route('/get_notice', methods=['GET'])
def get_notice():
    """获取公告"""
    result, data = False, None
    notice = mongo.db.notice.find().sort([("is_topping", -1), ("timestamp", -1)]).limit(3)
    if notice:
        notice = [value for value in notice]
        data = dumps(notice)
    return jsonify(result=True, data=data)


@api_bp.route('/get_class_name_list', methods=['POST'])
def get_class_name_list():
    """获取班级名称列表"""
    result, data, _classes = False, None, []
    role = session.get('role')
    classes = mongo.db.classes.find({}, dict(_id=0, class_name=1, teacher=1))
    if classes:
        if role == 'teacher':
            teacher = session.get('username')
            _classes = [c.get('class_name') for c in filter(lambda x: x.get("teacher") == teacher, classes)]
        elif role == 'admin':
            _classes = [c.get('class_name') for c in classes]
        result, data = True, dumps(_classes)
    return jsonify(result=result, data=data)


@api_bp.route('/get_class_name', methods=['POST'])
def get_class_name():
    """获取班级名"""
    result, data = False, {}
    username = session.get('username')
    role = session.get('role')
    if role == 'student':
        user = mongo.db.user.find_one({'student_no': username})
        if user:
            class_name = f"{user.get('student_school')}-{user.get('student_class')}"
            result, data['class_name'] = True, [class_name]
    elif role == 'teacher':
        classes = mongo.db.classes.find({'teacher': username}, {'class_name': True})
        if classes:
            class_name = [_class.get('class_name') for _class in classes]
            result, data['class_name'] = True, class_name
    return jsonify(result=result, data=data)


@api_bp.route('/course_redo', methods=['POST'])
def course_redo():
    """题目重做"""
    data = request.get_json()
    course_no = int(data.get('course_no'))
    class_name = data.get('class_name')
    student_no = data.get('student_no')
    flag, role = False, session.get('role')
    if role == 'admin':
        flag = init_course_confirm(course_no=course_no, class_name=class_name, student_no=student_no)
    elif role == 'teacher':
        if class_name != "0" and student_no == "0":
            classes = mongo.db.classes.find({'teacher': session.get('username'), 'class_name': class_name})
            flag = init_course_confirm(course_no=course_no, class_name=class_name,
                                       student_no=student_no) if classes else False
        elif class_name == "0" and student_no != "0":
            users = mongo.db.user.find({'student_no': student_no, 'teacher': session.get('username')})
            flag = init_course_confirm(course_no=course_no, class_name=class_name,
                                       student_no=student_no) if users else False
    message = "操作成功！" if flag else "操作失败!"
    return jsonify(result=flag, data=None, message=message)


@api_bp.route('/course_reform', methods=['POST'])
@login_required_teacher
def course_reform():
    flag, data, message = False, None, "操作失败！"
    data = request.get_json()
    course_no = int(data.get('course_no'))
    class_name = data.get('class_name')
    team_no = data.get('team_no')
    submit_type = data.get('submit_type')
    message_body = ''
    mongo.db.reform.delete_one({'team_no': team_no, 'course_no': str(course_no)})
    if submit_type == 'agree':
        message_body = '通过申请！'
        flag = init_course_confirm(course_no=course_no, class_name=class_name,
                                   student_no=team_no)
        message = "操作成功！" if flag else "操作失败!"
    elif submit_type == 'refuse':
        message_body = '未通过申请！'
        flag, data, message = True, None, "操作成功！"
    message_head = '模块' + str(course_no) + '重做申请通知:'
    members = mongo.db.team.find_one({"team_no": team_no}, {"_id": 0, "member": 1}).get("member")
    for member in members:
        send_system_message(message_head=message_head, message_body=message_body,
                            room=team_no, username=member[1])
    return jsonify(result=flag, data=data, message=message)
