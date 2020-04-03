#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/3/16 11:12
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : create_profit_statement.py
# @Software: PyCharm
# from accoj.extensions import mongo

profit_statement_infos = dict()


def create_profit_statement(company):
    """
    创建利润表答案
    :return:
    """
    profit_statement_infos.clear()
    involve_list = ["营业收入", "营业成本", "税金及附加", "销售费用", "管理费用", "财务费用", "资产减值损失", "公允价值变动损益",
                    "投资收益", "营业利润", "营业外收入", "对联营企业和合营企业的投资收益", "营业外支出", "非流动资产处置损失",
                    "利润总额", "所得税费用", "净利润"]
    for i in range(0, len(involve_list)):
        subject = involve_list[i]
        profit_statement_infos[subject] = {"period_end": 0, "period_last": 0}
    cal_profit_statement(company)
    print("profit statement has been created!")


def cal_sum_formula(sheet_infos, list_infos, sheets_len, borrow_or_lend, period, subject_name):
    t_sum = 0
    if borrow_or_lend:
        key_name = "borrow_2"
    else:
        key_name = "lend_2"
    for i in range(0, sheets_len):
        sheet_info = sheet_infos[i]
        subject = sheet_info["subject"]
        if subject in list_infos:
            t_sum += sheet_info[key_name]
    # 将结果存入
    t_sum = round(t_sum, 2)
    profit_statement_infos[subject_name][period] = t_sum
    return t_sum


def cal_formula(sheet_infos, list_infos, sheets_len, period, borrow_lend):
    t_sum = 0
    if borrow_lend:
        key_name = "borrow_2"
    else:
        key_name = "lend_2"
    for i in range(0, sheets_len):
        sheet_info = sheet_infos[i]
        subject = sheet_info["subject"]
        if subject in list_infos:
            money = sheet_info[key_name]
            t_sum = round(money + t_sum, 2)
            profit_statement_infos[subject][period] = money
    return t_sum


def cal_profit_statement(company):
    # _id = company.get("_id")
    # 计算营业收入  主营业务收入 其他业务收入
    balance_sheet_infos = company.get("balance_sheet_infos")
    balance_sheet_infos_1 = balance_sheet_infos.get("accounting_period_1")
    len_sheet_1 = len(balance_sheet_infos_1)
    balance_sheet_infos_2 = balance_sheet_infos.get("accounting_period_2")
    len_sheet_2 = len(balance_sheet_infos_2)

    profits = ["主营业务收入", "其他业务收入"]
    # 计算每期的营业收入
    operate_income_last = cal_sum_formula(balance_sheet_infos_1, profits, len_sheet_1, borrow_or_lend=False,
                                          period="period_last", subject_name="营业收入")
    operate_income_end = cal_sum_formula(balance_sheet_infos_2, profits, len_sheet_2, borrow_or_lend=False,
                                         period="period_end", subject_name="营业收入")

    # 计算营业成本 主营业务成本  其他业务成本
    main_cost_list = ["主营业务成本", "其他业务成本"]
    main_cost_last = cal_sum_formula(balance_sheet_infos_1, main_cost_list, len_sheet_1, borrow_or_lend=True,
                                     period="period_last", subject_name="营业成本")
    main_cost_end = cal_sum_formula(balance_sheet_infos_2, main_cost_list, len_sheet_2, borrow_or_lend=True,
                                    period="period_end", subject_name="营业成本")

    # 营业收入减去的相关费用
    a_lists = ["销售费用", "管理费用", "财务费用"]
    expenses_last_sum = cal_formula(balance_sheet_infos_1, a_lists, len_sheet_1, period="period_last", borrow_lend=True)
    expenses_end_sum = cal_formula(balance_sheet_infos_2, a_lists, len_sheet_2, period="period_end", borrow_lend=True)

    # 计算投资收益
    b_lists = ["投资收益"]
    invest_income_last = cal_formula(balance_sheet_infos_1, b_lists, len_sheet_1, period="period_last",
                                     borrow_lend=False)
    invest_income_end = cal_formula(balance_sheet_infos_2, b_lists, len_sheet_2, period="period_end", borrow_lend=False)
    invest_income_last -= cal_formula(balance_sheet_infos_1, b_lists, len_sheet_1, period="period_last",
                                      borrow_lend=True)
    invest_income_end -= cal_formula(balance_sheet_infos_2, b_lists, len_sheet_2, period="period_end", borrow_lend=True)

    # 计算营业利润
    operate_profit_last = round(operate_income_last + invest_income_last - expenses_last_sum - main_cost_last, 2)
    operate_profit_end = round(operate_income_end + invest_income_end - expenses_end_sum - main_cost_end, 2)
    profit_statement_infos["营业利润"]["period_last"] = operate_profit_last
    profit_statement_infos["营业利润"]["period_end"] = operate_profit_end

    # 计算营业外收入 和 支出
    c_list = ["营业外收入"]
    out_income_last = cal_formula(balance_sheet_infos_1, c_list, len_sheet_1, period="period_last", borrow_lend=False)
    out_income_end = cal_formula(balance_sheet_infos_2, c_list, len_sheet_2, period="period_end", borrow_lend=False)

    d_list = ["营业外支出"]
    out_outcome_last = cal_formula(balance_sheet_infos_1, d_list, len_sheet_1, period="period_last", borrow_lend=True)
    out_outcome_end = cal_formula(balance_sheet_infos_2, d_list, len_sheet_2, period="period_end", borrow_lend=True)

    # 利润总额
    total_last = round(operate_profit_last + out_income_last - out_outcome_last, 2)
    total_end = round(operate_profit_end + out_income_end - out_outcome_end, 2)
    profit_statement_infos["利润总额"]["period_last"] = total_last
    profit_statement_infos["利润总额"]["period_end"] = total_end

    # 净利润
    net_profit_last = total_last
    net_profit_end = total_end
    profit_statement_infos["净利润"]["period_last"] = net_profit_last
    profit_statement_infos["净利润"]["period_end"] = net_profit_end

    # 存入数据库
    # mongo.db.company.update({"_id": _id}, {"$set": {"profit_statement_infos": profit_statement_infos}})
    company.update({"profit_statement_infos": profit_statement_infos})
