#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:55
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : accoj.py
# @Software: PyCharm
from flask import Blueprint, render_template, redirect, request, jsonify, session, g
from accoj.utils import login_required, allowed_file, limit_content_length
from accoj.extensions import mongo
from accoj.utils import is_number
from accoj.deal_business import deal_business
from _datetime import datetime
import random

accoj_bp = Blueprint('accoj', __name__)


# 第一次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursei', methods=['POST', 'GET'])
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
    if request.method == "POST":
        company = mongo.db.company.find_one(dict(student_no=session.get("username")),
                                            dict(_id=0, com_name=1, com_address=1, com_business_addr=1, com_legal_rep=1,
                                                 com_regist_cap=1, com_operate_period=1, com_business_scope=1,
                                                 com_shareholder=1))
        # 公司已经创立过，填充表单
        if company:
            return jsonify(company_info=company)


@accoj_bp.route('/company_form_submit', methods=['POST'])
def company_form_submit():
    """
    提交公司创立信息表单
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")})
        if company is not None:
            return jsonify(result=False, message="已经创立过公司")
        form = request.form
        data_list = ["com_name", "com_address", "com_business_addr", "com_legal_rep", "com_regist_cap",
                     "com_operate_period", "com_business_scope", "com_shareholder_1", "com_shareholder_2",
                     "com_shareholder_3", "com_shareholder_4", "com_shareholder_5"]
        data_dict = dict()
        data_dict["com_shareholder"] = []
        err_pos = []

        data_dict["student_no"] = session.get("username")
        for data_name in data_list:
            data_dict[data_name] = form.get(data_name)

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
            return jsonify(result=False, err_pos=err_pos, message="信息未填写完整或信息填写格式错误")
        else:
            for key in list(data_dict.keys()):
                if key.startswith("com_shareholder_"):
                    data_dict.pop(key)
                elif key == "com_regist_cap" or key == "com_operate_period":
                    data_dict[key] = float(data_dict[key])
            data_dict["com_bank_savings"] = data_dict["com_regist_cap"] * 10000
            data_dict["com_cash"] = 0
            data_dict["business_num"] = 0
            data_dict["schedule_confirm"] = dict(business_confirm=False, key_element_confirm=[], subject_confirm=[],
                                                 entry_confirm=[], balance_sheet_confirm=False,
                                                 acc_document_confirm=[], subsidiary_account_confirm=[],
                                                 acc_balance_sheet_confirm=False, new_balance_sheet_confirm=False,
                                                 profit_statement_confirm=False,
                                                 trend_analysis_confirm={"first": False, "second": False},
                                                 common_ratio_analysis_confirm={"first": False, "second": False},
                                                 ratio_analysis_confirm=False, dupont_analysis_confirm=False)
            data_dict["schedule_saved"] = dict(key_element_saved=[], subject_saved=[], entry_saved=[],
                                               balance_sheet_svaed=False, acc_document_saved=[],
                                               subsidiary_account_saved=[],
                                               acc_balance_sheet_saved=False, new_balance_sheet_saved=False,
                                               profit_statement_saved=False,
                                               trend_analysis_saved={"first": False, "second": False},
                                               common_ratio_analysis_saved={"first": False, "second": False},
                                               ratio_analysis_saved=False, dupont_analysis_saved=False)

            data_dict["com_assets"] = []
            data_dict["businesses"] = []
            data_dict_cp = data_dict.copy()
            # 副本公司同时创建
            data_dict_cp["student_no"] = "{}_cp".format(data_dict["student_no"])
            mongo.db.company.insert_many([data_dict, data_dict_cp])
            return jsonify(result=True)


@accoj_bp.route('/submit_business_infos', methods=['POST'])
def submit_business_infos():
    """
    提交业务内容信息，提交成功后不可修改
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one(dict(student_no="{}".format(session.get("username"))),
                                            dict(businesses=1, business_num=1, schedule_confirm=1, _id=0))
        if not company:
            return jsonify(result=False, message="公司未创立")
        business_num = company.get("business_num")
        schedule_confirm = company.get("schedule_confirm")
        businesses = company.get("businesses")
        business_confirm = schedule_confirm.get("business_confirm")
        business_types_1 = {"筹资活动": 0, "投资活动": 0, "经营活动": 0}
        business_types_2 = {"筹资活动": 0, "投资活动": 0, "经营活动": 0}
        businesses_len = len(businesses)
        for i in range(businesses_len):
            business_type = businesses[i].get("business_type")
            business_types = business_types_1 if i < 10 else business_types_2
            for key in business_types:
                if key == business_type:
                    business_types[key] += 1
        for key in business_types_1:
            # 判断第一个会计区间的每种业务是否至少有两笔
            if business_types_2[key] < 2:
                return jsonify(result=False, message="请检查第一个会计区间的每种业务是否至少有两笔")
        for key in business_types_2:
            # 判断第二个会计区间的每种业务是否至少有两笔
            if business_types_2[key] < 2:
                return jsonify(result=False, message="请检查第二个会计区间的每种业务是否至少有两笔")
        if business_num == 20 and not business_confirm:
            involve_subjects = set()
            company_cp = mongo.db.company.find_one(dict(student_no="{}_cp".format(session.get("username"))),
                                                   dict(businesses=1, _id=0))
            businesses_cp = company_cp.get("businesses")
            for business in businesses_cp:
                subjects_infos = business.get("subjects_infos")
                for subjects_info in subjects_infos:
                    involve_subjects.add(subjects_info.get("subject"))
            mongo.db.company.update(dict(student_no="{}".format(session.get("username"))),
                                    {"$set": {"schedule_confirm.business_confirm": True,
                                              "involve_subjects"                 : list(involve_subjects)}}
                                    )
            mongo.db.company.update(dict(student_no="{}_cp".format(session.get("username"))),
                                    {"$set": {"schedule_confirm.business_confirm": True,
                                              "involve_subjects"                 : list(involve_subjects)}}
                                    )
            return jsonify(result=True)
        elif business_num == 20 and business_confirm:
            return jsonify(result=False, message="已经提交过")
        else:
            return jsonify(result=False, message="公司业务数量过少")


@accoj_bp.route('/get_business_info', methods=['POST'])
def get_business_info():
    """
    获取业务内容信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one(dict(student_no="{}".format(session.get("username"))),
                                            dict(businesses=1, schedule_confirm=1, _id=0))
        if company:
            businesses = company.get("businesses")
            if not businesses:
                return jsonify(result=False, message="暂无业务")
            schedule_confirm = company.get("schedule_confirm")
            business_confirm = schedule_confirm.get("business_confirm")
            content_list = list()
            for business in businesses:
                business_type = business.get("business_type")
                content = business.get("content")
                content_list.append(dict(business_type=business_type, content=content))
            return jsonify(result=True, content_list=content_list, business_confirm=business_confirm)
        else:
            return jsonify(result=False, message="公司未创立")


@accoj_bp.route('/revoke_add_business', methods=['POST'])
def revoke_add_business():
    """
    撤销增加业务
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one(dict(student_no="{}".format(session.get("username"))),
                                            dict(businesses=1, schedule_confirm=1, _id=1))
        if company:
            businesses = company.get("businesses")
            schedule_confirm = company.get("schedule_confirm")
            business_confirm = schedule_confirm.get("business_confirm")
            _id = company.get("_id")
            if not businesses:
                return jsonify(result=False, message="暂无业务")
            if business_confirm:
                return jsonify(result=False, message="已经确认提交，无法撤销")
            question_no = company.get("businesses")[-1].get("question_no")
            mongo.db.company.update(dict(_id=_id),
                                    {"$pop" : {"businesses": 1},
                                     "$inc" : {"business_num": -1},
                                     "$pull": {"com_assets": {"question_no": question_no}}})
            mongo.db.company.update({"student_no": "{}_cp".format(session.get("username"))},
                                    {"$pop" : {"businesses": 1},
                                     "$inc" : {"business_num": -1},
                                     "$pull": {"com_assets": {"question_no": question_no}}})
            return jsonify(result=True)
        else:
            return jsonify(result=False, message="公司未创立")


@accoj_bp.route('/add_business', methods=['POST'])
def add_business():
    """
    增加业务
    :return:
    """
    if request.method == "POST":
        business_types = ["筹资活动", "投资活动", '经营活动']
        form = request.form
        business_type = form.get("business_type")
        company = mongo.db.company.find_one({"student_no": "{}_cp".format(session.get("username"))})
        if not company or not g.schedule_confirm:
            return jsonify(result=False, message="公司未创立！")
        schedule_confirm = g.schedule_confirm
        business_confirm = schedule_confirm.get("business_confirm")
        if business_type not in business_types:
            return jsonify(result=False, message="业务类型错误！")

        if not company.get("businesses"):
            # 刚开始增加业务
            questions_no_low = 1
            questions_no_high = 1
            # 随机生成题库号
            questions_no = random.randint(questions_no_low, questions_no_high)
            # 第一笔业务，注册资本存入银行
            if questions_no == 1:
                business_content, _ = deal_business(company=company, business_type="筹资业务", questions_no=1)
                return jsonify(result=True, content=business_content)
        elif business_confirm:
            message = "已经确认提交过"
            return jsonify(result=False, message=message)
        elif company.get("business_num") == 20:
            message = "业务数已达上限"
            return jsonify(result=False, message=message)
        else:
            # 公司已存在业务，获取题库号
            questions_no = company["businesses"][0]["questions_no"]
            business_content, message = deal_business(company=company, business_type=business_type,
                                                      questions_no=questions_no)
            if not business_content:
                return jsonify(result=False, message=message)
            else:
                return jsonify(result=True, content=business_content)


# 第一次课程----end---------------------------------------------------------------------------------


# 第二次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseii', methods=['POST', 'GET'])
def courseii():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/courseii.html')


@accoj_bp.route('/submit_key_element_info', methods=['POST'])
def submit_key_element_info():
    """
    提交会计要素信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        affect_type = json_data.get("affect_type")
        business_no = json_data.get("business_no")
        key_element_infos = json_data.get("key_element_infos")
        submit_type = json_data.get("submit_type")

        if not is_number(business_no) or not is_number(affect_type) or submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="前端数据错误")
        else:
            business_no = int(business_no) - 1
            if business_no > 19 or business_no < 0:
                return jsonify(result=False, message="前端数据错误")
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(businesses=1, schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        if business_no not in schedule_confirm.get("key_element_confirm"):
            # 若当前业务信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                update_prefix = "businesses." + str(business_no)
                mongo.db.company.update({"_id": _id},
                                        {"$set"     : {(update_prefix + ".key_element_infos"): key_element_infos,
                                                       (update_prefix + ".affect_type")      : affect_type},
                                         "$addToSet": {"schedule_confirm.key_element_confirm": business_no,
                                                       "schedule_saved.key_element_saved"    : business_no}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                update_prefix = "businesses." + str(business_no)
                mongo.db.company.update({"_id": _id},
                                        {"$set"     : {(update_prefix + ".key_element_infos"): key_element_infos},
                                         "$addToSet": {"schedule_saved.key_element_saved": business_no}}
                                        )
                return jsonify(result=True)
        elif business_no in schedule_confirm.get("key_element_confirm"):
            # 业务已提交确认
            return jsonify(result=False, message="此业务已经提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_key_element_info', methods=['POST'])
def get_key_element_info():
    """
    # 获取会计要素信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")}, {"businesses": 1, "_id": 0})
        businesses = company.get("businesses")
        schedule_confirm = g.schedule_confirm
        schedule_saved = g.schedule_saved
        business_list = list()
        businesses_len = len(businesses)
        for i in range(0, businesses_len):
            key_element_infos = businesses[i].get("key_element_infos")
            confirmed = True if i in schedule_confirm.get("key_element_confirm") else False
            saved = True if i in schedule_saved.get("key_element_saved") else False
            content = businesses[i].get("content")
            affect_type = businesses[i].get("affect_type")
            business_type = businesses[i].get("business_type")
            business_no = i + 1
            business_list.append(dict(business_no=business_no, content=content, key_element_infos=key_element_infos,
                                      affect_type=affect_type, confirmed=confirmed, saved=saved,
                                      business_type=business_type))
        return jsonify(result=True, business_list=business_list)


# 第二次课程----end---------------------------------------------------------------------------------


# 第三次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseiii', methods=['POST', 'GET'])
def courseiii():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/courseiii.html')


@accoj_bp.route('/submit_subject_info', methods=['POST'])
def submit_subject_info():
    """
    提交会计科目信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        business_no = json_data.get("business_no")
        subject_infos = json_data.get("subject_infos")
        submit_type = json_data.get("submit_type")

        if not is_number(business_no) or submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="前端数据错误")
        else:
            business_no = int(business_no) - 1
            if business_no > 19 or business_no < 0:
                return jsonify(result=False, message="前端数据错误")

        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(businesses=1, schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        if business_no not in schedule_confirm.get("subject_confirm"):
            # 若当前业务信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                update_prefix = "businesses." + str(business_no)
                mongo.db.company.update({"_id": _id},
                                        {"$set"     : {(update_prefix + ".subject_infos"): subject_infos},
                                         "$addToSet": {"schedule_confirm.subject_confirm": business_no,
                                                       "schedule_saved.subject_saved"    : business_no}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                update_prefix = "businesses." + str(business_no)
                mongo.db.company.update({"_id": _id},
                                        {"$set"     : {(update_prefix + ".subject_infos"): subject_infos},
                                         "$addToSet": {"schedule_saved.subject_saved": business_no}}
                                        )
                return jsonify(result=True)
        elif business_no in schedule_confirm.get("subject_confirm"):
            # 业务已提交确认
            return jsonify(result=False, message="此业务已经提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_subject_info', methods=['POST'])
def get_subject_info():
    """
    获取会计科目信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")}, {"businesses": 1, "_id": 0})
        businesses = company.get("businesses")
        schedule_confirm = g.schedule_confirm
        schedule_saved = g.schedule_saved
        business_list = list()
        businesses_len = len(businesses)
        for i in range(0, businesses_len):
            subject_infos = businesses[i].get("subject_infos")
            confirmed = True if i in schedule_confirm.get("subject_confirm") else False
            saved = True if i in schedule_saved.get("subject_saved") else False
            content = businesses[i].get("content")
            business_type = businesses[i].get("business_type")
            business_no = i + 1
            business_list.append(dict(business_no=business_no, content=content, subject_infos=subject_infos,
                                      confirmed=confirmed, saved=saved, business_type=business_type))
        return jsonify(result=True, business_list=business_list)


# 第三次课程----end---------------------------------------------------------------------------------


# 第四次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseiv', methods=['POST', 'GET'])
def courseiv():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/courseiv.html')


@accoj_bp.route('/submit_entry_info', methods=['POST'])
def submit_entry_info():
    """
    提交会计分录信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        business_no = json_data.get("business_no")
        entry_infos = json_data.get("entry_infos")
        submit_type = json_data.get("submit_type")

        if not is_number(business_no) or submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="前端数据错误")
        else:
            business_no = int(business_no) - 1
            if business_no > 19 or business_no < 0:
                return jsonify(result=False, message="前端数据错误")

        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(businesses=1, schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        if business_no not in schedule_confirm.get("entry_confirm"):
            # 若当前业务信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                update_prefix = "businesses." + str(business_no)
                mongo.db.company.update({"_id": _id},
                                        {"$set"     : {(update_prefix + ".entry_infos"): entry_infos},
                                         "$addToSet": {"schedule_confirm.entry_confirm": business_no,
                                                       "schedule_saved.entry_saved"    : business_no}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                update_prefix = "businesses." + str(business_no)
                mongo.db.company.update({"_id": _id},
                                        {"$set"     : {(update_prefix + ".entry_infos"): entry_infos},
                                         "$addToSet": {"schedule_saved.entry_saved": business_no}}
                                        )
                return jsonify(result=True)
        elif business_no in schedule_confirm.get("entry_confirm"):
            # 业务已提交确认
            return jsonify(result=False, message="此业务已经提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_entry_info', methods=['POST'])
def get_entry_info():
    """
    获取会计分录信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")}, {"businesses": 1, "_id": 0})
        businesses = company.get("businesses")
        schedule_confirm = g.schedule_confirm
        schedule_saved = g.schedule_saved
        business_list = list()
        businesses_len = len(businesses)
        for i in range(0, businesses_len):
            entry_infos = businesses[i].get("entry_infos")
            confirmed = True if i in schedule_confirm.get("entry_confirm") else False
            saved = True if i in schedule_saved.get("entry_saved") else False
            content = businesses[i].get("content")
            business_type = businesses[i].get("business_type")
            business_no = i + 1
            business_list.append(dict(business_no=business_no, content=content, entry_infos=entry_infos,
                                      confirmed=confirmed, saved=saved, business_type=business_type))
        return jsonify(result=True, business_list=business_list)


# 第四次课程----end---------------------------------------------------------------------------------


# 第五次课程----start-------------------------------------------------------------------------------
# 设立账户
@accoj_bp.route('/coursev', methods=['POST', 'GET'])
def coursev():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/coursev.html')


@accoj_bp.route('/submit_ledger_info', methods=['POST'])
def submit_ledger_info():
    """
    提交会计账户信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1, involve_subjects=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        involve_subjects = company.get("involve_subjects")
        json_data = request.get_json()
        ledger_info = json_data.get("ledger_info")
        submit_type = json_data.get("submit_type")
        if ledger_info:
            subject = ledger_info.get("subject")
        else:
            return jsonify(result=False, message="账户信息为空")
        if submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")
        elif subject not in involve_subjects:
            return jsonify(result=False, message="科目错误")
        if subject not in schedule_confirm.get("ledger_confirm"):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                update_prefix = "ledger_infos." + str(subject)
                mongo.db.company.update({"_id": _id},
                                        {"$set"     : {update_prefix: ledger_info},
                                         "$addToSet": {"schedule_confirm.ledger_confirm": subject,
                                                       "schedule_saved.ledger_saved"    : subject}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                update_prefix = "ledger_infos." + str(subject)
                mongo.db.company.update({"_id": _id},
                                        {"$set"     : {update_prefix: ledger_info},
                                         "$addToSet": {"schedule_saved.ledger_saved": subject}}
                                        )
                return jsonify(result=True)
        elif subject in schedule_confirm.get("ledger_confirm"):
            # 业务已提交确认
            return jsonify(result=False, message="此账户已经提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_ledger_info', methods=['POST'])
def get_ledger_info():
    """
    获取会计账户信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            {"ledger_infos"  : 1, "involve_subjects": 1, "schedule_confirm": 1,
                                             "schedule_saved": 1, "_id": 0})
        ledger_infos = company.get("ledger_infos")
        involve_subjects = company.get("involve_subjects")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not ledger_infos:
            return jsonify(result=True, ledger_infos=None, involve_subjects=involve_subjects)
        for key in list(ledger_infos):
            ledger_infos[key]["confirmed"] = True if key in schedule_confirm.get("ledger_confirm") else False
            ledger_infos[key]["saved"] = True if key in schedule_saved.get("ledger_saved") else False
        return jsonify(result=True, ledger_infos=ledger_infos, involve_subjects=involve_subjects)


@accoj_bp.route('/delete_ledger_info', methods=['POST'])
def delete_ledger_info():
    """
    删除会计账户信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        subject = json_data.get("subject")
        if subject:
            company = mongo.db.company.find_one({"student_no": session.get("username")},
                                                {"involve_subjects": 1, "_id": 0})
            involve_subjects = company.get("involve_subjects")
            schedule_confirm = g.schedule_confirm
            if subject in schedule_confirm.get("ledger_confirm"):
                return jsonify(result=False, message="已经提交过, 删除失败")
            if subject in involve_subjects:
                mongo.db.company.update({"student_no": session.get("username")},
                                        {"$unset": {"ledger_infos.{}".format(subject): True},
                                         "$pull" : {"schedule_confirm.ledger_confirm": subject,
                                                    "schedule_saved.ledger_saved"    : subject}})
                return jsonify(result=True)
            else:
                return jsonify(result=False, message="科目错误")
        else:
            return jsonify(result=False, message="未知错误")


# 平衡表
@accoj_bp.route('/coursev_2', methods=['POST', 'GET'])
def coursev_2():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/coursev_2.html')


@accoj_bp.route('/submit_balance_sheet_info', methods=['POST'])
def submit_balance_sheet_info():
    """
    提交平衡表信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        json_data = request.get_json()
        balance_sheet_infos = json_data.get("balance_sheet_infos")
        submit_type = json_data.get("submit_type")
        if not balance_sheet_infos:
            return jsonify(result=False, message="平衡表信息为空")
        if submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")
        if not schedule_confirm.get("balance_sheet_confirm"):
            # 若当前信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"balance_sheet_infos"                   : balance_sheet_infos,
                                                  "schedule_confirm.balance_sheet_confirm": True,
                                                  "schedule_saved.balance_sheet_saved"    : True}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"balance_sheet_infos"               : balance_sheet_infos,
                                                  "schedule_saved.balance_sheet_saved": True}}
                                        )
                return jsonify(result=True)
        elif schedule_confirm.get("balance_sheet_confirm"):
            # 业务已提交确认
            return jsonify(result=False, message="已经确认提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_balance_sheet_info', methods=['POST'])
def get_balance_sheet_info():
    """
    获取平衡表信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(balance_sheet_infos=1, schedule_confirm=1, schedule_saved=1, _id=0))
        balance_sheet_infos = company.get("balance_sheet_infos")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not balance_sheet_infos:
            return jsonify(result=True, balance_sheet_infos=None)
        balance_sheet_infos["confirmed"] = True if schedule_confirm.get("balance_sheet_confirm") else False
        balance_sheet_infos["saved"] = True if schedule_saved.get("balance_sheet_saved") else False
        return jsonify(result=True, balance_sheet_infos=balance_sheet_infos)


# 第五次课程----end---------------------------------------------------------------------------------


# 第六次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursevi', methods=['POST', 'GET'])
def coursevi():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/coursevi.html')


@accoj_bp.route('/submit_acc_document_info', methods=['POST'])
def submit_acc_document_info():
    """
    提交会计凭证信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(businesses=1, schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        json_data = request.get_json()
        acc_document_infos = json_data.get("acc_document_infos")
        submit_type = json_data.get("submit_type")
        business_no = json_data.get("business_no")
        date = acc_document_infos.get("date")
        file = acc_document_infos.get("file")
        try:
            acc_document_infos["date"] = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            return jsonify(result=False, message="日期格式错误")

        if not is_number(business_no) or submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")
        else:
            business_no = int(business_no) - 1
            if business_no > 19 or business_no < 0:
                return jsonify(result=False, message="题号不存在")
        if business_no not in schedule_confirm.get("acc_document_confirm"):
            # 若当前业务信息提交未确认，则确认提交或保存
            # 保存文件
            acc_document_infos["document_no"] = ""
            filename = file.get("filename")
            content = file.get("content")
            print("filename: {}".format(filename))
            if filename and not allowed_file(filename):
                return jsonify(result=False, message="提交文件类型错误")
            if filename and content:
                print("pass end")
                document_no = session["username"] + str(business_no)
                acc_document_infos["document_no"] = document_no
                file["document_no"] = document_no
                mongo.db.file.update({"document_no": "{}".format(document_no)}, {"$set": file}, True)  # upsert
            acc_document_infos.pop("file")

            if submit_type == "confirm":
                # 提交类型为确认提交
                update_prefix = "businesses." + str(business_no)
                mongo.db.company.update({"_id": _id},
                                        {"$set"     : {(update_prefix + ".acc_document_infos"): acc_document_infos},
                                         "$addToSet": {"schedule_confirm.acc_document_confirm": business_no,
                                                       "schedule_saved.acc_document_saved"    : business_no}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                update_prefix = "businesses." + str(business_no)
                mongo.db.company.update({"_id": _id},
                                        {"$set"     : {(update_prefix + ".acc_document_infos"): acc_document_infos},
                                         "$addToSet": {"schedule_saved.acc_document_saved": business_no}}
                                        )
                return jsonify(result=True)
        elif business_no in schedule_confirm.get("acc_document_confirm"):
            # 业务已提交确认
            return jsonify(result=False, message="此业务已经提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_acc_document_info', methods=['POST'])
@limit_content_length(5 * 1024 * 1024)
def get_acc_document_info():
    """
    获取会计凭证信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")}, {"businesses": 1, "_id": 0})
        businesses = company.get("businesses")
        schedule_confirm = g.schedule_confirm
        schedule_saved = g.schedule_saved
        business_list = list()
        businesses_len = len(businesses)
        for i in range(0, businesses_len):
            acc_document_infos = businesses[i].get("acc_document_infos")
            confirmed = True if i in schedule_confirm.get("acc_document_confirm") else False
            saved = True if i in schedule_saved.get("acc_document_saved") else False
            content = businesses[i].get("content")
            business_type = businesses[i].get("business_type")
            business_no = i + 1
            business_list.append(dict(business_no=business_no, content=content, acc_document_infos=acc_document_infos,
                                      confirmed=confirmed, saved=saved, business_type=business_type))
        return jsonify(result=True, business_list=business_list)


@accoj_bp.route('/download_acc_document_info', methods=['POST'])
def download_acc_document_info():
    """
    下载会计凭证信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        business_no = json_data.get("business_no")
        business_no_tmp = int(business_no) - 1
        if business_no_tmp > 19 or business_no_tmp < 0:
            return jsonify(result=False, message="题号不存在")
        document_no = session["username"] + str(business_no_tmp)
        print(document_no)
        file_cp = mongo.db.file.find_one({"document_no": "{}".format(document_no)}, dict(_id=0))
        if file_cp:
            file = dict(filename=file_cp.get("filename"), content=file_cp.get("content"))
            return jsonify(result=True, file=file)
        else:
            return jsonify(result=False, message="文件不存在")


# 第六次课程----end---------------------------------------------------------------------------------


# 第七次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursevii', methods=['POST', 'GET'])
def coursevii():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/coursevii.html')


# 账户明细账
@accoj_bp.route('/submit_subsidiary_account_info', methods=['POST'])
def submit_subsidiary_account_info():
    """
    提交会计明细账信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(businesses=1, schedule_confirm=1, involve_subjects=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        involve_subjects = company.get("involve_subjects")
        json_data = request.get_json()
        subsidiary_account_info = json_data.get("subsidiary_account_info")
        submit_type = json_data.get("submit_type")
        subject = json_data.get("subject")

        if submit_type not in ["confirm", "save"]:
            print("提交类型错误")
            return jsonify(result=False, message="提交类型错误")
        else:
            if subject not in involve_subjects:
                print("科目错误")
                return jsonify(result=False, message="科目错误")

        if subject not in schedule_confirm.get("subsidiary_account_confirm"):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                update_prefix = "subsidiary_account_infos."
                mongo.db.company.update({"_id": _id},
                                        {"$set"        : {
                                            (update_prefix + subject): subsidiary_account_info},
                                            "$addToSet": {"schedule_confirm.subsidiary_account_confirm": subject,
                                                          "schedule_saved.subsidiary_account_saved"    : subject}}
                                        )
                return jsonify(result=True)
            elif submit_type == "save":
                # 提交类型为保存
                update_prefix = "subsidiary_account_infos."
                mongo.db.company.update({"_id": _id},
                                        {"$set"        : {
                                            (update_prefix + subject): subsidiary_account_info},
                                            "$addToSet": {"schedule_saved.subsidiary_account_saved": subject}}
                                        )
                return jsonify(result=True)
        elif subject in schedule_confirm.get("subsidiary_account_confirm"):
            # 明细账已提交确认
            return jsonify(result=False, message="此明细账已经提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_subsidiary_account_info', methods=['POST'])
def get_subsidiary_account_info():
    """
    获取会计明细账信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            {"subsidiary_account_infos": 1, "_id": 0})
        subsidiary_account_infos = company.get("subsidiary_account_infos")
        schedule_confirm = g.schedule_confirm
        schedule_saved = g.schedule_saved
        subsidiary_account_confirm = schedule_confirm.get("subsidiary_account_confirm")
        subsidiary_account_saved = schedule_saved.get("subsidiary_account_saved")
        return jsonify(result=True, subsidiary_account_infos=subsidiary_account_infos,
                       subsidiary_account_confirmed=subsidiary_account_confirm,
                       subsidiary_account_saved=subsidiary_account_saved)


# 科目余额表
@accoj_bp.route('/submit_acc_balance_sheet_info', methods=['POST'])
def submit_acc_balance_sheet_info():
    """
    提交科目余额表信息
    :return:
    """
    if request.method == "POST":

        json_data = request.get_json()
        acc_balance_sheet_infos = json_data.get("acc_balance_sheet_infos")
        submit_type = json_data.get("submit_type")
        if not acc_balance_sheet_infos:
            return jsonify(result=False, message="科目余额表信息为空")
        if submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")

        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")

        if not schedule_confirm.get("acc_balance_sheet_confirm"):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"acc_balance_sheet_infos"                   : acc_balance_sheet_infos,
                                                  "schedule_confirm.acc_balance_sheet_confirm": True,
                                                  "schedule_saved.acc_balance_sheet_saved"    : True}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"acc_balance_sheet_infos"               : acc_balance_sheet_infos,
                                                  "schedule_saved.acc_balance_sheet_saved": True}}
                                        )
                return jsonify(result=True)
        elif schedule_confirm.get("acc_balance_sheet_confirm"):
            # 信息已提交确认
            return jsonify(result=False, message="已经确认提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_acc_balance_sheet_info', methods=['POST'])
def get_acc_balance_sheet_info():
    """
    获取科目余额表信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(acc_balance_sheet_infos=1, schedule_confirm=1, schedule_saved=1,
                                                 _id=0))
        acc_balance_sheet_infos = company.get("acc_balance_sheet_infos")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not acc_balance_sheet_infos:
            return jsonify(result=True, acc_balance_sheet_infos=None)
        acc_balance_sheet_confirmed = schedule_confirm.get("acc_balance_sheet_confirm")
        acc_balance_sheet_saved = schedule_saved.get("acc_balance_sheet_saved")
        return jsonify(result=True, acc_balance_sheet_infos=acc_balance_sheet_infos,
                       acc_balance_sheet_confirmed=acc_balance_sheet_confirmed,
                       acc_balance_sheet_saved=acc_balance_sheet_saved)


# 第七次课程----end---------------------------------------------------------------------------------


# 第八次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/courseviii', methods=['POST', 'GET'])
def courseviii():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/courseviii.html')


# 资产负债表
@accoj_bp.route('/submit_new_balance_sheet_info', methods=['POST'])
def submit_new_balance_sheet_info():
    """
    提交资产负债表信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        new_balance_sheet_infos = json_data.get("new_balance_sheet_infos")
        submit_type = json_data.get("submit_type")
        if not new_balance_sheet_infos:
            return jsonify(result=False, message="资产负债表信息为空")
        if submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")

        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")

        if not schedule_confirm.get("new_balance_sheet_confirm"):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"new_balance_sheet_infos"                   : new_balance_sheet_infos,
                                                  "schedule_confirm.new_balance_sheet_confirm": True,
                                                  "schedule_saved.new_balance_sheet_saved"    : True}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"new_balance_sheet_infos"               : new_balance_sheet_infos,
                                                  "schedule_saved.new_balance_sheet_saved": True}}
                                        )
                return jsonify(result=True)
        elif schedule_confirm.get("new_balance_sheet_confirm"):
            # 信息已提交确认
            return jsonify(result=False, message="已经确认提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_new_balance_sheet_info', methods=['POST'])
def get_new_balance_sheet_info():
    """
    获取资产负债表信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(new_balance_sheet_infos=1, schedule_confirm=1, schedule_saved=1,
                                                 _id=0))
        new_balance_sheet_infos = company.get("new_balance_sheet_infos")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not new_balance_sheet_infos:
            return jsonify(result=True, new_balance_sheet_infos=None)
        new_balance_sheet_confirmed = schedule_confirm.get("new_balance_sheet_confirm")
        new_balance_sheet_saved = schedule_saved.get("new_balance_sheet_saved")
        return jsonify(result=True, new_balance_sheet_infos=new_balance_sheet_infos,
                       new_balance_sheet_confirmed=new_balance_sheet_confirmed,
                       new_balance_sheet_saved=new_balance_sheet_saved)


# 利润表
@accoj_bp.route('/submit_profit_statement_info', methods=['POST'])
def submit_profit_statement_info():
    """
    提交利润表信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        profit_statement_infos = json_data.get("profit_statement_infos")
        submit_type = json_data.get("submit_type")
        if not profit_statement_infos:
            return jsonify(result=False, message="利润表信息为空")
        if submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")

        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")

        if not schedule_confirm.get("profit_statement_confirm"):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"profit_statement_infos"                   : profit_statement_infos,
                                                  "schedule_confirm.profit_statement_confirm": True,
                                                  "schedule_saved.profit_statement_saved"    : True}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"profit_statement_infos"               : profit_statement_infos,
                                                  "schedule_saved.profit_statement_saved": True}}
                                        )
                return jsonify(result=True)
        elif schedule_confirm.get("profit_statement_confirm"):
            # 信息已提交确认
            return jsonify(result=False, message="已经确认提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_profit_statement_info', methods=['POST'])
def get_profit_statement_info():
    """
    获取利润表信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(profit_statement_infos=1, schedule_confirm=1, schedule_saved=1,
                                                 _id=0))
        profit_statement_infos = company.get("profit_statement_infos")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not profit_statement_infos:
            return jsonify(result=True, profit_statement_infos=None)
        profit_statement_confirmed = schedule_confirm.get("profit_statement_confirm")
        profit_statement_saved = schedule_saved.get("profit_statement_saved")
        return jsonify(result=True, profit_statement_infos=profit_statement_infos,
                       profit_statement_confirmed=profit_statement_confirmed,
                       profit_statement_saved=profit_statement_saved)


# 第八次课程----end---------------------------------------------------------------------------------


# 第九次课程----start-------------------------------------------------------------------------------
# 第九次课程第一部分
@accoj_bp.route('/courseix', methods=['POST', 'GET'])
def courseix():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/courseix.html')


# 趋势分析法
@accoj_bp.route('/submit_ix_first_info', methods=['POST'])
def submit_ix_first_info():
    """
    提交资产负债表信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        infos = json_data.get("ixFirst_infos")
        submit_type = json_data.get("submit_type")
        if not infos:
            return jsonify(result=False, message="资产负债表信息为空")
        if submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")

        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        confirm = schedule_confirm.get("trend_analysis_confirm")

        if not confirm or not confirm.get("first"):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"trend_analysis_infos.new_balance_sheet_infos" : infos,
                                                  "schedule_confirm.trend_analysis_confirm.first": True,
                                                  "schedule_saved.trend_analysis_saved.first"    : True}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"trend_analysis_infos.new_balance_sheet_infos": infos,
                                                  "schedule_saved.trend_analysis_saved.first"   : True}}
                                        )
                return jsonify(result=True)
        elif schedule_confirm.get("trend_analysis_confirm").get("first"):
            # 信息已提交确认
            return jsonify(result=False, message="已经确认提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_ix_first_info', methods=['POST'])
def get_ix_first_info():
    """
    获取资产负债表信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(trend_analysis_infos=1, schedule_confirm=1, schedule_saved=1,
                                                 _id=0))
        infos = company.get("trend_analysis_infos")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not infos or not infos.get("new_balance_sheet_infos"):
            return jsonify(result=True, ix2First_infos=None)

        infos = infos.get("new_balance_sheet_infos")
        confirmed = schedule_confirm.get("trend_analysis_confirm")
        confirmed = confirmed.get("first") if confirmed else False
        saved = schedule_saved.get("trend_analysis_saved")
        saved = saved.get("first") if saved else False

        return jsonify(result=True, ixFirst_infos=infos,
                       ixFirst_confirmed=confirmed,
                       ixFirst_saved=saved)


# 利润表
@accoj_bp.route('/submit_ix_second_info', methods=['POST'])
def submit_ix_second_info():
    """
    提交利润表信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        infos = json_data.get("ixSecond_infos")
        submit_type = json_data.get("submit_type")
        if not infos:
            return jsonify(result=False, message="利润表信息为空")
        if submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")

        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        confirm = schedule_confirm.get("trend_analysis_confirm")

        if not confirm or not confirm.get("second"):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"trend_analysis_infos.profit_statement_infos"   : infos,
                                                  "schedule_confirm.trend_analysis_confirm.second": True,
                                                  "schedule_saved.trend_analysis_saved.second"    : True}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"trend_analysis_infos.profit_statement_infos": infos,
                                                  "schedule_saved.trend_analysis_saved.second" : True}}
                                        )
                return jsonify(result=True)
        elif schedule_confirm.get("trend_analysis_confirm").get("second"):
            # 信息已提交确认
            return jsonify(result=False, message="已经确认提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_ix_second_info', methods=['POST'])
def get_ix_second_info():
    """
    获取利润表信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(trend_analysis_infos=1, schedule_confirm=1, schedule_saved=1,
                                                 _id=0))
        infos = company.get("trend_analysis_infos")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not infos or not infos.get("profit_statement_infos"):
            return jsonify(result=True, ix2First_infos=None)

        infos = infos.get("profit_statement_infos")
        confirmed = schedule_confirm.get("trend_analysis_confirm")
        confirmed = confirmed.get("second") if confirmed else False
        saved = schedule_saved.get("trend_analysis_saved")
        saved = saved.get("second") if saved else False

        return jsonify(result=True, ixSecond_infos=infos,
                       ixSecond_confirmed=confirmed,
                       ixSecond_saved=saved)


# 第九次课程第二部分
@accoj_bp.route('/courseix_2', methods=['POST', 'GET'])
def courseix_2():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/courseix_2.html')


# 共同比分析法 资产负债表
@accoj_bp.route('/submit_ix2_first_info', methods=['POST'])
def submit_ix2_first_info():
    """
    提交资产负债表信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        infos = json_data.get("ix2First_infos")
        submit_type = json_data.get("submit_type")
        if not infos:
            return jsonify(result=False, message="资产负债表信息为空")
        if submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")

        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        confirm = schedule_confirm.get("common_ratio_analysis_confirm")

        if not confirm or not confirm.get("first"):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"common_ratio_analysis_infos.new_balance_sheet_infos" : infos,
                                                  "schedule_confirm.common_ratio_analysis_confirm.first": True,
                                                  "schedule_saved.common_ratio_analysis_saved.first"    : True}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"common_ratio_analysis_infos.new_balance_sheet_infos": infos,
                                                  "schedule_saved.common_ratio_analysis_saved.first"   : True}}
                                        )
                return jsonify(result=True)
        elif schedule_confirm.get("common_ratio_analysis_confirm").get("first"):
            # 信息已提交确认
            return jsonify(result=False, message="已经确认提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_ix2_first_info', methods=['POST'])
def get_ix2_first_info():
    """
    获取资产负债表信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(common_ratio_analysis_infos=1, schedule_confirm=1, schedule_saved=1,
                                                 _id=0))
        infos = company.get("common_ratio_analysis_infos")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not infos or not infos.get("new_balance_sheet_infos"):
            return jsonify(result=True, ix2First_infos=None)

        infos = infos.get("new_balance_sheet_infos")
        confirmed = schedule_confirm.get("common_ratio_analysis_confirm")
        confirmed = confirmed.get("first") if confirmed else False
        saved = schedule_saved.get("common_ratio_analysis_saved")
        saved = saved.get("first") if saved else False

        return jsonify(result=True, ix2First_infos=infos,
                       ix2First_confirmed=confirmed,
                       ix2First_saved=saved)


# 共同比分析法 利润表
@accoj_bp.route('/submit_ix2_second_info', methods=['POST'])
def submit_ix2_second_info():
    """
    提交利润表信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        infos = json_data.get("ix2Second_infos")
        submit_type = json_data.get("submit_type")
        if not infos:
            return jsonify(result=False, message="利润表信息为空")
        if submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")

        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        confirm = schedule_confirm.get("common_ratio_analysis_confirm")

        if not confirm or not confirm.get("second"):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"common_ratio_analysis_infos.profit_statement_infos"   : infos,
                                                  "schedule_confirm.common_ratio_analysis_confirm.second": True,
                                                  "schedule_saved.common_ratio_analysis_saved.second"    : True}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"common_ratio_analysis_infos.profit_statement_infos": infos,
                                                  "schedule_saved.common_ratio_analysis_saved.second" : True}}
                                        )
                return jsonify(result=True)
        elif schedule_confirm.get("common_ratio_analysis_confirm").get("second"):
            # 信息已提交确认
            return jsonify(result=False, message="已经确认提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_ix2_second_info', methods=['POST'])
def get_ix2_second_info():
    """
    获取利润表信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(common_ratio_analysis_infos=1, schedule_confirm=1, schedule_saved=1,
                                                 _id=0))
        infos = company.get("common_ratio_analysis_infos")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not infos or not infos.get("profit_statement_infos"):
            return jsonify(result=True, ix2First_infos=None)

        infos = infos.get("profit_statement_infos")
        confirmed = schedule_confirm.get("common_ratio_analysis_confirm")
        confirmed = confirmed.get("second") if confirmed else False
        saved = schedule_saved.get("common_ratio_analysis_saved")
        saved = saved.get("second") if saved else False
        return jsonify(result=True, ix2Second_infos=infos,
                       ix2Second_confirmed=confirmed,
                       ix2Second_saved=saved)

# 第九次课程第三部分
@accoj_bp.route('/courseix_3', methods=['POST', 'GET'])
def courseix_3():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/courseix_3.html')


# 第九次课程第四部分
@accoj_bp.route('/courseix_4', methods=['POST', 'GET'])
def courseix_4():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/courseix_4.html')


# 比率分析法
@accoj_bp.route('/submit_ix4_info', methods=['POST'])
def submit_ix4_info():
    """
    提交比率分析法信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        infos = json_data.get("ix4_infos")
        submit_type = json_data.get("submit_type")
        if not infos:
            return jsonify(result=False, message="信息为空")
        if submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")

        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")

        if not schedule_confirm.get("ix4_info_confirm"):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"ratio_analysis_infos"                   : infos,
                                                  "schedule_confirm.ratio_analysis_confirm": True,
                                                  "schedule_saved.ratio_analysis_saved"    : True}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"ratio_analysis_infos"                 : infos,
                                                  "schedule_saved.ratio_analysis_confirm": True}}
                                        )
                return jsonify(result=True)
        elif schedule_confirm.get("ratio_analysis_confirm"):
            # 信息已提交确认
            return jsonify(result=False, message="已经确认提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_ix4_info', methods=['POST'])
def get_ix4_info():
    """
    获取比率分析法信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(ratio_analysis_infos=1, schedule_confirm=1, schedule_saved=1,
                                                 _id=0))
        infos = company.get("ratio_analysis_infos")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not infos:
            return jsonify(result=True, ix4_infos=None)
        confirmed = schedule_confirm.get("ratio_analysis_confirm")
        saved = schedule_saved.get("ratio_analysis_confirm")
        return jsonify(result=True, ix4_infos=infos,
                       ix4_confirmed=confirmed,
                       ix4_saved=saved)


# 第九次课程----end---------------------------------------------------------------------------------


# 第十次课程----start-------------------------------------------------------------------------------
@accoj_bp.route('/coursex', methods=['POST', 'GET'])
def coursex():
    """
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/coursex.html')


# 杜邦分析法
@accoj_bp.route('/submit_coursex_info', methods=['POST'])
def submit_coursex_info():
    """
    提交杜邦分析法信息
    :return:
    """
    if request.method == "POST":
        json_data = request.get_json()
        infos = json_data.get("coursex_infos")
        submit_type = json_data.get("submit_type")
        if not infos:
            return jsonify(result=False, message="信息为空")
        if submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="提交类型错误")

        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")

        if not schedule_confirm.get("coursex_info_confirm"):
            # 若当前账户信息提交未确认，则确认提交或保存
            if submit_type == "confirm":
                # 提交类型为确认提交
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"dupont_analysis_infos"                   : infos,
                                                  "schedule_confirm.dupont_analysis_confirm": True,
                                                  "schedule_saved.dupont_analysis_saved"    : True}}
                                        )
                return jsonify(result=True)

            elif submit_type == "save":
                # 提交类型为保存
                mongo.db.company.update({"_id": _id},
                                        {"$set": {"dupont_analysis_infos"                 : infos,
                                                  "schedule_saved.dupont_analysis_confirm": True}}
                                        )
                return jsonify(result=True)
        elif schedule_confirm.get("dupont_analysis_confirm"):
            # 信息已提交确认
            return jsonify(result=False, message="已经确认提交过")
        else:
            return jsonify(result=False, message="未知错误!")


@accoj_bp.route('/get_coursex_info', methods=['POST'])
def get_coursex_info():
    """
    获取杜邦分析法信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(dupont_analysis_infos=1, schedule_confirm=1, schedule_saved=1,
                                                 _id=0))
        infos = company.get("dupont_analysis_infos")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not infos:
            return jsonify(result=True, coursex_infos=None)
        confirmed = schedule_confirm.get("dupont_analysis_confirm")
        saved = schedule_saved.get("dupont_analysis_confirm")
        return jsonify(result=True, coursex_infos=infos,
                       coursex_confirmed=confirmed,
                       coursex_saved=saved)


# 第十次课程----end---------------------------------------------------------------------------------


# 用户个人中心----start-----------------------------------------------------------------------------
# Todo 用户个人中心
@accoj_bp.route('/profile', methods=['POST', 'GET'])
def profile():
    """
    :return:
    """
    return render_template('profile.html')


# 用户个人中心----end-------------------------------------------------------------------------------

# 通用视图----start---------------------------------------------------------------------------------
@accoj_bp.route('/get_business_list', methods=['POST', 'GET'])
def get_business_list():
    """
    获取业务信息列表
    :return:
    """
    # 若第一次课程未完成
    if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
        print("error")
        return redirect("/coursei")
    if request.method == "POST":
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
    局部请求前钩子函数
    :return:
    """
    company = mongo.db.company.find_one(dict(student_no=session.get("username")),
                                        dict(schedule_confirm=1, schedule_saved=1))
    if company:
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        g.schedule_confirm = schedule_confirm
        g.schedule_saved = schedule_saved
