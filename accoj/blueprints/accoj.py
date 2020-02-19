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


@accoj_bp.route('/coursei', methods=['POST', 'GET'])
def coursei():
    """
    第一次课程
    :return:
    """
    return render_template('course/coursei.html')


@accoj_bp.route('/get_company_info', methods=['POST', 'GET'])
def get_company_info():
    """
    获取公司信息
    :return:
    """
    if request.method == "POST":
        company_info = mongo.db.company.find_one(dict(student_no=session["username"]),
                                                 dict(_id=0,
                                                      com_name=1,
                                                      com_address=1,
                                                      com_business_addr=1,
                                                      com_legal_rep=1,
                                                      com_regist_cap=1,
                                                      com_operate_period=1,
                                                      com_business_scope=1,
                                                      com_shareholder=1
                                                      )
                                                 )
        # 公司已经创立过，填充表单
        if company_info:
            return jsonify(company_info=company_info)
    return redirect('/coursei')


@accoj_bp.route('/company_form_submit', methods=['POST', 'GET'])
def company_form_submit():
    """
    提交公司创立信息表单
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session["username"]})
        if company is not None:
            return jsonify(result=False, message="已经创立过公司")
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
            return jsonify(result=False, err_pos=err_pos, message="信息未填写完整或信息填写格式错误")
        else:
            for key in list(data_dict.keys()):
                if key.startswith("com_shareholder_"):
                    data_dict.pop(key)
                elif key == "com_regist_cap" or key == "com_operate_period":
                    data_dict[key] = float(data_dict[key])
            data_dict["com_bank_savings"] = data_dict["com_regist_cap"] * 10000
            data_dict["com_cash"] = 0
            data_dict["business_num"] = 0
            data_dict["business_confirm"] = False
            data_dict["com_assets"] = []
            data_dict["businesses"] = []
            data_dict_cp = data_dict.copy()
            # 副本公司同时创建
            data_dict_cp["student_no"] = "{}_cp".format(data_dict["student_no"])
            mongo.db.company.insert_many([data_dict, data_dict_cp])
            return jsonify(result=True)
    return redirect('/coursei')


@accoj_bp.route('/submit_business_infos', methods=['POST', 'GET'])
def submit_business_infos():
    """
    提交业务内容信息，提交成功后不可修改
    :return:
    """
    if request.method == "POST":
        company_info = mongo.db.company.find_one(dict(student_no="{}".format(session["username"])),
                                                 dict(business_num=1, _id=0))
        if company_info and company_info.get("business_num") >= 20:
            mongo.db.company.update(dict(student_no="{}".format(session["username"])),
                                    {"$set": {"business_confirm": True}})
            mongo.db.company.update(dict(student_no="{}_cp".format(session["username"])),
                                    {"$set": {"business_confirm": True}})
            return jsonify(result=True)
        else:
            return jsonify(result=False, message="公司业务数量过少")
    return redirect('/coursei')


@accoj_bp.route('/get_business_infos', methods=['POST', 'GET'])
def get_business_infos():
    """
    获取业务内容信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one(dict(student_no="{}".format(session["username"])),
                                            dict(businesses=1, business_confirm=1, _id=0))
        if company:
            businesses = company.get("businesses")
            if not businesses:
                return jsonify(result=False, message="暂无业务")
            business_confirm = company.get("business_confirm")
            content_list = list()
            for business in businesses:
                business_type = business.get("business_type")
                content = business.get("content")
                content_list.append(dict(business_type=business_type, content=content))
            return jsonify(result=True, content_list=content_list, business_confirm=business_confirm)
        else:
            return jsonify(result=False, message="公司未创立")
    return redirect('/coursei')


@accoj_bp.route('/revoke_add_business', methods=['POST', 'GET'])
def revoke_add_business():
    """
    撤销增加业务
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one(dict(student_no="{}".format(session["username"])),
                                            dict(businesses=1, _id=1))
        if company:
            businesses = company.get("businesses")
            _id = company.get("_id")
            if not businesses:
                return jsonify(result=False, message="暂无业务")
            question_no = company.get("businesses")[-1].get("question_no")
            print("question_no:{}".format(question_no))
            mongo.db.company.update(dict(_id=_id),
                                    {"$pop": {"businesses": 1},
                                     "$inc": {"business_num": -1},
                                     "$pull": {"com_assets": {"question_no": question_no}}})
            mongo.db.company.update({"student_no": "{}_cp".format(session["username"])},
                                    {"$pop": {"businesses": 1},
                                     "$inc": {"business_num": -1},
                                     "$pull": {"com_assets": {"question_no": question_no}}})
            return jsonify(result=True)
        else:
            return jsonify(result=False, message="公司未创立")
    return redirect('/coursei')


@accoj_bp.route('/add_business', methods=['POST', 'GET'])
def add_business():
    """
    增加业务
    :return:
    """
    if request.method == "POST":
        business_types = ["筹资活动", "投资活动", '经营活动']
        form = request.form
        business_type = form.get("business_type")
        result = jsonify(result=False, message="公司未创立！")
        company = mongo.db.company.find_one({"student_no": "{}".format(session["username"])})
        if company is None:
            return result
        if business_type not in business_types:
            return jsonify(result=False, message="业务类型错误！")

        if not company.get("businesses"):
            # 刚开始增加业务,随机生成题库号
            questions_no = random.randint(1, 1)
            # 第一笔业务，注册资本存入银行
            question = mongo.db.question.find_one()
            date = datetime.now()
            year = date.year
            month = date.month
            day = 1
            date = datetime(year, month, day)
            content = question.get("content")
            content = content.replace("v1", company.get("com_shareholder")[0])
            num = company.get("com_regist_cap")
            num *= 10000
            content = content.replace("v2", str(int(num)))
            business_type = question.get("business_type")
            affect_type = question.get("affect_type")
            values = [{"value_type": "common", "value": company.get("com_regist_cap")},
                      {"value_type": "num", "value": num}]
            key_element_infos = question.get("key_element_infos")
            key_element_infos_len = len(key_element_infos)
            for i in range(0, key_element_infos_len):
                key_element_infos[i]["money"] = values[int(key_element_infos[i].get("value_index")) - 1].get("value")
                key_element_infos[i].pop("value_index")
            subjects_infos = question.get("subjects_infos")
            subjects_infos_len = len(subjects_infos)
            for i in range(0, subjects_infos_len):
                subjects_infos[i]["money"] = values[int(subjects_infos[i].get("value_index")) - 1].get("value")
                subjects_infos[i].pop("value_index")
            content = "{}年{}月{}日，".format(year, month, day) + content
            result = content
            first_business = dict(questions_no=questions_no,
                                  question_no=1,
                                  content=content,
                                  date=date,
                                  business_type=business_type)
            first_business_cp = dict(questions_no=questions_no,
                                     question_no=1,
                                     content=content,
                                     date=date,
                                     business_type=business_type,
                                     affect_type=affect_type,
                                     key_element_infos=key_element_infos,
                                     subjects_infos=subjects_infos)
            # 用户公司写入业务
            mongo.db.company.update({"student_no": "{}".format(session["username"])},
                                    {"$push": {"businesses": first_business},
                                     "$inc": {"business_num": 1}})
            # 副本公司存储答案，业务数增1
            mongo.db.company.update({"student_no": "{}_cp".format(session["username"])},
                                    {"$push": {"businesses": first_business_cp},
                                     "$inc": {"business_num": 1}})
            return jsonify(result=True, content=result)

        elif company["businesses"][0]["questions_no"] == 1:
            # 公司已存在业务，且题库号为1
            result, message = deal_business_1(company, business_type)
            if message:
                return jsonify(result=False, message=message)
            else:
                return jsonify(result=True, content=result)

    return redirect('/coursei')


def deal_business_1(company, com_business_type):
    """
    题库1的处理，返回业务内容，报错信息
    :param company: company document
    :param com_business_type: business_type
    :return: business content,message
    """
    message = ""
    com_businesses = company["businesses"]
    # 公司已有的业务
    question_list = list()
    for com_business in com_businesses:
        question_list.append(com_business["question_no"])

    add_question_content = None
    add_question_no_list = list()
    question_list_len = len(question_list)
    if question_list_len == 25:
        add_question_no_list.append(34)
        add_question_content = deal_with_question_1(com_businesses, 34)
    elif question_list_len == 25:
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
                add_question_content = deal_with_question_1(company, add_question_no)
                break

    return add_question_content, message


def deal_with_question_1(company, question_no):
    """
    对应题号生成对应业务
    :param company: company document
    :param question_no: question no
    :return: business content
    """
    question = mongo.db.question.find_one(dict(questions_no=1,
                                               question_no=question_no))
    businesses = company.get("businesses")
    com_assets = company["com_assets"]
    date = datetime.now()
    year = date.year
    month = date.month
    day = company.get("business_num") + 1
    if question_no == 34 or question_no == 33:
        # 当前月份天数即当月最后一天
        day = (datetime(year, month + 1, 1) - datetime(year, month, 1)).days
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
            for asset in com_assets:
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
                value = value.lstrip("*")
            elif value[0] == "-":
                value = value.lstrip("-")
                for asset in com_assets:
                    if question_no == 30:
                        # 问题30特判
                        break
                    if asset.get("asset_name") == value:
                        com_assets.remove(asset)
                        break
        elif value_type == "num":
            if is_random:
                value = random.randrange(low, high, 100)
            if i and question_no != 28 and values[i - 1].get("value_type") == "asset" and \
                    values[i - 1].get("value")[0] == "+":
                # 公司资产增加处理
                content = content.replace("+", "")
                asset_name = values_list[i - 1].replace("+", "")
                com_assets.append(dict(asset_name=asset_name, market_value=value, question_no=question_no))
            if question_no == 2 and i == 0:
                value = random.randint(low, high)
            elif question_no == 13 and i == 2:
                # 问题13特判
                for asset in com_assets:
                    if asset.get("asset_name") == values_list[0]:
                        value = abs(values_list[1] - asset.get("asset_value"))
                        break
            elif question_no == 14:
                # 问题14特判
                value = 10000 * values_list[1]
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
                asset_name = values_list[0].replace("+", "")
                com_assets.append(dict(asset_name=asset_name, market_value=value))
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
        if value_type == "percent":
            content = content.replace("v{}".format(i + 1), str(value) + "%")
        else:
            content = content.replace("v{}".format(i + 1), str(value))
    # end---------------------------------------------------------------------------

    # deal key_element_infos--------------------------------------------------------
    key_element_infos_len = len(key_element_infos)
    for i in range(0, key_element_infos_len):
        value_index = key_element_infos[i].get("value_index")
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
        key_element_infos[i].pop("value_index")
    # end---------------------------------------------------------------------------

    # deal subjects_infos-----------------------------------------------------------
    subjects_infos_len = len(subjects_infos)
    for i in range(0, subjects_infos_len):
        value_index = subjects_infos[i].get("value_index")
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
                if question_no == 2:
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
        subjects_infos[i].pop("value_index")
    # end---------------------------------------------------------------------------

    content = "{}年{}月{}日，".format(year, month, day) + content
    business = dict(questions_no=1,
                    question_no=question_no,
                    content=content,
                    date=date,
                    business_type=business_type)

    business_cp = dict(questions_no=1,
                       question_no=question_no,
                       content=content,
                       date=date,
                       business_type=business_type,
                       affect_type=affect_type,
                       key_element_infos=key_element_infos,
                       subjects_infos=subjects_infos)
    # 用户公司写入业务
    mongo.db.company.update({"student_no": "{}".format(session["username"])},
                            {"$push": {"businesses": business},
                             "$set": {"com_assets": com_assets},
                             "$inc": {"business_num": 1}})
    # 副本公司存储答案
    mongo.db.company.update({"student_no": "{}_cp".format(session["username"])},
                            {"$push": {"businesses": business_cp},
                             "$set": {"com_assets": com_assets},
                             "$inc": {"business_num": 1}}
                            )
    return content


@accoj_bp.route('/courseii')
def courseii():
    """
    第二次课程
    :return:
    """
    # Todo
    return render_template('course/courseii.html')


@accoj_bp.route('/courseiii')
def courseiii():
    """
    第三次课程
    :return:
    """
    # Todo
    return render_template('course/courseiii.html')


@accoj_bp.route('/courseiv')
def courseiv():
    """
    第四次课程
    :return:
    """
    # Todo
    return render_template('course/courseiv.html')


@accoj_bp.route('/coursev')
def coursev():
    """
    第五次课程
    :return:
    """
    # Todo
    return render_template('course/coursev.html')


@accoj_bp.route('/coursevi')
def coursevi():
    """
    第六次课程
    :return:
    """
    # Todo
    return render_template('course/coursevi.html')


@accoj_bp.route('/coursevii')
def coursevii():
    """
    第七次课程
    :return:
    """
    # Todo
    return render_template('course/coursevii.html')


@accoj_bp.route('/courseviii')
def courseviii():
    """
    第八次课程
    :return:
    """
    # Todo
    return render_template('course/courseviii.html')


@accoj_bp.route('/courseix')
def courseix():
    """
    第九次课程第一部分
    :return:
    """
    # Todo
    return render_template('course/courseix.html')


@accoj_bp.route('/courseix_2')
def courseix_2():
    """
    第九次课程第二部分
    :return:
    """
    # Todo
    return render_template('course/courseix_2.html')


@accoj_bp.route('/courseix_3')
def courseix_3():
    """
    第九次课程第三部分
    :return:
    """
    # Todo
    return render_template('course/courseix_3.html')


@accoj_bp.route('/courseix_4')
def courseix_4():
    """
    第九次课程第四部分
    :return:
    """
    # Todo
    return render_template('course/courseix_4.html')


@accoj_bp.route('/coursex')
def coursex():
    """
    第十次课程
    :return:
    """
    # Todo
    return render_template('course/coursex.html')


@accoj_bp.route('/detail')
def detail():
    """
    用户个人中心
    :return:
    """
    # Todo
    return render_template('detail.html')


@accoj_bp.before_request
@login_required
def accoj_bp_before_request():
    """
    局部请求前钩子函数，需要登陆
    :return:
    """
    pass
