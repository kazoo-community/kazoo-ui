winkstart.module('voip', 'menu', {
        css: [
            'css/menu.css'
        ],

        templates: {
            menu: 'tmpl/menu.html',
            edit: 'tmpl/edit.html',
            menu_callflow: 'tmpl/menu_callflow.html',
            menu_key_callflow: 'tmpl/menu_key_callflow.html'
        },

        subscribe: {
            'menu.activate': 'activate',
            'menu.edit': 'edit_menu',
            'callflow.define_callflow_nodes': 'define_callflow_nodes',
            'menu.popup_edit': 'popup_edit_menu'
        },

        validation: [
            { name: '#name',                 regex: /^.*/ },
            { name: '#retries',              regex: /^[0-9]+$/ },
            { name: '#record_pin',           regex: /^[0-9]*$/ },
            { name: '#timeout',              regex: /^[0-9]+$/ },
            { name: '#max_extension_length', regex: /^[0-9]*$/ },
            { name: '#hunt_allow',           regex: /^.*$/ },
            { name: '#hunt_deny',            regex: /^.*$/ }
        ],

        resources: {
            'menu.list': {
                url: '{api_url}/accounts/{account_id}/menus',
                contentType: 'application/json',
                verb: 'GET'
            },
            'menu.get': {
                url: '{api_url}/accounts/{account_id}/menus/{menu_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'menu.create': {
                url: '{api_url}/accounts/{account_id}/menus',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'menu.update': {
                url: '{api_url}/accounts/{account_id}/menus/{menu_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'menu.delete': {
                url: '{api_url}/accounts/{account_id}/menus/{menu_id}',
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
            label: 'Menus',
            icon: 'menu',
            weight: '40'
        });
    },

    {
        save_menu: function(form_data, data, success, error) {
            var THIS = this,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

            if (typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'menu.update', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        menu_id: data.data.id,
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
                winkstart.request(true, 'menu.create', {
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

        edit_menu: function(data, _parent, _target, _callbacks, data_defaults){
            var THIS = this,
                parent = _parent || $('#menu-content'),
                target = _target || $('#menu-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.render_list(parent);

                        THIS.edit_menu({ id: _data.data.id }, parent, target, callbacks);
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
                        retries: '3',
                        timeout: '10000',
                        max_extension_length: '4',
                        media: {}
                    }, data_defaults || {}),
                    field_data: {
                        media: []
                    }
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
                        winkstart.request(true, 'menu.get', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url,
                                menu_id: data.id
                            },
                            function(_data, status) {
                                THIS.render_menu($.extend(true, defaults, _data), target, callbacks);

                                if(typeof callbacks.after_render == 'function') {
                                    callbacks.after_render();
                                }
                            }
                        );
                    }
                    else {
                        THIS.render_menu(defaults, target, callbacks);

                        if(typeof callbacks.after_render == 'function') {
                            callbacks.after_render();
                        }
                    }
                }
            );
        },

        delete_menu: function(data, success, error) {
            var THIS = this;

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'menu.delete', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        menu_id: data.data.id
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

        render_menu: function(data, target, callbacks){
            var THIS = this,
                menu_html = THIS.templates.edit.tmpl(data);

            winkstart.validate.set(THIS.config.validation, menu_html);

            $('*[tooltip]', menu_html).each(function() {
                $(this).tooltip({ attach: menu_html });
            });

            $('ul.settings1', menu_html).tabs($('.pane > div', menu_html));
            $('ul.settings2', menu_html).tabs($('.advanced_pane > div', menu_html));

            $('#name', menu_html).focus();

            $('.advanced_pane', menu_html).hide();
            $('.advanced_tabs_wrapper', menu_html).hide();

            $('#advanced_settings_link', menu_html).click(function() {
                if($(this).attr('enabled')=='true') {
                    $(this).attr('enabled', 'false');

                    $('.advanced_pane', menu_html).slideToggle(function() {
                        $('.advanced_tabs_wrapper', menu_html).animate({ width: 'toggle' });
                    });
                }
                else {
                    $(this).attr('enabled', 'true');

                    $('.advanced_tabs_wrapper', menu_html).animate({
                        width: 'toggle'
                    }, function() {
                        $('.advanced_pane', menu_html).slideToggle();
                    });
                }
            });

            if(!$('#media_greeting', menu_html).val()) {
                $('#edit_link_media', menu_html).hide();
            }

            $('#media_greeting', menu_html).change(function() {
                !$('#media_greeting option:selected', menu_html).val() ? $('#edit_link_media', menu_html).hide() : $('#edit_link_media', menu_html).show();
            });

            $('.inline_action_media', menu_html).click(function(ev) {
                var _data = ($(this).dataset('action') == 'edit') ? { id: $('#media_greeting', menu_html).val() } : {},
                    _id = _data.id;

                ev.preventDefault();

                winkstart.publish('media.popup_edit', _data, function(_data) {
                    /* Create */
                    if(!_id) {
                        $('#media_greeting', menu_html).append('<option id="'+ _data.data.id  +'" value="'+ _data.data.id +'">'+ _data.data.name +'</option>')
                        $('#media_greeting', menu_html).val(_data.data.id);

                        $('#edit_link_media', menu_html).show();
                    }
                    else {
                        /* Update */
                        if('id' in _data.data) {
                            $('#media_greeting #'+_data.data.id, menu_html).text(_data.data.name);
                        }
                        /* Delete */
                        else {
                            $('#media_greeting #'+_id, menu_html).remove();
                            $('#edit_link_media', menu_html).hide();
                        }
                    }
                });
            });

            $('.menu-save', menu_html).click(function(ev) {
                ev.preventDefault();

                winkstart.validate.is_valid(THIS.config.validation, menu_html, function() {
                        var form_data = form2object('menu-form');

                        THIS.clean_form_data(form_data);

                        if('field_data' in data) {
                            delete data.field_data;
                        }

                        THIS.save_menu(form_data, data, callbacks.save_success, callbacks.save_error);
                    },
                    function() {
                        alert('There were errors on the form, please correct!');
                    }
                );
            });

            $('.menu-delete', menu_html).click(function(ev) {
                ev.preventDefault();

                THIS.delete_menu(data, callbacks.delete_success, callbacks.delete_error);
            });

            (target)
                .empty()
                .append(menu_html);
        },

        normalize_data: function(form_data) {
            if(!form_data.media.greeting) {
                delete form_data.media.greeting;
            }

            return form_data;
        },

        clean_form_data: function(form_data) {

            if(form_data.record_pin.length == 0) {
                form_data.max_extension_length = 4;
                delete form_data.record_pin;
            }
            else if(form_data.max_extension_length < form_data.record_pin.length) {
                form_data.max_extension_length = form_data.record_pin.length;
            }

            if(form_data.hunt_allow == '') {
                delete form_data.hunt_allow;
            }

            if(form_data.hunt_deny == '') {
                delete form_data.hunt_deny;
            }

            /* Hack to put timeout in ms in database. */
            form_data.timeout = form_data.timeout * 1000;
        },

        render_list: function(_parent){
            var THIS = this,
                parent = _parent || $('#menu-content');;

            winkstart.request(true, 'menu.list', {
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

                    $('#menu-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: 'Menus',
                            identifier: 'menu-listview',
                            new_entity_label: 'Add Menu',
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'menu.edit',
                            notifyCreateMethod: 'menu.edit',
                            notifyParent: parent
                        });
                }
            );
        },

        activate: function(parent) {
            var THIS = this,
                menu_html = THIS.templates.menu.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(menu_html);

            THIS.render_list(menu_html);
        },

        popup_edit_menu: function(data, callback) {
            var popup, popup_html;

            popup_html = $('<div class="inline_popup"><div class="inline_content"/></div>');

            winkstart.publish('menu.edit', data, popup_html, $('.inline_content', popup_html), {
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
                        title: (data.id) ? 'Edit Menu' : 'Create Menu'
                    });
                }
            });
        },

        define_callflow_nodes: function(callflow_nodes) {
            var THIS = this;

            $.extend(callflow_nodes, {
                'menu[id=*]': {
                    name: 'Menu',
                    icon: 'menu',
                    category: 'Basic',
                    module: 'menu',
                    tip: 'Ask a caller to push a menu option or dial an extension number',
                    data: {
                        id: 'null'
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '9'
                        }
                    ],
                    isUsable: 'true',
                    key_caption: function(child_node, caption_map) {
                        var key = child_node.key;

                        return (key != '_') ? key : 'Default action';
                    },
                    key_edit: function(child_node, callback) {
                        var popup, popup_html;

                        popup_html = THIS.templates.menu_key_callflow.tmpl({
                            items: {
                                '_': 'Default action',
                                '0': '0',
                                '1': '1',
                                '2': '2',
                                '3': '3',
                                '4': '4',
                                '5': '5',
                                '6': '6',
                                '7': '7',
                                '8': '8',
                                '9': '9',
                                '*': '*',
                                '#': '#'
                            },
                            selected: child_node.key
                        });

                        $('.submit_btn', popup_html).click(function() {
                            child_node.key = $('#menu_key_selector', popup).val();

                            child_node.key_caption = $('#menu_key_selector option:selected', popup).text();

                            popup.dialog('close');
                        });

                        popup = winkstart.dialog(popup_html, {
                            title: 'Menu Option',
                            beforeClose: function() {
                                if(typeof callback == 'function') {
                                    callback();
                                }
                            }
                        });
                    },
                    caption: function(node, caption_map) {
                        var id = node.getMetadata('id');

                        return (id) ? caption_map[id].name : '';
                    },
                    edit: function(node, callback) {
                        var _this = this;

                        winkstart.request(true, 'menu.list',  {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html;

                                popup_html = THIS.templates.menu_callflow.tmpl({
                                    items: data.data,
                                    selected: node.getMetadata('id') || ''
                                });

                                if($('#menu_selector option:selected', popup_html).val() == undefined) {
                                    $('#edit_link', popup_html).hide();
                                }

                                $('.inline_action', popup_html).click(function(ev) {
                                    var _data = ($(this).dataset('action') == 'edit') ?
                                                    { id: $('#menu_selector', popup_html).val() } : {};

                                    ev.preventDefault();

                                    winkstart.publish('menu.popup_edit', _data, function(_data) {
                                        node.setMetadata('id', _data.data.id || 'null');

                                        node.caption = _data.data.name || '';

                                        popup.dialog('close');
                                    });
                                });

                                $('.submit_btn', popup_html).click(function() {
                                    node.setMetadata('id', $('#menu_selector', popup).val());

                                    node.caption = $('#menu_selector option:selected', popup).text();

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                    title: 'Menu',
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
