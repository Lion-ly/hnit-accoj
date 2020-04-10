#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/3/16 11:14
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : create_ratio_analysis.py
# @Software: PyCharm
# from accoj.extensions import mongo

ratio_analysis_infos = dict()
dupont_infos = dict()

involve_list = ["流动比率", "速动比率", "现金比率", "资产负债率", "产权比率", "销售毛利率", "营业利润率",
                "成本费用营业利润率", "净利润率", "净资产收益率", "流动资产周转率", "应收账款周转率",
                "存货周转率", "固定资产周转率", "总资产周转率", "固定资产增长率", "总资产增长率",
                "资本积累率", "净利润增长率", "营业收入增长率"]


def create_dict_keys():
    for subject in involve_list:
        ratio_analysis_infos[subject] = {}


def cal_rate(a, b, subject, period):
    if b == 0:
        ratio_analysis_infos[subject][period] = None
    else:
        rate = round((a / b)*100, 2)
        ratio_analysis_infos[subject][period] = rate

def cal_rate_dupont(a, b, subject):
    rate = round((a / b)*100, 2)
    dupont_infos[subject] = rate


def create_ratio_analysis(company):
    """
    创建比率分析法答案
    :return:
    """
    create_dict_keys()
    cal_ratio_analysis(company)
    print("ratio analysis has been created!")


def cal_ratio_analysis(company):
    # 获取资产负债表 和 利润表
    new_balance_sheet_infos = company.get("new_balance_sheet_infos")
    profit_statement_infos = company.get("profit_statement_infos")

    def get_subject_last_end(t_subject):
        t_subject_infos = new_balance_sheet_infos.get(t_subject)
        subject_info_last = t_subject_infos.get("period_last")
        subject_info_end = t_subject_infos.get("period_end")
        return subject_info_end, subject_info_last

    def get_subject_last_end_1(t_subject):
        t_subject_infos = profit_statement_infos.get(t_subject)
        subject_info_last = t_subject_infos.get("period_last")
        subject_info_end = t_subject_infos.get("period_end")
        return subject_info_end, subject_info_last

    current_assset_end, current_assset_last = get_subject_last_end("流动资产合计")
    current_debts_end, current_debts_last = get_subject_last_end("流动负债合计")
    quick_move_assets_last = current_assset_last
    quick_move_assets_end = current_assset_end
    current_money_end, current_money_last = get_subject_last_end("货币资金")
    trade_finacial_assets_end, trade_finacial_assets_last = get_subject_last_end("交易性金融资产")
    need_receive_end, need_receive_last = get_subject_last_end("应收账款")
    need_receive_document_end, need_receive_document_last = get_subject_last_end("应收票据")
    stock_end, stock_last = get_subject_last_end("存货")
    fix_assets_end, fix_assets_last = get_subject_last_end("固定资产")
    assets_sum_end, assets_sum_last = get_subject_last_end("资产总计")
    debt_sum_end, debt_sum_last = get_subject_last_end("负债合计")
    owners_sum_end, owners_sum_last = get_subject_last_end("所有者权益合计")

    # 计算流动比率 = 流动资产/流动负债
    cal_rate(current_assset_last, current_debts_last, "流动比率", "period_last")
    cal_rate(current_assset_end, current_debts_end, "流动比率", "period_end")

    # 计算速动比率
    remove_lists = ["存货", "一年内到期的非流动资产", "其他流动资产"]
    for subject in remove_lists:
        subject_infos = new_balance_sheet_infos.get(subject)
        money_last = subject_infos.get("period_last")
        money_end = subject_infos.get("period_end")
        quick_move_assets_last -= money_last
        quick_move_assets_end -= money_end

    cal_rate(quick_move_assets_last, current_debts_last, "速动比率", "period_last")
    cal_rate(quick_move_assets_end, current_debts_end, "速动比率", "period_end")

    # 计算现金比率  [货币资金 金融资产]
    cash_and_fincial_last = current_money_last + trade_finacial_assets_last
    cash_and_fincial_end = current_money_end + trade_finacial_assets_end
    cal_rate(cash_and_fincial_last, current_debts_last, "现金比率", "period_last")
    cal_rate(cash_and_fincial_end, current_debts_end, "现金比率", "period_end")

    # 计算资产负债率  负债/资产
    cal_rate(debt_sum_last, assets_sum_last, "资产负债率", "period_last")
    cal_rate(debt_sum_end, assets_sum_end, "资产负债率", "period_end")

    # 计算产权比率  负债总额/所有者权益总额
    cal_rate(debt_sum_last, owners_sum_last, "产权比率", "period_last")
    cal_rate(debt_sum_end, owners_sum_end, "产权比率", "period_end")

    # ---------计算营运能力------
    operate_income_end, operate_income_last = get_subject_last_end_1("营业收入")
    operate_profit_end, operate_profit_last = get_subject_last_end_1("营业利润")
    operate_cost_end, operate_cost_last = get_subject_last_end_1("营业成本")
    net_profit_end, net_profit_last = get_subject_last_end_1("净利润")

    # 计算销售毛利率 =  （营业收入-营业成本）/营业收入×100%
    sell_sum_profit_last = (operate_income_last - operate_cost_last)
    sell_sum_profit_end = (operate_income_end - operate_cost_end)
    cal_rate(sell_sum_profit_last, operate_income_last, "销售毛利率", "period_last")
    cal_rate(sell_sum_profit_end, operate_income_end, "销售毛利率", "period_end")

    # 计算营业利润率 = 营业利润/营业收入
    cal_rate(operate_profit_last, operate_income_last, "营业利润率", "period_last")
    cal_rate(operate_profit_end, operate_income_end, "营业利润率", "period_end")

    # 成本费用营业利润率 = 营业利润/成本费用总额     主营业务成本、主营业务税金及附加和三项期间费用
    # 计算成本费用总额
    cost_and_expenses_sum_list = ["营业成本", "税金及附加", "销售费用", "管理费用", "财务费用", "资产减值损失"]
    cost_and_expenses_sum_end = 0
    cost_and_expenses_sum_last = 0
    for subject in cost_and_expenses_sum_list:
        subject_infos = profit_statement_infos.get(subject)
        cost_and_expenses_sum_last += subject_infos.get("period_last")
        cost_and_expenses_sum_end += subject_infos.get("period_end")
    cal_rate(operate_profit_last, cost_and_expenses_sum_last, "成本费用营业利润率", "period_last")
    cal_rate(operate_profit_end, cost_and_expenses_sum_end, "成本费用营业利润率", "period_end")

    # 计算净利润率  [[净利润]]÷[[主营业务收入]]
    cal_rate(net_profit_last, operate_income_last, "净利润率", "period_last")
    cal_rate(net_profit_end, operate_income_end, "净利润率", "period_end")

    # 计算净资产收益率 净利润/净资产   净资产=资产-负债
    net_assets_last = assets_sum_last - debt_sum_last
    net_assets_end = assets_sum_end - debt_sum_end
    cal_rate(net_profit_last, net_assets_last, "净资产收益率", "period_last")
    cal_rate(net_profit_end, net_assets_end, "净资产收益率", "period_end")

    # 流动资产周转率  营业收入/流动资产合计
    cal_rate(operate_income_last, current_assset_last, "流动资产周转率", "period_last")
    cal_rate(operate_income_end, current_assset_end, "流动资产周转率", "period_end")

    # 应收账款周转率 = 销售收入 / [应收账款 应收票据]
    need_receive_sum_last = need_receive_last + need_receive_document_last
    need_receive_sum_end = need_receive_end + need_receive_document_end
    cal_rate(operate_income_last, need_receive_sum_last, "应收账款周转率", "period_last")
    cal_rate(operate_income_end, need_receive_sum_end, "应收账款周转率", "period_end")

    # 存货周转率 营业收入/存货
    cal_rate(operate_income_last, stock_last, "存货周转率", "period_last")
    cal_rate(operate_income_end, stock_end, "存货周转率", "period_end")

    # 固定资产周转率   固定资产利用率＝营业收入/固定资产
    cal_rate(operate_income_last, fix_assets_last, "固定资产周转率", "period_last")
    cal_rate(operate_income_end, fix_assets_end, "固定资产周转率", "period_end")

    # 总资产周转率 	销售收入总额 / 资产总计
    cal_rate(operate_income_last, assets_sum_last, "总资产周转率", "period_last")
    cal_rate(operate_income_end, assets_sum_end, "总资产周转率", "period_end")

    # 固定资产增长率 固定资产增长率 =（期末固定资产总值—期初固定资产总值）/期初固定资产总值×100%
    fixed_period_2 = fix_assets_end - fix_assets_last
    cal_rate(0, 0, "固定资产增长率", "period_last")
    cal_rate(fixed_period_2, fix_assets_last, "固定资产增长率", "period_end")

    # 总资产增长率 本年总资产增长额/年初资产总额×100%   本年总资产增长额＝年末资产总额-年初资产总额
    this_year_assets_end = assets_sum_end - assets_sum_last
    cal_rate(0, 0, "总资产增长率", "period_last")
    cal_rate(this_year_assets_end, assets_sum_last, "总资产增长率", "period_end")

    # 资本积累率 　资本积累率＝本年所有者权益增长额÷年初所有者权益×100%
    this_year_owner_up_end = owners_sum_end - owners_sum_last
    cal_rate(0, 0, "资本积累率", "period_last")
    cal_rate(this_year_owner_up_end, owners_sum_last, "资本积累率", "period_end")

    # 净利润增长率  　　净利润增长率=(本期净利润额－上期净利润额)/上期净利润额×100%
    this_year_net_profit_up_end = net_profit_end - net_profit_last
    cal_rate(0, 0, "净利润增长率", "period_last")
    cal_rate(this_year_net_profit_up_end, net_profit_last, "净利润增长率", "period_end")

    # 营业收入增长率 本年主营业务收入增长额÷上年主营业务收入总额×100%
    this_year_operate_income_up_end = operate_income_end - operate_income_last
    cal_rate(0, 0, "营业收入增长率", "period_last")
    cal_rate(this_year_operate_income_up_end, operate_income_last, "营业收入增长率", "period_end")


    # 计算净资产收益率
    cal_rate_dupont(net_profit_end, net_assets_end, "净资产收益率")
    # 计算总资产净利率  =净利润/资产总额×100%
    cal_rate_dupont(net_profit_end, assets_sum_end, "总资产净利率")
    # 计算权益乘数 权益乘数=资产总额/股东权益总额
    cal_rate_dupont(assets_sum_end, owners_sum_end, "权益乘数")
    # 计算销售净利率 销售净利率=(净利润/销售收入)×100%
    cal_rate_dupont(net_profit_end, operate_income_end, "销售净利率")
    # 计算总资产周转率
    cal_rate_dupont(operate_income_end, assets_sum_end, "总资产周转率")

    company.update({"ratio_analysis_infos": ratio_analysis_infos})
    company.update({"dupont_analysis_infos":dupont_infos})
