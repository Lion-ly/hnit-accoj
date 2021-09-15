$(function () {
    init();
});

function init() {
    getTeamInfo();
    $("#changeTeamName").click(toggleInputBox);
    $("#sureChangeTeamName").click(changeTeanName);
}

function toggleInputBox() {
    $("#teamInput").show();
    $("#teamInfo").hide();
}

function changeTeanName() {
    let teamInputInfo = $("#teamNameInput").val();

    let data = {
            api: "submit_team_infos",
            team_name: teamInputInfo,
        },
        url = "/api/profile_api";
    successFunc = function (data) {
        $(".team-title")[0].innerHTML = `<a> 团队:${teamInputInfo}<a>`;
        $("#teamInput").hide();
        $("#teamInfo").show();
    };

    get_data(data, successFunc, url);
}

function getTeamInfo() {
    let data = {
            api: "get_team_info",
        },
        url = "/api/profile_api";
    successFunc = function (data) {
        console.log(data);
        $(".team-title")[0].innerHTML = `<a> 团队:${data.team_name}<a>`;
        data.member.forEach(function (element) {
            let item = `
      <div class="member-item">
        <div class="member-info">
          <div class="item name">${element[0]}</div>
          <div class="item no">${element[1]}</div>
        </div>
        
      </div>
    `;
            let itemLeader = `
    <div class="member-item">
      <i class="fa fa-star leader-sign"></i>
      <div class="member-info">
        <div class="item name">${element[0]}</div>
        <div class="item no">${element[1]}</div>
      </div>
      
    </div>
  `;
            if (element[0] === data.leader_name && element[1] === data.leader_no) {
                $("#member-box").append(itemLeader);
            } else {
                $("#member-box").append(item);
            }
        });
    };

    get_data(data, successFunc, url);
}
