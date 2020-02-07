/*	@ 返回首页
 *  # base -> 会计实训系统Accountiong training system
 *	? 页面跳转
 */
function gohome() {
	window.location.href = "{{url_for('accoj.index')}}";
}


/*	@ 信息提示
 *	# base -> 注册/忘记了
 *	? 密保邮箱提示信息
 */
$(function() {
	$("#register-help").tooltip();
});
$(function() {
	$("#findpwd-help").tooltip();
});


/*	@ 验证码
 *	# base -> 注册/忘记了
 *	? "发送验证码"->"重发x(s)"
 */
function getVCode(obj){
	var $obj=$(obj);
	var second = 10;
	var stop = setInterval(
		function(){
			if(second>0){
				$obj.attr("disabled", true);
				var message = "重发("+second+"s)";
				$obj.text(message);
				second--;	
			}else{
				clearTimeout(stop);
				$obj.text("发送验证码");
				$obj.attr("disabled", false);
			}
		}
	,1000); 
}



