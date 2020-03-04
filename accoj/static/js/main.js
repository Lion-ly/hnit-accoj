// ==================================coursevi==================================//


/*
 * @ # coursevi ? 表格增加行
 */
function vi_AddRow() {
    $("#anchor").before(
        "<tr>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<th style='width: 4%; border: 0; background: #ffffff'>"
        + "<div align='center'>"
        + "<a style='color: red; padding: 0 0' type='button' "
        + "class='btn' onclick='vi_DeleteRow(this)'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>"
        + "</th>"
        + "</tr>"
    );
}


/*
 * @ # coursevi ? 表格删除行
 */
function vi_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}

// ==================================coursevii==================================//


/*
 * @ # coursevii -> 登记各账户明细表 ? 新建表单
 */
function vii_AddTable() {
    $('#tablePanel').prepend(
        "<table class='table table-bordered ats-vouchertable' style='border: 0;'>"
        + "<tbody id='detailed'>"
        + "<tr>"
        + "<td colspan='37' style='border: 0'>"
        + "<div align='center'>"
        + "<select class='form-control' "
        + "style='width: 160px; display: inline-block;'>"
        + "<option>银行存款</option>"
        + "<option>长期存款</option>"
        + "</select>"
        + "<p style='font-size: 24px; display: inline-block;'>&nbsp;明&nbsp;细&nbsp;账</p>"
        + "<div align='center' style='float: right; margin-top: 5px'>"
        + "<a "
        + "style='color: red; font-size: 18px; padding-right: 0;padding-left: 0' "
        + "type='button' class='btn' onclick='vii_DeleteTable(this)'><span "
        + "class='glyphicon glyphicon-remove'></span></a>"
        + "</div>"
        + "</div>"
        + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td style='border-right: 0;' contentEditable='true'>2020</td>"
        + "<th style='border-left: 0;'>年</th>"
        + "<th class='ats-tablecolor-f' colspan='2'>记账凭证</th>"
        + "<th class='ats-tablecolor-f' rowspan='2'>摘要</th>"
        + "<th class='ats-tablecolor-f' colspan='10'>借方</th>"
        + "<th class='ats-tablecolor-f' colspan='10'>贷方</th>"
        + "<th class='ats-tablecolor-f' rowspan='2'>方向</th>"
        + "<th class='ats-tablecolor-f' colspan='10'>余额</th>"
        + "</tr>"
        + "<tr class='ats-tablecolor-f'>"
        + "<th>月</th>"
        + "<th>日</th>"
        + "<th>字</th>"
        + "<th>号</th>"

        + "<th>千</th>"
        + "<th>百</th>"
        + "<th>十</th>"
        + "<th>万</th>"
        + "<th>千</th>"
        + "<th>百</th>"
        + "<th>十</th>"
        + "<th>元</th>"
        + "<th>角</th>"
        + "<th>分</th>"

        + "<th>千</th>"
        + "<th>百</th>"
        + "<th>十</th>"
        + "<th>万</th>"
        + "<th>千</th>"
        + "<th>百</th>"
        + "<th>十</th>"
        + "<th>元</th>"
        + "<th>角</th>"
        + "<th>分</th>"

        + "<th>千</th>"
        + "<th>百</th>"
        + "<th>十</th>"
        + "<th>万</th>"
        + "<th>千</th>"
        + "<th>百</th>"
        + "<th>十</th>"
        + "<th>元</th>"
        + "<th>角</th>"
        + "<th>分</th>"
        + "<th style='width: 1%; border: 0; background: #ffffff'>"
        + "<div align='center'>"
        + "<a style='color: green; padding: 0 0' type='button' "
        + "class='btn' onclick='vii_AddRow(this)'><span "
        + "class='glyphicon glyphicon-plus-sign'></span></a>"
        + "</div>" + "</th>" + "</tr>" + "<tr>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'>期初余额</td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>" + "</tr>"
        + "<tr>" + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'>...</td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>" + "</tr>"
        + "<tr>" + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'>本期合计</td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>" + "</tr>"
        + "<tr>" + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'>...</td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>" + "</tr>"
        + "<tr>" + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'>本期合计</td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>" + "</tr>"
        + "<tr>" + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'>本年累计</td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>" + "</tr>"
        + "</tbody>" + "</table>"
    );
}

/*
 * @ # coursevii ? 删除表单
 */
function vii_DeleteTable(obj) {
    $(obj).parent().parent().parent().parent().parent().parent().remove();
}


/*
 * @ # coursevii -> 登记各账户明细表 ? 表格增加行
 */
function vii_AddRow(obj) {
    $(obj).parent().parent().parent().parent().append(
        "<tr>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"

        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"

        + "<td style='width: 1%; border: 0; background: #ffffff'>"
        + "<div align='center'>"
        + "<a style='color: red; padding: 0 0' type='button' "
        + "class='btn' onclick='vii_DeleteRow(this)'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>"
        + "</td>"
        + "</tr>"
    );
}


/*
 * @ # coursevii ? 表格删除行
 */
function vii_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}













