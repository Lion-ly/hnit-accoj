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


def send_async_mail(app,msg):
    with app.app_context():
        mail.send(msg)

def send_mail(to,mail_random):
    """
    :param to: 收件人
    :param nickname: 收件人的昵称
    :return: 执行线程
    """
    app=current_app._get_current_object()
    msg=Message(subject='验证码',sender=current_app.config['MAIL_USERNAME'],recipients=[to])
    msg.html = '''
        <h1>
            亲爱的 {nickname},
        </h1>
        <h3>
            欢迎来到 <b>会计实训系统</b>!
        </h3>
        <p>
            您的验证码为 &nbsp;&nbsp; <b>{mailcode}</b> &nbsp;&nbsp; 赶快去完善注册信息吧！！！
        </p>

        <p>感谢您的支持和理解</p>
        <p>来自：XXX </p>
        <p><small>{time}</small></p>
        '''.format(nickname='同学', mailcode=mail_random, time=datetime.utcnow)
    thr=Thread(target=send_async_mail,args=[app,msg])
    thr.start()
    return thr