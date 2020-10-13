#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/9/20 16:18
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : admin.py
# @Software: PyCharm

import json
from flask import (Blueprint,
                   render_template,
                   jsonify,
                   request)
from accoj.extensions import (mongo,
                              redis_cli)
from accoj.utils import (create_account,
                         login_required_admin,
                         change_password)
from accoj.evaluation import rejudge

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/index', methods=['GET'])
def index():
    """后台管理员首页"""
    return render_template('admin/home.html')


@admin_bp.route('/user_list', methods=['GET'])
def user_list():
    """用户列表页面"""
    return render_template('admin/user_list.html')


@admin_bp.route('/get_user_list', methods=['GET'])
def get_user_list():
    """获取用户列表"""
    _user_info = mongo.db.user.find({},
                                    dict(_id=0))
    user_info = list()
    num = 0
    for user in _user_info:
        e_dic = dict(num=num,
                     student_no=user.get('student_no'),
                     role=user.get('role'),
                     student_name=user.get('student_name'),
                     nick_name=user.get('nick_name'),
                     student_school=user.get('student_school'),
                     student_faculty=user.get('student_faculty'),
                     student_class=user.get('student_class'),
                     teacher=user.get('teacher'),
                     student_sex=user.get('student_sex'),
                     email=user.get('email'))
        num += 1
        user_info.append(e_dic)
    result, data = True, user_info
    return jsonify(result=result, data=data)


@admin_bp.route('/get_create_account', methods=['GET'])
def get_create_account():
    """创建账号页面"""
    return render_template('admin/create_account.html')


@admin_bp.route('/submit_create_account', methods=['POST'])
def submit_create_account():
    """提交创建的账号信息"""
    result, data, message = False, {}, "未知错误"
    json_data = request.get_json()
    data_list = ["student_no", "student_name", "password", "role", "student_faculty", "student_class", "student_school",
                 "student_phone", "teacher"]
    data_list_len = len(data_list)
    student_no = json_data.get("student_no")
    user = mongo.db.user.find_one({"student_no": student_no})
    if not user:
        create_account(*[json_data.get(data_list[i]) for i in range(0, data_list_len)])
        result, message = True, "账号创建成功！"
    if not result:
        message = "账号已存在！"
    return jsonify(result=result, message=message)


@admin_bp.route('/change_pwd', methods=['GET'])
def change_pwd():
    """更改密码页面"""
    return render_template('admin/change_pwd.html')


@admin_bp.route('/submit_change_pwd', methods=['POST'])
def submit_change_pwd():
    """提交更改的密码信息"""
    result, data, message = False, {}, "未知错误！"
    json_data = request.get_json()
    if mongo.db.user.find({"student_no": json_data.get("student_no")}):
        change_password(student_no=json_data.get("student_no"), new_password=json_data.get("password"))
        result, message = True, "密码更改成功！"
    if not result:
        message = "账号不存在！"
    return jsonify(result=result, data=data, message=message)


@admin_bp.route('/audit_class', methods=['GET'])
def audit_class():
    """班级审核页面"""
    return render_template('admin/audit_class.html')


@admin_bp.route('/get_audit_class', methods=['GET'])
def get_audit_class():
    """获取班级审核表"""
    user_info = redis_cli.lrange("user_info", 0, -1)
    user_info_len = len(user_info)
    for i in range(0, user_info_len):
        user_info[i] = json.loads(user_info[i])
        user_info[i].update({"num": i + 1})
        user_info[i].update({"tmp": ("<button type='button' class='btn btn-info'>批准通过</button>")})
    user_info = list(filter(lambda u: u.get("status") == "审核中", user_info))
    result, data = True, user_info
    return jsonify(result=result, data=data)


@admin_bp.route('/submit_audit_class', methods=['POST'])
def submit_audit_class():
    """提交班级审核信息"""
    result, data = False, {}
    json_data = request.get_json()
    student_no = json_data.get('student_no')
    if student_no.encode('utf-8') in redis_cli.smembers('user'):
        result, data["message"] = True, "操作成功！"
    if not result:
        data["message"] = "操作失败！"
    return jsonify(result=result, data=data)


@admin_bp.route('/score_rejudge', methods=['GET'])
def score_rejudge():
    """题目重判页面"""
    return render_template('admin/score_rejudge.html')


@admin_bp.route('/submit_rejudge', methods=['POST'])
def submit_rejudge():
    """重判题目"""
    data = request.get_json()
    course_no = data.get('course_no')
    class_name = data.get('class_name')
    student_no = data.get('student_no')
    rejudge.delay(course_no, class_name, student_no)
    return jsonify(result=True, data=None)


@admin_bp.before_request
@login_required_admin
def admin_bp_before_request():
    """
    请求前钩子函数（局部）
    """
    pass
