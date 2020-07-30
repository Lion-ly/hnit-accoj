#redis数据库命名规范<br>
同一类数据键命名为`数据类型名:唯一键值`<br>

#集合
1. classes集合：
`{f'classes:{class_name}': json_str}`
```
注：
因class为Python关键，故取名classes。
json_str:
'{"1": {"start": "2020-07-29 14:49:20", "end": ""},# 时间管理
  "2": {"start": "", "end": ""},
  "3": {"start": "", "end": ""},
  "4": {"start": "", "end": ""},
  "5": {"start": "", "end": ""},
  "6": {"start": "", "end": ""},
  "7": {"start": "", "end": ""},
  "8": {"start": "", "end": ""},
  "9": {"start": "", "end": ""},
  "10": {"start": "", "end": ""}
}'
```
2. rank有序集合
```
注：
redis有序集合见https://www.runoob.com/redis/redis-sorted-sets.html
rank只在排行榜更新时（五分钟更新一次）才排序，然后写入rank集合（包括MongoDB）
```
3. news_spider集合
`{f'news_spider:{新闻序号}': json_str}`
```
注：
news_spider更新时写入此集合以及MongoDB同名集合。
json_str:
'

'
```