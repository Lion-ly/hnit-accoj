#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/9/20 16:18
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : admin.py
# @Software: PyCharm

import json
from flask import (Blueprint,
                   render_template,
                   jsonify,
                   request,
                   redirect,
                   url_for,
                   send_file)
from accoj.extensions import (mongo,
                              redis_cli)
from accoj.utils import (create_account,
                         login_required_admin,
                         change_password)
import time

from accoj.evaluation import rejudge

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/index', methods=['GET'])
def index():
    """后台管理员首页"""
    return render_template('admin/home.html')


@admin_bp.route('/user_list', methods=['GET'])
def user_list():
    """用户列表页面"""
    return render_template('admin/user_list.html')


@admin_bp.route('/get_user_list', methods=['GET'])
def get_user_list():
    """获取用户列表"""
    _user_info = mongo.db.user.find({},
                                    dict(_id=0))
    user_info = list()
    num = 0
    for user in _user_info:
        e_dic = dict(num=num,
                     student_no=user.get('student_no'),
                     role=user.get('role'),
                     student_name=user.get('student_name'),
                     nick_name=user.get('nick_name'),
                     student_school=user.get('student_school'),
                     student_faculty=user.get('student_faculty'),
                     student_class=user.get('student_class'),
                     teacher=user.get('teacher'),
                     student_sex=user.get('student_sex'),
                     email=user.get('email'))
        num += 1
        user_info.append(e_dic)
    result, data = True, user_info
    return jsonify(result=result, data=data)


@admin_bp.route('/get_create_account', methods=['GET'])
def get_create_account():
    """创建账号页面"""
    return render_template('admin/create_account.html')


@admin_bp.route('/submit_create_account', methods=['POST'])
def submit_create_account():
    """提交创建的账号信息"""
    result, data, message = False, {}, "未知错误"
    json_data = request.get_json()
    data_list = ["student_no", "student_name", "password", "role", "student_faculty", "student_class", "student_school",
                 "student_phone", "teacher"]
    data_list_len = len(data_list)
    student_no = json_data.get("student_no")
    user = mongo.db.user.find_one({"student_no": student_no})
    if not user:
        create_account(*[json_data.get(data_list[i]) for i in range(0, data_list_len)])
        result, message = True, "账号创建成功！"
    if not result:
        message = "账号已存在！"
    return jsonify(result=result, message=message)


@admin_bp.route('/change_pwd', methods=['GET'])
def change_pwd():
    """更改密码页面"""
    return render_template('admin/change_pwd.html')


@admin_bp.route('/submit_change_pwd', methods=['POST'])
def submit_change_pwd():
    """提交更改的密码信息"""
    result, data, message = False, {}, "未知错误！"
    json_data = request.get_json()
    if mongo.db.user.find({"student_no": json_data.get("student_no")}):
        change_password(student_no=json_data.get("student_no"), new_password=json_data.get("password"))
        result, message = True, "密码更改成功！"
    if not result:
        message = "账号不存在！"
    return jsonify(result=result, data=data, message=message)


@admin_bp.route('/audit_class', methods=['GET'])
def audit_class():
    """班级审核页面"""
    return render_template('admin/audit_class.html')


@admin_bp.route('/get_audit_class', methods=['GET'])
def get_audit_class():
    """获取班级审核表"""
    user_info = redis_cli.lrange("user_info", 0, -1)
    user_info_len = len(user_info)
    for i in range(0, user_info_len):
        user_info[i] = json.loads(user_info[i])
        user_info[i].update({"num": i + 1})
        user_info[i].update({"tmp": "<button type='button' class='btn btn-info'>批准通过</button>"})
    user_info = list(filter(lambda u: u.get("status") == "审核中", user_info))
    result, data = True, user_info
    return jsonify(result=result, data=data)


@admin_bp.route('/submit_audit_class', methods=['POST'])
def submit_audit_class():
    """提交班级审核信息"""
    result, data = False, {}
    json_data = request.get_json()
    student_no = json_data.get('student_no')
    if student_no.encode('utf-8') in redis_cli.smembers('user'):
        result, data["message"] = True, "操作成功！"
    if not result:
        data["message"] = "操作失败！"
    return jsonify(result=result, data=data)


@admin_bp.route('/course_manage', methods=['GET'])
def course_manage():
    """课程管理页面"""
    return render_template('admin/course_manage.html')


@admin_bp.route('/submit_rejudge', methods=['POST'])
def submit_rejudge():
    """重判题目"""
    data = request.get_json()
    course_no = int(data.get('course_no'))
    class_name = data.get('class_name')
    student_no = data.get('student_no')
    rejudge.delay(course_no, class_name, student_no)
    message = "操作成功！"
    return jsonify(result=True, data=None, message=message)


@admin_bp.route('/log_backup', methods=['GET'])
def log_backup():
    """日志查看页面"""
    return render_template('admin/log_backup.html')


@admin_bp.route('/debug_log_download', methods=['GET'])
def debug_log_download():
    """debug日志下载"""
    return send_file('log/debug.log', as_attachment=True)


@admin_bp.route('/request_log_download', methods=['GET'])
def request_log_download():
    """request日志下载"""
    return send_file('log/request.log', as_attachment=True)


@admin_bp.route('/announcement', methods=['GET'])
def announcement():
    """公告页面"""
    data = mongo.db.notice.find_one(dict(is_modify=1))
    if data:
        return render_template('admin/announcement.html', data=data)
    else:
        return render_template('admin/announcement.html', data=dict())


@admin_bp.route('/release_announcement', methods=['POST'])
def release_announcement():
    """发布公告"""
    form = request.get_json()
    notice_subject = form.get("notice_subject")
    notice_text = form.get("notice_text")
    notice_abstract = form.get("notice_abstract")
    res = mongo.db.notice.find_one(dict(subject=notice_subject))
    if res and res["is_modify"] == 0:
        return jsonify(result=False)
    if res and res["is_modify"]:
        mongo.db.notice.update_one(dict(is_modify=1), {
            "$set": dict(subject=notice_subject, text=notice_text, abstract=notice_abstract, is_topping=0,
                         is_modify=0)})
        return jsonify(result=True)
    notice = dict(subject=notice_subject, text=notice_text,
                  abstract=notice_abstract, is_topping=0,
                  is_modify=0,
                  timestamp=time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))
    mongo.db.notice.insert_one(notice)

    return jsonify(result=True)


@admin_bp.route('/edit_announcement', methods=['GET'])
def edit_announcement():
    """获取编辑公告首页"""

    def get_page(_page, _index=3):
        """页码"""
        count = mongo.db.notice.count()
        if count % 14 or count == 0:
            _pages = int(count / 14) + 1
        else:
            _pages = int(count / 14)
        _pages = list(i for i in range(1, _pages + 1))
        _max_page = max(_pages)
        if (_max_page - _index) <= _page:
            _pages_ = _pages[_page - 1:_page + 2]
        else:
            _pages_ = (_pages[_page - 1:_page + 2])
        if len(_pages_) < 3:
            _pages_ = _pages[-3:]
        return _pages_, _max_page

    try:
        page = request.args.get('page', 1, int)
        pages, max_page = get_page(page)
        page_notice = 14
        if page == 1:
            notice = mongo.db.notice.find().sort([("is_topping", -1), ("timestamp", -1)]).limit(page_notice)
            active_page = 1
        else:
            notice = mongo.db.notice.find().sort([("is_topping", -1), ("timestamp", -1)]).skip(
                (page - 1) * page_notice).limit(page_notice)
            active_page = page
        return render_template('admin/edit_announcement.html', notice=list(notice), pages=pages,
                               active_page=active_page,
                               max_page=max_page)
    except Exception as e:
        print(e)
        return render_template("errors/404.html")


@admin_bp.route('/delete_announcement', methods=['GET'])
def delete_announcement():
    """删除公告"""
    try:
        count = request.args.get("count", type=int)
        notice = list(mongo.db.notice.find().sort([("is_topping", -1), ("timestamp", -1)]))
        mongo.db.notice.delete_one(notice[count])
        return redirect(url_for('admin.edit_announcement'))
    except Exception as e:
        print(e)
    return render_template("errors/404.html")


@admin_bp.route('/is_topping', methods=['POST'])
def is_topping():
    """置顶"""
    try:
        result = request.get_json()
        result["is_topping"] = result["is_topping"].replace(" ", "").replace("\n", "")
        print(result)
        if result["is_topping"] == "置顶":
            _is_topping = mongo.db.notice.find_one({"is_topping": 1})
            if _is_topping is None:
                mongo.db.notice.update_one(dict(subject=result["notice_subject"]), {"$set": dict(is_topping=1)})
                return jsonify(result=True, message="取消置顶")
            else:
                return jsonify(result=False, message="置顶")
        elif result["is_topping"] == "取消置顶":
            mongo.db.notice.update_one(dict(subject=result["notice_subject"]), {"$set": dict(is_topping=0)})
            return jsonify(result=True, message="置顶")

    except Exception as e:
        print(e)
        return jsonify(result=False)


@admin_bp.route('/is_modify', methods=['POST'])
def is_modify():
    """编辑公告"""
    try:
        result = request.get_json()
        res = mongo.db.notice.find_one(dict(is_modify=1))
        if res:
            mongo.db.notice.update_many(dict(is_modify=1), {"$set": dict(is_modify=0)})
        mongo.db.notice.update_one(dict(subject=result["notice_subject"]), {"$set": dict(is_modify=1)})
        return jsonify(flag=True)

    except Exception as e:
        print(e)
        return jsonify(flag=False)


@admin_bp.before_request
@login_required_admin
def admin_bp_before_request():
    """
    请求前钩子函数（局部）
    """
    pass
