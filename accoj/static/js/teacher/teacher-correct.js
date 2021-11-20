$(document).ready(function () {
    getStudentInfo();
    getclass();
    $("#classSelect").change(classSelectval);
    $("#correct_homework").click(correct_homework_input);
    $("#export_grades").click(export_grade);

});
//班级分类
function classSelectval() {
    let nowClass = $("#classSelect").val();

    $("form").find("input[type=search]").val(nowClass.split("-")[1]).keyup();


}

function getStudentInfo() {

    $.fn.dataTable.ext.errMode = 'throw';
    let csrf_token = get_csrf_token();
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        }
    });
    let table = $('#data-table').DataTable({
        ajax: {url: '/api/get_student_info_correct'},
        order: [[4, 'desc']],
        "columns": [
            {"data": "rank"},
            {"data": "team_no"},
            {"data": "team_name"},
            {"data": "team_class"},
            {"data": "sum_score"},
            {"data": "one"},
            {"data": "two"},
            {"data": "three"},
            {"data": "four"},
            {"data": "five"},
            {"data": "six"},
            {"data": "seven"},
            {"data": "eight"},
            {"data": "nine"},
            {"data": "ten"},
            {"data": "correct_schedule"}
        ]
    });
    console.log(table);
    $('#data-table tbody').on('click', 'tr', function () {

        correct_homework(table.row(this).data().team_no);
    });
}


function correct_homework_input() {
    correct_homework($("#input_sdudent_no").val());
}


function correct_homework(sid) {
    function successFun(data) {
        window.location.replace('/courseix');
    }

    let data = {api: 'correct_homework'};
    data.student_no = sid
    get_data(data, successFun, '/api/teacher_api', 'messageInfoBox');
}

function export_grade() {

    function successFun_grade(data) {
        let title = ['排名', '学号', '姓名', '班级', '第一部分', '第二部分', '第三部分', '第四部分', '第五部分', '第六部分', '第七部分', '第八部分', '第九部分', '第十部分', '总分'];
        let filter = ['correct_schedule'];
        let dataDict = {
            "rank": "",
            "student_no": "",
            "student_name": "",
            "student_class": "",
            "one": "",
            "two": "",
            "three": "",
            "four": "",
            "five": "",
            "six": "",
            "seven": "",
            "eight": "",
            "nine": "",
            "ten": "",
            "sum_score": ""
        }


        let dataList = new Array();
        for (let i = 0; i < data.length; i++) {
            dataList[i] = new Array();
        }

        let cnt = 0;
        for (let i = 0; i < data.length; i++) {
            for (let key in dataDict) {
                dataList[i][cnt++] = data[i][key];
            }
        }
        console.log(dataList);
        exportExcel(dataList, "成绩汇总", title, filter)
    }

    let data = {api: 'get_student_info_correct'}
    get_data(data, successFun_grade, '/api/get_student_info_correct', '下载成功')

}


function exportExcel(JSONData, FileName, title, filter) {
    if (!JSONData) return;
    //转化json为object
    let arrData = typeof JSONData != "object" ? JSON.parse(JSONData) : JSONData;
    let excel = "<table>";
    //设置表头
    let row = "<tr>";
    if (title) { //使用标题项
      for (let i in title) {
        row += "<th align='center'>" + title[i] + "</th>";
      }
    } else {//不使用标题项
      for (let i in arrData[0]) {
        row += "<th align='center'>" + i + "</th>";
      }
    }
    excel += row + "</tr>";
    //设置数据
    for (let i = 0; i < arrData.length; i++) {
      let row = "<tr>";
      for (let index in arrData[i]) {
        //判断是否有过滤行
        if (filter) {
          if (filter.indexOf(index) == -1) {
            let value = arrData[i][index] == null ? "" : arrData[i][index];
            row += "<td>" + value + "</td>";
          }
        } else {
          let value = arrData[i][index] == null ? "" : arrData[i][index];
          row += "<td align='center'>" + value + "</td>";
        }
      }
      excel += row + "</tr>";
    }
    excel += "</table>";
    let excelFile =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>";
    excelFile +=
      '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
    excelFile +=
      '<meta http-equiv="content-type" content="application/vnd.ms-excel';
    excelFile += '; charset=UTF-8">';
    excelFile += "<head>";
    excelFile += "<!--[if gte mso 9]>";
    excelFile += "<xml>";
    excelFile += "<x:ExcelWorkbook>";
    excelFile += "<x:ExcelWorksheets>";
    excelFile += "<x:ExcelWorksheet>";
    excelFile += "<x:Name>";
    excelFile += "{worksheet}";
    excelFile += "</x:Name>";
    excelFile += "<x:WorksheetOptions>";
    excelFile += "<x:DisplayGridlines/>";
    excelFile += "</x:WorksheetOptions>";
    excelFile += "</x:ExcelWorksheet>";
    excelFile += "</x:ExcelWorksheets>";
    excelFile += "</x:ExcelWorkbook>";
    excelFile += "</xml>";
    excelFile += "<![endif]-->";
    excelFile += "</head>";
    excelFile += "<body>";
    excelFile += excel;
    excelFile += "</body>";
    excelFile += "</html>";
    let uri =
        "data:application/vnd.ms-excel;charset=utf-8," +
        encodeURIComponent(excelFile);
    let link = document.createElement("a");
    link.href = uri;
    link.style = "visibility:hidden";
    link.download = FileName + ".xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

//班级获取
let IsFirst = true;
function getclass() {
    function successFunc(data) {
        data = JSON.parse(data);

        let flag = false;
        if (IsFirst) flag = true;
        //console.log("data.length: " + data.length);
        for (let i = 0; i < data.length; i++) {
            let className = data[i]["class_name"];

            if (flag)
                $("#classSelect").append(new Option(className, className));

        }
        //console.log("TimeInfos: " + TimeInfos);
        if (flag) IsFirst = false;
    }

    let data = {"api": "get_manage_time_info"},
        url = "/api/teacher_api";
    get_data(data, successFunc, url)
}