from flask import (session,
                   Blueprint,
                   render_template,
                   redirect,
                   url_for)
from accoj.utils import login_required_teacher

teacher_bp = Blueprint("teacher", __name__)


# 教师后台管理----start-----------------------------------------------------------------------------
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

@teacher_bp.before_request
@login_required_teacher
def accoj_bp_before_request():
    """
    请求前钩子函数（局部）
    """
    if session.get("role") == "admin":
        return redirect(url_for('admin.index'))
