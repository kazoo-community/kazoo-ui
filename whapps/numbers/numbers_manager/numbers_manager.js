winkstart.module('numbers', 'numbers_manager', {
	css: [
		'css/numbers_manager.css',
		_t('numbers_manager', 'numbers_popup_css')
	],

	templates: {
		numbers_manager: 'tmpl/numbers_manager.html',
		cnam_dialog: 'tmpl/cnam_dialog.html',
		e911_dialog: 'tmpl/e911_dialog.html',
		add_number_dialog: 'tmpl/add_number_dialog.html',
		freeform_number_dialog: 'tmpl/freeform_number_dialog.html',
		add_number_search_results: 'tmpl/add_number_search_results.html',
		port_dialog: 'tmpl/port_dialog.html',
		fields: 'tmpl/fields.html',
		portability_result: 'tmpl/portability_result.html',
		portability_twipsy: 'tmpl/portability_twipsy.html'
	},

	subscribe: {
		'numbers_manager.activate' : 'activate',
		'numbers_manager.render_fields' : 'render_fields'
	},

	resources: {
		'numbers_manager.list': {
			url: '{api_url}/accounts/{account_id}/phone_numbers',
			contentType: 'application/json',
			verb: 'GET'
		},
		'numbers_manager.get_account': {
			url: '{api_url}/accounts/{account_id}',
			contentType: 'application/json',
			verb: 'GET'
		},
		'numbers_manager.create': {
			url: '{api_url}/accounts/{account_id}/phone_numbers/{phone_number}',
			contentType: 'application/json',
			verb: 'PUT'
		},
		'numbers_manager.get': {
			url: '{api_url}/accounts/{account_id}/phone_numbers/{phone_number}',
			contentType: 'application/json',
			verb: 'GET'
		},
		'numbers_manager.update': {
			url: '{api_url}/accounts/{account_id}/phone_numbers/{phone_number}',
			contentType: 'application/json',
			verb: 'POST'
		},
		'numbers_manager.activate': {
			url: '{api_url}/accounts/{account_id}/phone_numbers/{phone_number}/activate',
			contentType: 'application/json',
			verb: 'PUT'
		},
		'numbers_manager.search': {
			url: '{api_url}/phone_numbers?prefix={prefix}&quantity={quantity}',
			contentType: 'application/json',
			verb: 'GET'
		},
		'numbers_manager.delete': {
			url: '{api_url}/accounts/{account_id}/phone_numbers/{phone_number}',
			contentType: 'application/json',
			verb: 'DELETE'
		},
		'numbers_manager.add_port': {
			url: '{api_url}/accounts/{account_id}/port_requests',
			contentType: 'application/json',
			verb: 'PUT'
		},
		'numbers_manager.change_state': {
			url: '{api_url}/accounts/{account_id}/port_requests/{request_id}/{state}',
			contentType: 'application/json',
			verb: 'POST'
		},
		'numbers_manager.getServicePlan': {
			url: '{api_url}/accounts/{account_id}/service_plans/{name}',
			contentType: 'application/json',
			verb: 'GET'
		},
		'numbers_manager.getCurrentServicePlan': {
			url: '{api_url}/accounts/{account_id}/service_plans/current',
			contentType: 'application/json',
			verb: 'GET'
		},
		'numbers_manager.add_attachment': {
			url: '{api_url}/accounts/{account_id}/port_requests/{request_id}/attachments?filename={document_name}',
			contentType: 'application/pdf',
			verb: 'PUT'
		},
		'numbers_manager.check_portability': {
			url: '{api_url}/accounts/{account_id}/phone_numbers/check_portability',
			contentType: 'application/json',
			verb: 'POST'
		}
	}
},

function(args) {
	var THIS = this;

	winkstart.registerResources(THIS.__whapp, THIS.config.resources);
},

{
	get_number: function(phone_number, success, error) {
		winkstart.request('numbers_manager.get', {
			api_url: winkstart.apps['numbers'].api_url,
			account_id: winkstart.apps['numbers'].account_id,
			phone_number: encodeURIComponent(phone_number)
		},
		function(_data, status) {
			if(typeof success === 'function') {
				success(_data);
			}
		},
		function(_data, status) {
			if(typeof error === 'function') {
				error(_data);
			}
		}
		);
	},

	update_number: function(phone_number, data, success, error) {
		winkstart.request('numbers_manager.update', {
			api_url: winkstart.apps['numbers'].api_url,
			account_id: winkstart.apps['numbers'].account_id,
			phone_number: encodeURIComponent(phone_number),
			data: data
		},
		function(_data, status) {
			if(typeof success === 'function') {
				success(_data);
			}
		},
		function(_data, status) {
			if(typeof error === 'function') {
				error(_data);
			}
		}
		);
	},

	add_port: function(data, success, error) {
		var THIS = this;

		winkstart.request('numbers_manager.add_port', {
			account_id: winkstart.apps.numbers.account_id,
			api_url: winkstart.apps.numbers.api_url,
			data: data
		},
		function(_data, status) {
			if(typeof success == 'function') {
				success(_data.data, status);
			}
		},
		function(_data, status) {
			if(typeof error == 'function') {
				error(_data.data, status);
			}
		}
		);
	},

	add_attachment: function(request_id, data, document_name, callback){
		var THIS = this;

		winkstart.request('numbers_manager.add_attachment', {
			api_url: winkstart.apps.numbers.api_url,
			account_id: winkstart.apps.numbers.account_id,
			request_id: request_id,
			document_name: document_name,
			data: data
		},
		function(_data, status) {
			callback();
		}
		);
	},

	create_number: function(phone_number, success, error) {
		var THIS = this;

		winkstart.request(false, 'numbers_manager.create', {
			account_id: winkstart.apps['numbers'].account_id,
			api_url: winkstart.apps['numbers'].api_url,
			phone_number: encodeURIComponent(phone_number),
			data: {}
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

	activate_number: function(phone_number, success, error) {
		var THIS = this;

		winkstart.request(false, 'numbers_manager.activate', {
			account_id: winkstart.apps['numbers'].account_id,
			api_url: winkstart.apps['numbers'].api_url,
			phone_number: encodeURIComponent(phone_number),
			data: {}
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

	delete_number: function(phone_number, success, error) {
		var THIS = this;

		winkstart.request('numbers_manager.delete', {
			account_id: winkstart.apps['numbers'].account_id,
			api_url: winkstart.apps['numbers'].api_url,
			phone_number: encodeURIComponent(phone_number)
		},
		function(data, status) {
			if(typeof success == 'function') {
				success(data, status);
			}
		},
		function(data, status) {
			if(typeof error == 'function') {
				error(data, status);
			}
		}
		);
	},

	search_numbers: function(data, success, error) {
		var THIS = this;

		winkstart.request(true, 'numbers_manager.search', {
			api_url: winkstart.apps['numbers'].api_url,
			prefix: data.prefix,
			quantity: data.quantity || 15
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

	submit_port: function(request_id, callback) {
		var THIS = this;

		winkstart.request('numbers_manager.change_state', {
			api_url: winkstart.apps.numbers.api_url,
			account_id: winkstart.apps.numbers.account_id,
			request_id: request_id,
			state: 'submitted',
			data: {}
		},
		function(_data, status) {
			callback();
		}
		);
	},

	add_freeform_numbers: function(numbers_data, callback) {
		var THIS = this,
			number_data;

		if(numbers_data.length > 0) {
			var phone_number = numbers_data[0].phone_number.match(/^(\+.*)$/),
				error_function = function() {
					winkstart.confirm(
						_t('numbers_manager', 'there_was_an_error') + numbers_data[0].phone_number +
							_t('numbers_manager', 'would_you_like_to_retry'),
						function() {
							THIS.add_freeform_numbers(numbers_data, callback);
						},
						function() {
							THIS.add_freeform_numbers(numbers_data.slice(1), callback);
						}
					);
				};

			if(phone_number && phone_number[1]) {
				THIS.create_number(phone_number[1],
					function() {
						THIS.activate_number(phone_number[1],
							function(_data, status) {
								THIS.add_freeform_numbers(numbers_data.slice(1), callback);
							},
							function(_data, status) {
								error_function();
							}
						);
					},
					function() {
						error_function();
					}
				);
			}
			else {
				error_function();
			}
		}
		else {
			if(typeof callback === 'function') {
				callback();
			}
		}
	},

	add_numbers: function(numbers_data, callback) {
		var THIS = this,
			number_data;

		if(numbers_data.length > 0) {
			var phone_number = numbers_data[0].phone_number.match(/^(\+.*)$/),
				error_function = function() {
					winkstart.confirm(
						_t('numbers_manager', 'there_was_an_error') + numbers_data[0].phone_number +
							_t('numbers_manager', 'would_you_like_to_retry'),
						function() {
							THIS.add_numbers(numbers_data, callback);
						},
						function() {
							THIS.add_numbers(numbers_data.slice(1), callback);
						}
					);
				};

			if(phone_number[1]) {
				THIS.activate_number(phone_number[1],
					function(_data, status) {
						THIS.add_numbers(numbers_data.slice(1), callback);
					},
					function(_data, status) {
						if(_data.data && _data.data.credit) {
							winkstart.error_message.process_error()(_data, status);
						} else {
							error_function();
						}
					}
				);
			}
			else {
				error_function();
			}
		}
		else {
			if(typeof callback === 'function') {
				callback();
			}
		}
	},

	render_fields: function(parent, callback, callback_after_buying) {
		var THIS = this,
			fields_html = THIS.templates.fields.tmpl({
				_t: function(param){
					return window.translate['numbers_manager'][param];
				}
			});

		$(fields_html, parent).click(function() {
			THIS.render_add_number_dialog(function() {
				if(typeof callback_after_buying === 'function') {
					callback_after_buying();
				}
			});
		});

		(parent)
			.empty()
			.append(fields_html);

		if(typeof callback == 'function') {
			callback();
		}

		/* Nice hack for amplify.publish */
		return false;
	},

	clean_phone_number_data: function(data) {
		/* Clean Caller-ID */
		if('cnam' in data && 'display_name' in data.cnam && data.cnam.display_name === '') {
			delete data.cnam.display_name;
		}

		if(data.cnam && $.isEmptyObject(data.cnam)) {
			delete data.cnam;
		}

		/* Clean e911 */
	},

	render_numbers_manager: function(parent) {
		var THIS = this,
			numbers_manager_html = THIS.templates.numbers_manager.tmpl();

		THIS.setup_table(numbers_manager_html);

		$('#select_all_numbers', numbers_manager_html).click(function() {
			$('.select_number', numbers_manager_html).prop('checked', $(this).is(':checked'));
		});

		$(numbers_manager_html).delegate('#buy_number', 'click', function() {
			THIS.render_add_number_dialog(function() {
				THIS.list_numbers();
			});
		});

		$(numbers_manager_html).delegate('#add_number', 'click', function() {
			THIS.render_freeform_number_dialog(function() {
				THIS.list_numbers();
			});
		});

		$(numbers_manager_html).delegate('#launch_portability_dialog', 'click', function() {
			THIS.render_portability_check_dialog();
		});

		$(numbers_manager_html).delegate('.cid', 'click', function() {
			var $cnam_cell = $(this),
				data_phone_number = $cnam_cell.parents('tr').first().attr('id'),
				phone_number = data_phone_number.match(/^(\+.*)$/);

			if(phone_number[1]) {
				THIS.get_number(phone_number[1], function(_data) {
					THIS.render_cnam_dialog(_data.data.cnam || {}, function(cnam_data) {
						_data.data.cnam = $.extend({}, _data.data.cnam, cnam_data);

						THIS.clean_phone_number_data(_data.data);

						var updateNumber = function() {
							THIS.update_number(phone_number[1], _data.data,
								function(_data_update) {
									!($.isEmptyObject(_data.data.cnam)) ? $cnam_cell.removeClass('inactive').addClass('active') : $cnam_cell.removeClass('active').addClass('inactive');
								},
								winkstart.error_message.process_error()
							);
						};

						if(winkstart.apps.numbers.api_url.slice(-2) === 'v2') {
							updateNumber();
						}
						else {
							THIS.display_credit_card_confirmation(updateNumber);
						}
					});
				});
			}
		});

		$(numbers_manager_html).delegate('.cid_inbound', 'click', function() {
			var $cnam_cell = $(this),
				data_phone_number = $cnam_cell.parents('tr').first().attr('id'),
				phone_number = data_phone_number.match(/^(\+.*)$/);

			if(phone_number[1]) {
				THIS.get_number(phone_number[1], function(_data) {
					if(typeof _data.data.cnam !== 'undefined' && _data.data.cnam.inbound_lookup) {
						_data.data.cnam.inbound_lookup = false;
						THIS.update_number(phone_number[1], _data.data, function(_data_update) {
							$cnam_cell.removeClass('active').addClass('inactive');
						},
						function(_data_update) {
							winkstart.alert(_t('numbers_manager', 'failed_to_update_the_caller_id') + _data_update.message);
						}
						);
					}
					else {
						winkstart.confirm(_t('numbers_manager', 'if_you_turn_on_this_feature'),
							function() {
								_data.data.cnam = $.extend(true,_data.data.cnam || {},{ inbound_lookup: true });
								THIS.update_number(phone_number[1], _data.data, function(_data_update) {
									$cnam_cell.removeClass('inactive').addClass('active');
								},
								function(_data_update) {
									winkstart.alert(_t('numbers_manager', 'failed_to_update_the_caller_id')+_data_update.message);
								}
								);
							}
						);
					}
				});
			}
		});

		$(numbers_manager_html).delegate('.e911', 'click', function() {
			var $e911_cell = $(this),
				data_phone_number = $e911_cell.parents('tr').first().attr('id'),
				phone_number = data_phone_number.match(/^(\+.*)$/);

			if(phone_number[1]) {
				THIS.get_number(phone_number[1], function(_data) {
					THIS.render_e911_dialog(_data.data.e911 || {}, function(e911_data) {
						_data.data.e911 = $.extend({}, _data.data.e911, e911_data);

						THIS.clean_phone_number_data(_data.data);

						var updateNumber = function() {
							THIS.update_number(phone_number[1], _data.data, function(_data_update) {
								!($.isEmptyObject(_data.data.e911)) ? $e911_cell.removeClass('inactive').addClass('active') : $e911_cell.removeClass('active').addClass('inactive');
							},
							function(_data_update) {
								winkstart.alert(_t('numbers_manager', 'failed_to_update_the_e911') + _data_update.message);
							}
							);
						};

						if(winkstart.apps.numbers.api_url.slice(-2) === 'v2') {
							updateNumber();
						}
						else {
							THIS.display_credit_card_confirmation(updateNumber);
						}
					});
				});
			}
		});

		// Shortcut to callflow used by a number
		$(numbers_manager_html).delegate('.used_by_callflow', 'click', function() {
			var THIS = this;

			// Load the callflow module, then edit the callflow that was created
			winkstart.publish('whappnav.activate', 'voip');
			winkstart.publish('callflow.activate', {
				callback: function() {
					winkstart.publish('callflow.edit-callflow', {
						id: $(THIS).attr('data-id')
					});
				}
			});
		});

		// Shortcut to trunk used by a number
		$(numbers_manager_html).delegate('.used_by_trunkstore', 'click', function() {
			var THIS = this;

			// Load the callflow module, then edit the callflow that was created
			winkstart.publish('whappnav.activate', 'pbxs');
			winkstart.publish('pbxs_manager.activate', {
				callback: function() {
					winkstart.publish('pbxs_manager.edit', {
						id: $(THIS).attr('data-id')
					});
				}
			});
		});

		$(numbers_manager_html).delegate('#delete_number', 'click', function() {
			var data_phone_number,
				phone_number,
				$selected_checkboxes = $('.select_number:checked', numbers_manager_html),
				nb_numbers = $selected_checkboxes.size(),
				refresh_list = function() {
					nb_numbers--;
					if(nb_numbers === 0) {
						THIS.list_numbers();
					}
				};

			if(nb_numbers > 0) {
				winkstart.confirm(_t('numbers_manager', 'are_you_sure_you_want') + nb_numbers + _t('numbers_manager', 'numbers_selected'), function() {
					$selected_checkboxes.each(function() {
						data_phone_number = $(this).parents('tr').attr('id'),
						phone_number = data_phone_number.match(/^(.*)$/);

						if(phone_number[1]) {
							THIS.delete_number(phone_number[1],
								function() {
									refresh_list();
								},
								function(error) {
									if (typeof _t('numbers_manager', error.message) !== 'undefined') {
										winkstart.alert('error', _t('numbers_manager', error.message));
									}
									refresh_list();
								}
							);
						}
					});
				},
				function() {

				}
				);
			}
			else {
				winkstart.alert(_t('numbers_manager', 'you_didnt_select_any_number'));
			}
		});

		$(numbers_manager_html).delegate('#port_numbers', 'click', function(ev) {
			ev.preventDefault();

			THIS.render_port_dialog(function(port_data, popup) {
				var ports_done = 0,
					portNumbers = function() {
						var attachments = { bill: port_data.files, loa: port_data.loa };

						delete port_data.files;
						delete port_data.loa;

						port_data.port_state = 'unconfirmed';

						THIS.add_port(port_data, function(_data) {
							THIS.add_attachment(_data.id, attachments.bill.file_data, 'bill.pdf', function() {
								THIS.add_attachment(_data.id, attachments.loa.file_data, 'loa.pdf', function() {
									THIS.submit_port(_data.id, function() {
										THIS.list_numbers();

										popup.dialog('close');
									})
								})
							});
						});

					};

				if(winkstart.apps.numbers.api_url.slice(-2) === 'v2') {
					portNumbers();
				}
				else {
					THIS.display_credit_card_confirmation(portNumbers);
				}
			});
		});

		THIS.list_numbers(function() {
			(parent || $('#ws-content'))
				.empty()
				.append(numbers_manager_html);
		});
	},

	render_cnam_dialog: function(cnam_data, callback) {
		cnam_data._t = function(param){
			return window.translate['numbers_manager'][param];
		};
		var THIS = this,
			popup_html = THIS.templates.cnam_dialog.tmpl(cnam_data || {
				_t: function(param){
					return window.translate['numbers_manager'][param];
				}
			}),
			popup;

		$('.submit_btn', popup_html).click(function(ev) {
			ev.preventDefault();

			var cnam_form_data = form2object('cnam');

			if(typeof callback === 'function') {
				callback(cnam_form_data);
			}

			popup.dialog('close');
		});

		popup = winkstart.dialog(popup_html, {
			title: _t('numbers_manager', 'edit_cid')
		});
	},

	render_e911_dialog: function(e911_data, callback) {
		e911_data._t = function(param){
			return window.translate['numbers_manager'][param];
		};
		var THIS = this,
			popup_html = THIS.templates.e911_dialog.tmpl(e911_data || {}),
			popup;

		$('#postal_code', popup_html).blur(function() {
			$.getJSON('http://www.geonames.org/postalCodeLookupJSON?&country=US&callback=?', { postalcode: $(this).val() }, function(response) {
				if (response && response.postalcodes.length && response.postalcodes[0].placeName) {
					$('#locality', popup_html).val(response.postalcodes[0].placeName);
					$('#region', popup_html).val(response.postalcodes[0].adminName1);
				}
			});
		});

		$('.inline_field > input', popup_html).keydown(function() {
			$('.gmap_link_div', popup_html).hide();
		});

		if(e911_data.latitude && e911_data.longitude) {
			var href = 'http://maps.google.com/maps?q='+ e911_data.latitude + ',+' + e911_data.longitude + '+(Your+E911+Location)&iwloc=A&hl=en';
			$('#gmap_link', popup_html).attr('href', href);
			$('.gmap_link_div', popup_html).show();
		}

		$('.submit_btn', popup_html).click(function(ev) {
			ev.preventDefault();

			var e911_form_data = form2object('e911');

			if(typeof callback === 'function') {
				callback(e911_form_data);
			}

			popup.dialog('close');
		});

		popup = winkstart.dialog(popup_html, {
			title: e911_data.phone_number ? _t('numbers_manager', 'edit_location_for') + e911_data.phone_number : _t('numbers_manager', 'edit_911_location'),
			width: '465px'
		});
	},

	render_freeform_number_dialog: function(callback) {
		var THIS = this,
			popup_html = THIS.templates.freeform_number_dialog.tmpl({
				_t: function(param){
					return window.translate['numbers_manager'][param];
				},
				action_button_label: _t('numbers_manager', 'add')
			}),
			popup;

		$('.submit', popup_html).click(function(ev) {
			ev.preventDefault();

			var phone_numbers = $('#freeform_numbers', popup_html).val().replace(/\n/g,',');
			phone_numbers = phone_numbers.replace(/[\s-\(\)\.]/g, '').split(',');

			var numbers_data = [];

			if(phone_numbers.length > 0) {
				var phone_number;
				$.each(phone_numbers, function(k, v) {
					phone_number = v.match(/^(\+.*)$/);
					if(phone_number && phone_number[1]) {
						numbers_data.push({phone_number: v});
					}
				});

				THIS.add_freeform_numbers(numbers_data, function() {
					if(typeof callback === 'function') {
						callback();
					}

					popup.dialog('close');
				});
			}
			else {
				winkstart.alert(_t('numbers_manager', 'you_didnt_enter_any_valid_phone_number'));
			}
		});

		popup = winkstart.dialog(popup_html, {
			title: _t('numbers_manager', 'add_your_phone_numbers_to_the_platform'),
			position: ['center', 20]
		});

		$('.submit', popup).focus();
	},

	formatBuyNumberData: function(data) {
		var arrayNumbers = [];

		$.each(data.data, function(k, number) {
			if(number.number) {
				arrayNumbers.push(number.number);
			}
			else {
				arrayNumbers.push(number);
			}
		});

		return arrayNumbers;
	},

	render_add_number_dialog: function(callback) {
		var data = {
			_t: function(param){
				return window.translate['numbers_manager'][param];
			},
			version: winkstart.config.default_api_url.match(/(v2)$/) ? true : false
		};

		var THIS = this,
			numbers_data = [],
			popup_html = THIS.templates.add_number_dialog.tmpl(data),
			popup;


		$('.toggle_div', popup_html).hide();

		$('#search_numbers_button', popup_html).click(function(ev) {
			$('.toggle_div', popup_html).hide();

			var npa_data = {},
				npa = $('#sdid_npa', popup_html).val(),
				nxx = $('#sdid_nxx', popup_html).val();

			ev.preventDefault();

			npa_data.prefix = npa + nxx;

			THIS.search_numbers(npa_data, function(results_data) {
				var formattedData = THIS.formatBuyNumberData(results_data),
					results_html = THIS.templates.add_number_search_results.tmpl({
						data: formattedData,
						_t: function(param){
							return window.translate['numbers_manager'][param];
						}
					});

				$('#foundDIDList', popup_html)
					.empty()
					.append(results_html);

				$('.toggle_div', popup_html).show();
			});
		});

		$('#add_numbers_button', popup_html).click(function(ev) {
			ev.preventDefault();

			var addNumbers = function() {
				$('#foundDIDList .checkbox_number:checked', popup_html).each(function() {
					numbers_data.push($(this).dataset());
				});

				THIS.add_numbers(numbers_data, function() {
					if(typeof callback === 'function') {
						callback();
					}

					popup.dialog('close');
				});
			};

			if(winkstart.apps.numbers.api_url.slice(-2) === 'v2') {
				addNumbers();
			}
			else {
				THIS.display_credit_card_confirmation(addNumbers);
			}
		});

		$(popup_html).delegate('.checkbox_number', 'click', function() {
			var selected_numbers =  $('.checkbox_number:checked', popup_html).size(),
				sum_price = 0;

			$.each($('.checkbox_number:checked', popup_html), function() {
				sum_price += parseFloat($(this).dataset('price'));
			});

			sum_price = '$'+sum_price+'.00';

			$('.selected_numbers', popup_html).html(selected_numbers);
			$('.cost_numbers', popup_html).html(sum_price);
		});

		popup = winkstart.dialog(popup_html, {
			title: _t('numbers_manager', 'add_number_title'),
			width: '600px',
			position: ['center', 20]
		});
	},

	get_port_price: function(callback) {
		var THIS = this,
			errorCallback = function() {
				/* This is a hack, if the API fails, which shouldn't happen, to show the UI as it was before, with a hardcoded 5$ */
				callback && callback('$5');
			};

		winkstart.request('numbers_manager.getCurrentServicePlan', {
			account_id: winkstart.apps['numbers'].account_id,
			api_url: winkstart.apps['numbers'].api_url
		},
		function(_dataPlan, status) {
			var keyPlan = '';

			if('plans' in _dataPlan.data) {
				for(var plan in _dataPlan.data.plans) {
					keyPlan = plan;

					break;
				}
			}

			winkstart.request('numbers_manager.getServicePlan',
				{
					account_id: winkstart.apps['numbers'].account_id,
					api_url: winkstart.apps['numbers'].api_url,
					name: keyPlan
				},
				function(_data,status) {
					var portPrice = '0';

					if('plan' in _data.data && 'number_services' in _data.data.plan && 'port' in _data.data.plan.number_services && 'activation_charge' in _data.data.plan.number_services.port) {
						portPrice = _data.data.plan.number_services.port.activation_charge;
					}

					portPrice = '$' + portPrice;

					callback && callback(portPrice);
				},
				errorCallback
			);
		},
		errorCallback
		);
	},

	render_port_dialog: function(callback) {
		var THIS = this;

		THIS.get_port_price(function(portPrice) {
			var port_form_data = {},
				popup_html = THIS.templates.port_dialog.tmpl({
					_t: function(param){
						return window.translate['numbers_manager'][param];
					},
					porting_price: portPrice,
					company_name: winkstart.config.company_name || '2600hz',
					support_email: (winkstart.config.port || {}).support_email || 'support@2600hz.com',
					support_file_upload: (File && FileReader)
				}),
				popup,
				files,
				loa,
				phone_numbers,
				current_step = 1,
				max_steps = 4,
				$prev_step = $('.prev_step', popup_html),
				$next_step = $('.next_step', popup_html),
				$submit_btn = $('.submit_btn', popup_html);

			/* White label links, have to do it in JS because template doesn't eval variables in href :( */
			$('#loa_link', popup_html).attr('href', ((winkstart.config.port || {}).loa) || 'http://2600hz.com/porting/2600hz_loa.pdf');
			$('#resporg_link', popup_html).attr('href', ((winkstart.config.port || {}).resporg) || 'http://2600hz.com/porting/2600hz_resporg.pdf');
			$('#features_link', popup_html).attr('href', ((winkstart.config.port || {}).features) || 'http://www.2600hz.com/features');
			$('#terms_link', popup_html).attr('href', ((winkstart.config.port || {}).terms) || 'http://www.2600hz.com/terms');

			$('.step_div:not(.first)', popup_html).hide();
			$prev_step.hide();
			$submit_btn.hide();

			$('.other_carrier', popup_html).hide();

			$('.carrier_dropdown', popup_html).change(function() {
				if($(this).val() === 'Other') {
					$('.other_carrier', popup_html).show();
				}
				else {
					$('.other_carrier', popup_html).empty().hide();
				}
			});

			$('#postal_code', popup_html).blur(function() {
				$.getJSON('http://www.geonames.org/postalCodeLookupJSON?&country=US&callback=?', { postalcode: $(this).val() }, function(response) {
					if (response && response.postalcodes.length && response.postalcodes[0].placeName) {
						$('#locality', popup_html).val(response.postalcodes[0].placeName);
						$('#region', popup_html).val(response.postalcodes[0].adminName1);
					}
				});
			});

			$('.prev_step', popup_html).click(function() {
				$next_step.show();
				$submit_btn.hide();
				$('.step_div', popup_html).hide();
				$('.step_div:nth-child(' + --current_step + ')', popup_html).show();
				$('.wizard_nav .steps_text li, .wizard_nav .steps_image .round_circle').removeClass('current');
				$('#step_title_'+current_step +', .wizard_nav .steps_image .round_circle:nth-child('+ current_step +')', popup_html).addClass('current');

				current_step === 1 ? $('.prev_step', popup_html).hide() : true;
			});

			$('.next_step', popup_html).click(function() {
				$prev_step.show();
				$('.step_div', popup_html).hide();
				$('.step_div:nth-child(' + ++current_step + ')', popup_html).show();
				$('.wizard_nav .steps_text li, .wizard_nav .steps_image .round_circle').removeClass('current');
				$('#step_title_'+current_step +', .wizard_nav .steps_image .round_circle:nth-child('+ current_step +')', popup_html).addClass('current');
				if(current_step === max_steps) {
					$next_step.hide();
					$submit_btn.show();
				}
			});

			$('.files, .loa', popup_html).each(function(idx, el) {
				var el = $(el),
					name = el.attr('name');

				el.fileUpload({
					bigBtnClass: 'btn',
					btnClass: 'btn',
					mimeTypes: ['application/pdf'],
					success: function(results) {
						if ( name === 'loa' ) {
							loa = {
								file_name: results[0].name,
								file_data: results[0].file
							};
						}
						else if ( name === 'files') {
							files = {
								file_name: results[0].name,
								file_data: results[0].file
							};
						}
					},
					error: function(errors) {
						for ( var key in errors ) {
							if ( errors[key].length > 0 ) {
								winkstart.alert(_t('numbers_manager', 'error_'.concat(key.replace(/([A-Z])/g, "_$1" ).toLowerCase())).concat(errors[key].join(' ')));
							}
						}
					}
				});
			});

			$('.submit_btn', popup_html).click(function(ev) {
				ev.preventDefault();
				port_form_data = form2object('port');

				delete port_form_data[''];

				port_form_data.bill.address += ' ' + port_form_data.bill.extended_address
				delete port_form_data.bill.extended_address;

				var string_alert = '';

				if($('.carrier_dropdown', popup_html).val() === 'Other') {
					port_form_data.carrier = $('.other_carrier', popup_html).val();
				}

				if(!port_form_data.extra.agreed) {
					string_alert += _t('numbers_manager', 'you_must_agree_to_the_terms');
				}

				if (port_form_data.name === '') {
					string_alert += _t('numbers_manager', 'you_need_to_name');
				}

				$.each(port_form_data.extra.cb, function(k, v) {
					if(v === false) {
						string_alert += _t('numbers_manager', 'you_must_confirm_the_first_conditions');
						return false;
					}
				});

				port_form_data.numbers = $('.numbers_text', popup_html).val().replace(/\n/g,',');
				port_form_data.numbers = port_form_data.numbers.replace(/[\s-\(\)\.]/g, '').split(',');

				port_form_data.main_number = port_form_data.main_number.replace(/[\s-\(\)\.]/g, '');

				var res = port_form_data.main_number.match(/^\+?1?([2-9]\d{9})$/);
				res ? port_form_data.main_number = '+1' + res[1] : string_alert += _t('numbers_manager', 'you_need_to_enter_main_number');

				var is_toll_free_main = THIS.check_toll_free(port_form_data.main_number);

				port_form_data.numbers.unshift(port_form_data.main_number);
				delete port_form_data.main_number;

				phone_numbers = {};
				var error_toll_free = [];
				$.each(port_form_data.numbers, function(i, val) {
					var result = val.match(/^\+?1?([2-9]\d{9})$/);

					if(result) {
						if(THIS.check_toll_free(result[1]) === is_toll_free_main) {
							phone_numbers['+1' + result[1]] = {};
						}
						else {
							error_toll_free.push(result[1]);
						}
					}
					else {
						if(val !== '') {
							string_alert += val + _t('numbers_manager', 'this_phone_number_is_not_valid');
						}
					}
				});

				if(error_toll_free.length > 0) {
					$.each(error_toll_free, function(k, v) {
						string_alert += v + ', ';
					});

					if(is_toll_free_main) {
						string_alert += _t('numbers_manager', 'these_numbers_are_not_toll_free_numbers');
					}
					else {
						string_alert += _t('numbers_manager', 'these_numbers_are_toll_free_numbers');
					}
				}

				port_form_data.numbers = phone_numbers;

				files ? port_form_data.files = files : string_alert += _t('numbers_manager', 'you_need_to_upload_a_bill');
				loa ? port_form_data.loa = loa : string_alert += _t('numbers_manager', 'you_need_to_upload_a_letter_of_authorization');

				if(!port_form_data.notifications.email.send_to.match(/^([0-9A-Za-z_\-\+\.]+@[0-9A-Za-z_\-\.]+\.[0-9A-Za-z]+)?$/)) {
					string_alert += _t('numbers_manager', 'the_email_address_you_entered');
				}

				if(string_alert === '') {
					delete port_form_data.extra;

					if(typeof callback === 'function') {
						callback(port_form_data, popup);
					}
				}
				else {
					winkstart.alert(string_alert);
				}
			});

			popup = winkstart.dialog(popup_html, {
				title: _t('numbers_manager', 'port_a_number_title')
			});
		});
	},

	/**
	 * Open a dialog where users can submit a portability check request for multiple numbers
	 *
	 * @return void
	 */
	render_portability_check_dialog: function() {
		var THIS = this,
			popup_html = THIS.templates.freeform_number_dialog.tmpl({
				_t: function(param) {
					return window.translate.numbers_manager[param];
				},
				action_button_label: _t('numbers_manager', 'check_portability')
			}),
			popup = winkstart.dialog(popup_html, {
				title: _t('numbers_manager', 'check_external_number_portability'),
				position: ['center', 20],
				dialogClass: 'portability_check_dialog'
			});

		$('.submit', popup_html).click(function(e) {
			e.preventDefault();

			// Filter input for anything non-numeric (or +) and split into an array
			var phone_numbers = $('#freeform_numbers', popup_html)
				.val()
				.replace(/[^+\d\n]/g, '')
				.split(/\n/)
				.filter(Boolean);

			if (phone_numbers.length > 0) {
				THIS.check_portability(phone_numbers,
					function(numbers) {
						// Sort non-portable numbers first
						var sortedNums = numbers.sort(function(a, b) {
							return a.portable - b.portable;
						});
						var results = THIS.templates.portability_result.tmpl({
							_t: function(param) {
								return window.translate.numbers_manager[param];
							},
							data: { numbers: sortedNums }
						});
						$('.portability_error, .portability_warning', results)
							.twipsy({ template: THIS.templates.portability_twipsy.prop('outerHTML') });
						$('#numbers_output', popup).empty().append(results);
					},
					function(resp) {
						// Display remote (carrier) API errors
						var errors = [];
						for (var key in resp.data) {
							if (key.indexOf('error_knm') !== -1) {
								errors.push(key + ': ' + resp.data[key]);
							}
						}
						if (!errors.length) {
							errors = [_t('numbers_manager', 'error_portability_generic')];
						}
						winkstart.alert('error', errors.join('<br />'));
					}
				);
			} else {
				winkstart.alert(_t('numbers_manager', 'you_didnt_enter_any_valid_phone_number'));
			}
		});
	},

	/**
	 * Call the kazoo check_portability endpoint with the given array of numbers
	 *
	 * @param {array} numbers - Array of numbers to be checked
	 * @param {function} success - Called on success, will be passed an array of number objects
	 * @param {function} error - Called on an error from the carriers' API(s)
	 *
	 * @return void
	 */
	check_portability: function(numbers, success, error) {
		winkstart.request('numbers_manager.check_portability', {
			api_url: winkstart.apps.numbers.api_url,
			account_id: winkstart.apps.numbers.account_id,
			data: { numbers: numbers }
		},
		function(resp) {
			var numbers = resp && resp.data && resp.data.phone_numbers;
			if (typeof success === 'function' && Array.isArray(numbers)) {
				success(numbers);
			} else if (typeof error === 'function') {
				error(resp);
			}
		},
		winkstart.error_message.process_error()
		);
	},

	check_toll_free: function(number) {
		var toll_free = false,
			toll_free_number = number.match(/^(\+?1)?(8(00|55|66|77|88)[2-9]\d{6})$/);

		if(toll_free_number && toll_free_number[0]) {
			toll_free = true;
		}

		return toll_free;
	},

	activate: function() {
		var THIS = this;

		THIS.render_numbers_manager();
	},

	/**
	 * List numbers in the account
	 *
	 * @param {function} callback Function to execute once numbers have been listed
	 */
	list_numbers: function(callback) {
		this.load_numbers_data(function(err, results) {
			winkstart.table.numbers_manager.fnClearTable();

			var tab_data = [];

			if('phone_numbers' in results) {
				$.each(results.phone_numbers.data.numbers, function(k, v) {
					var inbound = $.inArray('inbound_cnam', v.features) >= 0 ? true : false,
						outbound = $.inArray('outbound_cnam', v.features) >= 0 ? true : false;

					v.e911 = $.inArray('e911', v.features) >= 0 ? true : false;
					v.caller_id = { inbound: inbound, outbound: outbound };

					// Add information about where the number is used, if applicable
					var used_by = {
						type: v.used_by
					};
					if(used_by.type == 'callflow') {
						if(winkstart.apps['voip']) {
							used_by.data = results.callflows[k];
						}
						else {
							used_by.minimal_data = true;
						}
					}
					else if(used_by.type == 'trunkstore') {
						if(winkstart.apps['pbxs']) {
							used_by.data = results.pbxs[k];
						}
						else {
							used_by.minimal_data = true;
						}
					}

					if(winkstart.config.hasOwnProperty('hide_e911') && winkstart.config.hide_e911 === true) {
						tab_data.push(['', k, v.caller_id, v.state, used_by]);
					}
					else {
						tab_data.push(['', k, v.caller_id, v.e911, v.state, used_by]);
					}
				});
			}

			winkstart.table.numbers_manager.fnAddData(tab_data);

			if(typeof callback === 'function') {
				callback();
			}
		});
	},

	/**
	 * Load extra data for populating the Used By column
	 *
	 * @param {function} callback Function to call with error/results from data load
	 */
	load_numbers_data: function(callback) {
		winkstart.parallel({
			callflows: function(callback) {
				if(!winkstart.apps['voip']) {
					callback(null, null);
					return;
				}
				winkstart.request('callflow.list', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url
				},
				function(_data, status) {
					var callflowMap = {};
					$.each(_data.data, function(index, callflow) {
						$.each(callflow.numbers || [], function(index2, number) {
							callflowMap[number] = callflow;
						});
					});
					callback(null, callflowMap);
				},
				function(_data, status) {
					callback(status, null);
				}
				);
			},
			pbxs: function(callback) {
				if(!winkstart.apps['pbxs']) {
					callback(null, null);
					return;
				}
				winkstart.request('old_trunkstore.list', {
					account_id: winkstart.apps['pbxs'].account_id,
					api_url: winkstart.apps['pbxs'].api_url
				},
				function(_data, status) {
					callback(null, _data);
				},
				function(_data, status) {
					callback(status, null);
				}
				);
			},
			phone_numbers: function(callback) {
				winkstart.request('numbers_manager.list', {
					account_id: winkstart.apps['numbers'].account_id,
					api_url: winkstart.apps['numbers'].api_url
				},
				function(_data, status) {
					callback(null, _data);
				},
				function(_data, status) {
					callback(status, null);
				}
				);
			}
		},
		function(err, results) {
			if(err) {
				callback(err, null);
			}

			// Load all trunks
			if(results.pbxs) {
				var pbx_reqs = $.map(results.pbxs.data, function(pbx) {
					return function(callback) {
						winkstart.request('old_trunkstore.get', {
							account_id: winkstart.apps['pbxs'].account_id,
							api_url: winkstart.apps['pbxs'].api_url,
							connectivity_id: pbx
						},
						function(_data, status) {
							callback(null, _data);
						},
						function(_data, status) {
							callback(status, null);
						}
						);
					};
				});

				// Update PBXs data with full data of each
				winkstart.parallel(
					pbx_reqs,
					function(err, pbxResults) {
						var pbxMap = {};
						// Wow such nesting
						$.each(pbxResults, function(index, pbx) {
							$.each(pbx.data.servers, function(index, server) {
								$.each(server.DIDs, function(did) {
									server.id = index;
									pbxMap[did] = server;
								});
							});
						});
						results.pbxs = pbxMap;
						callback(null, results);
					}
				);
			}
			else {
				callback(null, results);
			}
		}
		);
	},

	setup_table: function(parent) {
		var THIS = this,
			numbers_manager_html = parent,
			columns = [];

		columns.push({
			'sTitle': '<input type="checkbox" id="select_all_numbers"/>',
			'fnRender': function(obj) {
				return '<input type="checkbox" class="select_number"/>';
			},
			'bSortable': false
		});

		columns.push({
			'sTitle': _t('numbers_manager', 'phone_number')
		});

		columns.push({
			'sTitle': _t('numbers_manager', 'caller_id'),
			'fnRender': function(obj) {
				var link = '<a class="cid inactive">' + _t('numbers_manager', 'outbound') + '</a>' + ' / ' + '<a class="cid_inbound inactive">' + _t('numbers_manager', 'inbound') + '</a>'
				if(typeof obj.aData[obj.iDataColumn] === 'object') {
					var cid_outbound = 'cid ' + (obj.aData[obj.iDataColumn].outbound ? 'active' : 'inactive');
					var cid_inbound = 'cid_inbound ' + (obj.aData[obj.iDataColumn].inbound ? 'active' : 'inactive');

					link = '<a class="'+cid_outbound+'">' + _t('numbers_manager', 'outbound') + '</a>' + ' / ' + '<a class="'+cid_inbound+'">' + _t('numbers_manager', 'inbound') + '</a>'
				}
				return link;
			},
			'bSortable': false
		});

		/* International customers don't always want to display e911 since it doesn't work for their numbers */
		if(!winkstart.config.hasOwnProperty('hide_e911') || winkstart.config.hide_e911 === false) {
			columns.push({
				'sTitle': _t('numbers_manager', 'E911'),
				'fnRender': function(obj) {
					var e911 = 'e911 ' + (obj.aData[obj.iDataColumn] ? 'active' : 'inactive');
					return '<a class="'+ e911  +'">E911</a>';
				},
				'bSortable': false
			});
		}

		columns.push({
			'sTitle': _t('numbers_manager', 'state'),
			'fnRender': function(obj) {
				var state = obj.aData[obj.iDataColumn].replace('_',' ');
				return state.charAt(0).toUpperCase() + state.substr(1);
			}
		});

		columns.push({
			'sTitle': _t('numbers_manager', 'used_by'),
			'fnRender': function(obj) {
				var data = obj.aData[obj.iDataColumn];
				if(data.type == 'callflow') {
					if(data.data) {
						var callflow_name = data.data.name || data.data.numbers.join(', ');
						return '<a class="used_by_' + data.type + ' inactive" data-id="' + data.data.id + '">' + callflow_name + '</a>';
					}
					else if(data.minimal_data) {
						return _t('numbers_manager', 'callflow');
					}
				}
				else if(data.type == 'trunkstore') {
					if(data.data) {
						return '<a class="used_by_' + data.type + ' inactive" data-id="' + data.data.id + '">' + data.data.server_name + '</a>';
					}
					else if(data.minimal_data) {
						return _t('numbers_manager', 'pbx')
					}
				}

				return '';
			}
		});

		winkstart.table.create('numbers_manager', $('#numbers_manager-grid', numbers_manager_html), columns, {}, {
			sDom: '<"action_number">frtlip',
			aaSorting: [[1, 'desc']],
			fnRowCallback: function(nRow, aaData, iDisplayIndex) {
				$(nRow).attr('id', aaData[1]);
				return nRow;
			}
		});



		var hasPort = !winkstart.config.hasOwnProperty('hide_port') || winkstart.config.hide_port === false,
			htmlString = '<button class="btn success" id="buy_number">' + _t('numbers_manager', 'buy_number') + '</button>' +
				// (hasPort ? '<button class="btn primary" id="port_numbers">' + _t('numbers_manager', 'port_a_number') + '</button>' : '') +
				'<button class="btn danger" id="delete_number">' + _t('numbers_manager', 'delete_selected_numbers') + '</button>';

		$('div.action_number', numbers_manager_html).html(htmlString);

		/* Check if the flag is in the current account OR in the master account if masquerading */
		var account_id = winkstart.apps['numbers'].account_id;

		if('accounts' in winkstart.apps && winkstart.apps['accounts'].masquerade) {
			account_id = winkstart.apps['accounts'].masquerade[0];
		}

		winkstart.request('numbers_manager.get_account', {
			account_id: account_id,
			api_url: winkstart.apps['numbers'].api_url,
		},
		function(_data, status) {
			if(_data.data && _data.data.wnm_allow_additions) {
				$('div.action_number', numbers_manager_html)
					.prepend('<button class="btn" id="launch_portability_dialog">' + _t('numbers_manager', 'launch_portability_button') + '</button>')
					.prepend('<button class="btn" id="add_number">' + _t('numbers_manager', 'add_number') + '</button>');
			}
		}
		);

		$('#numbers_manager-grid_filter input[type=text]', numbers_manager_html).first().focus();

		$('.cancel-search', numbers_manager_html).click(function(){
			$('#numbers_manager-grid_filter input[type=text]', numbers_manager_html).val('');
			winkstart.table.numbers_manager.fnFilter('');
		});
	},

	/**
	 * Display credit card confirmation if enabled
	 *
	 * @param {function} callback Execute after confirmation or immediately
	 * if confirmation is disabled
	 */
	display_credit_card_confirmation: function(callback) {
		if(winkstart.config.hide_credit_card_confirmation) {
			callback();
		}
		else {
			winkstart.confirm(
				_t('numbers_manager', 'your_onfile_credit_card_will_immediately_be_charged'),
				callback
			);
		}
	}
}
);
