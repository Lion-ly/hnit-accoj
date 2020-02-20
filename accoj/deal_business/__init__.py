#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/2/20 12:29
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py.py
# @Software: PyCharm
import random
from accoj.extensions import mongo
from _datetime import datetime
from flask import session


def deal_business(company, business_type, questions_no):
    """
    业务处理
    :param company: company document
    :param business_type: business_type
    :param questions_no: questions_no
    :return: business_content, message
    """
    business_content, message = "", ""
    if questions_no == 1:
        business_content, message = deal_business_1(company=company, business_type=business_type)
    return business_content, message


def deal_business_1(company, business_type):
    """
    题库1的处理，返回业务内容，报错信息
    :param company: company document
    :param business_type: business_type
    :return: business_content,message
    """
    message = ""
    com_businesses = company["businesses"]
    business_num = company["business_num"]
    business_content = None

    if business_num == 0:
        # 第一笔业务
        business_content = deal_with_question_1(company, 1)
    if business_num == 24:
        # 最多25笔业务
        business_content = deal_with_question_1(company, 34)
    else:
        # 公司已有的业务
        question_list = list()
        for com_business in com_businesses:
            question_list.append(com_business["question_no"])
        # 筹资活动2-7
        random_list = list(range(2, 8))
        if business_type == "投资活动":
            random_list = list(range(8, 15))
        elif business_type == "经营活动":
            random_list = list(range(15, 34))
        for question_no_tmp in question_list:
            if question_no_tmp in random_list:
                random_list.remove(question_no_tmp)
        print("question_list:{}".format(question_list))
        print("random_list:{}".format(random_list))
        if not random_list:
            message = "请选择其他活动"
            return business_content, message
        while True:
            # 随机选择题目
            if not random_list:
                # 随机数序列为空
                message = "请选择其他活动"
                print(message)
                return business_content, message
            question_no = random.choice(random_list)
            if question_no in question_list:
                continue
            elif question_no == 3 and 2 not in question_list:
                # 业务2为业务3前提
                random_list.remove(3)
                continue
            elif question_no == 13 and 12 not in question_list:
                # 业务12为业务13前提
                random_list.remove(13)
                continue
            elif question_no == 18 and 17 not in question_list:
                # 业务17为业务18前提
                random_list.remove(18)
                continue
            elif question_no == 20 and 15 not in question_list:
                # 业务15为业务20前提
                random_list.remove(15)
                continue
            elif question_no == 23 and 19 not in question_list:
                # 业务19为业务23前提
                random_list.remove(23)
                continue
            elif question_no == 27 and 5 not in question_list and 8 not in question_list and 9 not in question_list:
                # 业务[5,8,8]为业务27前提
                random_list.remove(27)
                continue
            elif question_no == 28 and 24 not in question_list and 25 not in question_list and \
                    26 not in question_list and 27 not in question_list:
                # 业务[24,45,26,27]为业务28前提
                random_list.remove(28)
                continue
            elif question_no == 30 and 28 not in question_list:
                # 业务28为业务30前提
                random_list.remove(30)
                continue
            elif question_no == 31 and 28 not in question_list and 30 not in question_list:
                # 业务28为业务31前提
                random_list.remove(31)
                continue
            elif question_no == 33 and 25 not in question_list:
                # 业务25为业务33前提
                random_list.remove(33)
                continue
            else:
                business_content = deal_with_question_1(company=company, question_no=question_no)
                break

    return business_content, message


def deal_with_question_1(company, question_no):
    """
    1号题库对应题号生成对应业务
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
    values_list = list()
    if question_no == 1:
        content = content.replace("v1", company.get("com_shareholder")[0])
        num_tmp = company.get("com_regist_cap")
        num_tmp *= 10000
        content = content.replace("v2", str(int(num_tmp)))
        business_type = question.get("business_type")
        affect_type = question.get("affect_type")
        values_list = [{"value_type": "common", "value": company.get("com_regist_cap")},
                       {"value_type": "num", "value": num_tmp}]
    else:
        values = question.get("values")
        values_len = len(values)
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
                    asset_name = values_list[int(i - 1)].replace("+", "")
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
                             "$set" : {"com_assets": com_assets},
                             "$inc" : {"business_num": 1}})
    # 副本公司存储答案
    mongo.db.company.update({"student_no": "{}_cp".format(session["username"])},
                            {"$push": {"businesses": business_cp},
                             "$set" : {"com_assets": com_assets},
                             "$inc" : {"business_num": 1}}
                            )
    return content
