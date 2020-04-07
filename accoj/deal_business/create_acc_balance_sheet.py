#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/3/16 11:09
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : create_acc_balance_sheet.py
# @Software: PyCharm
# from accoj.extensions import mongo


def create_acc_balance_sheet(company):
    """
    创建第二期科目余额表答案
    :return:
    """
    cal_acc_balance(company, "ledger_infos_2", 2)
    print("acc balance of period 2 has been created!")


# 第二期的余额表
def cal_acc_balance(company, ledger_name, period):
    # _id = company.get("_id")
    balance_sheet_info = list()
    borrow_sum_1 = 0
    borrow_sum_2 = 0
    borrow_sum_3 = 0
    lend_sum_1 = 0
    lend_sum_2 = 0
    lend_sum_3 = 0
    # 获取该期的会计账户信息
    ledgers_infos = company.get("ledger_infos")
    ledger_infos = ledgers_infos.get(ledger_name)
    # 遍历该期所有账户
    for subject_key, ledger_info in ledger_infos.items():
        subject = subject_key
        opening_balance = ledger_info.get("opening_balance")
        ending_balance = ledger_info.get("ending_balance")
        is_left = ledger_info.get("is_left")
        if is_left:
            borrow_1 = opening_balance
            lend_1 = 0
            borrow_3 = ending_balance
            lend_3 = 0
        else:
            borrow_1 = 0
            lend_1 = opening_balance
            borrow_3 = 0
            lend_3 = ending_balance
        borrow_2 = ledger_info.get("current_amount_dr")
        lend_2 = ledger_info.get("current_amount_cr")
        # 计算期末合计余额
        borrow_sum_1 = round(borrow_sum_1 + borrow_1, 2)
        borrow_sum_2 = round(borrow_sum_2 + borrow_2, 2)
        borrow_sum_3 = round(borrow_sum_3 + borrow_3, 2)
        lend_sum_1 = round(lend_sum_1 + lend_1, 2)
        lend_sum_2 = round(lend_sum_2 + lend_2, 2)
        lend_sum_3 = round(lend_sum_3 + lend_3, 2)
        # 将该账户信息加入list
        balance_sheet_info.append({"subject": subject, "borrow_1": borrow_1, "lend_1": lend_1, "borrow_2": borrow_2,
                                   "lend_2" : lend_2, "borrow_3": borrow_3, "lend_3": lend_3})
    # 最终将平衡表余额加入
    balance_sheet_info.append({"subject" : "sum", "borrow_1": borrow_sum_1, "lend_1": lend_sum_1,
                               "borrow_2": borrow_sum_2, "lend_2": lend_sum_2,
                               "borrow_3": borrow_sum_3, "lend_3": lend_sum_3})

    # mongo.db.company.update({"_id": _id}, {"$set": {"acc_balance_sheet_infos": balance_sheet_info}})
    company.update({"acc_balance_sheet_infos": balance_sheet_info})
