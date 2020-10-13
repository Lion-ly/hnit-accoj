#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/10/13 11:04
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : log_util.py
# @Software: PyCharm
import logging
from datetime import datetime
from flask.logging import default_handler
from flask import has_request_context, request
from accoj.utils.get_remote_addr import get_remote_addr


class RedirectStderr(object):

    def __init__(self, cfg):
        self._log_file = open(cfg['log_path'], 'a')

    def write(self, msg):
        self._log_file.write(msg)
        self._log_file.flush()


class CustomFormatter(logging.Formatter):
    def format(self, record):
        record.now = datetime.now().replace(microsecond=0)
        if has_request_context():
            record.url = request.url
            record.remote_addr = get_remote_addr()
        else:
            record.url = None
            record.remote_addr = None
        return super(CustomFormatter, self).format(record)


class Logger(object):
    def init_app(self, app):
        # 记录真实客户端IP
        custom_format = """%(remote_addr)s - - [%(now)s] client real ip"""
        default_handler.setFormatter(CustomFormatter(fmt=custom_format))
        app.logger.addHandler(default_handler)
