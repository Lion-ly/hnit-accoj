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
from accoj.blueprints.admin import admin_bp
from accoj.blueprints.auth import auth_bp
from settings import config
from accoj.extensions import mongo, mail, csrf
from accoj.utils.add_question import add_question

basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv('FLASK_CONFIG', 'development')

    app = Flask('accoj')
    app.config.from_object(config[config_name])
    register_extensions(app)
    register_blueprints(app)
    try:
        if add_question() is False:
            print("\n创建题库时出错，未写入数据库!")
    except:
        print("\nExcel格式检查中断!格式出错!")
        print("创建题库时出错，未写入数据库!")
        pass

    return app


def register_blueprints(app):
    app.register_blueprint(accoj_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(auth_bp)


def register_extensions(app):
    mongo.init_app(app)
    csrf.init_app(app)  # csrf令牌验证，验证出错或者过期会导致ajax请求失败'400 bad request'
    mail.init_app(app)
