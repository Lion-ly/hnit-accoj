#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/4/2 12:06
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py.py
# @Software: PyCharm
from accoj.extensions import mongo
from flask import session

TotalScore = [9, 10, 10, 10, 9, 10, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 9, 9, 10, 10,
              10, 10, 10, 10, 13.5, 13.5, 13.5, 13.5, 10, 10, 9, 10, 10, 10, 10, 10, 0]


def evaluate(infos_name, company, company_cp):
    """
    计算评分
    :param infos_name:
    :param company:
    :param company_cp:
    :return:
    """
    evaluate_func = {"key_element"          : evaluate_key_element,
                     "subject"              : evaluate_subject,
                     "entry"                : evaluate_entry,
                     "ledger"               : evaluate_ledger,
                     "balance_sheet"        : evaluate_balance_sheet,
                     "acc_document"         : evaluate_acc_document,
                     "subsidiary_account"   : evaluate_subsidiary_account,
                     "acc_balance_sheet"    : evaluate_acc_balance_sheet,
                     "new_balance_sheet"    : evaluate_new_balance_sheet,
                     "profit_statement"     : evaluate_profit_statement,
                     "trend_analysis"       : evaluate_trend_analysis,
                     "common_ratio_analysis": evaluate_common_ratio_analysis,
                     "ratio_analysis"       : evaluate_ratio_analysis,
                     "dupont_analysis"      : evaluate_dupont_analysis}
    scores = evaluate_func[infos_name](company, company_cp)
    return scores


def evaluate_key_element(company, company_cp):
    """
    会计要素评分
    :param company:
    :param company_cp:
    :return:
    """
    scores = 0
    key_element_score = []
    _id = company_cp.get("_id")
    key_element_infos = company.get("key_element_infos")
    key_element_infos_cp = company_cp.get("key_element_infos")
    businesses = company.get("businesses")
    indexes = _get_question_no(businesses)
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

    scores = round(scores / 2, 2)
    key_element_score.append(scores)
    mongo.db.company.update({"_id": _id}, {"$set": {"evaluation.key_element_score": key_element_score}})

    return key_element_score


def evaluate_subject(company, company_cp):
    """
    会计科目评分
    :param company:
    :param company_cp:
    :return:
    """
    scores = 0
    subject_score = []
    _id = company_cp.get("_id")
    subject_infos = company.get("subject_infos")
    subject_infos_cp = company_cp.get("subject_infos")
    businesses = company.get("businesses")
    indexes = _get_question_no(businesses)
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


def evaluate_entry(company, company_cp):
    """
    会计分录
    :param company:
    :param company_cp:
    :return:
    """
    scores = 0
    entry_score = []
    _id = company_cp.get("_id")
    entry_infos = company.get("entry_infos")
    entry_infos_cp = company_cp.get("entry_infos")
    businesses = company.get("businesses")
    indexes = _get_question_no(businesses)
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


def evaluate_ledger(company, company_cp):
    """
    账户评分
    :param company:
    :param company_cp:
    :return:
    """
    # Todo
    pass


def evaluate_balance_sheet(company, company_cp):
    """
    平衡表评分
    :param company:
    :param company_cp:
    :return:
    """

    def cal_fun(info, info_cp, t_score_point, t_total_point):
        info_len = len(balance_sheet_infos_cp)
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
    balance_sheet_infos = company.get("balance_sheet_infos")
    balance_sheet_infos_cp = company_cp.get("balance_sheet_infos")

    accounting_period_1 = balance_sheet_infos.get("accounting_period_1")
    accounting_period_2 = balance_sheet_infos.get("accounting_period_2")
    accounting_period_1_cp = balance_sheet_infos_cp.get("accounting_period_1")
    accounting_period_2_cp = balance_sheet_infos_cp.get("accounting_period_2")
    total_score = 40
    total_point, score_point = 0, 0
    score_point, total_point = cal_fun(accounting_period_1, accounting_period_1_cp, score_point, total_point)
    score_point, total_point = cal_fun(accounting_period_2, accounting_period_2_cp, score_point, total_point)

    scores = score_point / total_point * total_score
    balance_sheet_score = round(scores, 2)
    mongo.db.company.update({"_id": _id}, {"$set": {"evaluation.balance_sheet_score": balance_sheet_score}})

    return balance_sheet_score


def evaluate_acc_document(company, company_cp):
    """
    会计凭证
    :param company:
    :param company_cp:
    :return:
    """
    scores = 0
    acc_document_score = []
    _id = company_cp.get("_id")
    acc_document_infos = company.get("acc_document_infos")
    acc_document_infos_cp = company_cp.get("acc_document_infos")
    businesses = company.get("businesses")
    indexes = _get_question_no(businesses)
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

    scores = round(scores / 2, 2)
    acc_document_score.append(scores)
    mongo.db.company.update({"_id": _id}, {"$set": {"evaluation.acc_document_score": acc_document_score}})

    return acc_document_score


def evaluate_subsidiary_account(company, company_cp):
    """
    明细账评分
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


def evaluate_new_balance_sheet(company, company_cp):
    """
    资产负债表评分
    :param company:
    :param company_cp:
    :return:
    """
    # Todo
    pass


def evaluate_profit_statement(company, company_cp):
    """
    利润表评分
    :param company:
    :param company_cp:
    :return:
    """
    # Todo
    pass


def evaluate_trend_analysis(company, company_cp):
    """
    趋势分析法评分
    :param company:
    :param company_cp:
    :return:
    """
    # Todo
    pass


def evaluate_common_ratio_analysis(company, company_cp):
    """
    共同比分析法
    :param company:
    :param company_cp:
    :return:
    """
    # Todo
    pass


def evaluate_ratio_analysis(company, company_cp):
    """
    比率分析法评分
    :param company:
    :param company_cp:
    :return:
    """
    # Todo
    pass


def evaluate_dupont_analysis(company, company_cp):
    """
    杜邦分析法
    :param company:
    :param company_cp:
    :return:
    """
    # Todo
    pass


def _get_question_no(businesses):
    """
    获取对应业务号的问题编号
    :param businesses:
    :return:
    """
    indexes = list()
    for business in businesses:
        question_no = business.get("question_no")
        indexes.append(question_no)
    return indexes


def _get_company(infos_name):
    t_company = None
    company_cp = None
    username = session.get("username")
    companies = mongo.db.company.find({"student_no": {"$regex": r"^{}".format(username)}},
                                      {"student_no": 1, "{}_infos".format(infos_name): 1, "businesses": 1})
    for company in companies:
        if company.get("student_no").endswith("_cp"):
            company_cp = company
        else:
            t_company = company
    company = t_company if t_company else None
    company_cp = company_cp if company_cp else None
    return company, company_cp
