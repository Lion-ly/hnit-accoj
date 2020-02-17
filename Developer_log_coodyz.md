#### 开发者日志
#### Author  : Coodyz
2020-2-1<br/>
1.视图函数命名规范问题，`auth.py`中更改`signup`为`signin`，前端代码也作了相应修改。<br/>
2.给提交有问题的地方标红线<br/>
3.增加创立公司功能，增加内容包括`accoj.py`中视图函数`company_form_submit`，和`js/ajax/course/coursei.js`。
4.在`base.html`增加了一个`jquery.cookie.js`文件，在`auth.js`中增加了cookie保存
5.增加了一个`other`的集合，key有邮箱、验证码
6.修改了一点`auth.py`的代码，增加了`check_email`视图函数,`email.py中有发送邮箱功能`
