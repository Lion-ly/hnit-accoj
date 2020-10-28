#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/2/18 15:43
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : index.py
# @Software: PyCharm
from flask import Blueprint, render_template, request
from accoj.extensions import mongo
import re

index_bp = Blueprint('index', __name__)


@index_bp.route('/', methods=['POST', 'GET'])
def index():
    return render_template('index.html')


@index_bp.route('/about', methods=['POST', 'GET'])
def about():
    return render_template('about.html')


@index_bp.route('/notice', methods=['POST', 'GET'])
def notice():
    count = request.args.get("count", type=int)
    notice = list(mongo.db.notice.find().sort([("is_topping", -1), ("timestamp", -1)]))

    if notice and type(count) == int and count < len(notice):
        subject = notice[count]["subject"]
        notice_time = notice[count]["timestamp"]
        text = notice[count]["text"]
        notice_time = notice_time[0:4] + "年" + notice_time[5:7] + "月" + notice_time[8:10] + "日"
        result = re.split(r"  {2,}|\t", text)
        content = "<p style=\"text-indent:30px \">"
        for index, value in enumerate(result):
            if result[0] == '':
                result[0]="ENDOF"
                continue
            elif index != len(result) - 1:
                content += result[index] + "</p><p style=\"text-indent:30px;font-size=18px\">"
            else:
                content += result[index] + "</p>"

        return render_template('notice.html', subject=subject, notice_time=notice_time, text=content)
    return render_template("errors/404.html")
