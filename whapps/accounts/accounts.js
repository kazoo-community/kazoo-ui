    winkstart.module('accounts', 'accounts', {
        subscribe: {
            'accounts.activate' : 'activate',
            'accounts.initialized' : 'initialized',
            'accounts.module_activate': 'module_activate',
        }
    },
/**
 * The code in this initialization function is required for
 * loading routine.
 * @param {Object} account_config - current account configuration
 */
function(account_config) {
        var THIS = this;

        if('modules' in winkstart.apps[THIS.__module]) {
            if('whitelist' in winkstart.apps[THIS.__module].modules) {
                THIS.modules = {};

                $.each(winkstart.apps[THIS.__module].modules.whitelist, function(k, v) {
                    THIS.modules[v] = false;
                });
            }

            if('blacklist' in winkstart.apps[THIS.__module].modules) {
                $.each(winkstart.apps[THIS.__module].modules.blacklist, function(k, v) {
                    if(v in THIS.modules) {
                        delete THIS.modules[v];
                    }
                });
            }
        }

        THIS.uninitialized_count = THIS._count(THIS.modules);

        THIS.whapp_auth(function() {
            winkstart.publish('whappnav.add', {
                name : THIS.__module,
                weight: 10
            });
            THIS.initialization_check();
        });

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

	if (winkstart.apps.auth.role === 'admin' && !winkstart.apps.auth.is_reseller) {
		THIS.check_configuration(account_config, 'notify');
	}

	winkstart.apps.accounts.check_configuration = THIS.check_configuration;
    },
    {
        
        billing_provider: 'braintree',

        modules: {
            'accounts_manager': false
        },

        is_initialized: false,

        uninitialized_count: 1337,

	check_configuration: function(config, action) {
		var failed_checks = [],
			configuration_checks = {
				'caller_id_name_emergency': function(config) {
					return config && config.caller_id && config.caller_id.emergency && config.caller_id.emergency.name;
				},
				'caller_id_number_emergency': function(config) {
					return config && config.caller_id && config.caller_id.emergency && config.caller_id.emergency.number;
				},
				'caller_id_name_external': function(config) {
					return config && config.caller_id && config.caller_id.external && config.caller_id.external.name;
				},
				'caller_id_number_external': function(config) {
					return config && config.caller_id && config.caller_id.external && config.caller_id.external.number;
				}
			};

		$.each(configuration_checks, function(key, check) {
			if (!check(config)) {
				failed_checks.push(key);
			}
		});

		if (failed_checks.length) {
			switch (action) {
				case 'highlight':
					$.each(failed_checks, function(k, v) {
						$('<span/>', { 'class': 'validated invalid required-field', 'data-content': 'Required Field!' })
							.popover({ 'placement': 'right', 'trigger': 'hover' })
							.insertAfter($('#' + v));
					});

					var related_tabs = $('.required-field').map(function(k, v) {
						return $(v).parentsUntil('.pill-content').last().attr('id');
					});

					$.each($.unique(related_tabs), function(k, v) {
						$('<span/>', { 'class': 'validated invalid', 'style': 'margin-right: -5px' })
							.appendTo($('[href=#' + v + ']'));
					});

					break;
				case 'notify':
					var message = '<p><strong>Account Configuration Incomplete!</strong> Click here to update settings.</p>',
						notification = $('<div/>', {
							'class': 'alert-message warning',
							'style': 'cursor: pointer; width: 250px; position: absolute; right: -300px; top: 90px;',
							'html': '<a class="close" href="#" onclick="$(this).parent().remove()">×</a>' + message
						});

					notification
						.click(function() {
							winkstart.publish('voip.module_activate', { 'name': 'account' });
							notification.remove();
						})
						.appendTo($('body'))
						.animate({ right: '15px' }, 1000);

					break;
			}
		}
	},

        initialized: function() {
            var THIS = this;

            THIS.is_initialized = true;

            if(winkstart.apps['accounts']['default']){
                THIS.setup_page();
                $('[data-whapp="accounts"] > a').addClass('activate');
            }
        },

        activate: function() {
            var THIS = this;



            THIS.whapp_auth(function() {
                THIS.initialization_check();
            });
        },

        initialization_check: function() {
            var THIS = this;

            if (!THIS.is_initialized) {
                // Load the modules
                $.each(THIS.modules, function(k, v) {
                    if(!v) {
                        THIS.modules[k] = true;
                        winkstart.module(THIS.__module, k).init(function() {
                            winkstart.log(THIS.__module + ': Initialized ' + k);

                            if(!--THIS.uninitialized_count) {
                                winkstart.publish(THIS.__module + '.initialized', {});
                            }
                        });
                    }
                });
            }
            else {
                THIS.setup_page();
            }
        },

        module_activate: function(args) {
            var THIS = this;

            THIS.whapp_auth(function() {
                winkstart.publish(args.name + '.activate');
            });
        },

        whapp_auth: function(callback) {
            var THIS = this;

            if('auth_token' in winkstart.apps[THIS.__module] && winkstart.apps[THIS.__module].auth_token) {
                callback();
            }
            else {
                winkstart.publish('auth.shared_auth', {
                    app_name: THIS.__module,
                    callback: (typeof callback == 'function') ? callback : undefined
                });
            }
        },

        _count: function(obj) {
            var count = 0;

            $.each(obj, function() {
                count++;
            });

            return count;
        },

        setup_page: function() {
            var THIS = this;

            winkstart.publish('accounts.module_activate', {name: 'accounts_manager'});
        }
    }
);
