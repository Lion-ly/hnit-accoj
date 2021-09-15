#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/4/2 12:06
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py.py
# @Software: PyCharm
from flask import session
from accoj.extensions import mongo
from accoj.utils import (update_rank,
                         is_confirmed)
from accoj import celery

import math

TotalScore = [9, 10, 10, 10, 9, 10, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 9, 9, 10, 10,
              10, 10, 10, 10, 13.5, 13.5, 13.5, 13.5, 10, 10, 9, 10, 10, 10, 10, 10, 0]


@celery.task
def rejudge(course_no: int = 0, class_name: str = "", student_no: str = ""):
    """
    重判题目
    :param course_no: 课程号 '2 - 10'
    :param class_name: 班级名 例：'湖南工学院-物管1901'
    :param student_no: 学号名
    :return: bool
    """

    def rejudge_course(companies):
        if companies:
            companies = list(companies)
        else:
            return
        companies_len = len(companies)
        i = 0
        cnt = 0
        failed_list = []
        while i < companies_len:
            company = companies[i]
            _student_no = company.get('student_no')
            company_cp = companies[i + 1]
            course_list = c_dict.get(course_no)
            for course in course_list:
                try:
                    scores = evaluate(infos_name=course, company=company, company_cp=company_cp)
                    if is_confirmed(course_no=course_no, company=company, infos_name=course):
                        update_rank(schedule_name=course, scores=scores, student_no=_student_no)
                        cnt += 1
                    else:
                        failed_list.append(_student_no)
                except AttributeError:
                    failed_list.append(_student_no)
                except TypeError:
                    failed_list.append(_student_no)
                except IndexError:
                    failed_list.append(_student_no)
            i += 2
        print(f"重判第{course_no}次课程成功数: {cnt}\t失败数：{len(failed_list)}\t共计：{int(companies_len / 2)}")
        print(f"失败原因：学生未完成课程!")
        print(f"失败学号：{failed_list}!")

    def rejudge_all():
        """
        全部重判
        :return:
        """
        companies = mongo.db.company.find()
        rejudge_course(companies)

    def rejudge_by_class():
        """
        按班级重判
        :return:
        """
        _classes = mongo.db.classes.find_one({"class_name": class_name})
        if _classes:
            students = _classes.get('students')
            users = []
            for student in students:
                users.extend([student, f"{student}_cp"])
            companies = mongo.db.company.find({"student_no": {"$in": users}})
            rejudge_course(companies)

    def rejudge_by_student_no():
        """
        按学号重判
        :return:
        """
        companies = mongo.db.company.find({"student_no": {"$regex": r"^{}".format(student_no)}})
        rejudge_course(companies)

    c_dict = {2 : ["key_element"],
              3 : ["subject"],
              4 : ["entry"],
              5 : ["ledger", "balance_sheet"],
              6 : ["acc_document"],
              7 : ["subsidiary_account", "acc_balance_sheet"],
              8 : ["new_balance_sheet", "profit_statement"],
              9 : ["trend_analysis", "common_ratio_analysis", "ratio_analysis"],
              10: ["dupont_analysis"]}
    if course_no not in [i for i in range(2, 11)]:
        return False
    if class_name == "0" and not student_no:
        rejudge_all()
    elif class_name != "0":
        rejudge_by_class()
    elif student_no:
        rejudge_by_student_no()
    return True


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
    total_scores = 0
    key_element_score = []
    username = company.get("student_no")
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
                if key_element == key_element_cp and is_up == is_up_cp:
                    score_point += 1
                    if money == money_cp:
                        score_point += 1
        score_point = score_point if score_point <= total_point else total_point
        score *= score_point / total_point
        score = round(score, 2)
        scores += score
        total_scores += total_score
        key_element_score.extend([score, total_score])

    # scores = round(scores / 2, 2)
    scores = round(scores / total_scores * 100, 2)
    print(scores)
    key_element_score.append(scores)
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.key_element_score": key_element_score}}, multi=True)

    return key_element_score


def evaluate_subject(company, company_cp):
    """
    会计科目评分
    :param company:
    :param company_cp:
    :return:
    """
    scores = 0
    total_scores = 0
    subject_score = []
    username = company.get("student_no")
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
        total_point = len(info_cp)
        if total_point == 0:
            subject_score.extend([score, total_score])
            continue

        for t1_info in info_cp:
            for t2_info in info:
                subject = t2_info.get("subject")
                subject_cp = t1_info.get("subject")
                is_up = t2_info.get("is_up")
                is_up_cp = t1_info.get("is_up")
                if subject == subject_cp and is_up == is_up_cp:
                    score_point += 1
        score_point = score_point if score_point <= total_point else total_point
        score *= score_point / total_point
        score = round(score, 2)
        scores += score
        total_scores += total_score
        subject_score.extend([score, total_score])

    # scores = round(scores / 2, 2)
    scores = round(scores / total_scores * 100, 2)
    subject_score.append(scores)
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.subject_score": subject_score}}, multi=True)

    return subject_score


def evaluate_entry(company, company_cp):
    """
    会计分录
    :param company:
    :param company_cp:
    :return:
    """
    scores = 0
    total_scores = 0
    entry_score = []
    username = company.get("student_no")
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
                if subject == subject_cp and is_dr == is_dr_cp:
                    score_point += 1
                    if money == money_cp:
                        score_point += 1
                    break
        score_point = score_point if score_point <= total_point else total_point
        score *= score_point / total_point
        score = round(score, 2)
        scores += score
        total_scores += total_score
        entry_score.extend([score, total_score])

    # scores = round(scores / 2, 2)
    scores = round(scores / total_scores * 100, 2)
    entry_score.append(scores)
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.entry_score": entry_score}}, multi=True)

    return entry_score


def evaluate_ledger(company, company_cp):
    """
    账户评分
    """
    pl_accounts = {"主营业务收入", "其他业务收入", "公允价值变动损益", "投资收益", "营业外收入", "主营业务成本", "其他业务成本",
                   "税金及附加", "销售费用", "财务费用", "资产减值损失", "营业外支出", "所得税费用", "以前年度损益调整"}

    def cal_fun1(info, info_cp):
        nonlocal score_point, total_point
        keys1 = ["cr", "dr"]
        total_point += 5
        total_point += sum([len(info_cp.get(key)) for key in keys1])
        subject = info_cp.get("subject")
        if subject not in pl_accounts:
            # 损益类账户有‘平’T表，特判
            score_point += 1
        else:
            is_left = info.get("is_left")
            is_left_cp = info_cp.get("is_left")
            if is_left != is_left_cp:
                return
            else:
                score_point += 1
        keys2 = ["opening_balance", "current_amount_dr", "current_amount_cr", "ending_balance"]
        score_point += sum([1 if info.get(t_key) == info_cp.get(t_key) else 0 for t_key in keys2])
        for key in keys1:
            t_info = info.get(key)
            t_info_cp = info.get(key)
            for t in t_info_cp:
                bcp_no = t.get("business_no")
                money_cp = t.get("money")
                for tt in t_info:
                    b_no = tt.get("business_no")
                    if bcp_no == b_no:
                        score_point += 1
                        money = t.get("money")
                        if money_cp == money:
                            score_point += 1
                        break

    def cal_fun(infos, infos_cp):
        for key, info_cp in infos_cp.items():
            info = infos.get(key)
            cal_fun1(info, info_cp)

    username = company.get("student_no")
    ledger_infos = company.get("ledger_infos")
    ledger_infos_cp = company_cp.get("ledger_infos")
    ledger_infos1 = ledger_infos.get("ledger_infos_1")
    ledger_infos2 = ledger_infos.get("ledger_infos_2")
    ledger_infos_cp1 = ledger_infos_cp.get("ledger_infos_1")
    ledger_infos_cp2 = ledger_infos_cp.get("ledger_infos_2")

    total_score = 30
    total_point, score_point = 0, 0

    cal_fun(ledger_infos1, ledger_infos_cp1)
    scores1 = score_point / total_point * total_score
    scores1 = round(scores1, 2)
    total_point, score_point = 0, 0

    cal_fun(ledger_infos2, ledger_infos_cp2)
    scores2 = score_point / total_point * total_score
    scores2 = round(scores2, 2)

    ledger_score = {"first": scores1, "second": scores2}
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.ledger_score": ledger_score}}, multi=True)

    return ledger_score


def evaluate_balance_sheet(company, company_cp):
    """
    平衡表评分
    :param company:
    :param company_cp:
    :return:
    """
    username = company.get("student_no")
    balance_sheet_infos = company.get("balance_sheet_infos")
    balance_sheet_infos_cp = company_cp.get("balance_sheet_infos")

    accounting_period_1 = balance_sheet_infos.get("accounting_period_1")
    accounting_period_2 = balance_sheet_infos.get("accounting_period_2")
    accounting_period_1_cp = balance_sheet_infos_cp.get("accounting_period_1")
    accounting_period_2_cp = balance_sheet_infos_cp.get("accounting_period_2")
    total_score = 40
    total_point, score_point = 0, 0
    score_point, total_point = _cal_balance(accounting_period_1, accounting_period_1_cp, score_point, total_point)
    score_point, total_point = _cal_balance(accounting_period_2, accounting_period_2_cp, score_point, total_point)

    scores = score_point / total_point * total_score
    scores = round(scores, 2)
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.balance_sheet_score": scores}}, multi=True)

    return scores


def evaluate_acc_document(company, company_cp):
    """
    会计凭证
    :param company:
    :param company_cp:
    :return:
    """
    scores = 0
    total_scores = 0
    acc_document_score = []
    username = company.get("student_no")
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
        teacher_score = -1  # 教师评分占位，-1标记未评分
        score = total_score
        score_point = 0
        total_point = len(info_cp) * 3 - 1  # 行数 * 每行三个得分点（总账科目 + 借方金额 + 贷方金额）- 合计
        if total_point == 0:
            acc_document_score.extend([score, teacher_score, total_score])
            continue
        for t1_info in info_cp:
            for t2_info in info:
                general_account = t2_info.get("general_account")
                general_account_cp = t1_info.get("general_account")
                dr_money = t2_info.get("dr_money")
                cr_money = t2_info.get("cr_money")
                dr_money_cp = t1_info.get("dr_money")
                cr_money_cp = t1_info.get("cr_money")
                cr_money = 0 if cr_money == '' else cr_money
                dr_money = 0 if dr_money == '' else dr_money
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
        total_scores += total_score
        acc_document_score.extend([score, teacher_score, total_score])

    # scores = round(scores / 2, 2)
    scores = round(scores / total_scores * 100, 2)
    acc_document_score.append(scores)
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.acc_document_score": acc_document_score}}, multi=True)

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
        t_total_point += info_cp_len * 4  # 借，贷，方向，余额
        for i in range(0, info_cp_len):
            t2_info = t_info_cp[i]
            if i >= info_len:
                continue
            t1_info = t_info[i]
            keys = ["dr_money", "cr_money", "orientation", "balance_money"]
            t1_info["dr_money"] = t1_info["dr_money"] if t1_info["dr_money"] else 0
            t1_info["cr_money"] = t1_info["cr_money"] if t1_info["cr_money"] else 0
            t1_info["balance_money"] = t1_info["balance_money"] if t1_info["balance_money"] else 0
            t_score_point += sum([1 if t1_info.get(t_key) == t2_info.get(t_key) else 0 for t_key in keys])
        return t_score_point, t_total_point

    username = company.get("student_no")
    subsidiary_account_infos = company.get("subsidiary_account_infos")
    subsidiary_account_infos_cp = company_cp.get("subsidiary_account_infos")

    total_score = 60
    total_point, score_point = 0, 0

    for key_cp, info_cp in subsidiary_account_infos_cp.items():
        info = subsidiary_account_infos.get(key_cp)
        info = info if info else []
        score_point, total_point = cal_fun(info, info_cp, score_point, total_point)

    scores = score_point / total_point * total_score
    if username == "19040440215":
        print(f"total_point:{total_point}\nscore_point: {score_point}")
    scores = round(scores, 2)
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.subsidiary_account_score": scores}}, multi=True)

    return scores


def evaluate_acc_balance_sheet(company, company_cp):
    """
    科目余额表
    :param company:
    :param company_cp:
    :return:
    """
    username = company.get("student_no")
    acc_balance_sheet_infos = company.get("acc_balance_sheet_infos")
    acc_balance_sheet_infos_cp = company_cp.get("acc_balance_sheet_infos")

    total_score = 40
    total_point, score_point = 0, 0
    score_point, total_point = _cal_balance(acc_balance_sheet_infos, acc_balance_sheet_infos_cp,
                                            score_point, total_point)

    scores = score_point / total_point * total_score
    scores = round(scores, 2)
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.acc_balance_sheet_score": scores}}, multi=True)

    return scores


def evaluate_new_balance_sheet(company, company_cp):
    """
    资产负债表评分
    """
    total_score = 60
    username = company.get("student_no")
    scores = _statement_func("new_balance_sheet", company, company_cp, total_score)
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.{}_score".format("new_balance_sheet"): scores}}, multi=True)
    return scores


def evaluate_profit_statement(company, company_cp):
    """
    利润表评分
    """
    total_score = 40
    username = company.get("student_no")
    scores = _statement_func("profit_statement", company, company_cp, total_score)
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.{}_score".format("profit_statement"): scores}}, multi=True)
    return scores


def evaluate_trend_analysis(company, company_cp):
    """
    趋势分析法评分
    """
    total_score = 15
    teacher_score = -1
    username = company.get("student_no")
    score1 = _statement_func("trend_analysis_infos.new_balance_sheet_infos", company, company_cp, total_score)
    score2 = _statement_func("trend_analysis_infos.profit_statement_infos", company, company_cp, total_score)
    scores = {"first" : {"student_score": score1, "teacher_score": teacher_score},
              "second": {"student_score": score2, "teacher_score": teacher_score}}
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.{}_score".format("trend_analysis"): scores}}, multi=True)
    return scores


def evaluate_common_ratio_analysis(company, company_cp):
    """
    共同比分析法
    """
    total_score = 15
    teacher_score = -1
    username = company.get("student_no")
    score1 = _statement_func("common_ratio_analysis_infos.new_balance_sheet_infos", company, company_cp, total_score)
    score2 = _statement_func("common_ratio_analysis_infos.profit_statement_infos", company, company_cp, total_score)
    scores = {"first" : {"student_score": score1, "teacher_score": teacher_score},
              "second": {"student_score": score2, "teacher_score": teacher_score}}
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.{}_score".format("common_ratio_analysis"): scores}}, multi=True)
    return scores


def evaluate_ratio_analysis(company, company_cp):
    """
    比率分析法评分
    """
    total_score = 15
    teacher_score = -1
    username = company.get("student_no")
    scores = _statement_func("ratio_analysis", company, company_cp, total_score)
    scores = {"student_score": scores, "teacher_score": teacher_score}
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.{}_score".format("ratio_analysis"): scores}}, multi=True)
    return scores


def evaluate_dupont_analysis(company, company_cp):
    """
    杜邦分析法
    """
    total_score = 30
    teacher_score = -1
    username = company.get("student_no")
    infos = company.get("{}_infos".format("dupont_analysis"))
    infos_cp = company_cp.get("{}_infos".format("dupont_analysis"))

    score_point, total_point = 0, 0
    for key, value in infos_cp.items():
        if key == "conclusion":
            continue
        t_value = infos.get(key)
        score_point += 1 if value == t_value else 0
        total_point += 1

    scores = score_point / total_point * total_score
    scores = round(scores, 2)
    scores = {"student_score": scores, "teacher_score": teacher_score}
    mongo.db.company.update({"student_no": {"$regex": r"^{}".format(username)}},
                            {"$set": {"evaluation.{}_score".format("dupont_analysis"): scores}}, multi=True)
    return scores


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


def _cal_balance(info, info_cp, t_score_point, t_total_point):
    """
    平衡表和余额表评分计算
    :param info:
    :param info_cp:
    :param t_score_point:
    :param t_total_point:
    :return:
    """
    info_len = len(info_cp)
    t_total_point += info_len * 7 - 1  # ‘合计’科目不计分
    for t1_info in info_cp:
        for t2_info in info:
            subject, subject_cp = t1_info.get("subject"), t2_info.get("subject")
            if subject == subject_cp:
                if subject != "sum":
                    t_score_point += 1
                keys = ["borrow_1", "lend_1", "borrow_2", "lend_2", "borrow_3", "lend_3"]
                for key in keys:
                    # 将null转化为0
                    t2_info[key] = t2_info.get(key) if t2_info.get(key) else 0
                    if t1_info.get(key) == t2_info.get(key):
                        t_score_point += 1
                break
    return t_score_point, t_total_point


def _statement_func(infos_name, company, company_cp, total_score):
    """
    报表通用评分
    :param infos_name:
    :param company:
    :param company_cp:
    :return:
    """
    if infos_name.find(".") != -1:
        t_name = infos_name.split(".")
        infos = company.get(t_name[0]).get(t_name[1])
        infos_cp = company_cp.get(t_name[0]).get(t_name[1])
    else:
        infos = company.get("{}_infos".format(infos_name))
        infos_cp = company_cp.get("{}_infos".format(infos_name))

    score_point, total_point = 0, 0
    for key, value in infos_cp.items():
        if key == "conclusion":
            continue
        keys = ["period_last", "period_end"]
        if value.get(keys[0]):
            total_point += 1
        if value.get(keys[1]):
            total_point += 1
        try:
            t_value = infos.get(key)
            score_point += sum(
                [1 if value.get(keys[i]) and value.get(keys[i]) == t_value.get(keys[i]) else 0 for i in range(2)])
        except AttributeError:
            raise AttributeError(f"键值错误 key: {key} {infos_name}")

    scores = score_point / total_point * total_score
    scores = round(scores, 2)
    return scores
