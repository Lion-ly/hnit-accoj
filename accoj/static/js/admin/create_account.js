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
        url = "/admin/submit_create_account",
        messageDivID = "show-tips-box",
        data_list = ["student_no", "password", "role", "student_class", "student_faculty", "student_school",
            "student_name", "student_phone", "teacher"];
    for (let i = 0; i < data_list.length; i++)
        data[data_list[i]] = i === 2 ? $("#role").children("option:selected").val() : $("#" + data_list[i]).val();
    get_data(data, successFunc, url, messageDivID);
}