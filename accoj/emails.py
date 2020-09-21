#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:58
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : emails.py
# @Software: PyCharm

from accoj.extensions import mail
from flask import current_app, session
from flask_mail import Message
from datetime import datetime
from threading import Thread
from accoj.extensions import mongo
from xpinyin import Pinyin
from werkzeug.security import generate_password_hash
from typing import List, Dict
import requests
import json
from accoj import celery

'''
def send_async_mail(app, msg):
    with app.app_context():
        mail.send(msg)
'''


def send_mail(to, mail_random, flag, send_password):
    """

    :param to: 收件人
    :param mail_random: 收件人的验证码
    :param flag: 0.表示是注册 1.表示发送找回密码
    :param send_password:
    :return:
    """
    app = current_app._get_current_object()
    msg = Message(subject='验证码', sender=current_app.config['MAIL_USERNAME'], recipients=[to])
    msg.html = ''''''
    if flag:
        msg.html = '''<p><font size='3' face='arial'>【HNIT ACCOJ】新密码为：
                                <font size='3' face='arial' color='0033ff'>{send_password}</font></font></p>
                                <font size='3' face='arial'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;及时修改</font>
                                <p><font size='1' face='arial'>&nbsp;&nbsp;&nbsp;{time}</font></p>
                                '''.format(send_password=send_password, time=datetime.now().replace(microsecond=0))

    else:
        msg.html = '''
                        <p><font size='3' face='arial'>【HNIT ACCOJ】你本次的验证码为：
                        <font size='3' face='arial' color='0033ff'>{mailcode}</font></font></p>
                        <font size='3' face='arial'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;两分钟内有效</font>
                        <p><font size='1' face='arial'>&nbsp;&nbsp;&nbsp;{time}</font></p>
                        '''.format(mailcode=mail_random, time=datetime.now().replace(microsecond=0))
    # with app.app_context():
    mail.send(msg)
    # thr = Thread(target=send_async_mail, args=[app, msg])
    # thr.start()
    # return thr


@celery.task
def async_send_mail(to, mail_random, flag, send_password):
    send_mail(to, mail_random, flag, send_password)


def gain_access_token():
    """
    获取access_token
    :return:
    """
    corpid = 'ww0022c7e541c2e11b'
    corpsecret = 'EvOPZQNU1KI21hAksiCWv15BvA2kf_A8YhpEVaQqdsM'
    url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid={}&corpsecret={}'.format(corpid, corpsecret)
    response = requests.get(url)
    result = response.json()
    if result['errcode'] is 0:
        return result['access_token']
    else:
        return 0


def assign_email(user_infos: List[Dict[str, str]], teacher: str):
    """
    分配邮箱账号并把邮箱账号写入到数据库

    :param user_infos: [dict(student_no=int,
                             student_name=str,
                             student_school=str,
                             student_faculty=str,
                             student_class=str.
                             student_phone=int)]
    :param teacher:
    :return result, message: tuple[bool, str]
    """
    # username = session.get('username')
    if not user_infos:
        return False, 'excel表为空！'
    access_token = gain_access_token()
    add_url = 'https://qyapi.weixin.qq.com/cgi-bin/user/create?access_token={}'.format(access_token)
    posts = []
    if access_token is not 0:
        for result in user_infos:
            student_no = result.get('student_no')
            userid = f'{student_no}'
            get_url = 'https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token={ACCESS_TOKEN}&userid={USERID}'.format(
                ACCESS_TOKEN=access_token, USERID=userid)
            get_response = requests.get(get_url)
            get_result = get_response.json()
            errcode = get_result['errcode']
            if not errcode:
                return False, f'学号{student_no}已存在或格式非法，添加失败！'

        for result in user_infos:
            name = result.get('student_name')
            student_no = result.get('student_no')
            student_school = result.get('student_school')
            student_faculty = result.get('student_faculty')
            student_class = result.get('student_class')
            student_phone = result.get('student_phone')
            mobile = f'{student_phone}'
            userid = f'{student_no}'
            department = [3]
            body_value = {
                "userid"    : userid,
                "name"      : name,
                "department": department,
                "mobile"    : mobile,
                "password"  : '123'
            }

            body = json.dumps(body_value)
            add_response = requests.post(add_url, data=body)
            create_result = add_response.json()
            errcode = create_result['errcode']

            if errcode is 0:
                get_url = 'https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token={ACCESS_TOKEN}&userid={USERID}'.format(
                    ACCESS_TOKEN=access_token, USERID=userid)
                get_response = requests.get(get_url)
                get_result = get_response.json()
                if get_result['errcode'] is 0:
                    email = f'{userid}@accoj.top'
                    role = 'student'
                    posts.append(dict(
                        student_no=userid,
                        role=role,
                        student_name=name,
                        nick_name="",
                        teacher=teacher,
                        student_school=student_school,
                        personalized_signature="",
                        student_faculty=student_faculty,
                        student_class=student_class,
                        student_phone=mobile,
                        student_sex="",
                        student_borth="",
                        password=f"{generate_password_hash('123', salt_length=24)}",
                        email=email
                    ))
                else:
                    return False, '添加失败'
    mongo.db.user.insert_many(posts)
    return True, '添加班级成功！'
