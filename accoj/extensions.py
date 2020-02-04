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

mongo = PyMongo()
mail = Mail()
csrf = CSRFProtect()
