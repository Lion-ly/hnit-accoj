#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/4/3 13:15
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : create_businesses.py
# @Software: PyCharm
import random
import re
from accoj.extensions import mongo
from _datetime import datetime

PERIOD_NUM = 10


def create_businesses(company):
    """
    生成业务
    :param company: company document
    :return:
    """
    # 1号题库已废弃
    low, high = 2, 2  # 题库编号随机生成
    questions_no = random.randint(low, high)
    flag = create_business(company, questions_no)
    message = "生成业务成功！"
    if not flag:
        message = "业务逻辑出现问题，生成业务失败！"
        return False, message
    return True, message


def create_business(company, questions_no):
    """
    业务处理
    :param company: company document
    :param questions_no: questions_no
    :return:
    """
    question_no_list = []
    # test 将此变量取消注释并将列表长度填至20，可生成固定题号题目
    # question_no_list = [1, 8, 7, 25, 20, 27, 26, 31, 28, 37, 11, 32, 10, 36, 33, 27, 28, 31, 26, 37]

    questions = mongo.db.question.find(dict(questions_no=questions_no))
    max_question_no = questions.count()
    create_function_list = [create_business_1, create_business_2]
    func_index = questions_no - 1
    max_no = 20
    company.update(dict(business_num=0, com_assets=[],
                        businesses=[], key_element_infos=[],
                        subject_infos=[], entry_infos=[],
                        acc_document_infos=[]))
    username = company.get("student_no")
    no_pop = {"business_num", "com_assets", "businesses", "key_element_infos",
              "subject_infos", "com_shareholder", "com_regist_cap"}
    # 将无关信息pop出company
    for key in list(company.keys()):
        if key not in no_pop:
            company.pop(key)
    if not question_no_list:  # test
        # 生成业务
        for i in range(0, max_no):
            flag, company = create_function_list[func_index](company=company, questions=questions,
                                                             max_question_no=max_question_no)
            if not flag:
                return False
    else:  # test
        for i in range(0, max_no):
            flag, company = create_function_list[func_index](company=company, questions=questions,
                                                             max_question_no=max_question_no,
                                                             question_no=question_no_list[i])
    # 副本公司存储答案
    mongo.db.company.update({"student_no": "{}_cp".format(username)},
                            {"$set": company})
    [company.pop(key) for key in ["key_element_infos", "subject_infos"]]
    # 用户公司写入业务
    mongo.db.company.update({"student_no": "{}".format(username)},
                            {"$set": company})
    return True


def create_business_1(company, questions, max_question_no):
    """
    题库1的处理
    :param company: company document
    :param questions: question cursor
    :param max_question_no: max question no
    :return:
    """
    com_businesses = company["businesses"]
    business_num = company["business_num"]

    if business_num == 0:
        # 第一笔业务
        company = deal_with_question_1(company, 1, questions)
    elif business_num == PERIOD_NUM - 1:
        # 第一个会计区间结束
        company = deal_with_question_1(company, max_question_no, questions)
    elif business_num == PERIOD_NUM * 2 - 1:
        # 第二个会计区间结束
        company = deal_with_question_1(company, max_question_no, questions)
    else:
        # 公司已有的业务
        success_flag = False
        question_set = set()
        for com_business in com_businesses:
            question_set.add(com_business["question_no"])
        random_list = list(range(2, max_question_no - 1))
        for question_no_tmp in question_set:
            if question_no_tmp in random_list:
                _remove(random_list, question_no_tmp)
        while True:
            # 随机选择题目
            if not random_list:
                # 随机数序列为空
                return False, company
            question_no = random.choice(random_list)
            if question_no in question_set:
                continue
            elif question_no == 3 and 2 not in question_set:
                # 业务2为业务3前提
                _remove(random_list, 3)
                continue
            elif question_no == 13 and 12 not in question_set:
                # 业务12为业务13前提
                _remove(random_list, 13)
                continue
            elif question_no == 18 and 17 not in question_set:
                # 业务17为业务18前提
                _remove(random_list, 18)
                continue
            elif question_no == 20 and 15 not in question_set:
                # 业务15为业务20前提
                _remove(random_list, 15)
                continue
            elif question_no == 23 and 19 not in question_set:
                # 业务19为业务23前提
                _remove(random_list, 23)
                continue
            elif question_no == 27:
                # 业务[5,8,9]为业务27前提
                if {5, 8, 9} < question_set:  # 集合子集判断
                    success_flag = True
                    break
                _remove(random_list, 27)
                continue
            elif question_no == 28:
                if {24, 25, 26, 27} < question_set:
                    success_flag = True
                    break
                # 业务[24,25,26,27]为业务28前提
                _remove(random_list, 28)
                continue
            elif question_no == 30 and 28 not in question_set:
                # 业务28为业务30前提
                _remove(random_list, 30)
                continue
            elif question_no == 31:
                # 业务[28，30]为业务31前提
                if {24, 45, 26, 27} < question_set:
                    success_flag = True
                    break
                _remove(random_list, 31)
                continue
            elif question_no == 33 and (business_num != 18 or 25 not in question_set):
                # 业务25为业务33前提且在业务34前一个单位（即结算第二会计区间本月损益）
                _remove(random_list, 33)
                continue
            else:
                success_flag = True
                break
        if success_flag:
            company = deal_with_question_1(company=company, question_no=question_no, questions=questions)
    return True, company


def deal_with_question_1(company, question_no, questions):
    """
    1号题库对应题号生成对应业务
    :param company: company document
    :param question_no: question no
    :param questions: question cursor
    :returns
    """
    question, businesses, com_key_element_infos, com_subject_infos, com_assets, business_num, year, month, day = \
        _get_deal_question(company=company, question_no=question_no, questions=questions)
    if day != 1:
        day *= 2
        day = random.randint(day - 1, day)
    if question_no == 34 or question_no == 33:
        # 当前月份天数即当月最后一天
        day = (datetime(year, month + 1, 1) - datetime(year, month, 1)).days
    date = datetime(year, month, day)
    my_keys = ["content", "business_type", "affect_type", "key_element_infos", "subject_infos"]
    content, business_type, affect_type, key_element_infos, subject_infos = tuple([question[key] for key in my_keys])

    # deal values and content------------------------------------------------------------------------
    index_dict = _get_index_dict(businesses)
    values_list = list()
    if question_no == 1:
        # 第1题特判
        content, business_type, affect_type, values_list = _deal_first_question(content=content, company=company,
                                                                                question=question)
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
                        value_tmp = values_list[1] - asset.get("market_value")
                        break
                if value_tmp >= 0:
                    value = value.split("/")[0]
                else:
                    value = value.split("/")[1]
                    # 收益为负
                    subject_infos[i]["is_up"] = False
            elif question_no == 23 and (i == 2 or i == 3):
                # 问题23特判
                index_tmp = index_dict.get("{}".format(20))
                value_tmp = com_key_element_infos[index_tmp]["info"][0].get("money")
                happened_money = values_list[1]
                content, value = _deal_travel_expenses(content=content, value=value, debit_money=value_tmp,
                                                       happened_money=happened_money, index=i)
            elif value_type == "asset":
                value = _deal_asset_generic(value)
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
                            value = abs(values_list[1] - asset.get("market_value"))
                            break
                elif question_no == 14:
                    # 问题14特判
                    value = 10000 * values_list[1]
                elif question_no == 18:
                    # 问题18特判
                    index_tmp = index_dict.get("{}".format(17))
                    high = com_key_element_infos[index_tmp]["info"][0].get("money")
                    value = random.randrange(90000, high, 100)
                elif question_no == 20:
                    # 问题20特判
                    index_tmp = index_dict.get("{}".format(15))
                    high = com_key_element_infos[index_tmp]["info"][0].get("money")
                    value = random.randrange(1000, high, 100)

                elif question_no == 23:
                    # 问题23特判
                    index_tmp = index_dict.get("{}".format(20))
                    medium = com_key_element_infos[index_tmp]["info"][0].get("money")
                    value = random.randrange(medium - 1000, medium + 1000, 100)
                elif question_no == 28:
                    # 问题28特判
                    content = content.replace("+", "")
                    asset_name = values_list[0].replace("+", "")
                    com_assets.append(dict(asset_name=asset_name, market_value=value, question_no=question_no))
                    index_tmps = [index_dict.get("{}".format(k)) for k in [24, 25, 26, 27]]
                    value = 0
                    for index_tmp in index_tmps:
                        value += com_subject_infos[index_tmp][0].get("money")
                elif question_no == 30:
                    # 问题30特判
                    if i == 2:
                        index_tmp = index_dict.get("{}".format(28))
                        tmp = com_key_element_infos[index_tmp]["info"][0].get("money")
                        value = tmp / 2
                    if i == 3:
                        value = values_list[i - 1] * 0.8
                elif question_no == 31:
                    # 问题31特判
                    if i == 2:
                        index_tmp = index_dict.get("{}".format(30))
                        value = com_key_element_infos[index_tmp]["info"][0].get("money")
                    if i == 3:
                        value = values_list[i - 1] * 0.8
                elif question_no == 33:
                    # 问题33特判
                    if i == 2:
                        index_tmp = index_dict.get("{}".format(28))
                        tmp = com_key_element_infos[index_tmp]["info"][2].get("money")
                        value = tmp / 2
                    if i == 3:
                        value = values_list[i - 1] * 0.8

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
    key_element_infos = _deal_key_element_generic(key_element_infos=key_element_infos, values_list=values_list)
    # end---------------------------------------------------------------------------

    # deal subject_infos-----------------------------------------------------------
    subject_infos_len = len(subject_infos)
    for i in range(0, subject_infos_len):
        value_index = subject_infos[i].get("value_index")
        if i and (question_no == 2 or question_no == 3):
            if question_no == 2:
                # 问题2特判
                subject_infos = _deal_bank_loan_subject(content=content, subject_infos=subject_infos, index=i)
            else:
                # 问题3特判
                index_tmp = index_dict.get("{}".format(2))
                subject_temp = com_subject_infos[index_tmp]
                subject_infos[i]["subject"] = subject_temp[1]["subject"]

        if question_no == 23:
            # 问题23特判
            index_tmp = index_dict.get("{}".format(20))
            debit_money = com_key_element_infos[index_tmp]["info"][0].get("money")
            happened_money = values_list[1]
            money, subject_infos = _deal_travel_subject(content=content, subject_infos=subject_infos,
                                                        debit_money=debit_money, happened_money=happened_money,
                                                        index=i)
            if not money:
                money = values_list[int(value_index) - 1]
        elif value_index[0] != "(":
            money = values_list[int(value_index) - 1]
        else:
            money = _deal_arithmetic(value_index=value_index, values_list=values_list)

        if money:
            subject_infos[i]["money"] = money
        subject_infos[i].pop("value_index")
    # end---------------------------------------------------------------------------

    content = "{}年{}月{}日，".format(year, month, day) + content
    business = dict(questions_no=1, question_no=question_no, content=content, date=date, business_type=business_type)

    _update_company(company=company, affect_type=affect_type, key_element_infos=key_element_infos,
                    businesses=businesses, business=business,
                    com_key_element_infos=com_key_element_infos,
                    com_subject_infos=com_subject_infos, subject_infos=subject_infos,
                    business_num=business_num, com_assets=com_assets)
    return company


def create_business_2(company, questions, max_question_no, question_no=False):
    """
    题库2的处理
    第一个月:
    ` 1   rd      rd      rd   rd 15-25    last       last # 日期`
    `[1] (5/8) (7/17/18)  25   rd1  27  [26,28,31]   [37] # 题号`
    第二个月:
    ` rd  rd   rd  f15  rd     15-25   last       last    # 日期`
    ` rd1 rd2  rd3 36 (33/34)    27  [26,28,31]   [37]    # 题号`
    :param question_no:
    :param company: company document
    :param questions: question cursor
    :param max_question_no: max question no
    :return:
    """
    com_businesses = company["businesses"]
    business_num = company["business_num"]

    if question_no:  # test
        company = deal_with_question_2(company=company, question_no=question_no, questions=questions)
        return True, company

    question_set = set()  # 公司已有的业务
    question_list = list()
    for com_business in com_businesses:
        question_set.add(com_business["question_no"])
        question_list.append(com_business["question_no"])
    random_list = list(range(2, max_question_no - 1))
    print("1: " + str(random_list))
    for question_no_tmp in question_set:
        if question_no_tmp in random_list:
            _remove(random_list, question_no_tmp)

    if business_num == 0:
        # 第一笔业务
        question_no = 1
    elif business_num == PERIOD_NUM - 1:
        # 第一个会计区间结束
        question_no = max_question_no
    elif business_num == PERIOD_NUM * 2 - 1:
        # 第二个会计区间结束
        question_no = max_question_no
    elif business_num == 1:
        question_no = random.choice([5, 8])
    elif business_num == 2:
        question_no = random.choice([7, 17, 18])
    elif business_num == 3:
        question_no = 25
    elif business_num == 5:
        question_no = 27
    elif 6 <= business_num <= 8:
        random_tmp = [26, 28, 31]
        random_list = [k for k in random_tmp if k not in question_set]
        question_no = random.choice(random_list)
        print("2: " + str(random_list))
    elif business_num == 13:
        question_no = 36
    elif business_num == 14:
        question_no = random.choice([33, 34])
    elif business_num == 15:
        question_no = 27
    elif 16 <= business_num <= 18:
        random_tmp = {26, 28, 31}
        random_list = [k for k in random_tmp if question_list.count(k) == 1]
        question_no = random.choice(random_list)
        print("3: " + str(random_list))
    else:
        no_random = {5, 8, 7, 17, 18, 25, 26, 27, 28, 31, 33, 34, 36, 37}
        random_list = [k for k in random_list if k not in no_random]
        print("4: " + str(random_list))
        while True:
            # 随机选择题目
            if not random_list:
                # 随机数序列为空
                return False, company
            question_no = random.choice(random_list)
            if question_no in question_set:
                continue
            elif question_no == 3 and 2 not in question_set:
                # 业务2为业务3前提
                _remove(random_list, 3)
                continue
            elif question_no == 13 and 12 not in question_set:
                # 业务12为业务13前提
                _remove(random_list, 13)
                continue
            elif question_no == 19 and 18 not in question_set:
                # 业务18为业务19前提
                _remove(random_list, 19)
                continue
            elif question_no == 21 and 16 not in question_set:
                # 业务16为业务21前提
                _remove(random_list, 21)
                continue
            elif question_no == 22 and not {17, 18} & question_set:
                # 业务17/18为业务22前提
                _remove(random_list, 22)
                continue
            elif question_no == 24 and 21 not in question_set:
                # 业务21为业务24前提
                _remove(random_list, 24)
                continue
            elif question_no == 25 and not {7, 17, 18} & question_set:
                # 业务7/17/18为业务25前提
                _remove(random_list, 25)
                continue
            elif question_no == 28 and not {5, 8, 9, 15} & question_set:
                # 业务5/8/9/15为业务28前提
                _remove(random_list, 28)
                continue
            elif question_no == 29 and not {6, 10, 11} & question_set:
                # 业务6/10/11为业务29前提
                _remove(random_list, 29)
                continue
            elif question_no == 30 and 15 in question_set:
                # 如果有业务15，则不发生
                _remove(random_list, 30)
                continue
            elif question_no == 33 and 31 not in question_set:
                # 业务31为业务33前提
                _remove(random_list, 33)
                continue
            elif question_no == 34 and 31 not in question_set:
                # 业务31为业务34前提
                _remove(random_list, 34)
                continue
            elif question_no == 35 and {33, 34} & question_set:
                # 业务33/34为业务35前提
                _remove(random_list, 35)
                continue
            else:
                break
    print("5: " + str(random_list))
    company = deal_with_question_2(company=company, question_no=question_no, questions=questions)
    return True, company


def deal_with_question_2(company, question_no, questions):
    """
    2号题库对应题号生成对应业务
    :param company: company document
    :param question_no: question no
    :param questions: question cursor
    :returns
    """
    question, businesses, com_key_element_infos, com_subject_infos, com_assets, business_num, year, month, day = \
        _get_deal_question(company=company, question_no=question_no, questions=questions)

    # deal date--------------------------------------------------------------------------------------
    last_nos = {26, 28, 31, 37}
    last_day = (datetime(year, month + 1, 1) - datetime(year, month, 1)).days

    if question_no in last_nos:
        # 当前月份天数即当月最后一天
        day = last_day
    elif question_no == 27:
        day = random.randint(15, 25)
    elif question_no == 30:
        day = 15
    elif day != 1:
        day *= 2
        day = random.randint(day - 1, day)
    elif business_num == 6 and (question_no == 33 or question_no == 34):
        day = last_day

    date = datetime(year, month, day)
    # deal date end----------------------------------------------------------------------------------

    my_keys = ["content", "business_type", "affect_type", "key_element_infos", "subject_infos"]
    content, business_type, affect_type, key_element_infos, subject_infos = tuple([question[key] for key in my_keys])

    # deal values and content------------------------------------------------------------------------
    index_dict = _get_index_dict(businesses)  # 获取业务索引
    values_list = list()
    if question_no == 1:
        # 第1题特判
        content, business_type, affect_type, values_list = _deal_first_question(content=content, company=company,
                                                                                question=question)
    else:
        values = question.get("values")
        values_len = len(values)
        for i in range(0, values_len):
            value, value_type, is_random, low, high = _get_value_info(value_info=values[i])
            if question_no == 13 and i == 4:
                # 问题13特判
                now_m_value = values_list[1]
                asset_name = values_list[0]
                value, subject_infos = _deal_sell_asset(value=value, com_assets=com_assets, now_m_value=now_m_value,
                                                        subject_infos=subject_infos, asset_name=asset_name, index=i)
            elif question_no == 24 and (i == 2 or i == 3):
                # 问题24特判
                index_tmp = index_dict.get("{}".format(21))
                value_tmp = com_key_element_infos[index_tmp]["info"][0].get("money")
                happened_money = values_list[1]
                content, value = _deal_travel_expenses(content=content, value=value, debit_money=value_tmp,
                                                       happened_money=happened_money, index=i)
            elif value_type == "asset":
                value = _deal_asset_generic(value)
            elif value_type == "num":
                if is_random:
                    # 随机数处理
                    value = random.randrange(low, high, 100)
                if i + 1 < values_len and values[i + 1].get("value_type") == "asset":
                    value = int(value)
                    if value == 1:
                        value = "一"
                if i and question_no != 31 and values[i - 1].get("value_type") == "asset" and \
                        values[i - 1].get("value")[0] == "+":
                    # 公司资产增加处理
                    content = content.replace("+", "")
                    asset_name = values_list[i - 1].replace("+", "")
                    com_assets.append(dict(asset_name=asset_name, market_value=value, question_no=question_no))
                if question_no == 2 and i == 0:
                    value = random.randint(low, high)
                elif question_no == 3:
                    index_tmp = index_dict.get("{}".format(2))
                    value = com_subject_infos[index_tmp][0].get("money")
                    content_tmp = businesses[index_tmp].get("content")
                    rate_tmp = float(re.search(r"[\d.]+%", content_tmp).group(0).replace("%", ""))
                    value *= rate_tmp / 100 / 12  # b2；金额=b2贷款金额*年利率/12
                elif question_no == 13 and i == 3:
                    # 问题13特判
                    for asset in com_assets:
                        if asset.get("asset_name") == values_list[0]:
                            value = abs(values_list[2] - asset.get("market_value"))
                            break
                elif question_no == 14:
                    # 问题14特判
                    value = 10000 * values_list[1]
                elif question_no == 15 and i == 3:
                    # 问题15特判
                    value = 100000 * random.randint(10, 15)
                elif question_no == 19:
                    # 问题19特判
                    index_tmp = index_dict.get("{}".format(18))
                    value = com_key_element_infos[index_tmp]["info"][0].get("money")
                elif question_no == 21:
                    # 问题21特判
                    index_tmp = index_dict.get("{}".format(16))
                    high = com_key_element_infos[index_tmp]["info"][0].get("money")
                    value = random.randrange(1000, high, 100)
                elif question_no == 24:
                    # 问题24特判
                    index_tmp = index_dict.get("{}".format(21))
                    medium = com_key_element_infos[index_tmp]["info"][0].get("money")
                    value = random.randrange(medium - 1000, medium + 1000, 100)
                elif (question_no == 26 or question_no == 27) and (i == 0 or i == 3):
                    # 问题26和27特判
                    if i == 3:
                        values_list.append(round(value, 2))
                        t_sum = sum([values_list[index] for index in [0, 1, 2]])
                        t_sum = round(t_sum, 2)
                        values_list.insert(0, t_sum)
                        # print("value: {}".format(value))
                        # print("t_sum: {}".format(t_sum))
                        # print("values_list: {}".format(values_list))
                        content = content.replace("v{}".format(1), str(t_sum))
                        content = content.replace("v{}".format(4), str(value))
                    continue
                elif question_no == 28:
                    # 问题28特判
                    if i == 0:
                        divisors = [120, 120, 60, 360]
                        question_nos = [5, 8, 9, 15]
                        value = 0
                        k = 0
                        for q in question_nos:
                            index_tmp = index_dict.get("{}".format(q))
                            if not index_tmp:
                                continue
                            value_tmp = com_subject_infos[index_tmp][0].get("money")
                            value_tmp = value_tmp if value_tmp else 0
                            value_tmp /= divisors[k]
                            value += value_tmp
                            k += 1
                    elif i > 0:
                        if i < 3:
                            value = values_list[0] / 3
                        else:
                            value = values_list[0] - values_list[1] - values_list[2]
                elif question_no == 29:
                    # 问题29特判
                    if i == 0:
                        divisor = 60
                        question_nos = [6, 10, 11]
                        value = 0
                        for q in question_nos:
                            index_tmp = index_dict.get("{}".format(q))
                            if not index_tmp:
                                continue
                            value_tmp = com_subject_infos[index_tmp][0].get("money")
                            value_tmp = value_tmp if value_tmp else 0
                            value_tmp /= divisor
                            value += value_tmp
                    elif i > 0:
                        if i < 3:
                            value = values_list[0] / 3
                        else:
                            value = values_list[0] - values_list[1] - values_list[2]
                elif question_no == 31:
                    # 问题31特判
                    content = content.replace("+", "")
                    asset_name = values_list[0].replace("+", "")
                    com_assets.append(dict(asset_name=asset_name, market_value=value, question_no=question_no))
                    value = 0
                    for tmp in [25, 30]:
                        index_tmp = index_dict.get("{}".format(tmp))
                        if not index_tmp:
                            continue
                        value_tmp = com_subject_infos[index_tmp][0].get("money")
                        value += value_tmp if value_tmp else 0
                elif question_no == 36:
                    # 问题36特判
                    index_tmp = index_dict.get("{}".format(26))
                    # print(index_dict)
                    value = com_subject_infos[index_tmp][3].get("money")
                value = float(value) if isinstance(value, int) else value
                value = round(value, 2) if isinstance(value, float) else value
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
    key_element_infos = _deal_key_element_generic(key_element_infos=key_element_infos, values_list=values_list)
    # end---------------------------------------------------------------------------

    # deal subject_infos-----------------------------------------------------------
    subject_infos_len = len(subject_infos)
    for i in range(0, subject_infos_len):
        value_index = subject_infos[i].get("value_index")
        if i and (question_no == 2):
            # 问题2特判
            subject_infos = _deal_bank_loan_subject(content=content, subject_infos=subject_infos, index=i)
        if question_no == 24:
            # 问题24特判
            index_tmp = index_dict.get("{}".format(21))
            debit_money = com_key_element_infos[index_tmp]["info"][0].get("money")
            happened_money = values_list[1]
            money, subject_infos = _deal_travel_subject(content=content, subject_infos=subject_infos,
                                                        debit_money=debit_money, happened_money=happened_money,
                                                        index=i)
            if not money:
                money = values_list[int(value_index) - 1]
        elif value_index[0] != "(":
            money = values_list[int(value_index) - 1]
        else:
            money = _deal_arithmetic(value_index=value_index, values_list=values_list)

        if money:
            subject_infos[i]["money"] = money
        subject_infos[i].pop("value_index")
    # end---------------------------------------------------------------------------

    content = "{}年{}月{}日，".format(year, month, day) + content
    business = dict(questions_no=2, question_no=question_no, content=content, date=date, business_type=business_type)

    _update_company(company=company, affect_type=affect_type, key_element_infos=key_element_infos,
                    businesses=businesses, business=business,
                    com_key_element_infos=com_key_element_infos,
                    com_subject_infos=com_subject_infos, subject_infos=subject_infos,
                    business_num=business_num, com_assets=com_assets)
    return company


def _get_deal_question(company, question_no, questions):
    # 处理业务获取值
    question = questions[question_no - 1]
    my_keys = ["businesses", "key_element_infos", "subject_infos", "com_assets", "business_num"]
    businesses, com_key_element_infos, com_subject_infos, com_assets, business_num = tuple(
        [company[key] for key in my_keys])

    date = datetime.now()
    year = date.year
    month = date.month
    day = business_num + 1

    if business_num >= 10:
        # 第二个会计区间的月份为下一个月
        day = business_num - 9
        if month + 1 <= 12:
            month += 1
        else:
            year += 1
            month = 1

    return question, businesses, com_key_element_infos, com_subject_infos, com_assets, business_num, year, month, day


def _deal_first_question(content, company, question):
    # 第一题特判
    content = content.replace("v1", company.get("com_shareholder")[0])
    num_tmp = company.get("com_regist_cap")
    num_tmp *= float(10000)
    content = content.replace("v2", str(int(num_tmp)))
    business_type = question.get("business_type")
    affect_type = question.get("affect_type")
    values_list = [num_tmp, num_tmp]

    return content, business_type, affect_type, values_list


def _deal_arithmetic(value_index, values_list):
    # 四则运算处理
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
    return money


def _get_index_dict(businesses):
    # 获取对应题号信息索引
    index_dict = dict()
    index_tmp = 0
    for business in businesses:
        question_no = business.get("question_no")
        index_dict["{}".format(question_no)] = index_tmp
        index_tmp += 1
    return index_dict


def _get_value_info(value_info):
    my_keys = ["value", "value_type", "is_random", "low", "high"]
    value, value_type, is_random, low, high = tuple([value_info.get("{}".format(key)) for key in my_keys])
    return value, value_type, is_random, low, high


def _deal_asset_generic(value):
    # 资产信息常规处理
    if value[0] == "*":
        value = value.lstrip("*")
    elif value[0] == "-":
        value = value.lstrip("-")
    return value


def _deal_key_element_generic(key_element_infos, values_list):
    # 要素信息常规处理
    key_element_infos_len = len(key_element_infos)
    for i in range(0, key_element_infos_len):
        value_index = key_element_infos[i].get("value_index")
        if value_index[0] != "(":
            money = values_list[int(value_index) - 1]
        else:
            money = _deal_arithmetic(value_index=value_index, values_list=values_list)
        key_element_infos[i]["money"] = money
        key_element_infos[i].pop("value_index")
    return key_element_infos


def _deal_bank_loan_subject(content, subject_infos, index):
    # 银行贷款科目处理
    year_tmp = int(content[list(ii.start() for ii in re.finditer('年', content))[0] - 1])
    if year_tmp == 1:
        subject_infos[index]["subject"] = subject_infos[index]["subject"].split("/")[0]
    else:
        subject_infos[index]["subject"] = subject_infos[index]["subject"].split("/")[1]
    return subject_infos


def _deal_travel_expenses(content, value, debit_money, happened_money, index):
    # 差旅费处理 about value
    if happened_money > debit_money:
        value = value.split("/")[0]
    elif happened_money < debit_money:
        value = value.split("/")[1]
    elif happened_money == debit_money and index == 2:
        content_tmp = content.split("，")
        content_tmp.pop(-1)
        content = "，".join(content_tmp)
    return content, value


def _deal_travel_subject(content, subject_infos, debit_money, happened_money, index):
    # 差旅费科目处理 about value
    money = None
    if content.find("多于"):
        if index == 0:
            money = debit_money
        elif index == 1:
            money = happened_money
        else:
            subject_infos.append(dict(subject="银行存款", money=debit_money - happened_money, is_up=False))
    elif content.find("少于"):
        if index == 0:
            money = debit_money
        elif index == 1:
            money = debit_money
        else:
            subject_infos.append(dict(subject="银行存款",
                                      money=abs(debit_money - happened_money),
                                      is_up=False))
    return money, subject_infos


def _deal_sell_asset(value, com_assets, now_m_value, subject_infos, asset_name, index):
    # 资产出售处理（收益/亏损 ）about value
    value_tmp = 0
    for asset in com_assets:
        if asset.get("asset_name") == asset_name:
            value_tmp = now_m_value - asset.get("market_value")
            break
    if now_m_value >= value_tmp:
        value = value.split("/")[0]
    else:
        value = value.split("/")[1]
        # 收益为负
        subject_infos[index]["is_up"] = False
    return value, subject_infos


def _update_company(company, affect_type, key_element_infos, businesses, business, com_key_element_infos,
                    com_subject_infos, subject_infos, business_num, com_assets):
    key_element_infos_dict = dict(affect_type=affect_type, info=key_element_infos)

    businesses.append(business)
    com_key_element_infos.append(key_element_infos_dict)
    com_subject_infos.append(subject_infos)
    business_num += 1

    company.update(dict(businesses=businesses,
                        com_assets=com_assets,
                        business_num=business_num,
                        key_element_infos=com_key_element_infos,
                        subject_infos=com_subject_infos))


def _remove(t_list, value):
    # list.remove(value)，捕获`若list不存在value，ValueError`异常
    try:
        t_list.remove(value)
    except ValueError:
        pass
