let business_list = Array();
let csrf_token; // csrf令牌全局变量
$(document).ready(function () {
    pwdRevealInit();
    tooltipInit();
    navigationLiInit();
    sideMenuCon();
});

/*	@ 导航当前位置
 *  # courseBase
 *	? 控制导航栏的active，确定当前处于导航栏的位置
 */
/**
 * 导航栏li标签激活状态控制
 */
function navigationLiInit() {
    $("#menu").find("li").each(function (index, item) {
        let $item = $(item),
            href = $item.children().attr("href"),
            pathname = location.pathname.split("_")[0],
            isAddClass = href === pathname;
        if (isAddClass) {
            $item.addClass("active");
        } else {
            $item.removeClass("active");
        }
    });
}

function pwdRevealInit() {
    // 密码显示或隐藏
    $("button[data-reveal]").on('click', function () {
        let $this = $(this),
            $pwd = $this.parent().prev();
        if ($pwd.attr('type') === 'password') {
            $pwd.attr('type', 'text');
        } else {
            $pwd.attr('type', 'password');
        }
    });
}

function tooltipInit() {
    // 初始化tooltip插件
    $('[data-toggle="tooltip"]').tooltip();
}

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
 * 显示提示信息
 * @param id
 * @param message
 * @param message_type danger or info
 * @param timeout ms
 * @param message_head
 */
function show_message(id, message, message_type, timeout, message_head = false) {
    console.log(1111);
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
    console.log("message", $('#' + id));
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
 * 点击提交按钮事件处理
 * @param submit_deal_fun
 */
function show_submit_confirm(submit_deal_fun) {
    let $submit_confirm_button = $("#submit_confirm_button");
    $submit_confirm_button.attr("onclick", submit_deal_fun);
    $submit_confirm_button.attr("disabled", false);
    $("#submit_confirm").modal('show');
}

/**
 * 确认提交事件绑定
 * @param selector
 * @param submit_infoName String
 */
function bind_confirm_info(submit_infoName, selector) {
    function confirmInfo() {
        show_submit_confirm(submit_infoName + "('confirm')");
        let confirm_button = selector;
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

    selector = selector ? selector : $("button[data-confirm]");
    selector.click(function () {
        confirmInfo();
    });
}

/**
 * 保存信息事件绑定
 * @param selector
 * @param submitFunc function
 */
function bind_save_info(submitFunc, selector) {
    function saveInfo() {
        submitFunc("save");
        let save_button = selector;
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

    selector = selector ? selector : $("button[data-save]");
    selector.click(function () {
        saveInfo();
    });
}

/**
 * ajax提交完成
 */
function submit_confirm_clicked() {
    $("#submit_confirm_button").attr("disabled", true);
    // 定时自动关闭
    setTimeout(function () {
        let $submit_confirm = $("#submit_confirm");
        if ($submit_confirm.css("display") === "block")
            $submit_confirm.modal('hide');
    }, 2000);
}

//==================================正则表达式限制输入==================================//
/**
 * input has error
 * @param selector
 * @param errorMessage
 */
function hasError(selector, errorMessage) {
    let $this = selector,
        $thisTag = $this.prop("tagName"),
        $thisPaTag = $this.parent().prop("tagName");
    if (errorMessage) $this.val(errorMessage);
    if ($thisTag === "TR") $this.addClass("danger");
    else if ($thisPaTag === "DIV")
        $this.parent().addClass("has-error");
    else if ($thisPaTag === "LABEL") {
        $this.parent().css({"background": "rgb(242,182,182)"});
        $this.css({"background": "rgb(242,182,182)"});
    } else if ($thisPaTag === "TD")
        $this.css({"background": "rgb(242,182,182)"});
    $this.css("color", "rgb(169, 68, 66)")
}

/**
 * remove input error
 * @param selector
 */
function removeError(selector) {
    let $this = $(selector);
    if ($this.val() === "格式错误") {
        $this.val("");
        $this.css({"color": "", "background-color": ""});
        $this.parent().removeClass("has-error");
    }
    $this.trigger("change");
}

/**
 * remove all input error
 */
function removeAllError() {
    let $inputs = $("div[class=courseBody]").find("input"),
        $trs = $("div[class=courseBody]").find("tr");
    $trs.removeClass("danger");
    $trs.css("color", "");
    $inputs.each(function (index, item) {
        let $this = $(item),
            $thisPaTag = $this.parent().prop("tagName");
        if ($thisPaTag === "DIV" || $thisPaTag === "LABEL" || $thisPaTag === "TD") {
            if ($thisPaTag === "DIV")
                $this.parent().removeClass("has-error");
            else if ($thisPaTag === "LABEL")
                $this.parent().css({"background": ""});
            if ($this.css("color") === "rgb(169, 68, 66)") {
                $this.val("");
                $this.css({"color": "", "background-color": ""});
                $this.parent().removeClass("has-error");
            }
        }
    });
}

/**
 * bind RealNumber
 */
function bindRealNumber(selector) {
    selector = selector ? selector : $("input[data-real-number]");
    selector.each(function (index, item) {
        let $item = $(item);
        $item.change(function () {
            RealNumber(item);
        });
        $item.focus(function () {
            removeError(item);
        })
    });
}

/**
 * bind illegalCharFilter
 */
function bindIllegalCharFilter(selector) {
    selector = selector ? selector : $("input[data-illegal-char]");
    selector.each(function (index, item) {
        $(item).keyup(function () {
            illegalCharFilter(item);
        });
    });
}

/**
 * bind limit_number
 */
function bindLimitNumber(selector) {
    selector = selector ? selector : $("input[data-limit-number]");
    selector.each(function (index, item) {
        $(item).keyup(function () {
            limit_number(item);
        });
    });
}

/**
 * bind limitJieDai
 */
function bindLimitJieDai(selector) {
    selector = selector ? selector : $("input[data-limit-jiedai]");
    selector.each(function (index, item) {
        $(item).keyup(function () {
            limitJieDai(item);
        });
    });
}

/**
 * bind LimitPercent
 */
function bindLimitPercent(selector) {
    selector = selector ? selector : $("input[data-limit-percent]");
    selector.each(function (index, item) {
        let $item = $(item);
        $item.change(function () {
            LimitPercent(item);
        });
        $item.focus(function () {
            removeError(item);
        })
    });
}

/**
 * 限制输入只能为正整数
 * @param selector
 */
function limit_number(selector) {
    let reg = /\D/g;
    $(selector).val($(selector).val().replace(reg, ""));
}

/**
 * 限制输入只能为实数
 * @param selector
 */
function RealNumber(selector) {
    let reg = /^([-+])?\d+(\.\d+)?$/,
        $this = $(selector),
        thisValue = $this.val();
    if (thisValue && !thisValue.match(reg)) hasError($this, "格式错误");
}

/**
 * 限制输入只能为百分比
 * @param selector
 */
function LimitPercent(selector) {
    let reg = /^-?([1-9]\d\d\d|[1-9]\d\d|[1-9]\d|\d)(.\d{1,2})?%$/,
        $this = $(selector),
        thisValue = $this.val();
    if (thisValue && !thisValue.match(reg)) hasError($this, "格式错误");
}

/**
 * 非法字符过滤
 * @param selector
 */
function illegalCharFilter(selector) {
    let reg = /[${}().@%]/g;
    $(selector).val($(selector).val().replace(reg, ""))
}

/**
 * 限制只能输入`借`,`贷`,`平`
 * @param selector
 */
function limitJieDai(selector) {
    let reg = /[借贷平]/g,
        $this = $(selector),
        thisValue = $this.val();
    if ((thisValue && !thisValue.match(reg)) || thisValue.length > 1)
        $this.val("");
}

//==================================提交信息==================================//
/**
 * 提交信息
 * @param submit_type   "confirm" or "save"
 * @param url   like "/submit_info"
 * @param data  post data (JSON)
 * @param messageDivID  show message's divID
 * @param successFunc   success function if post successfully
 * @param failedFunc    success function if post failed
 */
function submit_info(submit_type, url, data, messageDivID, successFunc, failedFunc) {
    failedFunc = failedFunc ? failedFunc : function (data) {
    };
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
                successFunc(data);
            } else {
                if (type_flag === true) {
                    show_message("submit_confirm_message", data["message"], "danger", 1000, "提交失败！");
                } else if (type_flag === false) {
                    show_message(messageDivID, data["message"], "danger", 1000, "保存失败！");
                }
                failedFunc(data);
            }
        },
        error: function (err) {
            show_message(messageDivID, err.statusText, "danger", 1000);
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
            let result = data["result"];
            data = data.hasOwnProperty("data") ? data["data"] : data;
            if (result === true) {
                successFunc(data);


            } else {
                if (messageDivID) {
                    show_message(messageDivID, data["message"], "danger", 1000);
                }

            }
        },
        error: function (err) {

            show_message(messageDivID, err.statusText, "danger", 1000);
            console.log(err.statusText);
        }
    })

}

//==================================提交状态标签控制==================================//
/**
 * 提交状态标签控制
 * @param confirmed
 * @param saved
 * @param spanID
 */
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

/**
 * 显示分数
 * @param nowScore
 * @param nowTotalScore
 * @param totalScore
 * @param nowSelectorNum
 * @param totalSelectorNum
 */
function showScoreEm(nowScore, nowTotalScore, totalScore, nowSelectorNum, totalSelectorNum) {
    function t_reg(className) {
        return (className.match(/(^|\s)acc-score-\S+/g) || []).join(' ');
    }

    let totalClass = "acc-score-",
        nowClass = "acc-score-",
        maxScore = 100,
        $nowSelector = "em[data-now-score",
        $totalSelector = "em[data-total-score";

    $nowSelector = nowSelectorNum ? $nowSelector + "-" + nowSelectorNum : $nowSelector;
    $totalSelector = totalSelectorNum ? $totalSelector + "-" + totalSelectorNum : $totalSelector;
    $nowSelector = $($nowSelector + "]");
    $totalSelector = $($totalSelector + "]");

    if (totalScore) totalClass = totalScore === maxScore ? totalClass + "1" : totalClass + "2";
    else totalClass = totalClass + "3";
    if (nowScore || nowScore === nowTotalScore) nowClass = nowScore === nowTotalScore ? nowClass + "1" : nowClass + "2";
    else nowClass = nowClass + "3";

    nowScore = nowScore == -1 ? '未评分' : parseFloat(nowScore).toFixed(2);
    totalScore = totalScore == -1 ? '未评分' : totalScore.toFixed(2);
    totalScore = "&nbsp;/&nbsp;" + totalScore;
    $nowSelector.removeClass(function (index, className) {
        return t_reg(className);
    }).addClass(nowClass);
    $totalSelector.removeClass(function (index, className) {
        return t_reg(className);
    }).addClass(totalClass);
    $nowSelector.text(nowScore);
    $totalSelector.html(totalScore);
    if ($nowSelector.css("display") === "none") $("em[class*=acc-score]").css("display", "inline");
}

//==================================获取业务列表==================================//
/**
 * 获取业务列表
 */
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
                if (activeNoInt <= minus) {
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
                    let $item = $(item),
                        thisNo = parseInt($item.children().text());
                    if (isPrev) {
                        let textValue;
                        if (isFirstPage) textValue = firstArray[index - 2];
                        else textValue = thisNo - minus;
                        $item.children().text(textValue);
                    } else {
                        let textValue;
                        if (isLastPage) textValue = lastArray[index - 2];
                        else textValue = thisNo + minus;
                        $item.children().text(textValue);
                    }
                }
            });
            activeNoAfter = parseInt($activeLi.children().text());
            callbackFuc(activeNoAfter);
        }

        let $this = $(this),
            $activeLi = $("li[data-page-control][class=active]"),
            prevSpan = $activeLi.prev().children().text(),
            nextSpan = $activeLi.next().children().text(),
            activeNoInt = parseInt($activeLi.children().text()),
            activeNoAfter = activeNoInt,
            clickedSpanNo = $this.children().text();
        // 换页前调用保存按钮
        // $("button[ data-save]").click();
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
            $activeLi.removeClass("active");
            $activeLi.prev().addClass("active");
        } else if (clickedSpanNo === "›") { // 下一题
            if (nextSpan === "›") {
                switchPage(1, maxNo);
                return;
            }
            activeNoAfter += 1;
            $activeLi.removeClass("active");
            $activeLi.next().addClass("active");
        } else {
            activeNoAfter = clickedSpanNoInt;
            $activeLi.removeClass("active");
            $this.addClass("active");
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
    let data = new Blob([arrayBuffer], {type: "application/jpg;charset=UTF-8"});
    console.log(data);
    let downloadUrl = window.URL.createObjectURL(data);
    console.log(downloadUrl);
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
 * 查看答案按钮
 * @param selector
 * @param mapInfo
 * @param mapAnswer
 * @returns
 */
function answerSource(selector, mapInfo, mapAnswer) {
    mapInfo = mapInfo ? mapInfo : function () {
    };
    mapAnswer = mapAnswer ? mapAnswer : function () {
    };
    let thisobj = $(selector);
    let text = thisobj.text();
    if (text === "我的作答") mapInfo("", 1);
    else if (text === "查看答案") mapAnswer();
    thisobj.toggleClass("active");
    text = text === "查看答案" ? "我的作答" : "查看答案";
    thisobj.text(text);
}

function showAnswerButton(selector) {
    selector = selector ? selector : $("button[data-answer]");
    selector.parent().show();
}

/**
 * bind answerSource
 */
function bindAnswerSource(selector, mapInfo, mapAnswer) {
    selector = selector ? selector : $("button[data-answer]");
    $(selector).click(function () {
        answerSource(selector, mapInfo, mapAnswer);
    });
}

/*
 保存和提交按钮禁用
 */
function DisableButton(flag) {
    let $button = $("button[data-save], button[data-confirm]");
    flag = flag ? flag : false;
    $button.prop("disabled", flag);
}

/*
提交教师评分
 */
function commit_correct(data, url, successFunc, messageDivID) {
    /*
       应实现在courseix.js, courseix_2.js, courseix_4.js和 coursex.js中对此函数的调用。
       data: {'title': string, 'category': string, 'score': float};
       url: '/api/commit_correct';
       successFunc: 应实现successFunc回调函数，当提交评分成功时会调用;
       messageDivID: ;
       # title可为{'trend_analysis', 'common_ratio_analysis', 'ratio_analysis', 'dupont_analysis'}中之一;
       # 若为'trend_analysis'或'common_ratio_analysis'， category值应设为'first'（负债表）或'second'（利润表）， 其余情况设为空;
       # score字段应进行检查，当title为'dupont_analysis'时，值应为0<=score<=70，其余情况为0<=score<=5。
     */
    url = url ? url : '/api/commit_correct';
    data = JSON.stringify(data);
    get_info(data, url, successFunc, messageDivID);
}

function bind_score(id, title, messageDivID, category) {
    function click_fun(score) {
        let flag = true;
        category = category ? category : "";
        score = parseFloat(score);
        //'评分不符合规范'
        if (title === "acc_document") {
            let nowBusinessNo = parseInt($("li[data-page-control][class=active]").children().text());
            category = nowBusinessNo;
            if (score < 0 || score > 3) flag = false;
        } else if (title === 'dupont_analysis') {
            if (score < 0 || score > 70) flag = false;
        } else if (["trend_analysis", "common_ratio_analysis", "ratio_analysis"].indexOf(title) != -1) {
            if (score < 0 || score > 5) flag = false;
        } else flag = false;
        if (!flag || !score) {
            show_message(messageDivID, "评分不符合规范", "danger", 2000, "评分失败!");
            return;
        }
        let data = {'title': title, 'category': category, 'score': score},
            successFun = function (data) {
                show_message(messageDivID, data.message, "success", 2000, "评分成功!");
                console.log(data);
            };

        commit_correct(data, '', successFun, messageDivID);
    }

    id = "#" + id;
    $(id).click(function () {
        let score = $($(this).parent().prev()).val();
        click_fun(score);
    });
}

/**
 * 输入替换
 */
function input_replace_on(ev) {
    let sign = $(ev.target).parent().parent().attr("class");
    let startnum = "";
    let input = $('<label><input onblur="input_replace_blur(event)" oninput="limit_input(this)"></label>')

    $("." + sign).hide();
    $("#" + sign).append(input)


    $("." + sign).find("input").each(function (index) {

        if ($(this).val() !== "") {
            startnum = startnum + $(this).val() + ""
        }

    })
    if (startnum !== "") {
        startnum = startnum.slice(0, startnum.length - 2) + "." + startnum.slice(startnum.length - 2)
    }

    $("#" + sign).find("input").val(startnum);
    $("#" + sign).show();
    $("#" + sign).children().children().focus();
}
function input_replace_blur(ev) {
    let sign = $(ev.target).parent().parent().attr("id");
    $("#" + sign).hide();
    $("#" + sign).find('label').remove()
    $("." + sign).show();
    let num = ev.target.value.split('.');
    let i;
    let positive = num[0];
    let decimal = num[1];
    //输入数字填充
    {
        let n = 7;
        //清空
        $("." + sign).find("input").val("");
        //填充正数
        for (i = positive.length - 1; i >= 0; i--) {

            $("." + sign).find("input").eq(n).val(positive[i]);
            n--;
        }


    }
    {

        let n = 8;
        if (decimal) {
            for (i = 0; i < 2; i++) {
                if (decimal[i]) {
                    $("." + sign).find("input").eq(n).val(decimal[i]);
                } else {
                    $("." + sign).find("input").eq(n).val(0);
                }
                n++;
            }
        } else {
            if (ev.target.value.length != 0) {
                $("." + sign).find("input").eq(8).val(0);
                $("." + sign).find("input").eq(9).val(0);
            }

        }


    }
}

/**
 * 限制输入
 * value=value.replace(/[^\-?\d.]/g,'')
 */
var limit = 0;

function limit_input(ev) {
    let num = ev.value.split('.');
    let positive = num[0];
    let decimal = num[1];
    //限制数字输入
    ev.value = ev.value.replace(/[^\-?\d.]/g, '');
    //限制位数输入
    if (num.length > 1) {
        if (decimal.length > 2) ev.value = ev.value.slice(0, positive.length + 3);
    } else {
        if (ev.value.length > 8) ev.value = ev.value.slice(0, 8);
    }
}

/**
 * 侧边弹出按钮
 *
 */
function sideMenuCon() {
    $(".sideBox").hover(function () {
        $(this).stop();
        $(this).animate({right: '-2px'});
    }, function () {
        $(this).stop();
        $(this).animate({right: '-82px'});
    });
    sidehref();
    //绑定重做按钮
    showRedoBox();
    $("button[data-submit-redo]").click(subRedoinfo);
}

//跳转控制
function sidehref() {

    $("#correct").click(function () {
        window.location.href = "teacher/teacher_correct"
    })


}

function getNowCourse() {
    let nowUrl = window.location.href,
        courseNo = nowUrl.split("/")
    switch (courseNo[courseNo.length - 1]) {
        case 'coursei' :
            return '1'
        case 'courseii' :
            return '2'
        case 'courseiii' :
            return '3'
        case 'courseiv' :
            return '4'
        case 'coursev' :
            return '5'
        case 'coursev_2':
            return '5'
        case 'coursevi' :
            return '6'
        case 'coursevii' :
            return '7'
        case 'courseviii' :
            return '8'
        case 'courseix' :
            return '9'
        case 'courseix#' :
            return '9'
        case 'courseix_2' :
            return '9'
        case 'courseix_3' :
            return '9'
        case 'courseix_4' :
            return '9'
        case 'courseix_4#' :
            return '9'
        case 'coursex' :
            return '10'
    }
}
//redo模态框
function showRedoBox() {
    $('#redo').click(function () {
        $("#redoModel").modal('toggle')
    })
}
//提交redo信息
function subRedoinfo() {
    let data = $("#redo_info").serializeArray();
    let redo_info = {};
    data.forEach(function (item) {
        redo_info[item.name] = item.value;
    });
    redo_info["course_no"] = getNowCourse()
    data = JSON.stringify(redo_info)
    let submit_type = "confirm",
        url = "api/submit_redo",
        messageDivID = "redo_message",
        successFunc = function (data) {
            show_message('redo_message', data.message, 'info', 1000);
            // 延时关闭模态框
            setTimeout(function () {
                $("#redoModel").modal('toggle')

            }, 1500);

        },
        failedFunc = function (data) {
            show_message('redo_message', data.message, 'danger', 1000);
            // 延时关闭模态框
            setTimeout(function () {
                $("#redoModel").modal('toggle')

            }, 1500);
        }
    submit_info(submit_type, url, data, messageDivID, successFunc, failedFunc);

}


 