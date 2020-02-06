#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 22:47
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : settings.py
# @Software: PyCharm
import os
from urllib import parse

basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

username = parse.quote_plus("accojOwner")
password = parse.quote_plus("Love199805#")


class BaseConfig(object):
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev key')
    TEMPLATES_AUTO_RELOAD = True

    DEBUG_TB_INTERCEPT_REDIRECTS = False

    CKEDITOR_ENABLE_CSRF = True

    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')

    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = ('Bluelog Admin', MAIL_USERNAME)

    MONGO_URI = 'mongodb://{}:{}@localhost:27017/accoj'.format(username, password)


class DevelopmentConfig(BaseConfig):
    pass


class TestingConfig(BaseConfig):
    TESTING = True
    WTF_CSRF_ENABLED = False


class ProductionConfig(BaseConfig):
    pass


config = {
    'development': DevelopmentConfig,
    'testing'    : TestingConfig,
    'production' : ProductionConfig
}
