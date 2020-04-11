#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/3/16 11:09
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : create_subsidiary_account.py
# @Software: PyCharm
# from accoj.extensions import mongo

subsidiary_account_infos = dict()


def create_subsidiary_account(company):
    """
    创建会计明细账答案
    :return:
    """
    subsidiary_account_infos.clear()
    cal_subsidiary_account(company)
    print("This business has not been finished!")


def cal_subsidiary_account(company):
    ledgers_infos = company.get("ledger_infos")
    ledger_infos_1 = ledgers_infos.get("ledger_infos_1")
    ledger_infos_2 = ledgers_infos.get("ledger_infos_2")
    # 各期涉及的及所有
    involve_subjects_1 = set(ledger_infos_1.keys())
    involve_subjects_2 = set(ledger_infos_2.keys())
    excepet_list = involve_subjects_1 - involve_subjects_2

    # 读取第一期信息
    for involve_subject in involve_subjects_1:
        infos = list()
        ledger_info_1 = ledger_infos_1.get(involve_subject)
        opening_balance_1 = ledger_info_1.get("opening_balance")
        dr_1 = ledger_info_1.get("dr")
        cr_1 = ledger_info_1.get("cr")
        current_amount_dr_1 = ledger_info_1.get("current_amount_dr")
        current_amount_cr_1 = ledger_info_1.get("current_amount_cr")
        ending_balance_1 = ledger_info_1.get("ending_balance")
        is_left = ledger_info_1.get("is_left")
        balance = opening_balance_1
        # 期初余额
        infos.append({"date"       : None, "word": None, "no": None, "summary": "期初余额", "dr_money": 0, "cr_money": 0,
                      "orientation": "平", "balance_money": opening_balance_1})
        # 读取借贷信息
        for dr in dr_1:
            money = dr.get("money")
            if is_left:
                balance = round(balance + money, 2)
                infos.append(
                    {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": money, "cr_money": 0,
                     "orientation": "借" if balance > 0 else "贷" if balance <0 else "平", "balance_money": balance})
            else:
                balance = round(balance - money, 2)
                infos.append(
                    {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": money, "cr_money": 0,
                     "orientation": "贷" if balance > 0 else "借" if balance < 0 else "平", "balance_money": abs(balance)})
        for cr in cr_1:
            money = cr.get("money")
            if is_left:
                balance = round(balance - money, 2)
                infos.append(
                    {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": 0, "cr_money": money,
                     "orientation": "借" if balance > 0 else "贷" if balance <0 else "平", "balance_money": abs(balance)})
            else:
                balance = round(balance + money, 2)
                infos.append(
                    {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": 0, "cr_money": money,
                     "orientation":  "贷" if balance > 0 else "借" if balance < 0 else "平", "balance_money": balance})

        # 将本期合计加入
        if is_left:
            infos.append(
                {"date"         : None, "word": None, "no": None, "summary": "本期合计", "dr_money": current_amount_dr_1,
                 "cr_money"     : current_amount_cr_1, "orientation": "借" if ending_balance_1 > 0 else "贷" if ending_balance_1 < 0 else "平",
                 "balance_money": abs(ending_balance_1)})
        else:
            infos.append(
                {"date"         : None, "word": None, "no": None, "summary": "本期合计", "dr_money": current_amount_dr_1,
                 "cr_money"     : current_amount_cr_1, "orientation": "贷" if ending_balance_1 > 0 else "借" if ending_balance_1 < 0 else "平",
                 "balance_money": abs(ending_balance_1)})
        # 如果只在第一期有，加入本年累计
        if involve_subject in excepet_list:
            infos_last = infos[-1]
            orientation = infos_last["orientation"]
            balance_money = infos_last["balance_money"]
            infos.append(
                {"date"    : None, "word": None, "no": None, "summary": "本年累计", "dr_money": current_amount_dr_1,
                 "cr_money": current_amount_cr_1, "orientation": orientation, "balance_money": balance_money})
        subsidiary_account_infos[involve_subject] = infos

    # 读取第二期
    for involve_subject in involve_subjects_2:
        ledger_info_2 = ledger_infos_2.get(involve_subject)
        opening_balance_2 = ledger_info_2.get("opening_balance")
        dr_2 = ledger_info_2.get("dr")
        cr_2 = ledger_info_2.get("cr")
        current_amount_dr_2 = ledger_info_2.get("current_amount_dr")
        current_amount_cr_2 = ledger_info_2.get("current_amount_cr")
        ending_balance_2 = ledger_info_2.get("ending_balance")
        is_left = ledger_info_2.get("is_left")
        balance = opening_balance_2
        # 如果第一期已经存在，则在后面继续补充即可
        if involve_subject in involve_subjects_1:
            infos = subsidiary_account_infos[involve_subject]
            last_infos = infos[-1]
            dr_last = last_infos["dr_money"]
            cr_last = last_infos["cr_money"]
            # 期初余额 == 上期 从借贷信息开始
            for dr in dr_2:
                money = dr.get("money")
                if is_left:
                    balance = round(balance + money, 2)
                    infos.append(
                        {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": money, "cr_money": 0,
                         "orientation": "借" if balance > 0 else "贷" if balance <0 else "平", "balance_money": abs(balance)})
                else:
                    balance = round(balance - money, 2)
                    infos.append(
                        {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": money, "cr_money": 0,
                         "orientation":  "贷" if balance > 0 else "借" if balance < 0 else "平", "balance_money": abs(balance)})
            for cr in cr_2:
                money = cr.get("money")
                if is_left:
                    balance = round(balance - money, 2)
                    infos.append(
                        {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": 0, "cr_money": money,
                         "orientation": "借" if balance > 0 else "贷" if balance <0 else "平", "balance_money": abs(balance)})
                else:
                    balance = round(balance + money, 2)
                    infos.append(
                        {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": 0, "cr_money": money,
                         "orientation":  "贷" if balance > 0 else "借" if balance < 0 else "平", "balance_money": abs(balance)})

            # 将本期合计加入
            if is_left:
                infos.append(
                    {"date"         : None, "word": None, "no": None, "summary": "本期合计", "dr_money": current_amount_dr_2,
                     "cr_money"     : current_amount_cr_2, "orientation": "借" if ending_balance_2 > 0 else "贷" if ending_balance_2 < 0 else "平",
                     "balance_money": abs(ending_balance_2)})
            else:
                infos.append(
                    {"date"         : None, "word": None, "no": None, "summary": "本期合计", "dr_money": current_amount_dr_2,
                     "cr_money"     : current_amount_cr_2, "orientation": "贷" if ending_balance_2 > 0 else "借" if ending_balance_2 < 0 else "平",
                     "balance_money": abs(ending_balance_2)})
            # 将本年合计也同时加入
            infos_end = infos[-1]
            balance_money_end = infos_end["balance_money"]
            orientation_end = infos_end["orientation"]
            dr_end = infos_end["dr_money"]
            cr_end = infos_end["cr_money"]
            dr_sum = round(dr_last + dr_end, 2)
            cr_sum = round(cr_last + cr_end, 2)
            infos.append(
                {"date"    : None, "word": None, "no": None, "summary": "本年累计", "dr_money": dr_sum,
                 "cr_money": cr_sum, "orientation": orientation_end, "balance_money": balance_money_end})
            subsidiary_account_infos[involve_subject] = infos

        else:
            # 如果是第二期出现的账户
            infos = list()
            # 期初余额
            infos.append({"date"       : None, "word": None, "no": None, "summary": "期初余额", "dr_money": 0, "cr_money": 0,
                          "orientation": "平", "balance_money": opening_balance_2})

            infos.append({"date": None, "word": None, "no": None, "summary": "本期合计", "dr_money": 0, "cr_money": 0,
                          "orientation": "平", "balance_money": opening_balance_2})

            # 读取借贷信息
            for dr in dr_2:
                money = dr.get("money")
                if is_left:
                    balance = round(balance + money, 2)
                    infos.append(
                        {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": money, "cr_money": 0,
                         "orientation": "借" if balance > 0 else "贷" if balance <0 else "平", "balance_money": abs(balance)})
                else:
                    balance = round(balance - money, 2)
                    infos.append(
                        {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": money, "cr_money": 0,
                         "orientation":  "贷" if balance > 0 else "借" if balance < 0 else "平", "balance_money": abs(balance)})
            for cr in cr_2:
                money = cr.get("money")
                if is_left:
                    balance = round(balance - money, 2)
                    infos.append(
                        {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": 0, "cr_money": money,
                         "orientation": "借" if balance > 0 else "贷" if balance <0 else "平", "balance_money": abs(balance)})
                else:
                    balance = round(balance + money, 2)
                    infos.append(
                        {"date"       : None, "word": None, "no": None, "summary": None, "dr_money": 0, "cr_money": money,
                         "orientation":  "贷" if balance > 0 else "借" if balance < 0 else "平", "balance_money": abs(balance)})

            # 将本期合计加入
            if is_left:
                infos.append(
                    {"date"         : None, "word": None, "no": None, "summary": "本期合计", "dr_money": current_amount_dr_2,
                     "cr_money"     : current_amount_cr_2, "orientation": "借" if ending_balance_2 > 0 else "贷" if ending_balance_2 < 0 else "平",
                     "balance_money": abs(ending_balance_2)})
            else:
                infos.append(
                    {"date"         : None, "word": None, "no": None, "summary": "本期合计", "dr_money": current_amount_dr_2,
                     "cr_money"     : current_amount_cr_2, "orientation": "贷" if ending_balance_2 > 0 else "借" if ending_balance_2 < 0 else "平",
                     "balance_money": abs(ending_balance_2)})

            # 将本年累计加入
            infos_last = infos[-1]
            balance_money_last = infos_last["balance_money"]
            orientation_last = infos_last["orientation"]
            infos.append(
                {"date"    : None, "word": None, "no": None, "summary": "本年累计", "dr_money": current_amount_dr_2,
                 "cr_money": current_amount_cr_2, "orientation": orientation_last, "balance_money": balance_money_last})
            subsidiary_account_infos[involve_subject] = infos
    company.update({"subsidiary_account_infos": subsidiary_account_infos})
