winkstart.module('numbers', 'numbers_manager', {
        css: [
            'css/numbers_manager.css'
        ],

        templates: {
            numbers_manager: 'tmpl/numbers_manager.html',
            failover_dialog: 'tmpl/failover_dialog.html',
            cnam_dialog: 'tmpl/cnam_dialog.html',
            e911_dialog: 'tmpl/e911_dialog.html',
            add_number_dialog: 'tmpl/add_number_dialog.html',
            add_number_search_results: 'tmpl/add_number_search_results.html'
        },

        subscribe: {
            'numbers_manager.activate' : 'activate'
        },

        resources: {
            'numbers_manager.list': {
                url: '{api_url}/accounts/{account_id}/phone_numbers',
                contentType: 'application/json',
                verb: 'GET'
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
            'number.delete': {
                url: '{api_url}/accounts/{account_id}/phone_numbers/{phone_number}',
                contentType: 'application/json',
                verb: 'DELETE'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);
    },

    {
        get_number: function(phone_number, callback) {
            winkstart.request('numbers_manager.get', {
                    api_url: winkstart.apps['numbers'].api_url,
                    account_id: winkstart.apps['numbers'].account_id,
                    phone_number: encoreURIComponent(phone_number)
                },
                function(_data, status) {
                    if(typeof callback === 'function') {
                        callback(_data);
                    }
                },
                function(_data, status) {

                }
            );
        },

        update_number: function(phone_number, data, callback) {
            winkstart.request('numbers_manager.update', {
                    api_url: winkstart.apps['numbers'].api_url,
                    account_id: winkstart.apps['numbers'].account_id,
                    phone_number: encodeURIComponent(phone_number),
                    data: data
                },
                function(_data, status) {
                    if(typeof callback === 'function') {
                        callback(_data);
                    }
                },
                function(_data, status) {

                }
            );
        },

        activate_number: function(phone_number, success, error) {
            var THIS = this;

            winkstart.request(false, 'number.activate', {
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

            winkstart.request('number.delete', {
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

            winkstart.request('numbers_manager.search', {
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

        add_numbers: function(numbers_data, callback) {
            var THIS = this,
                number_data;

            if(numbers_data.length > 0) {
                var phone_number = numbers_data[0].phone_number.match(/^\+?1?([2-9]\d{9})$/),
                    error_function = function() {
                        winkstart.confirm('There was an error when trying to acquire ' + numbers_data[0].phone_number +
                            ', would you like to retry?',
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

        clean_phone_number_data: function(data) {
            /* Clean Failover */
            if('failover' in data && 'sip' in data.failover && data.failover.sip === '') {
                delete data.failover.sip;
            }

            if('failover' in data && 'e164' in data.failover && data.failover.e164 === '') {
                delete data.failover.e164;
            }

            if(data.failover && $.isEmptyObject(data.failover)) {
                delete data.failover;
            }

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

            $(numbers_manager_html).delegate('#add_number', 'click', function() {
                THIS.render_add_number_dialog(function() {
                    THIS.list_numbers();
                });
            });

            $(numbers_manager_html).delegate('.failover', 'click', function() {
                var data_phone_number = $(this).parents('tr').dataset('phone-number'),
                    phone_number = data_phone_number.match(/^\+?1?([2-9]\d{9})$/);

                if(phone_number[1]) {
                    THIS.get_number(phone_number[1], function(_data) {
                        THIS.render_failover_dialog(_data.data.failover || {}, function(failover_data) {
                            _data.data.failover = $.extend({}, _data.data.failover, failover_data);

                            THIS.clean_phone_number_data(_data.data);

                            THIS.update_number(phone_number[1], _data.data, function(_data_update) {
                                var $failover_cell = $('tr[data-phone_number='+data_phone_number+'] .failover', numbers_manager_html);
                                !($.isEmptyObject(_data.data.failover)) ? $failover_cell.removeClass('inactive').addClass('active') : $failover_cell.removeClass('active').addClass('inactive');
                            });
                        });
                    });
                }
            });

            $(numbers_manager_html).delegate('.cid', 'click', function() {
                var data_phone_number = $(this).parents('tr').dataset('phone-number'),
                    phone_number = data_phone_number.match(/^\+?1?([2-9]\d{9})$/);

                if(phone_number[1]) {
                    THIS.get_number(phone_number[1], function(_data) {
                        THIS.render_cnam_dialog(_data.data.cnam || {}, function(cnam_data) {
                            _data.data.cnam = $.extend({}, _data.data.cnam, cnam_data);

                            THIS.clean_phone_number_data(_data.data);

                            THIS.update_number(phone_number[1], _data.data, function(_data_update) {
                                var $cnam_cell = $('tr[data-phone_number='+data_phone_number+'] .cid', numbers_manager_html);
                                !($.isEmptyObject(_data.data.cnam)) ? $cnam_cell.removeClass('inactive').addClass('active') : $cnam_cell.removeClass('active').addClass('inactive');
                            });
                        });
                    });
                }
            });

            $(numbers_manager_html).delegate('.e911', 'click', function() {
                var data_phone_number = $(this).parents('tr').dataset('phone-number'),
                    phone_number = data_phone_number.match(/^\+?1?([2-9]\d{9})$/);

                if(phone_number[1]) {
                    THIS.get_number(phone_number[1], function(_data) {
                        THIS.render_e911_dialog(_data.data.dash_e911 || {}, function(e911_data) {
                            _data.data.dash_e911 = $.extend({}, _data.data.dash_e911, e911_data);

                            THIS.clean_phone_number_data(_data.data);

                            THIS.update_number(phone_number[1], _data.data, function(_data_update) {
                                var $e911_cell = $('tr[data-phone_number='+data_phone_number+'] .e911', numbers_manager_html);
                                !($.isEmptyObject(_data.data.dash_e911)) ? $e911_cell.removeClass('inactive').addClass('active') : $e911_cell.removeClass('active').addClass('inactive');
                            });
                        });
                    });
                }
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
                    winkstart.confirm('Are you sure you want to delete the '+nb_numbers+' number(s) selected?', function() {
                            $selected_checkboxes.each(function() {
                                data_phone_number = $(this).parents('tr').dataset('phone-number'),
                                phone_number = data_phone_number.match(/^\+?1?([2-9]\d{9})$/);

                                if(phone_number[1]) {
                                    THIS.delete_number(phone_number[1],
                                        function() {
                                            refresh_list();
                                        },
                                        function() {
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
                    winkstart.alert('You didn\'t select any number to delete');
                }
            });

            THIS.list_numbers(function() {
                (parent || $('#ws-content'))
                    .empty()
                    .append(numbers_manager_html);
            });
        },

        render_cnam_dialog: function(cnam_data, callback) {
            var THIS = this,
                popup_html = THIS.templates.cnam_dialog.tmpl(cnam_data || {}),
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
                title: 'Edit CID'
            });
        },

        render_failover_dialog: function(failover_data, callback) {
            var THIS = this,
                tmpl_data = {
                    radio: (failover_data || {}).e164 ? 'number' : ((failover_data || {}).sip ? 'sip' : ''),
                    failover: (failover_data || {}).e164 || (failover_data || {}).sip || '',
                    phone_number: failover_data.phone_number || ''
                },
                popup_html = THIS.templates.failover_dialog.tmpl(tmpl_data),
                popup,
                result,
                popup_title = failover_data.phone_number ? 'Setup Failover for ' + failover_data.phone_number : 'Setup Failover';

            $('.radio_block input[type="radio"]', popup_html).click(function() {
                $('.radio_block input[type="text"]', popup_html).hide();

                $(this).siblings('input[type="text"]').show('fast');

                $('.header', popup_html).removeClass('number sip').addClass($('.radio_block input[type="radio"]:checked', popup_html).val());
            });

            $('.submit_btn', popup_html).click(function(ev) {
                ev.preventDefault();

                var failover_form_data = {};

                failover_form_data.raw_input = $('input[name="failover_type"]:checked', popup_html).val() === 'number' ? $('.failover_number', popup_html).val() : $('.failover_sip', popup_html).val();

                if(failover_form_data.raw_input.match(/^sip:/)) {
                    failover_form_data.sip = failover_form_data.raw_input;
                }
                else if(result = failover_form_data.raw_input.replace(/-|\(|\)|\s/g,'').match(/^\+?1?([2-9]\d{9})$/)) {
                    failover_form_data.e164 = '+1' + result[1];
                }
                else {
                    failover_form_data.e164 = '';
                }

                delete failover_form_data.raw_input;

                if(failover_form_data.e164 || failover_form_data.sip) {
                    if(typeof callback === 'function') {
                        callback(failover_form_data);
                    }

                    popup.dialog('close');
                }
                else {
                    winkstart.alert('Invalid Failover Number, please type it again.');
                }
            });

            $('.remove_failover', popup_html).click(function(ev) {
                ev.preventDefault();
                if(typeof callback === 'function') {
                    callback({ e164: '', sip: '' });
                }

                popup.dialog('close');
            });

            popup = winkstart.dialog(popup_html, {
                title: popup_title,
                width: '640px'
            });
        },

        render_e911_dialog: function(e911_data, callback) {
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

            $('.submit_btn', popup_html).click(function(ev) {
                ev.preventDefault();

                var e911_form_data = form2object('e911');

                if(typeof callback === 'function') {
                    callback(e911_form_data);
                }

                popup.dialog('close');
            });

            popup = winkstart.dialog(popup_html, {
                title: e911_data.phone_number ? 'Edit Location for ' + e911_data.phone_number : 'Edit 911 Location',
                width: '465px'
            });
        },

        render_add_number_dialog: function(callback) {
            var THIS = this,
                numbers_data = [],
                popup_html = THIS.templates.add_number_dialog.tmpl(),
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
                    var results_html = THIS.templates.add_number_search_results.tmpl(results_data);

                    $('#foundDIDList', popup_html)
                        .empty()
                        .append(results_html);

                    $('.toggle_div', popup_html).show();
                });
            });

            $('#add_numbers_button', popup_html).click(function(ev) {
                ev.preventDefault();

                $('#foundDIDList .checkbox_number:checked', popup_html).each(function() {
                    numbers_data.push($(this).dataset());
                });


                THIS.add_numbers(numbers_data, function() {
                    if(typeof callback === 'function') {
                        callback();
                    }

                    popup.dialog('close');
                });
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
                title: 'Add number',
                width: '600px',
                position: ['center', 20]
            });
        },

        activate: function() {
            var THIS = this;

            THIS.render_numbers_manager();
        },

        list_numbers: function(callback) {
            winkstart.request('numbers_manager.list', {
                    account_id: winkstart.apps['numbers'].account_id,
                    api_url: winkstart.apps['numbers'].api_url
                },
                function(_data, status) {
                    winkstart.table.numbers_manager.fnClearTable();

                    var tab_data = [];
                    $.each(_data.data, function(k, v) {
                        if(k != 'id') {
                            tab_data.push(['lol', k, v.e911, v.cnam, v.failover]);
                        }
                    });

                    winkstart.table.numbers_manager.fnAddData(tab_data);

                    if(typeof callback === 'function') {
                        callback();
                    }
                }
            );
        },

        setup_table: function(parent) {
            var THIS = this,
                numbers_manager_html = parent,
                columns = [
                {
                    'sTitle': 'Select',
                    'fnRender': function(obj) {
                        return '<input type="checkbox" class="select_number"/>';
                    },
                    'bSortable': false
                },
                {
                    'sTitle': 'Phone Number'
                },
                {
                    'sTitle': 'Failover',
                    'fnRender': function(obj) {
                        var failover = 'failover ' + (obj.aData[obj.iDataColumn] ? 'active' : 'inactive');
                        return '<a class="'+ failover  +'">Failover</a>';
                    },
                    'bSortable': false
                },
                {
                    'sTitle': 'Caller-ID',
                    'fnRender': function(obj) {
                        var cid = 'cid ' + (obj.aData[obj.iDataColumn] ? 'active' : 'inactive');
                        return '<a class="'+ cid  +'">CID</a>';
                    },
                    'bSortable': false
                },
                {
                    'sTitle': 'E911',
                    'fnRender': function(obj) {
                        var e911 = 'e911 ' + (obj.aData[obj.iDataColumn] ? 'active' : 'inactive');
                        return '<a class="'+ e911  +'">E911</a>';
                    },
                    'bSortable': false
                }
            ];

            winkstart.table.create('numbers_manager', $('#numbers_manager-grid', numbers_manager_html), columns, {}, {
                sDom: '<"action_number">frtlip',
                aaSorting: [[1, 'desc']],
                fnRowCallback: function(nRow, aaData, iDisplayIndex) {
                    $(nRow).dataset('phone-number', aaData[1]);
                    return nRow;
                }
            });

            $('div.action_number', numbers_manager_html).html('<button class="btn primary" id="add_number">Add Number</button><button class="btn danger" id="delete_number">Delete Selected Numbers</button>');

            $('#numbers_manager-grid_filter input[type=text]', numbers_manager_html).first().focus();

            $('.cancel-search', numbers_manager_html).click(function(){
                $('#numbers_manager-grid_filter input[type=text]', numbers_manager_html).val('');
                winkstart.table.numbers_manager.fnFilter('');
            });
        }
    }
);
