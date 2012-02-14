winkstart.module('auth', 'onboarding', {
        css: [
            'css/onboarding.css'
        ],

        templates: {
            onboarding: 'tmpl/fast_onboarding.html'
        },

        subscribe: {
            'nav.get_started': 'render_onboarding',
            'onboard.register': 'render_onboarding',
            'onboard.error_braintree': 'error_braintree',
            'onboard.error_phone_numbers': 'error_phone_numbers'
        },

        validation: {
            //phone_number
            step0: [
                { name: '#area_code',               regex: /^[0-9]{3}$/ },
                { name: '#e911_street_address',     regex: /^.+$/ },
                { name: '#e911_extended_address',   regex: /^.*$/ },
                { name: '#e911_region',             regex: /^[a-zA-Z\_\-\s]+$/ },
                { name: '#e911_locality',           regex: /^[a-zA-Z\_\-\s]+$/ },
                { name: '#e911_country',            regex: /^[a-zA-Z\_\-\s]+$/ },
                { name: '#e911_postal_code',        regex: /^[0-9\-]{4,10}$/ }
            ],
            //braintree
            step1: [
                { name: '#cardholder_name',  regex: /^[a-zA-Z\s\-\']+$/ },
                { name: '#card_number',      regex: /^[0-9\s\-]{10,22}$/ },
                { name: '#cvv',              regex: /^[0-9]{2,6}$/ },
                { name: '#street_address',   regex: /^.+$/ },
                { name: '#extended_address', regex: /^.*/ },
                { name: '#region',           regex: /^[a-zA-Z0-9\_\-\.\s]+$/ },
                { name: '#locality',         regex: /^[a-zA-Z0-9\_\-\.\s]+$/ },
                { name: '#country',          regex: /^[a-zA-Z\_\-\s]+$/ },
                { name: '#postal_code',      regex: /^[0-9\-]{4,10}$/ }
            ],
            //account
            step2: [
                { name: '#password',         regex: /^.{3,16}$/ },
                { name: '#verify_password',  regex: /^.{3,16}$/ },
                { name: '#email',            regex: /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/ },
                { name: '#company_name',     regex: /^.*$/ },
                { name: '#name',             regex: /^.*$/ },
                { name: '#extension_1',      regex: /^[0-9]*$/ },
                { name: '#extension_2',      regex: /^[0-9]*$/ },
                { name: '#extension_3',      regex: /^[0-9]*$/ },
                { name: '#extension_4',      regex: /^[0-9]*$/ },
                { name: '#extension_5',      regex: /^[0-9]*$/ },

            ],
        },

        resources: {
            'onboard.create': {
                url: '{api_url}/onboard',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'phone_number.get': {
                url: '{api_url}/phone_numbers?prefix={prefix}&quantity={quantity}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'phone_number.create': {
                url: '{api_url}/accounts/{account_id}/phone_numbers/{number}/activate',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'phone_number.update': {
                url: '{api_url}/accounts/{account_id}/phone_numbers/{number}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'braintree.create': {
                url: '{api_url}/accounts/{account_id}/braintree/customer',
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
        global_used_number: '',

        move_to_tab: function(tab_number, text) {
            var wrapper = $('#onboarding-view');

            $('#step0, #step1, #step2, #steps', wrapper).hide();
            $('#step' + tab_number, wrapper).show();

            $('.next, .prev', wrapper).unbind('click').hide();
            $('#save_account', wrapper).unbind('click').show();

            $('.onboarding_title_text', wrapper).html(text);
        },

        error_braintree: function(errors, callbacks) {
            var THIS = this,
                wrapper = $('#onboarding-view'),
                error_message = 'Please correct the following errors:<br/>';

            THIS.move_to_tab(1, 'Credit Card Information');

            $.each(errors.data.errors, function() {
                error_message += 'Error ' + this.code + ': ' + this.message + '<br/>';
            });

            winkstart.alert('error', error_message);

            $('#save_account', wrapper).click(function() {
                winkstart.validate.is_valid(THIS.config.validation['step1'], function() {
                        var form_data = form2object('fast_onboarding_form');

                        THIS.clean_form_data(form_data);

                        winkstart.request(true, 'braintree.create', {
                                api_url: winkstart.apps['auth'].api_url,
                                account_id: winkstart.apps['auth'].account_id,
                                data: form_data.braintree
                            },
                            function (_data, status) {
                                if(callbacks.length > 0) {
                                    var fn = callbacks.splice(0,1);
                                    fn[0]();
                                }
                            },
                            function (_data, status) {
                                error_message = 'Please correct the following errors:<br/>';
                                $.each(_data.data.errors, function() {
                                    error_message += 'Error ' + this.code + ': ' + this.message + '<br/>';
                                });
                                winkstart.alert('error', error_message);
                            }
                        );
                    },
                    function() {
                        winkstart.alert('error', 'Please correct the form errors to finish the creation of this account.');
                    }
                );
            });
        },

        error_phone_numbers: function(errors, callbacks) {
            var THIS = this,
                replaces,
                wrapper = $('#onboarding-view');

            THIS.move_to_tab(0, 'Phone number and e911 Information');

            winkstart.alert('error', 'Please correct the following errors:<br/>'+ errors[global_used_number].message+'<br/>'+errors[global_used_number].data.dash_e911||' ');
            console.log(errors[global_used_number]);
            console.log(errors[global_used_number].data.dash_e911);

            if(errors[global_used_number].data.dash_e911) {
                $('#pick_number_block', wrapper).hide();
                $('#e911_block', wrapper).show();
            }

            $('#save_account', wrapper).click(function() {
                winkstart.validate.is_valid(THIS.config.validation['step0'], function() {
                        var form_data = form2object('fast_onboarding_form');

                        if(errors[global_used_number].data.dash_e911) {
                            number = global_used_number;
                            form_data.extra.number = global_used_number;

                            THIS.clean_form_data(form_data);
                            console.log(form_data);

                            winkstart.request(true, 'phone_number.update', {
                                    api_url: winkstart.apps['auth'].api_url,
                                    account_id: winkstart.apps['auth'].account_id,
                                    number: number,
                                    data: form_data.phone_numbers[number]
                                },
                                function (_data, status) {
                                    if(callbacks.length > 0) {
                                        var fn = callbacks.splice(0,1);
                                        fn[0]();
                                    }
                                },
                                function (_data, status) {
                                    winkstart.alert('error', _data.message ||_data.data.message || _data.data.dash_e911 || ' ');
                                }
                            );
                        }
                        else {
                            form_data.extra.number = $('#picked_number', wrapper).html().replace(/\s|\-|\(|\)/g,'');
                            number = form_data.extra.number;

                            THIS.clean_form_data(form_data);

                            form_data.phone_numbers[number].replaces = global_used_number;

                            winkstart.request(true, 'phone_number.create', {
                                    api_url: winkstart.apps['auth'].api_url,
                                    account_id: winkstart.apps['auth'].account_id,
                                    number: number,
                                    data: form_data.phone_numbers[number]
                                },
                                function (_data, status) {
                                    if(callbacks.length > 0) {
                                        var fn = callbacks.splice(0,1);
                                        fn[0]();
                                    }
                                },
                                function (_data, status) {
                                    winkstart.alert('error', _data.message || _data.data.message || _data.data.dash_e911 || ' ');
                                }
                            );
                        }
                    },
                    function() {
                        winkstart.alert('error', 'Please correct the form errors to finish the creation of this account.');
                    }
                );
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
                number = form_data.extra.number,
                credentials = $.md5(form_data.extra.email + ':' + form_data.extra.password),
                username = THIS.parse_username(form_data.extra.name),
                cardholder_name = THIS.parse_username(form_data.braintree.credit_card.cardholder_name),
                extension;

            if(form_data.extra.braintree_country_other != '') {
                form_data.braintree.credit_card.billing_address.country = form_data.extra.braintree_country_other;
            }

            if(form_data.extra.e911_country_other != '') {
                form_data.e911.country = form_data.extra.e911_country_other;
            }

            form_data.braintree.credit_card.number = form_data.braintree.credit_card.number.replace(/\s\-/g,'');

            form_data.braintree.credit_card.expiration_date = form_data.extra.expiration_month + '/' + form_data.extra.expiration_year;

            /* Adding default fields for Braintree */
            form_data.braintree.first_name = cardholder_name.first_name;
            form_data.braintree.last_name = cardholder_name.last_name;
            form_data.braintree.credit_card.make_default = true;
            form_data.braintree.credit_card.billing_address.first_name = cardholder_name.first_name;
            form_data.braintree.credit_card.billing_address.last_name = cardholder_name.last_name;
            form_data.braintree.email = form_data.extra.email;
            form_data.braintree.company = form_data.account.name;

            form_data.extensions = [
                {
                    user: {
                        credentials: credentials,
                        priv_level: 'admin',
                        first_name: username.first_name,
                        last_name: username.last_name,
                        email: form_data.extra.email,
                        apps: winkstart.config.register_apps
                    },
                    callflow: {
                        numbers: [ number ]
                    }
                }
            ]

            if(form_data.account.role == 'small_office') {
                extension = $('#extension_1', target).val();
                form_data.extensions[0].callflow.numbers = [ extension ];

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

            form_data.account.caller_id = {
                default: {
                    number: number
                }
            };

            form_data.phone_numbers = {};
            form_data.phone_numbers[number] = { dash_e911: form_data.e911 };

            delete form_data.e911;
            delete form_data.field_data;
            delete form_data.extra;

            return form_data;
        },

        render_onboarding: function() {
            var THIS = this,
                onboard_html = THIS.templates.onboarding.tmpl({}),
                steps = $(onboard_html).find('fieldset'),
                count = steps.size(),
                area_code = '',
                number = '',
                prev_area_code,
                quantity = 15,
                nb_result,
                random = 0,
                prev_random,
                list_number;

            $.each(THIS.config.validation, function() {
                winkstart.validate.set(this, onboard_html);
            });

            $('*[tooltip]', onboard_html).each(function() {
                $(this).tooltip({ attach: onboard_html });
            });

            $('#ws-content').empty()
                            .append(onboard_html);

            $('#fast_onboarding_form', onboard_html).formToWizard({ submitButton: 'save_account' });

            $('#small_office_div', onboard_html).hide();
            $('#single_phone_div', onboard_html).hide();
            $('#reseller_div', onboard_html).hide();
            $('#api_tester_div', onboard_html).hide();
            $('#e911_block', onboard_html).hide();
            $('#address_infos', onboard_html).hide();
            $('#e911_country_block', onboard_html).hide();
            $('#e911_country', onboard_html).attr('disabled','disabled');
            $('#country', onboard_html).attr('disabled','disabled');
            $('#area_code', onboard_html).focus();

            $('#change_number', onboard_html).click(function() {

                area_code = $('#area_code', onboard_html).val();
                $('#e911_block', onboard_html).hide();
                $('#picked_number', onboard_html).hide();

                if(area_code.match(/[0-9]{3}/)) {
                    var display_fields = function() {
                        $('#change_number', onboard_html).html('I don\'t like this number!');
                        $('#picked_number_li', onboard_html).show();
                        $('#e911_block', onboard_html).show();
                    };

                    //If the list of number is empty or the area code changed, then re-run the request.
                    if(!list_number || prev_area_code != area_code) {
                        winkstart.request(true, 'phone_number.get', {
                                api_url: winkstart.apps['auth'].api_url,
                                prefix: area_code,
                                quantity: quantity
                            },
                            function(_data, status) {
                                if(_data.data.length > 0) {
                                    nb_result = _data.data.length;
                                    list_number = _data.data;
                                    prev_random = 0;
                                    prev_area_code = area_code;
                                    number = list_number[0];
                                    $('#picked_number', onboard_html).show()
                                                                     .html(number.replace(/(\+1)([0-9]{3})([0-9]{3})([0-9]{4})/, '$1 ($2) $3-$4'));
                                    display_fields();
                                }
                                else {
                                    winkstart.alert('error','No DIDs were found with this Area Code, please try again or change the Area Code');
                                }
                            }
                        );
                    }
                    else {
                        if(nb_result > 1) {
                            random = Math.floor(Math.random()*nb_result);
                            random == prev_random ? (random != 0 ? random-- : random++) : true;
                            prev_random = random;
                            number = list_number[random];
                            $('#picked_number', onboard_html).show()
                                                             .html(number.replace(/(\+1)([0-9]{3})([0-9]{3})([0-9]{4})/, '$1 ($2) $3-$4'));
                            display_fields();
                        }
                        else {
                            winkstart.alert('This number is the only number available for this Area Code at the moment');
                        }
                    }
                }
                else {
                    winkstart.alert('You need to input a valid area code (eg: 415, 508, ...)');
                }
            });

            $('#role', onboard_html).change(function() {
                $('#small_office_div', onboard_html).hide();
                $('#single_phone_div', onboard_html).hide();
                $('#reseller_div', onboard_html).hide();
                $('#api_tester_div', onboard_html).hide();

                switch($(this).val()) {
                    case 'single_phone':
                        break;

                    case 'small_office':
                        $('#small_office_div', onboard_html).slideDown('show');
                        break;

                    case 'reseller':
                        $('#small_office_div', onboard_html).slideDown('show');
                        break;

                    case 'api_tester':
                        break;
                }
            });

            $('.next', onboard_html).click(function() {
                var i = parseInt($(this).attr('id').substr(4,1));

                if(i != 0 || (i == 0 && number.replace(/\-\+\(\)\s/g,'').match(/[0-9]{10}/))) {
                    winkstart.validate.is_valid(THIS.config.validation['step'+i], onboard_html, function() {
                            var stepName = 'step' + i;

                            $('#' + stepName, onboard_html).hide();
                            $('#step' + (parseInt(i) + 1), onboard_html).show();

                            if(i + 2 == count) {
                                $('#save_account', onboard_html).show();
                            }

                            $('#steps li', onboard_html).removeClass('current');
                            $('#stepDesc' + (parseInt(i)+1), onboard_html).addClass('current');

                            switch(i) {
                                case 0:
                                    $('#cardholder_name', onboard_html).focus();
                                    $('#street_address', onboard_html).val($('#e911_street_address', onboard_html).val());
                                    $('#extended_address', onboard_html).val($('#e911_extended_address', onboard_html).val());
                                    $('#country', onboard_html).val($('#e911_country', onboard_html).val());
                                    $('#region', onboard_html).val($('#e911_region', onboard_html).val());
                                    $('#locality', onboard_html).val($('#e911_locality', onboard_html).val());
                                    $('#postal_code', onboard_html).val($('#e911_postal_code', onboard_html).val());
                                    $('#e911_address_text', onboard_html).html($('#e911_street_address', onboard_html).val()+'<br/>'+$('#e911_extended_address', onboard_html).val()+'</br>'+$('#e911_postal_code', onboard_html).val()+'&nbsp;'+$('#e911_locality', onboard_html).val()+'<br/>'+$('#e911_region', onboard_html).val()+',&nbsp;'+$('#e911_country', onboard_html).val());
                                    break;

                                case 1:
                                    $('#name', onboard_html).focus();
                                    break;
                            }
                        },
                        function() {
                            winkstart.alert('You can\'t go to the next step because you inputted invalid values in the form.');
                        }
                    );
                }
                else {
                    winkstart.alert('You need to give an area code and click on the Generate number button before going to next step.');
                    $('#area_code', onboard_html).focus();
                }
            });

            $('#e911_country', onboard_html).change(function() {
                if($(this).val() == 'Other') {
                   $('#e911_country_block', onboard_html).show();
                }
                else {
                   $('#e911_country_block', onboard_html).hide();
                }
            });

            $('#country', onboard_html).change(function() {
                if($(this).val() == 'Other') {
                   $('#billing_country_text', onboard_html).show();
                }
                else {
                   $('#billing_country_text', onboard_html).hide();
                }
            });

            $('#e911_postal_code', onboard_html).blur(function() {
                if($('#e911_country', onboard_html).val() != 'Other' && $(this).val() != '') {
                    $.getJSON('http://www.geonames.org/postalCodeLookupJSON?&country='+$('#e911_country', onboard_html).val()+'&callback=?', { postalcode: $(this).val() }, function(response) {
                        if (response && response.postalcodes.length && response.postalcodes[0].placeName) {
                            $('#e911_locality', onboard_html).val(response.postalcodes[0].placeName);
                            $('#e911_region', onboard_html).val(response.postalcodes[0].adminName1);
                        }
                    });
                }
            });

            $('#postal_code', onboard_html).blur(function() {
                if($('#country', onboard_html).val() != 'Other') {
                    $.getJSON('http://www.geonames.org/postalCodeLookupJSON?&country='+$('#country', onboard_html).val()+'&callback=?', { postalcode: $(this).val() }, function(response) {
                        if (response && response.postalcodes.length && response.postalcodes[0].placeName) {
                            $('#locality', onboard_html).val(response.postalcodes[0].placeName);
                            $('#region', onboard_html).val(response.postalcodes[0].adminName1);
                        }
                    });
                }
            });

            $('#use_e911', onboard_html).change(function() {
                if($(this).is(':checked')) {
                    $('#street_address', onboard_html).val($('#e911_street_address', onboard_html).val());
                    $('#extended_address', onboard_html).val($('#e911_extended_address', onboard_html).val());
                    $('#country', onboard_html).val($('#e911_country', onboard_html).val());
                    $('#region', onboard_html).val($('#e911_region', onboard_html).val());
                    $('#locality', onboard_html).val($('#e911_locality', onboard_html).val());
                    $('#postal_code', onboard_html).val($('#e911_postal_code', onboard_html).val());
                    $('#e911_address_text', onboard_html).html($('#e911_street_address', onboard_html).val()+'<br/>'+$('#e911_extended_address', onboard_html).val()+'<br/>'+$('#e911_postal_code', onboard_html).val()+'&nbsp;'+$('#e911_locality', onboard_html).val()+'<br/>'+$('#e911_region', onboard_html).val()+',&nbsp;'+$('#e911_country', onboard_html).val());
                }
                else {
                    $('#street_address', onboard_html).val('');
                    $('#extended_address', onboard_html).val('');
                    $('#region', onboard_html).val('');
                    $('#locality', onboard_html).val('');
                    $('#postal_code', onboard_html).val('');
                    $('#country', onboard_html).val('US');
                    $('#billing_country_text', onboard_html).hide();
                }
                $('#address_infos', onboard_html).toggle();
                $('#e911_address_block', onboard_html).toggle()
            });

            $('#save_account', onboard_html).click(function() {
                if($('#password', onboard_html).val() != $('#verify_password', onboard_html).val()) {
                    winkstart.alert('Passwords are not matching, please retype your password.' );
                    $('#password', onboard_html).val('');
                    $('#verify_password', onboard_html).val('');

                    //Gross Hack in order to display Validation Error next to password fields
                    winkstart.validate.is_valid(THIS.config.validation['step2'], onboard_html, function() {
                    });
                    return true;
                }

                winkstart.validate.is_valid(THIS.config.validation['step2'], onboard_html, function() {
                        var form_data = form2object('fast_onboarding_form');

                        form_data.extra.number = number;

                        THIS.clean_form_data(form_data, onboard_html);

                        console.log(form_data);
                        winkstart.request(true, 'onboard.create', {
                                api_url: winkstart.apps['auth'].api_url,
                                data: form_data
                            },
                            function (_data, status) {
                                var callbacks = [],
                                    callback_fn;

                                if(_data.data.owner_id && _data.data.account_id && _data.data.auth_token) {
                                    winkstart.apps['auth'].user_id = _data.data.owner_id;
                                    winkstart.apps['auth'].account_id = _data.data.account_id;
                                    winkstart.apps['auth'].auth_token = _data.data.auth_token;

                                    global_used_number = number;

                                    var success = function() {
                                        $('#ws-content').empty();

                                        $.cookie('c_winkstart_auth', JSON.stringify(winkstart.apps['auth']));

                                        winkstart.publish('auth.load_account');
                                    };

                                    if(_data.data.errors) {
                                        $.each(_data.data.errors, function(key, val) {
                                            callbacks.push(function() {
                                                winkstart.publish('onboard.error_' + key, val, callbacks);
                                            });
                                        });

                                        callbacks.push(function() {
                                            winkstart.alert('info', 'You fixed the errors properly and your account has been created!');
                                            success();
                                        });

                                        callback_fn = callbacks.splice(0, 1);

                                        callback_fn[0]();
                                    }
                                    else {
                                        success();
                                    }
                                }
                                else {
                                    winkstart.alert('error', 'Error while creating your account, please verify information and try again.');
                                }
                            },
                            function(_data, status) {
                                winkstart.alert('There was an error in the request, please try again or contact us.');
                            }
                        );
                    },
                    function() {
                        winkstart.alert('You can\'t finish the setup because you inputted invalid values in the form.');
                    }
                );
            });
        }
    }
);

