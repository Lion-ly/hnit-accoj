#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/1/19 20:55
# @Author  : Coodyz
# @Site    : https://github.com/coolbreeze2
# @File    : dbadmin.py
# @Software: PyCharm
# from accoj.extensions import mongo
from flask import session, request, abort
from accoj.extensions import babel
import flask_admin
from flask_admin import AdminIndexView

from wtforms import form, fields

from flask_admin.contrib.pymongo import ModelView
from flask_admin.model.fields import InlineFormField, InlineFieldList


class MyIndexView(AdminIndexView):
    def is_accessible(self):
        role = session.get("role")
        if role in {"root", "dbadmin"}:
            return True
        else:
            return False

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return abort(403)


# ---------------------------------数据库后台---------------------------------------------------
class AdminModelView(ModelView):
    def is_accessible(self):
        role = session.get("role")
        if role in {"root", "dbadmin"}:
            return True
        else:
            return False

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return abort(403)


class UserForm(form.Form):
    # student_no = fields.StringField("student_no")
    role = fields.StringField('role')
    student_name = fields.StringField('student_name')
    student_faculty = fields.StringField('student_faculty')
    student_class = fields.StringField('student_class')
    student_phone = fields.StringField('student_phone')
    student_sex = fields.StringField('student_sex')
    student_borth = fields.StringField('student_borth')
    # password = fields.StringField('password')
    email = fields.StringField('email')


class UserView(AdminModelView):
    # can_edit = False
    can_create = False
    column_list = ('student_no', 'student_faculty', 'student_class', 'email')

    column_sortable_list = ('student_no', 'student_faculty', 'student_class', 'email')
    column_searchable_list = ('student_no', 'student_faculty', 'student_class', 'email')

    form = UserForm


class LedgerConfirm(form.Form):
    ledger1_confirm = InlineFieldList(fields.StringField("string"))
    ledger2_confirm = InlineFieldList(fields.StringField("string"))


class LedgerSaved(form.Form):
    ledger1_saved = InlineFieldList(fields.StringField("string"))
    ledger2_saved = InlineFieldList(fields.StringField("string"))


class FirstSecond(form.Form):
    first = fields.BooleanField()
    second = fields.BooleanField()


class ScheduleConfirm(form.Form):
    business_confirm = fields.BooleanField()
    key_element_confirm = InlineFieldList(fields.IntegerField("int"))
    subject_confirm = InlineFieldList(fields.IntegerField("int"))
    entry_confirm = InlineFieldList(fields.IntegerField("int"))
    ledger_confirm = InlineFormField(LedgerConfirm)
    balance_sheet_confirm = fields.BooleanField()
    acc_document_confirm = InlineFieldList(fields.IntegerField("int"))
    subsidiary_account_confirm = InlineFieldList(fields.StringField("string"))
    acc_balance_sheet_confirm = fields.BooleanField()
    new_balance_sheet_confirm = fields.BooleanField()
    profit_statement_confirm = fields.BooleanField()
    trend_analysis_confirm = InlineFormField(FirstSecond)
    common_ratio_analysis_confirm = InlineFormField(FirstSecond)
    ratio_analysis_confirm = fields.BooleanField()
    dupont_analysis_confirm = fields.BooleanField()


class ScheduleSaved(form.Form):
    business_saved = fields.BooleanField()
    key_element_saved = InlineFieldList(fields.IntegerField("int"))
    subject_saved = InlineFieldList(fields.IntegerField("int"))
    entry_saved = InlineFieldList(fields.IntegerField("int"))
    ledger_saved = InlineFormField(LedgerSaved)
    balance_sheet_saved = fields.BooleanField()
    acc_document_saved = InlineFieldList(fields.IntegerField("int"))

    subsidiary_account_saved = InlineFieldList(fields.StringField("string"))
    acc_balance_sheet_saved = fields.BooleanField()
    new_balance_sheet_saved = fields.BooleanField()
    profit_statement_saved = fields.BooleanField()
    trend_analysis_saved = InlineFormField(FirstSecond)
    common_ratio_analysis_saved = InlineFormField(FirstSecond)
    ratio_analysis_saved = fields.BooleanField()
    dupont_analysis_saved = fields.BooleanField()


class CompanyForm(form.Form):
    # student_no = fields.StringField("student_no")
    com_name = fields.StringField("com_name")
    com_address = fields.StringField("com_address")

    schedule_confirm = InlineFormField(ScheduleConfirm)
    schedule_saved = InlineFormField(ScheduleSaved)


class CompanyView(AdminModelView):
    can_create = False
    column_list = ('student_no', 'com_name', 'com_address')
    column_sortable_list = ('student_no', 'com_name', 'com_address')

    column_searchable_list = ('student_no', 'com_name', 'com_address')

    form = CompanyForm


@babel.localeselector
def get_locale():
    """
    汉化
    :return:
    """
    if request.args.get('lang'):
        session['lang'] = request.args.get('lang')
    return session.get('lang', 'zh_Hans_CN')


dbadmin = flask_admin.Admin(name='HnitAccoj', index_view=MyIndexView(url='/dbadmin', endpoint='dbadmin'),
                            url='/dbadmin', endpoint='dbadmin')
# ---------------------------------数据库后台------end---------------------------------------------
