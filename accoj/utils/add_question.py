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


def add_question(filename="accoj/utils/questions.xlsx"):
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
        print("Error:表头错误")
        return False
    if sheet_clos != 7:
        print("Error:表格列数应为7")
        return False

    posts = list()
    question_exit_list = list()
    success_list = list()
    for row in range(1, sheet_rows):
        question_no, content, business_type, affect_type, values, key_element_infos, subjects_infos \
            = sheet_row_parsing(sheet1.row(row))
        print("question_no:{}  检查成功".format(question_no))
        question_exit = mongo.db.question.find_one({"question_no": question_no})
        if question_exit:
            question_exit_list.append(question_no)
            continue
        document = dict(question_no=question_no,
                        content=content,
                        business_type=business_type,
                        affect_type=affect_type,
                        values=values,
                        key_element_infos=key_element_infos,
                        subjects_infos=subjects_infos)
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
        print("\n{}个题目已存在，题目编号如下:\n".format(len(question_exit_list)))
        print(str(question_exit_list))
    return True


def sheet_row_parsing(sheet_row):
    values = list()
    key_element_infos = list()
    subjects_infos = list()

    question_no, content, business_type, affect_type, key_elements, subjects, _ = sheet_row

    question_no, content, business_type, affect_type, key_elements, subjects \
        = int(question_no.value), content.value, business_type.value, \
          int(affect_type.value), key_elements.value, subjects.value

    value = None
    value_index_start = None
    value_type = "common"
    range_start = None
    is_random = False
    low, high = 0, 0
    content_len = len(content)
    for i in range(0, content_len):
        if content[i] == "{":
            value_index_start = i
            if i < content_len and content[i + 1] == "\"":
                value_type = "asset"
        elif content[i] == "}":
            value = content[value_index_start + 1:i]
            if is_number(value):
                value_type = "num"
            if i != 0 and content[i - 1] == "%":
                value_type = "percent"
            if i < content_len and content[i + 1] == "(":
                range_start = i
                is_random = True
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
            value_range = content[range_start + 2:i]
            value_range = value_range.rstrip("%").split("-")
            low, high = int(value_range[0]), int(value_range[1])
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
    if key_elements:
        for x in key_elements.split("；"):
            key_element, value_position = x.split(":")
            is_up = value_position[0]
            value_pos = value_position[1:]
            if is_up == "-":
                is_up = False
            else:
                is_up = True
            key_element_infos.append(dict(key_element=key_element,
                                          value_pos=value_pos,
                                          is_up=is_up))

    if subjects:
        for x in subjects.split("；"):
            subject, value_position = x.split(":")
            is_up = value_position[0]
            value_pos = value_position[1:]
            if is_up == "-":
                is_up = False
            else:
                is_up = True
            subjects_infos.append(dict(subject=subject,
                                       value_pos=value_pos,
                                       is_up=is_up))

    return question_no, content, business_type, affect_type, values, key_element_infos, subjects_infos


if __name__ == '__main__':
    add_question("questions.xlsx")
