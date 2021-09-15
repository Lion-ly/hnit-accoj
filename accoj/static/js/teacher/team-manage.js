// <reference path="C:/Users/a1375/Desktop/hnit/typings/jquery/jquery.d.ts" />
let IsFirst = true,
    //小组标记
    tid = 0,
    messageDivID = "show-tips-box",
    teamInfos = [];
/**
 * 初始化函数
 */
$(function () {
    getclass();
    bind();
});

function bind() {
    //添加组队按钮
    $("#addteam").click(function () {
        let studentList = $("#studentModal").find("input[type='checkbox']");
        if (studentList.length > 0) {
            signtid(this, tid);
            tid++;
        } else {
            show_message(messageDivID, "已全部分配完成！", "danger", 1000);
        }
    });
    $("#autoteam").click(function () {
        let studentList = $("#studentModal").find("input[type='checkbox']");
        if (studentList.length > 0) {
            autoteam();
        } else {
            show_message(messageDivID, "已全部分配完成！", "danger", 1000);
        }
    });
    $("#subTeam").click(subTeam);
    $("#classSelect").change(function () {
        reflash();
    });
}
function reflash() {
    teamInfos = [];
    $("#studentModal")
        .find("tr")
        .each(function () {
            $(this).remove();
        });
    $("#team-box")
        .children()
        .each(function (index) {
            $(this).remove();
        });
    $("#empty").show();

    getclass();
}

/**
 * 自动组队
 */
function autoteam() {
    //学生列表
    let studentList = $("#studentModal").find("input[type='checkbox']"),
        //组队最大人数
        maxTeamSize = 4,
        //总队伍数
        totalTeam = Math.ceil(studentList.length / maxTeamSize),
        //现有的队伍数
        teamBox = $("#team-box").find("a"),
        //模拟选择
        addStudent = (tid, num) => {
            $("#studentModal").attr("class", "modal fade " + tid + "");
            for (let j = 0; j < num; j++) {
                studentList.eq(j).attr("checked", true);
            }
            //调用添加按钮
            $("#addStudent").click();
        };
    //如果已有队伍，先将已有队伍加满
    if (teamBox.length > 0) {
        teamBox.each(function () {
            studentList = $("#studentModal").find("input[type='checkbox']");
            if (studentList.length > 0) {
                let curTid = $(this).attr("id"),
                    teamLength =
                        $(`#member_box${curTid}`).find("div.member_item").length - 1,
                    addStudentNum = maxTeamSize - teamLength;
                tid = curTid + 1;
                if (addStudentNum > 0) {
                    addStudent(curTid, addStudentNum);
                }
            }
        });
    }
    if (studentList.length > 0) {
        if (totalTeam - teamBox.length > 0) {
            for (let i = 0; i < totalTeam - teamBox.length; i++) {
                studentList = $("#studentModal").find("input[type='checkbox']");
                addStudent(
                    tid,
                    studentList.length > maxTeamSize ? maxTeamSize : studentList.length
                );
                tid++;
            }
        }
    }
}

/**
 * 添加新小组
 * @param {*} tid 小组记号
 */
function newteams(tid) {
    $("#empty").hide();
    let newteam =
            $(`<a id="${tid}" style="width:45%; margin: 0px 15px !important;  height: auto;
  " ></a>`),
        newItem = $(
            `<div class="card-body team_item  align-items-center" > </div>`
        ),
        infoBox = $(
            `<div class="infobox d-flex justify-content-between"  data-toggle="collapse" data-target="#collapseExample${tid}" ></div>`
        )
            .append(`<span id="teamleader_name${tid}">Newteam:</span>`)
            .append(
                `<span class="fa fa-angle-down" style="font-size: 20px;"></span>`
            ),
        tbox = $(
            ` <div class="collapse" id="collapseExample${tid}">
        <div id="member_box${tid}" class="member_box"></div>
    </div>
    `
        );
    newItem.append(infoBox, tbox);
    newteam.append(newItem);
    $("#team-box").append(newteam);
    let add = $(
        `<div id="add" class="member_item" onclick="signtid(this,${tid})">
        <svg t="1627964484820" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2622" width="128" height="128">
        <path d="M810.666667 554.666667H554.666667v256h-85.333334V554.666667H213.333333v-85.333334h256V213.333333h85.333334v256h256v85.333334z" p-id="2623" fill="#bfbfbf"></path>
        </svg>
    </div>`
    );
    $("#member_box" + tid + "").append(add);
    teamInfos[tid] = {
        leader_name: "",
        leader_no: "",
        members: [],
    };
}

/**
 * 标记模态框
 * @param {*} self dom对象的this
 * @param {*} tid 小组标记
 */
function signtid(self, tid) {
    $(self).attr({
        "data-toggle": "modal",
        "data-target": "#studentModal",
    });
    $("#studentModal").attr("class", "modal fade " + tid + "");
}

/**
 * 删除节点
 * @param {*} self 删除图标的this
 */
function del(self) {
    let reg = /[0-9][0-9]*/,
        tid = $(self).attr("class").match(reg),
        len = $("#member_box" + tid + "").children().length,
        //获取学生信息
        sname = $(self).parent().children().get(0).innerHTML,
        sid = $(self).parent().children().get(1).innerHTML;
    if (len == 2) {
        //若为最后一名队员则删除队伍
        $("#model-box").append(
            `<tr>
        <th scope="row">
        <div class="form-check">
             <input class="form-check-input" name="sid" type="checkbox" value="${sid}&${sname}">
        </div>
        </th>
        <td>${sname}</td>
        <td>${sid}</td>
      </tr>`
        );
        $("#" + tid + "").remove();
        teamInfos.splice(tid, 1);
        console.log(teamInfos);
        $("#collapseExample" + tid + "").remove();
        //若没有队伍则显示空提示
        if ($("#team-box").children().length == 0) {
            $("#empty").show();
        }
    } else {
        //判断删除的是否为组长
        let isTeamLeader =
            $(`input[name='tlc_${tid}']:checked`).val().split("&")[0] === sname;
        $(self).parent().remove();
        $("#model-box").append(
            `<tr>
        <th scope="row">
        <div class="form-check">
            <input class="form-check-input" name="sid" type="checkbox" value="${sid}&${sname}">
        </div>
        </th>
        <td>${sname}</td>
        <td>${sid}</td>
      </tr>
      `
        );
        //若删除的为组长则设置第一个为组长
        if (isTeamLeader) {
            (teamInfos[+tid].leader_name = ""), (teamInfos[+tid].leader_no = "");
            $(`input[name='tlc_${tid}']`).get(0).click();
        }
        teamInfos[+tid].members.forEach(function (item, index) {
            if (item[1] === sid) {
                teamInfos[+tid].members.splice(index, 1);
                return;
            }
        });
    }
}
/**
 * 新增成员
 *
 */
function prependMember(tid, sname, sid, tlName) {
    let new_member_box = $(`
  <div class="member_item">
    <div class="student_name student_msg">${sname}</div>
    <div class="student_no student_msg">${sid}</div>
    <i class="fa fa-minus-circle del ${tid}" onclick='del(this)' aria-hidden="true"></i>
    
  </div>
`);
    if (sname === tlName) {
        new_member_box.append(
            `<input onclick='starchange(${tid},this)' type="radio" checked  name='tlc_${tid}' value='${sname}&${sid}'  class="team_leader_check">`
        );
    } else {
        new_member_box.append(
            `<input onclick='starchange(${tid},this)' type="radio"   name='tlc_${tid}' value='${sname}&${sid}'  class="team_leader_check">`
        );
    }

    $("#member_box" + tid + "").prepend(new_member_box);
    $("#teamleader_name" + tid + "").text("team:" + tlName + "");
}
/**
 * 添加小组成员
 */
function adds() {
    let number = /[1-9][0-9]*/,
        name = /[\u4e00-\u9fa5]+/,
        tid = +$("#studentModal").attr("class").match(number),
        studentSelect = $('input[type="checkbox"]:checked');
    if (studentSelect.length > 0) {
        if (!$(`#${tid}`)[0]) {
            newteams(tid);
        }
        studentSelect.each(function () {
            let student = $(this).val(),
                sid = student.split("&")[0],
                sname = student.split("&")[1];

            teamInfos[+tid].leader_name = sname;
            teamInfos[+tid].leader_no = sid;
            teamInfos[tid].members.unshift([sname + "", sid + ""]);
            $(this).parent().parent().parent().remove();
            //添加到团队信息数组
            prependMember(tid, sname, sid, sname);
        });
    }
}

/**
 * 组长设置
 * @param {*} tid 小组标记
 * @param {*} self radio选择框this
 */
function starchange(tid, self) {
    let teamLeaderName = $(self).val().split("&")[0],
        teamLeaderno = $(self).val().split("&")[1];
    teamInfos[+tid].leader_name = teamLeaderName;
    teamInfos[+tid].leader_no = teamLeaderno;
    $("#teamleader_name" + tid + "").text("team:" + teamLeaderName + "");
}

/**
 * 班级获取
 */
function getclass() {
    function successFunc(data) {
        data = JSON.parse(data);

        let flag = false;
        if (IsFirst) flag = true;
        for (let i = 0; i < data.length; i++) {
            let className = data[i]["class_name"];

            if (flag) {
                $("#classSelect").append(new Option(className, className));
            }
        }
        if (flag) IsFirst = false;
        getClassTeamInfo(); //获取未分组的学生和已分组的
    }

    let data = {api: "get_manage_time_info"},
        url = "/api/teacher_api";
    get_data(data, successFunc, url);
}
/**
 * 获取班级队伍信息
 */
function getClassTeamInfo() {
    let nowClassName = $("#classSelect").find("option:selected").val();
    let successFunc = (data) => {
        if (data.team_info) {
            data.team_info.forEach((element, index) => {
                newteams(index);
                tid = index + 1;
                let tlName = element.leader_name,
                    tlNo = element.leader_no;
                teamInfos[index].leader_name = tlName;
                teamInfos[index].leader_no = tlNo;
                teamInfos[index].members = element.member;

                element.member.forEach((element) => {
                    prependMember(index, element[0], element[1], tlName);
                });
            });
        }

        if (data.student_info) {
            data.student_info.forEach((element) => {
                $("#model-box").append(` 
      <tr>
        <th scope="row">
            <div class="form-check">
                <input class="form-check-input" name="sid" type="checkbox"
                    value="${element.student_no}&${element.student_name}">
            </div>
        </th>
        <td>${element.student_name}</td>
        <td>${element.student_no}</td>
      </tr>
      `);
            });
        }
    };
    let data = {api: "no_group_student", class_name: nowClassName},
        url = "/api/teacher_api";
    get_data(data, successFunc, url);
}

function subTeam() {
    let nowClassName = $("#classSelect").find("option:selected").val(),
        data = {
            api: "submit_manage_group_info",
            class_name: nowClassName,
            team_infos: teamInfos.filter(function (e) {
                return e;
            }), //过滤空元素
        },
        url = "/api/teacher_api",
        successFunc = function (data) {
            // reflash();
        };
    get_data(data, successFunc, url, messageDivID);
}
