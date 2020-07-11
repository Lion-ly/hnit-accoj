"""
用户个人中心
"""
from flask import (Blueprint,
                   session,
                   render_template,
                   redirect,
                   url_for)
from accoj.utils import login_required_student

profile_bp = Blueprint("profile", __name__)


@profile_bp.route('/index', methods=['GET'])
def index():
    """
    个人信息
    """
    return render_template('profile/index.html')


@profile_bp.route('/message_system', methods=['GET'])
def message_system():
    """
    系统通知
    """
    return render_template('profile/message_system.html')


@profile_bp.route('/message_whisper', methods=['GET'])
def message_whisper():
    """
    消息面板
    """
    return render_template('profile/message_whisper.html')


@profile_bp.route('/profile_schedule', methods=['GET'])
def profile_schedule():
    """
    完成进度
    """
    return render_template('profile/profile-schedule.html')


@profile_bp.route('/profile_score', methods=['GET'])
def profile_score():
    """
    学生成绩
    """
    return render_template('profile/profile-score.html')


@profile_bp.route('/rank', methods=['GET'])
def rank():
    """
    排行榜
    """
    return render_template('profile/rank.html')


@profile_bp.before_request
@login_required_student
def accoj_bp_before_request():
    """
    请求前钩子函数（局部）
    """
    if session.get("role") == "admin":
        return redirect(url_for('admin.index'))
