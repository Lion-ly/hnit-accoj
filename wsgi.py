import os
import sys
import logging
from dotenv import load_dotenv
from accoj import create_app
from gevent.pywsgi import WSGIServer
from accoj.news_spider import periodic_run_news_spider

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

app = create_app('development')
# 静态文件热更
app.jinja_env.auto_reload = True
# 后台启动爬虫
periodic_run_news_spider.delay()


class RedirectStderr(object):

    def __init__(self, cfg):
        self._log_file = open(cfg['log_path'], 'a')

    def write(self, msg):
        self._log_file.write(msg)
        self._log_file.flush()


# sys.stderr = RedirectStderr({'log_path': 'accoj/log/request.log'})

if __name__ == '__main__':
    # logging.basicConfig(filename='accoj/log/debug.log', level=logging.DEBUG)
    # app.run('0.0.0.0', 80)
    http_server = WSGIServer(('0.0.0.0', 80), app)
    http_server.serve_forever()
