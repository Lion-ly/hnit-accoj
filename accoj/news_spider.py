#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time : 2020-06-11 21:41
# @Author : Coodyz
# @Site : https://github.com/coolbreeze2
# @File : news_spider.py
# @Software: PyCharm
from bson.json_util import dumps
from datetime import timedelta
from pyquery import PyQuery as pq
from accoj.extensions import mongo, redis_cli
from accoj.utils import RepeatingTimer, redis_multi_push
from celery.task.base import periodic_task
from accoj import celery
import requests


def news_spider():
    """
    把src a等等数据放进数据库
    """
    news = redis_cli.lrange('news', 0, 20)
    if news:
        # mongo.db.news_spider.delete_many({})
        # 删除新闻
        redis_cli.delete('news')

    header = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
    }
    url = "https://www.kuaiji.com/kuaijishiwu/kuaijixuexi/"
    response = requests.get(url=url, headers=header)
    response.encoding = 'utf-8'
    doc = pq(response.text)
    a = doc('div.flex.box>div.flex.f-d_c.flex_1.j-c_s-b div:first-child>a')
    result = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
    index = 0
    for item in a.items():
        a_href = item.attr('href')
        a_href_all = a_href
        result[index]['a_href'] = a_href_all
        index += 1

    img = doc('div.flex.box>div.article-list-img.img-item a>img')
    index = 0
    for item in img.items():
        img_src = item.attr('src')
        result[index]['img_src'] = img_src
        index += 1

    title = doc('div.flex.box>div.flex.f-d_c.flex_1.j-c_s-b div:first-child a div:first-child')
    index = 0
    for item in title.items():
        title_text = item.text()
        result[index]['title_text'] = title_text
        index += 1

    content = doc('div.flex.box>div.flex.f-d_c.flex_1.j-c_s-b div:first-child a div:nth-child(2)')
    index = 0
    for item in content.items():
        content_text = item.text()
        result[index]['content_text'] = content_text
        index += 1

    time = doc('div.flex.box>div.flex.f-d_c.flex_1.j-c_s-b div.infos.flex-space-between span:first-child')
    index = 0
    for item in time.items():
        time_text = item.text()
        result[index]['time_text'] = time_text
        index += 1
    result = [dumps(r) for r in result]
    redis_multi_push(redis_cli, 'news', result)
    # mongo.db.news_spider.insert(result)


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
    try:
        new_spider_start()
    except Exception as e:
        print(e)
