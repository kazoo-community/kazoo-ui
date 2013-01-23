winkstart.module('voip', 'groups', {
        css: [
            'css/groups.css'
        ],

        templates: {
            groups: 'tmpl/groups.html',
            edit: 'tmpl/edit.html',
            groups_callflow: 'tmpl/groups_callflow.html',
            endpoint_row: 'tmpl/endpoint_row.html'
        },

        subscribe: {
            'groups.activate': 'activate',
            'groups.edit': 'edit_groups',
            'callflow.define_callflow_nodes': 'define_callflow_nodes',
            'groups.popup_edit': 'popup_edit_groups'
        },

        validation: [
            { name: '#name',                 regex: /^.*/ }
        ],

        resources: {
            'groups.list': {
                url: '{api_url}/accounts/{account_id}/groups',
                contentType: 'application/json',
                verb: 'GET'
            },
            'groups.get': {
                url: '{api_url}/accounts/{account_id}/groups/{groups_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'groups.create': {
                url: '{api_url}/accounts/{account_id}/groups',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'groups.update': {
                url: '{api_url}/accounts/{account_id}/groups/{groups_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'groups.delete': {
                url: '{api_url}/accounts/{account_id}/groups/{groups_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            },
            'groups.user_list': {
                url: '{api_url}/accounts/{account_id}/users',
                contentType: 'application/json',
                verb: 'GET'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        winkstart.publish('whappnav.subnav.add', {
            whapp: 'voip',
            module: THIS.__module,
            label: 'Groups',
            icon: 'user',
            weight: '60',
            category: 'advanced'
        });
    },

    {
        save_groups: function(form_data, data, success, error) {
            var THIS = this,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

            if (typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'groups.update', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        groups_id: data.data.id,
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
                winkstart.request(true, 'groups.create', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        data: normalized_data
                    },
                    function (_data, status) {
                        if(typeof success == 'function') {
                            success(_data, status, 'create');
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

        edit_groups: function(data, _parent, _target, _callbacks, data_defaults){
            var THIS = this,
                parent = _parent || $('#groups-content'),
                target = _target || $('#groups-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.render_list(parent);

                        THIS.edit_groups({ id: _data.data.id }, parent, target, callbacks);
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

                    }, data_defaults || {}),
                    field_data: {}
                },
                render_group = function() {
                    winkstart.request(true, 'device.list', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url
                        },
                        function(_data_devices, status) {
                            defaults.field_data.devices = _data_devices.data;

                            winkstart.request(true, 'user.list', {
                                    account_id: winkstart.apps['voip'].account_id,
                                    api_url: winkstart.apps['voip'].api_url
                                },
                                function(_data, status) {
                                    defaults.field_data.users = _data.data;

                                    if(typeof data == 'object' && data.id) {
                                        winkstart.request(true, 'groups.get', {
                                                account_id: winkstart.apps['voip'].account_id,
                                                api_url: winkstart.apps['voip'].api_url,
                                                groups_id: data.id
                                            },
                                            function(_data, status) {
                                                var render_data = $.extend(true, defaults, _data);

                                                if('resources' in render_data.data) {
                                                    $.each(render_data.field_data.resources, function(key, type) {
                                                        $.each(type, function(k, resource) {
                                                            if(render_data.data.resources[resource.id]) {
                                                                resource.checked = true;
                                                            }
                                                        });
                                                    });
                                                }

                                                THIS.render_groups(render_data, target, callbacks);

                                                if(typeof callbacks.after_render == 'function') {
                                                    callbacks.after_render();
                                                }
                                            }
                                        );
                                    }
                                    else {
                                        THIS.render_groups(defaults, target, callbacks);

                                        if(typeof callbacks.after_render == 'function') {
                                            callbacks.after_render();
                                        }
                                    }
                                }
                            );
                        }
                    );
                };

            winkstart.request(true, 'local_resource.list', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(_data_local_resources) {
                    defaults.field_data.resources = { 'local': {}};
                    $.each(_data_local_resources.data, function(k, v) {
                        defaults.field_data.resources['local'][v.id] = v;
                    });

                    if('admin' in winkstart.apps['voip'] && winkstart.apps['voip'].admin === true) {
                        winkstart.request(true, 'global_resource.list', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(_data_global_resources) {
                                defaults.field_data.resources['global'] = {};
                                $.each(_data_global_resources.data, function(k, v) {
                                    defaults.field_data.resources['local'][v.id] = v;
                                });

                                render_group();
                            }
                        );
                    }
                    else {
                        render_group();
                    }
                }
            );
        },

        delete_groups: function(data, success, error) {
            var THIS = this;

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'groups.delete', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        groups_id: data.data.id
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

        render_groups: function(data, target, callbacks){
            var THIS = this,
                groups_html = THIS.templates.edit.tmpl(data);

            THIS.render_endpoint_list(data, groups_html);

            winkstart.validate.set(THIS.config.validation, groups_html);

            $('*[rel=popover]:not([type="text"])', groups_html).popover({
                trigger: 'hover'
            });

            $('*[rel=popover][type="text"]', groups_html).popover({
                trigger: 'focus'
            });

            winkstart.tabs($('.view-buttons', groups_html), $('.tabs', groups_html));

            $('.group-save', groups_html).click(function(ev) {
                ev.preventDefault();

                winkstart.validate.is_valid(THIS.config.validation, groups_html, function() {
                        var form_data = form2object('group-form');
                        THIS.clean_form_data(form_data, data.field_data);

                        form_data.endpoints = {};

                        $('.rows .row:not(#row_no_data)', groups_html).each(function(k, v) {
                            form_data.endpoints[$(v).dataset('id')] = { type: $(v).dataset('type')};
                        });

                        delete data.data.resources;
                        delete data.data.endpoints;

                        THIS.save_groups(form_data, data, callbacks.save_success, winkstart.error_message.process_error(callbacks.save_error));
                    },
                    function() {
                        winkstart.alert('There were errors on the form, please correct!');
                    }
                );
            });

            $('.group-delete', groups_html).click(function(ev) {
                ev.preventDefault();

                winkstart.confirm('Are you sure you want to delete this groups?', function() {
                    THIS.delete_groups(data, callbacks.delete_success, callbacks.delete_error);
                });
            });

            $('#add_user', groups_html).click(function() {
                var $user = $('#select_user_id', groups_html);

                if($user.val() != 'empty_option_user') {
                    var user_id = $user.val(),
                        user_data = {
                            endpoint_id: user_id,
                            endpoint_type: 'user',
                            endpoint_name: $('#option_endpoint_'+user_id, groups_html).text(),
                        };

                    if($('#row_no_data', groups_html).size() > 0) {
                        $('#row_no_data', groups_html).remove();
                    }

                    $('.rows', groups_html).prepend(THIS.templates.endpoint_row.tmpl(user_data));
                    $('#option_endpoint_'+user_id, groups_html).hide();

                    $user.val('empty_option_user');
                }
            });

            $('#add_device', groups_html).click(function() {
                var $device = $('#select_device_id', groups_html);

                if($device.val() != 'empty_option_device') {
                    var device_id = $device.val(),
                        device_data = {
                            endpoint_id: device_id,
                            endpoint_type: 'device',
                            endpoint_name: $('#option_endpoint_'+device_id, groups_html).text(),
                        };

                    if($('#row_no_data', groups_html).size() > 0) {
                        $('#row_no_data', groups_html).remove();
                    }

                    $('.rows', groups_html).prepend(THIS.templates.endpoint_row.tmpl(device_data));
                    $('#option_endpoint_'+device_id, groups_html).hide();

                    $device.val('empty_option_device');
                }
            });

            $(groups_html).delegate('.action_endpoint.delete', 'click', function() {
                var endpoint_id = $(this).dataset('id');
                //removes it from the grid
                $('#row_endpoint_'+endpoint_id, groups_html).remove();
                //re-add it to the dropdown
                $('#option_endpoint_'+endpoint_id, groups_html).show();
                //if grid empty, add no data line
                if($('.rows .row', groups_html).size() === 0) {
                    $('.rows', groups_html).append(THIS.templates.endpoint_row.tmpl());
                }
            });

            (target)
                .empty()
                .append(groups_html);
        },

        normalize_data: function(form_data) {
            delete form_data.users;
            return form_data;
        },

        clean_form_data: function(form_data, field_data) {
            var new_resource = {};
            $.each(form_data.resources, function(k, v) {
                if(v !== false) {
                    if(v in field_data.resources['local']) {
                        new_resource[v] = 'local';
                    }
                    else {
                        new_resource[v] = 'global';
                    }
                }
            });
            form_data.resources = new_resource;

            delete form_data.extra;
        },

        render_list: function(_parent){
            var THIS = this,
                parent = _parent || $('#groups-content');;

            winkstart.request(true, 'groups.list', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function (data, status) {
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

                    $('#groups-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: 'Directories',
                            identifier: 'groups-listview',
                            new_entity_label: 'Add Group',
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'groups.edit',
                            notifyCreateMethod: 'groups.edit',
                            notifyParent: parent
                        });
                }
            );
        },

        activate: function(parent) {
            var THIS = this,
                groups_html = THIS.templates.groups.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(groups_html);

            THIS.render_list(groups_html);
        },

        render_endpoint_list: function(data, parent) {
            var THIS = this;

            if('endpoints' in data.data && !($.isEmptyObject(data.data.endpoints))) {
                var user_item;
                $.each(data.field_data.users, function(k, v) {
                    if(v.id in data.data.endpoints) {
                        endpoint_item = {
                            endpoint_type: 'user',
                            endpoint_id: v.id,
                            endpoint_name: v.first_name + ' ' + v.last_name,
                        };

                        $('.rows', parent).append(THIS.templates.endpoint_row.tmpl(endpoint_item));
                        $('#option_endpoint_'+v.id, parent).hide();
                    }
                });

                $.each(data.field_data.devices, function(k, v) {
                    if(v.id in data.data.endpoints) {
                        endpoint_item = {
                            endpoint_type: 'device',
                            endpoint_id: v.id,
                            endpoint_name: v.name,
                        };

                        $('.rows', parent).append(THIS.templates.endpoint_row.tmpl(endpoint_item));
                        $('#option_endpoint_'+v.id, parent).hide();
                    }
                });
            }
            else {
                $('.rows', parent).empty()
                                  .append(THIS.templates.endpoint_row.tmpl({}));
            }
        },

        popup_edit_groups: function(data, callback, data_defaults) {
            var popup, popup_html;

            popup_html = $('<div class="inline_popup"><div class="inline_content main_content"/></div>');

            winkstart.publish('groups.edit', data, popup_html, $('.inline_content', popup_html), {
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
                        title: (data.id) ? 'Edit Groups' : 'Create Groups'
                    });
                }
            }, data_defaults);
        },

        define_callflow_nodes: function(callflow_nodes) {
            var THIS = this;

            $.extend(callflow_nodes, {
                'groups[id=*]': {
                    name: 'Groups',
                    icon: 'user',
                    category: 'Advanced',
                    module: 'groups',
                    tip: 'Ask the caller to input the first letters of the name of the person that he wants to reach.',
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

                        return (id) ? caption_map[id].name : '';
                    },
                    edit: function(node, callback) {
                        var _this = this;

                        winkstart.request(true, 'groups.list',  {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html;

                                popup_html = THIS.templates.groups_callflow.tmpl({
                                    items: data.data,
                                    selected: node.getMetadata('id') || ''
                                });

                                if($('#group_selector option:selected', popup_html).val() == undefined) {
                                    $('#edit_link', popup_html).hide();
                                }

                                $('.inline_action', popup_html).click(function(ev) {
                                    var _data = ($(this).dataset('action') == 'edit') ?
                                                    { id: $('#groups_selector', popup_html).val() } : {};

                                    ev.preventDefault();

                                    winkstart.publish('groups.popup_edit', _data, function(_data) {
                                        node.setMetadata('id', _data.data.id || 'null');

                                        node.caption = _data.data.name || '';

                                        popup.dialog('close');
                                    });
                                });

                                $('#add', popup_html).click(function() {
                                    node.setMetadata('id', $('#groups_selector', popup).val());

                                    node.caption = $('#groups_selector option:selected', popup).text();

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                    title: 'Groups',
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
                }
            });
        }
    }
);
