#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/21 23:11
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : extentions.py
# @Software: PyCharm
from flask_pymongo import PyMongo
from flask_mail import Mail
from flask_wtf import CSRFProtect
from flask_babelex import Babel
from flask_socketio import SocketIO
from flask_redis import FlaskRedis
from flask_limiter import Limiter
from accoj.utils.log_util import Logger
from accoj.utils.get_remote_addr import get_remote_addr

mongo = PyMongo()
mail = Mail()
csrf = CSRFProtect()
babel = Babel()
socketio = SocketIO()
redis_cli = FlaskRedis()
limiter = Limiter(key_func=get_remote_addr)
logger = Logger()
