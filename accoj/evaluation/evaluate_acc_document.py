#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/4/2 12:12
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : evaluate_acc_document.py
# @Software: PyCharm
from accoj.extensions import mongo
from accoj.evaluation import get_question_no, TotalScore


def evaluate_acc_document(company, company_cp):
    scores = 0
    acc_document_score = []
    _id = company_cp.get("_id")
    acc_document_infos = company.get("acc_document_infos")
    acc_document_infos_cp = company_cp.get("acc_document_infos")
    businesses = company.get("businesses")
    indexes = get_question_no(businesses)
    info_len = len(acc_document_infos_cp)

    for i in range(0, info_len):
        info = acc_document_infos[i]
        info_cp = acc_document_infos_cp[i]
        info = info.get("contents")
        info_cp = info_cp.get("contents")

        total_score = TotalScore[indexes[i] - 1]
        score = total_score
        score_point = 0
        total_point = len(info_cp) * 3 - 1  # 行数 * 每行三个得分点（总账科目 + 借方金额 + 贷方金额）- 合计
        if total_point == 0:
            acc_document_score.extend([score, total_score])
            continue
        for t1_info in info_cp:
            for t2_info in info:
                general_account = t2_info.get("general_account")
                general_account_cp = t1_info.get("general_account")
                dr_money = t2_info.get("dr_money")
                cr_money = t2_info.get("cr_money")
                dr_money_cp = t1_info.get("dr_money")
                cr_money_cp = t1_info.get("cr_money")
                if general_account == general_account_cp:
                    if general_account != "sum":
                        score_point += 1
                    if dr_money == dr_money_cp:
                        score_point += 1
                    if cr_money == cr_money_cp:
                        score_point += 1
                    break
        score_point = score_point if score_point <= total_point else total_point
        score *= score_point / total_point
        score = round(score, 2)
        scores += score
        acc_document_score.extend([score, total_score])

    scores = round(scores) / 2
    acc_document_score.append(scores)
    mongo.db.company.update({"_id": _id}, {"$set": {"evaluation.acc_document_score": acc_document_score}})

    return acc_document_score