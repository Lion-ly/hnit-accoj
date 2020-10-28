#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/3/16 11:07
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : create_acc_document.py
# @Software: PyCharm
# from accoj.extensions import mongo

# 创建会计凭证列表,在副本公司中创建答案
acc_document_infos = list()


def create_acc_document(company):
    """
    创建会计凭证答案
    :return:
    """
    acc_document_infos.clear()
    cal_acc_document(company)


def cal_acc_document(company):
    # _id = company.get("_id")
    student_no = company.get("student_no")
    entrys_infos = company.get("entry_infos")
    entry_len = len(entrys_infos)
    for i in range(0, entry_len):
        entry_infos = entrys_infos[i]
        document_no = student_no + "_" + str(i)
        contents = list()
        # 借贷双方余额各自合计
        dr_sum = 0
        cr_sum = 0
        # 获取每一个借贷条目
        for entry_info in entry_infos:
            subject = entry_info.get("subject")
            money = entry_info.get("money")
            is_dr = entry_info.get("is_dr")
            if is_dr:
                dr_sum += money
                contents.append({"summary" : None, "general_account": subject, "detail_account": None,
                                 "dr_money": money,
                                 "cr_money": 0})
            else:
                cr_sum += money
                contents.append({"summary" : None, "general_account": subject, "detail_account": None, "dr_money": 0,
                                 "cr_money": money})
        contents.append(
            {"summary" : "sum", "general_account": "sum", "detail_account": "sum", "dr_money": round(dr_sum, 2),
             "cr_money": round(cr_sum, 2)})
        acc_document_infos.append(
            {"document_no": document_no, "filename": None, "doc_no": None, "date": None, "doc_nums": None,
             "contents"   : contents})
    # 将所有的科目凭证加入数据库中
    # mongo.db.company.update({"_id": _id}, {"$set": {"acc_document_infos": acc_document_infos}})
    company.update({"acc_document_infos": acc_document_infos})
    print("acc_documents have been saved!")
