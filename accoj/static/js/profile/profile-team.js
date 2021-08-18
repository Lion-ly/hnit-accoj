$(function () {
    init();
});

function init() {
    getTeamInfo();
}

function getTeamInfo() {
    let data = {
            api: "get_team_info",
        },
        url = "/api/profile_api";
    successFunc = function (data) {
        console.log(data);
    };

    get_data(data, successFunc, url);
}
