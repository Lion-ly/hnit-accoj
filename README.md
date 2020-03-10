## 一、技术使用
**前端框架**：Bootstrap<br/>
**Javascript库**：jQuery<br/>
**数据库**：MongoDB<br/>
**前后端数据交互**：AJAX<br/>
**后端框架**：Python-Flask<br/>
**服务器部署**：Apache/Nginx<br/>
***
## 二、任务
1. 任务一：数据库设计。（待完善）<br/>
2. 任务二：数据库CRUD操作技术支持。<br/>
3. 任务三：前端设计。（1/2）<br/>
4. 任务四：前端与后端的数据交互。（1/2）<br/>
5. 任务五：后端功能视图函数。（7/10）<br/>
6. 任务六：后端数据交互视图函数。（7/10）<br/>
7. 任务七：后端数据处理接口实现（会计公式通用接口）。（2/10）<br/>
8. 任务八：安全性策略设计。（ToDo）<br/>
9. 任务九：整合优化。（ToDo）<br/>
***后端架构（1/2）***
***
## 三、运行说明
1. Python先安装pipenv
`pip install pipenv`<br/>
2. 终端cd切换到项目根目录<br/>
  创建环境`pipenv install`<br/>
  进入环境`pipenv shell`<br/>
  安装环境`pip install -r requirements.txt`<br/>
  运行应用`flask run --host=0.0.0.0 --port=80`<br/>
  查看路由`flask routes`<br/>
3. mongo windows安装见https://www.cnblogs.com/coodyz/p/12219823.html<br/>
&nbsp;&nbsp;linux见https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat
## 四、后端进度
第七次课程完成。
## 五、注意
1. 因为使用了CSRF防御模块，数据请求前应发送CSRF令牌或者随表单一起发送。<br/>
## 六、编码规范说明
1. Python编码规范应尽可能遵循PEP 8标准。
2. Javascript编码规范应遵循ECMAScript 6。
    * 使用let声明变量。
    * 连续个变量声明应采用如下形式
    ```
    let value1,
        value2;
    ```
3. HTML编码规范应遵循HTML 5。
