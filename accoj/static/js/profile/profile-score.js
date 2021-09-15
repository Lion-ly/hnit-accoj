$(document).ready(function () {
  getUserScore();
});

/**
 *  获取用户成绩
 */
function getUserScore() {
    let data = {api: "get_user_score"},
        url = "/api/profile_api",
        successFunc = function (_data) {
            try {
                plotScoreChart(_data[0], "myScore");
            } catch (error) {
            }

            plotScoreChart(_data[1], "teamScore");
        };
    get_data(data, successFunc, url);
}

/**
 * 绘制图表
 * @param {*} _data
 */
function plotScoreChart(_data, id) {
    let dateArray = _data,
        sum = dateArray.reduce((a, b) => a + b),
        backgroundColor = Array(),
        c1 = "rgba(255, 99, 132, 0.6)",
        c2 = "rgba(153, 102, 255, 0.6)",
        c3 = "rgba(54, 162, 235, 0.6)",
        c4 = "rgba(75, 192, 192, 0.6)",
        c5 = "rgba(255, 206, 86, 0.6)",
        c6 = "rgba(231, 76, 60, 0.6)";
    dateArray.forEach(function (value) {
        if (value === 100) backgroundColor.push(c1);
        else if (value >= 90) backgroundColor.push(c2);
        else if (value >= 80) backgroundColor.push(c3);
        else if (value >= 70) backgroundColor.push(c4);
        else if (value >= 60) backgroundColor.push(c5);
        else backgroundColor.push(c6);
    });
    let options = {
        responsive: true,
        title: {
            display: true,
            text: "总得分: " + sum + " / 1000",
        },
        legend: {
            display: true,
            position: "left",
            labels: {
                boxWidth: 80,
                fontColor: "rgb(60, 180, 100)",
            },
        },
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        },
    };
    // Get the context of the canvas element we want to select
    let ctx = document.getElementById(id).getContext("2d");
    let data = {
        labels: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"],
        datasets: [
            {
                label: "分数",
                data: dateArray,
                backgroundColor: backgroundColor,
            },
        ],
    };
    new Chart(ctx, {
        type: "bar",
        data: data,
        options: options,
    });
}
