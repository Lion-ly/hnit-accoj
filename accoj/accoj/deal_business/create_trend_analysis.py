#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/3/16 11:13
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : create_trend_analysis.py
# @Software: PyCharm
# from accoj.extensions import mongo

new_balance_sheet_infos_in = dict()
profit_statement_infos_in = dict()


def create_trend_analysis(company):
    """
    创建趋势分析法答案
    :return:
    """
    cal_balance_trend_analysis(company)
    cal_profit_trend_analysis(company)
    print("trend analysis has been created!")


# 计算资产趋势分析
def cal_balance_trend_analysis(company):
    new_balance_sheet_infos = company.get("new_balance_sheet_infos")
    subjects = list(new_balance_sheet_infos.keys())
    for subject in subjects:
        new_balance_sheet_info = new_balance_sheet_infos[subject]
        period_end = new_balance_sheet_info.get("period_end")
        period_last = new_balance_sheet_info.get("period_last")
        # 如果本期为0  None 不存在
        if period_end == 0:
            new_balance_sheet_infos_in[subject] = {"period_end": None, "period_last": None}
        else:
            mount_money = round(period_end - period_last, 2)
            if period_last <= 0:
                new_balance_sheet_infos_in[subject] = {"period_end": mount_money, "period_last": None}
            else:
                mount_rate = round((mount_money / period_last)*100, 2)
                new_balance_sheet_infos_in[subject] = {"period_end": mount_money, "period_last": mount_rate}

    new_balance_sheet_infos_in["conclusion"] = {}


# 计算利润趋势分析
def cal_profit_trend_analysis(company):
    profit_statement_infos = company.get("profit_statement_infos")
    subjects = list(profit_statement_infos.keys())
    for subject in subjects:
        profit_statement_info = profit_statement_infos[subject]
        period_end = profit_statement_info.get("period_end")
        period_last = profit_statement_info.get("period_last")
        if period_end == 0:
            profit_statement_infos_in[subject] = {"period_end": None, "period_last": None}
        else:
            mount_money = round(period_end - period_last, 2)
            if period_last <= 0:
                profit_statement_infos_in[subject] = {"period_end": mount_money, "period_last": None}
            else:
                mount_rate = round((mount_money / period_last)*100, 2)
                profit_statement_infos_in[subject] = {"period_end": mount_money, "period_last": mount_rate}
    other_lists = ["其他综合收益的税后净额", "以后不能重分类净损益的其他综合收益", "以后将重分类净损益的其他综合收益",
                   "综合收益总额", "每股收益", "基本每股收益", "稀释每股收益"]
    for subject_None in other_lists:
        profit_statement_infos_in[subject_None] = {"period_end": 0, "period_last": 0}
    profit_statement_infos_in["conclusion"] = {}

    trend_analysis_infos = {"new_balance_sheet_infos": new_balance_sheet_infos_in,
                            "profit_statement_infos" : profit_statement_infos_in}
    # _id = company.get("_id")
    # 存入数据库
    # mongo.db.company.update({"_id": _id}, {"$set": {"trend_analysis_infos": trend_analysis_infos}})
    company.update({"trend_analysis_infos": trend_analysis_infos})