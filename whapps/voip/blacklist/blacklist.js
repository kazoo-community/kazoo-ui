winkstart.module('voip', 'blacklist', {
		css: [
			'css/blacklist.css'
		],

		templates: {
			blacklist: 'tmpl/blacklist.html',
			edit: 'tmpl/edit.html',
			addNumber: 'tmpl/addNumber.html'
		},

		subscribe: {
			'blacklist.activate': 'activate',
			'blacklist.edit': 'render_edit_blacklist'
		},

		validation : [
			{ name: '#name', regex: /^.+$/ }
		],

		resources: {
			'blacklist.list': {
				url: '{api_url}/accounts/{account_id}/blacklists',
				contentType: 'application/json',
				verb: 'GET'
			},
			'blacklist.get': {
				url: '{api_url}/accounts/{account_id}/blacklists/{blacklist_id}',
				contentType: 'application/json',
				verb: 'GET'
			},
			'blacklist.create': {
				url: '{api_url}/accounts/{account_id}/blacklists',
				contentType: 'application/json',
				verb: 'PUT'
			},
			'blacklist.update': {
				url: '{api_url}/accounts/{account_id}/blacklists/{blacklist_id}',
				contentType: 'application/json',
				verb: 'POST'
			},
			'blacklist.delete': {
				url: '{api_url}/accounts/{account_id}/blacklists/{blacklist_id}',
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
			label: _t('blacklist', 'blacklist_label'),
			icon: 'line_circle',
			weight: '100',
			category: _t('config', 'advanced_menu_cat')
		});
	},

	{
		render_edit_blacklist: function(data) {
			var THIS = this,
				parent = $('#blacklist-content'),
				target = $('#blacklist-view', parent),
				defaults = {
				};

			if(typeof data === 'object' && data.id) {
				THIS.getBlacklist(data.id, function(data) {
					THIS.format_data(data);

					THIS.renderBlacklist(data, target);
				});
			}
			else {
				THIS.renderBlacklist(defaults, target);
			}
		},

		clean_form_data: function(form_data) {
			delete form_data.extra;

			return form_data;
		},

		format_data: function(data) {
			return data;
		},

		normalize_data: function(form_data) {
			return form_data;
		},

		renderBlacklist: function(data, target) {
			var THIS = this;

			data._t = function(param){
				return window.translate['blacklist'][param];
			};

			var blacklistHtml = $(THIS.templates.edit.tmpl(data));

			if(data.hasOwnProperty('numbers')) {
				$.each(data.numbers, function(k, v) {
					var dataTemplate = {
						number: k,
						_t: function(param){
							return window.translate['blacklist'][param];
						}
					};

					$('.list-numbers .saved-numbers', blacklistHtml).append(THIS.templates.addNumber.tmpl(dataTemplate))
				});
			}

			winkstart.validate.set(THIS.config.validation, blacklistHtml);

			THIS.bindEvents(data, blacklistHtml);

			$('*[rel=popover]:not([type="text"])', blacklistHtml).popover({
				trigger: 'hover'
			});

			$('*[rel=popover][type="text"]', blacklistHtml).popover({
				trigger: 'focus'
			});

			(target)
				.empty()
				.append(blacklistHtml);
		},

		bindEvents: function(data, template) {
			var THIS = this,
				addNumber = function(e) {
					var number = template.find('#number_value').val();

					if(number) {
						var dataTemplate = {
							number: number,
							_t: function(param){
								return window.translate['blacklist'][param];
							}
						};

						$('.list-numbers .saved-numbers', template).prepend(THIS.templates.addNumber.tmpl(dataTemplate));

						$('#number_value', template).val('');
					}
				};

			$('.number-wrapper.placeholder:not(.active)', template).click(function() {
				var $this = $(this);

				$this.addClass('active');

				$('#number_value', template).focus();
			});

			$('#add_number', template).click(function() {
				addNumber();
			});

			$('.add-number', template).bind('keypress', function(e) {
				var code = e.keyCode || e.which;

				if(code === 13) {;
					addNumber(e);
				}
			});

			$(template).delegate('.delete-number', 'click', function(e) {
				$(this).parents('.number-wrapper').remove();
			});

			$('#cancel_number', template).click(function(e) {
				e.stopPropagation();

				$('.number-wrapper.placeholder.active', template).removeClass('active');
				$('#number_value', template).val('');
			});

			$('.blacklist-save', template).click(function() {
				var formData = form2object('blacklist-form'),
					cleanData = THIS.clean_form_data(formData),
					mapNumbers = {};

				$('.saved-numbers .number-wrapper', template).each(function(k, wrapper) {
					delete data.numbers;
					var number = $(wrapper).attr('data-number');
					mapNumbers[number] = {};
				});


				cleanData.numbers = mapNumbers;

				var normalizedData = THIS.normalize_data($.extend(true, {}, data, cleanData));

				THIS.saveBlacklist(normalizedData, function(data) {
					THIS.renderList();

					THIS.render_edit_blacklist(data);
				});
			});

			$('.blacklist-delete', template).click(function() {
				THIS.deleteBlacklist(data.id, function() {
					$('#blacklist-view').empty();
					THIS.renderList();
				});
			});
		},

		renderList: function(parent){
			var THIS = this,
				parent = parent || $('#blacklist-content');

			THIS.listBlacklists(function(data, status) {
				var map_crossbar_data = function(data) {
					var new_list = [];

					if(data.length > 0) {
						$.each(data, function(key, val) {
							new_list.push({
								id: val.id,
								title: val.name || _t('blacklist', 'no_name')
							});
						});
					}

					new_list.sort(function(a, b) {
						return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
					});

					return new_list;
				};

				$('#blacklist-listpanel', parent)
					.empty()
					.listpanel({
						label: _t('blacklist', 'blacklist_label'),
						identifier: 'blacklist-listview',
						new_entity_label: _t('blacklist', 'add_blacklist_label'),
						data: map_crossbar_data(data),
						publisher: winkstart.publish,
						notifyMethod: 'blacklist.edit',
						notifyCreateMethod: 'blacklist.edit',
						notifyParent: parent
					});
			});
		},

		activate: function(parent) {
			var THIS = this,
				dataTemplate = {
					_t: function(param) {
						return window.translate['blacklist'][param]
					}
				},
				blacklistHtml = THIS.templates.blacklist.tmpl(dataTemplate);

			(parent || $('#ws-content'))
				.empty()
				.append(blacklistHtml);

			THIS.renderList(blacklistHtml);
		},

		saveBlacklist: function(data, callback) {
			var THIS = this;

			if(data.id) {
				THIS.updateBlacklist(data, callback);
			}
			else {
				THIS.createBlacklist(data, callback);
			}
		},

		// API Calls


		listBlacklists: function(callback) {
			var THIS = this;

			winkstart.request(true, 'blacklist.list', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url
				},
				function(data, status) {
					callback && callback(data.data);
				}
			);
		},

		getBlacklist: function(id, callback) {
			var THIS = this;

			winkstart.request(true, 'blacklist.get', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url,
					blacklist_id: id
				},
				function(data, status) {
					callback && callback(data.data);
				}
			);
		},

		createBlacklist: function(data, callback) {
			var THIS = this;

			winkstart.request(true, 'blacklist.create', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url,
					data: data
				},
				function(data, status) {
					callback && callback(data.data);
				}
			);
		},

		updateBlacklist: function(data, callback) {
			var THIS = this;

			winkstart.request(true, 'blacklist.update', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url,
					blacklist_id: data.id,
					data: data
				},
				function(data, status) {
					callback && callback(data.data);
				}
			);
		},

		deleteBlacklist: function(id, callback) {
			var THIS = this;

			winkstart.request(true, 'blacklist.delete', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url,
					blacklist_id: id
				},
				function(data, status) {
					callback && callback(data.data);
				}
			);
		},

	}
);
