# Accoj服务器配置
## 1 安装Centos 7
安装完成后将`/etc/sysconfig/network-scripts/ifcfg-....`对应网卡名，文件配置的ONBOOT从no修改为yes。
## 2 安装图形界面
`yum install epel-release`

https://www.cnblogs.com/coodyz/p/13648399.html
## 3 防火墙开启端口
```
# 开启端口，开启后需要重启防火墙
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent

# 启动防火墙
systemctl start firewalld

# 重启防火墙
firewall-cmd --reload

# 禁用防火墙
systemctl stop firewalld

# 关闭SElinux
setenforce 0
# 永久关闭,将 "SELINUX=enforcing" 改为 "SELINUX=disabled"，保存后退出，注意重启才会生效
vim /etc/selinux/config 
```
## 4 安装MongoDB,Redis,nginx

```
# https://www.cnblogs.com/coodyz/p/12219823.html
# https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/
# 安装MongoDB
sudo yum install -y mongodb-org
mongo
# 启动服务
systemctl start mongod
systemctl enable mongod
# 在mongo shell中配置账密
db.createUser(
  { user: "admin",
    customData: {description: "superuser"},
    pwd: "ag9JtXMW1TVqsOXF",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
);

db.createUser(
    {
        user:"root",
        pwd:"ag9JtXMW1TVqsOXF",
        roles:["root"]
    }
);

db.createUser(
    {
        user:"accojAdmin",
        pwd:"ag9JtXMW1TVqsOXF",
        roles:["dbOwner"]
    }
);

db.createUser(
    {
        user:"accojOwner",
        pwd:"Love199805#",
        roles:["dbOwner"]
    }
);

# /var/lib/mongo 数据目录
# /var/log/mongodb 日志目录
# 更改配置文件 mongodb配置文件位置 /etc/mongo.conf
# 内容如下
security:
    authorization: enabled

# 重新启动
systemctl restart mongod

# 安装Redis
yum -y install epel-release yum-utils
yum -y install http://rpms.remirepo.net/enterprise/remi-release-7.rpm
yum-config-manager --enable remi
yum -y install redis
# 更改配置文件，加上requirepass yourpassword
# 配置文件位置 /etc/redis.conf
# 启动服务
systemctl start redis
systemctl enable redis
# 安装Nginx
yum -y install nginx
# 更改nginx配置 配置文件位置 /etc/nginx/conf.d/accoj.conf
# 内容如下
# /etc/nginx/conf.d/accoj.conf
server{
    listen 80; #监听的端口
    server_name 127.0.0.1 accoj.hnit.edu.cn 10.20.12.35 59.51.114.203;
    location / {
      proxy_pass http://127.0.0.1:5000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header REMOTE-HOST $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    location /static {
      alias /home/hnit-accoj/accoj/static;
    }
}
# 启动
systemctl start nginx
systemctl enable nginx
```


## 5 python3.7.1安装

更改pip源
```
mkdir ~/.pip
cd ~/.pip && vim pip.conf
# 内容如下
[global]
index-url = http://mirrors.aliyun.com/pypi/simple/
[install]
trusted-host=mirrors.aliyun.com
```

https://segmentfault.com/a/1190000015628625
```
yum -y install epel-release
yum -y install libffi-devel bzip2-devel sqlite-devel
yum -y install gcc-c++ 
yum -y install python-pip
yum -y install zlib-devel openssl-devel ncurses-devel sqlite-devel readline-devel tk-devel gcc make
./configure prefix=/usr/local/python3 
make && make install
ln -s /usr/local/python3/bin/python3 /usr/bin/python3
ln -s /usr/local/python3/bin/pip3 /usr/bin/pip3
pip3 uninstall setuptools
pip3 install 'setuptools<20.2'
pip3 install pip==20.2.4
python -V
```

## 6 项目安装


```
git clone https://github.com/HNIT-ACCOJ/hnit-accoj.git /home
cd /home/hnit-accoj
pip install pipenv
python3 -m pipenv pip install -r requirement.txt
```

## 7 修改项目配置文件

`# setting.py`
1. username 和 password为mongodb的密码
2. DEBUG = True # 修改为False
3. PORT = 80 # 修改为5000
4. REDIS_URL CELERY_BROKER_URL CELERY_RESULT_BACKEND 三个参数为redis URI，将':'和'@'中间的密码修改为redis密码即可
5. 生产环境需将SECRET_KEY更改

## 8 启动celery 和 wsgi

```
cd /home/hnit-accoj
chmod +x runCelery.sh
chmod +x ./run.sh
python3 -m pipenv run nohup ./runCelery.sh >> celery.log &
python3 -m pipenv run nohup ./run.sh >> accoj.log &
```

## 9 gunicorn运行Flask / 或gevent

忽略此处
```
pip install gunicorn
# workers数=核心数*2-1
gunicorn --workers 7 --bind 0.0.0.0:5000 wsgi:app --timeout 120
# gevent
nohup python wsgi.py > accoj.log &
```

## 10 结束应用

```
pkill -9 "python" && pkill -9 "celery"
```

## 11 重启应用
```
pkill -9 "python" && pkill -9 "celery"
cd /home/hnit-accoj
chmod +x runCelery.sh
chmod +x ./run.sh
python3 -m pipenv run nohup ./runCelery.sh >> celery.log &
python3 -m pipenv run nohup ./run.sh >> accoj.log &

服务为两个服务，1. accoj 2.accoj-celery
启动：supervisorctl reload
重启：同上
停止：supervisorctl stop all
supervisor 官方文档链接：http://supervisord.org/running.html
```

## 12 备份与恢复

```
# mongo
# 备份
mongodump --username accojOwner --password Love199805# --db accoj -o C:\Users\frank\Desktop\tmp
mongodump --username accojAdmin --password ag9JtXMW1TVqsOXF --db accoj -o /home/dump/accoj-2020-10-26-bk/accoj-mongo-2020-10-26-bk
mongodump --username accojAdmin --password ag9JtXMW1TVqsOXF --db accoj -o /home/tmp

# 恢复
mongorestore --username accojOwner --password Love199805# --authenticationDatabase accoj C:\Users\frank\Desktop\tmp
mongorestore --username accojAdmin --password ag9JtXMW1TVqsOXF --authenticationDatabase accoj /home/accoj-2020-10-15-bk
mongorestore --username accojOwner --password Love199805# --authenticationDatabase accoj ~/dump

# redis
cp /var/lib/redis/dump.rdb /home/dump/accoj-2020-10-26-bk/accoj-redis-2020-10-26-bk
```
## 13 安装ssh

```                                                         
yum install -y openssl-devel
systemctl start sshd
```

