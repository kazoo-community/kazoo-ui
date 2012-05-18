winkstart.module('accounts', 'accounts_manager', {
        css: [
            'css/accounts_manager.css'
        ],

        templates: {
            accounts_manager: 'tmpl/accounts_manager.html',
            edit: 'tmpl/edit.html',
            switch: 'tmpl/switch.html'
        },

        subscribe: {
            'accounts_manager.activate' : 'activate',
            'accounts_manager.edit' : 'edit_accounts_manager',
            'accounts_manager.switch_account': 'switch_account',
            'accounts_manager.trigger_masquerade': 'trigger_masquerade',
            'nav.company_name_click': 'restore_masquerading'
        },

        validation: [
                { name: '#vm_to_email_support_number',   regex: /^[\+]?[0-9\s\-\x\(\)]*$/ },
                { name: '#vm_to_email_support_email',    regex: /^(([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)*$/ },
                { name: '#vm_to_email_send_from',        regex: /^.*$/ },
                { name: '#vm_to_email_service_url',      regex: /^.*$/ },
                { name: '#vm_to_email_service_provider', regex: /^.*$/ },
                { name: '#vm_to_email_service_name',     regex: /^.*$/ },
                { name: '#deregister_email',             regex: /^(([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)*$/ }
        ],

        resources: {
            'accounts_manager.list': {
                url: '{api_url}/accounts/{account_id}/children',
                contentType: 'application/json',
                verb: 'GET'
            },
            'accounts_manager.get': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'accounts_manager.create': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'accounts_manager.update': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'accounts_manager.delete': {
                url: '{api_url}/accounts/{account_id}',
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
        save_accounts_manager: function(form_data, data, success, error) {
            var THIS = this,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'accounts_manager.update', {
                        account_id: data.data.id,
                        api_url: winkstart.apps['accounts'].api_url,
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
                winkstart.request(true, 'accounts_manager.create', {
                        account_id: winkstart.apps['accounts'].account_id,
                        api_url: winkstart.apps['accounts'].api_url,
                        data: normalized_data
                    },
                    function(_data, status) {
                        THIS.update_billing_account(_data, function() {
                            if(typeof success == 'function') {
                                success(_data, status, 'create');
                            }
                        });
                    },
                    function(_data, status) {
                        if(typeof error == 'function') {
                            error(_data, status, 'create');
                        }
                    }
                );
            }
        },

        update_billing_account: function(data, callback) {
            if(data.data.billing_id === 'self') {
                data.data.billing_id = data.data.id;
                winkstart.request('accounts_manager.update', {
                        account_id: data.data.id,
                        api_url: winkstart.apps['accounts'].api_url,
                        data: data.data
                    },
                    function(_data, status) {
                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                );
            }
        },

        edit_accounts_manager: function(data, _parent, _target, _callback, data_defaults) {
            var THIS = this,
                parent = _parent || $('#accounts_manager-content'),
                target = _target || $('#accounts_manager-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.render_list(parent);

                        THIS.edit_accounts_manager({ id: _data.data.id }, parent, target, callbacks);
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
                        notifications: {
                            voicemail_to_email: {}
                        }
                    }, data_defaults || {}),
                    field_data: {
                        billing_account: 'parent',
                        available_apps: winkstart.available_apps
                    },
                    functions: {
                        inArray: function(value, array) {
                            if(array) {
                                return ($.inArray(value, array) == -1) ? false : true;
                            }
                            else return false;
                        }
                    }
                };

            if(typeof data == 'object' && data.id) {
                winkstart.request(true, 'accounts_manager.get', {
                        account_id: data.id,
                        api_url: winkstart.apps['accounts'].api_url
                    },
                    function(_data, status) {
                        THIS.migrate_data(_data);

                        THIS.format_data(_data);

                        THIS.render_accounts_manager($.extend(true, defaults, _data), target, callbacks);

                        if(typeof callbacks.after_render == 'function') {
                            callbacks.after_render();
                        }
                    }
                );
            }
            else {
                THIS.render_accounts_manager(defaults, target, callbacks);

                if(typeof callbacks.after_render == 'function') {
                    callbacks.after_render();
                }
            }
        },

        delete_accounts_manager: function(data, success, error) {
            var THIS = this;

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'accounts_manager.delete', {
                        account_id: data.data.id,
                        api_url: winkstart.apps['accounts'].api_url
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
            if('vm_to_email' in data.data) {
                data.data.notifications = data.data.notifications || {};
                data.data.notifications.voicemail_to_email = data.data.notifications.voicemail_to_email || {};
                data.data.notifications.voicemail_to_email.support_number = data.data.vm_to_email.support_number;
                data.data.notifications.voicemail_to_email.support_email = data.data.vm_to_email.support_email;

                delete data.data.vm_to_email;
            }
        },

        format_data: function(data) {
            if(!data.field_data) {
                data.field_data = {};
            }

            if(data.data.notifications && 'deregister' in data.data.notifications && data.data.notifications.deregister.send_to && data.data.notifications.deregister.send_to != '') {
                data.field_data.deregister = true;
            }
            else {
                data.field_data.deregister = false;
            }

            if(data.data.billing_id === winkstart.apps['accounts'].account_id) {
               data.field_data.billing_account = 'parent';
            }
            else if(data.data.billing_id === data.data.id) {
                data.field_data.billing_account = 'self'
            }
            else {
                data.field_data.billing_account = 'other'
            }
        },

        clean_form_data: function(form_data) {
            if(form_data.extra.deregistration_notify === false) {
                form_data.notifications.deregister.send_to = '';
            }

            if(form_data.extra.billing_account === 'self') {
                form_data.billing_id = 'self';
            }
            else if(form_data.extra.billing_account === 'parent') {
                form_data.billing_id = winkstart.apps['accounts'].account_id;
            }

            if(form_data.apps) {
                form_data.apps = $.map(form_data.apps, function(val) { return (val) ? val : null });
            }

            delete form_data.extra;

            return form_data;
        },

        normalize_data: function(data) {
            $.each(data.notifications.voicemail_to_email, function(key, val) {
                if(val == '') {
                    delete data.notifications.voicemail_to_email[key];
                }
            });

            if($.isEmptyObject(data.vm_to_email)) {
                delete data.vm_to_email;
            }

            if(data.notifications.deregister) {
                if(data.notifications.deregister.send_to === '') {
                    delete data.notifications.deregister.send_to;
                }
            }

            if(data.billing_id === 'self' && data.id) {
                data.billing_id = data.id;
            }

            return data;
        },

        render_accounts_manager: function(data, target, callbacks) {
            var THIS = this,
                account_html = THIS.templates.edit.tmpl(data),
                deregister = $('#deregister', account_html),
                deregister_email = $('.deregister_email', account_html);

            winkstart.validate.set(THIS.config.validation, account_html);

            $('*[rel=popover]', account_html).popover({
                trigger: 'focus'
            });

            winkstart.tabs($('.view-buttons', account_html), $('.tabs', account_html), true);

            deregister.is(':checked') ? deregister_email.show() : deregister_email.hide();

            deregister.change(function() {
                $(this).is(':checked') ? deregister_email.show('blind') : deregister_email.hide('blind');
            });

            $('.accounts_manager-save', account_html).click(function(ev) {
                ev.preventDefault();

                winkstart.validate.is_valid(THIS.config.validation, account_html, function() {
                        var form_data = form2object('accounts_manager-form');

                        THIS.clean_form_data(form_data);

                        if('field_data' in data) {
                            delete data.field_data;
                        }

                        data.data.apps = [];

                        THIS.save_accounts_manager(form_data, data, callbacks.save_success, winkstart.error_message.process_error(callbacks.save_error));
                    },
                    function() {
                        winkstart.alert('There were errors on the form, please correct!');
                    }
                );
            });

            $('.accounts_manager-delete', account_html).click(function(ev) {
                ev.preventDefault();

                winkstart.confirm('Are you sure you want to delete this account?<br>WARNING: This can not be undone', function() {
                    THIS.delete_accounts_manager(data, callbacks.delete_success, callbacks.delete_error);
                });
            });

            $('.accounts_manager-switch', account_html).click(function(ev) {
                ev.preventDefault();

                var account = {
                    name: data.data.name,
                    id: data.data.id
                };

                winkstart.confirm('Do you really want to use ' + account.name + '\'s account?', function() {
                    winkstart.publish('accounts_manager.trigger_masquerade', { account: account }, function() {
                        winkstart.publish('accounts_manager.activate');
                    });
                });
            });

            winkstart.link_form(account_html);

            (target)
                .empty()
                .append(account_html);
        },

        render_list: function(parent) {
            var THIS = this;

            winkstart.request('accounts_manager.list', {
                    account_id: winkstart.apps['accounts'].account_id,
                    api_url: winkstart.apps['accounts'].api_url
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

                    $('#accounts_manager-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: 'Accounts',
                            identifier: 'accounts_manager-listview',
                            new_entity_label: 'Add Account',
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'accounts_manager.edit',
                            notifyCreateMethod: 'accounts_manager.edit',
                            notifyParent: parent
                        }
                    );
                }
            );
        },

        switch_account: function() {
            var THIS = this;
            winkstart.request('accounts_manager.list', {
                    account_id: winkstart.apps['accounts'].account_id,
                    api_url: winkstart.apps['accounts'].api_url
                },
                function(_data, status) {
                    if(_data.data.length > 0) {
                        switch_html = winkstart.dialog(THIS.templates.switch.tmpl({ 'accounts': _data.data }), {
                            width: '600px'
                        });

                        $('.masquerade', switch_html).click(function() {
                            var account = {
                                    name: $('#sub_accounts option:selected', switch_html).text(),
                                    id: $('#sub_accounts', switch_html).val()
                                };

                            winkstart.confirm('Do you really want to use ' + account.name + '\'s account?', function() {
                                THIS.trigger_masquerade({account: account}, function() {
                                    $(switch_html).dialog('close');

                                    winkstart.publish('accounts_manager.activate');
                                });
                            });
                        });
                    }
                    else {
                        winkstart.alert('This account doesn\'t have any sub-accounts.');
                    }
                }
            );
        },

        trigger_masquerade: function(data, callback) {
            var account = data.account,
                THIS = this;

            if(!('masquerade' in winkstart.apps['accounts'])) {
                winkstart.apps['accounts'].masquerade = [];
                winkstart.publish('nav.company_name', function(name) {
                    winkstart.apps['accounts'].account_name = name;
                });
            }

            winkstart.apps['accounts'].masquerade.push(winkstart.apps['accounts'].account_id);

            THIS.update_apps(account.id);

            THIS.masquerade_account(account.name);

            if(typeof callback === 'function') {
                callback();
            }
        },

        update_apps: function(account_id) {
            winkstart.apps['accounts'].account_id = account_id;

            $.each(winkstart.apps, function(k, v) {
                if(k != 'accounts' && this.is_masqueradable && this.api_url === winkstart.apps['accounts'].api_url) {
                    this.account_id = winkstart.apps['accounts'].account_id;
                }
            });
        },

        restore_masquerading: function() {
            var THIS = this,
                id = winkstart.apps['accounts'].masquerade.pop();

            console.log('restore', winkstart.apps['accounts'].masquerade.length);
            if(winkstart.apps['accounts'].masquerade.length) {
                winkstart.request('accounts_manager.get', {
                        api_url: winkstart.apps['accounts'].api_url,
                        account_id: id
                    },
                    function(data, status) {
                        THIS.update_apps(data.data.id);

                        THIS.masquerade_account(data.data.name);

                        winkstart.publish('accounts_manager.activate');
                    }
                );
            }
            else {
                THIS.update_apps(id);

                winkstart.publish('nav.company_name', function() { return winkstart.apps['accounts'].account_name });
                delete winkstart.apps['accounts'].masquerade;
                winkstart.alert('info', 'Masquerading finished, you\'re now using your root account.');

                winkstart.publish('accounts_manager.activate');
            }

        },

        masquerade_account: function(account_name) {
            var THIS = this;

            winkstart.alert('info', 'You are now using ' + account_name + '\'s account');
            winkstart.publish('nav.company_name', function() { return 'as ' + account_name + ' (restore)' });
        },

        activate: function(parent) {
            var THIS = this,
                accounts_manager_html = THIS.templates.accounts_manager.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(accounts_manager_html);

            THIS.render_list(accounts_manager_html);
        }
    }
);
