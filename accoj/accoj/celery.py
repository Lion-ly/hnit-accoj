#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 23:12
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py
# @Software: PyCharm
from celery import Celery

celery = Celery('accoj', broker='redis://:Yt7q2H93ufpoV8O8i6wJcy0HknazWFFK@127.0.0.1:6379/1')
