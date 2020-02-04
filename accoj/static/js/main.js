function remove(rm) {
	$(rm).parent().remove();
}

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

function AddAndSub(aas){
	var mark = $(aas).text();
	var changemark = mark == '+' ? '-' : '+';
	$(aas).text(changemark);
}

function addRow(llr){
		$("#"+llr+"Row").append(
				"<tr>"
			+	"<td class='ats-tablecolor-f' style='border-right: 0px'></td>"
			+	"<td class='ats-tablecolor-f' style='border-left: 0px'></td>"
			+	"<td contentEditable='true'></td>"
			+	"<td contentEditable='true'></td>"
			+	"<td style='padding:0px;border:0px'>"
			+	"<div align='center'>"
			+			"<a style='color: red' type='button' class='btn' onclick='deleteRow(this)'><span class='glyphicon glyphicon-minus-sign'></span></a>"
			+		"</div>"
			+	"</td>"
			+	"</tr>"
		);
	}

function deleteRow(llr){
	var td = $(llr).parent().parent().parent().remove();
}

function addRowV(bs){
	$("#"+bs+"Row").append(
			"<tr>"
		+	"<td contentEditable='true'></td>"
		+	"<td contentEditable='true'></td>"
		+	"<td contentEditable='true'></td>"
		+	"<td contentEditable='true'></td>"
		+	"<td contentEditable='true'></td>"
		+	"<td contentEditable='true'></td>"
		+	"<td contentEditable='true'></td>"
		+	"<td style='padding: 0px; border: 0px'>"
		+		"<div align='center'>"
		+			"<a style='color: red' type='button' class='btn' onclick='deleteRow(this)'><span class='glyphicon glyphicon-minus-sign'></span></a>"
		+		"</div>"
		+	"</td>"
		+	"</tr>"
	);
	
	
}

function deleteRowV(bs){
	var td = $(bs).parent().parent().parent().remove();
}


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
			+				"style='text-align: center; vertical-align: middle; border: 0px;width: 33%'"
			+				"contentEditable='true'>银行存款</th>"
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
			+				"style='text-align: center; vertical-align: middle; border: 0px;width: 33%'"
			+				"contentEditable='true'>银行存款</th>"
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

function deleteTTable(){
	if(tableNum-1<101){
		tableNum = 101;
	}else {
		tableNum = tableNum-1;
	}
	
	$("#"+tableNum).remove();
	
}






