#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/2/18 15:43
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : index.py
# @Software: PyCharm
from flask import Blueprint, render_template

index_bp = Blueprint('index', __name__)


@index_bp.route('/', methods=['POST', 'GET'])
def index():
    return render_template('index.html')


@index_bp.route('/about', methods=['POST', 'GET'])
def about():
    return render_template('about.html')
