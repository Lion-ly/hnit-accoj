#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:54
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py
# @Software: PyCharm
from _datetime import datetime
from flask import session
from accoj.utils import is_number, allowed_file
from accoj.extensions import mongo
from accoj.evaluation import evaluate

MAX_BUSINESS_NO = 20


def submit_infos(type_num, infos, submit_type, infos_name, is_first=None, business_no=None, subject=None,
                 ledger_period=None):
    result, message = False, "未知错误！"
    if type_num == 1:
        result, message = _submit_infos1(infos=infos, submit_type=submit_type, infos_name=infos_name)
    elif type_num == 2:
        result, message = _submit_infos2(infos=infos, submit_type=submit_type, infos_name=infos_name,
                                         is_first=is_first)
    elif type_num == 3:
        result, message = _submit_infos3(infos=infos, submit_type=submit_type, infos_name=infos_name,
                                         business_no=business_no)
    elif type_num == 4:
        result, message = _submit_infos4(infos=infos, submit_type=submit_type, infos_name=infos_name,
                                         subject=subject, ledger_period=ledger_period)
    return result, message


def _submit_infos1(infos: dict, submit_type: str, infos_name: str):
    """
    提交信息（第一类，非第九次课程一二部分 、第六七次）

    :param infos: submit infos
    :param submit_type: submit type
    :param infos_name: infos name
    """
    result, message = False, "未知错误！"
    if not infos:
        result = False
        message = "信息为空"
    elif submit_type not in ["confirm", "save"]:
        result = False
        message = "提交类型错误"
    else:
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")

        set_key1 = "{}_infos".format(infos_name)
        set_key2 = "schedule_confirm.{}_confirm".format(infos_name)
        set_key3 = "schedule_saved.{}_saved".format(infos_name)
        if not schedule_confirm.get("{}_confirm".format(infos_name)):
            return _deal_update(submit_type=submit_type,
                                find_dict=dict(_id=_id),
                                update_confirm={"$set": {set_key1: infos, set_key2: True, set_key3: True}},
                                update_save={"$set": {set_key1: infos, set_key3: True}})
        elif schedule_confirm.get("{}_confirm".format(infos_name)):
            # 信息已提交确认
            return False, "已经确认提交过"

    return result, message


def _submit_infos2(infos: dict, submit_type: str, infos_name: str, is_first: bool):
    """
    提交信息（第二类，第九次课程一二部分）

    :param infos: submit infos
    :param submit_type: submit type
    :param infos_name: infos name
    :param is_first: boolean
    """
    times = "first" if is_first else "second"
    sheet_name = "new_balance_sheet_infos" if is_first else "profit_statement_infos"
    result, message = False, "未知错误！"
    if not infos:
        return False, "信息为空"
    elif submit_type not in ["confirm", "save"]:
        result = False
        message = "提交类型错误"
    else:
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        confirm = schedule_confirm.get("{}_confirm".format(infos_name))

        set_key1 = "{}_infos.{}".format(infos_name, sheet_name)
        set_key2 = "schedule_confirm.{}_confirm.{}".format(infos_name, times)
        set_key3 = "schedule_saved.{}_saved.{}".format(infos_name, times)
        if not confirm or not confirm.get("{}".format(times)):
            return _deal_update(submit_type=submit_type,
                                find_dict=dict(_id=_id),
                                update_confirm={"$set": {set_key1: infos, set_key2: True, set_key3: True}},
                                update_save={"$set": {set_key1: infos, set_key3: True}})
        elif schedule_confirm.get("{}_confirm".format(infos_name)).get("{}".format(times)):
            # 信息已提交确认
            return False, "已经确认提交过"

    return result, message


def _submit_infos3(infos, submit_type, infos_name, business_no):
    """
    提交信息（第三类，第二三四六次课程）

    :param infos: submit infos
    :param submit_type: submit type
    :param infos_name: infos name
    :param business_no: business_no
    """
    result, message = False, "未知错误！"
    if not is_number(business_no) or submit_type not in ["confirm", "save"]:
        return False, "题号错误或提交类型错误！"

    else:
        business_no = int(business_no) - 1
        if business_no > 19 or business_no < 0:
            return False, "题号错误！"

    file = {}
    if infos_name == "acc_document":
        date = infos.get("date")
        file = infos.get("file")
        try:
            infos["date"] = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            return False, "日期格式错误！"

    company = mongo.db.company.find_one({"student_no": session.get("username")},
                                        dict(businesses=1, schedule_confirm=1))
    _id = company.get("_id")
    schedule_confirm = company.get("schedule_confirm")
    if business_no not in schedule_confirm.get("{}_confirm".format(infos_name)):
        # 若当前业务信息提交未确认，则确认提交或保存
        if infos_name == "acc_document":
            # 保存文件
            infos["document_no"] = ""
            filename = file.get("filename")
            content = file.get("content")
            if filename and not allowed_file(filename):
                return False, "提交文件类型错误！"
            if filename and content:
                document_no = session["username"] + str(business_no)
                infos["document_no"] = document_no
                file["document_no"] = document_no
                mongo.db.file.update({"document_no": "{}".format(document_no)}, {"$set": file}, True)  # upsert
            infos.pop("file")

        set_dict_key = "{}_infos.".format(infos_name) + str(business_no)
        set_dict = {set_dict_key: infos}

        add_key1 = "schedule_confirm.{}_confirm".format(infos_name)
        add_key2 = "schedule_saved.{}_saved".format(infos_name)
        return _deal_update(submit_type=submit_type,
                            find_dict=dict(_id=_id),
                            update_confirm={"$set"     : set_dict,
                                            "$addToSet": {add_key1: business_no, add_key2: business_no}},
                            update_save={"$set": set_dict, "$addToSet": {add_key2: business_no}})
    elif business_no in schedule_confirm.get("{}_confirm".format(infos_name)):
        # 业务已提交确认
        return False, "此业务已经提交过！"

    return result, message


def _submit_infos4(infos, submit_type, infos_name, subject, ledger_period=False):
    """
    提交信息（第四类，`账户`和`明细账`部分）

    :param infos: submit infos
    :param submit_type: submit type
    :param subject: subject
    :param infos_name: infos name
    :param ledger_period: leger period # 对于会计账户部分的特判 值为`1 or 2`
    """
    result, message = False, "未知错误！"
    if submit_type not in ["confirm", "save"]:
        return False, "提交类型错误！"

    company = mongo.db.company.find_one({"student_no": session.get("username")},
                                        dict(businesses=1, schedule_confirm=1, involve_subjects=1))
    _id = company.get("_id")
    schedule_confirm = company.get("schedule_confirm")
    involve_subjects = company.get("involve_subjects")

    involve_subjects_1 = involve_subjects.get("involve_subjects_1")
    involve_subjects_2 = involve_subjects.get("involve_subjects_2")

    confirmed = schedule_confirm.get("{}_confirm".format(infos_name))
    if ledger_period:
        if ledger_period == 1 and subject not in involve_subjects_1:
            return False, "科目错误！"
        elif ledger_period == 2 and subject not in involve_subjects_2:
            return False, "科目错误！"
    else:
        if subject not in involve_subjects_2:
            return False, "科目错误！"

    set_prefix = "{}_infos.".format(infos_name)
    add_suffix1 = ""
    add_suffix2 = ""
    if infos_name == "ledger":
        set_prefix += "ledger_infos_{}.".format(ledger_period)
        add_suffix1 += ".ledger{}_confirm".format(ledger_period)
        add_suffix2 += ".ledger{}_saved".format(ledger_period)
    set_key = set_prefix + subject
    add_key1 = "schedule_confirm.{}_confirm{}".format(infos_name, add_suffix1)
    add_key2 = "schedule_saved.{}_saved{}".format(infos_name, add_suffix2)

    if subject not in confirmed:
        # 若当前账户信息提交未确认，则确认提交或保存
        return _deal_update(submit_type=submit_type,
                            find_dict=dict(_id=_id),
                            update_confirm={"$set"     : {set_key: infos},
                                            "$addToSet": {add_key1: subject, add_key2: subject}},
                            update_save={"$set": {set_key: infos}, "$addToSet": {add_key2: subject}})
    elif subject in confirmed:
        # 已提交确认
        return False, "已经提交过！"
    return result, message


def _deal_update(submit_type, find_dict, update_confirm, update_save):
    # 若当前账户信息提交未确认，则确认提交或保存
    if submit_type == "confirm":
        # 提交类型为确认提交
        mongo.db.company.update(find_dict, update_confirm)
    elif submit_type == "save":
        # 提交类型为保存
        mongo.db.company.update(find_dict, update_save)
    return True, ""


def _get_infos(infos_name):
    """
    获取信息

    :param infos_name: infos name
    """

    def get_company():
        nonlocal infos_name
        t_company = None
        t_company_cp = None
        username = session.get("username")
        if infos_name in {"key_element", "subject", "entry", "acc_document"}:
            filter_dict.update({"businesses": 1})
        if infos_name in {"ledger", "subsidiary_account"}:
            filter_dict.update({"involve_subjects": 1})
        companies = mongo.db.company.find({"student_no": {"$regex": r"^{}".format(username)}}, filter_dict)
        for company_t in companies:
            if company_t.get("student_no").endswith("_cp"):
                t_company_cp = company_t
            else:
                t_company = company_t
        t_company = t_company if t_company else None
        t_company_cp = t_company_cp if t_company_cp else None
        return t_company, t_company_cp

    infos_key = "{}_infos".format(infos_name)
    filter_dict = {infos_key: 1, "student_no": 1, "schedule_confirm": 1, "schedule_saved": 1, "evaluation": 1}

    company, company_cp = get_company()
    infos = company.get("{}_infos".format(infos_name))
    answer_infos = company_cp.get("{}_infos".format(infos_name))
    schedule_confirm = company.get("schedule_confirm")
    schedule_saved = company.get("schedule_saved")
    confirmed = schedule_confirm.get("{}_confirm".format(infos_name))
    saved = schedule_saved.get("{}_saved".format(infos_name))
    # if is_first:
    #    times = "first" if is_first == 1 else "second"
    #    confirmed = confirmed.get(times) if confirmed else False
    #    saved = saved.get(times) if saved else False
    return infos, answer_infos, confirmed, saved, company, company_cp


def get_data(type_num, infos_name, info_keys):
    """
    获取信息，数据封装

    :param type_num:
    :param infos_name:
    :param info_keys:
    """
    info_keys.append("scores")
    info_len = len(info_keys)
    scores = None
    confirm_flag = False
    infos, answer_infos, confirmed, saved, company, company_cp = _get_infos(infos_name=infos_name)
    evaluation = company_cp.get("evaluation")
    if type_num == 1:
        # 1.“二三四”以及“六的会计凭证部分”
        if len(confirmed) == MAX_BUSINESS_NO:
            if not evaluation or not evaluation.get("{}_score".format(infos_name)):
                scores = evaluate(infos_name=infos_name, company=company, company_cp=company_cp)
                update_scores(infos_name)
            else:
                scores = evaluation.get("{}_score".format(infos_name))
            confirm_flag = True
    elif type_num == 2:
        # 2.非“二三四以及六的会计凭证部分 ”以及“账户和明细账部分”
        td = {"trend_analysis", "common_ratio_analysis"}
        td = infos_name in td
        if td and confirmed.get("first") and confirmed.get("second") or (not td and confirmed):
            if not evaluation or not evaluation.get("{}_score".format(infos_name)):
                scores = evaluate(infos_name=infos_name, company=company, company_cp=company_cp)
                involve_schedule_names = ['balance_sheet', 'acc_balance_sheet', 'profit_statement',
                                          'ratio_analysis', 'dupont_analysis']
                if infos_name in involve_schedule_names:
                    update_scores(infos_name)
            else:
                scores = evaluation.get("{}_score".format(infos_name))
            confirm_flag = True
    elif type_num == 3:
        # 3.“账户和明细账部分”
        involve_subjects = company.get("involve_subjects")
        involve_subjects_1 = involve_subjects.get("involve_subjects_1")
        involve_subjects_2 = involve_subjects.get("involve_subjects_2")
        if infos_name == "ledger":
            ledger1_confirm = confirmed.get("ledger1_confirm")
            ledger2_confirm = confirmed.get("ledger2_confirm")
            if ledger1_confirm and ledger1_confirm:
                if set(involve_subjects_1) == set(ledger1_confirm) and set(involve_subjects_2) == set(ledger2_confirm):
                    if not evaluation or not evaluation.get("{}_score".format(infos_name)):
                        scores = evaluate(infos_name=infos_name, company=company, company_cp=company_cp)
                    else:
                        scores = evaluation.get("{}_score".format(infos_name))
                    confirm_flag = True
        elif infos_name == "subsidiary_account":
            if set(confirmed) == set(involve_subjects_2):
                if not evaluation or not evaluation.get("{}_score".format(infos_name)):
                    scores = evaluate(infos_name=infos_name, company=company, company_cp=company_cp)
                else:
                    scores = evaluation.get("{}_score".format(infos_name))
                confirm_flag = True

    if not confirm_flag:
        answer_infos = None
    info_values = [infos, answer_infos, confirmed, saved, scores]
    data = {info_keys[i]: info_values[i] for i in range(0, info_len)}
    return data


# 对业务一录入分数
def update_business_score():
    student_no = session.get("username")
    user_info = mongo.db.user.find_one(dict(student_no=student_no),
                                            dict(_id=0, student_class=1, student_name=1))
    student_class = user_info.get("student_class")
    student_Name = user_info.get("student_name")
    if student_Name:
        student_name = student_Name
    else:
        student_name = "Default"
    # 第一次更新时输入所有的键值  学号 班级 姓名 总分 各部分
    infos = {"student_no": student_no, "student_class": student_class, "student_name": student_name}
    score = [100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    score_keys = ['sum_score', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
    score_infos = dict(zip(score_keys, score))
    infos.update(score_infos)

    mongo.db.score.insert(infos)


def update_scores(schedule_name):
    """
    	用户每次提交更新用户的成绩信息
    	:return:
    	"""
    student_no = session.get("username")
    # 分数信息
    evaluation_info = mongo.db.company.find_one(dict(student_no=student_no),
                                                dict(_id=0, evaluation=1))
    if evaluation_info:
        evaluation_scores = evaluation_info.get("evaluation")
    # 成绩信息
    user_score_info = mongo.db.score.find_one(dict(student_no=student_no), dict(_id=0))

    def update_key_element():
        if evaluation_scores.get("key_element_score"):
            key_element_sum_score = evaluation_scores.get("key_element_score")[-1]
            sum_score = round(user_score_info.get("sum_score") + key_element_sum_score, 2)
            mongo.db.score.update(dict(student_no=student_no), {"$set":dict(sum_score=sum_score, two=key_element_sum_score)})

    def update_subject():
        if evaluation_scores.get("subjects_score"):
            subject_sum_score = evaluation_scores.get("subjects_score")[-1]
            sum_score = round(user_score_info.get("sum_score") + subject_sum_score, 2)
            mongo.db.score.update(dict(student_no=student_no),
                                  {"$set": dict(sum_score=sum_score, three=subject_sum_score)})

    def update_entry():
        if evaluation_scores.get("entry_score"):
            entry_sum_score = evaluation_scores.get("entry_score")[-1]
            sum_score = round(user_score_info.get("sum_score") + entry_sum_score, 2)
            mongo.db.score.update(dict(student_no=student_no),
                                  {"$set": dict(sum_score=sum_score, four=entry_sum_score)})

    def update_schedule_five():
        ledger_score_sum = 0
        # part 1
        ledger_score = evaluation_scores.get("ledger_score")
        if ledger_score:
            ledger_score_sum += ledger_score.get("first")
            ledger_score_sum += ledger_score.get("second")
        # part 2
        balance_sheet_score = evaluation_scores.get("balance_sheet_score")
        if balance_sheet_score:
            ledger_score_sum += balance_sheet_score
        sum_score = round(user_score_info.get("sum_score") + ledger_score_sum, 2)
        mongo.db.score.update(dict(student_no=student_no),
                              {"$set": dict(sum_score=sum_score, five=round(ledger_score_sum, 2))})


    def update_acc_document():
        if evaluation_scores.get("acc_document_score"):
            acc_sum_score = evaluation_scores.get("acc_document_score")[-1]
            sum_score = round(acc_sum_score + user_score_info.get("sum_score"), 2)
            mongo.db.score.update(dict(student_no=student_no),
                                  {"$set": dict(sum_score=sum_score, six=acc_sum_score)})


    def update_schedule_seven():
        # 会计账簿
        account_score_sum = 0
        # part 1
        subsidiary_account_score = evaluation_scores.get("subsidiary_account_score")
        if subsidiary_account_score:
            account_score_sum += subsidiary_account_score
        # part 2
        acc_balance_sheet_score = evaluation_scores.get("acc_balance_sheet_score")
        if acc_balance_sheet_score:
            account_score_sum += acc_balance_sheet_score
        sum_score = round(user_score_info.get("sum_score") + account_score_sum, 2)
        mongo.db.score.update(dict(student_no=student_no),
                              {"$set": dict(sum_score=sum_score, seven=round(account_score_sum, 2))})


    def update_schedule_eight():
        # 会计报表
        statements_score = 0
        new_balance_sheet_score = evaluation_scores.get("new_balance_sheet_score")
        profit_statement_score = evaluation_scores.get("profit_statement_score")
        if new_balance_sheet_score:
            statements_score += new_balance_sheet_score
        if profit_statement_score:
            statements_score += profit_statement_score
        sum_score = round(user_score_info.get("sum_score") + statements_score, 2)
        mongo.db.score.update(dict(student_no=student_no),
                              {"$set": dict(sum_score=sum_score, eight=round(statements_score, 2))})


    def update_schedule_nine():
        analysis_score_sum = 0
        trend_analysis_score = evaluation_scores.get("trend_analysis_score")
        common_ratio_analysis_score = evaluation_scores.get("common_ratio_analysis_score")
        ratio_analysis_score = evaluation_scores.get("ratio_analysis_score")
        if trend_analysis_score:
            analysis_score_sum = analysis_score_sum + trend_analysis_score.get("first") + trend_analysis_score.get(
                "second")
        if common_ratio_analysis_score:
            analysis_score_sum = analysis_score_sum + common_ratio_analysis_score.get(
                "first") + common_ratio_analysis_score.get("second")
        if ratio_analysis_score:
            analysis_score_sum = analysis_score_sum + ratio_analysis_score
        sum_score = round(user_score_info.get("sum_score") + analysis_score_sum, 2)
        mongo.db.score.update(dict(student_no=student_no),
                              {"$set": dict(sum_score=sum_score, nine=round(analysis_score_sum, 2))})


    def update_schedule_ten():
        if evaluation_scores.get("dupont_analysis_score"):
            dupont_analysis_score = evaluation_scores.get("dupont_analysis_score")
            sum_score = round(user_score_info.get("sum_score") + dupont_analysis_score, 2)
            mongo.db.score.update(dict(student_no=student_no),
                              {"$set": dict(sum_score=sum_score, ten=round(dupont_analysis_score, 2))})

    update_schedule_dict = dict(key_element=update_key_element,
                                subject=update_subject,
                                entry=update_entry,
                                balance_sheet=update_schedule_five,
                                acc_document=update_acc_document,
                                acc_balance_sheet=update_schedule_seven,
                                profit_statement=update_schedule_eight,
                                ratio_analysis=update_schedule_nine,
                                dupont_analysis=update_schedule_ten
                                )
    if schedule_name in update_schedule_dict:
        update_schedule_dict[schedule_name]()
