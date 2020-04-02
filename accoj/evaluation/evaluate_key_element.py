#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/4/2 12:19
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : evaluate_key_element.py
# @Software: PyCharm
from accoj.extensions import mongo
from accoj.evaluation import get_company, get_question_no, TotalScore


def evaluate_key_element():
    """
    会计要素评分
    :return:
    """
    company, company_cp = get_company("key_element")
    scores = 0
    key_element_score = []
    _id = company_cp.get("_id")
    key_element_infos = company.get("key_element_infos")
    key_element_infos_cp = company_cp.get("key_element_infos")
    businesses = company.get("businesses")
    indexes = get_question_no(businesses)
    info_len = len(key_element_infos)

    for i in range(0, info_len):
        info = key_element_infos[i].get("info")
        info_cp = key_element_infos_cp[i].get("info")
        affect_type = key_element_infos[i].get("affect_type")
        affect_type_cp = key_element_infos_cp[i].get("affect_type")
        total_score = TotalScore[indexes[i] - 1]
        score = total_score
        score_point = 0
        total_point = len(info_cp) * 2 + 1

        if affect_type == affect_type_cp or affect_type_cp == 0:
            score_point += 1
        for t1_info in info_cp:
            for t2_info in info:
                key_element = t2_info.get("key_element")
                key_element_cp = t1_info.get("key_element")
                is_up = t2_info.get("is_up")
                is_up_cp = t1_info.get("is_up")
                money = t2_info.get("money")
                money_cp = t1_info.get("money")
                if key_element == key_element_cp:
                    score_point += 1
                    if is_up == is_up_cp:
                        score_point += 1
                        if money == money_cp:
                            score_point += 1
        score_point = score_point if score_point <= total_point else total_point
        score *= score_point / total_point
        score = round(score, 2)
        scores += score
        key_element_score.extend([score, total_score])

    scores = round(scores) / 2
    key_element_score.append(scores)
    mongo.db.company.update({"_id": _id}, {"$set": {"evaluation.key_element_score": key_element_score}})
    return key_element_score
