window.translate = [];
var language = "en";
if (language == "auto"){
	language = navigator.language;
}
window.language = language;
$LAB.script('config/lang/' + window.language + '.js')
		.script('whapps/auth/auth/lang/' + window.language + '.js')
		.script('config/config.js').wait();

