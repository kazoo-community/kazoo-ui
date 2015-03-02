winkstart.module('accounts', 'accounts_manager', {
		css: [
			'css/accounts_manager.css'
		],

		templates: {
			accounts_manager: 'tmpl/accounts_manager.html',
			edit: 'tmpl/edit.html',
			'switch_tmpl': 'tmpl/switch.html',
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
				{ name: '#vm_to_email_support_number',   regex: /^[\+]?[0-9\s\-\x\(\)]*$/ },
				{ name: '#vm_to_email_support_email',    regex: _t('accounts', 'vm_to_email_support_email_regex') },
				{ name: '#vm_to_email_send_from',        regex: _t('accounts', 'vm_to_email_support_email_regex') },
				{ name: '#vm_to_email_service_url',      regex: /^.*$/ },
				{ name: '#vm_to_email_service_provider', regex: /^.*$/ },
				{ name: '#vm_to_email_service_name',     regex: /^.*$/ },
				{ name: '#deregister_email',             regex: _t('accounts', 'vm_to_email_support_email_regex') },
				{ name: '#realm',                        regex: /^[a-zA-Z0-9\.\-]*$/ }
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
						whitelabel: {
							nav: {},
							port: {}
						},
						display_limits: winkstart.apps['auth'].is_reseller || (winkstart.config.hasOwnProperty('reseller_id') ? (winkstart.config.reseller_id === winkstart.apps['auth'].account_id) : false),
						call_restriction: {},
						enable_call_restriction: false,
						available_apps: []
					},
					role: winkstart.apps['auth'].role,
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
					defaults.field_data.sameTemplate = true;
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

						render_data = $.extend(true, defaults, results.get_account);

						defaults.field_data.sameTemplate = _.isEqual(render_data.data.notifications.fax_to_email, render_data.data.notifications.voicemail_to_email);
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

			if(data.data.notifications && 'deregister' in data.data.notifications && data.data.notifications.deregister.send_to && data.data.notifications.deregister.send_to != '') {
				data.field_data.deregister = true;
			}
			else {
				data.field_data.deregister = false;
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

			if(form_data.extra.deregistration_notify === false) {
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

		render_accounts_manager: function(data, target, callbacks) {
			data._t = function(param){
				return window.translate['accounts'][param];
			};

			var THIS = this,
				account_html = THIS.templates.edit.tmpl(data),
				deregister = $('#deregister', account_html),
				deregister_email = $('.deregister_email', account_html),
				file,
				checkbox_fax = $('#sameTemplate', account_html),
				fax_to_email = $('.fax_to_email', account_html),

				starting_values = {
					amount_balance: parseFloat(data.credits.amount),
					inbound_trunks: data.limits.inbound_trunks,
					twoway_trunks: data.limits.twoway_trunks,
					allow_prepay: data.limits.allow_prepay
				};

			winkstart.validate.set(THIS.config.validation, account_html);

			if(data.field_data.sameTemplate === true) {
				$('.fax_to_email').hide();
			}

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

			deregister.is(':checked') ? deregister_email.show() : deregister_email.hide();

			deregister.change(function() {
				$(this).is(':checked') ? deregister_email.show('blind') : deregister_email.hide('blind');
			});

			checkbox_fax.is(':checked') ? fax_to_email.hide() : fax_to_email.show();

			$('#sameTemplate', account_html).click(function(evt){
				if($(this).prop('checked')) {
					$('.fax_to_email').hide();
					$('#fax_to_email_support_number', account_html).val($('#vm_to_email_support_number', account_html).val());
					$('#fax_to_email_support_email', account_html).val($('#vm_to_email_support_email', account_html).val());
					$('#fax_to_email_send_from', account_html).val($('#vm_to_email_send_from', account_html).val());
					$('#fax_to_email_service_url', account_html).val($('#vm_to_email_service_url', account_html).val());
					$('#fax_to_email_service_name', account_html).val($('#vm_to_email_service_name', account_html).val());
					$('#fax_to_email_service_provider', account_html).val($('#vm_to_email_service_provider', account_html).val());
				}
				else {
					$('.fax_to_email').show();
					$('.text-val', account_html).val('');
				}
			});

			$('.accounts_manager-save', account_html).click(function(ev) {
				ev.preventDefault();

				winkstart.validate.is_valid(THIS.config.validation, account_html, function() {
						var form_data = form2object('accounts_manager-form'),
							whitelabel_data = {};
						THIS.clean_form_data(form_data);

						if('field_data' in data) {
							delete data.field_data;
						}

						if('whitelabel' in form_data) {
							var whitelabel_data = form_data.whitelabel;
							delete form_data.whitelabel;
						}

						data.data.apps = data.data.apps || [];

						if ( form_data.name === form_data.notifications.voicemail_to_email.send_from ) {
							winkstart.alert('You cannot specify the company name as "Send From"!');
						} else {
							var save_account = function() {
								THIS.save_accounts_manager(form_data, data,
									function(_data_account, status) {
										var account_id = _data_account.data.id,
											upload_logo = function() {
												if($('#upload_div', account_html).is(':visible') && $('#file', account_html).val() != '') {
													THIS.upload_file(file, account_id, function() {
														if(typeof callbacks.save_success == 'function') {
															callbacks.save_success(_data_account, status);
														}
													});
												}
												else {
													if(typeof callbacks.save_success == 'function') {
														callbacks.save_success(_data_account, status);
													}
												}
											};

											upload_icon = function() {
											if($('#upload_div_icon', account_html).is(':visible') && $('#file_icon', account_html).val() != '') {
													THIS.upload_icon(icon_file, account_id, function() {
														if(typeof callbacks.save_success == 'function') {
															callbacks.save_success(_data_account, status);
															upload_logo();
														}
													});
												}
												else {
													if(typeof callbacks.save_success == 'function') {
														callbacks.save_success(_data_account, status);
													}
													upload_logo();
												}
											};

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
														upload_icon();
													},
													winkstart.error_message.process_error()
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
															upload_icon();
														},
														winkstart.error_message.process_error()
													);
												}
												else {
													if(typeof callbacks.save_success == 'function') {
														callbacks.save_success(_data_account, status);
													}
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
					}
				);
			}
			else {
				delete winkstart.apps['accounts'].masquerade;

				THIS.update_apps(id);

				winkstart.publish('nav.company_name', function() { return winkstart.apps['accounts'].account_name });

				winkstart.publish('accounts_manager.activate');
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
		}
	}
);
