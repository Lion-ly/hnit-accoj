# 说明

## 一、安装运行

### 1. Python先安装pipenv

`pip install pipenv`

### 2. 终端cd切换到项目根目录
  
- 创建环境`pipenv install`
- 进入环境`pipenv shell`
- 安装环境`pip install -r requirements.txt`
- 查看路由`flask routes`
  
### 3. MongoDB安装

- windows：<https://www.cnblogs.com/coodyz/p/13410502.html>
- linux：<https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat>

### 4. redis安装

- windows: <https://medium.com/@mayank_goyal/how-to-install-redis-and-as-a-windows-service-f0ab2559a3b>

- linux: <https://realpython.com/python-redis/>

### 5. 运行

- `pipenv shell`
- 更改flask-admin源码，路径为`pythonPath\Lib\site-packages\flask_admin\templates\bootstrap2\admin\static.html`, 将'admin.static'改为'dbadmin.static'
- ```celery worker -A celery_worker.celery --loglevel=INFO --without-gossip --without-mingle --without-heartbeat -Ofair -P gevent```
- 新开一个窗口运行`pipenv shell`
- `flask run --port=80 --host=0.0.0.0`

## 二、编码规范说明

### 1. Python编码规范应遵循PEP 8标准

### 2. Javascript编码规范应遵循ECMAScript 6
  
- 使用let声明变量。
- 连续个变量声明应采用如下形式
  
```js
let value1,
value2;
```

### 3. HTML编码规范应遵循HTML 5

## 三、注意

1. 因为使用了CSRF防御模块，数据请求前应发送CSRF令牌或者随表单一起发送。
