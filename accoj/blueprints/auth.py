#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:55
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : auth.py
# @Software: PyCharm
from flask import Blueprint, jsonify, request, session, redirect
from werkzeug.security import generate_password_hash, check_password_hash
from accoj.extensions import mongo
from accoj.utils import login_required

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signin', methods=['POST', 'GET'])
def signin():
    """
    注册
    :return:
    """
    if request.method == "POST":
        form = request.form
        student_no = form.get("studentid")
        password = form.get("password")

        if student_no is "" or password is "":
            message = "请确保账号密码填写不为空"
            return jsonify(result="false", message="{}".format(message))
        else:
            user = mongo.db.user.find_one({"student_no": student_no})
            if user is None:
                message = "用户不存在"
                return jsonify(result="false", message="{}".format(message))
            user_password = user["password"]
            if check_password_hash(user_password, password):
                session["username"] = student_no
                return jsonify(result="true")
            else:
                message = "密码错误"
                return jsonify(result="false", message="{}".format(message))
    return redirect("/")


@auth_bp.route('/login', methods=['POST', 'GET'])
def login():
    """
    登陆
    :return:
    """
    if request.method == "POST":
        form = request.form
        student_no = form.get("studentid")
        email = form.get("email")
        student_faculty = form.get("login_faculty")
        student_class = form.get("login_class")
        password = form.get("password")
        password_again = form.get("password_again")

        if student_no is "" or email is "" or student_faculty is "" \
                or student_class is "" or password is "" or password_again is "":
            message = "请确保注册信息填写完整"
            return jsonify(result="false", message="{}".format(message))
        else:
            user = mongo.db.user.find_one({"student_no": student_no})
            exit_email = mongo.db.user.find_one({"email": email})
            if user:
                message = "用户已存在"
                return jsonify(result="false", message="{}".format(message))
            elif exit_email:
                message = "密保邮箱已被使用"
                return jsonify(result="false", message="{}".format(message))
            elif password != password_again:
                message = "请确保两次密码一致"
                return jsonify(result="false", message="{}".format(message))
            elif len(student_no) != 11:
                message = "请确认学号格式正确"
                return jsonify(result="false", message="{}".format(message))
            else:
                session["username"] = student_no
                post = dict(student_no="{}".format(student_no),
                            student_name="",
                            student_faculty="{}".format(student_faculty),
                            student_class="{}".format(student_class),
                            student_phone="",
                            student_sex="",
                            student_borth="",
                            password="{}".format(generate_password_hash(password)),
                            email="{}".format(email),
                            company_ids=[])
                mongo.db.user.insert_one(post)
                return jsonify(result="true")
    return redirect("/")


@auth_bp.route('/logout')
def logout():
    """
    注销登陆
    :return:
    """
    session.clear()
    return redirect('/')


@auth_bp.route('/update_password', methods=['POST', 'GET'])
@login_required
def update_password():
    """
    更改密码
    :return:
    """
    if request.method == "POST":
        form = request.form
        origin_pwd = form["origin_pwd"]
        new_pwd = form["new_pwd"]
        new_pwd_again = form["new_pwd_again"]
        if origin_pwd is "" or new_pwd is "" or new_pwd_again is "":
            message = "请确保信息填写完整"
            return jsonify(result="false", message="{}".format(message))
        else:
            user = mongo.db.user.find_one({"student_no": session["username"]})
            user_password = user["password"]
            if check_password_hash(user_password, origin_pwd) is False:
                message = "原密码错误"
                return jsonify(result="false", message="{}".format(message))
            else:
                if new_pwd != new_pwd_again:
                    message = "新密码与确认密码不一致"
                    return jsonify(result="false", message="{}".format(message))
                elif check_password_hash(user_password, new_pwd):
                    message = "新密码不能与原密码相同"
                    return jsonify(result="false", message="{}".format(message))
                else:
                    mongo.db.user.update_one({"student_no": session["username"]}, {"$set": {"password": new_pwd}})
                    return jsonify(result="true")

    return redirect('/')


@auth_bp.app_context_processor
def my_app_context_processor():
    """
    全局上下文处理函数
    :return:
    """
    username = session.get("username")
    return {"username": username}
