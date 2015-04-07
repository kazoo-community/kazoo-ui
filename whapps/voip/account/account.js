winkstart.module('voip', 'account', {
        css: [
            'css/account.css'
        ],

        templates: {
            account: 'tmpl/account.html',
            'addBlacklist': 'tmpl/addBlacklist.html',
            edit: 'tmpl/edit.html'
        },

        subscribe: {
            'account.activate' : 'activate',
            'account.edit' : 'edit_account'
        },

        validation: [
                { name: '#caller_id_name_external',      regex: _t('account', 'caller_id_name_regex') },
                { name: '#caller_id_number_external',    regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#caller_id_name_internal',      regex: _t('account', 'caller_id_name_regex') },
                { name: '#caller_id_number_internal',    regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#caller_id_name_emergency',     regex: _t('account', 'caller_id_name_regex') },
                { name: '#caller_id_number_emergency',   regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#contact_billing_email',        regex: _t('account', 'contact_regex') },
                { name: '#contact_billing_number',       regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#contact_technical_email',      regex: _t('account', 'contact_regex') },
                { name: '#contact_technical_number',     regex: /^[\+]?[0-9\s\-\.\(\)]*$/ }
        ],

        resources: {
            'account.list_blacklists': {
                url: '{api_url}/accounts/{account_id}/blacklists',
                contentType: 'application/json',
                verb: 'GET'
            },
            'account.get': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'account.update': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'account.list_descendants': {
                url: '{api_url}/accounts/{account_id}/descendants',
                contentType: 'application/json',
                verb: 'GET'
            },
            'account.list': {
                url: '{api_url}/accounts/{account_id}/children',
                contentType: 'application/json',
                verb: 'GET'
            }
        }
    },

    function(args) {
        var THIS = this;
		THIS.module = 'account';
        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        winkstart.publish('whappnav.subnav.add', {
            whapp: 'voip',
            module: THIS.__module,
            label: _t('account', 'account_details_label'),
            icon: 'account',
            weight: '0'
        });
    },

    {
        save_account: function(form_data, data, success, error) {
            var THIS = this,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'account.update', {
                        account_id: data.data.id,
                        api_url: winkstart.apps['voip'].api_url,
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
        },

        formatBlacklist: function(data) {
            var THIS = this;

            data.field_data.available_blacklists = [];
            data.field_data.selected_blacklists = [];

            $.each(data.field_data.blacklists, function(k,v) {
                if(data.hasOwnProperty('data') && data.data.hasOwnProperty('blacklists') && data.data.blacklists.indexOf(v.id) >= 0) {
                    data.field_data.selected_blacklists.push({ id: v.id, name: v.name });
                }
                else {
                    data.field_data.available_blacklists.push({ id: v.id, name: v.name });
                }
            });

            delete data.field_data.blacklists;
        },


        edit_account: function(data, _parent, _target, _callback, data_defaults) {
            var THIS = this,
                parent = _parent || $('#account-content'),
                target = _target || $('#account-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.edit_account({ id: _data.data.id }, parent, target, callbacks);
                    },

                    save_error: _callbacks.save_error,

                    delete_success: _callbacks.delete_success || function() {
                        target.empty();
                    },

                    delete_error: _callbacks.delete_error,

                    after_render: _callbacks.after_render
                },
                defaults = {
                    data: $.extend(true, {
                        caller_id: {
                            internal: {},
                            external: {},
                            emergency: {}
                        },
                        contact: {
                            technical: {},
                            billing: {}
                        },
                        music_on_hold: {}
                    }, data_defaults || {}),
                    field_data: {}
                };

            winkstart.parallel({
                    blacklists: function(callback) {
                        winkstart.request('account.list_blacklists', {
                                account_id: data.id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(_data, status) {
                                defaults.field_data.blacklists = _data.data;

                                callback(null, _data);
                            },
                            function(data, status) {
                                callback(null, {});
                            }
                        );
                    },
                    media_list: function(callback) {
                        winkstart.request(true, 'media.list', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(_data, status) {
                                _data.data.unshift(
                                    {
                                        id: '',
                                        name: _t('account', 'default_music')
                                    },
                                    {
                                        id: 'silence_stream://300000',
                                        name: _t('account', 'silence')
                                    }
                                );

                                defaults.field_data.media = _data.data;

                                callback(null, _data);
                            }
                        );
                    },

                    get_account: function(callback) {
                        if(typeof data == 'object' && data.id) {
                            winkstart.request(true, 'account.get', {
                                    account_id: data.id,
                                    api_url: winkstart.apps['voip'].api_url
                                },
                                function(_data, status) {
                                    THIS.migrate_data(_data);

                                    THIS.format_data(_data);

                                    callback(null, _data);
                                }
                            );
                        }
                        else {
                            callback(null, defaults);
                        }
                    }
                },
                function(err, results) {
                    var render_data = defaults;

                    if(typeof data == 'object' && data.id) {
                        render_data = $.extend(true, defaults, results.get_account);
                    }

                    THIS.formatBlacklist(defaults);

                    THIS.render_account(defaults, target, callbacks);

                    if(typeof callbacks.after_render == 'function') {
                        callbacks.after_render();
                    }
                }
            );
        },

        delete_account: function(data, success, error) {
            var THIS = this;

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'account.delete', {
                        account_id: data.data.id,
                        api_url: winkstart.apps['voip'].api_url
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

        migrate_data: function(data) {
        },

        format_data: function(data) {
            if(!data.field_data) {
                data.field_data = {};
            }

            if(data.data.music_on_hold && 'media_id' in data.data.music_on_hold && data.data.music_on_hold.media_id !== 'silence_stream://300000') {
                data.data.music_on_hold.media_id = data.data.music_on_hold.media_id.split('/')[2];
            }
        },

        clean_form_data: function(form_data) {
            form_data.caller_id.internal.number = form_data.caller_id.internal.number.replace(/\s|\(|\)|\-|\./g, '');
            form_data.caller_id.emergency.number = form_data.caller_id.emergency.number.replace(/\s|\(|\)|\-|\./g, '');
            form_data.caller_id.external.number = form_data.caller_id.external.number.replace(/\s|\(|\)|\-|\./g, '');

            if(form_data.music_on_hold && form_data.music_on_hold.media_id && form_data.music_on_hold.media_id !== 'silence_stream://300000') {
                form_data.music_on_hold.media_id = '/' + winkstart.apps['voip'].account_id + '/' + form_data.music_on_hold.media_id;
            }

            delete form_data.extra;

            return form_data;
        },

        normalize_data: function(data) {
            $.each(data.caller_id, function(key, val) {
                $.each(val, function(_key, _val) {
                    if(_val == '') {
                        delete val[_key];
                    }
                });

                if($.isEmptyObject(val)) {
                    delete data.caller_id[key];
                }
            });

            if($.isEmptyObject(data.caller_id)) {
                delete data.caller_id;
            }

            if(!data.music_on_hold.media_id) {
                delete data.music_on_hold.media_id;
            }

            return data;
        },

        render_account: function(data, target, callbacks) {
			data._t = function(param){
				return window.translate['account'][param];
			}
            var THIS = this,
                account_html = THIS.templates.edit.tmpl(data),
                $tech_email = $('#contact_technical_email', account_html),
                $tech_number = $('#contact_technical_number', account_html),
                $bill_email = $('#contact_billing_email', account_html),
                $bill_number = $('#contact_billing_number', account_html),
                is_identical_contact = false;

            winkstart.validate.set(THIS.config.validation, account_html);

            $('*[rel=popover]:not([type="text"])', account_html).popover({
                trigger: 'hover'
            });

            $('*[rel=popover][type="text"]', account_html).popover({
                trigger: 'focus'
            });

            winkstart.tabs($('.view-buttons', account_html), $('.tabs', account_html));


            // Blacklists events
            var addBlacklist = function(e) {
                var id = $('#blacklist_select',account_html).val(),
                    name = $('#blacklist_select option:selected',account_html).html();

                if(id) {
                    var dataTemplate = {
                        blacklist: {
                            id: id,
                            name: name
                        },
                        _t: function(param){
                            return window.translate['accounts'][param];
                        }
                    };

                    $('.list-blacklists .saved-blacklists', account_html).prepend(THIS.templates.addBlacklist.tmpl(dataTemplate));

                    $('#blacklist_select option:selected',account_html).remove();
                    $('#blacklist_select', account_html).val('');
                }
            };
            $('.blacklist-wrapper.placeholder:not(.active)', account_html).click(function() {
                $(this).addClass('active');
                $('#blacklist_value', account_html).focus();
            });

            $('#add_blacklist', account_html).click(function() {
                addBlacklist();
            });

            $('.add-blacklist', account_html).bind('keypress', function(e) {
                var code = e.keyCode || e.which;

                if(code === 13) {;
                    addBlacklist(e);
                }
            });

            $(account_html).delegate('.delete-blacklist', 'click', function(e) {
                var parent = $(this).parents('.blacklist-wrapper');

                var id = parent.data('id'),
                    name = $('.blacklist-name', parent).html();

                $('#blacklist_select', account_html).append($("<option></option>")
                                                    .attr("value",id)
                                                    .text(name)); 

                parent.remove();
            });

            $('#cancel_blacklist', account_html).click(function(e) {
                e.stopPropagation();

                $('.blacklist-wrapper.placeholder.active', account_html).removeClass('active');
            });
            // End blacklists events

            $('.account-save', account_html).click(function(ev) {
                ev.preventDefault();

                winkstart.validate.is_valid(THIS.config.validation, account_html, function() {
                        var form_data = form2object('account-form');

                        THIS.clean_form_data(form_data);

                        if('field_data' in data) {
                            delete data.field_data;
                        }

                        data.data.blacklists = [];

                        $('.saved-blacklists .blacklist-wrapper', account_html).each(function(k,wrapper) {
                            data.data.blacklists.push($(wrapper).data('id'));
                        });

                        THIS.save_account(form_data, data, callbacks.save_success, winkstart.error_message.process_error(callbacks.save_error));
                    },
                    function() {
                        winkstart.alert(_t('account', 'there_were_errors_on_the_form'));
                    }
                );
            });

            $('.account-delete', account_html).click(function(ev) {
                ev.preventDefault();

                winkstart.confirm(_t('account', 'are_you_sure_you_want_to_delete'), function() {
                    THIS.delete_account(data, callbacks.delete_success, callbacks.delete_error);
                });
            });

            $('#contact_copy_checkbox', account_html).change(function() {
                if($('#contact_copy_checkbox', account_html).attr('checked')) {
                    $tech_email.val($bill_email.val());
                    $tech_number.val($bill_number.val());
                    $('.contact-technical', account_html).slideUp();
                    is_identical_contact = true;
                } else {
                    $('.contact-technical', account_html).slideDown();
                    is_identical_contact = false;
                }
            });

            $bill_email.keyup(function() {
                if(is_identical_contact) {
                    $tech_email.val($bill_email.val());
                }
            });

            $bill_number.keyup(function() {
                if(is_identical_contact) {
                    $tech_number.val($bill_number.val());
                }
            });

            // if at least one field isn't empty, and technical fields are equals to billing fields
            if( ($tech_email.val().length>0 || $tech_number.val().length>0)
              && $tech_number.val() == $bill_number.val() && $tech_email.val() == $bill_email.val()) {
                $('#contact_copy_checkbox', account_html).attr('checked','checked');
                $('.contact-technical', account_html).hide();
                is_identical_contact = true;
            }

            if(!$('#music_on_hold_media_id', account_html).val()) {
                $('#edit_link_media', account_html).hide();
            }

            $('#music_on_hold_media_id', account_html).change(function() {
                !$('#music_on_hold_media_id option:selected', account_html).val() ? $('#edit_link_media', account_html).hide() : $('#edit_link_media', account_html).show();
            });

            $('.inline_action_media', account_html).click(function(ev) {
                var _data = ($(this).dataset('action') == 'edit') ? { id: $('#music_on_hold_media_id', account_html).val() } : {},
                    _id = _data.id;

                ev.preventDefault();

                winkstart.publish('media.popup_edit', _data, function(_data) {
                    /* Create */
                    if(!_id) {
                        $('#music_on_hold_media_id', account_html).append('<option id="'+ _data.data.id  +'" value="'+ _data.data.id +'">'+ _data.data.name +'</option>')
                        $('#music_on_hold_media_id', account_html).val(_data.data.id);

                        $('#edit_link_media', account_html).show();
                    }
                    else {
                        /* Update */
                        if('id' in _data.data) {
                            $('#music_on_hold_media_id #'+_data.data.id, account_html).text(_data.data.name);
                        }
                        /* Delete */
                        else {
                            $('#music_on_hold_media_id #'+_id, account_html).remove();
                            $('#edit_link_media', account_html).hide();
                        }
                    }
                });
            });

            var final_render = function() {
            	(target)
                	.empty()
                	.append(account_html);
            };

			if(winkstart.publish('call_center.render_account_fields', $(account_html), data, final_render)) {
				final_render();
			}
        },

        activate: function(parent) {
            var THIS = this,
                account_html = THIS.templates.account.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(account_html);

            THIS.edit_account({id: winkstart.apps['voip'].account_id});
        }
    }
);
