winkstart.module('voip', 'user', {
        css: [
            'css/user.css'
        ],

        templates: {
            user: 'tmpl/user.html',
            edit: 'tmpl/edit.html',
            user_callflow: 'tmpl/user_callflow.html',
            device_row: 'tmpl/device_row.html'
        },

        subscribe: {
            'user.activate': 'activate',
            'user.edit': 'edit_user',
            'callflow.define_callflow_nodes': 'define_callflow_nodes',
            'user.popup_edit': 'popup_edit_user'
        },

        validation : [
                { name: '#first_name',                regex: _t('user', 'first_last_name_regex') },
                { name: '#last_name',                 regex: _t('user', 'first_last_name_regex') },
                { name: '#username',                  regex: _t('user', 'username_regex') },
                { name: '#email',                     regex: _t('user', 'email_regex') },
                { name: '#caller_id_number_internal', regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#caller_id_name_internal',   regex: _t('user', 'caller_id_name_regex') },
                { name: '#caller_id_number_external', regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#caller_id_name_external',   regex: _t('user', 'caller_id_name_regex') },
                { name: '#advanced_caller_id_number_emergency',regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#advanced_caller_id_name_emergency',  regex: _t('user', 'caller_id_name_regex') },
                { name: '#hotdesk_id',                regex: /^[0-9\+\#\*]*$/ },
                { name: '#hotdesk_pin',               regex: /^[0-9]*$/ },
                { name: '#call_forward_number',       regex: /^[\+]?[0-9]*$/ }
        ],

        resources: {
            'user.list_classifiers': {
                url: '{api_url}/accounts/{account_id}/phone_numbers/classifiers',
                contentType: 'application/json',
                verb: 'GET'
            },
            'user.list': {
                url: '{api_url}/accounts/{account_id}/users',
                contentType: 'application/json',
                verb: 'GET'
            },
            'user.list_no_loading': {
                url: '{api_url}/accounts/{account_id}/users',
                contentType: 'application/json',
                verb: 'GET',
                trigger_events: false
            },
            'user.get': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'user.create': {
                url: '{api_url}/accounts/{account_id}/users',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'user.update': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'user.delete': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            },
            'user.hotdesks': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}/hotdesks',
                contentType: 'application/json',
                verb: 'GET'
            },
            'user.device_list': {
                url: '{api_url}/accounts/{account_id}/devices?filter_owner_id={owner_id}',
                contentType: 'application/json',
                verb: 'GET',
                trigger_events: false
            },
            'user.device_new_user': {
                url: '{api_url}/accounts/{account_id}/devices?filter_new_user={owner_id}',
                contentType: 'application/json',
                verb: 'GET',
                trigger_events: false
            },
            'user.account_get': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        //winkstart.publish('statistics.add_stat', THIS.define_stats());

        winkstart.publish('whappnav.subnav.add', {
            whapp: 'voip',
            module: THIS.__module,
            label: _t('user', 'users_label'),
            icon: 'user',
            weight: '10',
            category: _t('config', 'advanced_menu_cat')
        });
    },

    {
        random_id: false,

        save_user: function(form_data, data, success, error) {
            var THIS = this,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'user.update', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        user_id: data.data.id,
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
                winkstart.request(true, 'user.create', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
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

        acquire_device: function(user_data, success, error) {
            var THIS = this,
                user_id = user_data.data.id;

            if(THIS.random_id) {
                winkstart.request(true, 'user.device_new_user', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        owner_id: THIS.random_id
                    },
                    function(_data, status) {
                        var device_id;
                        var array_length = _data.data.length;
                        if(array_length != 0) {
                            $.each(_data.data, function(k, v) {
                                device_id = this.id;
                                winkstart.request(false, 'device.get', {
                                        account_id: winkstart.apps['voip'].account_id,
                                        api_url: winkstart.apps['voip'].api_url,
                                        device_id: device_id
                                    },
                                    function(_data, status) {
                                        _data.data.owner_id = user_id;
                                        delete _data.data.new_user;
                                        winkstart.request(false, 'device.update', {
                                                account_id: winkstart.apps['voip'].account_id,
                                                api_url: winkstart.apps['voip'].api_url,
                                                device_id: _data.data.id,
                                                data: _data.data
                                            },
                                            function(_data, status) {
                                                if(k == array_length - 1) {
                                                    success({}, status, 'create');
                                                }
                                            }
                                        );
                                    }
                                );
                            });
                        }
                        else {
                            success({}, status, 'create');
                        }
                    }
                );
            }
            else {
                success({}, status, 'create');
            }
        },

        edit_user: function(data, _parent, _target, _callbacks, data_defaults) {
            var THIS = this,
                parent = _parent || $('#user-content'),
                target = _target || $('#user-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.render_list(parent);

                        THIS.edit_user({ id: _data.data.id }, parent, target, callbacks);
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
                        apps: {},
                        call_forward: {
                            substitute: true
                        },
                        call_restriction: {
                            closed_groups: { action: 'inherit' }
                        },
                        caller_id: {
                            internal: {},
                            external: {},
                            emergency: {}
                        },
                        hotdesk: {},
                        contact_list: {
                            exclude: false,
                        },
                        music_on_hold: {}
                    }, data_defaults || {}),
                    field_data: {
                        device_types: {
                            sip_device: _t('user', 'sip_device_type'),
                            cellphone: _t('user', 'cell_phone_type'),
                            fax: _t('user', 'fax_type'),
                            smartphone: _t('user', 'smartphone_type'),
                            landline: _t('user', 'landline_type'),
                            softphone: _t('user', 'softphone_type'),
                            sip_uri: _t('user', 'sip_uri_type')
                        },
                        call_restriction: {}
                    }
                };

            THIS.random_id = false;

            winkstart.parallel({
                list_classifiers: function(callback) {
                    winkstart.request('user.list_classifiers', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url
                        },
                        function(_data_classifiers, status) {
                            if('data' in _data_classifiers) {
                                $.each(_data_classifiers.data, function(k, v) {
                                    defaults.field_data.call_restriction[k] = {
                                        friendly_name: v.friendly_name
                                    };

                                    defaults.data.call_restriction[k] = { action: 'inherit' };
                                });
                            }
                            callback(null, _data_classifiers);
                        }
                    );
                },
                media_list: function(callback) {
                    winkstart.request(true, 'media.list', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url
                        },
                        function(_data, status) {
                            if(_data.data) {
                                _data.data.unshift(
                                    {
                                        id: '',
                                        name: _t('user', 'default_music')
                                    },
                                    {
                                        id: 'silence_stream://300000',
                                        name: _t('user', 'silence')
                                    }
                                );
                            }

                            defaults.field_data.media = _data.data;

                            callback(null, _data);
                        }
                    );
                },
                user_get: function(callback) {
                    if(typeof data == 'object' && data.id) {
                        winkstart.request(true, 'user.get', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url,
                                user_id: data.id
                            },
                            function(_data, status) {
                                THIS.migrate_data(_data);

                                callback(null, _data);
                            }
                        );
                    }
                    else {
                        THIS.random_id = $.md5(winkstart.random_string(10)+new Date().toString());
                        defaults.field_data.new_user = THIS.random_id;

                        callback(null, defaults);
                    }
                },
                user_hotdesks: function(callback) {
                    if(typeof data == 'object' && data.id) {
                        winkstart.request(true, 'user.hotdesks', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url,
                                user_id: data.id
                            },
                            function(_data_devices) {
                            	defaults.field_data.hotdesk_enabled = true;
                                defaults.field_data.device_list = {};

                                $.each(_data_devices.data, function(k, v) {
                                    defaults.field_data.device_list[v.device_id] = { name: v.device_name };
                                });

                                if($.isEmptyObject(defaults.field_data.device_list)) {
                                    delete defaults.field_data.device_list;
                                }

                                callback(null, _data_devices);
                            },
                            function(_data, status) {
                                //callback({api_name: 'Hotdesk'}, _data);
                                callback(null, defaults);
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
                if(typeof data === 'object' && data.id) {
                    render_data = $.extend(true, defaults, results.user_get);
                }

                THIS.render_user(render_data, target, callbacks);

                if(typeof callbacks.after_render == 'function') {
                    callbacks.after_render();
                }
            });
        },

        delete_user: function(data, success, error) {
            var THIS = this;

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'user.delete', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        user_id: data.data.id
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

        update_single_device: function($checkbox, parent) {
            $checkbox.attr('disabled', 'disabled');

            var device_id = $checkbox.dataset('device_id'),
                enabled = $checkbox.is(':checked');

            winkstart.request(false, 'device.get', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url,
                    device_id: device_id
                },
                function(_data, status) {
                    if($.inArray(_data.data.device_type, ['cellphone', 'smartphone', 'landline']) > -1) {
                        _data.data.call_forward.enabled = enabled;
                    }
                    _data.data.enabled = enabled;
                    winkstart.request(false, 'device.update', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url,
                            device_id: _data.data.id,
                            data: _data.data
                        },
                        function(_data, status) {
                            $checkbox.removeAttr('disabled');
                            if(_data.data.enabled === true) {
                                $('#'+ _data.data.id + ' .column.third', parent).removeClass('disabled');
                            }
                            else {
                                $('#'+ _data.data.id + ' .column.third', parent).addClass('disabled');
                            }
                        },
                        function(_data, status) {
                            $checkbox.removeAttr('disabled');
                            enabled ? $checkbox.removeAttr('checked') : $checkbox.attr('checked', 'checked');
                        }
                    );
                },
                function(_data, status) {
                    $checkbox.removeAttr('disabled');
                    enabled ? $checkbox.removeAttr('checked') : $checkbox.attr('checked', 'checked');
                }
            );
        },

        render_user: function(data, target, callbacks) {
			data._t = function(param){
				return window.translate['user'][param];
			};
            var THIS = this,
                user_html = THIS.templates.edit.tmpl(data),
                data_devices,
                hotdesk_pin =   $('.hotdesk_pin', user_html),
                hotdesk_pin_require = $('#hotdesk_require_pin', user_html);

            THIS.render_device_list(data, user_html);

            winkstart.validate.set(THIS.config.validation, user_html);

            winkstart.timezone.populate_dropdown($('#timezone', user_html), data.data.timezone);

			if (data.data.id === winkstart.apps['voip'].user_id){
				$('.user-delete', user_html).hide();
			}

            $('*[rel=popover]:not([type="text"])', user_html).popover({
                trigger: 'hover'
            });

            $('*[rel=popover][type="text"]', user_html).popover({
                trigger: 'focus'
            });

            winkstart.tabs($('.view-buttons', user_html), $('.tabs', user_html));
            winkstart.link_form(user_html);

            hotdesk_pin_require.is(':checked') ? hotdesk_pin.show() : hotdesk_pin.hide();

            hotdesk_pin_require.change(function() {
                $(this).is(':checked') ? hotdesk_pin.show('blind') : hotdesk_pin.hide('blind');
            });

            $('.user-save', user_html).click(function(ev) {
                ev.preventDefault();

                if($('#pwd_mngt_pwd1', user_html).val() != $('#pwd_mngt_pwd2', user_html).val()) {
                    winkstart.alert(_t('user', 'the_passwords_on_the'));
                    return true;
                }

                winkstart.validate.is_valid(THIS.config.validation, user_html, function() {
                        var form_data = form2object('user-form');

                        if(form_data.enable_pin === false) {
                            delete data.data.queue_pin;
                            delete data.data.record_call;
                        }

                        THIS.clean_form_data(form_data);

                        if('field_data' in data) {
                            delete data.field_data;
                        }

                        if(form_data.password === undefined || winkstart.is_password_valid(form_data.password)) {

                            winkstart.request('user.account_get', {
                                    api_url: winkstart.apps['voip'].api_url,
                                    account_id: winkstart.apps['voip'].account_id,
                                },
                                function(_data, status) {
                                    if(form_data.priv_level == 'admin') {
                                        form_data.apps = form_data.apps || {};
                                        if(!('voip' in form_data.apps) && $.inArray('voip', (_data.data.available_apps || [])) > -1) {
                                            form_data.apps['voip'] = {
                                                label: _t('user', 'voip_services_label'),
                                                icon: 'device',
                                                api_url: winkstart.apps['voip'].api_url
                                            }
                                        }
                                    }
                                    else if(form_data.priv_level == 'user' && $.inArray('userportal', (_data.data.available_apps || [])) > -1) {
                                        form_data.apps = form_data.apps || {};
                                        if(!('userportal' in form_data.apps)) {
                                            form_data.apps['userportal'] = {
                                                label: _t('user', 'user_portal_label'),
                                                icon: 'userportal',
                                                api_url: winkstart.apps['voip'].api_url
                                            }
                                        }
                                    }

                                    THIS.save_user(form_data, data, function(data, status, action) {
                                        if(action == 'create') {
                                            THIS.acquire_device(data, function() {
                                                if(typeof callbacks.save_success == 'function') {
                                                    callbacks.save_success(data, status, action);
                                                }
                                            }, function() {
                                                if(typeof callbacks.save_error == 'function') {
                                                    callbacks.save_error(data, status, action);
                                                }
                                            });
                                        }
                                        else {
                                            if(typeof callbacks.save_success == 'function') {
                                                callbacks.save_success(data, status, action);
                                            }
                                        }
                                    }, winkstart.error_message.process_error(callbacks.save_error));
                                }
                            );

                        }
                    },
                    function() {
                        winkstart.alert(_t('user', 'there_were_errors_on_the_form'));
                    }
                );
            });

            $('.user-delete', user_html).click(function(ev) {
                ev.preventDefault();

                winkstart.confirm(_t('user', 'are_you_sure_you_want_to_delete'), function() {
                    THIS.delete_user(data, callbacks.delete_success, callbacks.delete_error);
                });
            });

            if(!$('#music_on_hold_media_id', user_html).val()) {
                $('#edit_link_media', user_html).hide();
            }

            $('#music_on_hold_media_id', user_html).change(function() {
                !$('#music_on_hold_media_id option:selected', user_html).val() ? $('#edit_link_media', user_html).hide() : $('#edit_link_media', user_html).show();
            });

            $('.inline_action_media', user_html).click(function(ev) {
                var _data = ($(this).dataset('action') == 'edit') ? { id: $('#music_on_hold_media_id', user_html).val() } : {},
                    _id = _data.id;

                ev.preventDefault();

                winkstart.publish('media.popup_edit', _data, function(_data) {
                    /* Create */
                    if(!_id) {
                        $('#music_on_hold_media_id', user_html).append('<option id="'+ _data.data.id  +'" value="'+ _data.data.id +'">'+ _data.data.name +'</option>')
                        $('#music_on_hold_media_id', user_html).val(_data.data.id);

                        $('#edit_link_media', user_html).show();
                    }
                    else {
                        /* Update */
                        if('id' in _data.data) {
                            $('#music_on_hold_media_id #'+_data.data.id, user_html).text(_data.data.name);
                        }
                        /* Delete */
                        else {
                            $('#music_on_hold_media_id #'+_id, user_html).remove();
                            $('#edit_link_media', user_html).hide();
                        }
                    }
                });
            });

            $(user_html).delegate('.enabled_checkbox', 'click', function() {
                THIS.update_single_device($(this), user_html);
            });

            $(user_html).delegate('.action_device.edit', 'click', function() {
                var data_device = {
                    id: $(this).dataset('id'),
                    hide_owner: !data.data.id ? true : false
                };

                var defaults = {};

                if(!data.data.id) {
                    defaults.new_user = THIS.random_id;
                }
                else {
                    defaults.owner_id = data.data.id;
                }

                winkstart.publish('device.popup_edit', data_device, function(_data) {
                    data_devices = {
                        data: { },
                        field_data: {
                            device_types: data.field_data.device_types
                        }
                    };
                    data_devices.data = _data.data.new_user ? { new_user: true, id: THIS.random_id } : { id: data.data.id };

                    THIS.render_device_list(data_devices, user_html);
                }, defaults);
            });

            $(user_html).delegate('.action_device.delete', 'click', function() {
                var device_id = $(this).dataset('id');
                winkstart.confirm(_t('user', 'do_you_really_want_to_delete'), function() {
                    winkstart.request(true, 'device.delete', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url,
                            device_id: device_id
                        },
                        function(_data, status) {
                            data_devices = {
                                data: { },
                                field_data: {
                                    device_types: data.field_data.device_types
                                }
                            };
                            data_devices.data = THIS.random_id ? { new_user: true, id: THIS.random_id } : { id: data.data.id };

                            THIS.render_device_list(data_devices, user_html);
                        }
                    );
                });
            });

            $('.add_device', user_html).click(function(ev) {
                var data_device = {
                        hide_owner: true
                    },
                    defaults = {};

                ev.preventDefault();

                if(!data.data.id) {
                    defaults.new_user = THIS.random_id;
                }
                else {
                    defaults.owner_id = data.data.id;
                }

                winkstart.publish('device.popup_edit', data_device, function(_data) {
                    var data_devices = {
                        data: { },
                        field_data: {
                            device_types: data.field_data.device_types
                        }
                    };
                    data_devices.data = THIS.random_id ? { new_user: true, id: THIS.random_id } : { id: data.data.id };

                    THIS.render_device_list(data_devices, user_html);
                }, defaults);
            });

            (target)
                .empty()
                .append(user_html);
        },

        render_device_list: function(data, parent) {
            var THIS = this,
                parent = $('#tab_devices', parent);

            if(data.data.id) {
                var request_string = data.data.new_user ? 'user.device_new_user' : 'user.device_list';

                winkstart.request(true, request_string, {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        owner_id: data.data.id
                    },
                    function(_data, status) {
                        $('.rows', parent).empty();
                        if(_data.data.length > 0) {
                            $.each(_data.data, function(k, v) {
                                v.display_type = data.field_data.device_types[v.device_type];
                                v.not_enabled = this.enabled === false ? true : false;
                                $('.rows', parent).append(THIS.templates.device_row.tmpl(v));
                            });

                            winkstart.request(true, 'device.status_no_loading', {
                                    account_id: winkstart.apps['voip'].account_id,
                                    api_url: winkstart.apps['voip'].api_url
                                },
                                function(_data, status) {
                                    $.each(_data.data, function(key, val) {
                                        $('#' + val.device_id + ' .column.third', parent).addClass('registered');
                                    });
                                }
                            );
                        }
                        else {
                            $('.rows', parent).append(THIS.templates.device_row.tmpl({
								_t: function(param){
									return window.translate['user'][param];
								}
							}));
                        }
                    }
                );
            }
            else {
                $('.rows', parent).empty()
                                  .append(THIS.templates.device_row.tmpl({
									_t: function(param){
										return window.translate['user'][param];
									}
								  }));
            }
        },

        migrate_data: function(data) {
            if(!('priv_level' in data.data)) {
                if('apps' in data.data && 'voip' in data.data.apps) {
                    data.data.priv_level = 'admin';
                } else {
                    data.data.priv_level = 'user';
                }
            }

            return data;
        },

        clean_form_data: function(form_data){
            form_data.caller_id.internal.number = form_data.caller_id.internal.number.replace(/\s|\(|\)|\-|\./g,'');
            form_data.caller_id.external.number = form_data.caller_id.external.number.replace(/\s|\(|\)|\-|\./g,'');
            form_data.caller_id.emergency.number = form_data.caller_id.emergency.number.replace(/\s|\(|\)|\-|\./g,'');

            form_data.call_restriction.closed_groups = { action: form_data.extra.closed_groups ? 'deny' : 'inherit' };

            if(!form_data.hotdesk.require_pin) {
                delete form_data.hotdesk.pin;
            }

            if(form_data.pwd_mngt_pwd1 != 'fakePassword') {
                form_data.password = form_data.pwd_mngt_pwd1;
            }

            delete form_data.pwd_mngt_pwd1;
            delete form_data.pwd_mngt_pwd2;
            delete form_data.extra;

            return form_data;
        },

        normalize_data: function(data) {

            if($.isArray(data.directories)) {
                data.directories = {};
            }

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

            if(data.hotdesk.hasOwnProperty("enable")) {
                delete data.hotdesk.enable;
			}

            if(data.hotdesk.hasOwnProperty('log_out')) {
                var new_endpoint_ids = [];

                $.each(data.hotdesk.endpoint_ids, function(k, v) {
                    if(data.hotdesk.log_out.indexOf(v) < 0) {
                        new_endpoint_ids.push(v);
                    }
                });

                data.hotdesk.endpoint_ids = new_endpoint_ids;

                delete data.hotdesk.log_out;
            }

            if(data.hotdesk.hasOwnProperty('endpoint_ids') && data.hotdesk.endpoint_ids.length === 0) {
                delete data.hotdesk.endpoint_ids;
            }

            if(data.hasOwnProperty('call_forward') && data.call_forward.number === '') {
                delete data.call_forward.number;
            }

            if(data.hasOwnProperty('presence_id') && data.presence_id === '') {
                delete data.presence_id;
            }

            return data;
        },

        render_list: function(parent, callback) {
            var THIS = this;

            winkstart.request(true, 'user.list', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(data, status) {
                    var map_crossbar_data = function(data) {
                        var new_list = [];

                        if(data.length > 0) {
                            $.each(data, function(key, val) {
                                new_list.push({
                                    id: val.id,
                                    title: (val.first_name && val.last_name) ?
                                               val.last_name + ', ' + val.first_name :
                                               '(no name)'
                                });
                            });
                        }

                        new_list.sort(function(a, b) {
                            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                        });

                        return new_list;
                    };

                    $('#user-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: _t('user', 'users_label'),
                            identifier: 'user-listview',
                            new_entity_label: _t('user', 'add_user_label'),
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'user.edit',
                            notifyCreateMethod: 'user.edit',
                            notifyParent: parent
                        });

                    callback && callback();
                }
            );
        },

        activate: function(args) {
            var THIS = this,
            	args = args || {},
                user_html = THIS.templates.user.tmpl(),
                parent = args.parent || $('#ws-content');

            (parent)
                .empty()
                .append(user_html);

            THIS.render_list(user_html, function() {
            	args.callback && args.callback();
            });
        },

        popup_edit_user: function(data, callback, data_defaults) {
            var popup, popup_html;

            popup_html = $('<div class="inline_popup"><div class="inline_content main_content"/></div>');

            popup_html.css({
                height: 500,
                'overflow-y': 'scroll'
            });

            winkstart.publish('user.edit', data, popup_html, $('.inline_content', popup_html), {
                save_success: function(_data) {
                    popup.dialog('close');

                    if(typeof callback == 'function') {
                        callback(_data);
                    }
                },
                delete_success: function() {
                    popup.dialog('close');

                    if(typeof callback == 'function') {
                        callback({ data: {} });
                    }
                },
                after_render: function() {
                    popup = winkstart.dialog(popup_html, {
                        title: (data.id) ? _t('user', 'edit_user') : _t('user', 'create_user')
                    });
                }
            }, data_defaults);
        },

        define_stats: function() {
            var THIS = this;

            var stats = {
                'users': {
                    icon: 'user',
                    get_stat: function(callback) {
                        winkstart.request('user.list_no_loading', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(_data, status) {
                                var stat_attributes = {
                                    name: 'users',
                                    number: _data.data.length,
                                    active: _data.data.length > 0 ? true : false,
                                    color: _data.data.length < 1 ? 'red' : (_data.data.length > 1 ? 'green' : 'orange')
                                };
                                if(typeof callback === 'function') {
                                    callback(stat_attributes);
                                }
                            },
                            function(_data, status) {
                                callback({error: true});
                            }
                        );

                    },
                    click_handler: function() {
                        winkstart.publish('user.activate');
                    }
                }
            };

            return stats;
        },

        define_callflow_nodes: function(callflow_nodes) {
            var THIS = this;

            $.extend(callflow_nodes, {
                 'user[id=*]': {
                    name: _t('user', 'user'),
                    icon: 'user',
                    category: _t('config', 'basic_cat'),
                    module: 'user',
                    tip: _t('user', 'user_tip'),
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

                        return returned_value;
                    },
                    edit: function(node, callback) {
                        winkstart.request(true, 'user.list', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html;

                                $.each(data.data, function() {
                                    this.name = this.first_name + ' ' + this.last_name;
                                });

                                popup_html = THIS.templates.user_callflow.tmpl({
                                    _t: function(param){
                                        return window.translate['user'][param];
                                    },
                                    can_call_self: node.getMetadata('can_call_self') || false,
                                    parameter: {
                                        name: 'timeout (s)',
                                        value: node.getMetadata('timeout') || '20'
                                    },
                                    objects: {
                                        items: winkstart.sort(data.data),
                                        selected: node.getMetadata('id') || ''
                                    }
                                });

                                if($('#user_selector option:selected', popup_html).val() == undefined) {
                                    $('#edit_link', popup_html).hide();
                                }

                                $('.inline_action', popup_html).click(function(ev) {
                                    var _data = ($(this).dataset('action') == 'edit') ?
                                                    { id: $('#user_selector', popup_html).val() } : {};

                                    ev.preventDefault();

                                    winkstart.publish('user.popup_edit', _data, function(_data) {
                                        node.setMetadata('id', _data.data.id || 'null');
                                        node.setMetadata('timeout', $('#parameter_input', popup_html).val());
                                        node.setMetadata('can_call_self', $('#user_can_call_self', popup_html).is(':checked'));

                                        node.caption = (_data.data.first_name || '') + ' ' + (_data.data.last_name || '');

                                        popup.dialog('close');
                                    });
                                });

                                $('#add', popup_html).click(function() {
                                    node.setMetadata('id', $('#user_selector', popup_html).val());
                                    node.setMetadata('timeout', $('#parameter_input', popup_html).val());
                                    node.setMetadata('can_call_self', $('#user_can_call_self', popup_html).is(':checked'));

                                    node.caption = $('#user_selector option:selected', popup_html).text();

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                    title: _t('user', 'select_user'),
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
                'hotdesk[action=login]': {
                    name: _t('user', 'hot_desk_login'),
                    icon: 'hotdesk_login',
                    category: _t('config', 'hotdesking_cat'),
                    module: 'hotdesk',
                    tip: _t('user', 'hot_desk_login_tip'),
                    data: {
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
                        return '';
                    },
                    edit: function(node, callback) {
                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                },
                'hotdesk[action=logout]': {
                    name: _t('user', 'hot_desk_logout'),
                    icon: 'hotdesk_logout',
                    category: _t('config', 'hotdesking_cat'),
                    module: 'hotdesk',
                    tip: _t('user', 'hot_desk_logout_tip'),
                    data: {
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
                        return '';
                    },
                    edit: function(node, callback) {
                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                },
                'hotdesk[action=toggle]': {
                    name: _t('user', 'hot_desk_toggle'),
                    icon: 'hotdesk_toggle',
                    category: _t('config', 'hotdesking_cat'),
                    module: 'hotdesk',
                    tip: _t('user', 'hot_desk_toggle_tip'),
                    data: {
                        action: 'toggle'
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
                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                }
            });
        }
    }
);
