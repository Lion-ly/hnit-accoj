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


@accoj_bp.route('/get_company_info', methods=['POST', 'GET'])
def get_company_info():
    """
    获取公司信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one(dict(student_no=session.get("username")),
                                            dict(_id=0,
                                                 com_name=1,
                                                 com_address=1,
                                                 com_business_addr=1,
                                                 com_legal_rep=1,
                                                 com_regist_cap=1,
                                                 com_operate_period=1,
                                                 com_business_scope=1,
                                                 com_shareholder=1
                                                 )
                                            )
        # 公司已经创立过，填充表单
        if company:
            return jsonify(company_info=company)
    return redirect('/coursei')


@accoj_bp.route('/company_form_submit', methods=['POST', 'GET'])
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
                                                 acc_document_confirm=[])
            data_dict["schedule_saved"] = dict(key_element_saved=[], subject_saved=[], entry_saved=[],
                                               balance_sheet_svaed=False, acc_document_saved=[])
            data_dict["com_assets"] = []
            data_dict["businesses"] = []
            data_dict_cp = data_dict.copy()
            # 副本公司同时创建
            data_dict_cp["student_no"] = "{}_cp".format(data_dict["student_no"])
            mongo.db.company.insert_many([data_dict, data_dict_cp])
            return jsonify(result=True)
    return redirect('/coursei')


@accoj_bp.route('/submit_business_infos', methods=['POST', 'GET'])
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
    return redirect('/coursei')


@accoj_bp.route('/get_business_info', methods=['POST', 'GET'])
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
    return redirect('/coursei')


@accoj_bp.route('/revoke_add_business', methods=['POST', 'GET'])
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
    return redirect('/coursei')


@accoj_bp.route('/add_business', methods=['POST', 'GET'])
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

    return redirect('/coursei')


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


@accoj_bp.route('/submit_key_element_info', methods=['POST', 'GET'])
def submit_key_element_info():
    """
    提交会计要素信息
    :return:
    """
    if request.method == "POST":
        if not g.get("schedule_confirm") or not g.schedule_confirm.get("business_confirm"):
            return redirect("/coursei")
        form = request.form
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(businesses=1, schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        affect_type = form.get("affect_type")
        business_no = form.get("business_no")
        key_element_infos = form.get("key_element_infos")
        submit_type = form.get("submit_type")
        if not is_number(business_no) or not is_number(affect_type) or submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="前端数据错误")
        else:
            business_no = int(business_no) - 1
            if business_no > 19 or business_no < 0:
                return jsonify(result=False, message="前端数据错误")
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
    return redirect('/courseii')


@accoj_bp.route('/get_key_element_info', methods=['POST', 'GET'])
def get_key_element_info():
    """
    # 获取会计要素信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")}, {"businesses": 1})
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
    return redirect('/courseii')


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


@accoj_bp.route('/submit_subject_info', methods=['POST', 'GET'])
def submit_subject_info():
    """
    提交会计科目信息
    :return:
    """
    if request.method == "POST":
        form = request.form
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(businesses=1, schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        business_no = form.get("business_no")
        subject_infos = form.get("subject_infos")
        submit_type = form.get("submit_type")
        if not is_number(business_no) or submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="前端数据错误")
        else:
            business_no = int(business_no) - 1
            if business_no > 19 or business_no < 0:
                return jsonify(result=False, message="前端数据错误")
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
    return redirect("/courseiii")


@accoj_bp.route('/get_subject_info', methods=['POST', 'GET'])
def get_subject_info():
    """
    获取会计科目信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")}, {"businesses": 1})
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
    return redirect('/courseiii')


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


@accoj_bp.route('/submit_entry_info', methods=['POST', 'GET'])
def submit_entry_info():
    """
    提交会计分录信息
    :return:
    """
    if request.method == "POST":
        form = request.form
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(businesses=1, schedule_confirm=1))
        _id = company.get("_id")
        schedule_confirm = company.get("schedule_confirm")
        business_no = form.get("business_no")
        entry_infos = form.get("entry_infos")
        submit_type = form.get("submit_type")
        if not is_number(business_no) or submit_type not in ["confirm", "save"]:
            return jsonify(result=False, message="前端数据错误")
        else:
            business_no = int(business_no) - 1
            if business_no > 19 or business_no < 0:
                return jsonify(result=False, message="前端数据错误")
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
    return redirect("/courseiv")


@accoj_bp.route('/get_entry_info', methods=['POST', 'GET'])
def get_entry_info():
    """
    获取会计分录信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")}, {"businesses": 1})
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
    return redirect('/courseiv')


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


@accoj_bp.route('/submit_ledger_info', methods=['POST', 'GET'])
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
    return redirect('/coursev')


@accoj_bp.route('/get_ledger_info', methods=['POST', 'GET'])
def get_ledger_info():
    """
    获取会计账户信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            {"ledger_infos"  : 1, "involve_subjects": 1, "schedule_confirm": 1,
                                             "schedule_saved": 1})
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
    return redirect('/coursev')


@accoj_bp.route('/delete_ledger_info', methods=['POST', 'GET'])
def delete_ledger_info():
    """
    删除会计账户信息
    :return:
    """
    if request.method == "POST":
        form = request.form
        subject = form.get("subject")
        if subject:
            company = mongo.db.company.find_one({"student_no": session.get("username")}, {"involve_subjects": 1})
            involve_subjects = company.get("involve_subjects")
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
    return redirect('/coursev')


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


@accoj_bp.route('/submit_balance_sheet_info', methods=['POST', 'GET'])
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
            # 若当前账户信息提交未确认，则确认提交或保存
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
            return jsonify(result=False, message="此账户已经提交过")
        else:
            return jsonify(result=False, message="未知错误!")
    return render_template('course/coursev_2.html')


@accoj_bp.route('/get_balance_sheet_info', methods=['POST', 'GET'])
def get_balance_sheet_info():
    """
    获取平衡表信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            {"balance_sheet_infos": 1, "schedule_confirm": 1, "schedule_saved": 1})
        balance_sheet_infos = company.get("balance_sheet_infos")
        schedule_confirm = company.get("schedule_confirm")
        schedule_saved = company.get("schedule_saved")
        if not balance_sheet_infos:
            return jsonify(result=True, balance_sheet_infos=None)
        balance_sheet_infos["confirmed"] = True if schedule_confirm.get("balance_sheet_confirm") else False
        balance_sheet_infos["saved"] = True if schedule_saved.get("balance_sheet_saved") else False
        return jsonify(result=True, balance_sheet_infos=balance_sheet_infos)
    return render_template('course/coursev_2.html')


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


@accoj_bp.route('/submit_acc_document_info', methods=['POST', 'GET'])
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
    return redirect("/courseiv")


@accoj_bp.route('/get_acc_document_info', methods=['POST', 'GET'])
@limit_content_length(5 * 1024 * 1024)
def get_acc_document_info():
    """
    获取会计凭证信息
    :return:
    """
    if request.method == "POST":
        company = mongo.db.company.find_one({"student_no": session.get("username")}, {"businesses": 1})
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
    return redirect('/courseiv')


@accoj_bp.route('/download_acc_document_info', methods=['POST', 'GET'])
def download_acc_document_info():
    """
    下载会计凭证信息
    :return:
    """
    if request.method == "POST":
        form = request.form
        business_no = form.get("business_no")
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
    return redirect('/courseiv')


# 第六次课程----end---------------------------------------------------------------------------------


# 第七次课程----start-------------------------------------------------------------------------------
# Todo 第七次课程
@accoj_bp.route('/coursevii', methods=['POST', 'GET'])
def coursevii():
    """
    :return:
    """
    return render_template('course/coursevii.html')


# 第七次课程----end---------------------------------------------------------------------------------


# 第八次课程----start-------------------------------------------------------------------------------
# Todo 第八次课程
@accoj_bp.route('/courseviii', methods=['POST', 'GET'])
def courseviii():
    """
    :return:
    """
    return render_template('course/courseviii.html')


# 第八次课程----end---------------------------------------------------------------------------------


# 第九次课程----start-------------------------------------------------------------------------------
# Todo 第九次课程第一部分
@accoj_bp.route('/courseix', methods=['POST', 'GET'])
def courseix():
    """
    :return:
    """
    return render_template('course/courseix.html')


# Todo 第九次课程第二部分
@accoj_bp.route('/courseix_2', methods=['POST', 'GET'])
def courseix_2():
    """
    :return:
    """
    return render_template('course/courseix_2.html')


# Todo 第九次课程第三部分
@accoj_bp.route('/courseix_3', methods=['POST', 'GET'])
def courseix_3():
    """
    :return:
    """
    return render_template('course/courseix_3.html')


# Todo 第九次课程第四部分
@accoj_bp.route('/courseix_4', methods=['POST', 'GET'])
def courseix_4():
    """
    :return:
    """
    return render_template('course/courseix_4.html')


# 第九次课程----end---------------------------------------------------------------------------------


# 第十次课程----start-------------------------------------------------------------------------------
# Todo 第十次课程
@accoj_bp.route('/coursex', methods=['POST', 'GET'])
def coursex():
    """
    :return:
    """
    return render_template('course/coursex.html')


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
