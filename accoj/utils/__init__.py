#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:57
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : __init__.py.py
# @Software: PyCharm
from functools import wraps
from _datetime import datetime
from flask import session, redirect, url_for, request, abort
from accoj.extensions import mongo

ALLOWED_EXTENSIONS = {'zip', 'rar'}


def login_required(func):
    """
    需要登陆
    :param func:
    :return:
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        if session.get('username'):
            return func(*args, **kwargs)
        else:
            return redirect(url_for('index.index'))

    return wrapper


def complete_required1(func):
    """
    需要第一次课程完成
    :param func:
    :return:
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        schedule = get_schedule()
        schedule_confirm = schedule.get("schedule_confirm")
        if schedule_confirm.get("business_confirm"):
            return func(*args, **kwargs)
        else:
            return redirect("/coursei")

    return wrapper


def limit_content_length(max_length):
    """
    上传数据最大限制
    :param max_length: Byte
    :return:
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cl = request.content_length
            if cl is not None and cl > max_length:
                abort(413)
            return func(*args, **kwargs)

        return wrapper

    return decorator


def get_schedule():
    """
    获取进度表
    :return: dict: schedule_confirm, schedule_saved
    """
    company = mongo.db.company.find_one(dict(student_no=session.get("username")),
                                        dict(schedule_confirm=1, schedule_saved=1))
    if company:
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        return dict(schedule_confirm=schedule_confirm, schedule_saved=schedule_saved)


def submit_infos1(infos, submit_type, infos_name):
    """
    提交信息（第一类，非第九次课程一二部分、第六七次）
    :param infos: submit infos
    :param submit_type: submit type
    :param infos_name: infos name
    :return: (boolean: result, str: message)
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

        if not schedule_confirm.get("{}_confirm".format(infos_name)):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"{}".format(infos_name)                         : infos,
                                                  "schedule_confirm.{}_confirm".format(infos_name): True,
                                                  "schedule_saved.{}_saved".format(infos_name)    : True}}
                                        )
                return True, ""

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"{}".format(infos_name)                     : infos,
                                                  "schedule_saved.{}_saved".format(infos_name): True}}
                                        )
                return True, ""

        elif schedule_confirm.get("{}_confirm".format(infos_name)):
            # 信息已提交确认
            return False, "已经确认提交过"

    return result, message


def submit_infos2(infos, submit_type, infos_name, is_first):
    """
    提交信息（第二类，第九次课程一二部分）
    :param infos: submit infos
    :param submit_type: submit type
    :param infos_name: infos name
    :param is_first: boolean
    :return: (boolean: result, str: message)
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
        confirm = schedule_confirm.get("common_ratio_analysis_confirm")

        if not confirm or not confirm.get("{}".format(times)):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"{}_infos.{}".format(infos_name, sheet_name)              : infos,
                                                  "schedule_confirm.{}_confirm.{}".format(infos_name, times): True,
                                                  "schedule_saved.{}_saved.{}".format(infos_name, times)    : True}}
                                        )
                return True, ""

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"{}_infos.{}".format(infos_name, sheet_name)          : infos,
                                                  "schedule_saved.{}_saved.{}".format(infos_name, times): True}}
                                        )
                return True, ""
        elif schedule_confirm.get("{}_confirm".format(infos_name)).get("{}".format(times)):
            # 信息已提交确认
            return False, "已经确认提交过"

    return result, message


def submit_infos3(infos, submit_type, business_no, infos_name, affect_type=""):
    """
    提交信息（第三类，第二三四六次课程）
    :param infos: submit infos
    :param submit_type: submit type
    :param business_no: business_no
    :param infos_name: infos name
    :param affect_type: affect_type
    :return: (boolean: result, str: message)
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

        update_prefix = "businesses." + str(business_no)
        if affect_type:
            set_dict = {(update_prefix + ".{}_infos".format(infos_name)): infos,
                        (update_prefix + ".affect_type")                : affect_type}
        else:
            set_dict = {(update_prefix + ".{}_infos".format(infos_name)): infos}
        if submit_type == "confirm":
            # 提交类型为确认提交
            mongo.db.company.update({"_id": _id},
                                    {"$set"     : set_dict,
                                     "$addToSet": {"schedule_confirm.{}_confirm".format(infos_name): business_no,
                                                   "schedule_saved.{}_saved".format(infos_name)    : business_no}}
                                    )
            return True, ""

        elif submit_type == "save":
            # 提交类型为保存
            mongo.db.company.update({"_id": _id},
                                    {"$set"     : set_dict,
                                     "$addToSet": {"schedule_saved.{}_saved".format(infos_name): business_no}}
                                    )
            return True, ""

    elif business_no in schedule_confirm.get("{}_confirm".format(infos_name)):
        # 业务已提交确认
        return False, "此业务已经提交过！"

    return result, message


def submit_infos4(infos, submit_type, subject, infos_name):
    """
    提交信息（第四类，账户和明细账部分）
    :param infos: submit infos
    :param submit_type: submit type
    :param subject: subject
    :param infos_name: infos name
    :return: (boolean: result, str: message)
    """
    result, message = False, "未知错误！"
    if submit_type not in ["confirm", "save"]:
        return False, "提交类型错误！"

    company = mongo.db.company.find_one({"student_no": session.get("username")},
                                        dict(businesses=1, schedule_confirm=1, involve_subjects=1))
    _id = company.get("_id")
    schedule_confirm = company.get("schedule_confirm")
    involve_subjects = company.get("involve_subjects")

    if subject not in involve_subjects:
        return False, "科目错误！"

    if subject not in schedule_confirm.get("subsidiary_account_confirm"):
        # 若当前账户信息提交未确认，则确认提交或保存
        update_prefix = "{}_infos.".format(infos_name)
        if submit_type == "confirm":
            # 提交类型为确认提交
            mongo.db.company.update({"_id": _id},
                                    {"$set"        : {
                                        (update_prefix + subject): infos},
                                        "$addToSet": {"schedule_confirm.{}_confirm".format(infos_name): subject,
                                                      "schedule_saved.{}_saved".format(infos_name)    : subject}}
                                    )
            return True, ""
        elif submit_type == "save":
            # 提交类型为保存
            mongo.db.company.update({"_id": _id},
                                    {"$set"        : {
                                        (update_prefix + subject): infos},
                                        "$addToSet": {"schedule_saved.{}_saved".format(infos_name): subject}}
                                    )
            return True, ""
    elif subject in schedule_confirm.get("{}_confirm").format(infos_name):
        # 已提交确认
        return False, "已经提交过！"
    return result, message


def get_infos1(infos_name):
    """
    获取信息（第一类，用于非第九次课程一二部分、第六七次）
    :param infos_name: infos name
    :return: infos, confirmed, saved
    """
    company = mongo.db.company.find_one({"student_no": session.get("username")},
                                        {"{}_infos".format(infos_name): 1,
                                         "schedule_confirm"           : 1,
                                         "schedule_saved"             : 1,
                                         "_id"                        : 0})

    infos = company.get("{}_infos".format(infos_name))
    schedule_confirm = company.get("schedule_confirm")
    schedule_saved = company.get("schedule_saved")
    confirmed = schedule_confirm.get("{}_confirm".format(infos_name))
    saved = schedule_saved.get("{}_saved".format(infos_name))
    return infos, confirmed, saved


def get_infos2(is_first, infos_name):
    """
    获取信息（第二类，用于第九次课程一二部分）
    :param is_first: boolean
    :param infos_name: infos name
    :return: infos, confirmed, saved
    """
    company = mongo.db.company.find_one({"student_no": session.get("username")},
                                        {"{}_infos".format(infos_name): 1,
                                         "schedule_confirm"           : 1,
                                         "schedule_saved"             : 1,
                                         "_id"                        : 0})
    times = "first" if is_first else "second"
    infos = company.get("{}_infos".format(infos_name))
    schedule_confirm = company.get("schedule_confirm")
    schedule_saved = company.get("schedule_saved")
    confirmed = schedule_confirm.get("{}_confirm".format(infos_name))
    confirmed = confirmed.get(times) if confirmed else False
    saved = schedule_saved.get("{}_saved".format(infos_name))
    saved = saved.get(times) if saved else False
    return infos, confirmed, saved


def get_infos3(infos_name):
    """
    获取信息（第三类，用于第二三四六次课程）
    :param infos_name: infos name
    :return: infos, confirmed, saved
    """
    company = mongo.db.company.find_one({"student_no": session.get("username")},
                                        {"businesses"      : 1,
                                         "schedule_confirm": 1,
                                         "schedule_saved"  : 1,
                                         "_id"             : 0})
    businesses = company.get("businesses")
    schedule_confirm = company.get("schedule_confirm")
    schedule_saved = company.get("schedule_saved")
    confirmed = schedule_confirm.get("{}_confirm".format(infos_name))
    saved = schedule_saved.get("{}_saved".format(infos_name))
    infos = list()
    businesses_len = len(businesses)
    if infos_name == "key_element":
        for i in range(0, businesses_len):
            info = businesses[i].get("{}_infos".format(infos_name))
            affect_type = businesses[i].get("affect_type")
            infos.append({"{}_info".format(infos_name): info, "affect_type": affect_type})
    else:
        for i in range(0, businesses_len):
            info = businesses[i].get("{}_infos".format(infos_name))
            infos.append({"{}_info".format(infos_name): info})
    return infos, confirmed, saved


def is_number(s):
    """
    判断字符串能否转换为数字
    :param s: 字符串
    :return: 能转换为数字为True，否则为False
    """
    try:
        float(s)
        return True
    except ValueError:
        pass

    try:
        import unicodedata
        unicodedata.numeric(s)
        return True
    except (TypeError, ValueError):
        pass

    return False


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS
