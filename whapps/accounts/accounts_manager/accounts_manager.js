winkstart.module('accounts', 'accounts_manager', {
		css: [
			'css/accounts_manager.css'
		],

		templates: {
			accounts_manager: 'tmpl/accounts_manager.html',
			edit: 'tmpl/edit.html',
			notify: 'tmpl/notifications_templates_notify.html',
			'switch_tmpl': 'tmpl/switch.html',
			teletype: 'tmpl/notifications_templates_teletype.html',
			teletype_deregister_row: 'tmpl/notifications_templates_teletype_deregister_row.html',
			'credits': 'tmpl/credits.html'
		},

		subscribe: {
			'accounts_manager.activate' : 'activate',
			'accounts_manager.edit' : 'edit_accounts_manager',
			'accounts_manager.switch_account': 'switch_account',
			'accounts_manager.trigger_masquerade': 'trigger_masquerade',
			'nav.company_name_click': 'restore_masquerading',
		},

		validation: [
				{ name: '#caller_id_name_external',             regex: _t('account', 'caller_id_name_regex') },
				{ name: '#caller_id_number_external',           regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
				{ name: '#caller_id_name_internal',             regex: _t('account', 'caller_id_name_regex') },
				{ name: '#caller_id_number_internal',           regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
				{ name: '#caller_id_name_emergency',            regex: _t('account', 'caller_id_name_regex') },
				{ name: '#caller_id_number_emergency',          regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
				{ name: '#teletype_deregister_from',            regex: _t('accounts', 'vm_to_email_support_email_regex') },
				{ name: '#teletype_fax_to_email_from',          regex: _t('accounts', 'vm_to_email_support_email_regex') },
				{ name: '#teletype_voicemail_to_email_from',    regex: _t('accounts', 'vm_to_email_support_email_regex') },
				{ name: '#vm_to_email_support_number',          regex: /^[\+]?[0-9\s\-\x\(\)]*$/ },
				{ name: '#vm_to_email_support_email',           regex: _t('accounts', 'vm_to_email_support_email_regex') },
				{ name: '#vm_to_email_send_from',               regex: _t('accounts', 'vm_to_email_support_email_regex') },
				{ name: '#vm_to_email_service_url',             regex: /^.*$/ },
				{ name: '#vm_to_email_service_provider',        regex: /^.*$/ },
				{ name: '#vm_to_email_service_name',            regex: /^.*$/ },
				{ name: '#deregister_email',                    regex: _t('accounts', 'vm_to_email_support_email_regex') },
				{ name: '#realm',                               regex: /^[a-zA-Z0-9\.\-]*$/ }
		],

		resources: {
			'accounts_manager.list_classifiers': {
				url: '{api_url}/accounts/{account_id}/phone_numbers/classifiers',
				contentType: 'application/json',
				verb: 'GET'
			},
			'accounts_manager.list': {
				url: '{api_url}/accounts/{account_id}/children',
				contentType: 'application/json',
				verb: 'GET'
			},
			'accounts_manager.get': {
				url: '{api_url}/accounts/{account_id}',
				contentType: 'application/json',
				verb: 'GET'
			},
			'accounts_manager.create': {
				url: '{api_url}/accounts/{account_id}',
				contentType: 'application/json',
				verb: 'PUT'
			},
			'accounts_manager.update': {
				url: '{api_url}/accounts/{account_id}',
				contentType: 'application/json',
				verb: 'POST'
			},
			'accounts_manager.delete': {
				url: '{api_url}/accounts/{account_id}',
				contentType: 'application/json',
				verb: 'DELETE'
			},
			'notifications.get': {
				url: '{api_url}/accounts/{account_id}/notifications/{notification_id}',
				contentType: 'application/json',
				verb: 'GET'
			},
			'notifications.update': {
				url: '{api_url}/accounts/{account_id}/notifications/{notification_id}',
				contentType: 'application/json',
				verb: 'POST'
			},
			'whitelabel.get': {
				url: '{api_url}/accounts/{account_id}/whitelabel',
				contentType: 'application/json',
				verb: 'GET'
			},
			'whitelabel.create': {
				url: '{api_url}/accounts/{account_id}/whitelabel',
				contentType: 'application/json',
				verb: 'PUT'
			},
			'whitelabel.update': {
				url: '{api_url}/accounts/{account_id}/whitelabel',
				contentType: 'application/json',
				verb: 'POST'
			},
			'whitelabel.delete': {
				url: '{api_url}/accounts/{account_id}/whitelabel',
				contentType: 'application/json',
				verb: 'DELETE'
			},
			'whitelabel.update_logo': {
				url: '{api_url}/accounts/{account_id}/whitelabel/logo',
				contentType: 'application/x-base64',
				verb: 'POST'
			},
			'whitelabel.update_icon': {
				url: '{api_url}/accounts/{account_id}/whitelabel/icon',
				contentType: 'application/x-base64',
				verb: 'POST'
			},
			'accounts_manager.credits.get': {
				url: '{api_url}/accounts/{account_id}/{billing_provider}/credits',
				contentType: 'application/json',
				verb: 'GET'
			},
			'accounts_manager.limits.get': {
				url: '{api_url}/accounts/{account_id}/limits',
				contentType: 'application/json',
				verb: 'GET'
			},
			'accounts_manager.credits.update': {
				url: '{api_url}/accounts/{account_id}/{billing_provider}/credits',
				contentType: 'application/json',
				verb: 'PUT'
			},
			'accounts_manager.limits.update': {
				url: '{api_url}/accounts/{account_id}/limits',
				contentType: 'application/json',
				verb: 'POST'
			},
			'accounts_manager.create_no_match': {
				url: '{api_url}/accounts/{account_id}/callflows',
				contentType: 'application/json',
				verb: 'PUT'
			},
			'accounts_manager.promote_reseller': {
				url: '{api_url}/accounts/{account_id}/reseller',
				contentType: 'application/json',
				verb: 'PUT'
			},
			'accounts_manager.demote_reseller': {
				url: '{api_url}/accounts/{account_id}/reseller',
				contentType: 'application/json',
				verb: 'DELETE'
			},
			'accounts_manager.allow_number_additions': {
				url: '{api_url}/accounts/{account_id}',
				contentType: 'application/json',
				verb: 'PATCH'
			}
		}
	},

	function(args) {
		var THIS = this;
		THIS.module = "accounts";

		winkstart.publish('nav.add_sublink', {
			link: 'nav',
			sublink: 'switch_account',
			masqueradable: true,
			label: _t('accounts','switch_account'),
			weight: '05',
			publish: 'accounts_manager.switch_account'
		});

		winkstart.registerResources(THIS.__whapp, THIS.config.resources);
	},

	{
		billing_provider: 'braintree',

		save_accounts_manager: function(form_data, data, success, error) {
			delete data.data.available_apps;

			var THIS = this,
				normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

			if(typeof data.data == 'object' && data.data.id) {
				winkstart.request(true, 'accounts_manager.update', {
						account_id: data.data.id,
						api_url: winkstart.apps['accounts'].api_url,
						data: normalized_data
					},
					function(_data, status) {
						if(typeof success == 'function') {
							success(_data, status, 'update');
						}
					},
					function(_data, status) {
						if(typeof error == 'function') {
							error(_data, status, 'update');
						}
					}
				);
			}
			else {
				winkstart.request(true, 'accounts_manager.create', {
						account_id: winkstart.apps['accounts'].account_id,
						api_url: winkstart.apps['accounts'].api_url,
						data: normalized_data
					},
					function(_data, status) {
						THIS.create_no_match(_data.data.id, function() {
							THIS.update_billing_account(_data, function() {
								if(typeof success == 'function') {
									success(_data, status, 'create');
								}
							});
						});
					},
					function(_data, status) {
						if(typeof error == 'function') {
							error(_data, status, 'create');
						}
					}
				);
			}
		},

		create_no_match: function(accountId, callback) {
			var THIS = this,
				no_match_callflow = {
					featurecode: {},
					numbers: ['no_match'],
					flow: {
						children: {},
						data: {},
						module: 'offnet'
					}
				};

			winkstart.request('accounts_manager.create_no_match', {
					account_id: accountId,
					api_url: winkstart.apps['accounts'].api_url,
					data: no_match_callflow
				},
				function(_data, status) {
					callback && callback();
				}
			);
		},

		update_billing_account: function(data, callback) {
			if(data.data.billing_id === 'self') {
				data.data.billing_id = data.data.id;
				winkstart.request('accounts_manager.update', {
						account_id: data.data.id,
						api_url: winkstart.apps['accounts'].api_url,
						data: data.data
					},
					function(_data, status) {
						if(typeof callback == 'function') {
							callback();
						}
					}
				);
			}
			else {
				if(typeof callback == 'function') {
					callback();
				}
			}
		},

		edit_accounts_manager: function(data, _parent, _target, _callback, data_defaults) {
			var THIS = this,
				parent = _parent || $('#accounts_manager-content'),
				target = _target || $('#accounts_manager-view', parent),
				_callbacks = _callbacks || {},
				callbacks = {
					save_success: _callbacks.save_success || function(_data) {
						THIS.render_list(parent);

						THIS.edit_accounts_manager({ id: _data.data.id }, parent, target, callbacks);
					},

					save_error: _callbacks.save_error,

					delete_success: _callbacks.delete_success || function() {
						target.empty();

						THIS.render_list(parent);
					},

					delete_error: _callbacks.delete_error || function(error) {
						winkstart.alert('error', error.message);
					},

					after_render: _callbacks.after_render
				},
				defaults = {
					data: $.extend(true, {
						caller_id: {
							internal: {},
							external: {},
							emergency: {}
						},
						call_restriction: {},
						notifications: {
							voicemail_to_email: {},
							fax_to_email: {}
						}
					}, data_defaults || {}),
					limits: {
						inbound_trunks: 0,
						twoway_trunks: 0,
						allow_prepay: true
					},
					credits: {
						amount: 0
					},
					field_data: {
						billing_account: 'parent',
						deregister: false,
						whitelabel: {
							nav: {},
							port: {}
						},
						display_limits: winkstart.apps['auth'].is_reseller || (winkstart.config.hasOwnProperty('reseller_id') ? (winkstart.config.reseller_id === winkstart.apps['auth'].account_id) : false),
						call_restriction: {},
						enable_call_restriction: false,
						available_apps: [],
						parent_realm: '',
						realm_placeholder: '',
						sameTemplate: true,
						teletype: {
							deregister: {
								from: '',
								to: {
									email_addresses: [],
									type: 'specified'
								}
							},
							fax_to_email: {
								from: ''
							},
							voicemail_to_email: {
								from: ''
							}
						},
						teletype_enabled: {
							fax_inbound_error_to_email: false
						},
						teletype_overridden: {
							deregister: false,
							fax_to_email: false,
							voicemail_to_email: false
						}
					},
					role: winkstart.apps['auth'].role,
					isAdmin: winkstart.apps.auth.superduper_admin,
					functions: {
						inArray: function(value, array) {
							if(array) {
								return ($.inArray(value, array) == -1) ? false : true;
							}
							else return false;
						}
					}
				};

			async.parallel({
					get_parent_account: function(callback) {
						winkstart.request(true, 'accounts_manager.get', {
								account_id: winkstart.apps['accounts'].account_id,
								api_url: winkstart.apps['accounts'].api_url
							},
							function(_data_account, status) {
								_data_account.data.available_apps = _data_account.data.available_apps || ((winkstart.config.onboard_roles || {})['default'] || {}).available_apps || [];

								if(!(typeof data === 'object' && data.id)) {
									$.each(_data_account.data.available_apps, function(k, v) {
										if(winkstart.config.available_apps[v]) {
											defaults.field_data.available_apps.push(winkstart.config.available_apps[v]);
										}
									});
								}

								defaults.field_data.parent_realm = _data_account.data.realm;
								defaults.field_data.realm_placeholder = THIS.suggested_realm(null, _data_account.data.realm);

								callback(null, _data_account);
							}
						);
					},
					get_account: function(callback) {
						if(typeof data === 'object' && data.id) {
							winkstart.request('accounts_manager.get', {
									account_id: data.id,
									api_url: winkstart.apps['accounts'].api_url
								},
								function(_data, status) {
									THIS.migrate_data(_data);
									THIS.format_data(_data);

									callback(null, _data);
								}
							);
						}
						else {
							callback(null, defaults);
						}
					},
					/**
					 * Get notifications docs for the selected account if loaded
					 *
					 * @param {function} callback - The function to call with errors and results
					 * as the first and second arguments, respectively.
					 */
					get_notifications: function(callback) {
						if(typeof data === 'object' && data.id) {
							var functions = {
								voicemail_to_email: function(callback) {
									winkstart.request('notifications.get', {
											account_id: data.id,
											api_url: winkstart.apps['accounts'].api_url,
											notification_id: 'voicemail_to_email'
										},
										function(_data, status) {
											defaults.field_data.teletype.voicemail_to_email.from = _data.data.from;
											callback(null, _data);
										}
									);
								},
								fax_to_email: function(callback) {
									winkstart.request('notifications.get', {
											account_id: data.id,
											api_url: winkstart.apps['accounts'].api_url,
											notification_id: 'fax_inbound_to_email'
										},
										function(_data, status) {
											defaults.field_data.teletype.fax_to_email.from = _data.data.from;
											callback(null, _data);
										}
									);
								},
								fax_inbound_error_to_email: function(callback) {
									winkstart.request('notifications.get', {
											account_id: data.id,
											api_url: winkstart.apps['accounts'].api_url,
											notification_id: 'fax_inbound_error_to_email'
										},
										function(_data, status) {
											// Undefined to support inheritance from top-level
											defaults.field_data.teletype_enabled.fax_inbound_error_to_email = _data.data.enabled === undefined || _data.data.enabled;
											callback(null, _data);
										}
									);
								},
								deregister: function(callback) {
									winkstart.request('notifications.get', {
											account_id: data.id,
											api_url: winkstart.apps['accounts'].api_url,
											notification_id: 'deregister'
										},
										function(_data, status) {
											defaults.field_data.teletype.deregister.enabled = _data.data.enabled;
											defaults.field_data.teletype.deregister.from = _data.data.from;
											$.extend(true, defaults.field_data.teletype.deregister.to, _data.data.to);
											callback(null, _data);
										}
									);
								}
							};
							async.parallel(functions, function(err, results) {
								callback(err, results);
							});
						}
						else {
							callback(null, {});
						}
					},
					get_credits: function(callback) {
						if(typeof data === 'object' && data.id) {
							winkstart.request('accounts_manager.credits.get', {
									account_id: data.id,
									api_url: winkstart.apps['accounts'].api_url,
									billing_provider: THIS.billing_provider,
								},
								function(_data_c, status) {
									defaults.credits = _data_c.data;

									callback(null, _data_c);
								},
								function(data, status) {
									callback(null, {});
								}
							);
						}
						else {
							callback(null, {});
						}
					},
					get_limits: function(callback) {
						if(typeof data === 'object' && data.id) {
							winkstart.request('accounts_manager.limits.get', {
									account_id: data.id,
									api_url: winkstart.apps['accounts'].api_url
								},
								function(_data_l, status) {
									$.extend(true, defaults.limits, _data_l.data);

									callback(null, _data_l);
								}
							);
						}
						else {
							callback(null, {});
						}
					},
					whitelabel: function(callback) {
						if(typeof data === 'object' && data.id) {
							winkstart.request('whitelabel.get', {
									account_id: data.id,
									api_url: winkstart.apps['accounts'].api_url
								},
								function(_data_wl, status) {
									defaults.field_data.whitelabel = $.extend(true, defaults.field_data.whitelabel, _data_wl.data);
									defaults.field_data.whitelabel.logo_url = winkstart.apps['accounts'].api_url + '/accounts/'+data.id+'/whitelabel/logo?auth_token='+winkstart.apps['accounts'].auth_token;
									defaults.field_data.whitelabel.icon_url = winkstart.apps['accounts'].api_url + '/accounts/'+data.id+'/whitelabel/icon?auth_token='+winkstart.apps['accounts'].auth_token;

									callback(null, _data_wl);
								},
								function() {
									callback(null, {});
								}
							);
						}
						else {
							callback(null, {});
						}
					},
					list_classifiers: function(callback) {
						if(winkstart.apps['auth'].is_reseller || (winkstart.config.hasOwnProperty('reseller_id') ? (winkstart.config.reseller_id === winkstart.apps['auth'].account_id) : false)) {
							winkstart.request('accounts_manager.list_classifiers', {
									api_url: winkstart.apps['accounts'].api_url,
									account_id: winkstart.apps['accounts'].account_id
								},
								function(_data_classifiers, status) {
									if('data' in _data_classifiers) {
										defaults.field_data.enable_call_restriction = true;
										$.each(_data_classifiers.data, function(k, v) {
											defaults.field_data.call_restriction[k] = {
												friendly_name: v.friendly_name
											};

											defaults.data.call_restriction[k] = {
												action: 'inherit',
											}
										});
									}

									callback(null, _data_classifiers);
								}
							);
						}
						else {
							callback(null, {});
						}
					}
				},
				function(err, results) {
					var render_data = defaults;
					if(typeof data === 'object' && data.id) {
						$.each(results.get_parent_account.data.available_apps, function(k, v) {
							var tmp = {},
								available = $.inArray(v, results.get_account.data.available_apps || []);

							if(available > -1){
								tmp.enabled = true;
							} else {
								tmp.enabled = false;
							}

							if(winkstart.config.available_apps[v]) {
								$.extend(true, tmp, winkstart.config.available_apps[v]);
							}

							defaults.field_data.available_apps.push(tmp);
						});

						var account_data = results.get_account.data;
						// Deregister enabled if sending to (original recipient or admins) || (nonempty array)
						if((account_data.notification_preference == 'teletype' ||
							(winkstart.config.notification_app == 'teletype' &&
								!account_data.notifications ||
								(!account_data.notifications.voicemail_to_email || $.isEmptyObject(account_data.notifications.voicemail_to_email)) &&
								(!account_data.notifications.fax_to_email || $.isEmptyObject(account_data.notifications.fax_to_email)))) &&
							((defaults.field_data.teletype.deregister.enabled == undefined ||
								defaults.field_data.teletype.deregister.enabled) &&
							$.inArray(defaults.field_data.teletype.deregister.to.type, ['original', 'admins']) > -1 ||
							('email_addresses' in defaults.field_data.teletype.deregister.to &&
								defaults.field_data.teletype.deregister.to.email_addresses.length > 0))) {
							defaults.field_data.deregister = true;
						}
						// Deregister enabled if account has send_to value in doc
						else if(account_data.notifications &&
							'deregister' in account_data.notifications &&
							account_data.notifications.deregister.send_to &&
							account_data.notifications.deregister.send_to != '') {
							defaults.field_data.deregister = true;
						}

						defaults.field_data.realm_placeholder = THIS.suggested_realm(results.get_account.data.name, results.get_parent_account.data.realm);

						render_data = $.extend(true, defaults, results.get_account);

						if(account_data.notification_preference == 'teletype') {
							var voicemail_to_email_from = defaults.field_data.teletype.voicemail_to_email.from,
								fax_to_email_from = defaults.field_data.teletype.fax_to_email.from;
							defaults.field_data.sameTemplate = voicemail_to_email_from != undefined &&
															   fax_to_email_from != undefined &&
															   voicemail_to_email_from == fax_to_email_from;

						}
						else {
							defaults.field_data.sameTemplate = _.isEqual(render_data.data.notifications.fax_to_email, render_data.data.notifications.voicemail_to_email);
						}
					}

					THIS.render_accounts_manager(render_data, target, callbacks);

					if(typeof callbacks.after_render == 'function') {
						callbacks.after_render();
					}
				}
			);
		},

		delete_accounts_manager: function(data, success, error) {
			var THIS = this;

			if(typeof data.data == 'object' && data.data.id) {
				winkstart.request(true, 'accounts_manager.delete', {
						account_id: data.data.id,
						api_url: winkstart.apps['accounts'].api_url
					},
					function(_data, status) {
						if(typeof success == 'function') {
							success(_data, status);
						}
					},
					function(_data, status) {
						if (typeof error == 'function') {
							error(_data, status);
						}
					}
				);
			}
		},

		delete_whitelabel: function(data, success, error) {
			if (typeof data.data == 'object' && data.data.id) {
				winkstart.request(true, 'whitelabel.delete', {
						account_id: data.data.id,
						api_url: winkstart.apps['accounts'].api_url
					},
					function(_data, status) {
						if(typeof success == 'function') {
							success(_data, status);
						}
					},
					function(_data, status) {
						if (typeof error == 'function') {
							error(_data, status);
						}
					}
				);
			}
		},

		migrate_data: function(data) {
			if('vm_to_email' in data.data) {
				data.data.notifications = data.data.notifications || {};
				data.data.notifications.voicemail_to_email = data.data.notifications.voicemail_to_email || {};
				data.data.notifications.voicemail_to_email.support_number = data.data.vm_to_email.support_number;
				data.data.notifications.voicemail_to_email.support_email = data.data.vm_to_email.support_email;

				delete data.data.vm_to_email;
			}
		},

		format_data: function(data) {
			if(!data.field_data) {
				data.field_data = {};
			}

			if(data.data.billing_id === winkstart.apps['accounts'].account_id) {
			   data.field_data.billing_account = 'parent';
			}
			else if(data.data.billing_id === data.data.id) {
				data.field_data.billing_account = 'self'
			}
			else {
				data.field_data.billing_account = 'other'
			}
		},

		clean_form_data: function(form_data) {
			var available_apps = [];

			if('available_apps' in form_data) {
				$.each(form_data.available_apps, function(k, v) {
					if(v){
						available_apps.push(v);
					}
				});
			}

			form_data.available_apps = available_apps;

			form_data.caller_id.internal.number = form_data.caller_id.internal.number.replace(/\s|\(|\)|\-|\./g, '');
			form_data.caller_id.emergency.number = form_data.caller_id.emergency.number.replace(/\s|\(|\)|\-|\./g, '');
			form_data.caller_id.external.number = form_data.caller_id.external.number.replace(/\s|\(|\)|\-|\./g, '');

			if(!('notifications' in form_data)) {
				form_data.notifications = {
					deregister: {},
					fax_to_email: {},
					voicemail_to_email: {}
				};
			}

			if('deregistration_notify' in form_data.extra &&
				form_data.extra.deregistration_notify === false) {
				form_data.notifications.deregister.send_to = '';
			}

			if(form_data.extra.billing_account === 'self') {
				form_data.billing_id = 'self';
			}
			else if(form_data.extra.billing_account === 'parent') {
				form_data.billing_id = winkstart.apps['accounts'].account_id;
			}

			if(form_data.apps) {
				form_data.apps = $.map(form_data.apps, function(val) { return (val) ? val : null });
			}

			if(form_data.max_connect_failures === '') {
				delete form_data.max_connect_failures;
			}

			form_data.whitelabel.description = form_data.extra.upload_logo;

			if(form_data.whitelabel.description === '') {
				delete form_data.whitelabel.description;
			}

			form_data.whitelabel.icon_desc = form_data.extra.upload_icon;

			if(form_data.whitelabel.icon_desc === '') {
				delete form_data.whitelabel.icon_desc;
			}

			if(form_data.extra.sameTemplate) {
				form_data.notifications.fax_to_email = {};

				$.each(form_data.notifications.voicemail_to_email, function(k, v) {
					form_data.notifications.fax_to_email[k] = v;
				});
			}

			delete form_data.extra;

			return form_data;
		},

		normalize_data: function(data) {
			$.each(data.caller_id, function(key, val) {
				$.each(val, function(_key, _val) {
					if(_val == '') {
						delete val[_key];
					}
				});

				if($.isEmptyObject(val)) {
					delete data.caller_id[key];
				}
			});

			if($.isEmptyObject(data.caller_id)) {
				delete data.caller_id;
			}

			$.each(data.notifications.voicemail_to_email, function(key, val) {
				if(val === '') {
					delete data.notifications.voicemail_to_email[key];
				}
			});

			$.each(data.notifications.fax_to_email, function(key,val) {
				if(val === '') {
					delete data.notifications.fax_to_email[key];
				}
			});

			if($.isEmptyObject(data.vm_to_email)) {
				delete data.vm_to_email;
			}

			if(data.notifications.deregister) {
				if(data.notifications.deregister.send_to === '') {
					delete data.notifications.deregister.send_to;
				}
			}

			if(data.billing_id === 'self' && data.id) {
				data.billing_id = data.id;
			}

			delete data[''];

			return data;
		},

		/**
		 * Normalize data for teletype notifications API calls. Splits the data
		 * into an object containing keys that are the IDs of notifications to
		 * update.
		 *
		 * @param {object} data - Form data from the notifications templates
		 * @param {object} field_data - Initial data when the view was rendered
		 */
		normalize_teletype_data: function(data, field_data) {
			// Fax-to-email
			if(data.extra.sameTemplate) {
				data.fax_to_email = data.voicemail_to_email;
			}

			if(!_.isEqual(data.fax_to_email, field_data.teletype.fax_to_email)) {
				var fax_keys = [
					'fax_inbound_to_email',
					'fax_inbound_error_to_email',
					'fax_outbound_to_email',
					'fax_outbound_error_to_email'
				];
				fax_keys.forEach(function(key) {
					data[key] = data.fax_to_email;
					if(data.fax_to_email.from === '') {
						data[key].enabled = false;
					}
				});
			}
			if(data.extra.teletype_enabled.fax_inbound_error_to_email != field_data.teletype_enabled.fax_inbound_error_to_email) {
				data.fax_inbound_error_to_email = data.fax_to_email;
				// Enabled if from is not empty and checkbox checked
				data.fax_inbound_error_to_email.enabled = data.fax_to_email.from !== '' &&
					data.extra.teletype_enabled.fax_inbound_error_to_email;
			}
			delete data.fax_to_email;

			// Voicemail-to-email
			if(_.isEqual(data.voicemail_to_email, field_data.teletype.voicemail_to_email)) {
				delete data.voicemail_to_email;
			}
			else if(data.voicemail_to_email.from === '') {
				data.voicemail_to_email.enabled = false;
			}

			// Deregister
			delete field_data.teletype.deregister.enabled; // Don't preserve this value
			if(data.extra.deregistration_teletype == field_data.deregister &&
				_.isEqual(data.deregister, field_data.teletype.deregister)) {
				delete data.deregister;
			}
			else if(data.extra.deregistration_teletype &&
				data.deregister.from !== '' &&
				(data.deregister.to.type != 'specified' ||
					data.deregister.to.email_addresses.length > 0)) {
				// Please don't make me negate this
			}
			else {
				data.deregister.enabled = false;
				if(data.deregister.from == '') {
					delete data.deregister.from;
				}
			}

			delete data.extra;

			return data;
		},

		upload_file: function(data, account_id, callback) {
			winkstart.request('whitelabel.update_logo', {
					account_id: account_id,
					api_url: winkstart.apps['accounts'].api_url,
					data: data
				},
				function(_data, status) {
					if(typeof callback === 'function') {
						callback();
					}
				},
				winkstart.error_message.process_error()
			);
		},

		upload_icon: function(data, account_id, callback) {
			winkstart.request('whitelabel.update_icon', {
					account_id: account_id,
					api_url: winkstart.apps['accounts'].api_url,
					data: data
				},
				function(_data, status) {
					if(typeof callback === 'function') {
						callback();
					}
				},
				winkstart.error_message.process_error()
			);
		},

		update_limits: function(limits, account_id, success, error) {
			var THIS = this;

			winkstart.request('accounts_manager.limits.update', {
					account_id: account_id,
					api_url: winkstart.apps['accounts'].api_url,
					data: limits
				},
				function(data, status) {
					if(typeof success == 'function') {
						success(data, status);
					}
				},
				winkstart.error_message.process_error()
			);
		},

		add_credits: function(credits, account_id, success, error) {
			var THIS = this;

			winkstart.request('accounts_manager.credits.update', {
					account_id: account_id,
					api_url: winkstart.apps['accounts'].api_url,
					billing_provider: THIS.billing_provider,
					data: {
						'amount': credits
					}
				},
				function(data, status) {
					if(typeof success == 'function') {
						success(data, status);
					}
				},
				winkstart.error_message.process_error()
			);
		},

		toggle_reseller_status: function(accountId, isReseller, callback) {
			var action = isReseller ? 'promote_reseller' : 'demote_reseller';
			winkstart.request('accounts_manager.' + action, {
					account_id: accountId,
					api_url: winkstart.apps['accounts'].api_url,
					data: {}
				},
				function(data, status) {
					winkstart.request('accounts_manager.allow_number_additions', {
							account_id: accountId,
							api_url: winkstart.apps['accounts'].api_url,
							data: {
								wnm_allow_additions: isReseller
							}
						},
						function(data, status) {
							callback(data, status);
						},
						function(data, status) {
							// Do the opposite action to undo promotion
							action = isReseller ? 'demote_reseller' : 'promote_reseller';
							winkstart.request('accounts_manager.' + action, {
									account_id: accountId,
									api_url: winkstart.apps['accounts'].api_url,
									data: {}
								},
								function() {
									// Present the error message from the allow_number_additions failure
									winkstart.error_message.process_error()(data, status);
								},
								winkstart.error_message.process_error(function(data, status) {
									console.log('Critical failure when reverting promote/demote', data);
								})
							)
						}
					);
				},
				winkstart.error_message.process_error()
			);
		},

		render_accounts_manager: function(data, target, callbacks) {
			var _t = function(param){
				return window.translate['accounts'][param];
			};
			data._t = _t;

			var THIS = this,
				account_html = THIS.templates.edit.tmpl(data),
				file,

				starting_values = {
					amount_balance: parseFloat(data.credits.amount),
					inbound_trunks: data.limits.inbound_trunks,
					twoway_trunks: data.limits.twoway_trunks,
					allow_prepay: data.limits.allow_prepay
				};

			// Keep the placeholder for account realm in the <name>.<parent_realm> format
			$('#name', account_html).bind('input', function() {
				$('#realm').attr('placeholder', THIS.suggested_realm($(this).val(), data.field_data.parent_realm));
			});

			var toggleResellerStatusClick = function(el, isReseller) {
				$(el).prop('disabled', true);
				THIS.toggle_reseller_status(data.data.id, isReseller, function(_data, status) {
					$(el).prop('disabled', false);
					callbacks.save_success(_data, status);
				});
			};

			$('.accounts_manager-promote', account_html).click(function(ev) {
				ev.preventDefault();
				toggleResellerStatusClick(this, true);
			});
			$('.accounts_manager-demote', account_html).click(function(ev) {
				ev.preventDefault();
				toggleResellerStatusClick(this, false);
			});

			// Show either notify or teletype notifications template configuration
			if(data.data.notification_preference == 'teletype' ||
				(winkstart.config.notification_app == 'teletype' &&
					!data.data.notifications ||
					(!data.data.notifications.voicemail_to_email || $.isEmptyObject(data.data.notifications.voicemail_to_email)) &&
					(!data.data.notifications.fax_to_email || $.isEmptyObject(data.data.notifications.fax_to_email)))) {
				var notifications_templates_html = THIS.templates.teletype.tmpl(data);
			}
			else {
				var notifications_templates_html = THIS.templates.notify.tmpl(data);
			}
			var notifications_container = $('<div></div>');
			notifications_container.append(notifications_templates_html);

			var checkbox_fax = $('#sameTemplate', notifications_container),
				fax_to_email = $('.fax_to_email', notifications_container),
				deregister = $('#deregister', notifications_container),
				deregister_email = $('.deregister_email', notifications_container);

			deregister.is(':checked') ? deregister_email.show() : deregister_email.hide();

			deregister.change(function() {
				$(this).is(':checked') ? deregister_email.show('blind') : deregister_email.hide('blind');
			});

			checkbox_fax.is(':checked') ? fax_to_email.hide() : fax_to_email.show();

			if(data.field_data.sameTemplate === true) {
				fax_to_email.hide();
			}

			$('#notifications_templates', account_html).append(notifications_container);

			// Controls for teletype deregister emails
			var teletype_deregister_to_type = $('#teletype_deregister_to_type', account_html);
			var teletype_deregister_to_email_addresses = $('#teletype_deregister_to_email_addresses', account_html);
			teletype_deregister_to_type.val() == 'specified' ?
				teletype_deregister_to_email_addresses.show() :
				teletype_deregister_to_email_addresses.hide();
			teletype_deregister_to_type.change(function() {
				var teletype_deregister_to_email_addresses = $('#teletype_deregister_to_email_addresses');
				$(this).val() == 'specified' ?
					teletype_deregister_to_email_addresses.show() :
					teletype_deregister_to_email_addresses.hide();
			});

			/**
			 * Append a deregister specified email row to an html container.
			 *
			 * @param {string} email - A default email address to fill in the row
			 * @param {object} container - jQuery container object with .rows
			 * div that will have the new row appended
			 */
			function addDeregisterEmail(email = '', container = null) {
				var row = THIS.templates.teletype_deregister_row.tmpl({
					_t: _t,
					email: email
				});
				$('#teletype_deregister_to_email_addresses .rows', container).append(row);
				$('.delete', row).click(function() {
					$(this).closest('.row').remove();
				});
			}
			if(teletype_deregister_to_type.val() == 'specified') {
				$.each(data.field_data.teletype.deregister.to.email_addresses, function(index, email) {
					addDeregisterEmail(email, account_html);
				});
			}

			$('#deregister_add_email_button', account_html).click(function() {
				// Add without container since container is now in DOM
				addDeregisterEmail();
			});
			$('.emails-to-notify .delete').click(function() {
				$(this).closest('.row').remove();
			});

			$('*[rel=popover]:not([type="text"])', account_html).popover({
				trigger: 'hover'
			});

			$('*[rel=popover][type="text"]', account_html).popover({
				trigger: 'focus'
			});

			winkstart.tabs($('.view-buttons', account_html), $('.tabs', account_html), true);

			$('.logo_div', account_html).css('background-image', 'url('+data.field_data.whitelabel.logo_url+ '&_=' + new Date().getTime()+')');
			$('.icon_div', account_html).css('background-image', 'url('+data.field_data.whitelabel.icon_url+ '&_=' + new Date().getTime()+')');

			if(data.field_data.whitelabel.description) {
				$('#upload_div', account_html).hide();
				$('.player_file', account_html).show();
			}

			if(data.field_data.whitelabel.icon_desc) {
				$('#upload_div_icon', account_html).hide();
				$('.player_file_icon', account_html).show();
			}

			if(data.limits.allow_prepay === false) {
				$('#credit_block', account_html).hide();
			}

			$('#allow_prepay', account_html).change(function() {
				$(this).is(':checked') !== starting_values['allow_prepay'] ? $(this).addClass('updated') : $(this).removeClass('updated');
				$(this).is(':checked') ? $('#credit_block', account_html).show() : $('#credit_block', account_html).hide();
			});

			$('.check-value.number', account_html).keyup(function() {
				var base_value = parseFloat(starting_values[$(this).attr('id')]),
					new_value = parseFloat($(this).val());

				base_value !== new_value ? $(this).addClass('updated') : $(this).removeClass('updated');
			});

			$('#change_link', account_html).click(function(ev) {
				ev.preventDefault();
				$('#upload_div', account_html).show();
				$('.player_file', account_html).hide();
			});

			$('#download_link', account_html).click(function(ev) {
				ev.preventDefault();
				window.location.href = winkstart.apps['accounts'].api_url + '/accounts/' +
									   data.data.id + '/whitelabel/logo?auth_token=' +
									   winkstart.apps['accounts'].auth_token;
			});

			$('#file', account_html).bind('change', function(evt){
				var files = evt.target.files;

				if(files.length > 0) {
					var reader = new FileReader();

					file = 'updating';
					reader.onloadend = function(evt) {
						var data = evt.target.result;

						file = data;
					}

					reader.readAsDataURL(files[0]);
				}
			});

			$('#change_link_icon', account_html).click(function(ev) {
				ev.preventDefault();
				$('#upload_div_icon', account_html).show();
				$('.player_file_icon', account_html).hide();
			});

			$('#download_link_icon', account_html).click(function(ev) {
				ev.preventDefault();
				window.location.href = winkstart.apps['accounts'].api_url + '/accounts/' +
				data.data.id + '/whitelabel/icon?auth_token=' +
				winkstart.apps['accounts'].auth_token;
			});

			$('#file_icon', account_html).bind('change', function(evt){
				var files = evt.target.files;

				if(files.length > 0) {
					var reader = new FileReader();

					icon_file = 'updating';
					reader.onloadend = function(evt) {
						var data = evt.target.result;

						icon_file = data;
					}

					reader.readAsDataURL(files[0]);
				}
			});

			$('#sameTemplate', account_html).click(function(evt){
				if($(this).prop('checked')) {
					$('.fax_to_email').hide('blind');
					$('#fax_to_email_support_number', account_html).val($('#vm_to_email_support_number', account_html).val());
					$('#fax_to_email_support_email', account_html).val($('#vm_to_email_support_email', account_html).val());
					$('#fax_to_email_send_from', account_html).val($('#vm_to_email_send_from', account_html).val());
					$('#fax_to_email_service_url', account_html).val($('#vm_to_email_service_url', account_html).val());
					$('#fax_to_email_service_name', account_html).val($('#vm_to_email_service_name', account_html).val());
					$('#fax_to_email_service_provider', account_html).val($('#vm_to_email_service_provider', account_html).val());
				}
				else {
					$('.fax_to_email').show('blind');
					$('.text-val', account_html).val('');
				}
			});

			// Must be done after all templates have been merged into account_html
			winkstart.validate.set(THIS.config.validation, account_html);

			$('.accounts_manager-save', account_html).click(function(ev) {
				ev.preventDefault();

				winkstart.validate.is_valid(THIS.config.validation, account_html, function() {
						var form_data = form2object('accounts_manager-form'),
							whitelabel_data = {};

						if('teletype' in form_data) {
							var teletype_data = form_data.teletype;
							teletype_data.extra = form_data.extra;
							delete form_data.teletype;

							teletype_data.deregister.to.email_addresses = [];
							$('#teletype_deregister_to_email_addresses .rows .column.first input').each(function(index) {
								teletype_data.deregister.to.email_addresses.push($(this).val());
							});

							var teletype_field_data = data.field_data;
						}

						THIS.clean_form_data(form_data);

						if('whitelabel' in form_data) {
							var whitelabel_data = form_data.whitelabel;
							delete form_data.whitelabel;
						}

						data.data.apps = data.data.apps || [];

						if(!form_data.realm) {
							form_data.realm = THIS.suggested_realm(form_data.name, data.field_data.parent_realm);
						}

						if ( form_data.name === form_data.notifications.voicemail_to_email.send_from ) {
							winkstart.alert('You cannot specify the company name as "Send From"!');
						} else {
							var save_account = function() {
								THIS.save_accounts_manager(form_data, data,
									function(_data_account, status) {
										var account_id = _data_account.data.id,
											/**
											 * Submit a variable number of notifications API requests, depending on
											 * which fields have been modified in the notifications templates
											 *
											 * @param {function} callback - The function to call with errors and results
											 * as the first and second arguments, respectively.
											 */
											update_notifications = function(callback) {
												if(teletype_data === undefined) {
													return callback(null, {});
												}

												var normalized_data = THIS.normalize_teletype_data(teletype_data, teletype_field_data),
													requests = {};

												// Build an object of the multiple notifications requests that take place
												$.each(normalized_data, function(key, value) {
													// Common arguments to update/delete
													var options = {
														account_id: account_id,
														api_url: winkstart.apps['accounts'].api_url,
														notification_id: key,
														data: value
													};

													requests[key] = function(callback) {
														winkstart.request('notifications.update',
															options,
															function(_data, status) {
																callback(null, {});
															},
															function(_data, status) {
																callback({
																	data: _data,
																	status: status
																}, null);
															}
														);
													};
												});
												async.parallel(requests,
													function(err, results) {
														callback(err, results);
													}
												);
											},
											upload_logo = function(callback) {
												if($('#upload_div', account_html).is(':visible') && $('#file', account_html).val() != '') {
													THIS.upload_file(file, account_id, function() {
														callback(null, {
															data: _data_account,
															status: status
														});
													});
												}
												else {
													callback(null, {
														data: _data_account,
														status: status
													});
												}
											};

											upload_icon = function(callback) {
												if($('#upload_div_icon', account_html).is(':visible') && $('#file_icon', account_html).val() != '') {
													THIS.upload_icon(icon_file, account_id, function() {
														upload_logo(callback);
													});
												}
												else {
													upload_logo(callback);
												}
											};

										// Do in series so we don't get half done whitelabel if something fails in update_notifications
										async.series({
												whitelabel: function(callback) {
													/*
													* We check if the whitelabel exist for this account,
													* If yes, then we check if it has been updated and if it was, we update the whitelabel document.
													* If it doesn't exist, we check if data is not empty before creating a whitelabel document
													*/
													winkstart.request('whitelabel.get', {
															account_id: account_id,
															api_url: winkstart.apps['accounts'].api_url
														},
														function(_data, status) {
															whitelabel_data = $.extend(true, {}, _data.data, whitelabel_data);

															winkstart.request('whitelabel.update', {
																	account_id: account_id,
																	api_url: winkstart.apps['accounts'].api_url,
																	data: whitelabel_data
																},
																function(_data, status) {
																	upload_icon(callback);
																},
																function(_data, status) {
																	callback({
																		data: _data,
																		status: status
																	}, null);
																}
															);
														},
														function(_data, status) {
															if(status === 404 && (whitelabel_data.domain != '' || whitelabel_data.company_name != '')) {
																winkstart.request('whitelabel.create', {
																		account_id: account_id,
																		api_url: winkstart.apps['accounts'].api_url,
																		data: whitelabel_data
																	},
																	function(_data, status) {
																		upload_icon(callback);
																	},
																	function(_data, status) {
																		callback({
																			data: _data,
																			status: status
																		}, null);
																	}
																);
															}
															else {
																callback(null, {
																	data: _data,
																	status: status
																});
															}
														}
													);
												},
												update_notifications: update_notifications
											},
											function(err, results) {
												if(err) {
													winkstart.error_message.process_error()(err.data, err.status);
												}
												else if(typeof callbacks.save_success == 'function') {
													callbacks.save_success(_data_account, status);
												}
											}
										);
									},
									function(error) {
										var errorMsg = "An error occurred...";
										if(error.message) { errorMsg = error.message; }
										if(error.data) {
											$.each(error.data, function(field, errors) {
												$.each(errors, function(errType, errMsg) {
													errorMsg += '<br>' + field + ': ' + errMsg + '.';
												});
											});
										}
										winkstart.alert('error', errorMsg);
									}
								);
							};

							if($('.check-value', account_html).hasClass('updated')) {
									if($('#amount_balance', account_html).hasClass('updated')) {
										var new_credits = parseFloat($('#amount_balance', account_html).val().replace(',','.')),
											credits_to_add = parseFloat(new_credits - starting_values.amount_balance);

										if(credits_to_add > 0 && 'id' in data.data) {
											THIS.add_credits(credits_to_add, data.data.id, function() {});
										}
									}

									if($('#inbound_trunks', account_html).hasClass('updated') || $('#twoway_trunks', account_html).hasClass('updated') || $('#allow_prepay', account_html).hasClass('updated')) {
										var limits_data = {
											twoway_trunks: parseInt($('#twoway_trunks', account_html).val()),
											inbound_trunks:  parseInt($('#inbound_trunks', account_html).val()),
											allow_prepay: $('#allow_prepay', account_html).is(':checked')
										};

										limits_data = $.extend({}, data.limits, limits_data);

										if(limits_data.twoway_trunks >= -1 && limits_data.inbound_trunks >= -1 && 'id' in data.data) {
											THIS.update_limits(limits_data, data.data.id, function(_data) {});
										}
									}

									save_account();
							}
							else {
								save_account();
							}
						}
					}
				);
			});

			$('.accounts_manager-delete', account_html).click(function(ev) {
				ev.preventDefault();

				winkstart.confirm('Are you sure you want to delete this account?<br>WARNING: This can not be undone', function() {
					THIS.delete_accounts_manager(data, callbacks.delete_success, callbacks.delete_error);
				});
			});

			$('.accounts_manager-switch', account_html).click(function(ev) {
				ev.preventDefault();

				var account = {
					name: data.data.name,
					id: data.data.id
				};

				winkstart.publish('accounts_manager.trigger_masquerade', { account: account }, function() {
					winkstart.publish('accounts_manager.activate');
				});
			});

			var render_acc = function() {
				(target)
					.empty()
					.append(account_html);
			};

			var render_provision_field = function() {
				if(winkstart.publish('phone.render_account_fields', $(account_html), data.data.provision || (data.data.provision = {}), render_acc)) {
					render_acc();
				}
			}

			if(winkstart.publish('call_center.render_account_fields', $(account_html), data, render_provision_field)) {
				render_provision_field();
			};

			$('.whitelabel-delete').click(function(ev) {
				ev.preventDefault();

				winkstart.confirm('Are you sure you want to delete the white labeling?', function() {
					THIS.delete_whitelabel(data, function() {
						THIS.edit_accounts_manager({ id: data.data.id });
					}, callbacks.delete_error);
				});
			});
		},

		render_list: function(parent) {
			var THIS = this;

			winkstart.request('accounts_manager.list', {
					account_id: winkstart.apps['accounts'].account_id,
					api_url: winkstart.apps['accounts'].api_url
				},
				function(data, status) {
					var map_crossbar_data = function(data) {
						var new_list = [];

						if(data.length > 0) {
							$.each(data, function(key, val) {
								new_list.push({
									id: val.id,
									title: val.name || '(no name)'
								});
							});
						}

						new_list.sort(function(a, b) {
							return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
						});

						return new_list;
					};

					$('#accounts_manager-listpanel', parent)
						.empty()
						.listpanel({
							label: 'Accounts',
							identifier: 'accounts_manager-listview',
							new_entity_label: _t(THIS.module, 'add_account'),//'Add Account',
							data: map_crossbar_data(data.data),
							publisher: winkstart.publish,
							notifyMethod: 'accounts_manager.edit',
							notifyCreateMethod: 'accounts_manager.edit',
							notifyParent: parent
						}
					);
				}
			);
		},

		switch_account: function() {
			var THIS = this;
			winkstart.request('accounts_manager.list', {
					account_id: winkstart.apps['accounts'].account_id,
					api_url: winkstart.apps['accounts'].api_url
				},
				function(_data, status) {
					if(_data.data.length > 0) {
						_data.data.sort(function(a, b) {
							return a.name < b.name ? -1 : 1;
						});
						switch_html = winkstart.dialog(THIS.templates.switch_tmpl.tmpl({ 'accounts': _data.data }), {
							title: 'Account Masquerading'
						});

						$('.masquerade', switch_html).click(function() {
							var account = {
									name: $('#sub_accounts option:selected', switch_html).text(),
									id: $('#sub_accounts', switch_html).val()
								};

							THIS.trigger_masquerade({account: account}, function() {
								$(switch_html).dialog('close');

								winkstart.publish('accounts_manager.activate');
							});
						});
					}
					else {
						winkstart.alert('This account doesn\'t have any sub-accounts.');
					}
				}
			);
		},

		trigger_masquerade: function(data, callback) {
			var account = data.account,
				THIS = this;

			if(!('masquerade' in winkstart.apps['accounts'])) {
				winkstart.apps['accounts'].masquerade = [];
				winkstart.publish('nav.company_name', function(name) {
					winkstart.apps['accounts'].account_name = name;
				});
			}

			winkstart.apps['accounts'].masquerade.push(winkstart.apps['accounts'].account_id);

			THIS.update_apps(account.id);

			THIS.masquerade_account(account.name);

			winkstart.log('Intercom: Masquerading as ' + account.name + ' (' + account.id + ')');
			window.Intercom('trackEvent', 'start-masquerade', {account_name: account.name, account_id: account.id});

			if(typeof callback === 'function') {
				callback();
			}
		},

		update_apps: function(account_id) {
			winkstart.apps['accounts'].account_id = account_id;

			if(winkstart.apps['accounts'].masquerade) {
				winkstart.publish('accounts.start_masquerade');
				$.each(winkstart.apps, function(k, v) {
					if(k != 'accounts' && this.is_masqueradable && this.api_url === winkstart.apps['accounts'].api_url) {
						this.account_id = winkstart.apps['accounts'].account_id;
						winkstart.publish('whappnav.subnav.enable', k);
					}
					else if(k != 'accounts') {
						winkstart.publish('whappnav.subnav.disable', k);
					}
				});
			}
			else {
				winkstart.publish('accounts.end_masquerade');
				$.each(winkstart.apps, function(k, v) {
					winkstart.publish('whappnav.subnav.enable', k);
					if(this.is_masqueradable && this.api_url === winkstart.apps['accounts'].api_url) {
						this.account_id = winkstart.apps['accounts'].account_id;
					}
				});
			}
		},

		restore_masquerading: function() {
			var THIS = this,
				id = winkstart.apps['accounts'].masquerade.pop();

			if(winkstart.apps['accounts'].masquerade.length) {
				winkstart.request('accounts_manager.get', {
						api_url: winkstart.apps['accounts'].api_url,
						account_id: id
					},
					function(data, status) {
						THIS.update_apps(data.data.id);

						THIS.masquerade_account(data.data.name);

						winkstart.publish('accounts_manager.activate');

						winkstart.log('Intercom: Masquerading as ' + data.data.name + ' (' + data.data.id + ')');
						window.Intercom('trackEvent', 'start-masquerade', {account_name: data.data.name, account_id: data.data.id});
					}
				);
			}
			else {
				delete winkstart.apps['accounts'].masquerade;

				THIS.update_apps(id);

				winkstart.publish('nav.company_name', function() { return winkstart.apps['accounts'].account_name });

				winkstart.publish('accounts_manager.activate');

				winkstart.log('Intercom: Masquerade ended, restoring account ' + winkstart.apps['accounts'].account_name + ' (' + id + ')');
				window.Intercom('trackEvent', 'end-masquerade', {account_name: winkstart.apps['accounts'].account_name, account_id: id});
			}
		},

		masquerade_account: function(account_name) {
			var THIS = this;

			winkstart.publish('nav.company_name', function() { return 'as ' + account_name + ' (restore)' });
		},

		activate: function(parent) {
			var THIS = this,
				accounts_manager_html = THIS.templates.accounts_manager.tmpl();

			(parent || $('#ws-content'))
				.empty()
				.append(accounts_manager_html);

			THIS.render_list(accounts_manager_html);
		},

		/**
		 * Generate a suggested realm for an account based on the parent's realm.
		 * @param {string} account_name - The account whose name to make into a realm
		 * @param {string} parent_realm - Parent account's realm to use as new realm suffix
		 * @return {string} - The suggested realm for the account
		 */
		suggested_realm: function(account_name, parent_realm) {
			return ((account_name || window.translate['accounts']['name'])
					+ '.' + parent_realm)
				.toLowerCase()
				.replace(/[^a-zA-Z0-9\.\-]+/g, '');
		}
	}
);
