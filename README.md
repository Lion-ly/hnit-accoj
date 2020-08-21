## 一、运行说明
1. Python先安装pipenv
`pip install pipenv`<br/>
2. 终端cd切换到项目根目录<br/>
  创建环境`pipenv install`<br/>
  进入环境`pipenv shell`<br/>
  安装环境`pip install -r requirements.txt`<br/>
  运行应用`flask run --host=0.0.0.0 --port=80`<br/>
  查看路由`flask routes`<br/>
3. MongoDB安装：<br/>
windows：https://www.cnblogs.com/coodyz/p/13410502.html<br/>
linux：https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat<br/>
4. redis安装：<br/>
windows: `https://medium.com/@mayank_goyal/how-to-install-redis-and-as-a-windows-service-f0ab2559a3b`<br/>
linux: `https://realpython.com/python-redis/`
## 二、编码规范说明
1. Python编码规范应尽可能遵循PEP 8标准。
2. Javascript编码规范应遵循ECMAScript 6。
    * 使用let声明变量。
    * 连续个变量声明应采用如下形式
    ```
    let value1,
        value2;
    ```
3. HTML编码规范应遵循HTML 5。<br/>
## 三、注意
1. 因为使用了CSRF防御模块，数据请求前应发送CSRF令牌或者随表单一起发送。
