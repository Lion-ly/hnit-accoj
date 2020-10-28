#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/10/11 13:29
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : get_remote_addr.py
# @Software: PyCharm
def get_remote_addr():
    from flask import request
    environ = request.environ
    try:
        return environ["HTTP_X_FORWARDED_FOR"].split(",")[0].strip()
    except (KeyError, IndexError):
        return environ.get("REMOTE_ADDR")
