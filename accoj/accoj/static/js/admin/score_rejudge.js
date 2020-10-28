$(document).ready(function () {
    _init_();
});

function _init_() {
    getClassNameList();
    $("#rejudge-button").click(submitRejudge);
}

function submitRejudge() {
    let data = {},
        successFunc = function () {

        },
        url = "/admin/submit_rejudge",
        messageDivID = "show-tips-box";
    data["course_no"] = $("#courseSelect").val();
    data["class_name"] = $("#classSelect").val();
    data["student_no"] = $("#student_no").val();
    get_data(data, successFunc, url, messageDivID);
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