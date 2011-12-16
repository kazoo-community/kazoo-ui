winkstart.module('voip', 'device', {
        css: [
            'css/device.css'
        ],

        templates: {
            device: 'tmpl/device.html',
            general_edit: 'tmpl/general_edit.html',
            cellphone: 'tmpl/cellphone.html',
            sip_device: 'tmpl/edit.html',
            device_callflow: 'tmpl/device_callflow.html'
        },

        subscribe: {
            'device.activate': 'activate',
            'device.edit': 'edit_device',
            'callflow.define_callflow_nodes': 'define_callflow_nodes',
            'device.popup_edit': 'popup_edit_device'
        },

        validation: {
            sip_device : [
                { name: '#name',                      regex: /^[a-zA-Z0-9\s_']+$/ },
                { name: '#mac_address',               regex: /^(((\d|([a-f]|[A-F])){2}:){5}(\d|([a-f]|[A-F])){2})$|^$|^(((\d|([a-f]|[A-F])){2}-){5}(\d|([a-f]|[A-F])){2})$|^(((\d|([a-f]|[A-F])){2}){5}(\d|([a-f]|[A-F])){2})$/ },
                { name: '#caller_id_name_internal',   regex: /^.*$/ },
                { name: '#caller_id_number_internal', regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#caller_id_name_external',   regex: /^.*$/ },
                { name: '#caller_id_number_external', regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#sip_realm',                 regex: /^[0-9A-Za-z\-\.\:]+$/ },
                { name: '#sip_username',              regex: /^[^\s]+$/ },
                { name: '#sip_expire_seconds',        regex: /^[0-9]+$/ }
            ],
            cellphone: [
                { name: '#name',                regex: /^[a-zA-Z0-9\s_']+$/ },
                { name: '#call_forward_number', regex: /^[\+]?[0-9]*$/ }
            ]
        },

        resources: {
            'device.list': {
                url: '{api_url}/accounts/{account_id}/devices',
                contentType: 'application/json',
                verb: 'GET'
            },
            'device.status': {
                url: '{api_url}/accounts/{account_id}/devices/status',
                contentType: 'application/json',
                verb: 'GET'
            },
            'device.get': {
                url: '{api_url}/accounts/{account_id}/devices/{device_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'device.create': {
                url: '{api_url}/accounts/{account_id}/devices',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'device.update': {
                url: '{api_url}/accounts/{account_id}/devices/{device_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'device.filter':{
                url: '{api_url}/accounts/{account_id}/devices?filter_mac_address={mac_address}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'device.delete': {
                url: '{api_url}/accounts/{account_id}/devices/{device_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            },
            'user.list': {
                url: '{api_url}/accounts/{account_id}/users',
                contentType: 'application/json',
                verb: 'GET'
            },
            'account.get': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'GET'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        winkstart.publish('subnav.add', {
            whapp: 'voip',
            module: THIS.__module,
            label: 'Devices',
            icon: 'device',
            weight: '20'
        });
    },

    {
        save_device: function(form_data, data, success, error) {
            var THIS = this,
                id = (typeof data.data == 'object' && data.data.id) ? data.data.id : undefined,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data)),
                save = function() {
                    if(id) {

                        winkstart.request(true, 'device.update', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url,
                                device_id: id,
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

                        winkstart.request(true, 'device.create', {
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
                };

            if(form_data.device_type == 'sip_device' && form_data.mac_address) {
                winkstart.request(true, 'device.filter', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        mac_address: form_data.mac_address
                    },
                    function(_data, status) {
                        if(_data.data.length == 0 || (_data.data.length == 1 && _data.data[0].id == id)) {
                            save();
                        }
                        else {
                            if(typeof error == 'function') {
                                error(_data, status, 'mac_address');
                            }
                        }
                    },
                    function(_data, status) {
                        if(typeof error == 'function') {
                            error(_data, status, 'mac_address');
                        }
                    }
                );
            }
            else {
                save();
            }
        },

        edit_device: function(data, _parent, _target, _callbacks, data_defaults) {
            var THIS = this,
                parent = _parent || $('#device-content'),
                target = _target || $('#device-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.render_list(parent);

                        THIS.edit_device({ id: _data.data.id }, parent, target, callbacks);
                    },

                    save_error: _callbacks.save_error || function(_data, status, type) {
                        if(status == 200 && type == 'mac_address') {
                            alert('This MAC Address is already in use, please verify that it is correct.');
                        }
                    },

                    delete_success: _callbacks.delete_success || function(_data) {
                        target.empty();

                        THIS.render_list(parent);
                    },

                    delete_error: _callbacks.delete_error,

                    after_render: _callbacks.after_render
                },
                defaults = {
                    data: $.extend(true, {
                        status: true,
                        caller_id: {
                            external: {},
                            internal: {}
                        },
                        media: {
                            bypass_media: 'auto',
                            audio: {
                                codecs: ['PCMU', 'PCMA']
                            },
                            video: {
                                codecs: []
                            },
                            fax: {
                                option: 'auto'
                            }
                        },
                        sip: {
                            method: 'password',
                            invite_format: 'username',
                            username: 'user_' + winkstart.random_string(6),
                            password: winkstart.random_string(12),
                            expire_seconds: '360'
                        },
                        call_forward: {},
                        music_on_hold: {}
                    }, data_defaults || {}),

                    field_data: {
                        users: [],
                        sip: {
                            methods: {
                                'password': 'Password'
                            },
                            invite_formats: {
                                'username': 'Username',
                                'npan': 'NPA NXX XXXX',
                                'e164': 'E. 164'
                            }
                        },
                        media: {
                            bypass_media_options: {
                                'auto': 'Automatic',
                                'false': 'Always',
                                'true': 'Never'
                            },
                            fax: {
                                options: {
                                    'auto': 'Auto-detect',
                                    'true': 'Always Force',
                                    'false': 'Disabled'
                                }
                            },
                            audio: {
                                codecs: {
                                    'G729': 'G729 - 8kbps (Requires License)',
                                    'PCMU': 'G711u / PCMU - 64kbps (North America)',
                                    'PCMA': 'G711a / PCMA - 64kbps (Elsewhere)',
                                    'G722_16': 'G722 (HD) @ 16kHz',
                                    'G722_32': 'G722.1 (HD) @ 32kHz',
                                    'CELT_48': 'Siren (HD) @ 48kHz',
                                    'CELT_64': 'Siren (HD) @ 64kHz'
                                }
                            },
                            video: {
                                codecs: {
                                    'H261': 'H261',
                                    'H263': 'H263',
                                    'H264': 'H264'
                                }
                            }
                        }
                    },
                    functions: {
                        inArray: function(value, array) {
                            return ($.inArray(value, array) == -1) ? false : true;
                        }
                    }
                };

            winkstart.request(true, 'account.get', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(_data, status) {
                    $.extend(defaults.data.sip, {
                        realm: _data.data.realm,
                    });

                    winkstart.request(true, 'user.list', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url
                        },
                        function(_data, status) {
                            _data.data.unshift({
                                id: '',
                                first_name: '- No',
                                last_name: 'owner -',
                            });

                            defaults.field_data.users = _data.data;

                            winkstart.request(true, 'media.list', {
                                    account_id: winkstart.apps['voip'].account_id,
                                    api_url: winkstart.apps['voip'].api_url
                                },
                                function(_data, status) {
                                    _data.data.unshift({
                                        id: '',
                                        name: '- Not set -'
                                    });

                                    defaults.field_data.music_on_hold = _data.data;

                                    if(typeof data == 'object' && data.id) {
                                        winkstart.request(true, 'device.get', {
                                                account_id: winkstart.apps['voip'].account_id,
                                                api_url: winkstart.apps['voip'].api_url,
                                                device_id: data.id
                                            },
                                            function(_data, status) {
                                                defaults.data.device_type = 'sip_device';

                                                THIS.migrate_data(_data);

                                                THIS.render_device($.extend(true, defaults, _data), target, callbacks);

                                                if(typeof callbacks.after_render == 'function') {
                                                    callbacks.after_render();
                                                }
                                            }
                                        );
                                    }
                                    else {
                                        THIS.render_device(defaults, target, callbacks);

                                        if(typeof callbacks.after_render == 'function') {
                                            callbacks.after_render();
                                        }
                                    }
                                }
                            );
                        }
                    );
                }
            );
        },

        delete_device: function(data, success, error) {
            var THIS = this;

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'device.delete', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        device_id: data.data.id
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

        render_device: function(data, target, callbacks){
            var THIS = this,
                device_html;

            if(typeof data.data == 'object' && data.data.device_type) {
                device_html = THIS.templates[data.data.device_type].tmpl(data);

                /* Do device type specific things here */
                if(data.data.device_type == 'sip_device') {
                    device_html.delegate('#sip_password[type="password"]', 'focus', function() {
                        var value = $(this).val();
                        $('<input id="sip_password" name="sip.password" type="text"/>').insertBefore($(this)).val(value).focus();
                        $(this).remove();
                    });

                    device_html.delegate('#sip_password[type="text"]', 'blur', function(ev) {
                        var value;
                        if($(this).attr('removing') != 'true') {
                            $(this).attr('removing', 'true');
                            value = $(this).val();
                            $('<input id="sip_password" name="sip.password" type="password"/>').insertBefore($(this)).val(value);
                            $(this).remove();
                        }
                    });
                }

                winkstart.validate.set(THIS.config.validation[data.data.device_type], device_html);

                $('*[tooltip]', device_html).each(function() {
                    $(this).tooltip({ attach: device_html });
                });

                $('ul.settings1', device_html).tabs($('.pane > div', device_html));
                $('ul.settings2', device_html).tabs($('.advanced_pane > div', device_html));

                $('#name', device_html).focus();

                $('.advanced_pane', device_html).hide();
                $('.advanced_tabs_wrapper', device_html).hide();

                $('#advanced_settings_link', device_html).click(function() {
                    if($(this).attr('enabled') === 'true') {
                        $(this).attr('enabled', 'false');

                        $('.advanced_pane', device_html).slideToggle(function() {
                            $('.advanced_tabs_wrapper', device_html).animate({ width: 'toggle' });
                        });
                    }
                    else {
                        $(this).attr('enabled', 'true');

                        $('.advanced_tabs_wrapper', device_html).animate({
                                width: 'toggle'
                            },
                            function() {
                                $('.advanced_pane', device_html).slideToggle();
                            }
                        );
                    }
                });

                if(!$('#owner_id', device_html).val()) {
                    $('#edit_link', device_html).hide();
                }

                $('#owner_id', device_html).change(function() {
                    !$('#owner_id option:selected', device_html).val() ? $('#edit_link', device_html).hide() : $('#edit_link', device_html).show();
                });

                $('.inline_action', device_html).click(function(ev) {
                    var _data = ($(this).dataset('action') == 'edit') ? { id: $('#owner_id', device_html).val() } : {},
                        _id = _data.id;

                    ev.preventDefault();

                    winkstart.publish('user.popup_edit', _data, function(_data) {
                        /* Create */
                        if(!_id) {
                            $('#owner_id', device_html).append('<option id="'+ _data.data.id  +'" value="' + _data.data.id +'">'+ _data.data.first_name + ' ' + _data.data.last_name  +'</option>');
                            $('#owner_id', device_html).val(_data.data.id);
                            $('#edit_link', device_html).show();
                        }
                        else {
                            /* Update */
                            if('id' in _data.data) {
                                $('#owner_id #'+_data.data.id, device_html).text(_data.data.first_name + ' ' + _data.data.last_name);
                            }
                            /* Delete */
                            else {
                                $('#owner_id #'+_id, device_html).remove();
                                $('#edit_link', device_html).hide();
                            }
                        }
                    });
                });

                $('.device-save', device_html).click(function(ev) {
                    ev.preventDefault();

                    winkstart.validate.is_valid(THIS.config.validation[data.data.device_type], device_html, function() {
                            var form_data = form2object('device-form');

                            THIS.clean_form_data(form_data);

                            if('field_data' in data) {
                                delete data.field_data;
                            }

                            THIS.save_device(form_data, data, callbacks.save_success, callbacks.save_error);
                        },
                        function() {
                            alert('There were errors on the form, please correct!');
                        }
                    );
                });

                $('.device-delete', device_html).click(function(ev) {
                    ev.preventDefault();

                    THIS.delete_device(data, callbacks.delete_success, callbacks.delete_error);
                });

                if(!$('#music_on_hold_media_id', device_html).val()) {
                    $('#edit_link_media', device_html).hide();
                }

                $('#music_on_hold_media_id', device_html).change(function() {
                    !$('#music_on_hold_media_id option:selected', device_html).val() ? $('#edit_link_media', device_html).hide() : $('#edit_link_media', device_html).show();
                });

                $('.inline_action_media', device_html).click(function(ev) {
                    var _data = ($(this).dataset('action') == 'edit') ? { id: $('#music_on_hold_media_id', device_html).val() } : {},
                        _id = _data.id;

                    ev.preventDefault();

                    winkstart.publish('media.popup_edit', _data, function(_data) {
                        /* Create */
                        if(!_id) {
                            $('#music_on_hold_media_id', device_html).append('<option id="'+ _data.data.id  +'" value="'+ _data.data.id +'">'+ _data.data.name +'</option>')
                            $('#music_on_hold_media_id', device_html).val(_data.data.id);

                            $('#edit_link_media', device_html).show();
                        }
                        else {
                            /* Update */
                            if('id' in _data.data) {
                                $('#music_on_hold_media_id #'+_data.data.id, device_html).text(_data.data.name);
                            }
                            /* Delete */
                            else {
                                $('#music_on_hold_media_id #'+_id, device_html).remove();
                                $('#edit_link_media', device_html).hide();
                            }
                        }
                    });
                });
            }
            else {
                device_html = THIS.templates.general_edit.tmpl();

                $('.media_tabs .buttons', device_html).click(function() {
                    if(!$(this).hasClass('current')) {
                        $('.media_tabs .buttons').removeClass('current');
                        $(this).addClass('current');

                        $(this).animate({ top:'40px' }, 300);
                        $(this).siblings('.buttons').animate({ top:'0px' }, 300);

                        data.data.device_type = $(this).attr('device_type');

                        THIS.render_device(data, $('.media_pane', device_html), callbacks);
                    }
                });
            }

            (target)
                .empty()
                .append(device_html);
        },

        migrate_data: function(data) {
            if(typeof data.data.caller_id == 'object') {
                if('default' in data.data.caller_id) {
                    data.data.caller_id.external = data.data.caller_id['default'];
                    delete data.data.caller_id['default'];
                }

                if('emergency' in data.data.caller_id) {
                    data.data.caller_id.internal = data.data.caller_id.emergency;
                    delete data.data.caller_id.emergency;
                }
            }

            if(data.data.device_type == 'cell_phone') {
                data.data.device_type = 'cellphone';
            }

            if(typeof data.data.media == 'object' && typeof data.data.media.fax == 'object' && 'codecs' in data.data.media.fax) {
                delete data.data.media.fax.codecs;
            }

            return data;
        },

        normalize_data: function(data) {
            if(data.caller_id.internal.number == '' && data.caller_id.internal.name == '') {
                delete data.caller_id.internal;
            }

            if(data.caller_id.external.number == '' && data.caller_id.external.name == '') {
                delete data.caller_id.external;
            }

            if(!data.music_on_hold.media_id) {
                delete data.music_on_hold.media_id;
            }

            if(!data.owner_id) {
                delete data.owner_id;
            }

            if($.isEmptyObject(data.call_forward)) {
                delete data.call_forward;
            }

            if(!data.mac_address) {
                delete data.mac_address;
            }

            return data;
        },

        clean_form_data: function(form_data) {
            if(form_data.mac_address) {
                form_data.mac_address = form_data.mac_address.toLowerCase();

                if(form_data.mac_address.match(/^(((\d|([a-f]|[A-F])){2}-){5}(\d|([a-f]|[A-F])){2})$/)) {
                    form_data.mac_address = form_data.mac_address.replace(/-/g,':');
                }
                else if(form_data.mac_address.match(/^(((\d|([a-f]|[A-F])){2}){5}(\d|([a-f]|[A-F])){2})$/)) {
                    form_data.mac_address = form_data.mac_address.replace(/(.{2})/g,'$1:').slice(0, -1);
                }
            }

            if(form_data.caller_id) {
                form_data.caller_id.internal.number = form_data.caller_id.internal.number.replace(/\s|\(|\)|\-|\./g,'');
                form_data.caller_id.external.number = form_data.caller_id.external.number.replace(/\s|\(|\)|\-|\./g,'');
            }

            if(form_data.media) {
                form_data.media.audio.codecs = $.map(form_data.media.audio.codecs, function(val) { return (val) ? val : null });
                form_data.media.video.codecs = $.map(form_data.media.video.codecs, function(val) { return (val) ? val : null });
            }

            return form_data;
        },

        render_list: function(parent){
            var THIS = this;

            winkstart.request(true, 'device.list', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function (data, status) {
                    var map_crossbar_data = function(data) {
                        var new_list = [];

                        if(data.length > 0) {
                            $.each(data, function(key, val){
                                new_list.push({
                                    id: val.id,
                                    title: val.name || '(no name)'
                                });
                            });
                        }

                        new_list.sort(function(a, b) {
                            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                        });

                        return new_list;
                    }

                    $('#device-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: 'Devices',
                            identifier: 'device-listview',
                            new_entity_label: 'Add Device',
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'device.edit',
                            notifyCreateMethod: 'device.edit',
                            notifyParent: parent
                        });

                    winkstart.request(true, 'device.status', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url
                        },
                        function(_data, status) {
                            $.each(_data.data, function(key, val) {
                                $('#' + val.device_id, $('#device-listpanel', parent)).addClass('registered');
                            });
                        }
                    );
                }
            );
        },

        activate: function(parent) {
            var THIS = this,
                device_html = THIS.templates.device.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(device_html);

            THIS.render_list(device_html);
        },

        popup_edit_device: function(data, callback) {
            var popup, popup_html;

            popup_html = $('<div class="inline_popup"><div class="inline_content"/></div>');

            winkstart.publish('device.edit', data, popup_html, $('.inline_content', popup_html), {
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
                        title: (data.id) ? 'Edit Device' : 'Create Device'
                    });
                }
            });
        },

        define_callflow_nodes: function(callflow_nodes) {
            var THIS = this;

            $.extend(callflow_nodes, {
                'device[id=*]': {
                    name: 'Device',
                    icon: 'phone',
                    category: 'Advanced',
                    module: 'device',
                    tip: 'Ring a VoIP or cell phone or other device',
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
                        var id = node.getMetadata('id');

                        return (id && id != '') ? caption_map[id].name : '';
                    },
                    edit: function(node, callback) {
                        var _this = this;
                        winkstart.request(true, 'device.list', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html;

                                popup_html = THIS.templates.device_callflow.tmpl({
                                    parameter: {
                                        name: 'timeout (s)',
                                        value: node.getMetadata('timeout') || '20'
                                    },
                                    objects: {
                                        items: data.data,
                                        selected: node.getMetadata('id') || ''
                                    }
                                });

                                if($('#device_selector option:selected', popup_html).val() == undefined) {
                                    $('#edit_link', popup_html).hide();
                                }

                                $('.inline_action', popup_html).click(function(ev) {
                                    var _data = ($(this).dataset('action') == 'edit') ?
                                                    { id: $('#device_selector', popup_html).val() } : {};

                                    ev.preventDefault();

                                    winkstart.publish('device.popup_edit', _data, function(_data) {
                                        node.setMetadata('id', _data.data.id || 'null');

                                        node.caption = _data.data.name || '';

                                        popup.dialog('close');
                                    });
                                });

                                $('.submit_btn', popup_html).click(function() {
                                    node.setMetadata('id', $('#device_selector', popup_html).val());
                                    node.setMetadata('timeout', $('#parameter_input', popup_html).val());

                                    node.caption = $('#device_selector option:selected', popup_html).text();

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                    title: 'Device',
                                    beforeClose: function() {
                                        if(typeof callback == 'function') {
                                             callback();
                                        }
                                    }
                                });
                            }
                        );
                    }
                }
            });
        }
    }
);

