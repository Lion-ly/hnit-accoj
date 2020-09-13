#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time : 2020-06-11 21:41
# @Author : Coodyz
# @Site : https://github.com/coolbreeze2
# @File : news_spider.py
# @Software: PyCharm
from datetime import timedelta
from pyquery import PyQuery as pq
from accoj.extensions import mongo
from accoj.utils import RepeatingTimer
from celery.task.base import periodic_task
from accoj import celery
import requests


def news_spider():
    """
    把src a等等数据放进数据库
    """
    header = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
    }
    url = "https://www.kuaiji.com/kuaijishiwu/kuaijixuexi/"
    response = requests.get(url=url, headers=header)
    response.encoding = 'utf-8'
    doc = pq(response.text)
    a = doc('div.search-result>ul li div.desc a:first-child')
    result = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
    index = 0
    cnt = mongo.db.news_spider.find().count()
    if cnt == 10:
        mongo.db.news_spider.delete_many({})
    for item in a.items():
        a_href = item.attr('href')
        a_href_all = url + a_href
        result[index]['a_href'] = a_href_all
        index += 1

    img = doc('div.search-result>ul li div.img img')
    index = 0
    for item in img.items():
        img_src = item.attr('src')
        result[index]['img_src'] = img_src
        index += 1

    title = doc('div.search-result>ul li div.desc a:first-child>h3')
    index = 0
    for item in title.items():
        title_text = item.text()
        result[index]['title_text'] = title_text
        index += 1

    content = doc('div.search-result>ul li div.desc a:nth-child(2)>p')
    index = 0
    for item in content.items():
        content_text = item.text()
        result[index]['content_text'] = content_text
        index += 1

    time = doc('div.search-result>ul li div.desc>div.info>span.time')
    index = 0
    for item in time.items():
        time_text = item.text()
        result[index]['time_text'] = time_text
        index += 1

    span = doc('div.search-result>ul li div.desc div.info')
    span.find('span').remove()
    index = 0
    for item in span.items():
        span_text = item.text()
        result[index]['span_text'] = span_text
        index += 1

    mongo.db.news_spider.insert(result)


def new_spider_start():
    t = RepeatingTimer(36000, news_spider)
    t.start()


'''
@periodic_task(run_every=timedelta(seconds=36000))
def periodic_run_news_spider():
    news_spider()
'''


@celery.task
def periodic_run_news_spider():
    new_spider_start()
