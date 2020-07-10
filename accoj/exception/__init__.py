class CreateQuestionsException(Exception):
    """创建题库异常"""

    def __init__(self, msg=""):
        msg = "\n创建题库时出错，未写入数据库!" if not msg else msg
        super().__init__(msg)
        self.msg = msg


class ExcelCheckException(CreateQuestionsException):
    """创建题库时excel格式检查异常"""

    def __init__(self, msg=""):
        msg = "\nExcel格式检查中断!格式出错!" \
              "\n创建题库时出错，未写入数据库!" if not msg else msg
        super().__init__(msg)
        self.msg = msg
