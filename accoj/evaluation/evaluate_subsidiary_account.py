#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/4/2 12:18
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : evaluate_subsidiary_account.py
# @Software: PyCharm

from accoj.extensions import mongo


def evaluate_subsidiary_account(company, company_cp):
    """
    明细账
    :param company:
    :param company_cp:
    :return:
    """
    def cal_fun(t_info, t_info_cp, t_score_point, t_total_point):
        info_len = len(t_info)
        info_cp_len = len(t_info_cp)
        for i in range(0, info_cp_len):
            t_score_point = 0
            t2_info = t_info_cp[i]
            t_total_point += len(t2_info) * 4  # 借，贷，方向，余额
            if i >= info_len:
                continue
            t1_info = t_info[i]
            keys = ["dr_money", "cr_money", "orientation", "balance_money"]
            t_score_point += sum([1 if t1_info.get(t_key) == t2_info.get(t_key) else 0 for t_key in keys])
        return t_score_point, t_total_point

    _id = company_cp.get("_id")
    subsidiary_account_infos = company.get("subsidiary_account_infos")
    subsidiary_account_infos_cp = company_cp.get("subsidiary_account_infos")

    total_score = 60
    total_point, score_point = 0, 0

    for key_cp, info_cp in subsidiary_account_infos_cp.items():
        for key, info in subsidiary_account_infos.items():
            if key_cp == key:
                score_point, total_point = cal_fun(info, info_cp, score_point, total_point)
                break

    scores = score_point / total_point * total_score
    subsidiary_account_score = round(scores, 2)
    mongo.db.company.update({"_id": _id}, {"$set": {"evaluation.subsidiary_account_score": subsidiary_account_score}})

    return subsidiary_account_score
