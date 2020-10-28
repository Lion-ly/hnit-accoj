#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/3/16 11:15
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : create_dupont_analysis.py
# @Software: PyCharm
# from accoj.extensions import mongo



def create_dupont_analysis(company):
    """
    创建杜邦分析法答案
    :return:
    """
    cal_dupont_analysis(company)
    print("dupont_analysis_infos has been created!")


def cal_dupont_analysis(company):
    # 获取资产负债表 和 利润表 比率分析表
    new_balance_sheet_infos = company.get("new_balance_sheet_infos")
    profit_statement_infos = company.get("profit_statement_infos")

    # 获取相关比值
    dupont_analysis_infos = company.get("dupont_analysis_infos")

    # 获取相关值
    net_profit = profit_statement_infos.get("净利润").get("period_end")
    operate_income = profit_statement_infos.get("营业收入").get("period_end")
    operate_profit = profit_statement_infos.get("营业利润").get("period_end")
    profit_sum = profit_statement_infos.get("利润总额").get("period_end")
    owe_tax = profit_statement_infos.get("所得税费用").get("period_end")
    assets_sum = new_balance_sheet_infos.get("资产总计").get("period_end")
    long_term_assets = new_balance_sheet_infos.get("非流动资产合计").get("period_end")
    current_assets = new_balance_sheet_infos.get("流动资产合计").get("period_end")

    all_cost = operate_income - operate_profit
    other_profit = operate_profit - profit_sum

    dupont_analysis_infos["净利润"] = net_profit
    dupont_analysis_infos["营业收入"] = operate_income
    dupont_analysis_infos["资产总计"] = assets_sum

    dupont_analysis_infos["全部成本"] = all_cost
    dupont_analysis_infos["其他利润"] = other_profit
    dupont_analysis_infos["所得税"] = owe_tax

    dupont_analysis_infos["流动资产合计"] = current_assets
    dupont_analysis_infos["非流动资产合计"] = long_term_assets

    company.update({"dupont_analysis_infos": dupont_analysis_infos})
