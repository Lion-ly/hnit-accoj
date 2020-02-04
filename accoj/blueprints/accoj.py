#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:55
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : accoj.py
# @Software: PyCharm
from flask import Blueprint, render_template, redirect, request, jsonify, session
from accoj.utils import login_required
from accoj.extensions import mongo

accoj_bp = Blueprint('accoj', __name__)


@accoj_bp.route('/', methods=['POST', 'GET'])
def index():
    return render_template('index.html')


@accoj_bp.route('/coursei')
@login_required
def coursei():
    return render_template('course/coursei.html')


@accoj_bp.route('/company_form_submit', methods=['POST', 'GET'])
@login_required
def company_form_submit():
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session["username"]})
        if company is not None:
            return jsonify(result="false", message="已经创立过公司")
        form = request.form
        data_list = ["com_name", "com_address", "com_business_addr", "com_legal_rep", "com_regist_cap",
                     "com_operate_period", "com_business_scope", "com_shareholder_1", "com_shareholder_2",
                     "com_shareholder_3", "com_shareholder_4", "com_shareholder_5"]
        data_dict = {}
        err_pos = []

        for data_name in data_list:
            data_dict[data_name] = form.get(data_name)

        data_dict["student_no"] = session["username"]

        flag = True
        shareholder_num = 0
        for key, value in data_dict.items():
            if value is "":
                err_pos.append({"err_pos": key})
                if key.startswith("com_shareholder") is False:
                    flag = False
                else:
                    shareholder_num += 1
        if shareholder_num == 0:
            flag = False
        if flag is False:
            return jsonify(result="false", err_pos=err_pos, message="信息未填写完整")
        else:
            # 副本公司同时创建
            data_dict_cp = data_dict.copy()
            data_dict_cp["student_no"] = "{}_cp".format(data_dict["student_no"])
            mongo.db.company.insert_many([data_dict, data_dict_cp])
            return jsonify(result="true")
    return redirect('/coursei')


@accoj_bp.route('/courseii')
@login_required
def courseii():
    return render_template('course/courseii.html')


@accoj_bp.route('/courseiii')
@login_required
def courseiii():
    return render_template('course/courseiii.html')


@accoj_bp.route('/courseiv')
@login_required
def courseiv():
    return render_template('course/courseiv.html')


@accoj_bp.route('/coursev')
@login_required
def coursev():
    return render_template('course/coursev.html')


@accoj_bp.route('/coursevi')
@login_required
def coursevi():
    return render_template('course/coursevi.html')


@accoj_bp.route('/coursevii')
@login_required
def coursevii():
    return render_template('course/coursevii.html')


@accoj_bp.route('/courseviii')
@login_required
def courseviii():
    return render_template('course/courseviii.html')


@accoj_bp.route('/courseix')
@login_required
def courseix():
    return render_template('course/courseix.html')


@accoj_bp.route('/courseix_2')
@login_required
def courseix_2():
    return render_template('course/courseix_2.html')


@accoj_bp.route('/courseix_3')
@login_required
def courseix_3():
    return render_template('course/courseix_3.html')


@accoj_bp.route('/courseix_4')
@login_required
def courseix_4():
    return render_template('course/courseix_4.html')


@accoj_bp.route('/coursex')
@login_required
def coursex():
    return render_template('course/coursex.html')


@accoj_bp.route('/detail')
@login_required
def detail():
    return render_template('detail.html')
