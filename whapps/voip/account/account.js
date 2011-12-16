winkstart.module('voip', 'account', {
        css: [
            'css/account.css'
        ],

        templates: {
            account: 'tmpl/account.html',
            edit: 'tmpl/edit.html'
        },

        subscribe: {
            'account.activate' : 'activate',
            'account.edit' : 'edit_account'
        },

        validation: [
                { name: '#name',                       regex: /^.+$/ },
                { name: '#realm',                      regex: /^[0-9A-Za-z\-\.\:\_]+$/ },
                { name: '#caller_id_name_external',    regex: /^.*$/ },
                { name: '#caller_id_number_external',  regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#caller_id_name_internal',    regex: /^.*$/ },
                { name: '#caller_id_number_internal',  regex: /^[\+]?[0-9\s\-\.\(\)]*$/ },
                { name: '#vm_to_email_support_number', regex: /^[\+]?[0-9]*$/ },
                { name: '#vm_to_email_support_email',  regex: /^(([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)*$/ }
        ],

        resources: {
            'account.list': {
                url: '{api_url}/accounts/{account_id}/children',
                contentType: 'application/json',
                verb: 'GET'
            },
            'account.get': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'account.create': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'account.update': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'account.delete': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        winkstart.publish('subnav.add', {
            whapp: 'voip',
            module: THIS.__module,
            label: 'Accounts',
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
            else {
                winkstart.request(true, 'account.create', {
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

        edit_account: function(data, _parent, _target, _callback, data_defaults) {
            var THIS = this,
                parent = _parent || $('#account-content'),
                target = _target || $('#account-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.render_list(parent);

                        THIS.edit_account({ id: _data.data.id }, parent, target, callbacks);
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
                        caller_id: {
                            internal: {},
                            external: {}
                        },
                        vm_to_email: {},
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
                        winkstart.request(true, 'account.get', {
                                account_id: data.id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(_data, status) {
                                THIS.render_account($.extend(true, defaults, _data), target, callbacks);

                                if(typeof callbacks.after_render == 'function') {
                                    callbacks.after_render();
                                }
                            }
                        );
                    }
                    else {
                        THIS.render_account(defaults, target, callbacks);

                        if(typeof callbacks.after_render == 'function') {
                            callbacks.after_render();
                        }
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

        clean_form_data: function(form_data) {
            form_data.caller_id.internal.number = form_data.caller_id.internal.number.replace(/\s|\(|\)|\-|\./g, '');

            form_data.caller_id.external.number = form_data.caller_id.external.number.replace(/\s|\(|\)|\-|\./g, '');

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

            $.each(data.vm_to_email, function(key, val) {
                if(val == '') {
                    delete data.vm_to_email[key];
                }
            });

            if(!data.music_on_hold.media_id) {
                delete data.music_on_hold.media_id;
            }

            if($.isEmptyObject(data.vm_to_email)) {
                delete data.vm_to_email;
            }

            return data;
        },

        render_account: function(data, target, callbacks) {
            var THIS = this,
                account_html = THIS.templates.edit.tmpl(data);

            winkstart.validate.set(THIS.config.validation, account_html);

            $('*[tooltip]', account_html).each(function() {
                $(this).tooltip({ attach: account_html });
            });

            $('ul.settings1', account_html).tabs($('.pane > div', account_html));
            $('ul.settings2', account_html).tabs($('.advanced_pane > div', account_html));

            $('#name', account_html).focus();

            $('.advanced_pane', account_html).hide();
            $('.advanced_tabs_wrapper', account_html).hide();

            $('#advanced_settings_link', account_html).click(function() {
                if($(this).attr('enabled') === 'true') {
                    $(this).attr('enabled', 'false');

                    $('.advanced_pane', account_html).slideToggle(function() {
                        $('.advanced_tabs_wrapper', account_html).animate({ width: 'toggle' });
                    });
                }
                else {
                    $(this).attr('enabled', 'true');

                    $('.advanced_tabs_wrapper', account_html).animate({
                            width: 'toggle'
                        },
                        function() {
                            $('.advanced_pane', account_html).slideToggle();
                        }
                    );
                }
            });

            $('.account-save', account_html).click(function(ev) {
                ev.preventDefault();

                winkstart.validate.is_valid(THIS.config.validation, account_html, function() {
                        var form_data = form2object('account-form');

                        THIS.clean_form_data(form_data);

                        if('field_data' in data) {
                            delete data.field_data;
                        }

                        THIS.save_account(form_data, data, callbacks.save_success, callbacks.save_error);
                    },
                    function() {
                        alert('There were errors on the form, please correct!');
                    }
                );
            });

            $('.account-delete', account_html).click(function(ev) {
                ev.preventDefault();

                THIS.delete_account(data, callbacks.delete_success, callbacks.delete_error);
            });

            $('.account-switch', account_html).click(function(ev) {
                ev.preventDefault();

                if(confirm('Do you really want to use ' + data.data.name + '\'s account?')) {
                    if(!('masquerade' in winkstart.apps['voip'])) {
                        winkstart.apps['voip'].masquerade = [];
                    }

                    winkstart.apps['voip'].masquerade.push(winkstart.apps['voip'].account_id);

                    winkstart.apps['voip'].account_id = data.data.id;

                    THIS.masquerade_account(data.data.name);

                    alert('You are now using ' + data.data.name + '\'s account');

                    winkstart.publish('account.activate');
                }
            });

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

            (target)
                .empty()
                .append(account_html);
        },

        render_list: function(parent) {
            var THIS = this;

            winkstart.request('account.list', {
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
                                    title: val.name || '(no name)'
                                });
                            });
                        }

                        new_list.sort(function(a, b) {
                            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                        });

                        return new_list;
                    };

                    $('#account-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: 'Accounts',
                            identifier: 'account-listview',
                            new_entity_label: 'Add Account',
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'account.edit',
                            notifyCreateMethod: 'account.edit',
                            notifyParent: parent
                        });

                }
            );
        },

        masquerade_account: function(account_name) {
            var THIS = this;

            $('.universal_nav .my_account_wrapper .label .other')
                .html('<br>as<br>' + account_name + '<br><a href="#" class="masquerade">(restore)</a>');

            $('.universal_nav .my_account_wrapper .masquerade').click(function() {
                var id = winkstart.apps['voip'].masquerade.pop();

                if(winkstart.apps['voip'].masquerade.length) {
                    winkstart.getJSON('account.get', {
                            api_url: winkstart.apps['voip'].api_url,
                            account_id: id
                        },
                        function(data, status) {
                            winkstart.apps['voip'].account_id = data.data.id;

                            THIS.masquerade_account(data.data.name);

                            winkstart.publish('voip.activate');
                        }
                    );
                }
                else {
                    winkstart.apps['voip'].account_id = id;

                    $('.universal_nav .my_account_wrapper .label .other').empty();

                    delete winkstart.apps['voip'].masquerade;

                    winkstart.publish('voip.activate');
                }
            });
        },

        activate: function(parent) {
            var THIS = this,
                account_html = THIS.templates.account.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(account_html);

            THIS.render_list(account_html);
        }
    }
);
