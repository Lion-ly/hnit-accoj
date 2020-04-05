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

profit = {"主营业务收入", "其他业务收入", "公允价值变动损益", "投资收益", "营业外收入"}
loss = {"主营业务成本", "其他业务成本", "税金及附加", "销售费用", "财务费用", "资产减值损失", "营业外支出", "所得税费用",
        "以前年度损益调整", "管理费用"}

entrys_infos = []


# 从会计分录开始   1-9 11-19（期末特判）
def cal_entry_infos(company):
    # 获取会计科目信息
    subjects_infos = company.get("subject_infos")
    if not subjects_infos:
        print("科目信息不存在！")
        return False
    subjects_len = len(subjects_infos)
    for i in range(0, subjects_len):
        if i != 9 or i != 19:
            subject_infos = subjects_infos[i]
            for subject_info in subject_infos:
                subject = subject_info.get("subject")
                is_up = subject_info.get("is_up")
                money = subject_info.get("money")
                # 属于负债 所有者权益 收入类  增加表示在贷方 减少表示在借方  dr 借 cr 贷
                # 判断科目的借贷方向 A type 贷方增加
                if subject in A_type:
                    is_dr = not is_up
                elif subject in B_type:
                    is_dr = is_up
                else:
                    print("科目不存在" + subject)
                    print(i)
                    continue
                entrys_infos[i].append({"subject": subject, "money": money, "is_dr": is_dr})


# 计算期末的会计分录
def cal_entry_end(company, start, end, entry_index):
    turn_over_temp = dict()
    # _id = company.get("_id")
    subjects_infos = company.get("subject_infos")
    subjects_len = len(subjects_infos)
    if subjects_len != 20:
        print("业务不完整")
    # 对第每个会计区间进行结转
    money_dr = 0
    money_cr = 0
    for i in range(start, end):
        entrys_info = entrys_infos[i]
        if not entrys_info:
            print("error")
        for entry_info in entrys_info:
            subject = entry_info.get("subject")
            money = entry_info.get("money")
            # 如果在损益科目中，颠倒借贷方向，加入会计分录中
            flag = False
            if subject in loss:
                money_cr += money
                flag = True
            # 收入类转借方
            if subject in profit:
                money_dr += money
                flag = True
            if flag:
                if subject in turn_over_temp.keys():
                    money_temp = turn_over_temp[subject]
                    turn_over_temp[subject] = money + money_temp
                else:
                    turn_over_temp[subject] = money
    for key, value in turn_over_temp.items():
        value = round(value, 2)
        if key in loss:
            entrys_infos[entry_index].append({"subject": key, "money": value, "is_dr": False})
        else:
            entrys_infos[entry_index].append({"subject": key, "money": value, "is_dr": True})
    money_sum = round(money_dr - money_cr, 2)
    # 余额在借方，本年利润在贷方
    if money_sum > 0:
        is_dr = False
        subject = "本年利润"
        entrys_infos[entry_index].append({"subject": subject, "money": money_sum, "is_dr": is_dr})
    else:
        is_dr = True
        subject = "本年利润"
        entrys_infos[entry_index].append({"subject": subject, "money": abs(money_sum), "is_dr": is_dr})
    # 将所有分录存入数据库
    # mongo.db.company.update({"_id": _id}, {"$set": {"entry_infos": entrys_infos}})


def create_entry(company):
    """
    创建会计分录答案
    :return:
    """
    # 将所有业务分录存入数据库
    entrys_infos.clear()
    for i in range(0, 20):
        entrys_infos.append([])
    cal_entry_infos(company)
    cal_entry_end(company, 0, 9, 9)
    cal_entry_end(company, 10, 19, 19)
    company.update({"entry_infos": entrys_infos})
    print("entry_infos have been saved! ")
