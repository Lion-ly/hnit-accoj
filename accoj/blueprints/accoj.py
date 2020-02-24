#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:55
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : accoj.py
# @Software: PyCharm
from flask import Blueprint, render_template, redirect, request, jsonify, session, g
from accoj.utils import login_required
from accoj.extensions import mongo
from accoj.utils import is_number
from accoj.deal_business import deal_business
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
            if value is "":
                if key.startswith("com_shareholder_") is False:
                    flag = False
                    err_pos.append({"err_pos": key})
                else:
                    shareholder_num += 1
                    if key == "com_shareholder_1":
                        err_pos.append({"err_pos": key})
            elif key.startswith("com_shareholder_"):
                data_dict["com_shareholder"].append(value)
            elif key == "com_regist_cap" or key == "com_operate_period":
                if is_number(value) is False:
                    flag = False
                    err_pos.append({"err_pos": key})

        if shareholder_num == 0:
            flag = False
        if flag is False:
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
            data_dict["schedule"] = dict(business_confirm=False, key_element_confirm=[], subjects_confirm=[])
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
                                            dict(business_num=1, schedule=1, _id=0))
        if not company:
            return jsonify(result=False, message="公司未创立")
        business_num = company.get("business_num")
        schedule = company.get("schedule")
        business_confirm = schedule.get("business_confirm")
        if company and business_num == 20 and not business_confirm:
            mongo.db.company.update(dict(student_no="{}".format(session.get("username"))),
                                    {"$set": {"schedule.business_confirm": True}})
            mongo.db.company.update(dict(student_no="{}_cp".format(session.get("username"))),
                                    {"$set": {"schedule.business_confirm": True}})
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
                                            dict(businesses=1, schedule=1, _id=0))
        if company:
            businesses = company.get("businesses")
            if not businesses:
                return jsonify(result=False, message="暂无业务")
            schedule = company.get("schedule")
            business_confirm = schedule.get("business_confirm")
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
                                            dict(businesses=1, schedule=1, _id=1))
        if company:
            businesses = company.get("businesses")
            schedule = company.get("schedule")
            business_confirm = schedule.get("business_confirm")
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
        if not company or not g.schedule:
            return jsonify(result=False, message="公司未创立！")
        schedule = g.schedule
        business_confirm = schedule.get("business_confirm")
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
    # 第一次课程未完成
    if not g.get("schedule") or not g.schedule.get("business_confirm"):
        return redirect("/coursei")
    return render_template('course/courseii.html')


@accoj_bp.route('/submit_key_element_info', methods=['POST', 'GET'])
def submit_key_element_info():
    """
    提交会计要素信息
    :return:
    """
    if request.method == "POST":
        if not g.get("schedule") or not g.schedule.get("business_confirm"):
            return redirect("/coursei")
        form = request.form
        company = mongo.db.company.find_one({"student_no": session.get("username")},
                                            dict(businesses=1, schedule=1))
        _id = company.get("_id")
        schedule = company.get("schedule")
        affect_type = form.get("affect_type")
        business_no = form.get("business_no")
        key_element_infos = form.get("key_element_infos")
        if not is_number(business_no) or not is_number(affect_type):
            return jsonify(result=False, message="前端数据错误")
        else:
            business_no = int(business_no) - 1
            if business_no > 19 or business_no < 0:
                return jsonify(result=False, message="前端数据错误")
        # 若当前业务信息提交未确认，则确认提交
        if business_no not in schedule.get("key_element_confirm"):
            mongo.db.company.update({"_id": _id},
                                    {"$set"    : {
                                        ("businesses." + str(business_no) + ".affect_type")      : affect_type,
                                        ("businesses." + str(business_no) + ".key_element_infos"): key_element_infos},
                                        "$push": {"schedule.key_element_confirm": business_no}}
                                    )
            return jsonify(result=True)
        else:
            return jsonify(result=False, message="此业务已经提交过")
    return redirect('/courseii')


@accoj_bp.route('/get_key_element_info', methods=['POST', 'GET'])
def get_key_element_info():
    """
    # 获取会计要素信息
    :return:
    """
    if request.method == "POST":
        if not g.get("schedule") or not g.schedule.get("business_confirm"):
            print("redirect true")
            return redirect("/coursei")
        company = mongo.db.company.find_one({"student_no": session.get("username")}, {"businesses": 1})
        businesses = company.get("businesses")
        schedule = g.schedule
        business_list = list()
        businesses_len = len(businesses)
        for i in range(0, businesses_len):
            key_element_infos = businesses[i].get("key_element_infos")
            confirmed = True if i in schedule.get("key_element_confirm") else False
            content = businesses[i].get("content")
            affect_type = businesses[i].get("affect_type")
            business_type = businesses[i].get("business_type")
            business_no = i + 1
            business_list.append(dict(business_no=business_no, content=content, key_element_infos=key_element_infos,
                                      affect_type=affect_type, confirmed=confirmed, business_type=business_type))
        return jsonify(result=True, business_list=business_list)
    return redirect('/courseii')


# 第二次课程----end---------------------------------------------------------------------------------


# 第三次课程----start-------------------------------------------------------------------------------
# Todo 第三次课程
@accoj_bp.route('/courseiii', methods=['POST', 'GET'])
def courseiii():
    """
    :return:
    """
    return render_template('course/courseiii.html')


# 第三次课程----end---------------------------------------------------------------------------------


# 第四次课程----start-------------------------------------------------------------------------------
# Todo 第四次课程
@accoj_bp.route('/courseiv', methods=['POST', 'GET'])
def courseiv():
    """
    :return:
    """
    return render_template('course/courseiv.html')


# 第四次课程----end---------------------------------------------------------------------------------


# 第五次课程----start-------------------------------------------------------------------------------
# Todo 第五次课程第一部分
@accoj_bp.route('/coursev', methods=['POST', 'GET'])
def coursev():
    """
    :return:
    """
    return render_template('course/coursev.html')


# Todo 第五次课程第二部分
@accoj_bp.route('/coursev_2', methods=['POST', 'GET'])
def coursev_2():
    """
    :return:
    """
    return render_template('course/coursev_2.html')


# 第五次课程----end---------------------------------------------------------------------------------


# 第六次课程----start-------------------------------------------------------------------------------
# Todo 第六次课程
@accoj_bp.route('/coursevi', methods=['POST', 'GET'])
def coursevi():
    """
    :return:
    """
    return render_template('course/coursevi.html')


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
@accoj_bp.route('/detail', methods=['POST', 'GET'])
def detail():
    """
    :return:
    """
    return render_template('detail.html')


# 用户个人中心----end-------------------------------------------------------------------------------


@accoj_bp.before_request
@login_required  # 需要登陆
def accoj_bp_before_request():
    """
    局部请求前钩子函数
    :return:
    """
    company = mongo.db.company.find_one(dict(student_no=session.get("username")),
                                        dict(schedule=1))
    if company:
        schedule = company.get("schedule")
        g.schedule = schedule
