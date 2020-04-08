#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/4/2 12:12
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : evaluate_acc_balance_sheet.py
# @Software: PyCharm
from accoj.extensions import mongo


def evaluate_acc_balance_sheet(company, company_cp):
    """
    科目余额表
    :param company:
    :param company_cp:
    :return:
    """
    def cal_fun(info, info_cp, t_score_point, t_total_point):
        info_len = len(acc_balance_sheet_infos_cp)
        for i in range(0, info_len):
            t_score_point = 0
            t_total_point += len(info_cp) * 7
            for t1_info in info_cp:
                for t2_info in info:
                    subject, subject_cp = t1_info.get("subject"), t2_info.get("subject")
                    if subject != subject_cp:
                        continue
                    if subject != "sum":
                        t_total_point += 1
                    keys = ["borrow_1", "lend_1", "borrow_2", "lend_2", "borrow_3", "lend_3"]
                    t_score_point += sum([1 if t1_info.get(key) == t2_info.get(key) else 0 for key in keys])
                    break
        t_total_point -= 1  # ‘合计’科目不计分
        return t_score_point, t_total_point

    _id = company_cp.get("_id")
    acc_balance_sheet_infos = company.get("acc_balance_sheet_infos")
    acc_balance_sheet_infos_cp = company_cp.get("acc_balance_sheet_infos")

    total_score = 40
    total_point, score_point = 0, 0
    score_point, total_point = cal_fun(acc_balance_sheet_infos, acc_balance_sheet_infos_cp, score_point, total_point)

    scores = score_point / total_point * total_score
    acc_balance_sheet_score = round(scores, 2)
    mongo.db.company.update({"_id": _id}, {"$set": {"evaluation.acc_balance_sheet_score": acc_balance_sheet_score}})

    return acc_balance_sheet_score
