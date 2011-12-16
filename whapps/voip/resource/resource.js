winkstart.module('voip', 'resource', {
        css: [
            'css/resource.css'
        ],

        templates: {
            resource: 'tmpl/resource.html',
            edit: 'tmpl/edit.html',
            gateway: 'tmpl/gateway.html'
        },

        subscribe: {
            'resource.activate': 'activate',
            'resource.edit': 'edit_resource',
            'callflow.define_callflow_nodes': 'define_callflow_nodes'
        },

        validation: [
            { name: '#name',                   regex: /^.+$/ },
            { name: '#weight_cost',            regex: /^[0-9]+$/ },
            { name: '#rules',                  regex: /^.*$/ },
            { name: '#flags',                  regex: /^.*$/ },
            { name: '#caller_id_options_type', regex: /^\w*$/ },
            { name: '#gateways_username',      regex: /^.*$/ },
            { name: '#gateways_password',      regex: /^[^\s]*$/ },
            { name: '#gateways_prefix',        regex: /^[\+]?[\#0-9]*$/ },
            { name: '#gateways_suffix',        regex: /^[0-9]*$/ }
        ],

        resources: {
            'local_resource.list': {
                url: '{api_url}/accounts/{account_id}/local_resources',
                contentType: 'application/json',
                verb: 'GET'
            },
            'local_resource.get': {
                url: '{api_url}/accounts/{account_id}/local_resources/{resource_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'local_resource.create': {
                url: '{api_url}/accounts/{account_id}/local_resources',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'local_resource.update': {
                url: '{api_url}/accounts/{account_id}/local_resources/{resource_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'local_resource.delete': {
                url: '{api_url}/accounts/{account_id}/local_resources/{resource_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            },
            'global_resource.list': {
                url: '{api_url}/accounts/{account_id}/global_resources',
                contentType: 'application/json',
                verb: 'GET'
            },
            'global_resource.get': {
                url: '{api_url}/accounts/{account_id}/global_resources/{resource_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'global_resource.create': {
                url: '{api_url}/accounts/{account_id}/global_resources',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'global_resource.update': {
                url: '{api_url}/accounts/{account_id}/global_resources/{resource_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'global_resource.delete': {
                url: '{api_url}/accounts/{account_id}/global_resources/{resource_id}',
                contentType: 'application/json',
                verb: 'DELETE'
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
            label: 'Resources',
            icon: 'resource',
            weight: '35'
        });
    },

    {
        save_resource: function(form_data, data, success, error) {
            var THIS = this,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

            if(typeof data.data == 'object' && data.data.id) {
                 winkstart.request(true, normalized_data.type + '_resource.update', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        resource_id: data.data.id,
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
                winkstart.request(true, normalized_data.type + '_resource.create', {
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

        edit_resource: function(data, _parent, _target, _callbacks, data_defaults) {
            var THIS = this,
                parent = _parent || $('#resource-content'),
                target = _target || $('#resource-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                            THIS.render_list(parent);

                            THIS.edit_resource({ id: _data.data.id, type: _data.data.type }, parent, target, callbacks);
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
                        weight_cost: '100',
                        enabled: true,
                        gateways: [
                            {
                                prefix: '+1',
                                codecs: ['PCMU', 'PCMA']
                            }
                        ],
                        rules: [],
                        caller_id_options: {
                            type: 'external'
                        },
                        flags: []
                    }, data_defaults || {}),
                    field_data: {
                        caller_id_options: {
                            type: {
                                'external': 'external',
                                'internal': 'internal',
                                'emergency': 'emergency'
                            }
                        },
                        gateways: {
                            codecs: {
                                'G729': 'G729 - 8kbps (Requires License)',
                                'PCMU': 'G711u / PCMU - 64kbps (North America)',
                                'PCMA': 'G711a / PCMA - 64kbps (Elsewhere)',
                                'G722_16': 'G722 (HD) @ 16kHz',
                                'G722_32': 'G722.1 (HD) @ 32kHz',
                                'CELT_48': 'Siren (HD) @ 48kHz',
                                'CELT_64': 'Siren (HD) @ 64kHz'
                            },
                            invite_formats: {
                                'username': 'Username',
                                'npan': 'NPA NXX XXXX',
                                'e164': 'E. 164'
                            }
                        },
                        rules: {
                            '^\\+{0,1}1{0,1}(\\d{10})$': 'US - 10 digits',
                            '^(\\d{7})$': 'US - 7 digits',
                            '.*': 'No match',
                            'custom': 'Custom'
                        }
                    },
                    functions: {
                        inArray: function(value, array) {
                            return ($.inArray(value, array) == -1) ? false : true;
                        }
                    }
                };

                if(typeof data == 'object' && data.id && data.type) {
                    winkstart.request(true, data.type + '_resource.get', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url,
                            resource_id: data.id
                        },
                        function(_data, status) {
                            _data.data.type = data.type;

                            THIS.render_resource($.extend(true, defaults, _data), target, callbacks);

                            if(typeof callbacks.after_render == 'function') {
                                callbacks.after_render();
                            }
                        }
                    );
                }
                else {
                    if(!('admin' in winkstart.apps['voip']) || !winkstart.apps['voip'].admin) {
                        defaults.data.type = 'local';
                    }
                    THIS.render_resource(defaults, target, callbacks);

                    if(typeof callbacks.after_render == 'function') {
                        callbacks.after_render();
                    }
                }
        },

        delete_resource: function(data, success, error) {
            var THIS = this;

            if(data.data.id) {
                winkstart.request(true, data.data.type + '_resource.delete', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        resource_id: data.data.id
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

        render_resource: function(data, target, callbacks) {
            var THIS = this,
                resource_html = THIS.templates.edit.tmpl(data);

            $.each(data.data.gateways, function(i, obj) {
                var gateway_data = {
                    data: obj,
                    field_data: data.field_data,
                    index: i
                };

                THIS.templates.gateway.tmpl(gateway_data).appendTo($('#gateways', resource_html));
            });

            winkstart.validate.set(THIS.config.validation, resource_html);

            $('*[tooltip]', resource_html).each(function() {
                $(this).tooltip({ attach: resource_html });
            });

            $('ul.settings1', resource_html).tabs($('.pane > div', resource_html));
            $('ul.settings2', resource_html).tabs($('.advanced_pane > div', resource_html));

            $('#name', resource_html).focus();

            $('.advanced_pane', resource_html).hide();
            $('.advanced_tabs_wrapper', resource_html).hide();

            $('#advanced_settings_link', resource_html).click(function() {
                if($(this).attr('enabled') === 'true') {
                    $(this).attr('enabled', 'false');

                    $('.advanced_pane', resource_html).slideToggle(function() {
                        $('.advanced_tabs_wrapper', resource_html).animate({ width: 'toggle' });
                    });
                }
                else {
                    $(this).attr('enabled', 'true');

                    $('.advanced_tabs_wrapper', resource_html).animate({
                            width: 'toggle'
                        },
                        function() {
                            $('.advanced_pane', resource_html).slideToggle();
                        }
                    );
                }
            });

            $('.resource-save', resource_html).click(function(ev) {
                ev.preventDefault();

                winkstart.validate.is_valid(THIS.config.validation, resource_html, function() {
                        var form_data = form2object('resource-form');

                        THIS.clean_form_data(form_data);

                        if('field_data' in data) {
                            delete data.field_data;
                        }

                        THIS.save_resource(form_data, data, callbacks.save_success, callbacks.save_error);
                    },
                    function() {
                        alert('There were errors on the form, please correct!');
                    }
                );
            });

            $('.resource-delete', resource_html).click(function(ev) {
                ev.preventDefault();

                THIS.delete_resource(data, callbacks.delete_success, callbacks.delete_error);
            });

            $('#rules_dropdown', resource_html).change(function() {
                $('#rules_dropdown', resource_html).val() != 'custom' ? $('#rules', resource_html).hide() : $('#rules', resource_html).val('').show();
            });

            data.data.rules[0] in data.field_data.rules && data.data.rules[0] != 'custom' ? $('#rules', resource_html).hide() : $('#rules_dropdown', resource_html).val('custom');

            (target)
                .empty()
                .append(resource_html);

        },

        normalize_data: function(data) {
            return data;
        },

        list_local_resources: function(callback) {
            winkstart.getJSON('local_resource.list', {
                    crossbar: true,
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(data, status) {
                    if(typeof callback == 'function') {
                        callback(data);
                    }
                }
            );
        },

        list_global_resources: function(callback) {
            winkstart.getJSON('global_resource.list', {
                    crossbar: true,
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(data, status) {
                    if(typeof callback == 'function') {
                        callback(data);
                    }
                }
            );
        },

        render_list: function(parent){
            var THIS = this,
                setup_list = function (local_data, global_data) {
                    var resources;
                    function map_crossbar_data(crossbar_data, type){
                        var new_list = [];
                        if(crossbar_data.length > 0) {
                            _.each(crossbar_data, function(elem){
                                new_list.push({
                                    id: elem.id,
                                    title: elem.name,
                                    type: type
                                });
                            });
                        }

                        return new_list;
                    }

                    var options = {};
                    options.label = 'Resources Module';
                    options.identifier = 'resource-listview';
                    options.new_entity_label = 'Add Resource';

                    resources = [].concat(map_crossbar_data(local_data, 'local'), map_crossbar_data(global_data, 'global'));
                    resources.sort(function(a, b) {
                        var answer;
                        a.title.toLowerCase() < b.title.toLowerCase() ? answer = -1 : answer = 1;
                        return answer;
                    });

                    options.data = resources;
                    options.publisher = winkstart.publish;
                    options.notifyMethod = 'resource.edit';
                    options.notifyCreateMethod = 'resource.edit';

                    $('#resource-listpanel', parent).empty();
                    $('#resource-listpanel', parent).listpanel(options);
                };

            if('admin' in winkstart.apps['voip'] && winkstart.apps['voip'].admin === true) {
                THIS.list_global_resources(function(global_data) {
                    THIS.list_local_resources(function(local_data) {
                        setup_list(local_data.data, global_data.data);
                    });
                });
            }
            else {
                THIS.list_local_resources(function(local_data) {
                    setup_list(local_data.data, []);
                });
            }
        },

        clean_form_data: function(form_data) {
            if(form_data.rules_dropdown != 'custom') {
                form_data.rules[0] = form_data.rules_dropdown;
            }

            delete form_data.rules_dropdown;

            $.each(form_data.gateways, function(indexGateway, gateway) {
                var audioCodecs = [];

                $.each(gateway.codecs, function(indexCodec, codec) {
                    if(codec) {
                        audioCodecs.push(codec);
                    }
                });

                form_data.gateways[indexGateway].codecs = audioCodecs;
            });

            return form_data;
        },

        activate: function(parent) {
            var THIS = this,
                resource_html = THIS.templates.resource.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(resource_html);

            THIS.render_list(resource_html);
        },

        define_callflow_nodes: function(callflow_nodes) {
            var THIS = this;

            $.extend(callflow_nodes, {
                'offnet[]': {
                    name: 'Global Resource',
                    icon: 'offnet',
                    category: 'Basic',
                    module: 'offnet',
                    tip: 'Route calls to the phone network through pre-configured service providers',
                    data: {},
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '0'
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
                'resources[]': {
                    name: 'Account Resource',
                    icon: 'resource',
                    category: 'Advanced',
                    module: 'resources',
                    tip: 'Route calls to the phone network through a configured SIP provider, Google Voice or physical digital/analog line',
                    data: {},
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '0'
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
