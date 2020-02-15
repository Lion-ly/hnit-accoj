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
from accoj.utils import is_number
from _datetime import datetime
import random

accoj_bp = Blueprint('accoj', __name__)


@accoj_bp.route('/', methods=['POST', 'GET'])
def index():
    return render_template('index.html')


@accoj_bp.route('/coursei', methods=['POST', 'GET'])
@login_required
def coursei():
    return render_template('course/coursei.html')


@accoj_bp.route('/get_company_info', methods=['POST', 'GET'])
@login_required
def get_company_info():
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session["username"]})
        # 公司已经创立过，填充表单
        if company is not None:
            company.pop("_id")
            return jsonify(company_info=company)
    return redirect('/coursei')


@accoj_bp.route('/company_form_submit', methods=['POST', 'GET'])
@login_required
def company_form_submit():
    """提交公司创立信息表单"""
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session["username"]})
        if company is not None:
            return jsonify(result="false", message="已经创立过公司")
        form = request.form
        data_list = ["com_name", "com_address", "com_business_addr", "com_legal_rep", "com_regist_cap",
                     "com_operate_period", "com_business_scope", "com_shareholder_1", "com_shareholder_2",
                     "com_shareholder_3", "com_shareholder_4", "com_shareholder_5"]
        data_dict = dict()
        data_dict["com_shareholder"] = []
        err_pos = []

        data_dict["student_no"] = session["username"]
        for data_name in data_list:
            data_dict[data_name] = form.get(data_name)

        flag = True
        shareholder_num = 0
        for key, value in data_dict.items():
            if value is "":
                if key.startswith("com_shareholder_") is False:
                    flag = False
                    err_pos.append({"err_pos": key})
                else:
                    shareholder_num += 1
                    if key == "com_shareholder_1":
                        err_pos.append({"err_pos": key})
            elif key.startswith("com_shareholder_"):
                data_dict["com_shareholder"].append(value)
            elif key == "com_regist_cap" or key == "com_operate_period":
                if is_number(value) is False:
                    flag = False
                    err_pos.append({"err_pos": key})

        if shareholder_num == 0:
            flag = False
        if flag is False:
            return jsonify(result="false", err_pos=err_pos, message="信息未填写完整或信息填写格式错误")
        else:
            for key in list(data_dict.keys()):
                if key.startswith("com_shareholder_"):
                    data_dict.pop(key)
                elif key == "com_regist_cap" or key == "com_operate_period":
                    data_dict[key] = float(data_dict[key])
            # 副本公司同时创建
            data_dict["com_bank_savings"] = data_dict["com_regist_cap"]
            data_dict["com_cash"] = 0
            data_dict["business_day"] = 0
            data_dict_cp = data_dict.copy()
            data_dict_cp["student_no"] = "{}_cp".format(data_dict["student_no"])
            mongo.db.company.insert_many([data_dict, data_dict_cp])
            return jsonify(result="true")
    return redirect('/coursei')


@accoj_bp.route('/add_business', methods=['POST', 'GET'])
@login_required
def add_business():
    """增加业务"""
    # 待测试--------------------------------------------------------------------------------
    if request.method == "POST":
        business_types = ["筹资活动", "投资活动", '经营活动']
        form = request.form
        business_type = form.get["business_type"]
        result = jsonify(result="false", message="公司未创立！")
        company = mongo.db.company.find_one({"student_no": "{}".format(session["username"])})
        if company is None:
            return result
        if business_type not in business_types:
            return jsonify(result="false", message="业务类型错误！")

        if company.get("businesses") is None:
            # 刚开始增加业务,随机生成题库号
            questions_no = random.randint(1, 1)
            # 第一笔业务，注册资本存入银行
            question = mongo.db.qustion.find_one(dict(questions_no=questions_no,
                                                      question_no=1))
            date = datetime.now()
            year = date.year
            month = date.month
            day = 1
            date = datetime(year, month, day)
            content = question.get("content")
            content = content.replace("v1", company.get("com_shareholder")[0])
            num = company.get("com_regist_cap")
            content = content.replace("v2", num)
            business_type = question.get("business_type")
            affect_type = question.get("affect_type")
            values = [{"value_type": "common", "value": company.get("com_regist_cap")},
                      {"value_type": "num", "value": num}]
            key_element_infos = question.get("key_element_infos")
            key_element_infos_len = len(key_element_infos)
            for i in range(0, key_element_infos_len):
                key_element_infos[i]["money"] = values[int(key_element_infos[i].get("value_index")) - 1].get("value")
                key_element_infos[i].pop("value_pos")
            subjects_infos = question.get("subjects_infos")
            subjects_infos_len = len(subjects_infos)
            for i in range(0, subjects_infos_len):
                subjects_infos[i]["money"] = values[int(subjects_infos[i].get("value_index")) - 1].get("value")
                key_element_infos[i].pop("value_pos")
            content = "{}年{}月{}日，".format(year, month, day) + content
            first_business = dict(questions_no=questions_no,
                                  question_no=1,
                                  content=content,
                                  date=date,
                                  business_type=business_type,
                                  affect_type=affect_type,
                                  key_element_infos=key_element_infos,
                                  subjects_infos=subjects_infos)
            # 副本公司存储答案，业务数增1
            mongo.db.company.update({"student_no": "{}_cp".format(session["username"])},
                                    {"$set": {"businesses": [first_business]}, "$inc": {"business_day": 1}})

        elif company["businesses"][0]["questions_no"] == 1:
            # 公司已存在业务，题库号为1
            result = deal_question_1(company, business_type)
        return jsonify(result="true", data=result)
    return redirect('/coursei')


def deal_question_1(company, com_business_type):
    """
    题库1的处理，返回业务内容，报错信息
    :param company: company document
    :param com_business_type: business_type
    :return: business content,message
    """
    # 待测试--------------------------------------------------------------------------------------------
    def deal_with_question(businesses, assets, question_no):
        """
        对应题号生成对应业务
        :param businesses: company document
        :param assets: company assets list
        :param question_no: question no
        :return: business content
        """
        question = mongo.db.qustion.find_one(dict(questions_no=1,
                                                  question_no=question_no))
        date = datetime.now()
        year = date.year
        month = date.month
        day = businesses.get("business_day")
        business_day_add = 1
        if day % 6 == 0:
            day += 2
            business_day_add = 2
        date = datetime(year, month, day)
        content = question.get("content")
        business_type = question.get("business_type")
        affect_type = question.get("affect_type")
        key_element_infos = question.get("key_element_infos")
        subjects_infos = question.get("subjects_infos")

        # deal values and content------------------------------------------------------------------------
        values = question.get("values")
        values_len = len(values)
        values_list = list()
        for i in range(0, values_len):
            value = values[i].get("value")
            value_type = values[i].get("value_type")
            is_random = values[i].get("is_random")
            low = values[i].get("low")
            high = values[i].get("high")
            if question_no == 13 and i == 3:
                # 问题13特判
                value_tmp = 0
                for asset in assets:
                    if asset.get("asset_name") == values_list[0]:
                        value_tmp = values_list[1] - asset.get("asset_value")
                        break
                if values_list[1] >= value_tmp:
                    value = value.split("/")[0]
                else:
                    value = value.split("/")[1]
                    # 收益为负
                    subjects_infos[i]["is_up"] = False
            elif question_no == 23 and (i == 2 or i == 3):
                # 问题23特判
                for business in businesses:
                    if business.get("question_no") == 20:
                        value_tmp = business.get("key_element_infos")[0].get("money")
                        if values_list[1] > value_tmp:
                            value = value.split("/")[0]
                        elif values_list[1] < value_tmp:
                            value = value.split("/")[1]
                        else:
                            if i == 2:
                                content_tmp = content.split("，")
                                content_tmp.pop(-1)
                                content = "，".join(content_tmp)
                        break
            elif value_type == "asset":
                if value[0] == "*":
                    value = value.lstrip("*", "")
                elif value[0] == "-":
                    value = value.lstrip("-", "")
                    for asset in assets:
                        if question_no == 30:
                            # 问题30特判
                            break
                        if asset.get("asset_name") == value:
                            assets.remove(asset)
                            break
            elif value_type == "num":
                if is_random:
                    value = random.randrange(low, high, 100)
                if i and question_no != 28 and values[i - 1].get("value_type") == "asset" and \
                        values[i - 1].get("value")[0] == "+":
                    # 公司资产增加处理
                    content = content.replace("+", "")
                    assets.append(dict(asset_name=values_list[i - 1], market_value=value))
                if question_no == 2 and i == 0:
                    value = random.randint(low, high)
                elif question_no == 13 and i == 2:
                    # 问题13特判
                    for asset in assets:
                        if asset.get("asset_name") == values_list[0]:
                            value = abs(values_list[1] - asset.get("asset_value"))
                            break
                elif question_no == 14:
                    # 问题14特判
                    value = 1000 * values_list[1]
                elif question_no == 18:
                    # 问题18特判
                    for business in businesses:
                        if business.get("question_no") == 17:
                            high = business.get("key_element_infos")[0].get("money")
                            value = random.randrange(90000, high, 100)
                            break
                elif question_no == 20:
                    # 问题20特判
                    for business in businesses:
                        if business.get("question_no") == 15:
                            high = business.get("key_element_infos")[0].get("money")
                            value = random.randrange(1000, high, 100)
                            break
                elif question_no == 23:
                    # 问题23特判
                    for business in businesses:
                        if business.get("question_no") == 20:
                            medium = business.get("key_element_infos")[0].get("money")
                            value = random.randrange(medium - 1000, medium + 1000, 100)
                            break
                elif question_no == 27:
                    # 问题27特判
                    pass
                elif question_no == 28:
                    # 问题28特判
                    content = content.replace("+", "")
                    assets.append(dict(asset_name=values_list[0], market_value=value))
                    for business in businesses:
                        value = 0
                        if business.get("question_no") in [24, 25, 26, 27]:
                            value += business.get("subjects_infos")[0].get("money")
                elif question_no == 30:
                    # 问题30特判
                    if i == 2:
                        for business in businesses:
                            if business.get("question_no") == 28:
                                tmp = business.get("key_element_infos")[0].get("money")
                                value = tmp / 2
                                break
                    if i == 3:
                        value = int(values_list[i - 1] * 0.8)
                elif question_no == 31:
                    # 问题31特判
                    if i == 2:
                        for business in businesses:
                            if business.get("question_no") == 30:
                                value = business.get("key_element_infos")[0].get("money")
                                break
                    if i == 3:
                        value = int(values_list[i - 1] * 0.8)
                elif question_no == 33:
                    # 问题33特判
                    if i == 2:
                        for business in businesses:
                            if business.get("question_no") == 28:
                                tmp = business.get("key_element_infos")[2].get("money")
                                value = tmp / 2
                                break
                    if i == 3:
                        value = int(values_list[i - 1] * 0.8)

            elif value_type == "percent":
                if is_random:
                    value = random.randint(low, high)
            values_list.append(value)
            content = content.replace("v{}".format(i + 1), value)
        # end---------------------------------------------------------------------------

        # deal key_element_infos--------------------------------------------------------
        key_element_infos_len = len(key_element_infos)
        for i in range(0, key_element_infos_len):
            value_index = key_element_infos[i].get("key_element")
            if value_index[0] != "(":
                money = values_list[int(value_index) - 1]
            else:
                value_index_len = len(value_index)
                money = values_list[int(value_index[1]) - 1]
                symbol = True
                for j in range(2, value_index_len - 1):
                    if j % 2 == 0:
                        if value_index[j] == "+":
                            symbol = True
                        else:
                            symbol = False
                    else:
                        if symbol:
                            money += values_list[int(value_index[j]) - 1]
                        else:
                            money -= values_list[int(value_index[1]) - 1]
            key_element_infos[i]["money"] = money
            key_element_infos[i].pop("value_pos")
        # end---------------------------------------------------------------------------

        # deal subjects_infos-----------------------------------------------------------
        subjects_infos_len = len(subjects_infos)
        for i in range(0, subjects_infos_len):
            value_index = subjects_infos[i].get("key_element")
            if (i and question_no == 2) or (not i and question_no == 3):
                content_tmp = None
                if question_no == 2:
                    # 问题2特判
                    year_tmp = int(content.find("年") - 1)
                else:
                    # 问题3特判
                    for business in businesses:
                        if business.get("question_no") == 2:
                            content_tmp = business.get("content")
                            break
                    year_tmp = int(content_tmp.find("年") - 1)
                subject_temp = subjects_infos[i].get("subject")
                if year_tmp == 1:
                    subjects_infos[i]["subject"] = subject_temp.split("/")[0]
                else:
                    subjects_infos[i]["subject"] = subject_temp.split("/")[1]
            if question_no == 23:
                # 问题23特判
                money = None
                if content.find("多于"):
                    value_tmp = 0
                    for business in businesses:
                        if business.get("question_no") == 20:
                            value_tmp = business.get("key_element_infos")[0].get("money")
                            break
                    if i == 0:
                        money = values_list[0]
                    elif i == 1:
                        money = value_tmp
                    else:
                        subjects_infos.append(dict(subject="银行存款", money=values_list[0] - value_tmp, is_up=False))
                elif content.find("少于"):
                    if i == 0:
                        money = values_list[0]
                    elif i == 1:
                        money = values_list[0]
                    else:
                        value_tmp = 0
                        for business in businesses:
                            if business.get("question_no") == 20:
                                value_tmp = business.get("key_element_infos")[0].get("money")
                                break
                        subjects_infos.append(dict(subject="银行存款",
                                                   money=abs(values_list[0] - value_tmp),
                                                   is_up=False))
                else:
                    money = values_list[int(value_index) - 1]
            elif value_index[0] != "(":
                money = values_list[int(value_index) - 1]
            else:
                value_index_len = len(value_index)
                money = values_list[int(value_index[1]) - 1]
                symbol = True
                for j in range(2, value_index_len - 1):
                    if j % 2 == 0:
                        if value_index[j] == "+":
                            symbol = True
                        else:
                            symbol = False
                    else:
                        if symbol:
                            money += values_list[int(value_index[j]) - 1]
                        else:
                            money -= values_list[int(value_index[1]) - 1]
            if money:
                subjects_infos[i]["money"] = money
            subjects_infos[i].pop("value_pos")
        # end---------------------------------------------------------------------------

        if question_no == 34:
            day = 30
        # 对于闰年以及二月的处理待做
        content = "{}年{}月{}日，".format(year, month, day) + content
        business = dict(questions_no=1,
                        question_no=question_no,
                        content=content,
                        date=date,
                        business_type=business_type,
                        affect_type=affect_type,
                        key_element_infos=key_element_infos,
                        subjects_infos=subjects_infos)
        mongo.db.company.update({"student_no": "{}_cp".format(session["username"])},
                                {"$push": {"businesses": business},
                                 "$set": {"com_assets": assets},
                                 "$inc": {"business_day": business_day_add}})
        return content
        # def end

    message = ""
    com_businesses = company["businesses"]
    com_assets = company["com_assets"]
    # 公司已有的业务
    question_list = list()
    for com_business in com_businesses:
        question_list.append(com_business["question_no"])

    add_question_content = None
    add_question_no_list = list()
    question_list_len = len(question_list)
    if question_list_len == 20:
        add_question_no_list.append(34)
        add_question_content = deal_with_question(com_businesses, com_assets, 34)
    elif question_list_len == 21:
        message = "业务数已达上限"
    else:
        # 筹资活动
        random_list = list(range(2, 8))
        if com_business_type == "投资活动":
            random_list = list(range(8, 15))
        elif com_business_type == "经营活动":
            random_list = list(range(15, 34))
        for random_num in random_list:
            if random_num in question_list:
                random_list.remove(random_num)
        if not random_list:
            message = "请选择其他活动"
            return add_question_content, message
        while True:
            # 随机选择题目
            if not random_list:
                # 随机数序列为空
                message = "请选择其他活动"
                return add_question_content, message
            add_question_no = random.choice(random_list)
            if add_question_no in question_list:
                continue
            elif add_question_no == 3 and 2 not in question_list:
                # 业务2为业务3前提
                random_list.remove(3)
                continue
            elif add_question_no == 13 and 12 not in question_list:
                # 业务12为业务13前提
                random_list.remove(13)
                continue
            elif add_question_no == 18 and 17 not in question_list:
                # 业务17为业务18前提
                random_list.remove(18)
                continue
            elif add_question_no == 20 and 15 not in question_list:
                # 业务15为业务20前提
                random_list.remove(15)
                continue
            elif add_question_no == 23 and 19 not in question_list:
                # 业务19为业务23前提
                random_list.remove(23)
                continue
            elif add_question_no == 27 and 5 not in question_list and 8 not in question_list and 9 not in question_list:
                # 业务[5,8,8]为业务27前提
                random_list.remove(27)
                continue
            elif add_question_no == 28 and 24 not in question_list and 25 not in question_list and \
                    26 not in question_list and 27 not in question_list:
                # 业务[24,45,26,27]为业务28前提
                random_list.remove(28)
                continue
            elif add_question_no == 30 and 28 not in question_list:
                # 业务28为业务30前提
                random_list.remove(30)
                continue
            elif add_question_no == 31 and 28 not in question_list and 30 not in question_list:
                # 业务28为业务31前提
                random_list.remove(31)
                continue
            elif add_question_no == 33 and 25 not in question_list:
                # 业务25为业务33前提
                random_list.remove(33)
                continue
            else:
                add_question_content = deal_with_question(com_businesses, com_assets, add_question_no)
                break

    return add_question_content, message


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
