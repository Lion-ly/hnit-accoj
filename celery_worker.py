#!/usr/bin/env python 
# -*- coding: utf-8 -*-
# @Time    : 2020/8/30 19:12
# @Author  : coodyz
# @Site    : https://www.cnblogs.com/coodyz/
# @File    : celery_worker.py
# @Software: PyCharm
import os
from accoj.news_spider import periodic_run_news_spider
from accoj import celery, create_app

app = create_app(os.getenv('FLASK_CONFIG') or 'development')
app.app_context().push()

# 启动celery
# celery worker -A celery_worker.celery --loglevel=INFO --without-gossip --without-mingle --without-heartbeat -Ofair -P gevent
