#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/9/6 15:22
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : update_rank.py
# @Software: PyCharm

from bson.json_util import dumps
from accoj import celery
from accoj.utils import RepeatingTimer
from accoj.extensions import (mongo,
                              redis_cli)


def update_user_rank():
    """更新排行榜信息"""
    scores_info = mongo.db.rank.find({}, {'_id': 0})
    data = {dumps(scores): scores.get('sum_score') for scores in scores_info}
    redis_cli.delete('rank')
    redis_cli.zadd('rank', data)
    # team 排行榜
    scores_team_info = mongo.db.rank_team.find({}, {'_id': 0})
    data = {dumps(scores): scores.get('sum_score') for scores in scores_team_info}
    redis_cli.delete('rank_team')
    redis_cli.zadd('rank_team', data)


def update_user_rank_start(run_every: int = 300):
    """排行榜信息周期更新，单位为秒"""
    t = RepeatingTimer(run_every, update_user_rank)
    t.start()


'''
@periodic_task(run_every=timedelta(seconds=300))
def periodic_update_user_rank():
    update_user_rank_start()
'''


@celery.task
def periodic_update_user_rank():
    """周期定时更新排行榜信息"""
    update_user_rank_start()
