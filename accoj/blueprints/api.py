#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/6/11 22:09
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : api.py
# @Software: PyCharm
from flask import Blueprint, jsonify, request, session, send_from_directory, current_app
from accoj.utils import parse_class_xlrd, login_required_teacher
from accoj.extensions import mongo
from accoj.emails import assign_email
import os

api_bp = Blueprint('api', __name__)


@api_bp.route('/profile_api', methods=['POST'])
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
        schedule_info = mongo.db.company.find_one(dict(student_no=student_no),
                                                  dict(_id=0, schedule_confirm=1))
        # 判断是否有进度
        if schedule_info:
            data = []
            schedule_info = schedule_info.get("schedule_confirm")
            # 获取涉及的科目数量
            involve_subjects = mongo.db.company.find_one(dict(student_no=student_no),
                                                         dict(_id=0, involve_subjects=1)).get("involve_subjects")
            involve_subjects_1 = involve_subjects.get("involve_subjects_1")
            involve_subjects_2 = involve_subjects.get("involve_subjects_2")
            sum_subjects_len = len(set(involve_subjects_1 + involve_subjects_2))

            # 获取进度值
            trend_analysis_confirm = schedule_info.get("trend_analysis_confirm")
            common_ratio_analysis_confirm = schedule_info.get("common_ratio_analysis_confirm")

            if schedule_info.get("business_confirm"):
                data.append(100)

            key_element_score = int((len(schedule_info.get("key_element_confirm")) / 20) * 100)
            data.append(key_element_score)

            subject_score = int((len(schedule_info.get("subject_confirm")) / 20) * 100)
            data.append(subject_score)

            entry_schedule_score = int((len(schedule_info.get("entry_confirm")) / 20) * 100)
            data.append(entry_schedule_score)

            # ledger_confirm   25 25 50
            ledger__schedule_score = 0
            ledger__schedule_score += int(
                (len(schedule_info.get("ledger_confirm").get("ledger1_confirm")) / len(involve_subjects_1)) * 25)
            ledger__schedule_score += int(
                (len(schedule_info.get("ledger_confirm").get("ledger2_confirm")) / len(involve_subjects_2)) * 25)
            if schedule_info.get("balance_sheet_confirm"):
                ledger__schedule_score += 50
            data.append(ledger__schedule_score)

            acc_document_schedule_score = int((len(schedule_info.get("acc_document_confirm")) / 20) * 100)
            data.append(acc_document_schedule_score)

            # 会计账簿部分得分
            account_schedule_score = 0
            account_schedule_score += int(
                (len(schedule_info.get("subsidiary_account_confirm")) / sum_subjects_len) * 50)
            if schedule_info.get("acc_balance_sheet_confirm"):
                account_schedule_score += 50
            data.append(account_schedule_score)

            # 会计报表部分得分
            Financial_Statements_schecule_score = 0
            if schedule_info.get("new_balance_sheet_confirm"):
                Financial_Statements_schecule_score += 50
            if schedule_info.get("profit_statement_confirm"):
                Financial_Statements_schecule_score += 50
            data.append(Financial_Statements_schecule_score)

            # 因素分析未做  20*5 or 15*4+20*2
            analysis_schedule_score = 0
            if trend_analysis_confirm.get("first"):
                analysis_schedule_score += 20
            if trend_analysis_confirm.get("second"):
                analysis_schedule_score += 20
            if common_ratio_analysis_confirm.get("first"):
                analysis_schedule_score += 20
            if common_ratio_analysis_confirm.get("second"):
                analysis_schedule_score += 20
            if schedule_info.get("ratio_analysis_confirm"):
                analysis_schedule_score += 20
            data.append(analysis_schedule_score)

            # 杜邦
            dupont_schedule_score = 0
            if schedule_info.get("dupont_analysis_confirm"):
                dupont_schedule_score += 100
            data.append(dupont_schedule_score)

            result, data = True, data
        else:
            data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            result, data = True, data
        return jsonify(result=result, data=data)

    def get_user_score():
        user = mongo.db.user.find_one(dict(student_no=student_no),
                                      dict(_id=1))
        if user:
            a_keys = ['_id', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
            a_values = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            search_dict = dict(zip(a_keys, a_values))
            data_tmp = mongo.db.score.find_one({"student_no": "17020340139"}, search_dict)
            data = list(data_tmp.values())
            result = True
        else:
            result = False
            data = None
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
