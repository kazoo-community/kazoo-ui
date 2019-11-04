winkstart.module('call_center', 'queue', {
	css: [
		'css/queue.css'
	],

	templates: {
		queue: 'tmpl/queue.html',
		edit: 'tmpl/edit.html',
		queue_callflow: 'tmpl/queue_callflow.html',
		agent_pause_callflow: 'tmpl/agent_pause_callflow.html',
		agent_presence_callflow: 'tmpl/agent_presence_callflow.html',
		agent_availability_callflow: 'tmpl/agent_availability_callflow.html',
		agent_availability_key_callflow: 'tmpl/agent_availability_key_callflow.html',
		required_skills_callflow: 'tmpl/required_skills_callflow.html',
		required_skills_callflow_row: 'tmpl/required_skills_callflow_row.html',
		set_call_priority_callflow: 'tmpl/set_call_priority_callflow.html',
		wait_time_callflow: 'tmpl/wait_time_callflow.html',
		wait_time_key_callflow: 'tmpl/wait_time_key_callflow.html',
		add_agents: 'tmpl/add_agents.html',
		edit_agents: 'tmpl/edit_agents.html',
		selected_agent: 'tmpl/selected_agent.html',
		available_user: 'tmpl/available_user.html',
		account_fields: 'tmpl/account_fields.html'
	},

	subscribe: {
		'queue.activate': 'activate',
		'queue.edit': 'edit_queue',
		'callflow.define_callflow_nodes': 'define_callflow_nodes',
		'queue.popup_edit': 'popup_edit_queue',
		'call_center.render_account_fields': 'render_account_fields'
	},

	validation: [
		{ name: '#name', regex: /.+/ },
		{ name: '#caller_exit_key', regex: /^[0-9*#]{0,1}$/ }
	],

	resources: {
		'agent.update_queue_status': {
			url: '{api_url}/accounts/{account_id}/agents/{agent_id}/queue_status',
			contentType: 'application/json',
			verb: 'POST'
		},
		'queue.list': {
			url: '{api_url}/accounts/{account_id}/queues',
			contentType: 'application/json',
			verb: 'GET'
		},
		'queue.get': {
			url: '{api_url}/accounts/{account_id}/queues/{queue_id}',
			contentType: 'application/json',
			verb: 'GET'
		},
		'queue.get_stats': {
			url: '{api_url}/accounts/{account_id}/queues/{queue_id}/stats',
			contentType: 'application/json',
			verb: 'GET'
		},
		'queue.create': {
			url: '{api_url}/accounts/{account_id}/queues',
			contentType: 'application/json',
			verb: 'PUT'
		},
		'queue.update': {
			url: '{api_url}/accounts/{account_id}/queues/{queue_id}',
			contentType: 'application/json',
			verb: 'POST'
		},
		'queue.list_users': {
			url: '{api_url}/accounts/{account_id}/queues/{queue_id}/roster',
			contentType: 'application/json',
			verb: 'GET',
			trigger_events: false
		},
		'queue.update_users': {
			url: '{api_url}/accounts/{account_id}/queues/{queue_id}/roster',
			contentType: 'application/json',
			verb: 'POST'
		},
		'queue.delete': {
			url: '{api_url}/accounts/{account_id}/queues/{queue_id}',
			contentType: 'application/json',
			verb: 'DELETE'
		},
		'queue.user_list': {
			url: '{api_url}/accounts/{account_id}/users',
			contentType: 'application/json',
			verb: 'GET'
		},
		'queue.media_list': {
			url: '{api_url}/accounts/{account_id}/media',
			contentType: 'application/json',
			verb: 'GET'
		},
		'queue.classifiers_list': {
			url: '{api_url}/accounts/{account_id}/phone_numbers/classifiers',
			contentType: 'application/json',
			verb: 'GET'
		}
	}
},

function(args) {
	var THIS = this;

	winkstart.registerResources(THIS.__whapp, THIS.config.resources);

	winkstart.publish('whappnav.subnav.add', {
		whapp: 'call_center',
		module: THIS.__module,
		label: _t('queue', 'manage_queues'),
		icon: 'wrench_left',
		weight: '10',
	});
},

{
	global_timer: false,

	queue_get_stats: function(queue_id, success, error) {
		winkstart.request(true, 'queue.get_stats', {
			account_id: winkstart.apps['call_center'].account_id,
			api_url: winkstart.apps['call_center'].api_url,
			queue_id: queue_id,
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
	},

	queue_update_users: function(array_users, queue_id, success, error) {
		winkstart.request(true, 'queue.update_users', {
			account_id: winkstart.apps['call_center'].account_id,
			api_url: winkstart.apps['call_center'].api_url,
			queue_id: queue_id,
			data: array_users
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
	},

	save_queue: function(form_data, data, success, error) {
		var THIS = this,
			normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

		if (typeof data.data == 'object' && data.data.id) {
			winkstart.request(true, 'queue.update', {
				account_id: winkstart.apps['call_center'].account_id,
				api_url: winkstart.apps['call_center'].api_url,
				queue_id: data.data.id,
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
			winkstart.request(true, 'queue.create', {
				account_id: winkstart.apps['call_center'].account_id,
				api_url: winkstart.apps['call_center'].api_url,
				data: normalized_data
			},
			function (_data, status) {
				if(typeof success == 'function') {
					success(_data, status, 'create');
				}
			},
			function(_data, status) {
				if(typeof error == 'function') {
					error(_data, status, 'update');
				}
			}

			);
		}
	},

	update_single_user: function(user_id, queue_id, action, callback) {
		var THIS = this;

		winkstart.request(false, 'user.get', {
			account_id: winkstart.apps['call_center'].account_id,
			api_url: winkstart.apps['call_center'].api_url,
			user_id: user_id
		},
		function(_data, status) {
			if(action =='add') {
				if(!_data.data.queues || typeof _data.data.queues != 'object') {
					_data.data.queues = [];
				}
				_data.data.queues.push(queue_id);

				/* If a user is added to a queue, but is not enabled as an agent, we enable this user automatically */
				if(!('queue_pin' in _data.data)) {
					_data.data.queue_pin = '';
				}
			}
			else { //remove
				_data.data.queues.splice(_data.data.queues.indexOf(queue_id), 1);
			}

			winkstart.request(false, 'user.update', {
				account_id: winkstart.apps['call_center'].account_id,
				api_url: winkstart.apps['call_center'].api_url,
				user_id: user_id,
				data: _data.data
			},
			function(_data, status) {
				if(typeof callback === 'function') {
					callback(status);
				}
			},
			function(_data, status) {
				if(typeof callback === 'function') {
					callback(status);
				}
			}
			);
		}
		);
	},

	get_users_list: function(queue_id, callback) {
		winkstart.request(true, 'queue.list_users', {
			account_id: winkstart.apps['call_center'].account_id,
			api_url: winkstart.apps['call_center'].api_url,
			queue_id: queue_id
		},
		function(_data) {
			callback(_data.data);
		}
		);
	},

	update_users: function(data, queue_id, success) {
		var THIS = this,
			add_list = $(data.new_list).not(data.old_list).get(),
			remove_list = $(data.old_list).not(data.new_list).get();

		THIS.get_users_list(queue_id, function(current_list) {
			var update_list = $.unique($(current_list.concat(add_list)).not(remove_list).get());

			THIS.queue_update_users(update_list, queue_id, function() {
				if(typeof success === 'function') {
					success();
				}
			});
		});
	},

	edit_queue: function(data, _parent, _target, _callbacks, data_defaults){
		var THIS = this,
			parent = _parent || $('#queue-content'),
			target = _target || $('#queue-view', parent),
			_callbacks = _callbacks || {},
			callbacks = {
				save_success: _callbacks.save_success || function(_data) {
					THIS.render_list(parent);

					THIS.edit_queue({ id: _data.data.id }, parent, target, callbacks);
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
					connection_timeout: '0',
					member_timeout: '5',
					agent_wrapup_time: '30',
					record_caller: true,
					moh: {},
					notifications: {},
					max_queue_size: '0',
					announcements: {
						position_announcements_enabled: false,
						wait_time_announcements_enabled: false,
						interval: 30
					}
				}, data_defaults || {}),
				field_data: {
					classifiers: {}
					/*sort_by: {
						'first_name': 'First Name',
						'last_name': 'Last Name'
					}*/
				},
				record_caller_disabled: 'disabled'
			};

		winkstart.parallel({
			classifiers_list: function(callback) {
				winkstart.request(true, 'queue.classifiers_list', {
					account_id: winkstart.apps['call_center'].account_id,
					api_url: winkstart.apps['call_center'].api_url
				},
				function(_data_classifiers, status) {
					var classifiers = {};

					if('data' in _data_classifiers) {
						$.each(_data_classifiers.data, function(k, v) {
							classifiers[k] = {
								enabled: true,
								friendly_name: v.friendly_name
							};
						});
					}

					callback(null, classifiers);
				}
				);
			},
			media_list: function(callback) {
				winkstart.request(true, 'queue.media_list', {
					account_id: winkstart.apps['call_center'].account_id,
					api_url: winkstart.apps['call_center'].api_url
				},
				function(_data_media, status) {
					_data_media.data.sort(function(a, b){return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1});
					_data_media.data.unshift(
						{
							id: '',
							name: _t('queue', 'default_music')
						},
						{
							id: 'silence_stream://300000',
							name: _t('queue', 'silence')
						}
					);

					callback(null, _data_media.data);
				}
				);
			},
			queue_get: function(callback) {
				if(typeof data == 'object' && data.id) {
					//THIS.queue_get_stats(data.id, function(_data_stat) {
					winkstart.request(true, 'queue.get', {
						account_id: winkstart.apps['call_center'].account_id,
						api_url: winkstart.apps['call_center'].api_url,
						queue_id: data.id
					},
					function(_data, status) {
						callback(null, _data);
					}
					);
					//});
				}
				else {
					callback(null, null);
				}
			},
			user_list: function(callback) {
				winkstart.request(true, 'queue.user_list', {
					account_id: winkstart.apps['call_center'].account_id,
					api_url: winkstart.apps['call_center'].api_url
				},
				function(_data, status) {
					var users = {};

					$.each(_data.data, function(k, v) {
						users[v.id] = v;
					});

					callback(null, users);
				}
				);
			}
		},
		function(err, results) {
			defaults.field_data.classifiers = results.classifiers_list;
			defaults.field_data.media = results.media_list;
			defaults.field_data.users = results.user_list;

			if(typeof data == 'object' && data.id) {
				var render_data = $.extend(true, defaults, results.queue_get);
				render_data.field_data.old_list = [];
				render_data.stats = {};// _data_stat.data;
				if('agents' in results.queue_get.data) {
					render_data.field_data.old_list = results.queue_get.data.agents;
				}
				render_data.record_caller_disabled = render_data.data.record_caller ? '' : 'disabled';
				render_data.data.hide_in_dashboard = winkstart.apps.call_center.hidden_in_dashboard(render_data.data.id, 'queues');

				// Classifier default values
				if(render_data.data.breakout && render_data.data.breakout.classifiers) {
					$.each(render_data.data.breakout.classifiers, function(key, enabled) {
						defaults.field_data.classifiers[key].enabled = enabled;
					});
				}

				THIS.render_edit_agents(render_data, target, callbacks);

				if(typeof callbacks.after_render == 'function') {
					callbacks.after_render();
				}

				var polling_interval = 10,
					queue_poll = function() {
						if ($('#agents-form').size() === 0 || $('#update_list').size() !== 0) {
							clearInterval(THIS.global_timer);
						} else {
							THIS.get_users_list(data.id, function(current_list) {
								var add_count = $(current_list).not(render_data.field_data.old_list).length,
									remove_count = $(render_data.field_data.old_list).not(current_list).length;

								if (add_count > 0 || remove_count > 0) {
									$('#agents-grid_wrapper').before($('<div/>', {
										'class': 'alert-message warning',
										'style': 'cursor: pointer',
										'id': 'update_list',
										'html': '<p><strong>Agents List Has Changed!</strong> Click here to update the list.</p>',
										'click': function() {
											$(this).remove();
											THIS.edit_queue({ id: data.id });
										}
									}));
								}
							});
						}
					};

				clearInterval(THIS.global_timer);
				THIS.global_timer = setInterval(queue_poll, polling_interval * 1000);
			}
			else {
				defaults.data.breakout = {
					dtmf: '1'
				};
				THIS.render_queue(defaults, target, callbacks);

				if(typeof callbacks.after_render == 'function') {
					callbacks.after_render();
				}
			}
		}
		);
	},

	delete_queue: function(data, success, error) {
		var THIS = this;

		if(typeof data.data == 'object' && data.data.id) {
			winkstart.request(true, 'queue.delete', {
				account_id: winkstart.apps['call_center'].account_id,
				api_url: winkstart.apps['call_center'].api_url,
				queue_id: data.data.id
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

	render_account_fields: function(parent, data, callback) {
		data._t = function(param){
			return window.translate['queue'][param];
		};
		var THIS = this,
			fields_html = THIS.templates.account_fields.tmpl(data);

		$('*[rel=popover]', fields_html).popover({
			trigger: 'focus'
		});

		$('*[rel=popover]:not([type="text"])', fields_html).popover({
			trigger: 'hover'
		});

		parent.find('#options').append(fields_html);

		callback && callback();

		return false;
	},

	render_edit_agents: function(data, target, callbacks) {
		data._t = function(param){
			return window.translate['queue'][param];
		};
		var THIS = this,
			agents_html = THIS.templates.edit_agents.tmpl(data);

		THIS.render_reports(data, agents_html);
		THIS.render_user_list(data, agents_html);

		$('.detail_queue', agents_html).click(function() {
			THIS.popup_edit_queue(data, callbacks);
		});

		$('.view_stats', agents_html).click(function() {
			winkstart.publish('dashboard.activate_queue_stat', { id: $(this).dataset('id'), parent: $('#ws-content') });
		});

		(target)
			.empty()
			.append(agents_html);
	},

	render_queue: function(data, target, callbacks){
		data._t = function(param){
			return window.translate['queue'][param];
		};
		var THIS = this,
			queue_html = THIS.templates.edit.tmpl(data);

		winkstart.validate.set(THIS.config.validation, queue_html);

		$('*[rel=popover]', queue_html).popover({
			trigger: 'focus'
		});

		$('*[rel=popover]:not([type="text"])', queue_html).popover({
			trigger: 'hover'
		});

		winkstart.tabs($('.view-buttons', queue_html), $('.tabs', queue_html));

		if(!$('#moh', queue_html).val()) {
			$('#edit_link_media', queue_html).hide();
		}

		$('#moh', queue_html).change(function() {
			!$('#moh option:selected', queue_html).val() ? $('#edit_link_media', queue_html).hide() : $('#edit_link_media', queue_html).show();
		});

		$('.inline_action_media', queue_html).click(function(ev) {
			var _data = ($(this).dataset('action') == 'edit') ? { id: $('#moh', queue_html).val() } : {},
				_id = _data.id;

			ev.preventDefault();

			function sort_moh_select_list(){
				var select = $('#moh', queue_html);
				var selected = select.val();
				var opts_list = select.find('option');
				opts_list.sort(function(a, b) {
					if ($(a).text() == _t('queue', 'default_music') ||  $(a).text() == _t('queue', 'silence')) return -1;
					if ($(b).text() == _t('queue', 'default_music') ||  $(b).text() == _t('queue', 'silence')) return 1;
					return $(a).text().toLowerCase() > $(b).text().toLowerCase() ? 1 : -1;
				});
				select.html('').append(opts_list);
				select.val(selected);
			}

			winkstart.publish('media.popup_edit', _data, function(_data) {
				/* Create */
				if(!_id) {
					$('#moh', queue_html).append('<option id="'+ _data.data.id  +'" value="'+ _data.data.id +'">'+ _data.data.name +'</option>')
					$('#moh', queue_html).val(_data.data.id);

					$('#edit_link_media', queue_html).show();
					sort_moh_select_list();
				}
				else {
					/* Update */
					if('id' in _data.data) {
						$('#moh #'+_data.data.id, queue_html).text(_data.data.name);
						sort_moh_select_list();
					}
					/* Delete */
					else {
						$('#moh #'+_id, queue_html).remove();
						$('#edit_link_media', queue_html).hide();
					}
				}
			});
		});

		if(!data.data.breakout) {
			$('.queue-classifiers-row', queue_html).hide();
		}
		$('input[name="breakout.dtmf"]', queue_html).change(function() {
			$('.queue-classifiers-row', queue_html).toggle();
		});

		$('.queue-save', queue_html).click(function(ev) {
			ev.preventDefault();

			winkstart.validate.is_valid(THIS.config.validation, queue_html, function() {
				var form_data = form2object('queue-form');

				THIS.clean_form_data(form_data);

				THIS.save_queue(form_data, data, callbacks.save_success, winkstart.error_message.process_error(callbacks.save_error));

				winkstart.apps.call_center.set_visibility_in_dashboard(data.data.id, 'queues', form_data.hide_in_dashboard);
			},
			function() {
				winkstart.alert(_t('queue', 'there_were_errors_on_the_form'));
			}
			);
		});

		$('.queue-delete', queue_html).click(function(ev) {
			ev.preventDefault();

			winkstart.confirm(_t('queue', 'this_will_remove_this_queue'), function() {
				THIS.delete_queue(data, callbacks.delete_success, callbacks.delete_error);
			});
		});

		(target)
			.empty()
			.append(queue_html);
	},

	normalize_data: function(form_data) {
		if(typeof form_data.breakout.dtmf == 'boolean') {
			if(form_data.breakout.dtmf) {
				form_data.breakout.dtmf = '1';
			}
			else {
				delete form_data.breakout;
			}
		}
		if(form_data.breakout && form_data.breakout.classifiers) {
			var normalized_classifiers = {};
			$.each(form_data.breakout.classifiers, function(key, value) {
				if(value == 'deny') {
					// True values not written as they are implied
					normalized_classifiers[key] = false;
				}
			});
			form_data.breakout.classifiers = normalized_classifiers;
		}
		if (typeof form_data.caller_exit_key === 'string' && form_data.caller_exit_key.length === 0) {
			delete form_data.caller_exit_key;
		}
		delete form_data.users;
		return form_data;
	},

	clean_form_data: function(form_data) {
		delete form_data.user_id;
	},

	render_list: function(_parent, callback){
		var THIS = this,
			parent = _parent || $('#queue-content');;

		winkstart.request(true, 'queue.list', {
			account_id: winkstart.apps['call_center'].account_id,
			api_url: winkstart.apps['call_center'].api_url
		},
		function (data, status) {
			var map_crossbar_data = function(data) {
				var new_list = [];

				if(data.length > 0) {
					$.each(data, function(key, val) {
						new_list.push({
							id: val.id,
							title: val.name || _t('queue', 'no_name')
						});
					});
				}

				new_list.sort(function(a, b) {
					return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
				});

				return new_list;
			};

			$('#queue-listpanel', parent)
				.empty()
				.listpanel({
					label: 'Queues',
					identifier: 'queue-listview',
					new_entity_label: _t('queue', 'add_acd'),
					data: map_crossbar_data(data.data),
					publisher: winkstart.publish,
					notifyMethod: 'queue.edit',
					notifyCreateMethod: 'queue.edit',
					notifyParent: parent
				});

			if(typeof callback === 'function') {
				callback();
			}
		}
		);
	},

	activate: function(args) {
		var THIS = this,
			queue_html = THIS.templates.queue.tmpl(),
			args = args || {};

		(args.parent || $('#ws-content'))
			.empty()
			.append(queue_html);

		THIS.render_list(queue_html, args.callback);
	},

	render_reports: function(data, parent) {
		var THIS = this,
			tab_data = [];

		THIS.setup_reports(parent);

		if(data.stats) {
			$.each(data.stats, function(k, v) {
				if(v.calls) {
					$.each(v.calls, function(k2, v2) {
						if(v2.duration && v2.wait_time && v2.agent_id) {
							if(v2.agent_id in data.field_data.users) {
								tab_data.push([k2, winkstart.friendly_seconds(v2.duration), data.field_data.users[v2.agent_id].first_name + ' ' + data.field_data.users[v2.agent_id].last_name, v.recorded_at]);
							}
							else {
								tab_data.push([k2, winkstart.friendly_seconds(v2.duration), 'Unknown', v.recorded_at]);
							}
						}
						else {
							tab_data.push([k2, '-', 'None ('+ v2.abandoned +')', v.recorded_at]);
						}
					});
				}
			});
		}

		winkstart.table.reports.fnAddData(tab_data);
	},

	render_user_list: function(data, parent) {
		var THIS = this,
			user_data = {},
			sorted_users = [],
			list_names = [];

		THIS.setup_table(parent);

		/* First we're going through the list of users to get the last names */
		$.each(data.field_data.users, function(k, v) {
			if(v.last_name && list_names.indexOf(v.last_name.toLowerCase()) < 0) {
				list_names.push(v.last_name.toLowerCase());
			}
		});

		/* Then we sort the array */
		list_names.sort();

		/* We build the function which will be use the second time we'll loop over users */
		var build_sort_users = function(k, user) {
			if(user.last_name) {
				if(sorted_users[list_names.indexOf(user.last_name.toLowerCase())]) {
					sorted_users[list_names.indexOf(user.last_name.toLowerCase())].push({
						first_name: user.first_name,
						last_name: user.last_name,
						id: user.id
					});
				}
				else {
					sorted_users[list_names.indexOf(user.last_name.toLowerCase())] = [{
						first_name: user.first_name,
						last_name: user.last_name,
						id: user.id
					}];
				}
			}
		};

		if(data.data.id && 'agents' in data.data && data.data.agents.length > 0) {
			$.each(data.field_data.users, function(k, v) {
				if(data.data.agents.indexOf(v.id) >= 0) {
					user_data[v.id] = {
						first_name: v.first_name,
						last_name: v.last_name,
						id: v.id
					}
				}

				build_sort_users(k, v);
			});

			THIS.refresh_table(user_data);
		}
		else {
			$.each(data.field_data.users, function(k, v) {
				build_sort_users(k, v);
			});
		}

		$('#select_all_agents', parent).click(function() {
			$('.select_agent', parent).prop('checked', $(this).is(':checked'));
		});

		$('#add_agents', parent).click(function(ev) {
			ev.preventDefault();

			var add_agents_html = THIS.templates.add_agents.tmpl({
					_t: function(param){
						return window.translate['queue'][param];
					}
				}),
				popup_agents = winkstart.dialog(add_agents_html, {
					title: _t('queue', 'select_agents')
				});

			var count_agents = 0;
			$.each(sorted_users, function(k, v) {
				$.each(v, function(k2, v2) {
					if(!(v2.id in user_data)) {
						$('.unassigned_users', popup_agents).append(THIS.templates.available_user.tmpl(v2));
					}
					else {
						count_agents++;
						$('.list_agents', popup_agents).append(THIS.templates.selected_agent.tmpl(v2))
					}
				});
			});

			$('.count_agents', popup_agents).html(count_agents);

			$('.new_searchfield', popup_agents).keyup(function() {
				var input = $(this),
					rows = $('.unassigned_users .user_box', popup_agents),
					search_string = $.trim(input.val().toLowerCase()),
					matches = [],
					cache = {};

				$.each(rows, function(k, v) {
					var data = $(this).dataset(),
						key = data.first_name.toLowerCase() + ' ' + data.last_name.toLowerCase();

					cache[key] ? cache[key].push($(this)) : cache[key] = [ $(this) ];
				});

				if (!search_string) {
					rows.show();
				}
				else {
					rows.hide();

					$.each(cache, function(k, row_array) {
						if (k.indexOf(search_string)>-1) {
							$.each(row_array, function(k, v) {
								matches.push(v);
							});
						}
					});

					$.each(matches, function(k, v) {
						$(v).show();
					});
				}
			});

			$(popup_agents).delegate('.queue_agent', 'click', function() {
				var agentsList = $('.unassigned_users .user_box', popup_agents);
				for(var i = 0; i < agentsList.length; i++) {
					var agentEl = $(agentsList[i]);
					if($(this).dataset().last_name.toLowerCase() <
						agentEl.attr('data-last_name').toLowerCase()
					) {
						THIS.templates.available_user.tmpl($(this).dataset()).insertBefore(agentEl);
						break;
					}
					if(i == agentsList.length-1) {
						$('.unassigned_users', popup_agents).append(THIS.templates.available_user.tmpl($(this).dataset()));
					}
				}
				if(agentsList.length == 0) {
					$('.unassigned_users', popup_agents).append(THIS.templates.available_user.tmpl($(this).dataset()));
				}
				$(this).remove();
				$('.count_agents', popup_agents).html(--count_agents);
			});

			$(popup_agents).delegate('.user_box', 'click', function() {
				var agentsList = $('.list_agents .queue_agent', popup_agents);
				for(var i = 0; i < agentsList.length; i++) {
					var agentEl = $(agentsList[i]);
					if($(this).dataset().last_name.toLowerCase() <
						agentEl.attr('data-last_name').toLowerCase()
					) {
						THIS.templates.selected_agent.tmpl($(this).dataset()).insertBefore(agentEl);
						break;
					}
					if(i == agentsList.length-1) {
						$('.list_agents', popup_agents).append(THIS.templates.selected_agent.tmpl($(this).dataset()));
					}
				}
				if(agentsList.length == 0) {
					$('.list_agents', popup_agents).append(THIS.templates.selected_agent.tmpl($(this).dataset()));
				}
				$(this).remove();
				$('.count_agents', popup_agents).html(++count_agents);
			});

			$('.create-agent', popup_agents).click(function() {
				var _data = {};

				ev.preventDefault();

				winkstart.publish('user.popup_edit', _data, function(_data) {
					var data_user = {
						first_name: _data.data.first_name,
						last_name: _data.data.last_name,
						id: _data.data.id
					};

					$('.unassigned_users', popup_agents).prepend(THIS.templates.available_user.tmpl(data_user));
				});
			});

			$('.add-agents', popup_agents).click(function() {
				new_list = [],
				//raw_data = winkstart.table.agents.fnGetData();

				$('.list_agents .queue_agent', popup_agents).each(function(k, v) {
					new_list.push($(this).dataset('id'));
				});

				data.field_data.user_list = {
					old_list: data.data.agents || [],
					new_list: new_list
				};

				THIS.update_users(data.field_data.user_list, data.data.id, function() {
					//refresh grid
					THIS.edit_queue({ id: data.data.id });

					$(popup_agents).dialog('close');
				});
			});
		});

		$('#remove_agents', parent).click(function(ev) {
			ev.preventDefault();

			if($('.select_agent:checked', parent).size() > 0) {
				var map_agents = {};

				$.each(data.data.agents, function(k, v) {
					map_agents[v] = true;
				});

				$('.select_agent:checked', parent).each(function(k, v) {
					delete map_agents[$(this).dataset('id')];
				});

				data.field_data.user_list = {
					old_list: data.data.agents || [],
					new_list: []
				};

				$.each(map_agents, function(k, v) {
					data.field_data.user_list.new_list.push(k);
				});

				THIS.update_users(data.field_data.user_list, data.data.id, function() {
					THIS.edit_queue({ id: data.data.id });
				});
			}
			else {
				winkstart.alert(_t('queue', 'you_didnt_select_any_agent'));
			}
		});

		$(parent).delegate('.action_user.edit', 'click', function() {
			var _data = {
				id: $(this).parents('tr').first().attr('id')
			};

			winkstart.publish('user.popup_edit', _data, function(_data) {
				user_data[_data.data.id] = {
					first_name: _data.data.first_name,
					last_name: _data.data.last_name
				};

				THIS.refresh_table(user_data);
			});
		});
	},

	refresh_table: function(user_data) {
		var THIS = this,
			tab_data = [];

		winkstart.table.agents.fnClearTable();

		$.each(user_data, function(k, v) {
			tab_data.push([k, k, v.first_name + ' ' + v.last_name, k]);
		});

		winkstart.table.agents.fnAddData(tab_data);
	},

	setup_reports: function(parent) {
		var THIS = this,
			columns = [
				{
					'sTitle': _t('queue', 'call_id_title')
				},
				{
					'sTitle': _t('queue', 'duration_title')
				},
				{
					'sTitle': _t('queue', 'agent_title')
				},
				{
					'sTitle': _t('queue', 'recorded_at_title'),
					'fnRender': function(obj) {
						var timestamp = obj.aData[obj.iDataColumn];
						return winkstart.friendly_timestamp(timestamp);
					}
				}
			];

		winkstart.table.create('reports', $('#reports-grid', parent), columns, {}, {
			sDom: '<"buttons_div">frtlip',
			bAutoWidth: false,
			aaSorting: [[3, 'desc']],
		});

		$('#reports-grid_filter input[type=text]', parent).first().focus();

		$('.cancel-search', parent).click(function(){
			$('#reports-grid_filter input[type=text]', parent).val('');
			winkstart.table.reports.fnFilter('');
		});
	},

	setup_table: function(parent) {
		var THIS = this,
			columns = [
				{
					'sTitle': '<input type="checkbox" id="select_all_agents"/>',
					'fnRender': function(obj) {
						var id = obj.aData[obj.iDataColumn];
						return '<input data-id="'+ id +'" type="checkbox" class="select_agent"/>';
					},
					'bSortable': false,
					'sWidth': '5%'
				},
				{
					'sTitle': 'ID',
					'bVisible': false
				},
				{
					'sTitle': '<span class="icon medium user"></span> User',
					'sWidth': '80%',
					'fnRender': function(obj) {
						var name = obj.aData[obj.iDataColumn];
						return '<a class="action_user edit">'+ name +'</a>';
					}
				},
				{
					'sTitle': _t('queue', 'actions_title'),
					'sWidth': '15%',
					'bSortable': false,
					'fnRender': function(obj) {
						var id = obj.aData[obj.iDataColumn];
						return '<a class="action_user edit icon medium pencil" data-id="'+ id +'"></a>';
					}
				}
			];

		winkstart.table.create('agents', $('#agents-grid', parent), columns, {}, {
			sDom: '<"buttons_div">frtlip',
			bAutoWidth: false,
			aaSorting: [[2, 'asc']],
			fnRowCallback: function(nRow, aaData, iDisplayIndex) {
				$(nRow).attr('id', aaData[1]);
				return nRow;
			}
		});

		$('#agents .buttons_div', parent).html('<button class="btn primary" id="add_agents">' + _t('queue', 'add_agents') + '</button>&nbsp;<button class="btn danger" id="remove_agents">' + _t('queue', 'remove_selected_agents') + '</button>');

		$('#agents-grid_filter input[type=text]', parent).first().focus();

		$('.cancel-search', parent).click(function(){
			$('#agents-grid_filter input[type=text]', parent).val('');
			winkstart.table.agents.fnFilter('');
		});
	},

	popup_edit_queue: function(data, callbacks, data_defaults) {
		var THIS = this,
			popup = winkstart.dialog($('<div class="inline_popup"><div class="inline_content main_content"/></div>'), {
				title: _t('queue', 'edit_queue_title'),
				position: ['center', 100]
			});

		THIS.render_queue(data, $('.main_content', popup), {
			save_success: function(_data) {
				popup.dialog('close');

				if(typeof callbacks.save_success == 'function') {
					callbacks.save_success(_data);
				}
			},
			delete_success: function() {
				popup.dialog('close');

				if(typeof callbacks.delete_success == 'function') {
					callbacks.delete_success({ data: {} });
				}
			}
		}, data_defaults);
	},

	define_callflow_nodes: function(callflow_nodes) {
		var THIS = this;

		$.extend(callflow_nodes, {
			'acdc_member[id=*]': {
				name: _t('queue', 'queue'),
				icon: 'queue',
				category: _t('config', 'call_center_cat'),
				module: 'acdc_member',
				tip: _t('queue', 'queue_tip'),
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

					if(node.getMetadata('enter_as_callback')) {
						returned_value += ': Enter as callback';
					}

					return returned_value;
				},
				edit: function(node, callback) {
					var _this = this;

					winkstart.request(true, 'queue.list',  {
						account_id: winkstart.apps['call_center'].account_id,
						api_url: winkstart.apps['call_center'].api_url
					},
					function(data, status) {
						var popup,
							queues = data
								&& Array.isArray(data.data)
								&& data.data.sort(function(a, b) {
									var nameA = String(a.name),
										nameB = String(b.name);

									// Natural sort by queue name
									return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
								}),
							popup_html = THIS.templates.queue_callflow.tmpl({
								_t: function(param){
									return window.translate['queue'][param];
								},
								title: _t('queue', 'connect_a_caller_to_a_queue'),
								items: queues,
								selected: node.getMetadata('id') || '',
								route_var: node.getMetadata('var') || '',
								enter_as_callback: node.getMetadata('enter_as_callback')
							});

						if($('#queue_selector option:selected', popup_html).val() == undefined) {
							$('#edit_link', popup_html).hide();
						}

						$('.inline_action', popup_html).click(function(ev) {
							var _data = ($(this).dataset('action') == 'edit') ?
								{ id: $('#queue_selector', popup_html).val() } : {};

							ev.preventDefault();

							winkstart.publish('queue.popup_edit', _data, function(_data) {
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
							node.setMetadata('id', $('#queue_selector', popup).val());
							if($('#route_var', popup_html).val().length > 0) {
								node.setMetadata('var', $('#route_var', popup_html).val());
							} else {
								node.deleteMetadata('var');
							}

							node.caption = $('#queue_selector option:selected', popup).text();

							if($('[name=enter_as_callback]', popup_html).prop('checked')) {
								node.setMetadata('enter_as_callback', true);
								node.caption += ': Enter as callback';
							}
							else {
								node.deleteMetadata('enter_as_callback');
							}

							popup.dialog('close');
						});

						popup = winkstart.dialog(popup_html, {
							title: _t('queue', 'queue_title'),
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
			'acdc_queue[id=*,action=login]': {
				name: _t('queue', 'queue_login'),
				icon: 'queue',
				category: _t('config', 'call_center_cat'),
				module: 'acdc_queue',
				tip: _t('queue', 'queue_login_tip'),
				data: {
					id: 'null',
					action: 'login'
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

					winkstart.request(true, 'queue.list',  {
						account_id: winkstart.apps['call_center'].account_id,
						api_url: winkstart.apps['call_center'].api_url
					},
					function(data, status) {
						var popup, popup_html;

						popup_html = THIS.templates.queue_callflow.tmpl({
							_t: function(param){
								return window.translate['queue'][param];
							},
							title: _t('queue', 'connects_an_agent_to_a_queue'),
							items: data.data,
							selected: node.getMetadata('id') || '',
							route_var: node.getMetadata('var') || ''
						});

						if($('#queue_selector option:selected', popup_html).val() == undefined) {
							$('#edit_link', popup_html).hide();
						}

						$('.inline_action', popup_html).click(function(ev) {
							var _data = ($(this).dataset('action') == 'edit') ?
								{ id: $('#queue_selector', popup_html).val() } : {};

							ev.preventDefault();

							winkstart.publish('queue.popup_edit', _data, function(_data) {
								node.setMetadata('id', _data.data.id || 'null');

								node.caption = _data.data.name || '';

								popup.dialog('close');
							});
						});

						$('#add', popup_html).click(function() {
							node.setMetadata('id', $('#queue_selector', popup).val());

							node.caption = $('#queue_selector option:selected', popup).text();

							popup.dialog('close');
						});

						popup = winkstart.dialog(popup_html, {
							title: _t('queue', 'queue_title'),
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
			'acdc_queue[id=*,action=logout]': {
				name: _t('queue', 'queue_logout'),
				icon: 'queue',
				category: _t('config', 'call_center_cat'),
				module: 'acdc_queue',
				tip: _t('queue', 'queue_logout_tip'),
				data: {
					id: 'null',
					action: 'logout'
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

					winkstart.request(true, 'queue.list',  {
						account_id: winkstart.apps['call_center'].account_id,
						api_url: winkstart.apps['call_center'].api_url
					},
					function(data, status) {
						var popup, popup_html;

						popup_html = THIS.templates.queue_callflow.tmpl({
							_t: function(param){
								return window.translate['queue'][param];
							},
							title: _t('queue', 'disconnects_an_agent_from_a_queue'),
							items: data.data,
							selected: node.getMetadata('id') || '',
							route_var: node.getMetadata('var') || ''
						});

						if($('#queue_selector option:selected', popup_html).val() == undefined) {
							$('#edit_link', popup_html).hide();
						}

						$('.inline_action', popup_html).click(function(ev) {
							var _data = ($(this).dataset('action') == 'edit') ?
								{ id: $('#queue_selector', popup_html).val() } : {};

							ev.preventDefault();

							winkstart.publish('queue.popup_edit', _data, function(_data) {
								node.setMetadata('id', _data.data.id || 'null');

								node.caption = _data.data.name || '';

								popup.dialog('close');
							});
						});

						$('#add', popup_html).click(function() {
							node.setMetadata('id', $('#queue_selector', popup).val());

							node.caption = $('#queue_selector option:selected', popup).text();

							popup.dialog('close');
						});

						popup = winkstart.dialog(popup_html, {
							title: _t('queue', 'queue_title'),
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
			'acdc_agent[action=paused]': {
				name: _t('queue', 'agent_pause'),
				icon: 'rightarrow',
				category: _t('config', 'call_center_cat'),
				module: 'acdc_agent',
				tip: _t('queue', 'agent_pause_tip'),
				data: {
					action: 'paused',
					timeout: '900',
					presence_id: ''
				},
				rules: [
					{
						type: 'quantity',
						maxSize: '1'
					}
				],
				isUsable: 'true',
				caption: function(node, caption_map) {
					var id = node.getMetadata('timeout');
					if(id % 1 === 0) {
						return (id) + ' seconds';
					}
					else {
						return id;
					}
				},
				edit: function(node, callback) {
					var popup, popup_html;

					popup_html = THIS.templates.agent_pause_callflow.tmpl({
						_t: function(param){
							return window.translate['queue'][param];
						},
						data_agent: {
							'timeout': node.getMetadata('timeout') || '900',
							'presence_id': node.getMetadata('presence_id')
						}
					});

					$('#add', popup_html).click(function() {
						var timeout = parseInt($('#timeout', popup_html).val()),
							presence_id = $('#presence_id', popup_html).val();

						if(timeout > 0) {
							node.setMetadata('timeout', timeout);
							node.setMetadata('presence_id', presence_id);

							node.caption = timeout + _t('queue', 'seconds');

							popup.dialog('close');
						}
						else {
							node.setMetadata('timeout', 'infinity');
							node.setMetadata('presence_id', presence_id);

							node.caption = 'infinity';

							popup.dialog('close');
						}
					});

					popup = winkstart.dialog(popup_html, {
						title: _t('queue', 'pause_agent_title'),
						minHeight: '0',
						beforeClose: function() {
							if(typeof callback == 'function') {
								callback();
							}
						}
					});

					if(typeof callback == 'function') {
						callback();
					}
				}
			},
			'acdc_agent[action=resume]': {
				name: _t('queue', 'agent_resume'),
				icon: 'rightarrow',
				category: _t('config', 'call_center_cat'),
				module: 'acdc_agent',
				tip: _t('queue', 'agent_resume_tip'),
				data: {
					action: 'resume',
					presence_id: ''
				},
				rules: [
					{
						type: 'quantity',
						maxSize: '1'
					}
				],
				isUsable: 'true',
				caption: function(node, caption_map) {
					return '';
				},
				edit: function(node, callback) {
					var popup, popup_html;

					popup_html = THIS.templates.agent_presence_callflow.tmpl({
						_t: function(param){
							return window.translate['queue'][param];
						},
						data_agent: {
							'action': _t('queue', 'resume_action'),
							'presence_id': node.getMetadata('presence_id')
						}
					});

					$('#add', popup_html).click(function() {
						var presence_id = $('#presence_id', popup_html).val();

						node.setMetadata('presence_id', presence_id);

						popup.dialog('close');
					});

					popup = winkstart.dialog(popup_html, {
						title: _t('queue', 'agent_resume_title'),
						minHeight: '0',
						beforeClose: function() {
							if(typeof callback == 'function') {
								callback();
							}
						}
					});

					if(typeof callback == 'function') {
						callback();
					}
				}
			},
			'acdc_agent[action=logout]': {
				name: _t('queue', 'logout_agent'),
				icon: 'rightarrow',
				category: _t('config', 'call_center_cat'),
				module: 'acdc_agent',
				tip: _t('queue', 'logout_agent_tip'),
				data: {
					action: 'logout',
					presence_id: ''
				},
				rules: [
					{
						type: 'quantity',
						maxSize: '1'
					}
				],
				isUsable: 'true',
				caption: function(node, caption_map) {
					return '';
				},
				edit: function(node, callback) {
					var popup, popup_html;

					popup_html = THIS.templates.agent_presence_callflow.tmpl({
						_t: function(param){
							return window.translate['queue'][param];
						},
						data_agent: {
							'action': _t('queue', 'logout_action'),
							'presence_id': node.getMetadata('presence_id')
						}
					});

					$('#add', popup_html).click(function() {
						var presence_id = $('#presence_id', popup_html).val();

						node.setMetadata('presence_id', presence_id);

						popup.dialog('close');
					});

					popup = winkstart.dialog(popup_html, {
						title: _t('queue', 'logout_agent_title'),
						minHeight: '0',
						beforeClose: function() {
							if(typeof callback == 'function') {
								callback();
							}
						}
					});

					if(typeof callback == 'function') {
						callback();
					}
				}
			},
			'acdc_agent[action=login]': {
				name: _t('queue', 'login_agent'),
				icon: 'rightarrow',
				category: _t('config', 'call_center_cat'),
				module: 'acdc_agent',
				tip: _t('queue', 'login_agent_tip'),
				data: {
					action: 'login',
					presence_id: ''
				},
				rules: [
					{
						type: 'quantity',
						maxSize: '1'
					}
				],
				isUsable: 'true',
				caption: function(node, caption_map) {
					return '';
				},
				edit: function(node, callback) {
					var popup, popup_html;

					popup_html = THIS.templates.agent_presence_callflow.tmpl({
						_t: function(param){
							return window.translate['queue'][param];
						},
						data_agent: {
							'action': _t('queue', 'login_action'),
							'presence_id': node.getMetadata('presence_id')
						}
					});

					$('#add', popup_html).click(function() {
						var presence_id = $('#presence_id', popup_html).val();

						node.setMetadata('presence_id', presence_id);

						popup.dialog('close');
					});

					popup = winkstart.dialog(popup_html, {
						title: _t('queue', 'login_agent_title'),
						minHeight: '0',
						beforeClose: function() {
							if(typeof callback == 'function') {
								callback();
							}
						}
					});

					if(typeof callback == 'function') {
						callback();
					}
				}
			},
			'acdc_agent_availability[id=*]': {
				name: _t('queue', 'agent_availability'),
				icon: 'queue',
				category: _t('config', 'call_center_cat'),
				module: 'acdc_agent_availability',
				tip: _t('queue', 'agent_availability_tip'),
				data: {
					id: 'null'
				},
				rules: [
					{
						type: 'quantity',
						maxSize: '2'
					}
				],
				isUsable: 'true',
				key_caption: function(child_node, caption_map) {
					if(child_node.key == '_') {
						child_node.key = 'available';
					}
					return child_node.key;
				},
				key_edit: function(child_node, callback) {
					var popup,
						popup_html = THIS.templates.agent_availability_key_callflow.tmpl({
							_t: function(param){
								return window.translate['queue'][param];
							},
							items: {
								'available': _t('queue', 'availability_available'),
								'unavailable': _t('queue', 'availability_unavailable')
							},
							selected: child_node.key
						});

					$('#add', popup_html).click(function() {
						child_node.key = $('#availability_key_selector', popup).val();

						child_node.key_caption = $('#availability_key_selector option:selected', popup).text();

						popup.dialog('close');
					});

					popup = winkstart.dialog(popup_html, {
						title: _t('queue', 'agent_availability'),
						minHeight: '0',
						beforeClose: function() {
							if(typeof callback == 'function') {
								callback();
							}
						}
					});
				},
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

					winkstart.request(true, 'queue.list',  {
						account_id: winkstart.apps['voip'].account_id,
						api_url: winkstart.apps['voip'].api_url
					},
					function(data, status) {
						var popup, popup_html;

						popup_html = THIS.templates.agent_availability_callflow.tmpl({
							_t: function(param){
								return window.translate['queue'][param];
							},
							title: _t('queue', 'agent_availability_title'),
							items: data.data,
							selected: node.getMetadata('id') || '',
							route_var: node.getMetadata('var') || ''
						});

						$('#add', popup_html).click(function() {
							node.setMetadata('id', $('#queue_selector', popup).val());
							if($('#route_var', popup_html).val().length > 0) {
								node.setMetadata('var', $('#route_var', popup_html).val());
							} else {
								node.deleteMetadata('var');
							}

							node.caption = $('#queue_selector option:selected', popup).text();

							popup.dialog('close');
						});

						$('#toggle_advanced', popup_html).click(function () {
							$('#route_var_div', popup_html).toggle();
						});

						popup = winkstart.dialog(popup_html, {
							title: _t('queue', 'agent_availability'),
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
			'acdc_required_skills[]': {
				name: _t('queue', 'required_skills'),
				icon: 'flag1',
				category: _t('config', 'call_center_cat'),
				module: 'acdc_required_skills',
				tip:  _t('queue', 'required_skills_tip'),
				data: {
					add: [],
					remove: []
				},
				rules: [
					{
						type: 'quantity',
						maxSize: '1'
					}
				],
				isUsable: 'true',
				caption: function(node, caption_map) {
					var add = node.getMetadata('add') || [],
						remove = node.getMetadata('remove') || [];

					return window.translate['queue']['add'] + ': ' + add.length +
						', ' + window.translate['queue']['remove'] + ': ' + remove.length;
				},
				edit: function(node, callback) {
					var popup, popup_html,
						_t = function(param) {
							return window.translate['queue'][param];
						};

					popup_html = THIS.templates.required_skills_callflow.tmpl({
						_t: _t,
						add: node.getMetadata('add'),
						remove: node.getMetadata('remove'),
						rowTmpl: THIS.templates.required_skills_callflow_row
					});

					$('.add_skill', popup_html).click(function() {
						$('.add_skills').append(THIS.templates.required_skills_callflow_row.tmpl({
							_t: _t,
							skill: '',
							add: true
						}));
					});

					$('.remove_skill', popup_html).click(function() {
						$('.remove_skills').append(THIS.templates.required_skills_callflow_row.tmpl({
							_t: _t,
							skill: '',
							add: false
						}));
					});

					$('.add_remove_skills', popup_html).delegate('.remove_row', 'click', function() {
						$(this).parent('.skill_row').remove();
					});

					$('#add', popup_html).click(function() {
						var add = [],
							remove = [];

						$('.add_skill_row').each(function() {
							var addSkill = $(this).val().trim();

							if(addSkill != '') {
								add.push(addSkill);
							}
						});
						$('.remove_skill_row').each(function() {
							var removeSkill = $(this).val().trim(),
								addIndex = add.indexOf(removeSkill);

							// If skill to remove is in add list, just remove it there
							if(addIndex != -1) {
								add.splice(addIndex, 1);
							}
							else if(removeSkill != '') {
								remove.push(removeSkill);
							}
						});

						node.setMetadata('add', add);
						node.setMetadata('remove', remove);

						node.caption = window.translate['queue']['add'] + ': ' + add.length +
							', ' + window.translate['queue']['remove'] + ': ' + remove.length;

						popup.dialog('close');
					});

					popup = winkstart.dialog(popup_html, {
						title: _t('queue', 'required_skills'),
						minHeight: '0',
						beforeClose: function() {
							if(typeof callback == 'function') {
								callback();
							}
						}
					});
				}
			},
			'acdc_wait_time[id=*]': {
				name: _t('queue', 'wait_time'),
				icon: 'temporal_route',
				category: _t('config', 'call_center_cat'),
				module: 'acdc_wait_time',
				tip: _t('queue', 'wait_time_tip'),
				data: {
					id: 'null'
				},
				rules: [],
				isUsable: 'true',
				/**
				 * Returns true if child_node already has a sibling that is set to default mode
				 *
				 * @param {object} child_node The node whose siblings to check
				 * @return {boolean} True if child_node already has a sibling that is set to default mode
				 */
				default_taken: function(child_node) {
					var default_taken = false;

					// Null when loading an existing callflow
					if(!child_node.parent) {
						return default_taken;
					}

					$.each(child_node.parent.children, function(index, child) {
						if(child != child_node && child.key == '_') {
							default_taken = true;
						}
					});

					return default_taken;
				},
				key_caption: function(child_node, caption_map) {
					// Automatically force threshold mode when adding subsequent children
					if(this.default_taken(child_node)) {
						child_node.key = "0";
					}

					if(child_node.key == '_') {
						return 'Default';
					}
					else {
						return 'Threshold: >' + child_node.key + 's';
					}
				},
				key_edit: function(child_node, callback) {
					var default_taken = this.default_taken(child_node);

					// Automatically force threshold mode when adding subsequent children
					var mode = (!default_taken && child_node.key == '_') ? 'default' : 'threshold',
						threshold = (default_taken && child_node.key == '_') ? '' : child_node.key,
						popup,
						popup_html = THIS.templates.wait_time_key_callflow.tmpl({
							_t: function(param){
								return window.translate['queue'][param];
							},
							default_taken: default_taken,
							mode: mode,
							threshold: mode == 'threshold' ? threshold : ''
						});

					// Hiding/disabling is a pain in jquery-tmpl, just do it here
					if(mode == 'default') {
						$('.threshold', popup_html).hide();
					}
					if(default_taken) {
						$('input[name=mode][value=default]', popup_html).attr('disabled', 'disabled');
					}
					$('input[name=mode]', popup_html).change(function() {
						if($(this).val() == 'threshold') {
							$('#wait_time_popup .threshold', popup).show();
						}
						else {
							$('#wait_time_popup .threshold', popup).hide();
						}
					});

					$('#add', popup_html).click(function(event) {
						if($('input[name=mode]:checked', popup).val() == 'default') {
							child_node.key = '_';
							child_node.key_caption = 'Default';
						}
						else {
							var threshold = $('input[name=threshold]', popup);
							thresholdValue = threshold.val();
							if(isNaN(parseInt(thresholdValue))) {
								$('.threshold .validated', popup).addClass('invalid');
								return;
							}
							child_node.key = thresholdValue;
							child_node.key_caption = 'Threshold: >' + child_node.key + 's';
						}

						popup.dialog('close');
					});

					popup = winkstart.dialog(popup_html, {
						title: _t('queue', 'wait_time'),
						minHeight: '0',
						beforeClose: function() {
							if(typeof callback == 'function') {
								callback();
							}
						}
					});
				},
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

					winkstart.request(true, 'queue.list',  {
						account_id: winkstart.apps['voip'].account_id,
						api_url: winkstart.apps['voip'].api_url
					},
					function(data, status) {
						var popup, popup_html,
							eval_window = node.getMetadata('window') || 900,
							window_unit = eval_window % 3600 == 0 ? 'hours' : 'minutes';

						eval_window /= 60;
						if(window_unit == 'hours') {
							eval_window /= 60;
						}

						popup_html = THIS.templates.wait_time_callflow.tmpl({
							_t: function(param){
								return window.translate['queue'][param];
							},
							title: _t('queue', 'wait_time_title'),
							items: data.data,
							selected: node.getMetadata('id') || '',
							window: eval_window,
							window_unit: window_unit,
							route_var: node.getMetadata('var') || ''
						});

						$('#add', popup_html).click(function() {
							node.setMetadata('id', $('#queue_selector', popup).val());

							var eval_window = $('#wait_time_window').val() * 60;
							if($('#wait_time_window_unit').val() == 'hours') {
								eval_window *= 60;
							}
							node.setMetadata('window', eval_window);

							if($('#route_var', popup_html).val().length > 0) {
								node.setMetadata('var', $('#route_var', popup_html).val());
							} else {
								node.deleteMetadata('var');
							}

							node.caption = $('#queue_selector option:selected', popup).text();

							popup.dialog('close');
						});

						$('#toggle_advanced', popup_html).click(function () {
							$('#route_var_div', popup_html).toggle();
						});

						popup = winkstart.dialog(popup_html, {
							title: _t('queue', 'wait_time'),
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
			'set_variable[variable=call_priority]': {
				name: _t('queue', 'set_call_priority'),
				icon: 'star',
				category: _t('config', 'call_center_cat'),
				module: 'set_variable',
				tip: _t('queue', 'set_call_priority_tip'),
				data: {
					variable: 'call_priority',
					value: '0'
				},
				rules: [],
				isUsable: 'true',
				caption: function(node, caption_map) {
					return node.getMetadata('value');
				},
				edit: function(node, callback) {
					var popup,
						popup_html = THIS.templates.set_call_priority_callflow.tmpl({
							_t: function(param) {
								return window.translate['queue'][param];
							},
							call_priority: node.getMetadata('value')
						});

					$('#add', popup_html).click(function() {
						var value = $('#call_priority', popup).val();

						if(isNaN(value) || parseInt(value) < 0 || parseInt(value) > 255) {
							$('.validated', popup).addClass('invalid');
							$('.validated[rel=popover]', popup_html).popover();
							return;
						}

						node.setMetadata('value', value);
						node.caption = value;

						popup.dialog('close');
					});

					popup = winkstart.dialog(popup_html, {
						title: _t('queue', 'set_call_priority'),
						minHeight: '0',
						beforeClose: function() {
							if(typeof callback == 'function') {
								callback();
							}
						}
					});
				}
			}
		});

		$.extend(callflow_nodes, {
			'acdc_agent[action=pause]': $.extend({}, callflow_nodes["acdc_agent[action=paused]"])
		});
		delete callflow_nodes['acdc_agent[action=pause]'].category;
	}
}
);
