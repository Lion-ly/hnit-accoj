#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/2/20 12:29
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py
# @Software: PyCharm
from flask import session
from accoj.extensions import mongo
import time

from accoj.deal_business.create_entry import create_entry  # 分录
from accoj.deal_business.create_ledger import create_ledger  # 账户
from accoj.deal_business.create_balance_sheet import create_balance_sheet  # 平衡表
from accoj.deal_business.create_acc_document import create_acc_document  # 会计凭证
from accoj.deal_business.create_subsidiary_account import create_subsidiary_account  # 明细账
from accoj.deal_business.create_acc_balance_sheet import create_acc_balance_sheet  # 科目余额表
from accoj.deal_business.create_new_balance_sheet import create_new_balance_sheet  # 资产负债表
from accoj.deal_business.create_profit_statement import create_profit_statement  # 利润表
from accoj.deal_business.create_trend_analysis import create_trend_analysis  # 趋势分析法
from accoj.deal_business.create_common_ratio_analysis import create_common_ratio_analysis  # 共同比分析法
from accoj.deal_business.create_ratio_analysis import create_ratio_analysis  # 比率分析法
from accoj.deal_business.create_dupont_analysis import create_dupont_analysis  # 杜邦分析法


def cal_answer():
    start_time = time.time()
    username = session.get("username")
    company = mongo.db.company.find_one({"student_no": "{}_cp".format(username)},
                                        dict(subject_infos=1, student_no=1))
    if not company:
        return False
    create_entry(company)   # 1.分录
    create_ledger(company)  # 2.账户
    create_balance_sheet(company)   # 3.平衡表
    create_acc_document(company)    # 4.会计凭证
    create_subsidiary_account(company)  # 5.明细账
    create_acc_balance_sheet(company)   # 6.科目余额表
    create_new_balance_sheet(company)   # 7.资产负债表
    create_profit_statement(company)    # 8.利润表
    create_trend_analysis(company)      # 9.趋势分析法
    create_common_ratio_analysis(company)   # 10.共同比分析法
    create_ratio_analysis(company)          # 11.比率分析法
    create_dupont_analysis(company)         # 12.杜邦分析法

    _id = company.get("_id")
    company.pop("_id")

    mongo.db.company.update({"_id": _id}, {"$set": company})
    print("写入答案耗时 {} s".format(time.time() - start_time))
