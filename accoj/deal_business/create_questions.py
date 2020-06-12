#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/2/9 14:59
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : add_problem.py
# @Software: PyCharm
from xlrd import open_workbook
from accoj.extensions import mongo
from accoj.utils import is_number


def add_question(questions_no: int):
    """
    读取excel表创建题库

    :param questions_no: questions no 题库号
    :return: bool
    """
    print("\n题库:{}".format(questions_no))
    filename = "accoj/deal_business/questions_{}.xlsx".format(questions_no)
    workbook = open_workbook("{}".format(filename))  # 用wlrd提供的方法读取一个excel文件
    sheet1 = workbook.sheet_by_index(0)  # 根据序号获取sheet
    sheet_rows = sheet1.nrows  # sheet总的行数
    sheet_clos = sheet1.ncols  # sheet总的列数
    sheet_head = ["question_no", "content", "business_type", "affect_type", "key_elements", "subjects", "Note"]
    sheet_head_tmp = list()
    for col in range(0, sheet_clos):
        val = sheet1.row(0)[col].value
        sheet_head_tmp.append(val)
    if sheet_head != sheet_head_tmp:
        print("sheet_head: {}".format(sheet_head_tmp))
        print("Error:表头错误！")
        return False
    if sheet_clos != 7:
        print("Error:表格列数应为7！")
        return False

    posts = list()
    question_exit_list = list()
    success_list = list()
    for row in range(1, sheet_rows):
        question_no, content, business_type, affect_type, values, key_element_infos, subject_infos \
            = sheet_row_parsing(sheet1.row(row))
        print("question_no:{}/{} 检查成功".format(question_no, sheet_rows - 1), end='\r')
        question_exit = mongo.db.question.find_one({"questions_no": questions_no, "question_no": question_no})
        if question_exit:
            question_exit_list.append(question_no)
            continue
        document = dict(questions_no=questions_no,
                        question_no=question_no,
                        content=content,
                        business_type=business_type,
                        affect_type=affect_type,
                        values=values,
                        key_element_infos=key_element_infos,
                        subject_infos=subject_infos)
        posts.append(document)
        success_list.append(question_no)

    if success_list:
        mongo.db.question.insert_many(posts)
        print("\n写入数据库成功")
        print("{}个题目创建成功，题目编号如下:".format(len(success_list)))
        print(str(success_list))
    else:
        print("\n无数据写入数据库")
    if question_exit_list:
        print("{}个题目已存在，题目编号如下:".format(len(question_exit_list)))
        print(str(question_exit_list))
    return True


def sheet_row_parsing(sheet_row):
    """excel表结构解析"""
    values = list()
    key_element_infos = list()
    subject_infos = list()

    question_no, content, business_type, affect_type, key_elements, subjects, _ = sheet_row

    question_no, content, business_type, affect_type, key_elements, subjects = int(
        question_no.value), content.value, business_type.value, int(
        affect_type.value), key_elements.value, subjects.value

    value = None
    value_index_start = None
    value_type = "common"
    range_start = None
    is_random = False
    low, high = 0, 0
    content_len = len(content)
    replace_list = list()
    replace_start = None
    replace_end = None
    for i in range(0, content_len):
        # 解析变量
        if content[i] == "{":
            value_index_start = i
            replace_start = i
            if i < content_len and content[i + 1] == "\"":
                value_type = "asset"
        elif content[i] == "}":
            value = content[value_index_start + 1:i]
            replace_end = i
            if is_number(value):
                value_type = "num"
                value = float(value)
            if i != 0 and content[i - 1] == "%":
                value_type = "percent"
                value = float(value.rstrip("%"))
            if i < content_len and content[i + 1] == "(":
                range_start = i
                is_random = True
                replace_end = None
            else:
                if value_type == "asset":
                    value = value.replace("\"", "")
                values.append(dict(value_type=value_type,
                                   value=value,
                                   is_random=is_random,
                                   low=low,
                                   high=high))
                value = None
                value_index_start = None
                value_type = "common"
                range_start = None
                is_random = False
                low, high = 0, 0
        elif is_random and content[i] == ")":
            replace_end = i
            value_range = content[range_start + 2:i]
            value_range = value_range.rstrip("%").split("-")
            low, high = float(value_range[0]), float(value_range[1])
            values.append(dict(value_type=value_type,
                               value=value,
                               is_random=is_random,
                               low=low,
                               high=high))
            value = None
            value_index_start = None
            value_type = "common"
            range_start = None
            is_random = False
            low, high = 0, 0
        if replace_start is not None and replace_end is not None:
            replace_list.append({"start": replace_start, "end": replace_end})
            replace_start = None
            replace_end = None

    new_content = ""
    index_last = 0
    replace_list_len = len(replace_list)
    if replace_list:
        for i in range(0, replace_list_len):
            # 将题目内容中的变量替换为v1,v2等形式，方便生成业务时，直接替换
            start = replace_list[i].get("start")
            end = replace_list[i].get("end")
            sub_s = content[index_last:start]
            new_content = new_content + sub_s
            new_content = new_content + ("v{}".format(i + 1))
            index_last = end + 1
            if i == replace_list_len - 1:
                new_content = new_content + (content[index_last:])

    if key_elements:
        for x in key_elements.split("；"):
            key_element, value_position = x.split(":")
            is_up = value_position[0]
            value_index = value_position[1:].replace("v", "")
            if is_up == "-":
                is_up = False
            else:
                is_up = True
            key_element_infos.append(dict(key_element=key_element,
                                          value_index=value_index,
                                          is_up=is_up))
    if not new_content:
        new_content = content
    if subjects:
        for x in subjects.split("；"):
            subject, value_position = x.split(":")
            is_up = value_position[0]
            value_index = value_position[1:].replace("v", "")
            if is_up == "-":
                is_up = False
            else:
                is_up = True
            subject_infos.append(dict(subject=subject,
                                      value_index=value_index,
                                      is_up=is_up))

    return question_no, new_content, business_type, affect_type, values, key_element_infos, subject_infos
