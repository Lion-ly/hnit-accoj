#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 22:47
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : settings.py
# @Software: PyCharm
import os, datetime
from urllib import parse

basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

MAX_BUSINESS_NO = 20
username = parse.quote_plus("accojOwner")
password = parse.quote_plus("Love199805#")


class BaseConfig(object):
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev key')
    TEMPLATES_AUTO_RELOAD = True

    DEBUG_TB_INTERCEPT_REDIRECTS = False

    CKEDITOR_ENABLE_CSRF = True

    MAIL_SERVER = "smtp.exmail.qq.com"
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = "accoj@popforever.club"

    MAIL_PASSWORD = "Accountoj2020"
    MAIL_DEFAULT_SENDER = ('Bluelog Admin', MAIL_USERNAME)
    # 静态文件缓存过期时间，默认43200s即12hours
    # 即更新时客户端静态文件不会立即更新而是在12hours之后更新
    SEND_FILE_MAX_AGE_DEFAULT = datetime.timedelta(seconds=12 * 60 * 60)
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
