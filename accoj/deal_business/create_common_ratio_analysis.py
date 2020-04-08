#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/3/16 11:13
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : create_common_ratio_analysis.py
# @Software: PyCharm
# from accoj.extensions import mongo

assets = {"货币资金", "交易性金融资产", "应收票据", "应收账款", "预付账款", "应收利息", "应收股利", "其他应收款",
          "存货", "一年内到期的非流动资产", "其他流动资产", "流动资产合计", "可供售出金融资产", "持有至到期投资",
          "长期待摊费用", "长期应收款", "长期股权投资", "投资性房地产", "工程物资", "固定资产清理", "开发支出",
          "递延所得税资产", "其他非流动资产", "固定资产", "在建工程", "无形资产", "非流动资产合计", "资产总计"}

liabilities_owners_equities = {"短期借款", "交易性金融负债", "应付票据", "应付账款", "预收账款", "应付职工薪酬", "应交税费", "应付利息",
                               "应付股利", "其他应付款", "一年内到期的非流动负债", "其他流动负债", "流动负债合计", "长期借款", "应付债券",
                               "长期应付款", "预计负债", "递延所得税负债", "其他非流动负债", "负债合计", "实收资本", "资本公积", "盈余公积",
                               "未分配利润", "所有者权益合计", "负债及所有者权益总计"}

new_balance_sheet_infos_in = dict()
profit_statement_infos_in = dict()


def create_common_ratio_analysis(company):
    """
    创建共同比分析法答案
    :return:
    """
    cal_new_balance_sheet_infos(company)
    cal_profit_statement_infos(company)
    print("common ratio infos have been created!")


def cal_new_balance_sheet_infos(company):
    new_balance_sheet_infos = company.get("new_balance_sheet_infos")
    assets_sum = new_balance_sheet_infos.get("资产总计")
    debt_owners_sum = new_balance_sheet_infos.get("负债及所有者权益总计")
    # 获取本期或者上期相关的资金
    assets_sum_last = float(assets_sum.get("period_last"))
    assets_sum_end = float(assets_sum.get("period_end"))
    debt_owners_sum_last = float(debt_owners_sum.get("period_last"))
    debt_owners_sum_end = float(debt_owners_sum.get("period_end"))
    subjects = list(new_balance_sheet_infos.keys())
    for subject in subjects:
        new_balance_sheet_info = new_balance_sheet_infos.get(subject)
        money_last = new_balance_sheet_info.get("period_last")
        money_end = new_balance_sheet_info.get("period_end")
        if subject in assets:
            rate_last = round((money_last / assets_sum_last)*100, 2)
            rate_end = round((money_end / assets_sum_end)*100, 2)
            new_balance_sheet_infos_in[subject] = {"period_end": rate_end, "period_last": rate_last}
        elif subject in liabilities_owners_equities:
            rate_last = round((money_last / debt_owners_sum_last)*100, 2)
            rate_end = round((money_end / debt_owners_sum_end)*100, 2)
            new_balance_sheet_infos_in[subject] = {"period_end": rate_end, "period_last": rate_last}
        else:
            pass
    new_balance_sheet_infos_in["conclusion"] = None


def cal_profit_statement_infos(company):
    profit_statement_infos = company.get("profit_statement_infos")
    income_sum = profit_statement_infos.get("营业收入")
    # 暂用
    # income_sum_end = 100
    # income_sum_last = 100
    income_sum_end = float(income_sum.get("period_end"))
    income_sum_last = float(income_sum.get("period_last"))
    subjects = list(profit_statement_infos.keys())
    for subject in subjects:
        profit_statement_info = profit_statement_infos.get(subject)
        money_end = float(profit_statement_info.get("period_end"))
        money_last = float(profit_statement_info.get("period_last"))
        if income_sum_end == 0:
            rate_end = None
        else:
            rate_end = round((money_end / income_sum_end)*100, 2)
        if income_sum_last == 0:
            rate_last = None
        else:
            rate_last = round((money_last / income_sum_last)*100, 2)
        profit_statement_infos_in[subject] = {"period_end": rate_end, "period_last": rate_last}
    profit_statement_infos_in["conclusion"] = None
    common_ratio_analysis_infos = {"new_balance_sheet_infos": new_balance_sheet_infos_in,
                                   "profit_statement_infos" : profit_statement_infos_in}
    # _id = company.get("_id")
    # 存入数据库
    # mongo.db.company.update({"_id": _id}, {"$set": {"common_ratio_analysis_infos": common_ratio_analysis_infos}})
    company.update({"common_ratio_analysis_infos": common_ratio_analysis_infos})
