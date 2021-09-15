$(document).ready(function () {
    _init_();
    getRedoList();
});
let data = [
    {
        student_no: "18020440112",
        student_class: "软件1801",
        student_name: "何汶强",
        module: "1",
        reason: "做错了",
    },
];
//
function _init_() {
    getClassNameList();
    bindButton($("#rejudge-button"), "/admin/submit_rejudge");
    bindButton($("#course-redo-button"), "/api/course_redo");
}

function bindButton(button, url) {
    function bindFunction() {
        let data = {},
            successFunc = function () {
            },
            messageDivID = "show-tips-box";
        data["course_no"] = $("#courseSelect").val();
        data["class_name"] = $("#classSelect").val();
        data["student_no"] = $("#student_no").val();
        get_data(data, successFunc, url, messageDivID);
    }

    button.click(bindFunction);
}

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

function getRedoList() {
    $("#data-table").DataTable({
        data: data,
        order: [[4, "desc"]],
        paging: false,
        info: "",
        sScrollyY: true,
        columns: [
            {data: "student_no"},
            {data: "student_class"},
            {data: "student_name"},
            {data: "module"},
            {data: "reason"},
            {
                data: null,
                render: function (data, type, row) {
                    let btn =
                        '<button type="button" style="margin-right:10px" class="btn btn-primary btn-sm" >通过</button>' +
                        '<button type="button" class="btn btn-danger btn-sm">拒绝</button>';
                    return btn;
                },
            },
        ],
    });
}
