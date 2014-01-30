window.translate = [];
// Set your language value here
var language = "en";
if (language == "auto"){
	language = navigator.language;
}
window.language = language;
$LAB.script('config/lang/' + window.language + '.js')
		.script('whapps/auth/auth/lang/' + window.language + '.js')
		.script('whapps/voip/voip/lang/' + window.language + '.js')
		.script('config/config.js').wait();

