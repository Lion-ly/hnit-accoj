#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/4/2 12:14
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : evaluate_entry.py
# @Software: PyCharm
from accoj.extensions import mongo
from accoj.evaluation import get_question_no, TotalScore


def evaluate_entry(company, company_cp):
    scores = 0
    entry_score = []
    _id = company_cp.get("_id")
    entry_infos = company.get("entry_infos")
    entry_infos_cp = company_cp.get("entry_infos")
    businesses = company.get("businesses")
    indexes = get_question_no(businesses)
    info_len = len(entry_infos_cp)

    for i in range(0, info_len):
        info = entry_infos[i]
        info_cp = entry_infos_cp[i]
        total_score = TotalScore[indexes[i] - 1]
        score = total_score
        score_point = 0
        total_point = len(info_cp) * 2
        if total_point == 0:
            entry_score.extend([score, total_score])
            continue
        for t1_info in info_cp:
            for t2_info in info:
                subject = t2_info.get("subject")
                subject_cp = t1_info.get("subject")
                is_dr = t2_info.get("is_dr")
                is_dr_cp = t1_info.get("is_dr")
                money = t2_info.get("money")
                money_cp = t1_info.get("money")
                if subject == subject_cp:
                    score_point += 1
                    if is_dr == is_dr_cp:
                        score_point += 1
                        if money == money_cp:
                            score_point += 1
                    break
        score_point = score_point if score_point <= total_point else total_point
        score *= score_point / total_point
        score = round(score, 2)
        scores += score
        entry_score.extend([score, total_score])

    scores = round(scores / 2, 2)
    entry_score.append(scores)
    mongo.db.company.update({"_id": _id}, {"$set": {"evaluation.entry_score": entry_score}})

    return entry_score
