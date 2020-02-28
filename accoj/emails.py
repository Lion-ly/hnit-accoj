#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:58
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : emails.py
# @Software: PyCharm

from accoj.extensions import mail
from flask import current_app
from flask_mail import Message
from datetime import datetime
from threading import Thread


def send_async_mail(app, msg):
    with app.app_context():
        mail.send(msg)



def send_mail(to, mail_random, flag,send_password):
    """

    :param to: 收件人
    :param mail_random: 收件人的验证码
    :param flag: 0.表示是注册 1.表示发送找回密码
    :return:
    """
    app = current_app._get_current_object()
    msg = Message(subject='验证码', sender=current_app.config['MAIL_USERNAME'], recipients=[to])
    msg.html = ''''''
    if flag:
        msg.html = '''
                <h1>
                    亲爱的 {nickname},
                </h1>
                <h3>
                    欢迎来到 <b>会计实训系统</b>!
                </h3>
                <p>
                    您的密码已重置为 &nbsp;&nbsp; <b>{send_password}</b> &nbsp;&nbsp; 赶快去个人信息界面去修改密码吧！！！
                </p>
            
                <p>感谢您的支持和理解</p>
                <p>来自：会计实训系统 </p>
                <p><small>{time}</small></p>
                '''.format(nickname='同学', send_password=send_password, time=datetime.now())
    else:
        msg.html = '''
        <h1>
            亲爱的 {nickname},
        </h1>
        <h3>
            欢迎来到 <b>会计实训系统</b>!
        </h3>
        <p>
            您的验证码为 &nbsp;&nbsp; <b>{mailcode}</b> &nbsp;&nbsp; 赶快去填写验证码吧！！！
        </p>
        <h4>
                <b>验证码有效时间为2分钟，<b>
        </h4>
        <p>感谢您的支持和理解</p>
        <p>来自：会计实训系统 </p>
        <p><small>{time}</small></p>
        '''.format(nickname='同学', mailcode=mail_random, time=datetime.now())
    thr = Thread(target=send_async_mail, args=[app, msg])
    thr.start()
    return thr
