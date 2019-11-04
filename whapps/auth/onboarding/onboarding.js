winkstart.module('auth', 'onboarding', {
	css: [
		_t('onboarding', 'css_onboarding')
	],

	templates: {
		new_onboarding: 'tmpl/onboarding.html',
		step1: 'tmpl/step1.html',
		small_office: 'tmpl/small_office.html',
		medium_office: 'tmpl/small_office.html',
		large_office: 'tmpl/small_office.html',
		reseller: 'tmpl/reseller.html'
	},

	subscribe: {
		'nav.get_started': 'render_onboarding',
		'onboard.register': 'render_onboarding',
		'onboard.error_handling': 'error_handling'
	},

	validation: {
		//account
		step1: [
			{ name: '#password',         regex: /^.{3,16}$/ },
			{ name: '#verify_password',  regex: /^.{3,16}$/ },
			{ name: '#email',            regex: _t('onboarding', 'email_regex') },
			{ name: '#verify_email',     regex: _t('onboarding', 'email_regex') },
			{ name: '#company_name',     regex: /^.*$/ },
			{ name: '#name',             regex: /^.*$/ }
		],
	},

	resources: {
		'onboard.create': {
			url: '/signup/',
			contentType: 'application/json',
			verb: 'PUT'
		}
	}
},

function(args) {
	var THIS = this;

	winkstart.registerResources(THIS.__whapp, THIS.config.resources);
},

{
	error_handling: function(data) {
		var THIS = this,
			wrapper = $('#onboarding-view'),
			formated_data = winkstart.print_r(data),
			msg = 'Errors: ',
			errors = data.data.errors;

		winkstart.alert('error', {
			'text': msg,
			data: formated_data
		});
	},

	parse_username: function(username) {
		var response = {
				first_name : '',
				last_name : ''
			},
			index = username.indexOf(' ');

		response.first_name = username.substring(0, index);
		response.last_name = username.substring(index+1);
		if(response.first_name == '') {
			response.first_name = response.last_name;
			response.last_name = '';
		}

		return response;
	},

	//Transform the data from the form2object method to the data object expected by the onboarding API
	clean_form_data: function(form_data, target) {
		var THIS = this,
			credentials = $.md5(form_data.extra.email + ':' + form_data.extra.password),
			username = THIS.parse_username(form_data.extra.name),
			extension;

		//form2object fails to get radio values so here is a quick hack.
		form_data.account.role = $('input:radio[name=account.role]:checked', target).val();

		form_data.extensions = [
			{
				user: {
					credentials: credentials,
					priv_level: 'admin',
					first_name: username.first_name,
					last_name: username.last_name,
					email: form_data.extra.email,
					apps: winkstart.config.onboard_roles ? winkstart.config.onboard_roles[form_data.account.role || 'default'].apps : winkstart.config.register_apps
				},
				callflow: {
					numbers: []
				}
			}
		]

		if(
			form_data.account.role == 'small_office' ||
				form_data.account.role == 'medium_office' ||
				form_data.account.role == 'large_office' ||
				form_data.account.role == 'reseller'
		) {
			extension = $('#extension_1', target).val();
			form_data.extensions[0].callflow.numbers.push(extension);

			for(i=2; i<6; i++) {
				username = THIS.parse_username($('#name_'+i, target).val());
				extension = $('#extension_'+i, target).val();
				if(username.first_name){
					var user = {
						user: {
							first_name: username.first_name,
							last_name: username.last_name,
							priv_level: 'user'
						},
						callflow: {
							numbers: [ extension ]
						}
					}
					form_data.extensions.push(user);
				}
			}
		}

		form_data.account.available_apps = winkstart.config.onboard_roles ? winkstart.config.onboard_roles[form_data.account.role || 'default'].available_apps : [];

		form_data.phone_numbers = {};

		delete form_data.e911;
		delete form_data.field_data;
		delete form_data.extra;

		return form_data;
	},

	load_step1: function(data, parent) {
		var THIS = this,
			current_step = 1,
			onboard_html = parent,
			same = function(arr) {
				var e1 = arr[0],
					e2 = arr[1],
					valid = function() {
						if(e1.val() != e2.val()) {
							e2.parent('.validated')
								.removeClass('valid')
								.addClass('invalid');
						} else {
							e2.parent('.validated').removeClass('invalid');
						}
					};

				e1.bind('keyup blur onchange', function() {
					valid();
				});

				e2.bind('keyup blur onchange', function() {
					valid();
				});
			};

		same([$('#email', onboard_html), $('#verify_email', onboard_html)]);
		same([$('#password', onboard_html), $('#verify_password', onboard_html)]);

		$('#name', onboard_html).bind('keyup blur onchange', function() {
			$('.your_extension', onboard_html).text($(this).val());
		});

		$('.role_radio', onboard_html).click(function() {
			var role = $('input:radio[name=account.role]:checked').val(),
				$container = $(this).parents('.role_div').first(),
				tmpl_data = {
					_t: function(param){
						return window.translate['onboarding'][param];
					}
				};

			$('.role_content').slideUp().empty();

			if(role in THIS.templates) {
				if(role === 'small_office' || role === 'reseller') {
					tmpl_data.username = $('#name', onboard_html).val();
				}
				$('.role_content', $container).hide().append(THIS.templates[role].tmpl(tmpl_data)).slideDown();
			}
		});
	},

	move_to_step: function(step_number, parent, error) {
		var $form = $('#fast_onboarding_form', parent),
			max_step = parseFloat($form.dataset('maxstep'));

		$form.attr('data-step', step_number);

		/* Manage display of buttons */
		$('.step_buttons > button', parent).hide();

		if(error) {
			$('.onboarding_title', parent).empty().html(error);
			$('.steps_nav', parent).hide();
			$('#save_account', parent).show();
		}
		else {
			step_number === max_step ? $('#save_account', parent).show() : $('.next_step', parent).show();

			if(step_number > 1) {
				$('.prev_step', parent).show();
			}

			/* Highlight current step title */
			$('.step_title').removeClass('current');
			$('#step_title_'+step_number, parent).addClass('current');
		}

		/* Show the right template */
		$('.step_content', parent).hide();

		$('#step'+ step_number, parent).show();

		switch(step_number) {
			case 1: $('#name', parent).focus();
		}

		$('html, body').scrollTop(0);
	},

	load_step: function(step, parent, data) {
		var THIS = this;

		$('#fast_onboarding_form', parent).append(THIS.templates['step'+step].tmpl({
			_t: function(param){
				return window.translate['onboarding'][param];
			}
		}));

		switch(step) {
			case 1: THIS.load_step1(data, parent);
				break;
		}
	},

	render_onboarding: function(args) {
		var THIS = this,
			onboard_html = THIS.templates.new_onboarding.tmpl({
				_t: function(param){
					return window.translate['onboarding'][param];
				}
			}),
			$form = $('#fast_onboarding_form', onboard_html),
			max_step = $form.dataset('max-step'),
			current_step = 1;

		THIS.load_step(1, onboard_html);

		THIS.move_to_step(current_step, onboard_html);

		/* Initialize validation for each step */
		$.each(THIS.config.validation, function() {
			winkstart.validate.set(this, onboard_html);
		});

		$('.next_step', onboard_html).click(function() {
			var next_step_fct = function() {
				winkstart.validate.is_valid(THIS.config.validation['step'+current_step], onboard_html, function() {
					THIS.move_to_step(++current_step, onboard_html);
				},
				function() {
					winkstart.alert(_t('onboarding', 'you_cant_go_to_the_next'));
				}
				);
			};

			switch(current_step) {
				default:
					next_step_fct();
					break;
			}
		});

		$('.prev_step', onboard_html).click(function() {
			THIS.move_to_step(--current_step, onboard_html);
		});

		$('#save_account', onboard_html).click(function() {
			if($('#password', onboard_html).val() != $('#verify_password', onboard_html).val()) {
				winkstart.alert(_t('onboarding', 'passwords_are_not_matching'));
				$('#password', onboard_html).val('');
				$('#verify_password', onboard_html).val('');

				//Display Validation Error next to password fields
				winkstart.validate.is_valid(THIS.config.validation['step1'], onboard_html, function() {}, function() {});
				return true;
			}
			if($('#email', onboard_html).val() != $('#verify_email', onboard_html).val()) {
				winkstart.alert(_t('onboarding', 'email_addresses_are_not_matching'));
				$('#email', onboard_html).val('');
				$('#verify_email', onboard_html).val('');

				//Display Validation Error next to email fields
				winkstart.validate.is_valid(THIS.config.validation['step1'], onboard_html, function() {}, function() {});
				return true;
			}

			winkstart.validate.is_valid(THIS.config.validation['step1'], onboard_html, function() {
				$('html, body').scrollTop(0);

				var form_data = form2object('fast_onboarding_form');

				THIS.clean_form_data(form_data, onboard_html);

				//form_data.invite_code = args.invite_code;

				winkstart.request(true, 'onboard.create', {
					data: form_data
				},
				function (_data, status) {
					console.log(_data, status);

					if(_data) {
						// Clear the current signup page
						$('#ws-content').empty();

						winkstart.alert(
							'info',
							"Your request was successfully received! We will be contacting you shortly via email to complete the registration process.",
							function() { window.location = '/'; }
						);
					}
					else {
						winkstart.alert('error', _t('onboarding', 'error_while_creating_your_account'));
					}
				},
				function (_data, status) {
					_data.data.errors = _data.data.errors || {};

					winkstart.publish('onboard.error_handling', _data);

					current_step = 1;
					THIS.move_to_step(1, onboard_html);
				}
				);
			},
			function() {
				winkstart.alert(_t('onboarding', 'you_cant_finish'));
			}
			);
		});

		$('#ws-content')
			.empty()
			.append(onboard_html);
	}
}
);
