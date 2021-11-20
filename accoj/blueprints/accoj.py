#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:55
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : accoj.py
# @Software: PyCharm
from flask import (Blueprint,
                   render_template,
                   jsonify,
                   session,
                   redirect,
                   url_for)
from accoj.utils import (login_required,
                         complete_required1,
                         course_time_open_required,
                         course_time_not_end_required,
                         availability_of_the_team,
                         is_leader,
                         manage_exercises_permission, login_required_student)
from accoj.blueprints import submit_infos, get_data
from accoj.utils import (is_number,
                         limit_content_length,
                         update_business_rank_score)
from accoj.extensions import mongo
from accoj.deal_business.create_businesses import create_businesses
from accoj.deal_business import cal_answer
from flask import request

accoj_bp = Blueprint('accoj', __name__)
MAX_BUSINESS_NO = 20


# 第一次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursei', methods=['GET', 'POST'])
@availability_of_the_team
@course_time_open_required(1)
def coursei():
    """
    第一次课程
    """
    return render_template('course/coursei.html')


@accoj_bp.route('/get_company_info', methods=['POST'])
def get_company_info():
    """
    获取公司信息
    """
    company = mongo.db.company.find_one(dict(student_no=session.get("username")),
                                        dict(_id=0, com_name=1, com_address=1, com_business_addr=1,
                                             com_legal_rep=1,
                                             com_regist_cap=1, com_operate_period=1, com_business_scope=1,
                                             com_shareholder=1))
    # 公司已经创立过，填充表单
    if company:
        return jsonify(result=True, company_info=company)
    return jsonify(result=False, message="未知错误！")


@accoj_bp.route('/submit_company_info', methods=['POST'])
@is_leader
@course_time_not_end_required(1)
def submit_company_info():
    """
    提交公司创立信息表单
    """

    def get_schedule_dict(schedule_type):
        def format_key(t_key):
            return "{}_{}".format(t_key, schedule_type)

        return {format_key("business"): False,
                format_key("key_element"): [],
                format_key("subject"): [],
                format_key("entry"): [],
                format_key("ledger"): {format_key("ledger1"): [], format_key("ledger2"): []},
                format_key("balance_sheet"): False,
                format_key("acc_document"): [],
                format_key("subsidiary_account"): [],
                format_key("acc_balance_sheet"): False,
                format_key("new_balance_sheet"): False,
                format_key("profit_statement"): False,
                format_key("trend_analysis"): {"first": False, "second": False},
                format_key("common_ratio_analysis"): {"first": False, "second": False},
                format_key("ratio_analysis"): False,
                format_key("dupont_analysis"): False, }

    company = mongo.db.company.find_one({"student_no": session.get("username")})
    if company is not None:
        return jsonify(result=False, message="已经创立过公司！")
    json_data = request.get_json()
    data_list = ["com_name", "com_address", "com_business_addr", "com_legal_rep", "com_regist_cap",
                 "com_operate_period", "com_business_scope", "com_shareholder_1", "com_shareholder_2",
                 "com_shareholder_3", "com_shareholder_4", "com_shareholder_5"]
    data_dict = dict()
    data_dict["com_shareholder"] = []
    err_pos = []

    data_dict["student_no"] = session.get("username")
    for data_name in data_list:
        data_dict[data_name] = json_data.get(data_name)

    flag = True
    shareholder_num = 0
    for key, value in data_dict.items():
        if not value and key != "com_shareholder":
            if not key.startswith("com_shareholder_"):
                flag = False
                err_pos.append({"err_pos": key})
            else:
                shareholder_num += 1
                if key == "com_shareholder_1":
                    err_pos.append({"err_pos": key})
        else:
            if key.startswith("com_shareholder_"):
                shareholder_num += 1
                data_dict["com_shareholder"].append(value)
            elif key == "com_operate_period":
                if not is_number(value):
                    flag = False
                    err_pos.append({"err_pos": key})
                else:
                    value = float(value)
                    if value < 5 or value > 500:
                        flag = False
                        err_pos.append({"err_pos": key})
            elif key == "com_regist_cap":
                if not is_number(value):
                    flag = False
                    err_pos.append({"err_pos": key})
                else:
                    value = float(value)
                    if value < 100 or value > 1000:
                        flag = False
                        err_pos.append({"err_pos": key})

    if not shareholder_num:
        flag = False
    if not flag:
        return jsonify(result=False, err_pos=err_pos, message="信息未填写完整或信息填写格式错误！")
    else:
        for key in list(data_dict.keys()):
            if key.startswith("com_shareholder_"):
                data_dict.pop(key)
            elif key == "com_regist_cap" or key == "com_operate_period":
                data_dict[key] = float(data_dict[key])
        data_dict["com_bank_savings"] = data_dict["com_regist_cap"] * 10000
        data_dict.update(dict(com_cash=0, business_num=0))

        schedule_confirm = get_schedule_dict("confirm")
        schedule_saved = get_schedule_dict("saved")

        data_dict.update(dict(schedule_confirm=schedule_confirm,
                              schedule_saved=schedule_saved,
                              com_assets=[],
                              businesses=[],
                              key_element_infos=[],
                              subject_infos=[],
                              entry_infos=[],
                              acc_document_infos=[]))
        data_dict_cp = data_dict.copy()
        # 副本公司同时创建
        data_dict_cp["student_no"] = "{}_cp".format(data_dict["student_no"])
        mongo.db.company.insert_many([data_dict, data_dict_cp])
        return jsonify(result=True, message="公司创建成功！")


@accoj_bp.route('/submit_business_info', methods=['POST'])
@is_leader
@course_time_not_end_required(1)
def submit_business_info():
    """
    提交业务内容信息，提交成功后不可修改
    """
    company = mongo.db.company.find_one(dict(student_no="{}".format(session.get("username"))),
                                        dict(businesses=1, business_num=1, schedule_confirm=1, _id=0, ))
    if not company:
        return jsonify(result=False, message="公司未创立")
    schedule_confirm = company.get("schedule_confirm")
    businesses = company.get("businesses")
    business_confirm = schedule_confirm.get("business_confirm")

    if len(businesses) == 0:
        return jsonify(result=False, message="未生成业务！")

    if not business_confirm:
        cal_answer()  # 计算答案

        company_cp = mongo.db.company.find_one(dict(student_no="{}_cp".format(session.get("username"))),
                                               dict(ledger_infos=1, _id=0))
        ledger_infos = company_cp.get("ledger_infos")
        ledger_infos_1 = ledger_infos.get("ledger_infos_1")
        ledger_infos_2 = ledger_infos.get("ledger_infos_2")
        subjects_tmp1 = [key for key in ledger_infos_1]
        subjects_tmp2 = [key for key in ledger_infos_2]

        involve_subjects = dict(involve_subjects_1=subjects_tmp1, involve_subjects_2=subjects_tmp2)
        # 完成第一模块， 分配组队题目权限
        manage_exercises_permission(team_no=session.get("username"))
        mongo.db.company.update({"student_no": {"$regex": r"^{}".format(session.get("username"))}},
                                {"$set": {"schedule_confirm.business_confirm": True,
                                          "involve_subjects": involve_subjects}},
                                multi=True)
        # 更新成绩进排行榜集合
        update_business_rank_score()
        # session 注入permission
        permission = mongo.db.team.find_one({"team_no": session.get("username")},
                                            {"_id": 0, "permission.{}_permission"
                                            .format(session.get("member_no")): 1})
        session["permission"] = permission.get("permission") if permission else None

        return jsonify(result=True)
    else:
        return jsonify(result=False, message="已经提交过！")


@accoj_bp.route('/get_business_info', methods=['POST'])
def get_business_info():
    """
    获取业务内容信息
    """
    username = session.get("username")
    company = mongo.db.company.find_one(dict(student_no="{}".format(username)),
                                        dict(businesses=1, schedule_confirm=1, _id=0))
    if company:
        schedule_confirm = company.get("schedule_confirm")
        confirmed = schedule_confirm.get("business_confirm")
        businesses = company.get("businesses")
        businesses = businesses if businesses else None
        return jsonify(result=True, businesses=businesses, confirmed=confirmed)
    else:
        return jsonify(result=False, message="公司未创立！")


@accoj_bp.route('/create_business', methods=['POST'])
@is_leader
@course_time_not_end_required(1)
def create_business():
    """
    生成业务
    """
    result, message = False, "公司未创立！"
    username = session.get("username")
    company = mongo.db.company.find_one({"student_no": "{}".format(username)})
    if not company:
        return jsonify(result=result, message=message)

    schedule_confirm = company.get("schedule_confirm")
    business_confirm = schedule_confirm.get("business_confirm")
    if business_confirm:
        message = "已经确认提交过"
        return jsonify(result=False, message=message)
    else:
        result, message = create_businesses(company)
        return jsonify(result=result, message=message)


# 第一次课程----end---------------------------------------------------------------------------------


# 第二次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseii', methods=['GET'])
@course_time_open_required(2)
@complete_required1
def courseii():
    """
    第二次课程
    """
    return render_template('course/courseii.html')


@accoj_bp.route('/submit_key_element_info', methods=['POST'])
@course_time_not_end_required(2)
def submit_key_element_info():
    """
    提交会计要素信息
    """
    result, message, wrong_number = False, "错误提交", ""
    json_data = request.get_json()
    infos_name = "key_element"
    submit_type = json_data.get("submit_type")
    key_element_infos = json_data.get("key_element_infos")

    if submit_type == "confirm":
        if not all_save(infos_name):
            result, message = False, "未全部保存！"
        else:
            for i in range(len(key_element_infos)):
                business_no = i + 1
                infos = key_element_infos[i]

                result, message = submit_infos(type_num=3, infos=infos,
                                               submit_type=submit_type,
                                               infos_name=infos_name,
                                               business_no=business_no)
                if not result:
                    wrong_number += "business_" + str(i + 1) + ":" + message + "、"
    elif submit_type == "save":
        business_no = json_data.get("business_no")
        infos = key_element_infos

        result, message = submit_infos(type_num=3, infos=infos,
                                       submit_type=submit_type,
                                       infos_name=infos_name,
                                       business_no=business_no)
    if wrong_number == "":
        return jsonify(result=result, message=message)
    else:
        result, message = False, wrong_number
        return jsonify(result=result, message=message)


@accoj_bp.route('/get_key_element_info', methods=['POST'])
def get_key_element_info():
    """
    获取会计要素信息
    """
    infos_name = "key_element"
    info_keys = ["key_element_infos", "answer_infos", "key_element_confirmed", "key_element_saved"]
    data = get_data(type_num=1, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


# 第二次课程----end---------------------------------------------------------------------------------


# 第三次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseiii', methods=['GET'])
@course_time_open_required(3)
@complete_required1
def courseiii():
    """
    第三次课程
    """
    return render_template('course/courseiii.html')


@accoj_bp.route('/submit_subject_info', methods=['POST'])
@course_time_not_end_required(3)
def submit_subject_info():
    """
    提交会计科目信息
    """
    result, message, wrong_number = False, "错误提交", ""
    json_data = request.get_json()
    infos_name = "subject"
    submit_type = json_data.get("submit_type")
    subject_infos = json_data.get("subject_infos")

    if submit_type == "confirm":
        if not all_save(infos_name):
            result, message = False, "未全部保存！"
        else:
            for i in range(len(subject_infos)):
                business_no = i + 1
                infos = subject_infos[i]

                result, message = submit_infos(type_num=3, infos=infos,
                                               submit_type=submit_type,
                                               infos_name=infos_name,
                                               business_no=business_no
                                               )
                if not result:
                    wrong_number += "business_" + str(i + 1) + ":" + message + "、"
    elif submit_type == "save":
        business_no = json_data.get("business_no")
        infos = subject_infos

        result, message = submit_infos(type_num=3, infos=infos,
                                       submit_type=submit_type,
                                       infos_name=infos_name,
                                       business_no=business_no
                                       )
    if wrong_number == "":
        return jsonify(result=result, message=message)
    else:
        result, message = False, wrong_number
        return jsonify(result=result, message=message)


@accoj_bp.route('/get_subject_info', methods=['POST'])
def get_subject_info():
    """
    获取会计科目信息
    """
    infos_name = "subject"
    info_keys = ["subject_infos", "answer_infos", "subject_confirmed", "subject_saved"]
    data = get_data(type_num=1, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


# 第三次课程----end---------------------------------------------------------------------------------


# 第四次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseiv', methods=['GET'])
@course_time_open_required(4)
@complete_required1
def courseiv():
    """
    第四次课程
    """
    return render_template('course/courseiv.html')


@accoj_bp.route('/submit_entry_info', methods=['POST'])
@course_time_not_end_required(4)
def submit_entry_info():
    """
    提交会计分录信息

    """
    result, message, wrong_number = False, "错误提交", ""
    json_data = request.get_json()
    infos_name = "entry"
    submit_type = json_data.get("submit_type")
    entry_infos = json_data.get("entry_infos")

    if submit_type == "confirm":
        if not all_save(infos_name):
            result, message = False, "未全部保存！"
        else:
            for i in range(len(entry_infos)):
                business_no = i + 1
                infos = entry_infos[i]

                result, message = submit_infos(type_num=3, infos=infos,
                                               submit_type=submit_type,
                                               infos_name=infos_name,
                                               business_no=business_no)
                if not result:
                    wrong_number += "business_" + str(i + 1) + ":" + message + "、"
    elif submit_type == "save":
        business_no = json_data.get("business_no")
        infos = entry_infos

        result, message = submit_infos(type_num=3, infos=infos,
                                       submit_type=submit_type,
                                       infos_name=infos_name,
                                       business_no=business_no)
    if wrong_number == "":
        return jsonify(result=result, message=message)
    else:
        result, message = False, wrong_number
        return jsonify(result=result, message=message)


@accoj_bp.route('/get_entry_info', methods=['POST'])
def get_entry_info():
    """
    获取会计分录信息
    """
    infos_name = "entry"
    info_keys = ["entry_infos", "answer_infos", "entry_confirmed", "entry_saved"]
    data = get_data(type_num=1, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


# 第四次课程----end---------------------------------------------------------------------------------


# 第五次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursev', methods=['GET'])
@course_time_open_required(5)
@complete_required1
def coursev():
    """
    设立账户
    """
    return render_template('course/coursev.html')


@accoj_bp.route('/submit_ledger_info', methods=['POST'])
@course_time_not_end_required(5)
def submit_ledger_info():
    """
    提交会计账户信息
    """
    json_data = request.get_json()
    infos = json_data.get("ledger_info")
    submit_type = json_data.get("submit_type")
    ledger_period = json_data.get("ledger_period")
    if infos:
        subject = infos.get("subject")
    else:
        return jsonify(result=False, message="信息为空")
    infos_name = "ledger"

    result, message = submit_infos(type_num=4, infos=infos, submit_type=submit_type, infos_name=infos_name,
                                   subject=subject, ledger_period=ledger_period)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ledger_info', methods=['POST'])
def get_ledger_info():
    """
    获取会计账户信息
    """
    infos_name = "ledger"
    info_keys = ["ledger_infos", "answer_infos", "ledger_confirmed", "ledger_saved"]
    data = get_data(type_num=3, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


@accoj_bp.route('/delete_ledger_info', methods=['POST'])
@course_time_not_end_required(5)
def delete_ledger_info():
    """
    删除会计账户信息
    """
    json_data = request.get_json()
    subject = json_data.get("subject")
    ledger_period = json_data.get("ledger_period")
    if subject:
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            {"involve_subjects": 1, "schedule_confirm": 1, "_id": 0})
        schedule_confirm = company.get("schedule_confirm")
        involve_subjects = company.get("involve_subjects")
        ledger_confirm = schedule_confirm.get("ledger_confirm")
        if ledger_period == 1:
            ledger_confirm = ledger_confirm.get("ledger1_confirm")
            involve_subjects = involve_subjects["involve_subjects_1"]
        elif ledger_period == 2:
            ledger_confirm = ledger_confirm.get("ledger2_confirm")
            involve_subjects = involve_subjects["involve_subjects_2"]
        else:
            return jsonify(result=False, message="期间错误！")

        if subject in ledger_confirm:
            return jsonify(result=False, message="已经提交过, 删除失败！")
        if subject in involve_subjects:
            unset_key = "ledger_infos.ledger_infos_{}.{}".format(ledger_period, subject)
            pull_key1 = "schedule_confirm.ledger{}_confirm.ledger_confirm".format(ledger_period)
            pull_key2 = "schedule_saved.ledger{}_saved.ledger_saved".format(ledger_period)

            mongo.db.company.update({"student_no": session.get("username")},
                                    {"$unset": {unset_key: True},
                                     "$pull": {pull_key1: subject,
                                               pull_key2: subject}})
            return jsonify(result=True)
        else:
            return jsonify(result=False, message="科目错误！")
    else:
        return jsonify(result=False, message="未知错误！")


@accoj_bp.route('/coursev_2', methods=['GET'])
@course_time_open_required(5)
@complete_required1
def coursev_2():
    """
    平衡表
    """
    return render_template('course/coursev_2.html')


@accoj_bp.route('/submit_balance_sheet_info', methods=['POST'])
@course_time_not_end_required(5)
def submit_balance_sheet_info():
    """
    提交平衡表信息
    """
    json_data = request.get_json()
    infos = json_data.get("balance_sheet_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "balance_sheet"

    result, message = submit_infos(type_num=1, infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_balance_sheet_info', methods=['POST'])
def get_balance_sheet_info():
    """
    获取平衡表信息
    """
    infos_name = "balance_sheet"
    info_keys = ["balance_sheet_infos", "answer_infos", "balance_sheet_confirmed", "balance_sheet_saved"]
    data = get_data(type_num=2, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


# 第五次课程----end---------------------------------------------------------------------------------


# 第六次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursevi', methods=['GET'])
@course_time_open_required(6)
@complete_required1
def coursevi():
    """

    """
    return render_template('course/coursevi.html')


@accoj_bp.route('/submit_acc_document_info', methods=['POST'])
@course_time_not_end_required(6)
@limit_content_length(5 * 1024 * 1024)
def submit_acc_document_info():
    """
    提交会计凭证信息
    """
    result, message, wrong_number = False, "错误提交", ""
    json_data = request.get_json()
    infos_name = "acc_document"
    submit_type = json_data.get("submit_type")
    acc_document_infos = json_data.get("acc_document_infos")

    if submit_type == "confirm":
        if not all_save(infos_name):
            result, message = False, "未全部保存！"
        else:
            for i in range(len(acc_document_infos)):
                business_no = i + 1

                infos = acc_document_infos[i]

                result, message = submit_infos(type_num=3, infos=infos,
                                               submit_type=submit_type,
                                               infos_name=infos_name,
                                               business_no=business_no)
                if not result:
                    wrong_number += "business_" + str(i + 1) + ":" + message + "、"
    elif submit_type == "save":
        business_no = json_data.get("business_no")
        infos = acc_document_infos

        result, message = submit_infos(type_num=3, infos=infos,
                                       submit_type=submit_type,
                                       infos_name=infos_name,
                                       business_no=business_no)
    if wrong_number == "":
        return jsonify(result=result, message=message)
    else:
        result, message = False, wrong_number
        return jsonify(result=result, message=message)


@accoj_bp.route('/get_acc_document_info', methods=['POST'])
def get_acc_document_info():
    """
    获取会计凭证信息
    """
    infos_name = "acc_document"
    info_keys = ["acc_document_infos", "answer_infos", "acc_document_confirmed", "acc_document_saved"]
    data = get_data(type_num=1, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


@accoj_bp.route('/download_acc_document_info', methods=['POST'])
@course_time_not_end_required(6)
def download_acc_document_info():
    """
    下载会计凭证信息
    """
    json_data = request.get_json()
    business_no = json_data.get("business_no")
    business_no_tmp = int(business_no) - 1
    if business_no_tmp > 19 or business_no_tmp < 0:
        return jsonify(result=False, message="题号不存在")
    document_no = session["username"] + str(business_no_tmp)
    file_cp = mongo.db.file.find_one({"document_no": "{}".format(document_no)}, dict(_id=0))
    if file_cp:
        file = dict(filename=file_cp.get("filename"), content=file_cp.get("content"))
        return jsonify(result=True, file=file)
    else:
        return jsonify(result=False, message="文件不存在！")


# 第六次课程----end---------------------------------------------------------------------------------


# 第七次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursevii', methods=['GET'])
@course_time_open_required(7)
@complete_required1
def coursevii():
    """
    账户明细账
    """
    return render_template('course/coursevii.html')


@accoj_bp.route('/submit_subsidiary_account_info', methods=['POST'])
@course_time_not_end_required(7)
def submit_subsidiary_account_info():
    """
    提交会计明细账信息
    """

    json_data = request.get_json()
    infos = json_data.get("subsidiary_account_info")
    submit_type = json_data.get("submit_type")
    subject = json_data.get("subject")

    infos_name = "subsidiary_account"

    result, message = submit_infos(type_num=4, infos=infos, submit_type=submit_type, infos_name=infos_name,
                                   subject=subject)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_subsidiary_account_info', methods=['POST'])
def get_subsidiary_account_info():
    """
    获取会计明细账信息
    """
    infos_name = "subsidiary_account"
    info_keys = ["subsidiary_account_infos", "answer_infos", "subsidiary_account_confirmed", "subsidiary_account_saved"]
    data = get_data(type_num=3, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


@accoj_bp.route('/submit_acc_balance_sheet_info', methods=['POST'])
@course_time_not_end_required(7)
def submit_acc_balance_sheet_info():
    """
    提交科目余额表信息
    """
    json_data = request.get_json()
    infos = json_data.get("acc_balance_sheet_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "acc_balance_sheet"

    result, message = submit_infos(type_num=1, infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_acc_balance_sheet_info', methods=['POST'])
def get_acc_balance_sheet_info():
    """
    获取科目余额表信息
    """
    infos_name = "acc_balance_sheet"
    info_keys = ["acc_balance_sheet_infos", "answer_infos", "acc_balance_sheet_confirmed", "acc_balance_sheet_saved"]
    data = get_data(type_num=2, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


# 第七次课程----end---------------------------------------------------------------------------------


# 第八次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseviii', methods=['GET'])
@course_time_open_required(8)
@complete_required1
def courseviii():
    """
    第八次课程
    """
    return render_template('course/courseviii.html')


# 资产负债表
@accoj_bp.route('/submit_new_balance_sheet_info', methods=['POST'])
@course_time_not_end_required(8)
def submit_new_balance_sheet_info():
    """
    提交资产负债表信息
    """
    json_data = request.get_json()
    infos = json_data.get("new_balance_sheet_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "new_balance_sheet"

    result, message = submit_infos(type_num=1, infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_new_balance_sheet_info', methods=['POST'])
def get_new_balance_sheet_info():
    """
    获取资产负债表信息
    """
    infos_name = "new_balance_sheet"
    info_keys = ["new_balance_sheet_infos", "answer_infos", "new_balance_sheet_confirmed", "new_balance_sheet_saved"]
    data = get_data(type_num=2, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


@accoj_bp.route('/submit_profit_statement_info', methods=['POST'])
@course_time_not_end_required(8)
def submit_profit_statement_info():
    """
    提交利润表信息
    """
    json_data = request.get_json()
    infos = json_data.get("profit_statement_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "profit_statement"

    result, message = submit_infos(type_num=1, infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_profit_statement_info', methods=['POST'])
def get_profit_statement_info():
    """
    获取利润表信息
    """
    infos_name = "profit_statement"
    info_keys = ["profit_statement_infos", "answer_infos", "profit_statement_confirmed", "profit_statement_saved"]
    data = get_data(type_num=2, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


# 第八次课程----end---------------------------------------------------------------------------------


# 第九次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseix', methods=['GET'])
@course_time_open_required(9)
@complete_required1
def courseix():
    """
    第九次课程第一部分
    """
    return render_template('course/courseix.html')


@accoj_bp.route('/submit_ix_first_info', methods=['POST'])
@course_time_not_end_required(9)
def submit_ix_first_info():
    """
    趋势分析法 提交资产负债表信息
    """
    json_data = request.get_json()
    infos = json_data.get("ixFirst_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "trend_analysis"

    result, message = submit_infos(type_num=2, infos=infos, submit_type=submit_type,
                                   infos_name=infos_name, is_first=True)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ix_first_info', methods=['POST'])
def get_ix_first_info():
    """
    趋势分析法 获取资产负债表信息
    """
    infos_name = "trend_analysis"
    info_keys = ["ixFirst_infos", "answer_infos", "confirm", "saved"]
    data = get_data(type_num=2, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


@accoj_bp.route('/submit_ix_second_info', methods=['POST'])
@course_time_not_end_required(9)
def submit_ix_second_info():
    """
    趋势分析法 提交利润表信息
    """
    json_data = request.get_json()
    infos = json_data.get("ixSecond_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "trend_analysis"

    result, message = submit_infos(type_num=2, infos=infos, submit_type=submit_type,
                                   infos_name=infos_name, is_first=False)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ix_second_info', methods=['POST'])
def get_ix_second_info():
    """
    趋势分析法 获取利润表信息
    """
    infos_name = "trend_analysis"
    info_keys = ["ixSecond_infos", "answer_infos", "confirm", "saved"]
    data = get_data(type_num=2, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


@accoj_bp.route('/courseix_2', methods=['GET'])
@complete_required1
def courseix_2():
    """
    第九次课程第二部分
    """
    return render_template('course/courseix_2.html')


@accoj_bp.route('/submit_ix2_first_info', methods=['POST'])
@course_time_not_end_required(9)
def submit_ix2_first_info():
    """
    共同比分析法 资产负债表
    """
    json_data = request.get_json()
    infos = json_data.get("ix2First_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "common_ratio_analysis"

    result, message = submit_infos(type_num=2, infos=infos, submit_type=submit_type,
                                   infos_name=infos_name, is_first=True)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ix2_first_info', methods=['POST'])
def get_ix2_first_info():
    """
    共同比分析法 获取资产负债表信息
    """
    infos_name = "common_ratio_analysis"
    info_keys = ["ix2First_infos", "answer_infos", "confirm", "saved"]
    data = get_data(type_num=2, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


@accoj_bp.route('/submit_ix2_second_info', methods=['POST'])
@course_time_not_end_required(9)
def submit_ix2_second_info():
    """
    共同比分析法 提交利润表信息
    """
    json_data = request.get_json()
    infos = json_data.get("ix2Second_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "common_ratio_analysis"

    result, message = submit_infos(type_num=2, infos=infos, submit_type=submit_type, infos_name=infos_name,
                                   is_first=False)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ix2_second_info', methods=['POST'])
def get_ix2_second_info():
    """
    共同比分析法 获取利润表信息
    """
    infos_name = "common_ratio_analysis"
    info_keys = ["ix2Second_infos", "answer_infos", "confirm", "saved"]
    data = get_data(type_num=2, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


@accoj_bp.route('/courseix_3', methods=['GET'])
@course_time_open_required(9)
@complete_required1
def courseix_3():
    """
    第九次课程第三部分
    """
    return render_template('course/courseix_3.html')


@accoj_bp.route('/courseix_4', methods=['GET'])
@course_time_open_required(9)
@complete_required1
def courseix_4():
    """
    第九次课程第四部分
    """
    return render_template('course/courseix_4.html')


@accoj_bp.route('/submit_ix4_info', methods=['POST'])
@course_time_not_end_required(9)
def submit_ix4_info():
    """
    提交比率分析法信息
    """
    json_data = request.get_json()
    infos = json_data.get("ix4_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "ratio_analysis"

    result, message = submit_infos(type_num=1, infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ix4_info', methods=['POST'])
def get_ix4_info():
    """
    获取比率分析法信息
    """
    infos_name = "ratio_analysis"
    info_keys = ["ix4_infos", "answer_infos", "ix4_confirmed", "ix4_saved"]
    data = get_data(type_num=2, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


# 第九次课程----end---------------------------------------------------------------------------------


# 第十次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursex', methods=['GET'])
@course_time_open_required(10)
@complete_required1
def coursex():
    """
    杜邦分析法
    """
    return render_template('course/coursex.html')


@accoj_bp.route('/submit_coursex_info', methods=['POST'])
@course_time_not_end_required(10)
def submit_coursex_info():
    """
    提交杜邦分析法信息

    """
    json_data = request.get_json()
    infos = json_data.get("coursex_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "dupont_analysis"

    result, message = submit_infos(type_num=1, infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_coursex_info', methods=['POST'])
def get_coursex_info():
    """
    获取杜邦分析法信息
    """
    infos_name = "dupont_analysis"
    info_keys = ["coursex_infos", "answer_infos", "coursex_confirmed", "coursex_saved"]
    data = get_data(type_num=2, infos_name=infos_name, info_keys=info_keys)
    return jsonify(result=True, data=data)


# 第十次课程----end---------------------------------------------------------------------------------

# 通用视图----start---------------------------------------------------------------------------------
@accoj_bp.route('/get_business_list', methods=['POST'])
@complete_required1
def get_business_list():
    """
    获取业务信息列表
    """
    company = mongo.db.company.find_one({"student_no": session.get("username")},
                                        {"businesses": 1, "involve_subjects": 1, "_id": 0})
    businesses = company.get("businesses")
    involve_subjects = company.get("involve_subjects")
    business_list = list()
    businesses_len = len(businesses)
    for i in range(0, businesses_len):
        content = businesses[i].get("content")
        business_type = businesses[i].get("business_type")
        business_no = i + 1
        business_list.append(dict(business_no=business_no, content=content, business_type=business_type))
    return jsonify(result=True, business_list=business_list, involve_subjects=involve_subjects)


# 通用视图----end-----------------------------------------------------------------------------------
def all_save(infos_name):
    """
    II、III、IV、VI 是否全部保存决定是否可以提交
    """
    save_info = mongo.db.company.find_one({"student_no": session.get("username")},
                                          {"schedule_saved.{}_saved".format(infos_name): 1, "_id": 0})
    if len(save_info.get("schedule_saved").get("{}_saved".format(infos_name))) == 20:
        return True
    return False


@accoj_bp.before_request
@login_required
def accoj_bp_before_request():
    """
    请求前钩子函数（局部）
    """
    role = session.get("role")
    if role == 'admin':
        return redirect(url_for('admin.index'))
    elif role == 'dbadmin':
        return redirect(url_for('dbadmin.index'))


@accoj_bp.before_request
# @login_required_student
def submit_info_before_request():
    url_path = request.path
    last_name = url_path.split("/")[-1]
    name_list = last_name.split('_', 1)
    submit_name = name_list[0]
    if submit_name == "submit":
        infos_name = name_list[1][:-5]
        if infos_name not in ["company", "business"]:
            member_permission = session.get("permission").get("{}_permission".format(session.get("member_no")))
        if infos_name in ["key_element", "subject", "entry", "acc_document"]:
            permission = member_permission.get("{}_permission".format(infos_name))
            if request.get_json().get("submit_type") == "confirm":
                business_no = 19
            else:
                business_no = request.get_json().get("business_no") - 1
            if business_no not in permission:
                return jsonify(result=False, message="无此题权限！")
        elif infos_name == "ledger":
            permission = member_permission.get("{}_permission".format(infos_name))
            ledger_period = request.get_json().get("ledger_period")
            if permission.get("ledger{}_permission".format(ledger_period)) == 0:
                return jsonify(result=False, message="无此题权限！")
        elif infos_name in ["balance_sheet", "subsidiary_account", "acc_balance_sheet", "new_balance_sheet",
                            "profit_statement"]:
            permission = member_permission.get("{}_permission".format(infos_name))
            if permission == 0:
                return jsonify(result=False, message="无此题权限！")
        elif infos_name == "ix_first":
            permission = member_permission.get("trend_analysis_permission").get("first")
            if permission == 0:
                return jsonify(result=False, message="无此题权限！")
        elif infos_name == "ix_second":
            permission = member_permission.get("trend_analysis_permission").get("second")
            if permission == 0:
                return jsonify(result=False, message="无此题权限！")
        elif infos_name == "ix2_first":
            permission = member_permission.get("common_ratio_analysis_permission").get("first")
            if permission == 0:
                return jsonify(result=False, message="无此题权限！")
        elif infos_name == "ix2_second":
            permission = member_permission.get("common_ratio_analysis_permission").get("second")
            if permission == 0:
                return jsonify(result=False, message="无此题权限！")
        elif infos_name == "ix4_":
            permission = member_permission.get("ratio_analysis_permission")
            if permission == 0:
                return jsonify(result=False, message="无此题权限！")
        elif infos_name == "coursex":
            permission = member_permission.get("dupont_analysis_permission")
            if permission == 0:
                return jsonify(result=False, message="无此题权限！")
