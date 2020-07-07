#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:55
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : auth.py
# @Software: PyCharm
from flask import Blueprint, jsonify, request, session, redirect, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from accoj.extensions import mongo
from accoj.utils import login_required
from accoj.emails import send_mail
import re
import random
import datetime

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signin', methods=['POST', 'GET'])
def signin():
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
                role = user.get("role")
                session["username"] = student_no
                session["role"] = role
                return jsonify(result="true")
            else:
                message = "密码错误"
                return jsonify(result="false", message="{}".format(message))
    return redirect("/")


@auth_bp.route('/login', methods=['POST', 'GET'])
def login():
    myreg = re.compile(r'\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}')
    if request.method == "POST":
        form = request.form
        student_no = form.get("studentid")
        email = form.get("email")
        student_faculty = form.get("login_faculty")
        student_class = form.get("login_class")
        password = form.get("password")
        password_again = form.get("password_again")
        vcode = form.get("vcode").lower()

        test_email = re.match(myreg, email)
        mail = dict(email="{}".format(email))
        right_email = mongo.db.other.find_one(mail)

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
            elif test_email is None:
                message = "请确保邮箱填写正确"
                return jsonify(result="false", message="{}".format(message))
            elif not right_email:
                message = "该验证码失效或邮箱已更改"
                return jsonify(result="false", message="{}".format(message))
            elif vcode != right_email['VCode']:
                message = "请输入正确的验证码"
                return jsonify(result="false", message="{}".format(message))
            else:
                role = "student"
                session["username"] = student_no
                session["role"] = role
                post = dict(student_no="{}".format(student_no),
                            role=role,
                            student_name="",
                            nick_name="",
                            student_school="",
                            personalized_signature="",
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
    session.clear()
    return redirect('/')


@auth_bp.route('/update_password', methods=['POST', 'GET'])
@login_required
def update_password():
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
                    mongo.db.user.update_one({"student_no": session["username"]},
                                             {"$set": {"password": generate_password_hash(new_pwd)}})
                    session.clear()
                    return jsonify(result="true")

    return redirect('/')


@auth_bp.route('/VCode', methods=['GET', 'POST'])
def check_email():
    if request.method == "POST":
        form = request.form
        email = form.get("email")
        mail_random = ''
        for i in range(6):
            index = random.randrange(0, 3)
            if index != i:
                mail_random += str(random.randint(1, 9))
            elif index + 1 == i:
                mail_random += chr(random.randint(97, 122))
            else:
                mail_random += chr(random.randint(97, 122))
        mail = dict(email="{}".format(email))
        mongo.db.other.create_index("time", expireAfterSeconds=120)
        try:
            send_mail(email, mail_random, 0, 0)
            if mongo.db.other.find_one(mail):
                temp = {
                    "time" : datetime.datetime.utcnow(),
                    "VCode": mail_random
                }
                mongo.db.other.update(mail, {"$set": temp})
                return jsonify(result="true")
            else:
                data = {
                    "email": email,
                    "time" : datetime.datetime.utcnow(),
                    "VCode": mail_random
                }
                mongo.db.other.insert_one(data)
                return jsonify(result="true")
        except Exception:
            return jsonify(result="false")
    return redirect("/")


@auth_bp.route('/findpsw', methods=['GET', 'POST'])
def find_password():
    if request.method == "POST":
        form = request.form
        student_no = form.get("studentid")
        email = form.get("email")
        vcode = form.get("vcode").lower()

        user = mongo.db.user.find_one({"student_no": student_no})
        stu = dict(student_no="{}".format(student_no))
        mail = dict(email="{}".format(email))
        if student_no is "":
            message = "学号不能为空"
            return jsonify(result="false", message=message)
        if email is "":
            message = "邮箱不能为空"
            return jsonify(result="false", message=message)
        if not user:
            message = "该用户不存在"
            return jsonify(result="false", message=message)
        else:
            find = mongo.db.user.find_one(stu)
            right = mongo.db.other.find_one(mail, {"VCode": 1})
            if not find["email"]:
                message = "该邮箱没有被注册"
                return jsonify(result="false", message=message)
            if find["email"] != email:
                message = "密保邮箱填写错误"
                return jsonify(result="false", message=message)
            if not right:
                message = "验证码已过期"
                return jsonify(result="false", message=message)
            if right["VCode"] != vcode:
                message = "验证码填写错误"
                return jsonify(result="false", message=message)
            else:
                new_password = ""
                for i in range(6):
                    ch = chr(random.randrange(ord('0'), ord('9') + 1))
                    new_password += ch
                mongo.db.user.update_one({"student_no": student_no},
                                         {"$set": {"password": generate_password_hash(new_password)}})
                try:
                    send_mail(email, 0, 1, new_password)
                    return jsonify(result="true")
                except Exception:
                    return jsonify(result="false")
    return redirect("/")


@auth_bp.app_errorhandler(403)
def page_forbidden(e):
    return render_template('errors/403.html'), 403


@auth_bp.app_errorhandler(404)
def page_not_found(e):
    return render_template('errors/404.html'), 404


@auth_bp.app_errorhandler(500)
def internal_error(e):
    return render_template('errors/500.html'), 500


@auth_bp.app_context_processor
def my_app_context_processor():
    """
    全局上下文管理
    :return:
    """
    d_role = {"root": "root", "admin": "管理员", "teacher": "教师", "student": "学生"}
    role = d_role.get(session.get("role"))
    username = session.get("username")
    teacher = session.get('teacher')
    return {"role": role, "username": username, "teacher": teacher}
