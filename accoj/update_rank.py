#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/9/6 15:22
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : update_rank.py
# @Software: PyCharm

from accoj import celery
from accoj.utils import RepeatingTimer
from accoj.extensions import (mongo,
                              redis_cli)


def update_user_rank():
    scores_info = mongo.db.rank.find({}, {'_id': 0})
    scores_info_sorted = sorted(scores_info, key=lambda e: (e.__getitem__('sum_score')), reverse=True)
    scores_info_sorted_len = len(scores_info_sorted)
    for i in range(0, scores_info_sorted_len):
        scores_info_sorted[i]['rank'] = i + 1


def update_user_rank_start(run_every: int):
    t = RepeatingTimer(run_every, update_user_rank)
    t.start()


'''
@periodic_task(run_every=timedelta(seconds=300))
def periodic_update_user_rank():
    update_user_rank_start()
'''


@celery.task
def periodic_update_user_rank():
    update_user_rank_start(300)
