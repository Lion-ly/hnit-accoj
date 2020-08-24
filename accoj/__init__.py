#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 23:12
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py
# @Software: PyCharm
import os
from flask import Flask
import flask_monitoringdashboard as dashboard
from settings import config
from accoj.blueprints.accoj import accoj_bp
from accoj.blueprints.auth import auth_bp
from accoj.blueprints.index import index_bp
from accoj.blueprints.api import api_bp
from accoj.blueprints.profile import profile_bp
from accoj.blueprints.teacher import teacher_bp
from accoj.blueprints import message
from accoj.news_spider import new_spider_start
from accoj.deal_business.create_questions import add_question
from accoj.utils import (create_test_account,
                         redis_connect_test,
                         init_celery)
from accoj.exception import (CreateQuestionsError,
                             ExcelCheckError)
from accoj.extensions import (mongo,
                              mail,
                              csrf,
                              babel,
                              socketio,
                              redis_cli,
                              celery)
from accoj.blueprints.admin import (admin,
                                    UserView,
                                    CompanyView)

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
    # 加载配置
    app.config.from_object(config[config_name])
    # 注册扩展
    register_extensions(app)
    # 注册蓝图
    register_blueprints(app)
    # redis连接测试
    redis_connect_test()
    # 创建测试账号
    create_test_account()
    # 新闻爬虫开启
    new_spider_start()
    # 创建题库
    create_question_bank()

    return app


def register_blueprints(app):
    """
    注册蓝图
    :param app:
    :return:
    """
    app.register_blueprint(accoj_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(index_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(profile_bp, url_prefix='/profile')
    app.register_blueprint(teacher_bp, url_prefix='/teacher')


def register_extensions(app):
    """
    注册扩展
    :param app:
    :return:
    """
    mongo.init_app(app)
    redis_cli.init_app(app)
    # csrf令牌验证，验证出错或者过期会导致ajax请求失败'400 bad request'
    csrf.init_app(app)
    mail.init_app(app)
    babel.init_app(app)
    socketio.init_app(app)
    admin.add_view(UserView(mongo.db.user, 'User'))  # 添加后台管理视图
    admin.add_view(CompanyView(mongo.db.company, 'Company'))
    admin.init_app(app)
    # 排除dashboard blueprint的csrf防御，因为目前不支持csrf
    csrf.exempt(dashboard.blueprint)
    # 绑定flask_monitoringdashboard
    dashboard.bind(app)
    # 初始化celery
    init_celery(app, celery)


def create_question_bank():
    """创建题库"""
    try:
        if not add_question(questions_no=1) or not add_question(questions_no=2):
            raise CreateQuestionsError()
    except CreateQuestionsError:
        raise CreateQuestionsError()
