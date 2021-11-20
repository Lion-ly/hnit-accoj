$(document).ready(function () {
    _init_();
    getRedoList();
});
function _init_() {
    getClassNameList();
}
/**
 * 提交绑定
 *
 * @param {*} url 提交url
 * @param {*} type  'agree'或'confuse'
 * @param {*} ifclass 是否班级提交默认false
 */

function bindButton(url, type, ifclass) {
    let e = window.event || arguments.callee.caller.arguments[0];
    let button = $(e.target);
    let row = button.parents("tr");
    // function bindFunction() {
    //     let data = {},
    //         successFunc = function () {

    //         },
    //         messageDivID = "show-tips-box";
    //     data["course_no"] = $("#courseSelect").val();
    //     data["class_name"] = $("#classSelect").val();
    //     data["student_no"] = $("#student_no").val();
    //     get_data(data, successFunc, url, messageDivID);
    // }
    ifclass = ifclass ? ifclass : false;

    function conBtn() {
        let data = {},
            successFunc = function () {
            },
            messageDivID = "show-tips-box";

        if (!ifclass) {
            data["team_class"] = "0";
            data["course_no"] = $("#data-table")
                .DataTable()
                .row(row)
                .data().course_no;
            data["team_no"] = $("#data-table").DataTable().row(row).data().team_no;
            data["submit_type"] = type;
        } else {
            data["course_no"] = $("#courseSelect").val();
            data["team_class"] = $("#classSelect").val();
            data["team_no"] = "0";
            $("#reodo_Class_Modal").modal("hide");
            $(".modal-backdrop").remove();
        }
        get_data(data, successFunc, url, messageDivID);
        $("#data-table").DataTable().row(row).remove().draw(false);
    }

    conBtn();
}
/**
 * 获取班级信息
 */

function getClassNameList() {
    let data = {},
        successFunc = function (data) {
            data = JSON.parse(data);
            for (let i = 0; i < data.length; i++) {
                let className = data[i];
                $("#classSelect").append(new Option(className, className));
            }
        },
        url = "/api/get_class_name_list";
    get_data(data, successFunc, url);
}
/**
 * 获取重做申请的学生的信息
 */

function getRedoList() {
    let data = {api: "get_reform_infos"},
        url = "/api/teacher_api",
        redo_infos = [],
        successFunc = function (data) {
            data = JSON.parse(data);
            data.forEach(function (item) {
                redo_infos.push(item);
            });
            //渲染列表
            $("#data-table").DataTable({
                data: redo_infos,
                order: [[4, "desc"]],
                paging: false,
                info: "",
                sScrollyY: true,
                columns: [
                    {data: "team_no"},
                    {data: "team_name"},
                    {data: "team_student"},
                    {data: "team_class"},
                    {data: "time"},
                    {data: "course_no"},
                    {data: "reason"},
                    {
                        data: null,
                        render: function (data, type, row) {
                            let btn =
                                '<button type="button" style="margin-right:10px" class="btn btn-primary btn-sm" redo-agree-button onclick=\'bindButton("/api/course_reform", "agree")\' >通过</button>' +
                                '<button type="button" class="btn btn-danger btn-sm" redo-refuse-button onclick=\'bindButton("/api/course_reform", "refuse")\'>拒绝</button>';
                            return btn;
                        },
                    },
                ],
            });
        };

    //获取数据
    get_data(data, successFunc, url);
}
