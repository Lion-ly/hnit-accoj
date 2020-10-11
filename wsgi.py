from gevent import monkey

monkey.patch_all()

import os
import sys
import logging
from dotenv import load_dotenv
from accoj import create_app
from gevent.pywsgi import WSGIServer
from accoj.news_spider import periodic_run_news_spider
from accoj.update_rank import periodic_update_user_rank

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

from flask import has_request_context, request
from flask.logging import default_handler
from accoj.utils.get_remote_addr import get_remote_addr


class RequestFormatter(logging.Formatter):
    def format(self, record):
        if has_request_context():
            record.url = request.url
            record.remote_addr = get_remote_addr()
        else:
            record.url = None
            record.remote_addr = None

        return super().format(record)


# 更改日志默认格式
formatter = RequestFormatter(
    '[%(asctime)s] %(remote_addr)s requested %(url)s\n'
    '%(levelname)s in %(module)s: %(message)s'
)
default_handler.setFormatter(formatter)

app = create_app('development')
# 静态文件热更
app.jinja_env.auto_reload = True
# 后台启动爬虫
periodic_run_news_spider.delay()
# 后台启动排行榜更新
periodic_update_user_rank.delay()


class RedirectStderr(object):

    def __init__(self, cfg):
        self._log_file = open(cfg['log_path'], 'a')

    def write(self, msg):
        self._log_file.write(msg)
        self._log_file.flush()


# 日志stderr重定向
# sys.stderr = RedirectStderr({'log_path': 'accoj/log/request.log'})

if __name__ == '__main__':
    # logging.basicConfig(filename='accoj/log/debug.log', level=logging.DEBUG)
    # app.run('0.0.0.0', 80)
    http_server = WSGIServer(('0.0.0.0', 80), app)
    http_server.serve_forever()
