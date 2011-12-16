winkstart.module('voip', 'user', {
        css: [
            'css/user.css'
        ],

        templates: {
            user: 'tmpl/user.html',
            edit: 'tmpl/edit.html',
            user_callflow: 'tmpl/user_callflow.html'
        },

        subscribe: {
            'user.activate': 'activate',
            'user.edit': 'edit_user',
            'callflow.define_callflow_nodes': 'define_callflow_nodes',
            'user.popup_edit': 'popup_edit_user'
        },

        validation : [
                { name: '#first_name',                regex: /^[a-zA-Z\s\-\']+$/ },
                { name: '#last_name',                 regex: /^[a-zA-Z\s\-\']+$/ },
                { name: '#username',                  regex: /^[a-zA-Z0-9\_\-]{3,16}$/ },
                { name: '#email',                     regex: /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/ },
                { name: '#caller_id_number_internal', regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#caller_id_name_internal',   regex: /^.*$/ },
                { name: '#caller_id_number_external', regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#caller_id_name_external',   regex: /^.*/ },
                { name: '#hotdesk_id',                regex: /^[0-9\+\#\*]*$/ },
                { name: '#hotdesk_pin',               regex: /^[0-9]*$/ },
                { name: '#call_forward_number',       regex: /^[\+]?[0-9]*$/ }
        ],

        resources: {
            'user.list': {
                url: '{api_url}/accounts/{account_id}/users',
                contentType: 'application/json',
                verb: 'GET'
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
            'hotdesk.list': {
                url: '{api_url}/accounts/{account_id}/users/hotdesks',
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
            label: 'Users',
            icon: 'user',
            weight: '10'
        });
    },

    {
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
                            success(_data, success, 'create');
                        }
                    },
                    function(_data, status) {
                        if(typeof error == 'function') {
                            error(_data, success, 'create');
                        }
                    }
                );
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
                        call_forward: {},
                        caller_id: {
                            internal: {},
                            external: {}
                        },
                        hotdesk: {},
                        music_on_hold: {}
                    }, data_defaults || {}),
                    field_data: {}
                };

            winkstart.request(true, 'media.list', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(_data, status) {
                    _data.data.unshift({
                        id: '',
                        name: '- Not set -'
                    });

                    defaults.field_data.media = _data.data;

                    if(typeof data == 'object' && data.id) {
                        winkstart.request(true, 'user.get', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url,
                                user_id: data.id
                            },
                            function(_data, status) {
                                THIS.migrate_data(_data);

                                THIS.format_data(_data);

                                THIS.render_user($.extend(true, defaults, _data), target, callbacks);

                                if(typeof callbacks.after_render == 'function') {
                                    callbacks.after_render();
                                }
                            }
                        );
                    }
                    else {
                        THIS.render_user(defaults, target, callbacks);

                        if(typeof callbacks.after_render == 'function') {
                            callbacks.after_render();
                        }
                    }
                }
            );
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

        render_user: function(data, target, callbacks) {
            var THIS = this,
                user_html = THIS.templates.edit.tmpl(data);

            winkstart.validate.set(THIS.config.validation, user_html);

            winkstart.timezone.populate_dropdown($('#timezone', user_html), data.data.timezone);

            $('*[tooltip]', user_html).each(function() {
                $(this).tooltip({ attach: user_html });
            });

            $('ul.settings1', user_html).tabs($('.pane > div', user_html));
            $('ul.settings2', user_html).tabs($('.advanced_pane > div', user_html));

            $('#username', user_html).focus();

            $('.advanced_pane', user_html).hide();
            $('.advanced_tabs_wrapper', user_html).hide();

            $('#advanced_settings_link', user_html).click(function() {
                if($(this).attr('enabled') === 'true') {
                    $(this).attr('enabled', 'false');

                    $('.advanced_pane', user_html).slideToggle(function() {
                        $('.advanced_tabs_wrapper', user_html).animate({ width: 'toggle' });
                    });
                }
                else {
                    $(this).attr('enabled', 'true');

                    $('.advanced_tabs_wrapper', user_html).animate({
                            width: 'toggle'
                        },
                        function() {
                            $('.advanced_pane', user_html).slideToggle();
                        }
                    );
                }
            });

            if(!data.data.hotdesk.require_pin) {
                $('#pin_wrapper', user_html).hide();
            }

            $('#hotdesk_require_pin', user_html).change(function() {
                $('#pin_wrapper', user_html).toggle();
            });

            $('.user-save', user_html).click(function(ev) {
                ev.preventDefault();

                if($('#pwd_mngt_pwd1', user_html).val() != $('#pwd_mngt_pwd2', user_html).val()) {
                    alert('The passwords on the \'Password management\' tab do not match! Please re-enter the password.');

                    return true;
                }

                winkstart.validate.is_valid(THIS.config.validation, user_html, function() {
                        var form_data = form2object('user-form');

                        THIS.clean_form_data(form_data);

                        if('field_data' in data) {
                            delete data.field_data;
                        }

                        THIS.save_user(form_data, data, callbacks.save_success, callbacks.save_error);
                    },
                    function() {
                        alert('There were errors on the form, please correct!');
                    }
                );
            });

            $('.user-delete', user_html).click(function(ev) {
                ev.preventDefault();

                THIS.delete_user(data, callbacks.delete_success, callbacks.delete_error);
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

            (target)
                .empty()
                .append(user_html);
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

        format_data: function(data) {
            // Do work

            return data;
        },

        clean_form_data: function(form_data){
            form_data.caller_id.internal.number = form_data.caller_id.internal.number.replace(/\s|\(|\)|\-|\./g,'');

            form_data.caller_id.external.number = form_data.caller_id.external.number.replace(/\s|\(|\)|\-|\./g,'');

            if(!form_data.hotdesk.require_pin) {
                delete form_data.hotdesk.pin;
            }

            if(form_data.pwd_mngt_pwd1 != 'fakePassword') {
                form_data.password = form_data.pwd_mngt_pwd1;
            }

            delete form_data.pwd_mngt_pwd1;
            delete form_data.pwd_mngt_pwd2;

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

            if(!data.hotdesk.enable) {
                delete data.hotdesk;
            }

            if(!data.call_forward.enabled) {
                delete data.call_forward;
            }

            if(!data.music_on_hold.media_id) {
                delete data.music_on_hold.media_id;
            }

            /* Yes, I am aware that the admin does not lose access to the userportal (if switched) */
            if(data.priv_level == 'admin') {
                if(!('voip' in data.apps)) {
                    data.apps['voip'] = {
                        label: 'VoIP Services',
                        icon: 'phone',
                        api_url: winkstart.apps['voip'].api_url
                    }
                }
            }
            else if(data.priv_level == 'user') {
                if(!('userportal' in data.apps)) {
                    data.apps['userportal'] = {
                        label: 'User Portal',
                        icon: 'userportal',
                        api_url: winkstart.apps['voip'].api_url
                    }
                }

                if('voip' in data.apps) {
                    delete voip;
                }
            }

            return data;
        },

        render_list: function(parent) {
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
                            label: 'Users',
                            identifier: 'user-listview',
                            new_entity_label: 'Add User',
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'user.edit',
                            notifyCreateMethod: 'user.edit',
                            notifyParent: parent
                        });
                }
            );
        },

        activate: function(parent) {
            var THIS = this,
                user_html = THIS.templates.user.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(user_html);

            THIS.render_list(user_html);
        },

        popup_edit_user: function(data, callback) {
            var popup, popup_html;

            popup_html = $('<div class="inline_popup"><div class="inline_content"/></div>');

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
                        title: (data.id) ? 'Edit User' : 'Create User'
                    });
                }
            });
        },

        define_callflow_nodes: function(callflow_nodes) {
            var THIS = this;

            $.extend(callflow_nodes, {
                 'user[id=*]': {
                    name: 'User',
                    icon: 'user',
                    category: 'Basic',
                    module: 'user',
                    tip: 'Direct a caller to a specific user',
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
                        /*var name = node.getMetadata('name');
                        return (name) ? name : '';*/
                        var id = node.getMetadata('id');
                        return (id && id != '') ? caption_map[id].name : '';
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
                                    items: data.data,
                                    selected: node.getMetadata('id') || ''
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

                                        node.caption = (_data.data.first_name || '') + ' ' + (_data.data.last_name || '');
                                        //node.setMetadata('name', name);

                                        popup.dialog('close');
                                    });
                                });

                                $('.submit_btn', popup_html).click(function() {
                                    node.setMetadata('id', $('#user_selector', popup_html).val());
                                    /*console.log(node);
                                    console.log($('#user_selector option:selected', popup_html).text());
                                    node.setMetadata('name', $('#user_selector option:selected', popup_html).text());
                                    console.log(node);*/
                                    node.caption = $('#user_selector option:selected', popup_html).text();
                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                    title: 'Select User',
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
                    name: 'Hot Desk login',
                    icon: 'hotdesk_login',
                    category: 'Hotdesking',
                    module: 'hotdesk',
                    tip: 'Enable Hot desking',
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
                    name: 'Hot Desk logout',
                    icon: 'hotdesk_logout',
                    category: 'Hotdesking',
                    module: 'hotdesk',
                    tip: 'Disable Hot desking',
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
                    name: 'Hot Desk toggle',
                    icon: 'hotdesk_toggle',
                    category: 'Hotdesking',
                    module: 'hotdesk',
                    tip: 'Toggle Hot desking',
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
