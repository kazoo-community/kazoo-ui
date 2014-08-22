winkstart.module('voip', 'faxbox', {
		css: [
			'css/faxbox.css'
		],

		templates: {
			faxbox: 'tmpl/faxbox.html',
			edit: 'tmpl/edit.html'
		},

		subscribe: {
			'faxbox.activate': 'activate',
			'faxbox.edit': 'edit_faxbox'
		},

		validation : [
		],

		resources: {
			'faxbox.list': {
				url: '{api_url}/accounts/{account_id}/faxboxes',
				contentType: 'application/json',
				verb: 'GET'
			},
			'faxbox.get': {
				url: '{api_url}/accounts/{account_id}/faxboxes/{faxbox_id}',
				contentType: 'application/json',
				verb: 'GET'
			},
			'faxbox.create': {
				url: '{api_url}/accounts/{account_id}/faxboxes',
				contentType: 'application/json',
				verb: 'PUT'
			},
			'faxbox.update': {
				url: '{api_url}/accounts/{account_id}/faxboxes/{faxbox_id}',
				contentType: 'application/json',
				verb: 'POST'
			},
			'faxbox.delete': {
				url: '{api_url}/accounts/{account_id}/faxboxes/{faxbox_id}',
				contentType: 'application/json',
				verb: 'DELETE'
			}
		}
	},

	function(args) {
		var THIS = this;

		winkstart.registerResources(THIS.__whapp, THIS.config.resources);

		winkstart.publish('whappnav.subnav.add', {
			whapp: 'voip',
			module: THIS.__module,
			label: _t('faxbox', 'faxboxes_label'),
			icon: 'vmbox',
			weight: '35',
			category: _t('config', 'advanced_menu_cat')
		});
	},

	{
		render_list: function(parent) {
			var THIS = this;

			winkstart.request(true, 'faxbox.list', {
					account_id: winkstart.apps.voip.account_id,
					api_url: winkstart.apps.voip.api_url
				},
				function(data, status) {
					var map_crossbar_data = function(data) {
						var new_list = [];

						if(data.length > 0) {
							$.each(data, function(key, val) {
								new_list.push({
									id: val.id,
									title: val.name || _t('faxbox', 'no_name')
								});
							});
						}

						new_list.sort(function(a, b) {
							return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
						});

						return new_list;
					};

					$('#faxbox-listpanel', parent)
						.empty()
						.listpanel({
							label: _t('faxbox', 'faxbox_label'),
							identifier: 'faxbox-listview',
							new_entity_label: _t('faxbox', 'add_faxbox_label'),
							data: map_crossbar_data(data.data),
							publisher: winkstart.publish,
							notifyMethod: 'faxbox.edit',
							notifyCreateMethod: 'faxbox.edit',
							notifyParent: parent
						});
				}
			);
		},

		render_faxbox: function(data, target, callbacks) {
			var THIS = this,
				faxbox_html = THIS.templates.edit.tmpl({
					data: THIS.normalized_data(data),
					_t: function(param){
						return window.translate['faxbox'][param];
					}
				});

			winkstart.timezone.populate_dropdown($('#fax_timezone', faxbox_html), data.timezone);

			winkstart.tabs($('.view-buttons', faxbox_html), $('.tabs', faxbox_html));

			$('.faxbox-save', faxbox_html).click(function(ev) {
				ev.preventDefault();

				var form_data = form2object('faxbox-form', '.', true);

				THIS.save_faxbox(form_data, data, callbacks.save_success, winkstart.error_message.process_error(callbacks.save_error));
			});

			$('.faxbox-delete', faxbox_html).click(function(ev) {
				ev.preventDefault();

				winkstart.confirm(_t('faxbox', 'are_you_sure_you_want_to_delete'), function() {
					THIS.delete_faxbox(data, callbacks.delete_success, callbacks.delete_error);
				});
			});

			target
				.empty()
				.append(faxbox_html);
		},

		activate: function(parent) {
			var THIS = this,
				faxbox_html = THIS.templates.faxbox.tmpl();

			(parent || $('#ws-content'))
				.empty()
				.append(faxbox_html);

			THIS.render_list(faxbox_html);
		},

		save_faxbox: function(form_data, data, success, error) {
			var THIS = this,
				normalized_data = THIS.normalized_data($.extend(true, {}, data, form_data));

			if(typeof data == 'object' && data.id) {

				winkstart.request(true, 'faxbox.update', {
						account_id: winkstart.apps.voip.account_id,
						api_url: winkstart.apps.voip.api_url,
						faxbox_id: data.id,
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
			} else {
				winkstart.request(true, 'faxbox.create', {
						account_id: winkstart.apps.voip.account_id,
						api_url: winkstart.apps.voip.api_url,
						data: normalized_data
					},
					function(_data, status) {
						if(typeof success == 'function') {
							success(_data, status, 'create');
						}
					},
					function(_data, status) {
						if(typeof error == 'function') {
							error(_data, status, 'create');
						}
					}
				);
			}
		},

		edit_faxbox: function(data, _parent, _target, _callbacks) {
			var THIS = this,
				parent = _parent || $('#faxbox-content'),
				target = _target || $('#faxbox-view', parent),
				_callbacks = _callbacks || {},
				callbacks = {
					save_success: _callbacks.save_success || function(_data) {
							THIS.render_list(parent);

							THIS.edit_faxbox({ id: _data.data.id }, parent, target, callbacks);
					},
					save_error: _callbacks.save_error,
					delete_success: _callbacks.delete_success || function() {
						target.empty();

						THIS.render_list(parent);
					},
					delete_error: _callbacks.delete_error,
					after_render: _callbacks.after_render
				},
				defaults = {
					name: "",
					caller_name: "",
					caller_id: "",
					fax_header: "",
					fax_identity: "",
					fax_timezone: "",
					notifications: {
						inbound: {
							email: {
								send_to: ""
							}
						},
						outbound: {
							email: {
								send_to: ""
							}
						}
					}
				};

			if (data && data.id) {
				winkstart.request(true,  'faxbox.get', {
						account_id: winkstart.apps.voip.account_id,
						api_url: winkstart.apps.voip.api_url,
						faxbox_id: data.id
					},
					function(_data, status) {
						_data.data.id = data.id;
						THIS.render_faxbox(_data.data, target, callbacks)
					}
				);
			} else {
				THIS.render_faxbox(defaults, target, callbacks)
			}
		},

		delete_faxbox: function(data, success, error) {
			var THIS = this;

			if(typeof data == 'object' && data.id) {
				winkstart.request(true, 'faxbox.delete', {
						account_id: winkstart.apps.voip.account_id,
						api_url: winkstart.apps.voip.api_url,
						faxbox_id: data.id
					},
					function(_data, status) {
						if(typeof success == 'function') {
							success(_data, status);
						}
					},
					function(_data, status) {
						if(typeof error == 'function') {
							error(_data, status);
						}
					}
				);
			}
		},

		normalized_data: function(form_data) {
			form_data.notifications.inbound.email.send_to = typeof form_data.notifications.inbound.email.send_to == 'string' ? form_data.notifications.inbound.email.send_to.split(' ') : form_data.notifications.inbound.email.send_to.join(' ');
			form_data.notifications.outbound.email.send_to = typeof form_data.notifications.outbound.email.send_to == 'string' ? form_data.notifications.outbound.email.send_to.split(' ') : form_data.notifications.outbound.email.send_to.join(' ');

			if ( form_data.hasOwnProperty('smtp_permission_list') ) {
				if ( typeof form_data.smtp_permission_list === 'string' ) {
					form_data.smtp_permission_list = form_data.smtp_permission_list.split(' ');
				} else if ( form_data.smtp_permission_list instanceof Array ) {
					form_data.smtp_permission_list = form_data.smtp_permission_list.join(' ');
				}
			}

			return form_data;
		}
	}
);
