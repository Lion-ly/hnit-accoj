# from flask import jsonify
# from accoj.extensions import mongo

# 表示贷方增加
A_type = {"短期借款", "应付票据", "应付账款", "预收账款", "应付职工薪酬", "应交税费", "应付利息", "应付股利", "其他应付款",
          "长期借款", "应付债券", "长期应付款", "专项应付款", "预计负债", "递延所得税负债", "实收资本", "资本公积", "盈余公积",
          "本年利润", "利润分配", "累计折旧", "累计摊销", "存货跌价准备", "坏账准备", "持有至到期投资减值准备",
          "长期股权投资减值准备", "无形资产减值准备", "主营业务收入", "其他业务收入", "公允价值变动损益", "投资收益", "营业外收入"}

# 表示借方增加
B_type = {"库存现金", "银行存款", "其他货币资金", "交易性金融资产", "应收票据", "应收账款", "预付账款", "应收股利",
          "应收利息", "其他应收款", "材料采购", "在途物资", "原材料", "材料成本差异", "库存商品", "发出商品",
          "商品进销差价", "委托加工物资", "持有至到期投资", "可供出售金融资产", "长期股权投资", "投资性房地产", "长期应收款",
          "固定资产", "固定资产减值准备", "在建工程", "工程物资", "固定资产清理", "无形资产", "商誉", "递延所得税资产",
          "待处理财产损溢", "生产成本", "制造费用", "劳务成本", "研发支出", "主营业务成本", "其他业务成本", "税金及附加",
          "销售费用", "财务费用", "资产减值损失", "营业外支出", "所得税费用", "以前年度损益调整", "管理费用"}

ledger_infors_1 = dict()
ledger_infors_2 = dict()


def create_ledger(company):
    """
    创建会计帐户答案
    :return:
    """
    ledger_infors_1.clear()
    ledger_infors_2.clear()
    cal_ledger_1(company)
    cal_ledger_2(company)
    print("ledger infos have been saved!")


def cal_ledger_1(company):
    # _id = company.get("_id")
    entrys_infos = company.get("entry_infos")
    involve_subjects = set()
    # 对每期的10个会计业务进行记账
    for i in range(0, 10):
        entry_infos = entrys_infos[i]
        for entry_info in entry_infos:
            subject = entry_info.get("subject")
            money = entry_info.get("money")
            is_dr = entry_info.get("is_dr")
            # B type余额在借方 资产  费用 成本类
            if subject in B_type:
                is_left = True
            elif subject in A_type:
                is_left = False
            else:
                continue
            # 如果该科目不存在, 判断借贷方向，如果第二期 读取上一期的期末余额 =期初
            if subject not in involve_subjects:
                opening_balance = 0
                # 创建该科目，判断借贷
                if is_dr:
                    current_amount_dr = money
                    if is_left:
                        ending_balance = opening_balance + current_amount_dr - 0
                    else:
                        ending_balance = opening_balance + 0 - current_amount_dr
                    ending_balance = round(ending_balance, 2)
                    ledger_infors_1[subject] = {"subject"          : subject,
                                                "opening_balance"  : opening_balance,
                                                "dr"               : [{"business_no": i + 1, "money": money}],
                                                "cr"               : [],
                                                "current_amount_dr": money,
                                                "current_amount_cr": 0,
                                                "ending_balance"   : ending_balance,
                                                "is_left"          : is_left}
                # cr类
                else:
                    current_amount_cr = money
                    if is_left:
                        ending_balance = opening_balance + 0 - current_amount_cr
                    else:
                        ending_balance = opening_balance - 0 + current_amount_cr
                    ending_balance = round(ending_balance, 2)
                    ledger_infors_1[subject] = {
                        "subject"          : subject,
                        "opening_balance"  : opening_balance,
                        "dr"               : [],
                        "cr"               : [{"business_no": i + 1, "money": money}],
                        "current_amount_dr": 0,
                        "current_amount_cr": current_amount_cr,
                        "ending_balance"   : ending_balance,
                        "is_left"          : is_left
                    }
                    # 将该科目加入set
                involve_subjects.add(subject)
            # 如果账户中已经存在该科目
            else:
                # 获取该账户信息
                subject_ledger = ledger_infors_1[subject]
                current_amount_cr = subject_ledger["current_amount_cr"]
                current_amount_dr = subject_ledger["current_amount_dr"]
                opening_balance = subject_ledger["opening_balance"]
                # 更新借贷的值及账户相关余额
                if is_dr:
                    current_amount_dr = round(current_amount_dr + money, 2)
                # cr类
                else:
                    current_amount_cr = round(current_amount_cr + money, 2)
                if is_left:
                    ending_balance = opening_balance + current_amount_dr - current_amount_cr
                else:
                    ending_balance = opening_balance + current_amount_cr - current_amount_dr
                ending_balance = round(ending_balance, 2)
                if is_dr:
                    dr = ledger_infors_1[subject]["dr"]
                    dr.append({"business_no": i + 1, "money": money})
                    ledger_infors_1[subject]["dr"] = dr
                    ledger_infors_1[subject]["current_amount_dr"] = current_amount_dr
                    ledger_infors_1[subject]["ending_balance"] = ending_balance
                else:
                    cr = ledger_infors_1[subject]["cr"]
                    cr.append({"business_no": i + 1, "money": money})
                    ledger_infors_1[subject]["cr"] = cr
                    ledger_infors_1[subject]["current_amount_cr"] = current_amount_cr
                    ledger_infors_1[subject]["ending_balance"] = ending_balance
    # mongo.db.company.update({"_id": _id}, {"$set": {"ledger_infos.ledger_infos_1": ledger_infors_1}})
    company.update({"ledger_infos": {"ledger_infos_1": ledger_infors_1}})


def cal_ledger_2(company):
    _id = company.get("_id")
    entrys_infos = company.get("entry_infos")
    # 结转上一期的业务,上一期的每个业务结转到本期
    for subject, infos in ledger_infors_1.items():
        opening_balance = infos["ending_balance"]
        is_left = infos["is_left"]
        ledger_infors_2[subject] = {
            "subject"          : subject,
            "opening_balance"  : opening_balance,
            "dr"               : [],
            "cr"               : [],
            "current_amount_dr": 0,
            "current_amount_cr": 0,
            "ending_balance"   : opening_balance,
            "is_left"          : is_left
        }
    involve_subjects = set(ledger_infors_2.keys())
    # 对每期的10个会计业务进行记账
    for i in range(10, 20):
        entry_infos = entrys_infos[i]
        for entry_info in entry_infos:
            subject = entry_info.get("subject")
            money = entry_info.get("money")
            is_dr = entry_info.get("is_dr")
            # B type余额在借方 资产  费用 成本类
            if subject in B_type:
                is_left = True
            elif subject in A_type:
                is_left = False
            else:
                continue
            # 如果该科目不存在, 判断借贷方向，如果第二期 读取上一期的期末余额=期初
            if subject not in involve_subjects:
                opening_balance = 0
                # 创建该科目，判断借贷
                if is_dr:
                    current_amount_dr = money
                    if is_left:
                        ending_balance = opening_balance + current_amount_dr - 0
                    else:
                        ending_balance = opening_balance + 0 - current_amount_dr
                    ending_balance = round(ending_balance, 2)
                    ledger_infors_2[subject] = {"subject"          : subject,
                                                "opening_balance"  : opening_balance,
                                                "dr"               : [{"business_no": i + 1, "money": money}],
                                                "cr"               : [],
                                                "current_amount_dr": money,
                                                "current_amount_cr": 0,
                                                "ending_balance"   : ending_balance,
                                                "is_left"          : is_left}
                # cr类
                else:
                    current_amount_cr = money
                    if is_left:
                        ending_balance = opening_balance + 0 - current_amount_cr
                    else:
                        ending_balance = opening_balance + current_amount_cr - 0
                    ending_balance = round(ending_balance, 2)
                    ledger_infors_2[subject] = {
                        "subject"          : subject,
                        "opening_balance"  : opening_balance,
                        "dr"               : [],
                        "cr"               : [{"business_no": i + 1, "money": money}],
                        "current_amount_dr": 0,
                        "current_amount_cr": current_amount_cr,
                        "ending_balance"   : ending_balance,
                        "is_left"          : is_left
                    }
                    # 将该科目加入set
                involve_subjects.add(subject)
            # 如果账户中已经存在该科目
            else:
                # 获取该账户信息
                subject_ledger = ledger_infors_2[subject]
                current_amount_cr = subject_ledger["current_amount_cr"]
                current_amount_dr = subject_ledger["current_amount_dr"]
                opening_balance = subject_ledger["opening_balance"]
                # 更新借贷的值及账户相关余额
                if is_dr:
                    current_amount_dr  = round(current_amount_dr + money, 2)
                # cr 类
                else:
                    current_amount_cr  = round(current_amount_cr + money, 2)
                if is_left:
                    ending_balance = opening_balance + current_amount_dr - current_amount_cr
                else:
                    ending_balance = opening_balance + current_amount_cr - current_amount_dr
                ending_balance = round(ending_balance, 2)
                if is_dr:
                    dr = ledger_infors_2[subject]["dr"]
                    dr.append({"business_no": i + 1, "money": money})
                    ledger_infors_2[subject]["dr"] = dr
                    ledger_infors_2[subject]["current_amount_dr"] = current_amount_dr
                    ledger_infors_2[subject]["ending_balance"] = ending_balance
                else:
                    cr = ledger_infors_2[subject]["cr"]
                    cr.append({"business_no": i + 1, "money": money})
                    ledger_infors_2[subject]["cr"] = cr
                    ledger_infors_2[subject]["current_amount_cr"] = current_amount_cr
                    ledger_infors_2[subject]["ending_balance"] = ending_balance
    # mongo.db.company.update({"_id": _id}, {"$set": {"ledger_infos.ledger_infos_2": ledger_infors_2}})
    company["ledger_infos"]["ledger_infos_2"] = ledger_infors_2
