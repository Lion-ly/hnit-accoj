let business_list = Array();
/*	@ 导航当前位置
 *  # courseBase
 *	? 控制导航栏的active，确定当前处于导航栏的位置
 */
let csrf_token;
$(function () {
    $("#menu").find("li").each(function (index, item) {
        let href = $(item).children().attr("href"),
            pathname = location.pathname.split("_")[0],
            isAddClass = href === pathname;
        if (isAddClass) {
            $(item).addClass("active");
        } else {
            $(item).removeClass("active");
        }
    });
});

// 初始化tooltip插件
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

/*	@ 返回首页
 *  # base -> 会计实训系统Accountiong training system
 *	? 页面跳转
 */
function gohome() {
    window.location.href = "{{url_for('index.index')}}";
}


/*	@ 信息提示
 *	# base -> 注册/忘记了
 *	? 密保邮箱提示信息
 */
$(function () {
    $("#register-help").tooltip();
});
$(function () {
    $("#findpwd-help").tooltip();
});


/*	@ 验证码
 *	# base -> 注册/忘记了
 *	? "发送验证码"->"重发x(s)"
 */
function getVCode(obj) {
    let $obj = $(obj);
    let second = 60;
    if (check_email($('#login-email').val())) {
        let stop = setInterval(
            function () {
                if (second > 0) {
                    $obj.attr("disabled", true);
                    let message = "重发(" + second + "s)";
                    $obj.text(message);
                    second--;
                } else {
                    clearTimeout(stop);
                    $obj.text("发送验证码");
                    $obj.attr("disabled", false);
                }
            }
            , 1000);
    } else {
        show_message("login_form", "请输入正确的邮箱", "warning", 2000)
    }
}

function findgetVCode(obj) {
    let $obj = $(obj);
    let second = 60;
    if (check_email($('#findpwd-email').val())) {
        let stop = setInterval(
            function () {
                if (second > 0) {
                    $obj.attr("disabled", true);
                    let message = "重发(" + second + "s)";
                    $obj.text(message);
                    second--;
                } else {
                    clearTimeout(stop);
                    $obj.text("发送验证码");
                    $obj.attr("disabled", false);
                }
            }
            , 1000);
    } else {
        show_message("findpwd_form", "请输入正确的邮箱", "warning", 2000)
    }
}


/*
验证邮箱格式
 */

function check_email(email) {
    let myreg = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    return myreg.test(email);
}

/**
 *
 * @param id
 * @param message
 * @param message_type danger or info
 * @param timeout ms
 * @param message_head
 */
function show_message(id, message, message_type, timeout, message_head = false) {
    if (document.getElementById("show_message")) $("#show_message").remove();
    let div_content_base = "<div class='alert alert-" + message_type + "' id='show_message' style='text-align: center;display: none;margin-top: 20px;'> <strong>";
    let type = "提示！";
    if (message_type === "danger") {
        type = "错误！";
    } else if (message_type === "warning") {
        type = "警告！";
    }
    if (message_head) {
        type = message_head;
    }
    let div_content = div_content_base + type + "</strong>" + message + "</div>";
    $('#' + id).append(div_content);
    let show_message_tmp = $('#show_message');
    // 淡入效果
    show_message_tmp.fadeIn(timeout);
    // 淡出效果
    setTimeout(function () {
        show_message_tmp.fadeOut(timeout);
    }, timeout * 1.5);
    // 移除div(重复使用)
    setTimeout(function () {
        show_message_tmp.remove()
    }, timeout * 2.5);
}

/**
 * 点击提交按钮
 * @param submit_deal_fun
 */
function show_submit_confirm(submit_deal_fun) {
    $("#submit_confirm_button").attr("onclick", submit_deal_fun);
    $("#submit_confirm_button").attr("disabled", false);
    $("#submit_confirm").modal('show');
}

/**
 * 将处理函数绑定到模态框的确认提交按钮
 * @param buttonID
 * @param submit_infoName String
 */
function bind_confirm_info(buttonID, submit_infoName) {
    show_submit_confirm(submit_infoName + "('confirm')");
    let confirm_button = $("#" + buttonID);
    confirm_button.attr("disabled", true);
    confirm_button.text("提交 2s");
    setTimeout(function () {
        confirm_button.text("提交 1s");
    }, 1000);
    setTimeout(function () {
        confirm_button.attr("disabled", false);
        confirm_button.text("提交");
    }, 2000);
}

/**
 * 保存信息
 * @param buttonID
 * @param submit_info function
 */
function bind_save_info(buttonID, submit_info) {
    submit_info("save");
    let save_button = $("#" + buttonID);
    save_button.attr("disabled", true);
    save_button.text("保存 2s");
    setTimeout(function () {
        save_button.text("保存 1s");
    }, 1000);
    setTimeout(function () {
        save_button.attr("disabled", false);
        save_button.text("保存");
    }, 2000);
}

/**
 * ajax提交完成
 */
function submit_confirm_clicked() {
    $("#submit_confirm_button").attr("disabled", true);
    // 定时自动关闭
    setTimeout(function () {
        $("#submit_confirm").modal('hide');
    }, 3000)
}

//==================================正则表达式限制输入==================================//

/**
 * 限制输入只能为正整数
 * @param obj
 */
function limit_number(obj) {
    let reg = /\D/g;
    $(obj).val($(obj).val().replace(reg, ""));
}

/**
 * 限制输入只能为实数
 * @param obj
 */
function RealNumber(obj) {
    let reg = /^([-+])?\d+(\.\d+)?$/,
        thisValue = $(obj).val();
    if (thisValue && !thisValue.match(reg))
        $(obj).val(0);
}

/**
 * 限制输入只能为百分比
 * @param obj
 */
function LimitPercent(obj) {
    let reg = /^-?(100|[1-9]\d|\d)(.\d{1,2})?%$/,
        thisValue = $(obj).val();
    if (thisValue && !thisValue.match(reg))
        $(obj).val("0%");
}

/**
 * 非法字符过滤
 * @param obj
 */
function illegalCharFilter(obj) {
    let reg = /[${}().@%]/g;
    $(obj).val($(obj).val().replace(reg, ""))
}

/**
 * 限制只能输入`借`,`贷`,`平`
 * @param obj
 */
function limitJieDai(obj) {
    let reg = /[借贷平]/g;
    let thisValue = $(obj).val();
    if ((thisValue && !thisValue.match(reg)) || thisValue.length > 1)
        $(obj).val("");
}

//==================================提交信息==================================//
/**
 * 提交信息
 * @param submit_type   "confirm" or "save"
 * @param url   like "/submit_info"
 * @param data  post data (JSON)
 * @param messageDivID  show message's divID
 * @param successFunc   success function if post successfully
 */
function submit_info(submit_type, url, data, messageDivID, successFunc) {
    let type_flag = null;
    if (submit_type === "confirm") {
        type_flag = true;
    } else if (submit_type === "save") {
        type_flag = false;
    } else {
        return;
    }
    let csrf_token = get_csrf_token();

    $.ajax({
        url: url,
        type: "post",
        data: data,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        cache: false,
        async: true,
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        },
        success: function (data) {
            if (data["result"] === true) {
                if (type_flag === true) {
                    show_message("submit_confirm_message", "提交成功！", "info", 1000);
                } else if (type_flag === false) {
                    show_message(messageDivID, "保存成功！", "info", 1000);
                }
                successFunc(true);
            } else {
                if (type_flag === true) {
                    show_message("submit_confirm_message", data["message"], "danger", 1000, "提交失败！");
                } else if (type_flag === false) {
                    show_message(messageDivID, data["message"], "danger", 1000, "保存失败！");
                }
            }
        },
        error: function (err) {
            console.log(err.statusText);
        },
        complete: function () {
            if (type_flag)
                submit_confirm_clicked();
        }
    });
}

//==================================获取信息==================================//
/**
 * 从后端获取信息
 * @param data  post data (JSON)
 * @param url   like "/submit_info"
 * @param successFunc   success function if post successfully
 * @param messageDivID  show message's divID
 */
function get_info(data, url, successFunc, messageDivID) {
    data = data ? data : {};
    let csrf_token = get_csrf_token();

    $.ajax({
        url: url,
        type: "post",
        data: data,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        cache: false,
        async: true,
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        },
        success: function (data) {
            if (data["result"] === true) {
                successFunc(data);
            } else {
                if (messageDivID)
                    show_message(messageDivID, data["message"], "danger", 1000);
            }
        },
        error: function (err) {
            console.log(err.statusText);
        }
    })
}

//==================================提交状态标签控制==================================//
function spanStatusCtr(confirmed, saved, spanID) {
    // 如果已保存过则显示标签为保存状态，已提交过则更改标签为已提交标签

    let $span = $("#" + spanID);
    if (confirmed || saved) {
        // 初始化为saved
        let span_text = "已保存";
        let span_color = "#5bc0de";
        if (confirmed) {
            span_text = "已完成";
            span_color = "#5cb85c";
        }
        $span.css("color", span_color);
        $span.text(span_text);
        $span.show();
    } else {
        $span.hide();
    }
}

//==================================获取业务列表==================================//
function getBusinessList() {
    function successFunc(data) {
        business_list = data["business_list"];
        businessLiControl(1);
    }

    get_info({}, "/get_business_list", successFunc, "");
}

//==================================业务分页控制==================================//
/**
 * 分页事件绑定
 * @param callbackFuc
 * @param maxPage
 */
function pageSplitBind(callbackFuc, maxPage = 20) {
    $("li[data-page-control]").click(function () {
        let maxNo = maxPage,
            lis = $("li[data-page-control]"),
            liLen = lis.length,
            maxLen = liLen - 4,
            firstSpanNo = parseInt($(lis[2]).children().text()),
            lastSpanNo = parseInt($(lis[maxLen - 2]).children().text());

        function switchPage(minus, maxNo) {
            let isPrev = true,
                ii = maxLen,
                jj = 0,
                isFirstPage = false,
                isLastPage = false,
                firstArray = [...Array(maxLen)].map(_ => ++jj),
                lastArray = [...Array(maxLen)].map(_ => maxNo - --ii);
            if (clickedSpanNo === "‹") {
                if (activeNoInt < minus) {
                    return;
                }
            }
            if (clickedSpanNo === "«") {
                if (activeNoInt <= 2 * minus) {
                    if (firstSpanNo !== 1) isFirstPage = true;
                    else return;
                }
            }
            if (clickedSpanNo === "›") {
                isPrev = false;
                if (activeNoInt + minus > maxNo) {
                    return;
                }
            }
            if (clickedSpanNo === "»") {
                isPrev = false;
                if (activeNoInt + minus * 2 > maxNo) {
                    if (lastSpanNo !== maxNo) isLastPage = true;
                    else return;
                }
            }
            $("li[data-page-control]").each(function (index, item) {
                if (index > 1 && index < maxLen + 2) {
                    let thisNo = parseInt($(item).children().text());
                    if (isPrev) {
                        let textValue = "";
                        if (isFirstPage) textValue = firstArray[index - 2];
                        else textValue = thisNo - minus;
                        $(item).children().text(textValue);
                    } else {
                        let textValue = "";
                        if (isLastPage) textValue = lastArray[index - 2];
                        else textValue = thisNo + minus;
                        $(item).children().text(textValue);
                    }
                }
            });
            activeNoAfter = parseInt($(activeLi).children().text());
            callbackFuc(activeNoAfter);
        }

        let activeLi = $("li[data-page-control][class=active]"),
            prevSpan = $(activeLi).prev().children().text(),
            nextSpan = $(activeLi).next().children().text(),
            activeNoInt = parseInt($(activeLi).children().text()),
            activeNoAfter = activeNoInt,
            clickedSpanNo = $(this).children().text();

        let clickedSpanNoInt = parseInt(clickedSpanNo);
        if (clickedSpanNoInt === activeNoInt) return;

        if (clickedSpanNo === "«" || clickedSpanNo === "»") {
            switchPage(maxLen, maxNo);
            return;
        }

        if (clickedSpanNo === "‹") {       // 上一题
            if (prevSpan === "‹") {
                switchPage(1, maxNo);
                return;
            }
            activeNoAfter -= 1;
            activeLi.removeClass("active");
            activeLi.prev().addClass("active");
        } else if (clickedSpanNo === "›") { // 下一题
            if (nextSpan === "›") {
                switchPage(1, maxNo);
                return;
            }
            activeNoAfter += 1;
            activeLi.removeClass("active");
            activeLi.next().addClass("active");
        } else {
            activeNoAfter = clickedSpanNoInt;
            activeLi.removeClass("active");
            $(this).addClass("active");
        }
        callbackFuc(activeNoAfter);
    });
}

/**
 * 业务分页内容控制
 */
function businessLiControl(business_no) {
    // 填充业务信息
    let business_index = business_no - 1,
        content = business_list[business_index]["content"],
        business_type = business_list[business_index]["business_type"];
    let em_no = business_index + 1;
    // 填充业务编号
    em_no = em_no < 10 ? "0" + em_no : em_no;
    $("#em_no").text(em_no);
    // 填充活动类型
    let $business_type = $("#business_type");
    $business_type.removeClass();
    let business_class = "label label-" + "success"; //  初始化为筹资活动
    if (business_type === "投资活动") {
        business_class = "label label-" + "info";
    } else if (business_type === "经营活动") {
        business_class = "label label-" + "warning";
    }
    $business_type.addClass(business_class);
    $business_type.text(business_type);

    // 填充业务内容
    $("#business_content").text(content);
}

/**
 * 将arrayBuffer转为Blob并下载
 * @param arrayBuffer
 * @param filename
 */
function downloadFile(arrayBuffer, filename) {
    let tmp = filename.split(",");
    let type = tmp[tmp.length - 1];
    type = type === "zip" ? type : "x-rar-compressed";
    let data = new Blob([arrayBuffer], {type: "application/" + type + ";charset=UTF-8"});
    let downloadUrl = window.URL.createObjectURL(data);
    let anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(data);
}

/**
 * UTC dat to yyyy-mm-dd
 * @param date
 * @returns {string}
 */
function formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

/**
 * 查看答案按钮的效果 具体功能实现需重构
 * @param obj
 * @returns
 */
function answer_source(obj) {
    let thisobj = $(obj);
    thisobj.toggleClass("active");
    let text = thisobj.text();
    text = text === "查看答案" ? "我的作答" : "查看答案";
    thisobj.text(text);
}