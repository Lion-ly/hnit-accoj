#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/4/2 12:06
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py.py
# @Software: PyCharm
from accoj.extensions import mongo
from flask import session

TotalScore = [9, 10, 10, 10, 9, 10, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 9, 9, 10, 10, 10, 10, 10, 10, 13.5, 13.5,
              13.5, 13.5, 10, 10, 9, 10, 10, 10, 10, 10, 0]


def get_question_no(businesses):
    """
    获取对应业务号的问题编号
    :param businesses:
    :return:
    """
    indexes = list()
    for business in businesses:
        question_no = business.get("question_no")
        indexes.append(question_no)
    return indexes


def get_company(infos_name):
    t_company = None
    company_cp = None
    username = session.get("username")
    companies = mongo.db.company.find({"student_no": {"$regex": r"^{}".format(username)}},
                                      {"student_no": 1, "{}_infos".format(infos_name): 1, "businesses": 1})
    for company in companies:
        if company.get("student_no").endswith("_cp"):
            company_cp = company
        else:
            t_company = company
    company = t_company if t_company else None
    company_cp = company_cp if company_cp else None
    return company, company_cp
