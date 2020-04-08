#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/4/2 12:19
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : evaluate_subject.py
# @Software: PyCharm
from accoj.extensions import mongo
from accoj.evaluation import get_question_no, TotalScore


def evaluate_subject(company, company_cp):
    scores = 0
    subject_score = []
    _id = company_cp.get("_id")
    subject_infos = company.get("subject_infos")
    subject_infos_cp = company_cp.get("subject_infos")
    businesses = company.get("businesses")
    indexes = get_question_no(businesses)
    info_len = len(subject_infos_cp)

    for i in range(0, info_len):
        info = subject_infos[i]
        info_cp = subject_infos_cp[i]
        total_score = TotalScore[indexes[i] - 1]
        score = total_score
        score_point = 0
        total_point = len(info_cp) * 2
        if total_point == 0:
            subject_score.extend([score, total_score])
            continue

        for t1_info in info_cp:
            for t2_info in info:
                subject = t2_info.get("subject")
                subject_cp = t1_info.get("subject")
                is_up = t2_info.get("is_up")
                is_up_cp = t1_info.get("is_up")
                if subject == subject_cp:
                    score_point += 1
                    if is_up == is_up_cp:
                        score_point += 1
        score_point = score_point if score_point <= total_point else total_point
        score *= score_point / total_point
        score = round(score, 2)
        scores += score
        subject_score.extend([score, total_score])

    scores = round(scores / 2, 2)
    subject_score.append(scores)
    mongo.db.company.update({"_id": _id}, {"$set": {"evaluation.subject_score": subject_score}})

    return subject_score
