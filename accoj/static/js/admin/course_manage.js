$(document).ready(function () {
    _init_();
});

function _init_() {
    getClassNameList();
    bindButton($("#rejudge-button"), "/admin/submit_rejudge");
    bindButton($("#course-redo-button"), "/admin/course_redo");
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
            console.log("data:\n" + data)
            for (let i = 0; i < data.length; i++) {
                let className = data[i];
                $("#classSelect").append(new Option(className, className));
            }
        },
        url = "/api/get_class_name_list";
    get_data(data, successFunc, url);
}
