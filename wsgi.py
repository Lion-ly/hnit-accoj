from gevent import monkey

monkey.patch_all()

import os
import sys
import logging
from accoj.utils.log_util import RedirectStderr
from dotenv import load_dotenv
from accoj import create_app
from gevent.pywsgi import WSGIServer
from accoj.news_spider import periodic_run_news_spider
from accoj.update_rank import periodic_update_user_rank

if __name__ == '__main__':
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)

    app = create_app('development')
    # 静态文件热更
    app.jinja_env.auto_reload = True
    # 后台启动爬虫
    periodic_run_news_spider.delay()
    # 后台启动排行榜更新
    periodic_update_user_rank.delay()
    # 日志stderr重定向
    if not app.config.get('DEBUG'):
        sys.stderr = RedirectStderr({'log_path': app.config.get('LOG_PATH')})
        logging.basicConfig(filename=app.config.get('LOG_DEBUG_PATH'), level=logging.DEBUG)
    http_server = WSGIServer(('0.0.0.0', 80), app)
    http_server.serve_forever()
