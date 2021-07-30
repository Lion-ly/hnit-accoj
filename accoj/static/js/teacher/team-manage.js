/// <reference path="C:/Users/a1375/Desktop/hnit/typings/jquery/jquery.d.ts" />
let IsFirst = true;
$(function () {
    var tid = 1;
    getclass();
    $('#addteam').click(function () {
        $('#empty').hide();
        newteams(tid);
        tid++;
    });
    if (($('#team-box').children().length) != 1) {
        $('#empty').hide();
    }

});


function newteams(tid) {
    let newteam = $('<a id="' + tid + '" data-toggle="collapse" href="#collapseExample' + tid + '" role="button" aria-expanded="false" aria-controls="collapseExample"></a>');
    let newlist = $('<li class="list-group-item d-flex justify-content-between align-items-center "></li>').text('Newteam:');
    newlist.append('<span class="fa fa-angle-down" style="font-size: 20px;"></span>');
    newteam.append(newlist);
    let tbox = $(' <div class="collapse" id="collapseExample' + tid + '"> <div class="card card-body"><table class="table" ><thead><tr><th scope="col"></th><th scope="col">团队成员</th><th scope="col">学号</th><th scope="col"></th><th scope="col"></th><th scope="col">操作/组长</th></tr></thead><tbody id="tbox-' + tid + '">    </tbody></table></div></div>');
    $('#team-box').append(newteam, tbox);
    $('#tbox-' + tid + '').append('<tr><th scope="row"></th><td></td><td></td><td></td><td></td><td><i id="add" onclick="signtid(this,' + tid + ')" class="fa fa-plus" aria-hidden="true" style="color: green;"></i><i onclick="del(this)" id="del" class="fa fa-minus ' + tid + '" aria-hidden="true" style="color: red;"></i></td></tr>')
}


//标记模态框
function signtid(self, tid) {

    $(self).attr({
        'data-toggle': 'modal',
        'data-target': '#exampleModal'
    });
    $('#exampleModal').attr('class', 'modal fade ' + tid + '');
}


//删除节点
function del(self) {
    let reg = /[1-9][0-9]*/;
    let tid = $(self).attr('class').match(reg);
    let len = $(self).parent().parent().parent().children().length;
    let sname = $(self).parent().parent().children().get(1).innerHTML;
    let sid = $(self).parent().parent().children().get(2).innerHTML

    if (len == 1) {
        if (($('#team-box').children().length) == 3) {
            $('#empty').show();
        }

        if (($('#tbox-' + tid + '').children().children().get(2).innerHTML) != '') {

            $('#model-box').append('<tr><th scope="row"><div class="form-check"><input class="form-check-input" name="sid" type="checkbox" value="' + sid + '&' + sname + '"></div></th><td>' + sname + '</td><td>' + sid + '</td></tr>');
        }
        $('#' + tid + '').remove();
        $('#collapseExample' + tid + '').remove();
    } else {
        $(self).parent().parent().remove();
        $('#model-box').append('<tr><th scope="row"><div class="form-check"><input class="form-check-input" name="sid" type="checkbox" value="' + sid + '&' + sname + '"></div></th><td>' + sname + '</td><td>' + sid + '</td></tr>');
    }

}

//新增成员
function adds(self) {
    $('input[type="checkbox"]:checked').each(function () {
        let number = /[1-9][0-9]*/;
        let name = /[\u4e00-\u9fa5]+/;
        let student = $(this).val();
        let tid = $('#exampleModal').attr('class').match(number);
        let sid = student.match(number);
        let sname = student.match(name);
        if (($('#tbox-' + tid + '').children().children().get(2).innerHTML) == '') {
            $('#tbox-' + tid + '').children().get(0).remove();
        }

        $(this).parent().parent().parent().remove();
        $('#tbox-' + tid + '').prepend('<tr><th scope="row"></th><td>' + sname + '</td><td>' + sid + '</td><td></td><td></td><td><i id="add" onclick="signtid(this,' + tid + ')" class="fa fa-plus" aria-hidden="true" style="color: green;"></i><i onclick="del(this)" id="del" class="fa fa-minus ' + tid + '" aria-hidden="true" style="color: red;"></i><input onclick="starchange(' + tid + ',\'' + sname + '\')" type="radio" name="leader' + tid + '" value="' + sid + '"></td></tr>')
        $('#' + tid + '').children().text('team:' + sname + '').append('<span class="fa fa-angle-down" style="font-size: 20px;"></span>');
    });
}

//组长设置
function starchange(tid, sname) {
    $('#' + tid + '').children().text('team:' + sname + '').append('<span class="fa fa-angle-down" style="font-size: 20px;"></span>');
}

//班级获取
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