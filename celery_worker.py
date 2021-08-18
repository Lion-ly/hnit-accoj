#!/usr/bin/env python 
# -*- coding: utf-8 -*-
# @Time    : 2020/8/30 19:12
# @Author  : coodyz
# @Site    : https://www.cnblogs.com/coodyz/
# @File    : celery_worker.py
# @Software: PyCharm
import os
from accoj.news_spider import periodic_run_news_spider
from accoj.update_rank import periodic_update_user_rank
from accoj.evaluation import rejudge
from accoj import create_app
from accoj.celery import celery
from accoj.utils import init_celery

from celery.signals import celeryd_init


@celeryd_init.connect
def configure_workers(sender=None, conf=None, **kwargs):
    periodic_run_news_spider()
    periodic_update_user_rank()


app = create_app(os.getenv('FLASK_CONFIG') or 'development')
app.app_context().push()
init_celery(app, celery)

# 启动celery
# celery worker -A celery_worker.celery --loglevel=INFO --without-gossip --without-mingle --without-heartbeat -Ofair -P gevent
