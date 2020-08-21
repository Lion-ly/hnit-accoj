let IntervalOB = "",
    TimeInfos = {},
    IsFirst = true;
$(document).ready(function () {
    _init_();
});

function _init_() {
    getManageTimeInfo();
    $("#save-time").click(submitManageTimeInfo);
    $("#classSelect").change(setRemainingTime);
}

function setRemainingTime() {
    // Set the date we're counting down to
    let nowClass = $("#classSelect").val();
    for (let i = 1; i <= 10; i++) {
        let startTime = "[id=start-time-" + i + "]",
            endTime = "[id=end-time-" + i + "]",
            isOpen = "[id=is_open-" + i + "]";
        remainingTime = "[id=remaining-time-" + i + "]";
        $(startTime).val(TimeInfos[nowClass][i]["start"]);
        $(endTime).val(TimeInfos[nowClass][i]["end"]);
        $(isOpen).prop("checked", TimeInfos[nowClass][i]["is_open"]);
        $(remainingTime).val("");
    }

    // Update the count down every 1 second
    if (IntervalOB) {
        clearInterval(IntervalOB);
    }
    IntervalOB = setInterval(function () {

        // Get today's date and time
        let now = new Date().getTime();

        for (let i = 1; i <= 10; i++) {
            //console.log("TimeInfos[nowClass]: " + TimeInfos[nowClass]);
            let endTime = TimeInfos[nowClass][i]["end"];
            if (!endTime) continue;
            let countDownDate = new Date(endTime),
                // Find the distance between now and the count down date
                distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            let days = Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds = Math.floor((distance % (1000 * 60)) / 1000);
            let $remainingTime = "[id=remaining-time-" + i + "]";
            // Output the result in an element with id="remaining-time-1"
            $($remainingTime).val(days + "天: " + hours + "小时: "
                + minutes + "分: " + seconds + "秒 ");

            // If the count down is over, write some text
            if (distance < 0) {
                clearInterval(IntervalOB);
                $($remainingTime).val("已截止");
            }
        }
    }, 1000);
}


function getManageTimeInfo() {
    function successFunc(data) {
        //console.log("getManageTimeInfo->data: " + data);
        //console.log("getManageTimeInfo->typeof data: " + typeof data);
        data = JSON.parse(data);
        TimeInfos = {};
        let flag = false;
        if (IsFirst) flag = true;
        //console.log("data.length: " + data.length);
        for (let i = 0; i < data.length; i++) {
            let className = data[i]["class_name"],
                time = data[i]["time"];
            if (flag)
                $("#classSelect").append(new Option(className, className));
            TimeInfos[className] = time;
        }
        //console.log("TimeInfos: " + TimeInfos);
        if (flag) IsFirst = false;
        setRemainingTime();
    }

    let data = {"api": "get_manage_time_info"},
        url = "/api/teacher_api";
    get_data(data, successFunc, url)
}

function submitManageTimeInfo() {
    function successFunc(data) {
        data = JSON.parse(data);
        TimeInfos = {};
        if (IsFirst) flag = true;
        for (let i = 0; i < data.length; i++) {
            let className = data[i]["class_name"],
                time = data[i]["time"];
            TimeInfos[className] = time;
        }
        setRemainingTime();
    }

    let nowClassName = $("#classSelect").val(),
        timeInfo = {};
    for (let i = 1; i <= 10; i++) {
        let startTime = "[id=start-time-" + i + "]",
            endTime = "[id=end-time-" + i + "]",
            isOpen = "[id=is_open-" + i + "]";
        let start = $(startTime).val(),
            end = $(endTime).val(),
            is_open = $(isOpen).prop("checked");
        timeInfo[i] = {"start": start, "end": end, "is_open": is_open};
    }
    let data = {"api": "submit_manage_time_info", "time": timeInfo, "class_name": nowClassName},
        url = "/api/teacher_api";
    get_data(data, successFunc, url, "messageInfoBox");
}