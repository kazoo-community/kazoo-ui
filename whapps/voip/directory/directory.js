winkstart.module('voip', 'directory', {
        css: [
            'css/directory.css'
        ],

        templates: {
            directory: 'tmpl/directory.html',
            edit: 'tmpl/edit.html',
            directory_callflow: 'tmpl/directory_callflow.html',
            user_row: 'tmpl/user_row.html'
        },

        subscribe: {
            'directory.activate': 'activate',
            'directory.edit': 'edit_directory',
            'callflow.define_callflow_nodes': 'define_callflow_nodes',
            'directory.popup_edit': 'popup_edit_directory'
        },

        validation: [
            { name: '#name',                 regex: /^.*/ },
            { name: '#min_dtmf',           regex: /^[0-9]{0,2}$/ },
            { name: '#max_dtmf',            regex: /^[0-9]{0,2}$/ }
        ],

        resources: {
            'directory.list': {
                url: '{api_url}/accounts/{account_id}/directories',
                contentType: 'application/json',
                verb: 'GET'
            },
            'directory.get': {
                url: '{api_url}/accounts/{account_id}/directories/{directory_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'directory.create': {
                url: '{api_url}/accounts/{account_id}/directories',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'directory.update': {
                url: '{api_url}/accounts/{account_id}/directories/{directory_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'directory.delete': {
                url: '{api_url}/accounts/{account_id}/directories/{directory_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            },
            'directory.user_list': {
                url: '{api_url}/accounts/{account_id}/users',
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
            label: 'Directory',
            icon: 'book',
            weight: '50',
            category: 'advanced'
        });
    },

    {
        save_directory: function(form_data, data, success, error) {
            var THIS = this,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

            if (typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'directory.update', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        directory_id: data.data.id,
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
                winkstart.request(true, 'directory.create', {
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

        edit_directory: function(data, _parent, _target, _callbacks, data_defaults){
            var THIS = this,
                parent = _parent || $('#directory-content'),
                target = _target || $('#directory-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.render_list(parent);

                        THIS.edit_directory({ id: _data.data.id }, parent, target, callbacks);
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
                        min_dtmf: '3',
                        sort_by: 'last_name',
                        confirm_match: false
                    }, data_defaults || {}),
                    field_data: {
                        sort_by: {
                            'first_name': 'First Name',
                            'last_name': 'Last Name'
                        }
                    }
                };

            winkstart.request(true, 'callflow.list', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(_data, status) {
                    var list_callflows = [];
                    $.each(_data.data, function() {
                        if(this.featurecode == false) {
                            list_callflows.push(this);
                        }
                    });
                    defaults.field_data.callflows = list_callflows;

                    winkstart.request(true, 'user.list', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url
                        },
                        function(_data, status) {
                            defaults.field_data.users = _data.data;

                            if(typeof data == 'object' && data.id) {
                                winkstart.request(true, 'directory.get', {
                                        account_id: winkstart.apps['voip'].account_id,
                                        api_url: winkstart.apps['voip'].api_url,
                                        directory_id: data.id
                                    },
                                    function(_data, status) {
                                        THIS.render_directory($.extend(true, defaults, _data), target, callbacks);

                                        if(typeof callbacks.after_render == 'function') {
                                            callbacks.after_render();
                                        }
                                    }
                                );
                            }
                            else {
                                THIS.render_directory(defaults, target, callbacks);

                                if(typeof callbacks.after_render == 'function') {
                                    callbacks.after_render();
                                }
                            }
                        }
                    );
                }
            );
        },

        delete_directory: function(data, success, error) {
            var THIS = this;

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'directory.delete', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        directory_id: data.data.id
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

        render_directory: function(data, target, callbacks){
            var THIS = this,
                directory_html = THIS.templates.edit.tmpl(data);

            THIS.render_user_list(data, directory_html);

            winkstart.validate.set(THIS.config.validation, directory_html);

            $('*[tooltip]', directory_html).each(function() {
                $(this).tooltip({ attach: directory_html });
            });

            $('ul.settings1', directory_html).tabs($('.pane > div', directory_html));
            $('ul.settings2', directory_html).tabs($('.advanced_pane > div', directory_html));

            $('#name', directory_html).focus();

            $('.advanced_pane', directory_html).hide();
            $('.advanced_tabs_wrapper', directory_html).hide();

            $('#advanced_settings_link', directory_html).click(function() {
                if($(this).attr('enabled')=='true') {
                    $(this).attr('enabled', 'false');

                    $('.advanced_pane', directory_html).slideToggle(function() {
                        $('.advanced_tabs_wrapper', directory_html).animate({ width: 'toggle' });
                    });
                }
                else {
                    $(this).attr('enabled', 'true');

                    $('.advanced_tabs_wrapper', directory_html).animate({
                        width: 'toggle'
                    }, function() {
                        $('.advanced_pane', directory_html).slideToggle();
                    });
                }
            });

            $('.directory-save', directory_html).click(function(ev) {
                ev.preventDefault();

                winkstart.validate.is_valid(THIS.config.validation, directory_html, function() {
                        var form_data = form2object('directory-form');

                        THIS.clean_form_data(form_data);

                        if('field_data' in data) {
                            delete data.field_data;
                        }

                        THIS.save_directory(form_data, data, callbacks.save_success, callbacks.save_error);
                    },
                    function() {
                        winkstart.alert('There were errors on the form, please correct!');
                    }
                );
            });

            $('.directory-delete', directory_html).click(function(ev) {
                ev.preventDefault();

                THIS.delete_directory(data, callbacks.delete_success, callbacks.delete_error);
            });

            $('.add_user_div', directory_html).click(function() {
                var $user = $('#user_id', directory_html);
                var $callflow = $('#callflow_id', directory_html);

                if($user.val() != 'empty_option_user' && $callflow.val() != 'empty_option_callflow') {
                    var user_id = $user.val(),
                        user_data = {
                            id: user_id,
                            name: $('#option_user_'+user_id, directory_html).text(),
                            callflow_id: $callflow.val(),
                            field_data: {
                                callflows: data.field_data.callflows
                            }
                        };

                    console.log(user_data);

                    if($('#row_no_data', directory_html).size() > 0) {
                        $('#row_no_data', directory_html).remove();
                    }

                    $('.rows', directory_html).append(THIS.templates.user_row.tmpl(user_data));
                    $('#option_user_'+user_id, directory_html).hide();

                    $user.val('empty_option_user');
                    $callflow.val('empty_option_callflow');
                }
            });

            $(directory_html).delegate('.action_user.delete', 'click', function() {
                var user_id = $(this).dataset('id');
                //removes it from the grid
                $('#row_user_'+user_id, directory_html).remove();
                //re-add it to the dropdown
                $('#option_user_'+user_id, directory_html).show();
                //if grid empty, add no data line
                if($('.rows .row', directory_html).size() == 0) {
                    $('.rows', directory_html).append(THIS.templates.user_row.tmpl());
                }
            });

            (target)
                .empty()
                .append(directory_html);
        },

        normalize_data: function(form_data) {
            return form_data;
        },

        clean_form_data: function(form_data) {
            delete form_data.user_id;
            delete form_data.callflow_id;
        },

        render_list: function(_parent){
            var THIS = this,
                parent = _parent || $('#directory-content');;

            winkstart.request(true, 'directory.list', {
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

                    $('#directory-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: 'Directories',
                            identifier: 'directory-listview',
                            new_entity_label: 'Add Directory',
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'directory.edit',
                            notifyCreateMethod: 'directory.edit',
                            notifyParent: parent
                        });
                }
            );
        },

        activate: function(parent) {
            var THIS = this,
                directory_html = THIS.templates.directory.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(directory_html);

            THIS.render_list(directory_html);
        },

        render_user_list: function(data, parent) {
            var THIS = this;
            console.log(data);

            if(data.data.id) {
                winkstart.request(true, 'directory.user_list', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        directory_id: data.id
                    },
                    function(_data, status) {
                        $('.rows', parent).empty();
                        if(_data.data.length > 0) {
                            $.each(_data.data, function(k, v) {
                                v.field_data = {
                                    callflows: data.field_data.callflows
                                };
                                v.callflow_id = v.field_data.callflows[0];
                                v.name = v.first_name + ' ' + v.last_name;
                                $('.rows', parent).append(THIS.templates.user_row.tmpl(v));
                            });
                        }
                        else {
                            $('.rows', parent).append(THIS.templates.user_row.tmpl());
                        }
                    }
                );
            }
            else {
                $('.rows', parent).empty()
                                  .append(THIS.templates.user_row.tmpl());
            }
        },

        popup_edit_directory: function(data, callback, data_defaults) {
            var popup, popup_html;

            popup_html = $('<div class="inline_popup"><div class="inline_content"/></div>');

            winkstart.publish('directory.edit', data, popup_html, $('.inline_content', popup_html), {
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
                        title: (data.id) ? 'Edit Directory' : 'Create Directory'
                    });
                }
            }, data_defaults);
        },

        define_callflow_nodes: function(callflow_nodes) {
            var THIS = this;

            $.extend(callflow_nodes, {
                'directory[id=*]': {
                    name: 'Directory',
                    icon: 'book',
                    category: 'Advanced',
                    module: 'directory',
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

                        winkstart.request(true, 'directory.list',  {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html;

                                popup_html = THIS.templates.directory_callflow.tmpl({
                                    items: data.data,
                                    selected: node.getMetadata('id') || ''
                                });

                                if($('#directory_selector option:selected', popup_html).val() == undefined) {
                                    $('#edit_link', popup_html).hide();
                                }

                                $('.inline_action', popup_html).click(function(ev) {
                                    var _data = ($(this).dataset('action') == 'edit') ?
                                                    { id: $('#directory_selector', popup_html).val() } : {};

                                    ev.preventDefault();

                                    winkstart.publish('directory.popup_edit', _data, function(_data) {
                                        console.log(_data);
                                        node.setMetadata('id', _data.data.id || 'null');

                                        node.caption = _data.data.name || '';

                                        popup.dialog('close');
                                    });
                                });

                                $('#add', popup_html).click(function() {
                                    node.setMetadata('id', $('#directory_selector', popup).val());

                                    node.caption = $('#directory_selector option:selected', popup).text();

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                    title: 'Directory',
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
