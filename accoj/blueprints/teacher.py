"""
教师后台管理
"""

import json
from flask import (session,
                   Blueprint,
                   render_template,
                   redirect,
                   url_for,
                   jsonify)
from accoj.extensions import redis_cli
from accoj.utils import login_required_teacher

teacher_bp = Blueprint("teacher", __name__)


@teacher_bp.route('/index', methods=['GET'])
def index():
    """
    个人信息
    """
    return render_template('teacher/index.html')


@teacher_bp.route('/message_system', methods=['GET'])
def message_system():
    """
    系统通知
    """
    return render_template('teacher/message_system.html')


@teacher_bp.route('/message_whisper', methods=['GET'])
def message_whisper():
    """
    消息面板
    """
    return render_template('teacher/message_whisper.html')


@teacher_bp.route('/add_class', methods=['GET'])
def add_class():
    """
    添加班级
    """
    return render_template('teacher/add-class.html')


@teacher_bp.route('/manage_time', methods=['GET'])
def manage_time():
    """
    时间管理
    """
    return render_template('teacher/manage-time.html')


@teacher_bp.route('/teacher_correct', methods=['GET'])
def teacher_correct():
    """
    批改作业
    """
    return render_template('teacher/teacher-correct.html')


@teacher_bp.route('/restart_course', methods=['GET'])
def restart_course():
    """
    课程重做
    """
    return render_template('teacher/restart-course.html')


@teacher_bp.route('/teacher_notify_c', methods=['GET'])
def teacher_notify_c():
    """
    发送通知(班级通知)
    """
    return render_template('teacher/teacher-notify-c.html')


@teacher_bp.route('/teacher_notify_p', methods=['GET'])
def teacher_notify_p():
    """
    发送通知(个人通知)
    """
    return render_template('teacher/teacher-notify-p.html')


@teacher_bp.route('/rank', methods=['GET'])
def rank():
    """
    排行榜
    """
    return render_template('teacher/rank.html')


@teacher_bp.route('/get_class_list', methods=['GET'])
def get_class_list():
    """获取班级列表"""
    teacher = session.get("username")
    user_info = redis_cli.lrange("user_info", 0, -1)
    user_info_len = len(user_info)
    for i in range(0, user_info_len):
        user_info[i] = json.loads(user_info[i])
        user_info[i].update({"num": i + 1})
    user_info = list(filter(lambda u: u.get("teacher") == teacher, user_info))
    result, data = True, user_info
    return jsonify(result=result, data=data)


@teacher_bp.route('/team', methods=['GET'])
def team():
    return render_template('teacher/team.html')


@teacher_bp.before_request
@login_required_teacher
def teacher_bp_before_request():
    """
    请求前钩子函数（局部）
    """
    role = session.get("role")
    if role == 'admin':
        return redirect(url_for('admin.index'))
    elif role == 'dbadmin':
        return redirect(url_for('dbadmin.index'))
