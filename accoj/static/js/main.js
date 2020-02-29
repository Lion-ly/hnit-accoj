function remove(rm) {
    $(rm).parent().remove();
}

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
 * @ # coursev ? 表格增加行
 */
function v_AddLeftRow(obj, pm, money = "") {
    let title = "";
    if (pm === "plus") {
        title = "增加额";
    } else {
        title = "减少额";
    }
    $(obj).parent().parent().parent().after(
        "<tr>" + "<td>" + "<div align='left'>"
        + "<a style='color: red; padding: 0 0' type='button' "
        + "class='btn' onclick='v_DeleteRowT(this)'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>" + "</td>" + "<th>" + title + "</th>"
        + "<td><input type='number' name='' id='' " + "value='" + money + "'"
        + "placeholder='0'></td>" + "</tr>");
}

function v_AddRightRow(obj, pm, money = "") {
    let title = "";
    if (pm === "plus") {
        title = "增加额";
    } else {
        title = "减少额";
    }
    $(obj).parent().parent().parent().after(
        "<tr>" + "<th style='width: 30%;'>" + title + "</th>"
        + "<td style='width: 30%;'><input type='number' " + "value='" + money + "'"
        + "name='' id='' placeholder='0'></td>"
        + "<td style='width: 40%;'>" + "<div align='right'>"
        + "<a style='color: red; padding: 0 0' "
        + "type='button' class='btn' onclick='v_DeleteRowT(this)'><span "
        + "class='glyphicon glyphicon-minus-sign'></span></a>"
        + "</div>" + "</td>" + "</tr>");
}

function v_DeleteRowT(obj) {
    $(obj).parent().parent().parent().remove();
}


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


let pageNum = 1;

/**
 * 增加左T表
 */
function tTableAppendLeft() {
    let content = '' +
        '<div role="tabpanel" class="" id="ttableLeft">' +
        '        <div style="text-align:right;">' +
        '           <button style="color: red; font-size: 18px; margin-right: 6px; padding: 0; background-color: #ffffff" type="button"' +
        '               class="btn" title="删除此表"  onclick="deleteTableV(this)"><span class="glyphicon glyphicon-remove"></span></button>' +
        '        </div>' +
        '        <div align="center" style="margin-top: 80px;margin-bottom: 100px">' +
        '            <table class="table table-bordered" style="border: 0; width: 50%; margin-bottom: 0">' +
        '                <tbody>' +
        '                <tr>' +
        '                    <th style="text-align: center; vertical-align: middle; border: 0; width: 33%">借方</th>' +
        '                    <th style="border: 0; width: 33%"><select id="coursev_select" class="form-control pull-right"' +
        '                                                              onchange="subject_change(this)">' +
        '                    </select></th>' +
        '                    <th style="text-align: center; vertical-align: middle; border: 0; width: 33%">贷方</th>' +
        '                </tr>' +
        '                </tbody>' +
        '            </table>' +
        '            <table class="table table-bordered" style="border: 0; width: 50%">' +
        '                <tbody>' +
        '                <tr>' +
        '                    <td style="width: 50%; border-left: 0">' +
        '                        <div align="right">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <td style="width: 40%;">' +
        '                                        <div align="left"><a style="color: green; padding: 0 0" type="button"' +
        '                                                             class="btn"' +
        '                                                             onclick="v_AddLeftRow(this, \'plus\')"><span' +
        '                                                class="glyphicon glyphicon-plus-sign"></span></a></div>' +
        '                                    </td>' +
        '                                    <th style="width: 30%;">期初余额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="" id="" placeholder="0"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0">' +
        '                        <div align="left">' +
        '                            <table id="ttable-01" class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <th style="width: 30%;"></th>' +
        '                                    <td style="width: 30%;"></td>' +
        '                                    <td style="width: 40%;">' +
        '                                        <div align="right"><a style="color: green; padding: 0 0" type="button"' +
        '                                                              class="btn"' +
        '                                                              onclick="v_AddRightRow(this,\'minus\')"><span' +
        '                                                class="glyphicon glyphicon-plus-sign"></span></a></div>' +
        '                                    </td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                </tr>' +
        '                <tr>' +
        '                    <td style="width: 50%; border-left: 0; border-bottom: 0">' +
        '                        <div align="right">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <td style="width: 40%;"></td>' +
        '                                    <th style="width: 30%;">本期发生额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="" id="" placeholder="0"></td>' +
        '                                </tr>' +
        '                                <tr>' +
        '                                    <td></td>' +
        '                                    <th>期末余额</th>' +
        '                                    <td><input type="number" name="" id="" placeholder="0"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0; border-bottom: 0">' +
        '                        <div align="left">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <th style="width: 30%;">本期发生额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="" id="" placeholder="0"></td>' +
        '                                    <td style="width: 40%;"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                </tr>' +
        '                </tbody>' +
        '            </table>' +
        '        </div>' +
        '    </div>';
    $('#TTablePage').append(content);
}

/**
 * 增加右T表
 */
function tTableAppendRight() {
    let content = '' +
        '    <div role="tabpanel" class="" id="ttableRight">' +
        '        <div style="text-align:right;">' +
        '           <button style="color: red; font-size: 18px; margin-right: 6px; padding: 0; background-color: #ffffff" type="button"' +
        '               class="btn" title="删除此表" onclick="deleteTableV(this)"><span class="glyphicon glyphicon-remove"></span></button>' +
        '        </div>' +
        '        <div align="center" style="margin-top: 80px;margin-bottom: 100px">' +
        '            <table class="table table-bordered" style="border: 0; width: 50%; margin-bottom: 0">' +
        '                <tbody>' +
        '                <tr>' +
        '                    <th style="text-align: center; vertical-align: middle; border: 0; width: 33%">借方</th>' +
        '                    <th style="border: 0; width: 33%"><select id="coursev_select" class="form-control pull-right"' +
        '                                                              onchange="subject_change(this)">' +
        '                    </select></th>' +
        '                    <th style="text-align: center; vertical-align: middle; border: 0; width: 33%">贷方</th>' +
        '                </tr>' +
        '                </tbody>' +
        '            </table>' +
        '            <table class="table table-bordered" style="border: 0; width: 50%">' +
        '                <tbody>' +
        '                <tr>' +
        '                    <td style="width: 50%; border-left: 0">' +
        '                        <div align="right">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <td style="width: 40%;">' +
        '                                        <div align="left"><a style="color: green; padding: 0 0" type="button"' +
        '                                                             class="btn" onclick="v_AddLeftRow(this,\'minus\')"><span' +
        '                                                class="glyphicon glyphicon-plus-sign"></span></a></div>' +
        '                                    </td>' +
        '                                    <th style="width: 30%;"></th>' +
        '                                    <td style="width: 30%;"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0">' +
        '                        <div align="left">' +
        '                            <table id="ttable-01" class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <th style="width: 30%;">期初余额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="" id="" placeholder="0"></td>' +
        '                                    <td style="width: 40%;">' +
        '                                        <div align="right"><a style="color: green; padding: 0 0" type="button"' +
        '                                                              class="btn"' +
        '                                                              onclick="v_AddRightRow(this,\'plus\')"><span' +
        '                                                class="glyphicon glyphicon-plus-sign"></span></a></div>' +
        '                                    </td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                </tr>' +
        '                <tr>' +
        '                    <td style="width: 50%; border-left: 0; border-bottom: 0">' +
        '                        <div align="right">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <td style="width: 40%;"></td>' +
        '                                    <th style="width: 30%;">本期发生额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="" id="" placeholder="0"></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                    <td style="width: 50%; border-right: 0; border-bottom: 0">' +
        '                        <div align="left">' +
        '                            <table class="ats-v-Ttable">' +
        '                                <tbody>' +
        '                                <tr>' +
        '                                    <th style="width: 30%;">本期发生额</th>' +
        '                                    <td style="width: 30%;"><input type="number" name="" id="" placeholder="0"></td>' +
        '                                    <td style="width: 40%;"></td>' +
        '                                </tr>' +
        '                                <tr>' +
        '                                    <th>期末余额</th>' +
        '                                    <td><input type="number" name="" id="" placeholder="0"></td>' +
        '                                    <td></td>' +
        '                                </tr>' +
        '                                </tbody>' +
        '                            </table>' +
        '                        </div>' +
        '                    </td>' +
        '                </tr>' +
        '                </tbody>' +
        '            </table>' +
        '        </div>' +
        '    </div>'
    $('#TTablePage').append(content);
}

let subject_list_len = 0;

function v_createNewPage(obj, lcr) {
    let ledgerNum = $("li[id^=coursevli]").length;
    if (subject_list_len && ledgerNum >= subject_list_len) {
        alert("新增失败！账户设置达到上限");
        return;
    }
    // 移除旧表
    $("[id^=ttable]").remove();
    // 移除激活的li的.active
    $("li[id^=coursevli]").removeClass("active");
    switch (lcr) {
        case "left":
            tTableAppendLeft();
            break;
        case "center":
            $('#TTablePage').append(

            );
            break;
        case "right":
            tTableAppendRight();
            break;
    }
    let coursevli_id = "coursevli_" + lcr + pageNum;
    $(obj).parent().parent().parent().before(
        "<li role='presentation' class='active' onclick='coursevLiChange(this)' id='" + coursevli_id + "'><a "
        + "role='tab' data-toggle='tab'>"
        + "</a></li>"
    );
    coursevLiChange($("#" + coursevli_id));
    pageNum++;
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













