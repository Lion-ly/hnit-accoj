#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/6/11 22:09
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : api.py
# @Software: PyCharm
from flask import Blueprint, jsonify, request, session, send_from_directory, current_app
from bson.json_util import dumps
from accoj.blueprints import get_schedule
from accoj.utils import parse_class_xlrd, login_required_teacher, login_required
from accoj.extensions import mongo
from accoj.emails import assign_email
import os

api_bp = Blueprint('api', __name__)


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
                                 {"$set": update_data})
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
        data_tmp = mongo.db.score.find_one({"student_no": student_no}, search_dict)
        if data_tmp:
            data = list(data_tmp.values())
            result = True
            print("score")
        else:
            result = True
            data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            print("no score")
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
    def get_class_list():
        """获取班级列表"""
        result, data = False, None
        users = mongo.db.user.find_one(dict(teacher=student_no),
                                       dict(_id=0, student_school=1, student_faculty=1, student_class=1))
        if users:
            class_info = set()
            for user in users:
                class_info.add(dict(student_school=user.get('student_school'),
                                    student_faculty=user.get('student_faculty'),
                                    student_class=user.get('student_class')))
            class_info = list(class_info)
            result, data = True, class_info
        return jsonify(result=result, data=data)

    json_data = request.get_json()
    _api = json_data.get('api')
    get_api_dict = dict(get_class_list=get_class_list)
    # submit_api_dict = dict(submit_user_profile=submit_user_profile)
    student_no = session.get('username')
    if _api in get_api_dict:
        return get_api_dict[_api]()
    # elif _api in submit_api_dict:
    #    return submit_api_dict[_api](json_data)
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


@api_bp.route('/get_news', methods=['GET'])
def get_news():
    """获取新闻"""
    news = mongo.db.news_spider.find()
    if news:
        news = dumps(news)
        return jsonify(result=True, data=news)
    return jsonify(result=False, data=None)
