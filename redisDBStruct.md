#redis数据库命名规范<br>
同一类数据键命名为`数据类型名:唯一键值`<br>

#集合

1. classes集合：
`{f'classes:{class_name}': json_str}`
```
注：
json_str:
'"teacher": teacher, 
"time": {
  "1": {"start": "utc time", "end": "utc time", "is_open": false},# 时间管理
  "2": {"start": "", "end": "", "is_open": false},
  "3": {"start": "", "end": "", "is_open": false},
  "4": {"start": "", "end": "", "is_open": false},
  "5": {"start": "", "end": "", "is_open": false},
  "6": {"start": "", "end": "", "is_open": false},
  "7": {"start": "", "end": "", "is_open": false},
  "8": {"start": "", "end": "", "is_open": false},
  "9": {"start": "", "end": "", "is_open": false},
  "10": {"start": "", "end": "", "is_open": false}
}'
```
2. rank有序集合(sorted set)
`rank: rank.score rank.member`
```
注：
score值为用户的排名，成员为json_str，
rank只在排行榜更新时（五分钟更新一次）才排序，然后写入rank有序集合
json_str内容如下：
'
{
"student_no":string, # 学号名
  "student_class": string,	# 班级
  "student_name": string,	# 姓名
  "sum_score":double,  #总分,
  "one",  #第一部分成绩
  "two",  #第二部分成绩
  "three",  #第三部分成绩
  "four",  #第四部分成绩
  "five",  #第五部分成绩
  "six",  #第六部分成绩
  "seven",  #第七部分成绩
  "eight",  #第八部分成绩
  "nine",  #第九部分成绩
  "ten",  #第十部分成绩
}

'
```
3. news_spider队列(list)
`news: [json_str]`
```
注：
json_str:
'{
"a_href": "", # 新闻链接
"img_src": "", # 图片链接
"title_text": "", # 标题
"content_text": "", # 摘要
"time_text": "", # 时间
# "span_text": "" # 责编
}'
```