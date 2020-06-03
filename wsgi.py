import os
from dotenv import load_dotenv
from accoj import create_app
from gevent.pywsgi import WSGIServer

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

app = create_app('development')
# 静态文件热更
app.jinja_env.auto_reload = True

if __name__ == '__main__':
    http_server = WSGIServer(('0.0.0.0', 80), app)
    http_server.serve_forever()
