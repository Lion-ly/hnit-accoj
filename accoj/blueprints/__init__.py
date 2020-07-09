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
    获取信息，数据封装，每次课程完成将计算评分

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
                # 每次课程完成将计算评分
                scores = evaluate(infos_name=infos_name, company=company, company_cp=company_cp)
                update_rank(infos_name, scores)
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
                update_rank(infos_name, scores)
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
                        update_rank(infos_name, scores)
                    else:
                        scores = evaluation.get("{}_score".format(infos_name))
                    confirm_flag = True
        elif infos_name == "subsidiary_account":
            if set(confirmed) == set(involve_subjects_2):
                if not evaluation or not evaluation.get("{}_score".format(infos_name)):
                    scores = evaluate(infos_name=infos_name, company=company, company_cp=company_cp)
                    update_rank(infos_name, scores)
                else:
                    scores = evaluation.get("{}_score".format(infos_name))
                confirm_flag = True

    if not confirm_flag:
        answer_infos = None
    info_values = [infos, answer_infos, confirmed, saved, scores]
    data = {info_keys[i]: info_values[i] for i in range(0, info_len)}
    return data



def get_schedule(student_no):
    schedule_info = mongo.db.company.find_one(dict(student_no=student_no),
                                              dict(_id=0, schedule_confirm=1))
    # 判断是否有进度
    if schedule_info:
        data = []
        schedule_info = schedule_info.get("schedule_confirm")
        # 获取涉及的科目数量
        involve_subjects = mongo.db.company.find_one(dict(student_no=student_no),
                                                     dict(_id=0, involve_subjects=1)).get("involve_subjects")
        if not involve_subjects:
            return
        involve_subjects_1 = involve_subjects.get("involve_subjects_1")
        involve_subjects_2 = involve_subjects.get("involve_subjects_2")
        sum_subjects_len = len(set(involve_subjects_1 + involve_subjects_2))

        # 获取进度值
        trend_analysis_confirm = schedule_info.get("trend_analysis_confirm")
        common_ratio_analysis_confirm = schedule_info.get("common_ratio_analysis_confirm")

        if schedule_info.get("business_confirm"):
            data.append(100)

        key_element_schedule = int((len(schedule_info.get("key_element_confirm")) / 20) * 100)
        data.append(key_element_schedule)

        subject_schedule = int((len(schedule_info.get("subject_confirm")) / 20) * 100)
        data.append(subject_schedule)

        entry_schedule_schedule = int((len(schedule_info.get("entry_confirm")) / 20) * 100)
        data.append(entry_schedule_schedule)

        # ledger_confirm   25 25 50
        ledger__schedule = 0
        ledger__schedule += int(
            (len(schedule_info.get("ledger_confirm").get("ledger1_confirm")) / len(involve_subjects_1)) * 25)
        ledger__schedule += int(
            (len(schedule_info.get("ledger_confirm").get("ledger2_confirm")) / len(involve_subjects_2)) * 25)
        if schedule_info.get("balance_sheet_confirm"):
            ledger__schedule += 50
        data.append(ledger__schedule)

        acc_document_schedule = int((len(schedule_info.get("acc_document_confirm")) / 20) * 100)
        data.append(acc_document_schedule)

        # 会计账簿部分进度
        account_schedule = 0
        account_schedule += int(
            (len(schedule_info.get("subsidiary_account_confirm")) / sum_subjects_len) * 50)
        if schedule_info.get("acc_balance_sheet_confirm"):
            account_schedule += 50
        data.append(account_schedule)

        # 会计报表部分进度
        Financial_Statements_schecule = 0
        if schedule_info.get("new_balance_sheet_confirm"):
            Financial_Statements_schecule += 50
        if schedule_info.get("profit_statement_confirm"):
            Financial_Statements_schecule += 50
        data.append(Financial_Statements_schecule)

        # 因素分析未做  20*5 or 15*4+20*2
        analysis_schedule = 0
        if trend_analysis_confirm.get("first"):
            analysis_schedule += 20
        if trend_analysis_confirm.get("second"):
            analysis_schedule += 20
        if common_ratio_analysis_confirm.get("first"):
            analysis_schedule += 20
        if common_ratio_analysis_confirm.get("second"):
            analysis_schedule += 20
        if schedule_info.get("ratio_analysis_confirm"):
            analysis_schedule += 20
        data.append(analysis_schedule)

        # 杜邦
        dupont_schedule = 0
        if schedule_info.get("dupont_analysis_confirm"):
            dupont_schedule += 100
        data.append(dupont_schedule)

        return data



#  -----rank集合存入成绩
# 对业务一录入分数进rank
def update_business_rank_score():
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

    mongo.db.rank.insert(infos)


def update_rank(schedule_name, evaluation=None):
    """
    	用户每次提交更新用户的排行榜集合中的成绩等信息
    	:return:
    	"""
    student_no = session.get("username")
    # 分数信息
    if evaluation:
        evaluation_scores = evaluation
    # 排行集合成绩信息
    user_score_info = mongo.db.rank.find_one(dict(student_no=student_no), dict(_id=0))

    def update_key_element():
        key_element_sum_score = evaluation_scores[-1]
        sum_score = round(user_score_info.get("sum_score") + key_element_sum_score, 2)
        mongo.db.rank.update(dict(student_no=student_no), {"$set":dict(sum_score=sum_score, two=key_element_sum_score)})

    def update_subject():
        subject_sum_score = evaluation_scores[-1]
        sum_score = round(user_score_info.get("sum_score") + subject_sum_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                              {"$set": dict(sum_score=sum_score, three=subject_sum_score)})

    def update_entry():
        entry_sum_score = evaluation_scores[-1]
        sum_score = round(user_score_info.get("sum_score") + entry_sum_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                              {"$set": dict(sum_score=sum_score, four=entry_sum_score)})

    # 第五部分得分
    # 账户得分
    def update_ledger():
        ledger_score_sum = evaluation.get("first") + evaluation.get("second")
        sum_score = round(user_score_info.get("sum_score") + ledger_score_sum, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, five=round(ledger_score_sum, 2))})

    # 平衡表得分
    def update_balance_sheet():
        ledger_score_sum = user_score_info.get("five")
        ledger_score_sum += evaluation
        sum_score = user_score_info.get("sum_score")
        sum_score += evaluation
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=round(sum_score, 2), five=round(ledger_score_sum, 2))})


    # 第六部分 会计凭证部分得分
    def update_acc_document():
        acc_sum_score = evaluation_scores[-1]
        sum_score = round(acc_sum_score + user_score_info.get("sum_score"), 2)
        mongo.db.rank.update(dict(student_no=student_no),
                              {"$set": dict(sum_score=sum_score, six=acc_sum_score)})

    # 会计账簿部分得分
    # 明细账
    def update_subsidiary_account():
        sum_score = round(evaluation + user_score_info.get("sum_score"), 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, seven=evaluation)})


    # 科目余额表
    def update_acc_balance_sheet():
        sum_score = round(evaluation + user_score_info.get("sum_score"), 2)
        this_sum_score = user_score_info.get("seven")
        this_sum_score = round(this_sum_score + evaluation, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, seven=this_sum_score)})


    # 会计报表部分得分
    # 资产负债表
    def update_new_balance_sheet():
        sum_score = round(evaluation + user_score_info.get("sum_score"), 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, eight=evaluation)})


    # 利润表
    def update_profit_statement():
        sum_score = round(evaluation + user_score_info.get("sum_score"), 2)
        this_sum_score = user_score_info.get("eight")
        this_sum_score = round(this_sum_score + evaluation, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, eight=this_sum_score)})



    # 会计报表部分得分
    # 趋势分析法得分
    def update_trend_analysis():
        trend_analysis_score_sum =  evaluation.get("first").get("student_score") + \
                             evaluation.get("second").get("student_score")
        trend_teacher_score_1 = evaluation.get("first").get("teacher_score")
        trend_teacher_score_2 = evaluation.get("second").get("teacher_score")

        if trend_teacher_score_1 >= 0:
            trend_analysis_score_sum += trend_teacher_score_1
        if trend_teacher_score_2 >= 0:
            trend_analysis_score_sum += trend_teacher_score_2
        sum_score = round(user_score_info.get("sum_score") + trend_analysis_score_sum, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, nine=round(trend_analysis_score_sum, 2))})


    # 共同比分析法
    def update_common_ratio_analysis():
        analysis_sum_score = user_score_info.get("nine")
        common_analysis_score = evaluation.get(
            "first").get("student_score") + evaluation.get("second").get("student_score")
        common_ratio_teacher_score_1 = evaluation.get("first").get("teacher_score")
        common_ratio_teacher_score_2 = evaluation.get("second").get("teacher_score")
        if common_ratio_teacher_score_1 >= 0:
            common_analysis_score += common_ratio_teacher_score_1
        if common_ratio_teacher_score_2 >= 0:
            common_analysis_score += common_ratio_teacher_score_2
        analysis_sum_score = round(analysis_sum_score + common_analysis_score, 2)
        sum_score = round(user_score_info.get("sum_score") + common_analysis_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, nine=analysis_sum_score)})

    def update_ratio_analysis():
        analysis_sum_score = user_score_info.get("nine")
        ratio_analysis_score = evaluation_scores.get("student_score")
        ratio_analysis_teacher_score = evaluation.get("teacher_score")
        if ratio_analysis_teacher_score >= 0:
            ratio_analysis_score += ratio_analysis_teacher_score

        analysis_sum_score += ratio_analysis_score
        sum_score = round(user_score_info.get("sum_score") + ratio_analysis_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                             {"$set": dict(sum_score=sum_score, nine=analysis_sum_score)})



    def update_dupont_analysis():
        dupont_analysis_sum_score = evaluation.get("student_score")
        dupont_analysis_teacher_score = evaluation.get("teacher_score")
        if dupont_analysis_teacher_score >= 0:
            dupont_analysis_sum_score += dupont_analysis_teacher_score

        sum_score = round(user_score_info.get("sum_score") + dupont_analysis_sum_score, 2)
        mongo.db.rank.update(dict(student_no=student_no),
                          {"$set": dict(sum_score=sum_score, ten=round(dupont_analysis_sum_score, 2))})

    update_schedule_dict = dict(key_element=update_key_element,
                                subject=update_subject,
                                entry=update_entry,
                                # 会计账户和平衡表
                                ledger=update_ledger,
                                balance_sheet=update_balance_sheet,
                                acc_document=update_acc_document,
                                # 明细账和科目余额表
                                subsidiary_account=update_subsidiary_account,
                                acc_balance_sheet=update_acc_balance_sheet,
                                # 资产负债和利润表部分
                                new_balance_sheet=update_new_balance_sheet,
                                profit_statement=update_profit_statement,
                                # 第九部分 趋势分析  比率分析
                                trend_analysis=update_trend_analysis,
                                common_ratio_analysis=update_common_ratio_analysis,
                                ratio_analysis=update_ratio_analysis,
                                # 第十部分
                                dupont_analysis=update_dupont_analysis
                                )
    if schedule_name in update_schedule_dict:
        update_schedule_dict[schedule_name]()
