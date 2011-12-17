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
                { name: '#first_name',       regex: /^[a-zA-Z\s\-\']+$/ },
                { name: '#last_name',        regex: /^[a-zA-Z\s\-\']+$/ },
                { name: '#card_number',      regex: /^[0-9]{10,22}$/ },
                { name: '#address',          regex: /^.+$/ },
                { name: '#state',            regex: /^[a-zA-Z0-9\_\-\.\s]+$/ },
                { name: '#city',             regex: /^[a-zA-Z0-9\_\-\.\s]+$/ },
                { name: '#country',          regex: /^[a-zA-Z\_\-\s]+$/ },
                { name: '#postal_code',      regex: /^[0-9\-]{4,10}$/ }
            ],
            step3: [
                { name: '#login',            regex: /^[a-zA-Z0-9\_\-]{3,16}$/ },
                { name: '#password',         regex: /^.{3,16}$/ },
                { name: '#company_name',     regex: /^.*$/ }
            ],
        },

        resources: {
            'device.list': {
                url: '{api_url}/accounts/{account_id}/devices',
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
        render_onboarding: function() {
            var THIS = this,
                onboard_html = THIS.templates.onboarding.tmpl({}),
                steps = $(onboard_html).find("fieldset"),
                count = steps.size(),
                number = '';

            winkstart.validate.set(THIS.config.validation['step0'], onboard_html);
            winkstart.validate.set(THIS.config.validation['step1'], onboard_html);
            winkstart.validate.set(THIS.config.validation['step2'], onboard_html);
            winkstart.validate.set(THIS.config.validation['step3'], onboard_html);

            $('#ws-content').empty()
                            .append(onboard_html);

            $('#fast_onboarding_form', onboard_html).formToWizard({ submitButton: 'save_account' });

            $('#picked_number_li', onboard_html).hide();
            $('#extensions_block', onboard_html).hide();
            $('#li_list_number', onboard_html).hide();

            $('#address_infos', onboard_html).hide();
            $('#e911_country_block', onboard_html).hide();
            $('#e911_country', onboard_html).attr('disabled','disabled');
            $('#area_code', onboard_html).focus();

            $('#change_number', onboard_html).click(function() {
                winkstart.validate.is_valid(THIS.config.validation['step0'], onboard_html, function() {
                        //TODO: Call API to retrieve number instead of this crap :D
                        number = $('#area_code', onboard_html).val();
                        for(var i = 0; i < 9; i++) {
                            if(i == 0 || i == 4) {
                                number += '-';
                            }
                            else {
                                number += Math.floor(Math.random()*10);
                            }
                        }
                        $('#picked_number', onboard_html).html(number);
                        $('#change_number', onboard_html).val('I don\'t like this number!');
                        $('#picked_number_li', onboard_html).show();
                        $('#extensions_block', onboard_html).show();
                    },
                    function() {
                        alert('You need to input a valid area code (eg: 415, 508, ...)');
                    }
                );
            });

            $('input[name=group1]', onboard_html).change(function() {
                console.log($(this).val());
                $(this).val() == 'single_phone' ? $('#li_list_number', onboard_html).hide() : $('#li_list_number', onboard_html).show();
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
                                    $('#first_name', onboard_html).focus();
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
                            alert('You can\'t go to the next step because you inputted invalid values in the form.');
                        }
                    );
                }
                else {
                    alert('You need to give an area code and click on the Generate number button before going to next step.');
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
                winkstart.validate.is_valid(THIS.config.validation['step3'], onboard_html, function() {
                        //Process API Call to onboard the client, log him with the creds he just typed
                    },
                    function() {
                        alert('You can\'t finish the setup because you inputted invalid values in the form.');
                    }
                );
            });

            $('*[tooltip]', onboard_html).each(function() {
                $(this).tooltip({ attach: onboard_html });
            });
        }
    }
);

