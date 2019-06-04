// This is the core module. It is responsible for loading all a base layout, a base navigation bar and any registered whApps
winkstart.module('core', 'core',
    {
        resources: {
            'core.get_whitelabel': {
                url: '{api_url}/whitelabel/{domain}',
                contentType: 'application/json',
                verb: 'GET'
            }
        }
    },
    function(args) {
        var THIS = this,
            uninitialized_count = 0,
            domain = URL.match(/^(?:https?:\/\/)*([^\/?#]+).*$/)[1],
            api_url = winkstart.config.whitelabel_api_url || winkstart.apps['auth'].api_url,
			load_modules = function() {
				// First thing we're going to do is go through is load our layout
				winkstart.module('core', 'layout').init({ parent: $('body') }, function() {
					winkstart.module('core', 'whappnav').init({ parent: $('body') }, function() {
						winkstart.module('core', 'linknav').init({ parent: $('body') }, function() {
							if (!window.location.hostname.match(/localhost|192\.168\./) && winkstart.config.sentry.dsn !== '') {
								Sentry.init({
									dsn: winkstart.config.sentry.dsn,
									environment: window.location.hostname,
									release: winkstart.config.version,

									beforeSend(event) {
										if (event.extra && event.extra.resource && event.extra.resource !== '') {
											event.culprit = event.extra.resource;
										}

										return event;
									}
								});

								$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
									if (
										jqXHR.status === 401
										|| (
											jqXHR.status === 404
											&& ajaxSettings.url.match(/\/braintree\/credits|\/whitelabel/)
										)
									) {
										return;
									}

									Sentry.withScope(function(scope) {
										scope.setLevel('error');

										scope.setExtra('type', ajaxSettings.type);
										scope.setExtra('url', ajaxSettings.url);
										scope.setExtra('resource', ajaxSettings.resourceId);
										scope.setExtra('status', jqXHR.status);

										var responseJSON = {};

										try {
											responseJSON = JSON.parse(jqXHR.responseText);

											scope.setExtra('data', responseJSON.data);
											scope.setExtra('request_id', responseJSON.request_id);
										} catch (e) {
											scope.setExtra('response', jqXHR.responseText);
										}

										var ajaxError = new Error(responseJSON.message || thrownError || jqXHR.statusText || 'Unknown');
										ajaxError.name = 'AjaxError';

										Sentry.captureException(ajaxError);
									});
								});
							}

							// This is not such a great hack.
							// We need to load auth, and then, myaccount
							var arrayApps = ['myaccount', 'auth'];

							// Load any other apps requested (only after core is initialized)
							var loadApps = function(args) {
								if(!(args.listApps.length)) {
									winkstart.publish('core.loaded');
								}
								else {
									var appName = args.listApps.pop();

									winkstart.module.loadApp(appName, function() {
										this.init(function() {
											loadApps(args);
										});
									});
								}
							};

							loadApps({ listApps: arrayApps });
						});
					});
				});
			};
        winkstart.registerResources('auth', THIS.config.resources);

        winkstart.request('core.get_whitelabel', {
                api_url: api_url,
                domain: domain
            },
            function(_data, status) {
                delete _data.data.id;
                delete _data.data.description;
                winkstart.config = $.extend({}, winkstart.config, _data.data);
                load_modules();
            },
            function(_data, status) {
                if(status != 404) {
                    delete winkstart.config.company_name;
                }
                load_modules();
            }
        );

    }
);
