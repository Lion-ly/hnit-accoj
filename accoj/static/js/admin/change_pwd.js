$(document).ready(function () {
    _init_();
});

function _init_() {
    $("#submit-button").click(submitAccountInfo);
}

function submitAccountInfo() {
    let data = {},
        successFunc = function () {

        },
        url = "/admin/submit_change_pwd",
        messageDivID = "show-tips-box";
    data["student_no"] = $("#student_no").val();
    data["password"] = $("#password").val();
    get_data(data, successFunc, url, messageDivID);
}