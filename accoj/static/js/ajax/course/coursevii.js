let involve_subjects = Array("银行存款", "实收资本", "无形资产", "预付账款", "长期借款",
    "生产成本", "销售费用", "原材料", "固定资产", "交易性金融资产", "管理费用", "应付职工薪酬",
    "应付账款", "长期股权投资", "投资收益", "预收账款", "其他应收款");
// 页面加载完成填充数据
$(document).ready(function () {
    let firstLi = true;
    let liNum = 1;
    $.each(involve_subjects, function (index, item) {
        $("#anchorOption").before("<option>" + item + "</option>");
        $("#coursev_li_new").before("<li  id='subjectLi" + liNum++ + "' role='presentation'><a>" + item + "</a></li>");
        if (firstLi) {
            $("#subjectSelect").val(item);
            firstLi = false;
        }
    });
});
// ==================================事件控制==================================//
/*
 * @ # coursevii -> 登记各账户明细表 ? 表格增加行
 */
function vii1_AddRow(flag) {
    let obj = flag ? "firstPeriod" : "secondPeriod";
    $("#" + obj).before(
        "<tr>"
        + "<td><label><input name='month' title='月' onkeyup='limit_number(this)'></label>"
        + "<td><label><input name='day' title='日' onkeyup='limit_number(this)'></label>"
        + "<td><label><input name='word' title='字' onkeyup='limit_number(this)'></label>"
        + "<td><label><input name='no' title='号' onkeyup='limit_number(this)'></label>"
        + "<td><label><input name='orientation' onkeyup='limitJieDai(this)'></label></td>"

        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"

        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"

        + "<td><label><input name='orientation' onkeyup='limitJieDai(this)'></label></td>"

        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"
        + "<td><label><input onkeyup='limit_number(this)'></label></td>"

        + "<td style='width: 1%; border: 0; background: #ffffff'>"
        + "<div style='text-align: center'>"
        + "<a style='color: red; padding: 0 0' type='button' "
        + "class='btn' onclick='vii1_DeleteRow(this)'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>"
        + "</td>"
        + "</tr>"
    );
}


/*
 * @ # coursevii ? 表格删除行
 */
function vii1_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}

let vii2Row = 2;

/*
 * @ # coursevii -> 科目余额表 ? 表格增加行
 */
function vii2_AddRow() {
    let now_id = "vii2Row_" + vii2Row;
    $("#sumRow").before(
        "<tr id='" + now_id + "'>"
        + "<td><label><input name='subject' title='科目' onkeyup='illegalCharFilter(this)'></label></td>" +
        "<td><label><input name='borrow_1' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='lend_1' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='borrow_2' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='lend_2' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='borrow_3' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>" +
        "<td><label><input name='lend_3' title='金额￥'" +
        "                                              onkeyup='limit_number(this)'></label></td>"
        + "<td style='padding: 0; border: 0'>"
        + "<div style='text-align: center'> "
        + "<a style='color: red' type='button' class='btn' onclick='vii2_DeleteRow(this)'><span class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div> "
        + "</td> "
        + "</tr>"
    );
    vii2Row++;
}


/*
 * @ # coursevii -> 科目余额表 ? 表格删除行
 */
function vii2_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}