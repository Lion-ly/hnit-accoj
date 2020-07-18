$(document).ready(function () {
    function bind_e() {
        $("button[data-save]").click(function () {
            save_user_profile();
        });
    }

    get_user_profile();
    bind_e();
});


function get_user_profile() {
    function successFunc(data) {
        set_user_profile(data);
    }

    let data = {api: 'get_user_profile'};
    get_data(data, successFunc, '/api/profile_api');
}

function save_user_profile() {
    function get_form() {

        let data = {
            nick_name: $("input[data-nick_name]").val(),
            student_no: $("p[data-student_no]").text(),
            student_name: $("p[data-student_name]").text(),
            email: $("p[data-email]").text(),
            personalized_signature: $("textarea[data-personalized_signature]").val(),
            student_sex: $("input:radio[name=student_sex]:checked").val(),
            student_borth: $("input[data-student_borth]").val(),
            student_school: $("p[data-student_school]").text(),
            student_faculty: $("p[data-student_faculty]").text(),
            student_class: $("p[data-student_class]").text(),
        };
        return data;
    }

    let data = get_form(),
        successFunc = function (_data) {
        };
    data.api = 'submit_user_profile';
    get_data(data, successFunc, '/api/profile_api', 'show-tips-box');
}

function set_user_profile(data) {
    $("input[data-nick_name]").val(data.nick_name);
    $("p[data-student_no]").text(data.student_no);
    $("p[data-student_name]").text(data.student_name);
    $("p[data-email]").text(data.email);
    $("textarea[data-personalized_signature]").text(data.personalized_signature);
    try {
        $("input:radio[name=student_sex][value=" + data.student_sex + "]").prop('checked', true);
    } catch (error) {
        console.error();
    }
    $("input[data-student_borth]").val(data.student_borth);
    $("p[data-student_school]").text(data.student_school);
    $("p[data-student_faculty]").text(data.student_faculty);
    $("p[data-student_class]").text(data.student_class);
}