#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 23:12
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py
# @Software: PyCharm
import os
from flask import Flask
from accoj.blueprints.accoj import accoj_bp
from accoj.blueprints.auth import auth_bp
from accoj.blueprints.index import index_bp
from settings import config
from accoj.extensions import mongo, mail, csrf, babel
from accoj.blueprints.admin import admin, UserView, CompanyView
from accoj.deal_business.create_questions import add_question
from werkzeug.security import generate_password_hash

basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


def create_app(config_name=None):
    """
    创建应用实例
    :param config_name:
    :return:
    """
    if config_name is None:
        config_name = os.getenv('FLASK_CONFIG', 'development')

    app = Flask('accoj')
    app.config.from_object(config[config_name])
    register_extensions(app)
    register_blueprints(app)
    create_admin()  # 创建管理员
    try:
        if not add_question(questions_no=1) or not add_question(questions_no=2):
            print("\n创建题库时出错，未写入数据库!")
    except:
        print("\nExcel格式检查中断!格式出错!")
        print("创建题库时出错，未写入数据库!")
        pass

    return app


def register_blueprints(app):
    """
    注册蓝图
    :param app:
    :return:
    """
    app.register_blueprint(accoj_bp)
    # app.register_blueprint(admin_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(index_bp)


def register_extensions(app):
    """
    注册扩展
    :param app:
    :return:
    """
    mongo.init_app(app)
    csrf.init_app(app)  # csrf令牌验证，验证出错或者过期会导致ajax请求失败'400 bad request'
    mail.init_app(app)
    babel.init_app(app)
    admin.add_view(UserView(mongo.db.user, 'User')) # 添加后台管理视图
    admin.add_view(CompanyView(mongo.db.company, 'Company'))
    admin.init_app(app)


def create_admin():
    """
    创建管理员账号
    :return:
    """
    mongo.db.user.update(dict(student_no="admin"),
                         dict(student_no="admin",
                              role="admin",
                              student_name="admin",
                              password=generate_password_hash("accojOwner")),
                         upsert=True)
