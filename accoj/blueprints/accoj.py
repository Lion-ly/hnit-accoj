#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:55
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : accoj.py
# @Software: PyCharm
from flask import Blueprint, render_template, request, jsonify, session
from accoj.utils import login_required, complete_required1
from accoj.utils import submit_infos1, submit_infos2, submit_infos3, submit_infos4, get_infos1, get_infos2
from accoj.utils import is_number, limit_content_length
from accoj.extensions import mongo
from accoj.deal_business import create_businesses

accoj_bp = Blueprint('accoj', __name__)


# 第一次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursei', methods=['GET'])
def coursei():
    """
    第一次课程
    :return:
    """
    return render_template('course/coursei.html')


@accoj_bp.route('/get_company_info', methods=['POST'])
def get_company_info():
    """
    获取公司信息
    :return:
    """
    company = mongo.db.company.find_one(dict(student_no=session.get("username")),
                                        dict(_id=0, com_name=1, com_address=1, com_business_addr=1, com_legal_rep=1,
                                             com_regist_cap=1, com_operate_period=1, com_business_scope=1,
                                             com_shareholder=1))
    # 公司已经创立过，填充表单
    if company:
        return jsonify(result=True, company_info=company)
    return jsonify(result=False, message="未知错误！")


@accoj_bp.route('/submit_company_info', methods=['POST'])
def submit_company_info():
    """
    提交公司创立信息表单
    :return:
    """
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
        schedule_confirm = dict(business_confirm=False, key_element_confirm=[], subject_confirm=[],
                                entry_confirm=[], ledger_confirm={"ledger1_confirm": [], "ledger2_confirm": []},
                                balance_sheet_confirm=False, acc_document_confirm=[], subsidiary_account_confirm=[],
                                acc_balance_sheet_confirm=False, new_balance_sheet_confirm=False,
                                profit_statement_confirm=False,
                                trend_analysis_confirm={"first": False, "second": False},
                                common_ratio_analysis_confirm={"first": False, "second": False},
                                ratio_analysis_confirm=False, dupont_analysis_confirm=False)

        schedule_saved = dict(key_element_saved=[], subject_saved=[], entry_saved=[],
                              ledger_saved={"ledger1_saved": [], "ledger2_saved": []},
                              balance_sheet_svaed=False, acc_document_saved=[], subsidiary_account_saved=[],
                              acc_balance_sheet_saved=False, new_balance_sheet_saved=False,
                              profit_statement_saved=False,
                              trend_analysis_saved={"first": False, "second": False},
                              common_ratio_analysis_saved={"first": False, "second": False},
                              ratio_analysis_saved=False, dupont_analysis_saved=False)

        data_dict.update(dict(schedule_confirm=schedule_confirm,
                              schedule_saved=schedule_saved,
                              com_assets=[],
                              businesses=[],
                              key_element_infos=[],
                              subjects_infos=[],
                              entry_infos=[],
                              acc_document_infos=[]))
        data_dict_cp = data_dict.copy()
        # 副本公司同时创建
        data_dict_cp["student_no"] = "{}_cp".format(data_dict["student_no"])
        mongo.db.company.insert_many([data_dict, data_dict_cp])
        return jsonify(result=True, message="公司创建成功！")


@accoj_bp.route('/submit_business_info', methods=['POST'])
def submit_business_info():
    """
    提交业务内容信息，提交成功后不可修改
    :return:
    """
    period_num = 10
    company = mongo.db.company.find_one(dict(student_no="{}".format(session.get("username"))),
                                        dict(businesses=1, business_num=1, schedule_confirm=1, _id=0, ))
    if not company:
        return jsonify(result=False, message="公司未创立")
    schedule_confirm = company.get("schedule_confirm")
    business_confirm = schedule_confirm.get("business_confirm")

    if not business_confirm:
        subjects_tmp1 = list()
        subjects_tmp2 = list()
        company_cp = mongo.db.company.find_one(dict(student_no="{}_cp".format(session.get("username"))),
                                               dict(subjects_infos=1, _id=0))
        subjects_infos = company_cp.get("subjects_infos")
        i = 0
        for subjects_info in subjects_infos:
            for info in subjects_info:
                subject = info.get("subject")
                if i < period_num:
                    subjects_tmp1.append(subject)
                subjects_tmp2.append(subject)
                i += 1

        subjects_tmp1 = set(subjects_tmp1)
        subjects_tmp2 = set(subjects_tmp2)
        subjects_tmp1.update(["资本公积", "盈余公积", "本年利润", "利润分配"])
        subjects_tmp2.update(["资本公积", "盈余公积", "本年利润", "利润分配"])
        involve_subjects = dict(involve_subjects_1=list(subjects_tmp1), involve_subjects_2=list(subjects_tmp2))

        mongo.db.company.update(dict(student_no="{}".format(session.get("username"))),
                                {"$set": {"schedule_confirm.business_confirm": True,
                                          "involve_subjects"                 : involve_subjects}}
                                )
        mongo.db.company.update(dict(student_no="{}_cp".format(session.get("username"))),
                                {"$set": {"schedule_confirm.business_confirm": True,
                                          "involve_subjects"                 : involve_subjects}}
                                )
        return jsonify(result=True)
    else:
        return jsonify(result=False, message="已经提交过！")


@accoj_bp.route('/get_business_info', methods=['POST'])
def get_business_info():
    """
    获取业务内容信息
    :return:
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
def create_business():
    """
    生成业务
    :return:
    """
    username = session.get("username")
    company = mongo.db.company.find_one({"student_no": "{}_cp".format(username)})

    schedule_confirm = company.get("schedule_confirm")
    business_confirm = schedule_confirm.get("business_confirm")

    if not company or not schedule_confirm:
        return jsonify(result=False, message="公司未创立！")

    if business_confirm:
        message = "已经确认提交过"
        return jsonify(result=False, message=message)
    else:
        result, message = create_businesses(company)
        return jsonify(result=result, message=message)


# 第一次课程----end---------------------------------------------------------------------------------


# 第二次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseii', methods=['GET'])
@complete_required1
def courseii():
    """
    :return:
    """
    return render_template('course/courseii.html')


@accoj_bp.route('/submit_key_element_info', methods=['POST'])
def submit_key_element_info():
    """
    提交会计要素信息
    :return:
    """
    json_data = request.get_json()
    business_no = json_data.get("business_no")
    infos = json_data.get("key_element_infos")
    submit_type = json_data.get("submit_type")

    infos_name = "key_element"
    result, message = submit_infos3(infos=infos,
                                    submit_type=submit_type,
                                    business_no=business_no,
                                    infos_name=infos_name)

    return jsonify(result=result, message=message)


@accoj_bp.route('/get_key_element_info', methods=['POST'])
def get_key_element_info():
    """
    # 获取会计要素信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="key_element")
    return jsonify(result=True,
                   key_element_infos=infos,
                   key_element_confirmed=confirmed,
                   key_element_saved=saved)


# 第二次课程----end---------------------------------------------------------------------------------


# 第三次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseiii', methods=['GET'])
@complete_required1
def courseiii():
    """
    :return:
    """
    return render_template('course/courseiii.html')


@accoj_bp.route('/submit_subject_info', methods=['POST'])
def submit_subject_info():
    """
    提交会计科目信息
    :return:
    """
    json_data = request.get_json()
    business_no = json_data.get("business_no")
    infos = json_data.get("subject_infos")
    submit_type = json_data.get("submit_type")

    infos_name = "subject"
    result, message = submit_infos3(infos=infos,
                                    submit_type=submit_type,
                                    business_no=business_no,
                                    infos_name=infos_name)

    return jsonify(result=result, message=message)


@accoj_bp.route('/get_subject_info', methods=['POST'])
def get_subject_info():
    """
    获取会计科目信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="subject")
    return jsonify(result=True,
                   subject_infos=infos,
                   subject_confirmed=confirmed,
                   subject_saved=saved)


# 第三次课程----end---------------------------------------------------------------------------------


# 第四次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseiv', methods=['GET'])
@complete_required1
def courseiv():
    """
    :return:
    """
    return render_template('course/courseiv.html')


@accoj_bp.route('/submit_entry_info', methods=['POST'])
def submit_entry_info():
    """
    提交会计分录信息
    :return:
    """
    json_data = request.get_json()
    business_no = json_data.get("business_no")
    infos = json_data.get("entry_infos")
    submit_type = json_data.get("submit_type")

    infos_name = "entry"
    result, message = submit_infos3(infos=infos,
                                    submit_type=submit_type,
                                    business_no=business_no,
                                    infos_name=infos_name)

    return jsonify(result=result, message=message)


@accoj_bp.route('/get_entry_info', methods=['POST'])
def get_entry_info():
    """
    获取会计分录信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="entry")
    return jsonify(result=True,
                   entry_infos=infos,
                   entry_confirmed=confirmed,
                   entry_saved=saved)


# 第四次课程----end---------------------------------------------------------------------------------


# 第五次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursev', methods=['GET'])
@complete_required1
def coursev():
    """
    设立账户
    :return:
    """
    return render_template('course/coursev.html')


@accoj_bp.route('/submit_ledger_info', methods=['POST'])
def submit_ledger_info():
    """
    提交会计账户信息
    :return:
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

    result, message = submit_infos4(infos=infos, submit_type=submit_type, subject=subject,
                                    infos_name=infos_name, ledger_period=ledger_period)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ledger_info', methods=['POST'])
def get_ledger_info():
    """
    获取会计账户信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="ledger")
    return jsonify(result=True,
                   ledger_infos=infos,
                   ledger_confirmed=confirmed,
                   ledger_saved=saved)


@accoj_bp.route('/delete_ledger_info', methods=['POST'])
def delete_ledger_info():
    """
    删除会计账户信息
    :return:
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
                                     "$pull" : {pull_key1: subject,
                                                pull_key2: subject}})
            return jsonify(result=True)
        else:
            return jsonify(result=False, message="科目错误！")
    else:
        return jsonify(result=False, message="未知错误！")


@accoj_bp.route('/coursev_2', methods=['GET'])
@complete_required1
def coursev_2():
    """
    平衡表
    :return:
    """
    return render_template('course/coursev_2.html')


@accoj_bp.route('/submit_balance_sheet_info', methods=['POST'])
def submit_balance_sheet_info():
    """
    提交平衡表信息
    :return:
    """
    json_data = request.get_json()
    infos = json_data.get("balance_sheet_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "balance_sheet"

    result, message = submit_infos1(infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_balance_sheet_info', methods=['POST'])
def get_balance_sheet_info():
    """
    获取平衡表信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="balance_sheet")
    return jsonify(result=True,
                   balance_sheet_infos=infos,
                   balance_sheet_confirmed=confirmed,
                   balance_sheet_saved=saved)


# 第五次课程----end---------------------------------------------------------------------------------


# 第六次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursevi', methods=['GET'])
@complete_required1
def coursevi():
    """
    :return:
    """
    return render_template('course/coursevi.html')


@accoj_bp.route('/submit_acc_document_info', methods=['POST'])
@limit_content_length(5 * 1024 * 1024)
def submit_acc_document_info():
    """
    提交会计凭证信息
    :return:
    """
    json_data = request.get_json()
    infos = json_data.get("acc_document_infos")
    submit_type = json_data.get("submit_type")
    business_no = json_data.get("business_no")

    infos_name = "acc_document"
    result, message = submit_infos3(infos=infos,
                                    submit_type=submit_type,
                                    business_no=business_no,
                                    infos_name=infos_name)

    return jsonify(result=result, message=message)


@accoj_bp.route('/get_acc_document_info', methods=['POST'])
def get_acc_document_info():
    """
    获取会计凭证信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="acc_document")
    return jsonify(result=True,
                   acc_document_infos=infos,
                   acc_document_confirmed=confirmed,
                   acc_document_saved=saved)


@accoj_bp.route('/download_acc_document_info', methods=['POST'])
def download_acc_document_info():
    """
    下载会计凭证信息
    :return:
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
@complete_required1
def coursevii():
    """
    账户明细账
    :return:
    """
    return render_template('course/coursevii.html')


@accoj_bp.route('/submit_subsidiary_account_info', methods=['POST'])
def submit_subsidiary_account_info():
    """
    提交会计明细账信息
    :return:
    """

    json_data = request.get_json()
    infos = json_data.get("subsidiary_account_info")
    submit_type = json_data.get("submit_type")
    subject = json_data.get("subject")

    infos_name = "subsidiary_account"

    result, message = submit_infos4(infos=infos, submit_type=submit_type, subject=subject, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_subsidiary_account_info', methods=['POST'])
def get_subsidiary_account_info():
    """
    获取会计明细账信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="subsidiary_account")
    return jsonify(result=True,
                   subsidiary_account_infos=infos,
                   subsidiary_account_confirmed=confirmed,
                   subsidiary_account_saved=saved)


@accoj_bp.route('/submit_acc_balance_sheet_info', methods=['POST'])
def submit_acc_balance_sheet_info():
    """
    提交科目余额表信息
    :return:
    """
    json_data = request.get_json()
    infos = json_data.get("acc_balance_sheet_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "acc_balance_sheet"

    result, message = submit_infos1(infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_acc_balance_sheet_info', methods=['POST'])
def get_acc_balance_sheet_info():
    """
    获取科目余额表信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="acc_balance_sheet")
    return jsonify(result=True,
                   acc_balance_sheet_infos=infos,
                   acc_balance_sheet_confirmed=confirmed,
                   acc_balance_sheet_saved=saved)


# 第七次课程----end---------------------------------------------------------------------------------


# 第八次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseviii', methods=['GET'])
@complete_required1
def courseviii():
    """
    :return:
    """
    return render_template('course/courseviii.html')


# 资产负债表
@accoj_bp.route('/submit_new_balance_sheet_info', methods=['POST'])
def submit_new_balance_sheet_info():
    """
    提交资产负债表信息
    :return:
    """
    json_data = request.get_json()
    infos = json_data.get("new_balance_sheet_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "new_balance_sheet"

    result, message = submit_infos1(infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_new_balance_sheet_info', methods=['POST'])
def get_new_balance_sheet_info():
    """
    获取资产负债表信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="new_balance_sheet")

    return jsonify(result=True,
                   new_balance_sheet_infos=infos,
                   new_balance_sheet_confirmed=confirmed,
                   new_balance_sheet_saved=saved)


@accoj_bp.route('/submit_profit_statement_info', methods=['POST'])
def submit_profit_statement_info():
    """
    提交利润表信息
    :return:
    """
    json_data = request.get_json()
    infos = json_data.get("profit_statement_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "profit_statement"

    result, message = submit_infos1(infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_profit_statement_info', methods=['POST'])
def get_profit_statement_info():
    """
    获取利润表信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="profit_statement")

    return jsonify(result=True,
                   profit_statement_infos=infos,
                   profit_statement_confirmed=confirmed,
                   profit_statement_saved=saved)


# 第八次课程----end---------------------------------------------------------------------------------


# 第九次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseix', methods=['GET'])
@complete_required1
def courseix():
    """
    第九次课程第一部分
    :return:
    """
    return render_template('course/courseix.html')


@accoj_bp.route('/submit_ix_first_info', methods=['POST'])
def submit_ix_first_info():
    """
    趋势分析法 提交资产负债表信息
    :return:
    """
    json_data = request.get_json()
    infos = json_data.get("ixFirst_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "trend_analysis"

    result, message = submit_infos2(infos=infos, submit_type=submit_type, infos_name=infos_name, is_first=True)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ix_first_info', methods=['POST'])
def get_ix_first_info():
    """
    趋势分析法 获取资产负债表信息
    :return:
    """
    infos, confirmed, saved = get_infos2(is_first=True, infos_name="trend_analysis")

    return jsonify(result=True,
                   ixFirst_infos=infos,
                   ixFirst_confirmed=confirmed,
                   ixFirst_saved=saved)


@accoj_bp.route('/submit_ix_second_info', methods=['POST'])
def submit_ix_second_info():
    """
    趋势分析法 提交利润表信息
    :return:
    """
    json_data = request.get_json()
    infos = json_data.get("ixSecond_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "trend_analysis"

    result, message = submit_infos2(infos=infos, submit_type=submit_type, infos_name=infos_name, is_first=False)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ix_second_info', methods=['POST'])
def get_ix_second_info():
    """
    趋势分析法 获取利润表信息
    :return:
    """
    infos, confirmed, saved = get_infos2(is_first=False, infos_name="trend_analysis")

    return jsonify(result=True,
                   ixSecond_infos=infos,
                   ixSecond_confirmed=confirmed,
                   ixSecond_saved=saved)


@accoj_bp.route('/courseix_2', methods=['GET'])
@complete_required1
def courseix_2():
    """
    第九次课程第二部分
    :return:
    """
    return render_template('course/courseix_2.html')


@accoj_bp.route('/submit_ix2_first_info', methods=['POST'])
def submit_ix2_first_info():
    """
    共同比分析法 资产负债表
    :return:
    """
    json_data = request.get_json()
    infos = json_data.get("ix2First_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "common_ratio_analysis"

    result, message = submit_infos2(infos=infos, submit_type=submit_type, infos_name=infos_name, is_first=True)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ix2_first_info', methods=['POST'])
def get_ix2_first_info():
    """
    共同比分析法 获取资产负债表信息
    :return:
    """
    infos, confirmed, saved = get_infos2(is_first=True, infos_name="common_ratio_analysis")
    return jsonify(result=True,
                   ix2First_infos=infos,
                   ix2First_confirmed=confirmed,
                   ix2First_saved=saved)


@accoj_bp.route('/submit_ix2_second_info', methods=['POST'])
def submit_ix2_second_info():
    """
    共同比分析法 提交利润表信息
    :return:
    """
    json_data = request.get_json()
    infos = json_data.get("ix2Second_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "common_ratio_analysis"

    result, message = submit_infos2(infos=infos, submit_type=submit_type, infos_name=infos_name, is_first=False)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ix2_second_info', methods=['POST'])
def get_ix2_second_info():
    """
    共同比分析法 获取利润表信息
    :return:
    """
    infos, confirmed, saved = get_infos2(is_first=False, infos_name="common_ratio_analysis")
    return jsonify(result=True,
                   ix2Second_infos=infos,
                   ix2Second_confirmed=confirmed,
                   ix2Second_saved=saved)


@accoj_bp.route('/courseix_3', methods=['GET'])
@complete_required1
def courseix_3():
    """
    第九次课程第三部分
    :return:
    """
    return render_template('course/courseix_3.html')


@accoj_bp.route('/courseix_4', methods=['GET'])
@complete_required1
def courseix_4():
    """
    第九次课程第四部分
    :return:
    """
    return render_template('course/courseix_4.html')


@accoj_bp.route('/submit_ix4_info', methods=['POST'])
def submit_ix4_info():
    """
    提交比率分析法信息
    :return:
    """
    json_data = request.get_json()
    infos = json_data.get("ix4_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "ratio_analysis"

    result, message = submit_infos1(infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_ix4_info', methods=['POST'])
def get_ix4_info():
    """
    获取比率分析法信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="ratio_analysis")
    return jsonify(result=True,
                   ix4_infos=infos,
                   ix4_confirmed=confirmed,
                   ix4_saved=saved)


# 第九次课程----end---------------------------------------------------------------------------------


# 第十次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursex', methods=['GET'])
@complete_required1
def coursex():
    """
    杜邦分析法
    :return:
    """
    return render_template('course/coursex.html')


@accoj_bp.route('/submit_coursex_info', methods=['POST'])
def submit_coursex_info():
    """
    提交杜邦分析法信息
    :return:
    """
    json_data = request.get_json()
    infos = json_data.get("coursex_infos")
    submit_type = json_data.get("submit_type")
    infos_name = "dupont_analysis"

    result, message = submit_infos1(infos=infos, submit_type=submit_type, infos_name=infos_name)
    return jsonify(result=result, message=message)


@accoj_bp.route('/get_coursex_info', methods=['POST'])
def get_coursex_info():
    """
    获取杜邦分析法信息
    :return:
    """
    infos, confirmed, saved = get_infos1(infos_name="dupont_analysis")
    return jsonify(result=True,
                   coursex_infos=infos,
                   coursex_confirmed=confirmed,
                   coursex_saved=saved)


# 第十次课程----end---------------------------------------------------------------------------------


# 用户个人中心----start-----------------------------------------------------------------------------
# Todo 用户个人中心
@accoj_bp.route('/profile', methods=['GET'])
def profile():
    """
    :return:
    """
    return render_template('profile.html')


# 用户个人中心----end-------------------------------------------------------------------------------

# 通用视图----start---------------------------------------------------------------------------------
@accoj_bp.route('/get_business_list', methods=['POST'])
@complete_required1
def get_business_list():
    """
    获取业务信息列表
    :return:
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

@accoj_bp.before_request
@login_required  # 需要登陆
def accoj_bp_before_request():
    """
    `局部`请求前钩子函数
    :return:
    """
    pass
