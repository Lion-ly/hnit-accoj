//==================================新增业务==================================//
$(function () {
    $('#company_form_button').click(function () {
        var data = $('#company_form').serialize();
        // 提交表单
        $.ajax({
            url: "/company_form_submit",
            type: "post",
            data: data,
            dataType: "json",
            cache: false,
            async: true,
            success: function (data) {
                if (data["result"] === "true") {
                    $(":text").css({"border-style": "none"});
                    $("#com_business_scope").css({"border-style": "none"});
                    alert("提交成功");
                } else if (data.hasOwnProperty("err_pos")) {
                    var data_err_pos = data["err_pos"];
                    for (var x = 0; x < data_err_pos.length; x++) {
                        var err_pos = data_err_pos[x]["err_pos"];
                        $("#" + err_pos).css({"border-style": "solid"});
                    }
                    alert(data["message"]);
                } else {
                    getCompanyInfo();
                    alert(data["message"])
                }
            },
            error: function (err) {
                console.log(err.statusText + "异常");
            }
        })

    })
});

function getCompanyInfo() {
    // 获取公司信息
    var data = $('#company_form').serialize();
    $.ajax({
        url: "/get_company_info",
        type: "post",
        data: data,
        dataType: "json",
        cache: false,
        async: true,
        success: function (data) {
            // 公司已经创立过，将值填充，并将按钮置为不可点击以及表单不可编辑
            $("#company_form_button").attr("disabled", true);
            $(":text").attr("readonly", "readonly");
            $("textarea").attr("readonly", "readonly");
            company_info = data["company_info"];
            for (var prop in company_info) {
                if (prop === "com_shareholder") {
                    com_shareholders = company_info[prop];
                    for (var i = 0; i < com_shareholders.length; i++) {
                        $("#com_shareholder_" + (i + 1)).val(com_shareholders[i]);
                    }
                } else {
                    $("#" + prop).val(company_info[prop]);
                }
            }
        },
        error: function (err) {
            console.log(err.statusText + "异常");
        }
    })

}

$(function () {
    // CreateCompany-li标签获取公司信息数据
    $('#CreateCompany-li').click(function () {
        getCompanyInfo();
    })
});

//==================================新增业务==================================//
var rowNumI = 101;
function addActivity(labeltype) {
	var rowName = "row-" + rowNumI;
    var text;
    var bg;
    switch (labeltype) {
        case "success":
            text = "筹资活动";
            bg = "#5cb85c"
            break;
        case "info":
            text = "投资活动";
            bg = "#5bc0de"
            break;
        case "warning":
            text = "经营活动";
            bg = "#f0ad4e"
            break;
    }
    $("#body-text").append(
    	"<tr id='" + rowName + "'>"
	+		"<th style='background-color: " + bg + ";width: 5%'>"
	+		text
	+		"</th>"
	+		"<td style='text-align: left'>"
	+		"2020年2月1日，从中国建设银行取得年期贷款20万元存入银行，年利率为6%，按年结算利息。"
	+		"</td>"
	+		
	+	"</tr>"
    );
    rowNumI++;
}

function i_DeleteRow(){
	if(rowNumI-1<101){
		rowNumI = 101;
	}else {
		rowNumI = rowNumI-1;
	}
	var rowName = "row-" + rowNumI;
	$("#"+rowName).remove();	
}
