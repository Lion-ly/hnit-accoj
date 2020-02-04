## 一、技术使用
**前端框架**：Bootstrap<br/>
**Javascript库**：query<br/>
**数据库**：MongoDB<br/>
**前后端数据交互**：AJAX<br/>
**后端框架**：Python-Flask<br/>
**服务器部署**：Apache/Nginx<br/>
***
## 二、任务
1.任务一：数据库设计。（待完善）<br/>
2.任务二：数据库CRUD操作技术支持。（ToDo）<br/>
3.任务三：前端设计。（1/2）<br/>
4.任务四：前端与后端的数据交互。（ToDo）<br/>
5.任务五：后端功能视图函数。（ToDo）<br/>
6.任务六：后端数据交互视图函数。（ToDo）<br/>
7.任务七：后端数据处理接口实现（会计公式通用接口）。（ToDo）<br/>
8.任务八：安全性策略设计。（ToDo）<br/>
9.任务九：整合优化。（ToDo）<br/>
***后端架构（1/2）***
***
## 三、运行说明
1.Python先安装pipenv
`pip install pipenv`<br/>
2.终端cd切换到项目根目录<br/>
&nbsp;&nbsp;创建环境`pipenv install`<br/>
&nbsp;&nbsp;进入环境`pipenv shell`<br/>
&nbsp;&nbsp;运行应用`flask run --host=0.0.0.0 --port=80`<br/>
&nbsp;&nbsp;查看路由`flask routes`
## 四、后端进度
1.项目后端架构完成 2020-1-20<br/>
2.登陆功能完成 2020-1-21<br/>
## 五、注意
1.因为使用了CSRF防御模块，所有表单需添加<br/>
`<input type="hidden" name="csrf_token" value="{{ csrf_token() }}">`