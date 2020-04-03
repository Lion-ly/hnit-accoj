#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/3/16 11:11
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : create_new_balance_sheet.py
# @Software: PyCharm
# from accoj.extensions import mongo

# 以下是直接从科目余额汇总表填写，其余进行特判
current_assets = {"交易性金融资产", "应收利息", "应收股利", "其他应收款", "其他流动资产", "应收票据", "应收账款", "长期待摊费用"}
non_current_assets = {"可供售出金融资产", "长期应收款", "长期股权投资", "投资性房地产", "工程物资", "固定资产清理", "开发支出",
                      "递延所得税资产", "其他非流动资产"}
current_liabilities = {"短期借款", "交易性金融负债", "应付票据", "应付职工薪酬", "应交税费", "应付利息", "应付股利", "其他应付款", "其他流动负债"}
non_current_liabilities = {"应付债券", "长期应付款", "预计负债", "递延所得税负债", "其他非流动负债", "长期借款"}
owners_equities = {"实收资本", "资本公积", "盈余公积", "本年利润"}


def left_size_formula(sheet_infos, len_sheets, cal_list):
    last = 0
    end = 0
    for i in range(0, len_sheets):
        acc_balance_sheet_info = sheet_infos[i]
        if acc_balance_sheet_info["subject"] in cal_list:
            last += acc_balance_sheet_info["borrow_1"]
            end += acc_balance_sheet_info["borrow_3"]
    return round(last, 2), round(end, 2)


def right_size_formula(sheet_infos, len_sheets, cal_list):
    last = 0
    end = 0
    for i in range(0, len_sheets):
        acc_balance_sheet_info = sheet_infos[i]
        if acc_balance_sheet_info["subject"] in cal_list:
            last += acc_balance_sheet_info["lend_1"]
            end += acc_balance_sheet_info["lend_3"]
    return round(last, 2), round(end, 2)


def create_new_balance_sheet(company):
    """
    创建资产负债表答案
    :return:
    """
    cal_new_balance_sheet(company)
    print("new balance sheet has been created!")


def cal_new_balance_sheet(company):
    # _id = company.get("_id")
    acc_balance_sheet_infos = company.get("acc_balance_sheet_infos")
    acc_balance_sheet_infos_len = len(acc_balance_sheet_infos)
    new_balance_sheet_infos = dict()
    # 获取第二期
    # 计算流动资产，并保存,将流动资产期初期末值合计
    current_assets_last_sum = 0
    current_assets_end_sum = 0
    # 计算货币资金
    bank_and_cash_list = ["库存现金", "银行存款", "其他货币资金"]
    bank_and_cash_last, bank_and_cash_end = left_size_formula(acc_balance_sheet_infos, acc_balance_sheet_infos_len,
                                                              bank_and_cash_list)
    new_balance_sheet_infos["货币资金"] = {"period_end": bank_and_cash_end, "period_last": bank_and_cash_last}
    current_assets_last_sum += bank_and_cash_last
    current_assets_end_sum += bank_and_cash_end

    # 计算预付账款
    advance_list = ["预付账款", "应付账款"]
    advance_money_last, advance_money_end = left_size_formula(acc_balance_sheet_infos, acc_balance_sheet_infos_len,
                                                              advance_list)
    new_balance_sheet_infos["预付账款"] = {"period_end": advance_money_end, "period_last": advance_money_last}
    current_assets_last_sum += advance_money_last
    current_assets_end_sum += advance_money_end

    # 计算存货  未考虑减值准备
    inventory_list = ["原材料", "周转材料", "生产成本", "库存商品"]
    inventory_last, inventory_end = left_size_formula(acc_balance_sheet_infos, acc_balance_sheet_infos_len,
                                                      inventory_list)
    new_balance_sheet_infos["存货"] = {"period_end": inventory_end, "period_last": inventory_last}
    current_assets_last_sum += inventory_last
    current_assets_end_sum += inventory_end

    # 一年内到期非流动资产  持有至到期投资 暂时未计算
    new_balance_sheet_infos["一年内到期的非流动资产"] = {"period_end": 0, "period_last": 0}

    # 通用计算
    current_assets_cp = list(current_assets.copy())
    for i in range(0, acc_balance_sheet_infos_len):
        acc_balance_sheet_info = acc_balance_sheet_infos[i]
        subject = acc_balance_sheet_info["subject"]
        if subject in current_assets_cp:
            last = acc_balance_sheet_info["borrow_1"]
            end = acc_balance_sheet_info["borrow_3"]
            current_assets_last_sum += last
            current_assets_end_sum += end
            new_balance_sheet_infos[subject] = {"period_end": end, "period_last": last}
            current_assets_cp.remove(subject)
    # 未在明细表中的将其值定0
    len_current_assets_cp = len(current_assets_cp)
    if len_current_assets_cp > 0:
        for j in range(0, len_current_assets_cp):
            subject_left = current_assets_cp[j]
            new_balance_sheet_infos[subject_left] = {"period_end": 0, "period_last": 0}
    # 流动资产合计
    current_assets_end_sum = round(current_assets_end_sum, 2)
    current_assets_last_sum = round(current_assets_last_sum, 2)
    new_balance_sheet_infos["流动资产合计"] = {"period_end": current_assets_end_sum, "period_last": current_assets_last_sum}

    # 计算非流动资产
    non_current_assets_last_sum = 0
    non_current_assets_end_sum = 0
    # 将 持有至到期投资 长期待摊费用 在建工程记 0
    new_balance_sheet_infos["持有至到期投资"] = {"period_end": 0, "period_last": 0}
    new_balance_sheet_infos["长期待摊费用"] = {"period_end": 0, "period_last": 0}
    new_balance_sheet_infos["在建工程"] = {"period_end": 0, "period_last": 0}

    # 计算固定资产  -= 累计折旧
    fixed_assets_last = 0
    fixed_assets_end = 0
    for i in range(0, acc_balance_sheet_infos_len):
        acc_balance_sheet_info = acc_balance_sheet_infos[i]
        if acc_balance_sheet_info["subject"] == "固定资产":
            fixed_assets_last += acc_balance_sheet_info["borrow_1"]
            fixed_assets_end += acc_balance_sheet_info["borrow_3"]
        if acc_balance_sheet_info["subject"] == "累计折旧":
            fixed_assets_last -= acc_balance_sheet_info["lend_1"]
            fixed_assets_end -= acc_balance_sheet_info["lend_3"]
    fixed_assets_last = round(fixed_assets_last, 2)
    fixed_assets_end = round(fixed_assets_end, 2)
    non_current_assets_last_sum += fixed_assets_last
    non_current_assets_end_sum += fixed_assets_end
    new_balance_sheet_infos["固定资产"] = {"period_end": fixed_assets_end, "period_last": fixed_assets_last}

    # 计算无形资产 ---累计摊销
    intangible_assets_last = 0
    intangible_assets_end = 0
    for i in range(0, acc_balance_sheet_infos_len):
        acc_balance_sheet_info = acc_balance_sheet_infos[i]
        if acc_balance_sheet_info["subject"] == "无形资产":
            intangible_assets_last += acc_balance_sheet_info["borrow_1"]
            intangible_assets_end += acc_balance_sheet_info["borrow_3"]
        if acc_balance_sheet_info["subject"] == "累计摊销":
            intangible_assets_last -= acc_balance_sheet_info["lend_1"]
            intangible_assets_end -= acc_balance_sheet_info["lend_3"]
    intangible_assets_last = round(intangible_assets_last, 2)
    intangible_assets_end = round(intangible_assets_end, 2)
    non_current_assets_last_sum += intangible_assets_last
    non_current_assets_end_sum += intangible_assets_end
    new_balance_sheet_infos["无形资产"] = {"period_end": intangible_assets_end, "period_last": intangible_assets_last}

    # 通用计算
    non_current_assets_cp = list(non_current_assets.copy())
    for i in range(0, acc_balance_sheet_infos_len):
        acc_balance_sheet_info = acc_balance_sheet_infos[i]
        subject = acc_balance_sheet_info["subject"]
        if subject in non_current_assets_cp:
            last = acc_balance_sheet_info["borrow_1"]
            end = acc_balance_sheet_info["borrow_3"]
            non_current_assets_last_sum += last
            non_current_assets_end_sum += end
            new_balance_sheet_infos[subject] = {"period_end": end, "period_last": last}
            non_current_assets_cp.remove(subject)
    # 未在明细表中的将其值定0
    len__non_current_assets_cp = len(non_current_assets_cp)
    if len_current_assets_cp > 0:
        for j in range(0, len__non_current_assets_cp):
            subject_left = non_current_assets_cp[j]
            new_balance_sheet_infos[subject_left] = {"period_end": 0, "period_last": 0}

    # 非流动资产合计
    non_current_assets_end_sum = round(non_current_assets_end_sum, 2)
    non_current_assets_last_sum = round(non_current_assets_last_sum, 2)
    new_balance_sheet_infos["非流动资产合计"] = {"period_end" : non_current_assets_end_sum,
                                          "period_last": non_current_assets_last_sum}

    # 资产合计
    assets_sum_last = round(current_assets_last_sum + non_current_assets_last_sum, 2)
    assets_sum_end = round(current_assets_end_sum + non_current_assets_end_sum, 2)
    new_balance_sheet_infos["资产总计"] = {"period_end": assets_sum_end, "period_last": assets_sum_last}

    # --------------------------------------------------------------------------#

    # 计算负债与所有者权益部分
    # 流动负债
    current_liabilities_last_sum = 0
    current_liabilities_end_sum = 0

    # 计算应付和预收
    account_payable_list = ["应付账款", "预付账款"]
    account_payable_last, account_payable_end = right_size_formula(acc_balance_sheet_infos, acc_balance_sheet_infos_len,
                                                                   account_payable_list)
    new_balance_sheet_infos["应付账款"] = {"period_end": account_payable_end, "period_last": account_payable_last}
    current_liabilities_last_sum += account_payable_last
    current_liabilities_end_sum += account_payable_end

    advance_from_customer_list = ["预收账款", "应收账款"]
    advance_customer_last, advance_customer_end = right_size_formula(acc_balance_sheet_infos,
                                                                     acc_balance_sheet_infos_len,
                                                                     advance_from_customer_list)
    new_balance_sheet_infos["预收账款"] = {"period_end": advance_customer_end, "period_last": advance_customer_last}
    current_liabilities_last_sum += advance_money_last
    current_liabilities_end_sum += advance_customer_end

    new_balance_sheet_infos["一年内到期的非流动负债"] = {"period_end": 0, "period_last": 0}

    # 通用公式
    current_liabilities_cp = list(current_liabilities.copy())
    for i in range(0, acc_balance_sheet_infos_len):
        acc_balance_sheet_info = acc_balance_sheet_infos[i]
        subject = acc_balance_sheet_info["subject"]
        if subject in current_liabilities_cp:
            last = acc_balance_sheet_info["lend_1"]
            end = acc_balance_sheet_info["lend_3"]
            current_liabilities_last_sum += last
            current_liabilities_end_sum += end
            new_balance_sheet_infos[subject] = {"period_end": end, "period_last": last}
            current_liabilities_cp.remove(subject)
    # 未在明细表中的将其值定0
    len_current_liabilities_cp = len(current_liabilities_cp)
    if len_current_assets_cp > 0:
        for j in range(0, len_current_liabilities_cp):
            subject_left = current_liabilities_cp[j]
            new_balance_sheet_infos[subject_left] = {"period_end": 0, "period_last": 0}

    # 存入流动负债的值
    current_liabilities_end_sum = round(current_liabilities_end_sum, 2)
    current_liabilities_last_sum = round(current_liabilities_last_sum, 2)
    new_balance_sheet_infos["流动负债合计"] = {"period_end" : current_liabilities_end_sum,
                                         "period_last": current_liabilities_last_sum}

    # 计算非流动负债部分 ，忽略长期借款到期问题
    non_current_liabilities_last_sum = 0
    non_current_liabilities_end_sum = 0
    # 通用公式
    non_current_liabilities_cp = list(non_current_liabilities.copy())
    for i in range(0, acc_balance_sheet_infos_len):
        acc_balance_sheet_info = acc_balance_sheet_infos[i]
        subject = acc_balance_sheet_info["subject"]
        if subject in non_current_liabilities_cp:
            last = acc_balance_sheet_info["lend_1"]
            end = acc_balance_sheet_info["lend_3"]
            non_current_liabilities_last_sum += last
            non_current_liabilities_end_sum += end
            new_balance_sheet_infos[subject] = {"period_end": end, "period_last": last}
            non_current_liabilities_cp.remove(subject)
    # 未在明细表中的将其值定0
    len_non_current_liabilities_cp = len(non_current_liabilities_cp)
    if len_non_current_liabilities_cp > 0:
        for j in range(0, len_non_current_liabilities_cp):
            subject_left = non_current_liabilities_cp[j]
            new_balance_sheet_infos[subject_left] = {"period_end": 0, "period_last": 0}

    # 将非流动负债和负债合计加入
    non_current_liabilities_end_sum = round(non_current_liabilities_end_sum, 2)
    non_current_liabilities_last_sum = round(non_current_liabilities_last_sum, 2)
    new_balance_sheet_infos["非流动负债合计"] = {"period_end" : non_current_liabilities_end_sum,
                                          "period_last": non_current_liabilities_last_sum}
    liabilities_last_sum = round(current_liabilities_last_sum + non_current_liabilities_last_sum, 2)
    liabilities_end_sum = round(current_liabilities_end_sum + non_current_liabilities_end_sum, 2)
    new_balance_sheet_infos["负债合计"] = {"period_end": liabilities_end_sum, "period_last": liabilities_last_sum}

    # 计算所有者权益
    owners_equities_last_sum = 0
    owners_equities_end_sum = 0

    # 通用公式
    owners_equities_cp = list(owners_equities.copy())
    for i in range(0, acc_balance_sheet_infos_len):
        acc_balance_sheet_info = acc_balance_sheet_infos[i]
        subject = acc_balance_sheet_info["subject"]
        if subject in owners_equities_cp:
            last = acc_balance_sheet_info["lend_1"]
            end = acc_balance_sheet_info["lend_3"]
            if subject == "本年利润":
                subject = "未分配利润"
            owners_equities_last_sum += last
            owners_equities_end_sum += end
            new_balance_sheet_infos[subject] = {"period_end": end, "period_last": last}
            if subject == "未分配利润":
                subject = "本年利润"
            owners_equities_cp.remove(subject)
    # 未在明细表中的将其值定0
    len_owners_equilities_cp = len(owners_equities_cp)
    if len_owners_equilities_cp > 0:
        for j in range(0, len_owners_equilities_cp):
            subject_left = owners_equities_cp[j]
            new_balance_sheet_infos[subject_left] = {"period_end": 0, "period_last": 0}
    # 将所有者权益合计加入
    owners_equities_end_sum = round(owners_equities_end_sum, 2)
    owners_equities_last_sum = round(owners_equities_last_sum, 2)
    new_balance_sheet_infos["所有者权益合计"] = {"period_end" : owners_equities_end_sum,
                                          "period_last": owners_equities_last_sum}

    # 将负债与所有者权益合计加入
    liability_and_equility_last_sum = round(owners_equities_last_sum + liabilities_last_sum, 2)
    liability_and_equility_end_sum = round(owners_equities_end_sum + liabilities_end_sum, 2)
    new_balance_sheet_infos["负债及所有者权益总计"] = {"period_end" : liability_and_equility_end_sum,
                                             "period_last": liability_and_equility_last_sum}

    # 将所有结果存入数据库
    # mongo.db.company.update({"_id": _id}, {"$set": {"new_balance_sheet_infos": new_balance_sheet_infos}})
    company.update({"new_balance_sheet_infos": new_balance_sheet_infos})
