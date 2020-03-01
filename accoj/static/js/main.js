// ==================================coursei==================================//

/*
 * @ # coursei -> 新增业务 ? 新增业务的三个选项
 */
/*
 * function addActivity(labeltype){ let text; switch(labeltype){ case "success":
 * text = "筹资活动"; break; case "info": text = "投资活动"; break; case "warning": text =
 * "经营活动"; break; } $("#body-text").append( "<p><label class='label
 * label-"+labeltype+"'>"+text+"</label><input type='text'>年<input
 * type='text'>月<input type='text'>日，从中国建设银行取得<input type='text'>年期贷款<input
 * type='text'>万元存入银行，年利率为<input type='text'>%，按年结算利息。</p>" ); }
 */

/*
 * @ # coursei ? 表格删除行
 */
/*
 * function i_DeleteRow(obj){ $(obj).parent().parent().parent().remove(); }
 */


//===================================courseii===================================//
/*function iconChange(obj){
	let $obj = $(obj).children();
	let className = $obj.attr("class");
	let newClass = className === "glyphicon glyphicon-plus" ? "glyphicon glyphicon-minus" : "glyphicon glyphicon-plus";
	$obj.removeClass(className);
	$obj.addClass(newClass);
}*/


// ==================================courseiii==================================//

/*
 * @ # courseiii ? 穿梭框
 */
/*function ctol() {
    let $centerbox = $('#centerbox');
    let $leftbox = $('#leftbox');
    let $input = $centerbox.find('input');
    for (let k = 0; k < $input.length; k++) {
        if ($input[k].checked) {
            $leftbox.append(
                $($input[k]).parent()
            );
        }
    }
}

function ctol_cancel() {
    let $centerbox = $('#centerbox');
    let $leftbox = $('#leftbox');
    let $input = $leftbox.find('input');
    for (let k = 0; k < $input.length; k++) {
        if ($input[k].checked) {
            $centerbox.append(
                $($input[k]).parent()
            );
        }
    }
}

function ctor() {
    let $centerbox = $('#centerbox');
    let $rightbox = $('#rightbox');
    let $input = $centerbox.find('input');
    for (let k = 0; k < $input.length; k++) {
        if ($input[k].checked) {
            $rightbox.append(
                $($input[k]).parent()
            );
        }
    }
}

function ctor_cancel() {
    let $centerbox = $('#centerbox');
    let $rightbox = $('#rightbox');
    let $input = $rightbox.find('input');
    for (let k = 0; k < $input.length; k++) {
        if ($input[k].checked) {
            $centerbox.append(
                $($input[k]).parent()
            );
        }
    }
}*/


/*function all_to(obj){
    let $objbox = $('#'+obj);
    let $allboxChecked = $('#allbox input:checked');
    for(let i=0;i<$allboxChecked.length;i++){
        $objbox.append(
            $($allboxChecked[i]).parent()
        );
    }
}

function to_all(obj){
    let $objboxChecked = $('#' + obj + ' input:checked');
    for(let i=0;i<$objboxChecked.length;i++){
        let data_type = $($objboxChecked[i]).attr("data-type");
        let objbox = $('#' + data_type);
        objbox.append(
            $($objboxChecked[i]).parent()
        );
    }
}*/

// ==================================courseiv==================================//

/*
 * @ # courseiv ? 表格增加行
 */
let rowNumIv = 1;

function iv_AddRow(obj, subject = "", money = "") {
    let type = "0";
    if (obj === "borrow") {
        type = "1";
    }
    $("#" + obj + "RowAfter").before(
        "<tr>"
        + "<td class='ats-tablecolor-f' style='border-right: 0'></td>"
        + "<td class='ats-tablecolor-f' style='border-left: 0'></td>"
        + "<td><input type='text' id='subject" + type + "_" + rowNumIv + "' name='subject' placeholder='科目' value='" + subject + "'></td>"
        + "<td><input type='text' id='money" + type + "_" + rowNumIv + "'name='money' placeholder='金额' value='" + money + "'></td>"
        + "<td style='padding:0;border:0'>"
        + "<div align='center'>"
        + "<a style='color: red' type='button' class='btn' onclick='iv_DeleteRow(this)'><span class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>"
        + "</td>"
        + "</tr>"
    );
    rowNumIv += 1;
}


/*
 * @ # courseiv ? 表格删除行
 */
function iv_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
    rowNumIv -= 1;
}

// ==================================coursev==================================//
/*
 * @ # coursev_2 -> 平衡表 ? 表格增加行
 */
function v_AddRow(obj) {
    $("#" + obj + "Row").before(
        "<tr>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td contentEditable='true'><br></td>"
        + "<td style='padding: 0; border: 0'>"
        + "<div align='center'> "
        + "<a style='color: red' type='button' class='btn' onclick='v_DeleteRow(this)'><span class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div> "
        + "</td> "
        + "</tr>"
    );


}


/*
 * @ # coursev_2 -> 平衡表 ? 表格删除行
 */
function v_DeleteRow(obj) {
    $(obj).parent().parent().parent().remove();
}

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













