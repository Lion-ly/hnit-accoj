function remove(rm) {
	$(rm).parent().remove();
}

//==================================coursei==================================//

/* @
 * # coursei -> 新增业务
 * ? 新增业务的三个选项
 */
/*
function addActivity(labeltype){
	var text;
	switch(labeltype){
	case "success":
		text = "筹资活动";
		break;
	case "info":
		text = "投资活动";
		break;
	case "warning":
		text = "经营活动";
		break;
	}
	$("#body-text").append(
			"<p><label class='label  label-"+labeltype+"'>"+text+"</label><input type='text'>年<input type='text'>月<input type='text'>日，从中国建设银行取得<input type='text'>年期贷款<input type='text'>万元存入银行，年利率为<input type='text'>%，按年结算利息。</p>"
	);	
}
*/

/* @
 * # coursei
 * ? 表格删除行
 */
/*
function i_DeleteRow(obj){
	$(obj).parent().parent().parent().remove();
}
*/

//==================================courseiii==================================//

/* @
 * # courseiii
 * ? 穿梭框
 */
function ctol(){
	$centerbox = $('#centerbox');
	$leftbox = $('#leftbox');
	$rightbox = $('#rightbox');
	$input = $centerbox.find('input');
	for(var k=0;k<$input.length;k++){
			if($input[k].checked){
				$leftbox.append(
					$($input[k]).parent()
				);
			}
	   	}
}

function ctol_cancel(){
	$centerbox = $('#centerbox');
	$leftbox = $('#leftbox');
	$rightbox = $('#rightbox');
	$input = $leftbox.find('input');
	for(var k=0;k<$input.length;k++){
			if($input[k].checked){
				$centerbox.append(
					$($input[k]).parent()
				);
			}
	   	}
}

function ctor(){
	$centerbox = $('#centerbox');
	$leftbox = $('#leftbox');
	$rightbox = $('#rightbox');
	$input = $centerbox.find('input');
	for(var k=0;k<$input.length;k++){
			if($input[k].checked){
				$rightbox.append(
					$($input[k]).parent()
				);
			}
	   	}
}

function ctor_cancel(){
	$centerbox = $('#centerbox');
	$leftbox = $('#leftbox');
	$rightbox = $('#rightbox');
	$input = $rightbox.find('input');
	for(var k=0;k<$input.length;k++){
			if($input[k].checked){
				$centerbox.append(
					$($input[k]).parent()
				);
			}
	   	}
}

//==================================courseiv==================================//

/* @
 * # courseiv
 * ? 表格增加行
 */
function iv_AddRow(obj){
		$("#"+obj+"Row").append(
					"<tr>"
				+	"<td class='ats-tablecolor-f' style='border-right: 0px'></td>"
				+	"<td class='ats-tablecolor-f' style='border-left: 0px'></td>"
				+	"<td contentEditable='true'><br></td>"
				+	"<td contentEditable='true'><br></td>"
				+	"<td style='padding:0px;border:0px'>"
				+	"<div align='center'>"
				+			"<a style='color: red' type='button' class='btn' onclick='iv_DeleteRow(this)'><span class='glyphicon glyphicon-minus-sign'></span></a>"
				+		"</div>"
				+	"</td>"
				+	"</tr>"
		);
	}


/* @
 * # courseiv
 * ? 表格删除行
 */
function iv_DeleteRow(obj){
	$(obj).parent().parent().parent().remove();
}

//==================================coursev==================================//

/* @
 * # coursev -> 平衡表
 * ? 表格增加行
 */
function v_AddRow(obj){
	$("#"+obj+"Row").before(
			"<tr>"
		+	"<td contentEditable='true'><br></td>"
		+	"<td contentEditable='true'><br></td>"
		+	"<td contentEditable='true'><br></td>"
		+	"<td contentEditable='true'><br></td>"
		+	"<td contentEditable='true'><br></td>"
		+	"<td contentEditable='true'><br></td>"
		+	"<td contentEditable='true'><br></td>"
		+	"<td style='padding: 0px; border: 0px'>"
		+		"<div align='center'> "
		+			"<a style='color: red' type='button' class='btn' onclick='v_DeleteRow(this)'><span class='glyphicon glyphicon-minus-sign'></span></a>"
		+		"</div> "
		+	"</td> "
		+	"</tr>"
	);
	
	
}


/* @
 * # coursev -> 平衡表
 * ? 表格删除行
 */
function v_DeleteRow(obj){
	$(obj).parent().parent().parent().remove();
}


/* @
 * # coursev -> 设立账户
 * ? 新建左/右T表
 */
var tableNum = 101;
var tableName = "ttable-" + tableNum;
function addTTable(t){
	if(t=="left"){
		$("#TTable").append(
				"<div id="+tableNum+">"
			+	"<table class='table table-bordered' " 
			+		" style='border: 0px; width: 50%; margin-bottom: 0px'>"
			+		"<tr>"
			+			"<th "
			+				"style='text-align: center; vertical-align: middle; border: 0px;width: 33%'>借方</th>"
			+			"<th "
			+				"style='border: 0px;width: 33%'>"
			+				"<select class='form-control pull-right'> "
			+					"<option>银行存款</option> "
			+					"<option>...</option> "
			+				"</select> </th>"
			+			"<th "
			+				"style='text-align: center; vertical-align: middle; border: 0px;width: 33%'>贷方</th>"
			+		"</tr>"
			+	"</table>"
			+	"<table class='table table-bordered' style='border: 0px; width: 50%'>"
			+		"<tr>"
			+			"<td style='width: 50%; border-left: 0px'>"
			+				"<div align='right'>"
			+					"<table>"
			+						"<tr>"
			+							"<th>期初余额</th>"
			+							"<td contentEditable='true'>0</td>"
			+						"</tr>"
			+						"<tr>"
			+							"<th>增加额</th>"
			+							"<td contentEditable='true'>0</td>"
			+						"</tr>"
			+					"</table>"
			+				"</div>"
			+			"</td>"
			+			"<td style='width: 50%; border-right: 0px'>"
			+				"<div align='left'>"
			+					"<table>"	
			+					"</table>"
			+				"</div>"
			+			"</td>"
			+		"</tr>"
			+		"<tr>"
			+			"<td style='width: 50%; border-left: 0px; border-bottom: 0px'>"
			+				"<div align='right'>"
			+					"<table>"
			+						"<tr>"
			+							"<th>本期发生额</th>"
			+							"<td contentEditable='true'>0</td>"
			+						"</tr>"
			+						"<tr>"
			+							"<th>期末余额</th>"
			+							"<td contentEditable='true'>0</td>"
			+						"</tr>"
			+					"</table>"
			+				"</div>"
			+			"</td>"
			+			"<td style='width: 50%; border-right: 0px; border-bottom: 0px'>"
			+				"<div align='left'>"
			+					"<table>"
			+						"<tr>"
			+							"<th>本期发生额</th>"
			+							"<td contentEditable='true'>0</td>"
			+						"</tr>"
			+					"</table>"
			+				"</div>"
			+			"</td>"
			+		"</tr>"
			+	"</table>"
			+	"</div>"
		);
		tableNum++;
	} else {
		$("#TTable").append(
				"<div id="+tableNum+">"
			+	"<table class='table table-bordered' " 
			+		" style='border: 0px; width: 50%; margin-bottom: 0px'>"
			+		"<tr>"
			+			"<th "
			+				"style='text-align: center; vertical-align: middle; border: 0px;width: 33%'>借方</th>"
			+			"<th "
			+				"style='border: 0px;width: 33%'>"
			+				"<select class='form-control pull-right'> "
			+					"<option>长期借款</option> "
			+					"<option>...</option> "
			+				"</select> </th>"
			+			"<th "
			+				"style='text-align: center; vertical-align: middle; border: 0px;width: 33%'>贷方</th>"
			+		"</tr>"
			+	"</table>"
			+	"<table class='table table-bordered' style='border: 0px; width: 50%'>"
			+		"<tr>"
			+			"<td style='width: 50%; border-left: 0px'>"
			+				"<div align='right'>"
			+					"<table>"
			+					"</table>"
			+				"</div>"
			+			"</td>"
			+			"<td style='width: 50%; border-right: 0px'>"
			+				"<div align='left'>"
			+					"<table>"
			+						"<tr>"
			+							"<th>期初余额</th>"
			+							"<td contentEditable='true'>0</td>"
			+						"</tr>"
			+						"<tr>"
			+							"<th>增加额</th>"
			+							"<td contentEditable='true'>0</td>"
			+						"</tr>"
			+					"</table>"
			+				"</div>"
			+			"</td>"
			+		"</tr>"
			+		"<tr>"
			+			"<td style='width: 50%; border-left: 0px; border-bottom: 0px'>"
			+				"<div align='right'>"
			+					"<table>"
			+						"<tr>"
			+							"<th>本期发生额</th>"
			+							"<td contentEditable='true'>0</td>"
			+						"</tr>"
			+					"</table>"
			+				"</div>"
			+			"</td>"
			+			"<td style='width: 50%; border-right: 0px; border-bottom: 0px'>"
			+				"<div align='left'>"				
			+					"<table>"
			+						"<tr>"
			+							"<th>本期发生额</th>"
			+							"<td contentEditable='true'>0</td>"
			+						"</tr>"
			+						"<tr>"
			+							"<th>期末余额</th>"
			+							"<td contentEditable='true'>0</td>"
			+						"</tr>"
			+					"</table>"
			+				"</div>"
			+			"</td>"
			+		"</tr>"
			+	"</table>"
			+	"</div>"
		);
		tableNum++;
	}
}


/* @
 * # coursev -> 设立账户
 * ? 删除左/右T表
 */
function deleteTTable(){
	if(tableNum-1<101){
		tableNum = 101;
	}else {
		tableNum = tableNum-1;
	}
	$("#"+tableNum).remove();	
}

//==================================coursevi==================================//


/* @
 * # coursevi
 * ? 表格增加行
 */
function vi_AddRow(){
	$("#anchor").before(
			"<tr>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td style='padding: 0px; border: 0px; width: 4%'>"
		+			"<div align='center'>"
		+				"<a style='color: red;' type='button' class='btn' onclick='vi_DeleteRow(this)'>"
		+				"<span class='glyphicon glyphicon-minus-sign'></span></a>"
		+			"</div>"
		+		"</td>"
		+	"</tr>"
	);
}


/* @
 * # coursevi
 * ? 表格删除行
 */
function vi_DeleteRow(obj){
	$(obj).parent().parent().parent().remove();
}

//==================================coursevii==================================//


/* @
 * # coursevii -> 登记各账户明细表
 * ? 新建表单
 */
function vii_AddTable(){
	$('#tablePanel').prepend(
					"<table class='table table-bordered ats-vouchertable' style='border: 0px;'>"
							+ "<tbody id='detailed'>"
							+ "<tr>"
							+ "<td colspan='37' style='border: 0px'>"
							+ "<div align='center'>"
							+ "<select class='form-control' "
							+ "style='width: 160px; display: inline-block;'>"
							+ "<option>银行存款</option>"
							+ "<option>长期存款</option>"
							+ "</select>"
							+ "<p style='font-size: 24px; display: inline-block;'>&nbsp;明&nbsp;细&nbsp;账</p>"
							+ "<div align='center' style='float: right; margin-top: 5px'>"
							+ "<a "
							+ "style='color: red; font-size: 18px; padding-right: 0px;padding-left: 0px' "
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
							+ "<th style='width: 1%; border: 0px; background: #ffffff'>"
							+ "<div align='center'>"
							+ "<a style='color: green; padding: 0px 0px' type='button' "
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

/* @
 * # coursevii
 * ? 删除表单
 */
function vii_DeleteTable(obj){
	$(obj).parent().parent().parent().parent().parent().parent().remove();
}



/* @
 * # coursevii -> 登记各账户明细表
 * ? 表格增加行
 */
function vii_AddRow(obj){
	$(obj).parent().parent().parent().parent().append(
			"<tr>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"

		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
	
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
	
		+		"<td contentEditable='true'><br></td>"
	
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		+		"<td contentEditable='true'><br></td>"
		
		+		"<td style='width: 1%; border: 0px; background: #ffffff'>"
		+			"<div align='center'>"
		+				"<a style='color: red; padding: 0px 0px' type='button' "
		+					"class='btn' onclick='vii_DeleteRow(this)'><span "
		+					"class='glyphicon glyphicon-minus-sign'></span></a>"
		+			"</div>"
		+		"</td>"
		+	"</tr>"
	);
}


/* @
 * # coursevii
 * ? 表格删除行
 */
function vii_DeleteRow(obj){
	$(obj).parent().parent().parent().remove();
}













