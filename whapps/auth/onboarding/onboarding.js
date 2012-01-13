winkstart.module('auth', 'onboarding', {
        css: [
            'css/onboarding.css'
        ],

        templates: {
            onboarding: 'tmpl/fast_onboarding.html'
        },

        subscribe: {
            'nav.get_started' : 'render_onboarding'
        },

        validation: {
            step0: [
                { name: '#area_code',        regex: /^[0-9]{3}$/ },
                { name: '#extension_1',      regex: /^[0-9]*$/ },
                { name: '#extension_2',      regex: /^[0-9]*$/ },
                { name: '#extension_3',      regex: /^[0-9]*$/ },
                { name: '#extension_4',      regex: /^[0-9]*$/ },
                { name: '#extension_5',      regex: /^[0-9]*$/ },
            ],
            step1: [
                { name: '#e911_address',     regex: /^.+$/ },
                { name: '#e911_state',       regex: /^[a-zA-Z\_\-\s]+$/ },
                { name: '#e911_city',        regex: /^[a-zA-Z\_\-\s]+$/ },
                { name: '#e911_country',     regex: /^[a-zA-Z\_\-\s]+$/ },
                { name: '#e911_postal_code', regex: /^[0-9\-]{4,10}$/ }
            ],
            step2: [
                { name: '#cardholder_name',  regex: /^[a-zA-Z\s\-\']+$/ },
                { name: '#card_number',      regex: /^[0-9]{10,22}$/ },
                { name: '#cvv',              regex: /^[0-9]{2,6}$/ },
                { name: '#address',          regex: /^.+$/ },
                { name: '#state',            regex: /^[a-zA-Z0-9\_\-\.\s]+$/ },
                { name: '#city',             regex: /^[a-zA-Z0-9\_\-\.\s]+$/ },
                { name: '#country',          regex: /^[a-zA-Z\_\-\s]+$/ },
                { name: '#postal_code',      regex: /^[0-9\-]{4,10}$/ }
            ],
            step3: [
                { name: '#password',         regex: /^.{3,16}$/ },
                { name: '#verify_password',  regex: /^.{3,16}$/ },
                { name: '#email',            regex: /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/ },
                { name: '#company_name',     regex: /^.*$/ },
                { name: '#name',             regex: /^.*$/ }
            ],
        },

        resources: {
            'onboard.create': {
                url: 'http://192.168.5.157:8000/v1/onboard',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'phone_number.get': {
                url: 'http://192.168.5.157:8000/v1/phone_numbers?prefix={prefix}&quantity={quantity}',
                contentType: 'application/json',
                verb: 'GET'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);
    },

    {
        clean_form_data: function(form_data, target) {
            var number = form_data.extra.number,
                credentials = $.md5(form_data.extra.email + ':' + form_data.extra.password),
                split = form_data.extra.name.split(' '),
                first_name = split[0],
                last_name = split [1],
                extension;

            if(form_data.extra.credit_card_country_other != '') {
                form_data.credit_card.billing_address.country = form_data.extra.credit_card_country_other;
            }

            if(form_data.extra.e911_country_other != '') {
                form_data.e911.country = form_data.extra.e911_country_other;
            }

            form_data.credit_card.expiration_date = form_data.extra.expiration_month + '/' + form_data.extra.expiration_year;

            form_data.extensions = [
                {
                    user: {
                        credentials: credentials,
                        priv_level: 'admin',
                        first_name: first_name,
                        last_name: last_name,
                        email: form_data.extra.email,
                        apps: winkstart.config.register_apps
                    },
                    callflow: {
                        numbers: [ number ]
                    }
                }
            ]

            if(form_data.account.role == "small_office") {
                extension = $('#extension_1', target).val();
                form_data.extensions[0].callflow.numbers = [ extension ];

                for(i=2; i<6; i++) {
                    split = $('#name_'+i, target).val().split(' ');
                    first_name = split[0];
                    last_name = split[1];
                    extension = $('#extension_'+i, target).val();
                    if(first_name && last_name && extension){
                        var user = {
                            user: {
                                first_name: first_name,
                                last_name: last_name,
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

            form_data.phone_numbers = {};
            form_data.phone_numbers[number] = { e911: form_data.e911 };

            delete form_data.e911;
            delete form_data.field_data;
            delete form_data.extra;

            return form_data;
        },

        render_onboarding: function() {
            var THIS = this,
                onboard_html = THIS.templates.onboarding.tmpl({}),
                steps = $(onboard_html).find("fieldset"),
                count = steps.size(),
                area_code = '',
                prev_area_code,
                quantity = 15,
                nb_result,
                random = 0,
                prev_random,
                list_number;

            winkstart.validate.set(THIS.config.validation['step0'], onboard_html);
            winkstart.validate.set(THIS.config.validation['step1'], onboard_html);
            winkstart.validate.set(THIS.config.validation['step2'], onboard_html);
            winkstart.validate.set(THIS.config.validation['step3'], onboard_html);

            $('*[tooltip]', onboard_html).each(function() {
                $(this).tooltip({ attach: onboard_html });
            });

            $('#ws-content').empty()
                            .append(onboard_html);

            $('#fast_onboarding_form', onboard_html).formToWizard({ submitButton: 'save_account' });

            $('#li_number_for', onboard_html).hide();
            $('#small_office_div', onboard_html).hide();
            $('#single_phone_div', onboard_html).hide();
            $('#reseller_div', onboard_html).hide();
            $('#api_tester_div', onboard_html).hide();

            $('#address_infos', onboard_html).hide();
            $('#e911_country_block', onboard_html).hide();
            $('#e911_country', onboard_html).attr('disabled','disabled');
            $('#area_code', onboard_html).focus();

            $('#change_number', onboard_html).click(function() {
                winkstart.validate.is_valid(THIS.config.validation['step0'], onboard_html, function() {
                        //TODO: Call API to retrieve number instead of this crap :D
                        area_code = $('#area_code', onboard_html).val();

                        //If the list of number is empty or the area code changed.
                        if(!list_number || prev_area_code != area_code) {
                            winkstart.request(true, 'phone_number.get', {
                                    //api_url: winkstart.apps['auth'].api_url,
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
                                        $('#picked_number', onboard_html).html(number.replace(/(\+1)([0-9]{3})([0-9]{3})([0-9]{4})/, '$1 ($2) $3-$4'));
                                        $('#change_number', onboard_html).html('I don\'t like this number!');
                                        $('#picked_number_li', onboard_html).show();
                                        $('#li_number_for', onboard_html).show();
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
                                $('#picked_number', onboard_html).html(number.replace(/(\+1)([0-9]{3})([0-9]{3})([0-9]{4})/, '$1 ($2) $3-$4'));
                                $('#change_number', onboard_html).html('I don\'t like this number!');
                                $('#picked_number_li', onboard_html).show();
                                $('#li_number_for', onboard_html).show();
                            }
                            else {
                                winkstart.alert('This number is the only number available for this Area Code at the moment');
                            }
                        }
                    },
                    function() {
                        winkstart.alert('You need to input a valid area code (eg: 415, 508, ...)');
                    }
                );
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

            $('.prev, .next', onboard_html).focus(function() {
                $(this).toggleClass('focused');
            });

            $('.prev, .next', onboard_html).blur(function() {
                $(this).toggleClass('focused');
            });

            $('.next', onboard_html).click(function() {
                var i = parseInt($(this).attr('id').substr(4,1));

                if(i != 0 || (i == 0 && number.replace(/\-/g,'').match(/[0-9]{10}/))) {
                    winkstart.validate.is_valid(THIS.config.validation['step'+i], onboard_html, function() {
                            var stepName = 'step' + i;

                            $("#" + stepName).hide();
                            $("#step" + (parseInt(i) + 1)).show();

                            if(i + 2 == count) {
                                $('#save_account', onboard_html).show();
                            }

                            $("#steps li").removeClass("current");
                            $("#stepDesc" + (parseInt(i)+1)).addClass("current");

                            switch(i) {
                                case 0:
                                    $('#e911_postal_code', onboard_html).focus();
                                    break;

                                case 1:
                                    $('#cardholder_name', onboard_html).focus();
                                    $('#address', onboard_html).val($('#e911_address', onboard_html).val());
                                    $('#country', onboard_html).val($('#e911_country', onboard_html).val());
                                    $('#state', onboard_html).val($('#e911_state', onboard_html).val());
                                    $('#city', onboard_html).val($('#e911_city', onboard_html).val());
                                    $('#postal_code', onboard_html).val($('#e911_postal_code', onboard_html).val());
                                    $('#e911_address_text', onboard_html).html($('#e911_address', onboard_html).val()+'<br/>'+$('#e911_postal_code', onboard_html).val()+'&nbsp;'+$('#e911_city', onboard_html).val()+'<br/>'+$('#e911_state', onboard_html).val()+',&nbsp;'+$('#e911_country', onboard_html).val());
                                    break;

                                case 2:
                                    $('#login', onboard_html).focus();
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
                            $('#e911_city', onboard_html).val(response.postalcodes[0].placeName);
                            $('#e911_state', onboard_html).val(response.postalcodes[0].adminName1);
                        }
                    });
                }
            });

            $('#postal_code', onboard_html).blur(function() {
                if($('#country', onboard_html).val() != 'Other') {
                    $.getJSON('http://www.geonames.org/postalCodeLookupJSON?&country='+$('#country', onboard_html).val()+'&callback=?', { postalcode: $(this).val() }, function(response) {
                        if (response && response.postalcodes.length && response.postalcodes[0].placeName) {
                            $('#city', onboard_html).val(response.postalcodes[0].placeName);
                            $('#state', onboard_html).val(response.postalcodes[0].adminName1);
                        }
                    });
                }
            });

            $('#use_e911', onboard_html).change(function() {
                if($(this).is(':checked')) {
                    $('#address', onboard_html).val($('#e911_address', onboard_html).val());
                    $('#country', onboard_html).val($('#e911_country', onboard_html).val());
                    $('#state', onboard_html).val($('#e911_state', onboard_html).val());
                    $('#city', onboard_html).val($('#e911_city', onboard_html).val());
                    $('#postal_code', onboard_html).val($('#e911_postal_code', onboard_html).val());
                    $('#e911_address_text', onboard_html).html($('#e911_address', onboard_html).val()+'<br/>'+$('#e911_postal_code', onboard_html).val()+'&nbsp;'+$('#e911_city', onboard_html).val()+'<br/>'+$('#e911_state', onboard_html).val()+',&nbsp;'+$('#e911_country', onboard_html).val());
                }
                else {
                    $('#address', onboard_html).val('');
                    $('#state', onboard_html).val('');
                    $('#city', onboard_html).val('');
                    $('#postal_code', onboard_html).val('');
                    $('#country').val('US');
                    $('#billing_country_text', onboard_html).hide();
                }
                $('#address_infos', onboard_html).toggle();
                $('#e911_address_block', onboard_html).toggle()
            });

            $('#save_account', onboard_html).click(function() {
                if($('#password', onboard_html).val() != $('#verify_password', onboard_html).val()) {
                    winkstart.alert('Passwords are not matching, please retype your password.' );
                    $('#password', onboard_html).val("");
                    $('#verify_password', onboard_html).val("");

                    winkstart.validate.is_valid(THIS.config.validation['step3'], onboard_html, function() {
                    });
                    return true;
                }

                winkstart.validate.is_valid(THIS.config.validation['step3'], onboard_html, function() {
                        var form_data = form2object('fast_onboarding_form');

                        form_data.extra.number = number;

                        THIS.clean_form_data(form_data, onboard_html);

                        //console.log(JSON.stringify(form_data));
                        console.log(form_data);
                        winkstart.request(true, 'onboard.create', {
                                data: form_data
                            },
                            function (_data, status) {
                            },
                            function(_data, status) {
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

