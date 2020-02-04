function gohome() {
	window.location.href = "{{url_for('accoj.index')}}";
}
$(function() {
	$("#register-help").tooltip();
});
$(function() {
	$("#findpwd-help").tooltip();
});