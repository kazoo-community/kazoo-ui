winkstart.module('voip', 'vmbox', {
	css: [
		'css/vmbox.css'
	],

	templates: {
		vmbox: 'tmpl/vmbox.html',
		edit: 'tmpl/edit.html',
		vmbox_callflow: 'tmpl/vmbox_callflow.html'
	},

	subscribe: {
		'vmbox.activate': 'activate',
		'vmbox.edit': 'edit_vmbox',
		'callflow.define_callflow_nodes': 'define_callflow_nodes',
		'vmbox.popup_edit': 'popup_edit_vmbox'
	},

	validation : [
		{ name: '#name',    regex: _t('vmbox', 'name_regex') },
		{ name: '#mailbox', regex: /^[0-9]+$/ },
		{ name: '#pin',     regex: /^([0-9]{4,})?$/ }
	],

	resources: {
		'vmbox.list': {
			url: '{api_url}/accounts/{account_id}/vmboxes',
			contentType: 'application/json',
			verb: 'GET'
		},
		'vmbox.list_no_loading': {
			url: '{api_url}/accounts/{account_id}/vmboxes',
			contentType: 'application/json',
			verb: 'GET',
			trigger_events: false
		},
		'vmbox.get': {
			url: '{api_url}/accounts/{account_id}/vmboxes/{vmbox_id}',
			contentType: 'application/json',
			verb: 'GET'
		},
		'vmbox.create': {
			url: '{api_url}/accounts/{account_id}/vmboxes',
			contentType: 'application/json',
			verb: 'PUT'
		},
		'vmbox.update': {
			url: '{api_url}/accounts/{account_id}/vmboxes/{vmbox_id}',
			contentType: 'application/json',
			verb: 'POST'
		},
		'vmbox.delete': {
			url: '{api_url}/accounts/{account_id}/vmboxes/{vmbox_id}',
			contentType: 'application/json',
			verb: 'DELETE'
		},
		'user.list': {
			url: '{api_url}/accounts/{account_id}/users',
			contentType: 'application/json',
			verb: 'GET'
		},
		'user.get': {
			url: '{api_url}/accounts/{account_id}/users/{user_id}',
			contentType: 'application/json',
			verb: 'GET'
		}
	}
},

function(args) {
	var THIS = this;

	winkstart.registerResources(THIS.__whapp, THIS.config.resources);

	//winkstart.publish('statistics.add_stat', THIS.define_stats());

	winkstart.publish('whappnav.subnav.add', {
		whapp: 'voip',
		module: THIS.__module,
		label: _t('vmbox', 'voicemail_boxes_label'),
		icon: 'vmbox',
		weight: '30',
		category: _t('config', 'advanced_menu_cat')
	});
},

{
	save_vmbox: function(form_data, data, success, error) {
		var THIS = this,
			normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

		if(typeof data.data == 'object' && data.data.id) {
			winkstart.request(true, 'vmbox.update', {
				account_id: winkstart.apps['voip'].account_id,
				api_url: winkstart.apps['voip'].api_url,
				vmbox_id: data.data.id,
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
			winkstart.request(true, 'vmbox.create', {
				account_id: winkstart.apps['voip'].account_id,
				api_url: winkstart.apps['voip'].api_url,
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

	edit_vmbox: function(data, _parent, _target, _callbacks, data_defaults) {
		var THIS = this,
			parent = _parent || $('#vmbox-content'),
			target = _target || $('#vmbox-view', parent),
			_callbacks = _callbacks || {},
			callbacks = {
				save_success: _callbacks.save_success || function(_data) {
					THIS.render_list(parent);

					THIS.edit_vmbox({ id: _data.data.id }, parent, target, callbacks);
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
				data: $.extend(true, {
					require_pin: true,
					check_if_owner: true,
					pin: '',
					media: {}
				}, data_defaults || {}),

				field_data: {
					users: [],
					media: []
				}
			};

		winkstart.parallel({
			media_list: function(callback) {
				winkstart.request(true, 'media.list', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url
				},
				function(_data, status) {
					_data.data.sort(function(a, b) {
						return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
					});

					_data.data.unshift({
						id: '',
						name: _t('vmbox', 'not_set')
					});

					defaults.field_data.media = _data.data;

					callback(null, _data);
				}
				);
			},
			user_list: function(callback) {
				winkstart.request(true, 'user.list', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url
				},
				function(_data, status) {
					_data.data.unshift({
						id: '',
						first_name: _t('vmbox', 'no'),
						last_name: _t('vmbox', 'owner')
					});

					defaults.field_data.users = _data.data;

					callback(null, _data);
				}
				);
			},
			get_vmbox: function(callback) {
				if(typeof data == 'object' && data.id) {
					winkstart.request(true, 'vmbox.get', {
						account_id: winkstart.apps['voip'].account_id,
						api_url: winkstart.apps['voip'].api_url,
						vmbox_id: data.id
					},
					function(_data, status) {
						callback(null, _data);
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
				render_data = $.extend(true, defaults, results.get_vmbox);
			}

			THIS.render_vmbox(render_data, target, callbacks);

			if(typeof callbacks.after_render == 'function') {
				callbacks.after_render();
			}
		}
		);
	},

	delete_vmbox: function(data, success, error) {
		var THIS = this;

		if(typeof data.data == 'object' && data.data.id) {
			winkstart.request(true, 'vmbox.delete', {
				account_id: winkstart.apps['voip'].account_id,
				api_url: winkstart.apps['voip'].api_url,
				vmbox_id: data.data.id
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

	render_vmbox: function(data, target, callbacks) {
		data._t = function(param){
			return window.translate['vmbox'][param];
		};
		var THIS = this,
			vmbox_html = THIS.templates.edit.tmpl(data);

		winkstart.timezone.populate_dropdown($('#timezone', vmbox_html), data.data.timezone);

		winkstart.validate.set(THIS.config.validation, vmbox_html);

		$('*[rel=popover]:not([type="text"])', vmbox_html).popover({
			trigger: 'hover'
		});

		$('*[rel=popover][type="text"]', vmbox_html).popover({
			trigger: 'focus'
		});

		winkstart.tabs($('.view-buttons', vmbox_html), $('.tabs', vmbox_html));


		$('#owner_id', vmbox_html).change(function() {
			if($(this).val()) {
				winkstart.request(true, 'user.get', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url,
					user_id: $(this).val()
				},
				function(data, status) {
					if('timezone' in data.data) {
						$('#timezone', vmbox_html).val(data.data.timezone);
					}
				}
				);
			}
		});

		if(!$('#owner_id', vmbox_html).val()) {
			$('#edit_link', vmbox_html).hide();
		}

		$('#owner_id', vmbox_html).change(function() {
			if(!$('#owner_id option:selected', vmbox_html).val()) {
				$('#edit_link', vmbox_html).hide();
				$('#timezone', vmbox_html).val(winkstart.timezone.get_locale_timezone());
			}
			else {
				$('#edit_link', vmbox_html).show();
			}
		});

		$('.inline_action', vmbox_html).click(function(ev) {
			var _data = ($(this).dataset('action') == 'edit') ? { id: $('#owner_id', vmbox_html).val() } : {},
				_id = _data.id;

			ev.preventDefault();

			winkstart.publish('user.popup_edit', _data, function(_data) {
				/* Create */
				if(!_id) {
					$('#owner_id', vmbox_html).append('<option id="'+ _data.data.id  +'" value="'+ _data.data.id +'">'+ _data.data.first_name + ' ' + _data.data.last_name  +'</option>')
					$('#owner_id', vmbox_html).val(_data.data.id);

					$('#edit_link', vmbox_html).show();
					$('#timezone', vmbox_html).val(_data.data.timezone);
				}
				else {
					/* Update */
					if('id' in _data.data) {
						$('#owner_id #'+_data.data.id, vmbox_html).text(_data.data.first_name + ' ' + _data.data.last_name);
						$('#timezone', vmbox_html).val(_data.data.timezone);
					}
					/* Delete */
					else {
						$('#owner_id #'+_id, vmbox_html).remove();
						$('#edit_link', vmbox_html).hide();
						$('#timezone', vmbox_html).val('America/Los_Angeles');
					}
				}
			});
		});

		if(!$('#media_unavailable', vmbox_html).val()) {
			$('#edit_link_media', vmbox_html).hide();
		}

		$('#media_unavailable', vmbox_html).change(function() {
			!$('#media_unavailable option:selected', vmbox_html).val() ? $('#edit_link_media', vmbox_html).hide() : $('#edit_link_media', vmbox_html).show();
		});

		$('.inline_action_media', vmbox_html).click(function(ev) {
			var _data = ($(this).dataset('action') == 'edit') ? { id: $('#media_unavailable', vmbox_html).val() } : {},
				_id = _data.id;

			ev.preventDefault();

			winkstart.publish('media.popup_edit', _data, function(_data) {
				/* Create */
				if(!_id) {
					$('#media_unavailable', vmbox_html).append('<option id="'+ _data.data.id  +'" value="'+ _data.data.id +'">'+ _data.data.name +'</option>')
					$('#media_unavailable', vmbox_html).val(_data.data.id);

					$('#edit_link_media', vmbox_html).show();
				}
				else {
					/* Update */
					if('id' in _data.data) {
						$('#media_unavailable #'+_data.data.id, vmbox_html).text(_data.data.name);
					}
					/* Delete */
					else {
						$('#media_unavailable #'+_id, vmbox_html).remove();
						$('#edit_link_media', vmbox_html).hide();
					}
				}
			});
		});


		$('.vmbox-save', vmbox_html).click(function(ev) {
			ev.preventDefault();

			winkstart.validate.is_valid(THIS.config.validation, vmbox_html, function() {
				var form_data = form2object('vmbox-form');

				/* THIS.clean_form_data(form_data); */

				if('field_data' in data) {
					delete data.field_data;
				}

				THIS.save_vmbox(form_data, data, callbacks.save_success, winkstart.error_message.process_error(callbacks.save_error));
			},
			function() {
				winkstart.alert(_t('vmbox', 'there_were_errors_on_the_form'));
			}
			);
		});

		$('.vmbox-delete', vmbox_html).click(function(ev) {
			ev.preventDefault();

			winkstart.confirm(_t('vmbox', 'are_you_sure_you_want_to_delete'), function() {
				THIS.delete_vmbox(data, callbacks.delete_success, callbacks.delete_error);
			});
		});

		(target)
			.empty()
			.append(vmbox_html);
	},

	normalize_data: function(form_data) {
		if(!form_data.owner_id) {
			delete form_data.owner_id;
		}

		if(!form_data.media.unavailable) {
			delete form_data.media.unavailable;
		}

		if(form_data.pin === '') {
			delete form_data.pin;
		}

		if (typeof form_data.vm_message_forward_type === 'boolean') {
			form_data.vm_message_forward_type = form_data.vm_message_forward_type ? 'prepend_forward' : 'only_forward';
		}

		form_data.not_configurable = !form_data.extra.allow_configuration;

		delete form_data.extra;

		return form_data;
	},

	clean_form_data: function(form_data) {

	},

	render_list: function(parent) {
		var THIS = this;

		winkstart.request(true, 'vmbox.list', {
			account_id: winkstart.apps['voip'].account_id,
			api_url: winkstart.apps['voip'].api_url
		},
		function(data, status) {
			var map_crossbar_data = function(data) {
				var new_list = [];

				if(data.length > 0) {
					$.each(data, function(key, val) {
						new_list.push({
							id: val.id,
							title: val.name || _t('vmbox', 'no_name')
						});
					});
				}

				new_list.sort(function(a, b) {
					return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
				});

				return new_list;
			};

			$('#vmbox-listpanel', parent)
				.empty()
				.listpanel({
					label: _t('vmbox', 'voicemail_boxes_label'),
					identifier: 'vmbox-listview',
					new_entity_label: _t('vmbox', 'add_voicemail_box_label'),
					data: map_crossbar_data(data.data),
					publisher: winkstart.publish,
					notifyMethod: 'vmbox.edit',
					notifyCreateMethod: 'vmbox.edit',
					notifyParent: parent
				});
		}
		);
	},

	activate: function(parent) {
		var THIS = this,
			vmbox_html = THIS.templates.vmbox.tmpl();

		(parent || $('#ws-content'))
			.empty()
			.append(vmbox_html);

		THIS.render_list(vmbox_html);
	},

	popup_edit_vmbox: function(data, callback, data_defaults) {
		var popup, popup_html;

		popup_html = $('<div class="inline_popup"><div class="inline_content main_content"/></div>');

		winkstart.publish('vmbox.edit', data, popup_html, $('.inline_content', popup_html), {
			save_success: function(_data) {
				popup.dialog('close');

				if(typeof callback == 'function') {
					callback(_data);
				}
			},
			delete_success: function() {
				popup.dialog('close');

				if(typeof callback == 'function') {
					callback({ data: {} });
				}
			},
			after_render: function() {
				popup = winkstart.dialog(popup_html, {
					title: (data.id) ? _t('vmbox', 'edit_voicemail_box_title') : _t('vmbox', 'create_voicemail_box_title')
				});
			}
		}, data_defaults);
	},

	define_stats: function() {
		var stats = {
			'voicemails': {
				icon: 'vmbox',
				get_stat: function(callback) {
					winkstart.request('vmbox.list_no_loading', {
						account_id: winkstart.apps['voip'].account_id,
						api_url: winkstart.apps['voip'].api_url
					},
					function(_data, status) {
						var stat_attributes = {
							name: 'voicemails',
							number: _data.data.length,
							active: _data.data.length > 0 ? true : false,
							color: _data.data.length < 1 ? 'red' : (_data.data.length > 1 ? 'green' : 'orange')
						};
						if(typeof callback === 'function') {
							callback(stat_attributes);
						}
					},
					function(_data, status) {
						callback({error: true});
					}
					);
				},
				click_handler: function() {
					winkstart.publish('vmbox.activate');
				}
			}
		};

		return stats;
	},

	define_callflow_nodes: function(callflow_nodes) {
		var THIS = this;

		$.extend(callflow_nodes, {
			'voicemail[id=*,action=compose]': {
				name: _t('vmbox', 'voicemail'),
				icon: 'voicemail',
				category: _t('config', 'basic_cat'),
				module: 'voicemail',
				tip: _t('vmbox', 'voicemail_tip'),
				data: {
					id: 'null'
				},
				rules: [
					{
						type: 'quantity',
						maxSize: '1'
					}
				],
				isUsable: 'true',
				caption: function(node, caption_map) {
					var id = node.getMetadata('id'),
						returned_value = '';

					if(id in caption_map) {
						returned_value = caption_map[id].name;
					}

					return returned_value;
				},
				edit: function(node, callback) {
					var _this = this;

					winkstart.request(true, 'vmbox.list', {
						account_id: winkstart.apps['voip'].account_id,
						api_url: winkstart.apps['voip'].api_url
					},
					function(data, status) {
						var popup, popup_html;

						popup_html = THIS.templates.vmbox_callflow.tmpl({
							_t: function(param){
								return window.translate['vmbox'][param];
							},
							check_vm: false,
							items: winkstart.sort(data.data),
							selected: node.getMetadata('id') || '',
							route_var: node.getMetadata('var') || ''
						});

						if($('#vmbox_selector option:selected', popup_html).val() == undefined) {
							$('#edit_link', popup_html).hide();
						}

						$('.inline_action', popup_html).click(function(ev) {
							var _data = ($(this).dataset('action') == 'edit') ?
								{ id: $('#vmbox_selector', popup_html).val() } : {};

							ev.preventDefault();

							winkstart.publish('vmbox.popup_edit', _data, function(_data) {
								node.setMetadata('id', _data.data.id || 'null');
								if($('#route_var', popup_html).val().length > 0) {
									node.setMetadata('var', $('#route_var', popup_html).val());
								} else {
									node.deleteMetadata('var');
								}

								node.caption = _data.data.name || '';

								popup.dialog('close');
							});
						});

						$('#toggle_advanced', popup_html).click(function () {
							$('#route_var_div', popup_html).toggle();
						});

						$('#add', popup_html).click(function() {
							node.setMetadata('id', $('#vmbox_selector', popup_html).val());
							if($('#route_var', popup_html).val().length > 0) {
								node.setMetadata('var', $('#route_var', popup_html).val());
							} else {
								node.deleteMetadata('var');
							}

							popup.dialog('close');
						});

						popup = winkstart.dialog(popup_html, {
							title: _t('vmbox', 'voicemail_title'),
							minHeight: '0',
							beforeClose: function() {
								if(typeof callback == 'function') {
									callback();
								}
							}
						});
					}
					);
				}
			},

			'voicemail[id=*,action=check]': {
				name: _t('vmbox', 'check_voicemail'),
				icon: 'voicemail',
				category: _t('config', 'advanced_cat'),
				module: 'voicemail',
				tip: _t('vmbox', 'check_voicemail_tip'),
				data: {
					action: 'check',
					callerid_match_login: false,
					id: undefined,
					single_mailbox_login: true
				},
				rules: [
					{
						type: 'quantity',
						maxSize: '1'
					}
				],
				isUsable: 'true',
				caption: function(node, caption_map) {
					var id = node.getMetadata('id');

					return caption_map[id]
						? caption_map[id].name
						: '';
				},
				edit: function(node, callback) {
					winkstart.request(true, 'vmbox.list', {
						account_id: winkstart.apps.voip.account_id,
						api_url: winkstart.apps.voip.api_url
					},
					function(data, status) {
						var popup, popup_html;

						popup_html = THIS.templates.vmbox_callflow.tmpl({
							_t: function(param) {
								return window.translate.vmbox[param];
							},
							check_vm: true,
							items: winkstart.sort(data.data),
							selected: node.getMetadata('id') || ''
						});

						if ($('#vmbox_selector option:selected', popup_html).val() === undefined) {
							$('#edit_link', popup_html).hide();
						}

						$('.inline_action', popup_html).click(function(ev) {
							var _data = ($(this).dataset('action') === 'edit')
								? { id: $('#vmbox_selector', popup_html).val() }
								: {};

							ev.preventDefault();

							winkstart.publish('vmbox.popup_edit', _data, function(_data) {
								node.setMetadata('id', _data.data.id || 'null');
								if ($('#route_var', popup_html).val().length > 0) {
									node.setMetadata('var', $('#route_var', popup_html).val());
								} else {
									node.deleteMetadata('var');
								}

								node.caption = _data.data.name || '';

								popup.dialog('close');
							});
						});

						// Save
						$('#add', popup_html).click(function() {
							var selector = $('#vmbox_selector', popup_html),
								selectedID = selector.val();

							if (selectedID) {
								// Accessing a specific mailbox
								node.setMetadata('id', selectedID);
								node.setMetadata('single_mailbox_login', true);
								node.setMetadata('callerid_match_login', false);
							} else {
								// Route to mailbox based on caller's id
								node.setMetadata('single_mailbox_login', false);
								node.setMetadata('callerid_match_login', true);
								node.deleteMetadata('id');
							}

							node.caption = selector[0][selector[0].selectedIndex].text;

							popup.dialog('close');
						});

						popup = winkstart.dialog(popup_html, {
							title: _t('vmbox', 'check_voicemail'),
							minHeight: '0',
							beforeClose: function() {
								if (typeof callback === 'function') {
									callback();
								}
							}
						});
					});
				}
			}
		});

		$.extend(callflow_nodes, {
			'voicemail[id=*]': $.extend({}, callflow_nodes['voicemail[id=*,action=compose]']),
			'voicemail[action=check]': $.extend({}, callflow_nodes['voicemail[id=*,action=check]'])
		});
		delete callflow_nodes['voicemail[id=*]'].category;
		delete callflow_nodes['voicemail[action=check]'].category;
	}
}
);
