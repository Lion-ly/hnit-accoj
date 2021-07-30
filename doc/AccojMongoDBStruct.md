# AccOj-MongoDB数据库结构
## 1 前言

Flask-PyMongo见https://flask-pymongo.readthedocs.io/en/latest/

建议用notepad++打开.

new Date()在python中为`datetime.datetime`对象，获取当前时间datetime.datetime.now().

## 2 用户集合

```
db.accoj.users.insert({"student_no": "17020340111", 	# 学号
                       "role": string,                  # 角色("root", "admin", "teacher", "student")
					   "student_name": "郭雄",  		# 姓名
					   "teacher": "",                   # 教师工号
					   "nick_name"="",                  # 昵称
                       "student_school"="",             # 学校
                       "personalized_signature"="",     # 个性签名
					   "student_faculty": "计算机与信息科学学院", # 学院
					   "student_class": "网络1701"		# 班级
					   "student_phone": "17674549805",  # 手机号
					   "student_sex": "男",				# 性别
					   "student_borth": "1998-05-05",   # 生日
					   "password": "...", 				# 密码
					   "email": "1848600800@qq.com",		# 邮箱
					   team_no: ""						# 团队号
					  })
```

## 3 消息集合

```
db.accoj.message.insert({"room": [""],                  # 房间号
                         "username": "",                # 发送者
                         "student_name": "",            # 真实姓名
                         "nick_name": "",               # 昵称
                         "message_head": "",            # 消息头
                         "message_body": "",            # 消息主题
                         "time": ""                     # 时间
                        })
```

## 4 班级集合

```
db.accoj.classes.insert({"class_name": ""               # 班级名(学校-班级，例'湖南工学院-网络1701')
                         "teacher": ""                    # 教师
                         "students": [""]                 # 学生
                         "time": {"1": {"start": "utc time", "end": "utc time", "is_open": false},# 时间管理
                                  "2": {"start": "", "end": "", "is_open": false},
                                  "3": {"start": "", "end": "", "is_open": false},
                                  "4": {"start": "", "end": "", "is_open": false},
                                  "5": {"start": "", "end": "", "is_open": false},
                                  "6": {"start": "", "end": "", "is_open": false},
                                  "7": {"start": "", "end": "", "is_open": false},
                                  "8": {"start": "", "end": "", "is_open": false},
                                  "9": {"start": "", "end": "", "is_open": false},
                                  "10": {"start": "", "end": "", "is_open": false}
                                }
                      })
```

## 5 科目库集合

```
db.accoj.subject.insert({"subject_no": int,				# 科目编号
						 "subject_name": string,		# 科目名称
						 "subject_type": string			# 科目类别（资产类，权益类，成本类，费用类，收入类，利润类）
						})
```

## 6 上传的文件集合

```
db.accoj.file.insert({"document_no":string, # 学号名+业务索引号(在company集合中businesses的下标)
					  "filename": string,	# 文件名
					  "content": string,	# 内容
					})
```

## 7 排行榜成绩集合

```
db.accoj.rank.insert({"student_no":string, # 学号名
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
					})
```

## 8 题库集合
```
db.accoj.question.insert({"questions_no": int， 			# 题库号
						 "question_no": int,				# 题目编号
						 "content": string, 	    		# 内容
						 "business_type": string,			# 业务类型（筹资活动、投资活动、经营活动）
						 "affect_type": int,				# 对会计等式影响类型
						 "values": [{"value_type": "common/asset/num/percent", "value": double, “is_random": Boolean, "low": double, "high": double}] # 变量列表，变量类型，值，是否是数字变量，如果是，最低值，最高值，0，0代表不变
						 "key_element_infos": [							# 会计要素信息列表
											  {"key_element": string,	# 会计要素
											   "value_index": string, 	# 在上述values的位置, 下标或四则运算表达式
											   "is_up": Boolean			# 正负判定
											  }]
						 "subjects_infos": [					# 科目列表
									 {"subject": string,		# 科目
									  "value_index": string, 	# 在上述values的位置, 下标或四则运算表达式
									  "is_up": Boolean			# 增减判定
									 }]
						})

```
## 9 公司集合

用户成立公司的时候同时创建一个公司副本，保存正确答案,所属用户为"student_no_cp"

```redis
db.accoj.company.insert({"student_no": student_no,			# 用户ID
						 "com_name": string,	  			# 公司名称
						 "com_address": string,	  			# 公司地址
						 "com_business_addr": string,		# 公司经营地址
						 "com_legal_rep": string,			# 法人
						 "com_regist_cap": double,			# 注册资本
						 "com_operate_period: string,		# 经营期限
						 "com_business_scope": string,		# 经营范围
						 "com_shareholder": [string],		# 股东姓名
						 "com_bank_savings": double,		# 公司银行存款
						 "com_cash": double,				# 公司现金存量
						 "com_assets: [{"asset_name": string, "market_value": double, "question_no": int}],	# 公司资产列表
						 "business_num": int,				# 公司业务数
						 # 所有业务涉及的科目列表
						 "involve_subjects": {"involve_subjects_1":[string], 会计期间一
											  "involve_subjects_2":[string]},会计期间二
						 # 课程确认进度
						 "schedule_confirm": {
											"business_confirm": Boolean,				# 增加业务部分是否完成
											"key_element_confirm": [int],				# 会计要素部分进度
											"subject_confirm": [int],					# 会计科目部分进度
											"entry_confirm": [int],						# 会计分录部分进度
											"ledger_confirm": {"ledger1_confirm": [string],# 会计账户部分进度
															   "ledger2_confirm": [string]},
											"balance_sheet_confirm": Boolean,			# 会计平衡表部分进度
											"acc_document_confirm": [int], 				# 会计凭证部分进度
											"subsidiary_account_confirm": [string], 	# 会计明细账部分进度
											"acc_balance_sheet_confirm": Boolean, 		# 科目余额表部分进度
											"new_balance_sheet_confirm": Boolean, 		# 资产负债表部分进度
											"profit_statement_confirm": Boolean,  		# 利润表部分进度
											"trend_analysis_confirm":{"first": Boolean, "second": Boolean},
											"common_ratio_analysis_confirm":{"first": Boolean, "second": Boolean},
											"ratio_analysis_confirm":Boolean,
											"dupont_analysis_confirm":Boolean
											},

						 # 课程保存进度
						 "schedule_saved": {
											"business_saved": Boolean,				# 增加业务部分是否完成
											"key_element_saved": [int],				# 会计要素部分进度
											"subjects_saved": [int],				# 会计科目部分进度
											"entry_saved": [int],					# 会计分录部分进度
											"ledger_saved": {"ledger1_saved": [string],# 会计账户部分进度
															 "ledger2_saved": [string]},
											"balance_sheet_saved": Boolean,			# 会计平衡表部分进度
											"acc_document_saved": [int],			# 会计凭证部分进度
											"subsidiary_account_saved": [string],	# 会计明细账部分进度
											"acc_balance_sheet_saved": Boolean,		# 科目余额表部分进度
											"new_balance_sheet_saved": Boolean,		# 资产负债表部分进度
											"profit_statement_saved": Boolean,		# 利润表部分进度
											"trend_analysis_saved":{"first": Boolean, "second": Boolean},
											"common_ratio_analysis_saved":{"first": Boolean, "second": Boolean},
											"ratio_analysis_saved":Boolean,
											"dupont_analysis_saved":Boolean
											},
						 # 课程评分
						 "evaluation": {
										"key_element_score": [double],			# 会计要素部分评分(下标为偶数存储用户本题得分，奇数为本题总分，数组最后一个元素用来存储'本次课程得分和')
										"subjects_score": [double],				# 会计科目部分评分(下标为偶数存储用户本题得分，奇数为本题总分，数组最后一个元素用来存储'本次课程得分和')
										"entry_score": [double],				# 会计分录部分评分(下标为偶数存储用户本题得分，奇数为本题总分，数组最后一个元素用来存储'本次课程得分和')
										"ledger_score": {"first": double,# 会计账户部分评分(科目名为键，分数为值)
														 "second": double},
										"balance_sheet_score": double,			# 会计平衡表部分评分
										"acc_document_score": [double],			# 会计凭证部分评分([0,1,2...]下标0存储用户本题得分，1为本题教师评分（值为-1则表示未评分）,2为本题总分，以此类推共20道题，数组最后一个元素用来存储'本次课程得分和'，数组长度为61=20*3+1)
										"subsidiary_account_score": {subjectName: double},		# 会计明细账部分评分
										"acc_balance_sheet_score": double,		# 科目余额表部分评分
										"new_balance_sheet_score": double,		# 资产负债表部分评分
										"profit_statement_score": double,		# 利润表部分评分
										"trend_analysis_score":{"first": {"student_score": double, "teacher_score": double}, "second": {"student": double, "teacher_score": double}}, # "student_score"表示学生得分，"teacher_score"表示教师评分(-1表示未评分)，后述亦同
										"common_ratio_analysis_score":{"first": {"student_score": double, "teacher_score": double}, "second": {"student_score": double, "teacher_score": double}},
										"ratio_analysis_score": {"student_score": double, "teacher_score": double},
										"dupont_analysis_score": {"student_score": double, "teacher_score": double}
										},
						 # 公司业务
						 "businesses": [{"questions_no": int， 			# 题库号
										 "question_no": int,			# 题目编号
									     "content": string, 	    	# 内容
									     "date": new Date(),  			# 日期
									     "business_type": string,		# 业务类型（筹资活动、投资活动、经营活动）
									   }]

						 # 会计要素信息（数组顺序即业务顺序）
						 "key_element_infos": [{
												"affect_type": int,				# 对会计等式影响类型
												"info":[{"key_element": string,	# 会计要素
														"money": double, 		# 金额
														"is_up": Boolean		# 正负判定
														}]
											  }],
						 # 会计科目（数组顺序即业务顺序）
						 "subjects_infos": [[{"subject": string,		# 科目
											 "money": double,			# 金额
											 "is_up": Boolean			# 增减判定
											}]],
						 # 会计分录（数组顺序即业务顺序）
						 "entry_infos": [[{"subject": string,			# 科目
										  "money": double,				# 金额
										  "is_dr": Boolean,				# 是否借记
										}]],
						 # 会计凭证（数组顺序即业务顺序）
						 "acc_document_infos": [{
												"document_no": string,					# 学号名+业务索引号(在company集合中businesses的下标)
												"filename": string,						# 文件名
												"doc_no": int,					 		# 会计凭证记号
												"date": new Date(),		 				# 日期
												"doc_nums": int,				 		# 单据数量
												"contents":[{
															 "summary": string,				 	# 摘要
															 "general_account": subject,		# 总账科目
															 "detail_account": string,		 	# 明细科目
															 "dr_money": double,			 	# 借方金额
															 "cr_money": double				 	# 贷方金额
															 }]
											   }]
						 # 会计账户
						 "ledger_infos": {"ledger_infos_1": {"subject_name":					# 科目名即账户名作为键
																			{
																		   "subject": string,							# 科目名
																		   "opening_balance": double, 					# 期初余额
																		   "dr": [{"business_no": int, "money": double}], 	# 借方额
																		   "current_amount_dr": double,					# 本期借方发生额
																		   "current_amount_cr": double,					# 本期贷方发生额
																		   "ending_balance": double,					# 期末余额
																		   "cr": [{"business_no": int, "money": double}]# 贷方额
																		   "is_left": Boolean							# 是否左T表
																		   }
															}
										  "ledger_infos_2": {"subject_name":					# 科目名即账户名作为键
																			{
																		   "subject": string,							# 科目名
																		   "opening_balance": double, 					# 期初余额
																		   "dr": [{"business_no": int, "money": double}], 	# 借方额
																		   "current_amount_dr": double,					# 本期借方发生额
																		   "current_amount_cr": double,					# 本期贷方发生额
																		   "ending_balance": double,					# 期末余额
																		   "cr": [{"business_no": int, "money": double}]	# 贷方额
																		   "is_left": Boolean							# 是否左T表
																		   }
															}
										 }
						 # 试算平衡集合
						 "balance_sheet_infos": {
												"accounting_period_1": [{									# 第一个会计期间
																	   "subject": subject,			 		# 会计科目
																	   "borrow_1": double,				 		# 借方期初余额
																	   "lend_1": double,					 	# 贷方期初余额
																	   "borrow_2": double,				 		# 借方本期发生额
																	   "lend_2": double,					 		# 贷方本期发生额
																	   "borrow_3": double,				 		# 借方期末余额
																	   "lend_3": double					 		# 贷方期末余额
																	   }]
											     "accounting_period_2": [{										# 第二个会计期间
																	   "subject": subject,			 			# 会计科目
																	   "borrow_1": double,				 		# 借方期初余额
																	   "lend_1": double,					 	# 贷方期初余额
																	   "borrow_2": double,				 		# 借方本期发生额
																	   "lend_2": double,					 	# 贷方本期发生额
																	   "borrow_3": double,				 		# 借方期末余额
																	   "lend_3": double					 		# 贷方期末余额
																	   }]
												}
						# 账户明细账
						"subsidiary_account_infos": {"subject_name":							# 科目名即账户名作为键（动态变化）
																	[{"date": "1998-05-05",		# 日期
																	  "word": string,			# 字
																	  "no":	int,				# 号
																	  "summary": string,		# 摘要
																	  "dr_money": double,		# 借方金额
																	  "cr_money": double,		# 贷方金额
																	  "orientation": string, 	# 方向
																	  "balance_money": double,	# 余额
																	}]
													}
						# 科目余额表
						"acc_balance_sheet_infos": [{
													"subject": subject,			 			# 会计科目
													"borrow_1": double,				 		# 借方期初余额
													"lend_1": double,					 	# 贷方期初余额
													"borrow_2": double,				 		# 借方本期发生额
													"lend_2": double,					 	# 贷方本期发生额
													"borrow_3": double,				 		# 借方期末余额
													"lend_3": double					 		# 贷方期末余额
													}]
						# 资产负债表
						"new_balance_sheet_infos": {"project": 								# 'project'为项目名（动态变化），后述亦同
															  {"period_end": double, 		# 期末余额
															   "period_last": double}		# 上期余额
													}
						# 利润表
						"profit_statement_infos": {"project":
															{"period_end": double, 			# 本期金额
															 "period_last": double}			# 上期金额
												  }
						# 趋势分析法
						"trend_analysis_infos": {"new_balance_sheet_infos": 			# 分析资产负债表，后述亦同
																			{"project":
																						{"period_end": double, 		# 本期比上期增加额
																					     "period_last": double}		# 本期比上期增加率
																			 "conclusion": string,					# 结论
																			}
												 "profit_statement_infos": 				# 分析利润表，后述亦同
																			{"project":
																						{"period_end": double, 		# 本期比上期增加额
																					    "period_last": double}		# 本期比上期增加率
																			 "conclusion": string,					# 结论
																		   }
												}
						# 共同比分析法
						"common_ratio_analysis_infos": {"new_balance_sheet_infos":
																				 {"project":
																							{"period_end": double, 		# 本期占资产/负债总额百分比
																							 "period_last": double}		# 上期占资产/负债总额百分比
																				  "conclusion": string,					# 结论
																				 }
														"profit_statement_infos":
																				 {"project":
																							{"period_end": double, 		# 本期占收入百分比
																							 "period_last": double}		# 上期占收入百分比
																				  "conclusion": string,					# 结论
																				 }
													   }
						# 比率分析法
						"ratio_analysis_infos": {"project":
															{"period_end": double, 		# 本期
															 "period_last": double}		# 上期
												}
						# 杜邦分析法
						"dupont_analysis_infos": {"project": double,
												  "conclusion": string
												 }
						})
```

## 10、学生申请重做集合

```
db.accoj.reform.insert({
				"student_no": "18020440125",
				"class_name": "湖南工学院-软件1801"，
				"course_no": "1",
				"tudent_name": "Lion",
				"teacher": "yangying",
				"reason": ".....",
				"time": time
})
```

