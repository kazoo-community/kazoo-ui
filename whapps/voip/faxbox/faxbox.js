winkstart.module('voip', 'faxbox', {
		css: [
			'css/faxbox.css'
		],

		templates: {
			faxbox_callflow: 'tmpl/faxbox_callflow.html',
			faxbox: 'tmpl/faxbox.html',
			edit: 'tmpl/edit.html'
		},

		subscribe: {
			'callflow.define_callflow_nodes': 'define_callflow_nodes',
			'faxbox.popup_edit': 'popup_edit_faxbox',
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
			},
			'user.get': {
				url: '{api_url}/accounts/{account_id}/users/{user_id}',
				contentType: 'application/json',
				verb: 'GET'
			},
			'user.list': {
				url: '{api_url}/accounts/{account_id}/users',
				contentType: 'application/json',
				verb: 'GET'
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
			icon: 'printer2',
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
					faxbox: THIS.normalized_data(data.faxbox),
					users: data.user_list,
					_t: function(param){
						return window.translate['faxbox'][param];
					}
				});

			winkstart.timezone.populate_dropdown($('#fax_timezone', faxbox_html), data.faxbox.fax_timezone);

			$('*[rel=popover]:not([type="text"])', faxbox_html).popover({
				trigger: 'hover'
			});

			$('*[rel=popover][type="text"]', faxbox_html).popover({
				trigger: 'focus'
			});

			winkstart.tabs($('.view-buttons', faxbox_html), $('.tabs', faxbox_html));

			if (!data.faxbox.hasOwnProperty('id')) {
				$('#owner_id', faxbox_html).change(function(ev) {
					if ($(this).val()) {
						winkstart.request(true, 'user.get', {
								account_id: winkstart.apps.voip.account_id,
								user_id: $(this).val(),
								api_url: winkstart.apps.voip.api_url
							},
							function(_data, status) {
								data.faxbox = THIS.get_default_faxbox(_data.data);
								$('#edit_link', faxbox_html).show();
								THIS.render_faxbox(data, target, callbacks);
							}
						);
					} else {
						data.faxbox = THIS.get_default_faxbox();
						$('#edit_link', faxbox_html).hide();
						THIS.render_faxbox(data, target, callbacks);
					}
				});
			}
			else {
				$('#owner_id', faxbox_html).change(function(ev) {
					var currentFaxbox = form2object('faxbox-form');

					if ($(this).val()) {
						$('[id$="bound_notification_email"]', faxbox_html).each(function(idx, el) {
							$(el).attr('disabled', true);
						});

						winkstart.request(true, 'user.get', {
								account_id: winkstart.apps.voip.account_id,
								user_id: $(this).val(),
								api_url: winkstart.apps.voip.api_url
							},
							function(_data, status) {
								data.faxbox = $.extend(true, {}, THIS.get_default_faxbox(), data.faxbox, currentFaxbox, {
									cloud_connector_claim_url: faxbox_html.find('#cloud_connector_claim_url').attr('href'),
									notifications: {
										inbound: {
											email: {
												send_to: _data.data.email || _data.data.username
											}
										},
										outbound: {
											email: {
												send_to: _data.data.email || _data.data.username
											}
										}
									}
								});

								$('#edit_link', faxbox_html).hide();
								THIS.render_faxbox(data, target, callbacks);
							}
						);
					}
					else {
						$('[id$="bound_notification_email"]', faxbox_html).each(function(idx, el) {
							$(el).attr('disabled', false);
						});
					}
				});
			}

			if(!$('#owner_id', faxbox_html).val()) {
				$('#edit_link', faxbox_html).hide();
			}

			$('.inline-action', faxbox_html).click(function(ev) {
				var _data = $(this).dataset('action') == 'edit' ? { id: $('#owner_id', faxbox_html).val() } : {},
					_id = _data.id;

				winkstart.publish('user.popup_edit', _data, function(_data) {
					/* Create */
					if(!_id) {
						$('#owner_id', faxbox_html).append('<option id="'+ _data.data.id  +'" value="'+ _data.data.id +'">'+ _data.data.first_name + ' ' + _data.data.last_name  +'</option>')
						$('#owner_id', faxbox_html).val(_data.data.id);
					}
					else {
						/* Update */
						if('id' in _data.data) {
							$('#owner_id #'+_data.data.id, faxbox_html).text(_data.data.first_name + ' ' + _data.data.last_name);
						}
						/* Delete */
						else {
							$('#owner_id #'+_id, faxbox_html).remove();
						}
					}
				});
			});

			$('#caller_id', faxbox_html).change(function(ev) {
				var number = $(this).val(),
					fax_identity = $('#fax_identity', faxbox_html);

				if (/^(\+1|1)([0-9]{10})$|^([0-9]{10})$/.test(number)) {
					if (/^(\+1)/.test(number)) {
						fax_identity.val(number.replace(/^\+1([0-9]{3})([0-9]{3})([0-9]{4})$/, '+1 ($1) $2-$3'));
					} else if (/^1([0-9]{10})$/.test(number)) {
						fax_identity.val(number.replace(/^1([0-9]{3})([0-9]{3})([0-9]{4})$/, '+1 ($1) $2-$3'));
					} else  {
						fax_identity.val(number.replace(/^([0-9]{3})([0-9]{3})([0-9]{4})$/, '+1 ($1) $2-$3'));
					}
				} else {
					fax_identity.val('');
				}
			});

			$('.faxbox-save', faxbox_html).click(function(ev) {
				ev.preventDefault();

				var form_data = form2object('faxbox-form');

				THIS.save_faxbox(form_data, data.faxbox, callbacks.save_success, winkstart.error_message.process_error(callbacks.save_error));
			});

			$('.faxbox-delete', faxbox_html).click(function(ev) {
				ev.preventDefault();

				winkstart.confirm(_t('faxbox', 'are_you_sure_you_want_to_delete'), function() {
					THIS.delete_faxbox(data.faxbox, callbacks.delete_success, callbacks.delete_error);
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
				};

			winkstart.parallel({
					faxbox: function(callback) {
						if (typeof data === 'object' && data.id) {
							winkstart.request(true, 'faxbox.get', {
									account_id: winkstart.apps.voip.account_id,
									api_url: winkstart.apps.voip.api_url,
									faxbox_id: data.id
								},
								function(_data, status) {
									_data.data.id = data.id;

									callback(null, _data.data);
								}
							);
						} else {
							callback(null, {});
						}
					},
					user_list: function(callback) {
						winkstart.request(true, 'user.list', {
								account_id: winkstart.apps.voip.account_id,
								api_url: winkstart.apps.voip.api_url
							},
							function(_data, status) {
								_data.data.sort(function(a, b){
									return a.first_name.concat(' ', a.last_name).toLowerCase() > b.first_name.concat(' ', b.last_name).toLowerCase() ? 1 : -1;
								});

								_data.data.unshift({
									id: '',
									first_name: _t('faxbox', 'no'),
									last_name: _t('faxbox', 'owner')
								});

								callback(null, _data.data);
							}
						);
					},
					current_user: function(callback) {
						if (winkstart.apps.auth.account_id === winkstart.apps.voip.account_id) {
							winkstart.request(true, 'user.get', {
									account_id: winkstart.apps.voip.account_id,
									user_id: winkstart.apps.voip.user_id,
									api_url: winkstart.apps.voip.api_url
								},
								function(_data, status) {
									callback(null, _data.data);
								}
							);
						}
						else {
							callback(null, {});
						}
					}
				},
				function(err, results) {
					if (!data.hasOwnProperty('id')) {
						if (Object.keys(results.current_user).length === 0) {
							results.faxbox = $.extend(true, THIS.get_default_faxbox(), results.faxbox);
						}
						else {
							results.faxbox = $.extend(true, THIS.get_default_faxbox(results.current_user), results.faxbox);
						}
					}

					delete results.current_user;

					THIS.render_faxbox(results, target, callbacks);

					if (typeof callbacks.after_render === 'function') {
						callbacks.after_render();
					}
				}
			);
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
			if (form_data.hasOwnProperty('notifications')) {
				var inbound = form_data.notifications.inbound.email.send_to,
					outbound = form_data.notifications.outbound.email.send_to;

				form_data.notifications.inbound.email.send_to = inbound instanceof Array ? inbound.join(' ') : inbound.split(' ');
				form_data.notifications.outbound.email.send_to = outbound instanceof Array ? outbound.join(' ') : outbound.split(' ');
			}

			if (form_data.hasOwnProperty('smtp_permission_list')) {
				if (form_data.smtp_permission_list === '') {
					delete form_data.smtp_permission_list;
				} else {
					var list = form_data.smtp_permission_list;

					form_data.smtp_permission_list  = list instanceof Array ? list.join(' ') : list.split(' ');
				}
			}

			if (form_data.hasOwnProperty('custom_smtp_address') && form_data.custom_smtp_address === '') {
				delete form_data.custom_smtp_address;
			}

			if (form_data.hasOwnProperty('owner_id') && form_data.owner_id === '') {
				delete form_data.owner_id;
			}

			return form_data;
		},

		get_default_faxbox: function(user) {
			var default_faxbox = {
					name: '',
					caller_name: '',
					fax_header: '',
					fax_timezone: '',
					retries: 1,
					notifications: {
						inbound: {
							email: {
								send_to: ''
							}
						},
						outbound: {
							email: {
								send_to: ''
							}
						}
					}
				};

			if (typeof user === 'undefined') {
				return default_faxbox;
			} else {
				return $.extend(true, {}, default_faxbox, {
							name: user.first_name.concat(' ', user.last_name, _t('faxbox', 'default_settings_name_extension')),
							caller_name: user.first_name.concat(' ', user.last_name),
							fax_header: winkstart.config.company_name.concat(_t('faxbox', 'default_settings_header_extension')),
							fax_timezone: user.timezone,
							owner_id: user.id,
							notifications: {
								inbound: {
									email: {
										send_to: user.email || user.username
									}
								},
								outbound: {
									email: {
										send_to: user.email || user.username
									}
								}
							}
						}
					);
			}
		},

		popup_edit_faxbox: function(data, callback, data_defaults) {
			var popup, popup_html;

			popup_html = $('<div class="inline_popup"><div class="inline_content main_content"/></div>');

			winkstart.publish('faxbox.edit', data, popup_html, $('.inline_content', popup_html), {
				save_success: function(_data) {
					popup.dialog('close');

					if ( typeof callback == 'function' ) {
						callback(_data);
					}
				},
				delete_success: function() {
					popup.dialog('close');

					if ( typeof callback == 'function' ) {
						callback({ data: {} });
					}
				},
				after_render: function() {
					popup = winkstart.dialog(popup_html, {
						title: _t('faxbox', (data.id ? 'edit' : 'create').concat('_faxbox'))
					});
				}
			}, data_defaults);
		},

		define_callflow_nodes: function(callflow_nodes) {
			var THIS = this;

			$.extend(callflow_nodes, {
				 'faxbox[id=*]': {
					name: _t('faxbox', 'faxboxes_label'),
					icon: 'printer2',
					category: _t('config', 'advanced_cat'),
					module: 'faxbox',
					tip: _t('faxbox', 'faxbox_tip'),
					data: {
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

						winkstart.request(true, 'faxbox.list', {
								account_id: winkstart.apps['voip'].account_id,
								api_url: winkstart.apps['voip'].api_url
							},
							function(data, status) {
								var popup, popup_html;

								popup_html = THIS.templates.faxbox_callflow.tmpl({
									_t: function(param){
										return window.translate['faxbox'][param];
									},
									items: winkstart.sort(data.data),
									selected: node.getMetadata('id') || ''
								});

								if($('#faxbox_selector option:selected', popup_html).val() == undefined) {
									$('#edit_link', popup_html).hide();
								}

								$('.inline_action', popup_html).click(function(ev) {
									var _data = ($(this).dataset('action') == 'edit') ?
													{ id: $('#faxbox_selector', popup_html).val() } : {};

									ev.preventDefault();

									winkstart.publish('faxbox.popup_edit', _data, function(_data) {
										node.setMetadata('id', _data.data.id || 'null');

										node.caption = _data.data.name || '';

										popup.dialog('close');
									});
								});

								$('#add', popup_html).click(function() {
									node.setMetadata('id', $('#faxbox_selector', popup_html).val());

									node.caption = $('#faxbox_selector option:selected', popup_html).text();

									popup.dialog('close');
								});

								popup = winkstart.dialog(popup_html, {
									title: _t('faxbox', 'voicemail_title'),
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
				}
			});
		}
	}
);
