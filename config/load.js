window.translate = [];
// Set your language value here
var language = 'en';

if (language == 'auto'){
	language = navigator.language;
}

window.language = language;

_t = function(module, param){				//Global function translate
	if(module && param) {
		response = window.translate[module][param]
	}
	else {
		console.log('i18n field missing: ' + module + '.' + param);

		response = '';
	}

	return response;
};

var langUrls = [
	'config',
	'whapps/accounts/accounts_manager',
	'whapps/auth/auth',
	'whapps/auth/onboarding',
	'whapps/call_center/dashboard',
	'whapps/call_center/queue',
	'whapps/core/layout',
	'whapps/core/linknav',
	'whapps/core/whappnav',
	'whapps/developer/api',
	'whapps/myaccount/app_store',
	'whapps/myaccount/billing',
	'whapps/myaccount/credits',
	'whapps/myaccount/myaccount',
	'whapps/myaccount/nav',
	'whapps/myaccount/personal_info',
	'whapps/myaccount/report',
	'whapps/myaccount/statistics',
	'whapps/numbers/numbers_manager',
	'whapps/pbxs/pbxs_manager',
	'whapps/userportal/portal_manager',
	'whapps/voip/account',
	'whapps/voip/bulk',
	'whapps/voip/callflow',
	'whapps/voip/cdr',
	'whapps/voip/conference',
	'whapps/voip/device',
	'whapps/voip/directory',
	'whapps/voip/featurecode',
	'whapps/voip/groups',
	'whapps/voip/media',
	'whapps/voip/prompt',
	'whapps/voip/blacklist',
	'whapps/voip/menu',
	'whapps/voip/queue',
	'whapps/voip/registration',
	'whapps/voip/resource',
	'whapps/voip/timeofday',
	'whapps/voip/user',
	'whapps/voip/vmbox',
	'whapps/voip/faxbox',
	'whapps/voip/voip'
];

/**
 * Load requested language translation file.
 *
 * @param {string} language - the locale of the lang to load
 * @param {function()} done - callback executed when lang translation file loaded
 */
function loadLanguage(language, done) {
	var labChain = $LAB;
	for (var i = 0; i < langUrls.length; i++) {
		var src = langUrls[i] + '/lang/' + language + '.js';
		if (window.amplify.cache === false) {
			src += '?_' + CACHE_BUSTER;
		}
		labChain = labChain.script(src);
	}
	labChain.wait(done);
}

/**
 * Load remaining items (available apps & favicon)
 */
function loadRemaining() {
	$LAB.script('config/availableApps.js')
		.wait()
		.script('config/loadFavicon.js');
}

$LAB.script('config/config.js')
	.wait(function() {
		loadLanguage('en', function() {
			if (window.language !== 'en') {
				loadLanguage(window.language, loadRemaining);
			} else {
				loadRemaining();
			}
		});
	});
