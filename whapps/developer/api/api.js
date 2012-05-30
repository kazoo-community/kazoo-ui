winkstart.module('developer', 'api', {

        subscribe: {
            'api.activate' : 'activate',
            'api.render' : 'render_api'
        },

        templates: {
            api: 'tmpl/api.html',
            form: 'tmpl/form.html',
            schema: 'tmpl/schema.html',
            input_id: 'tmpl/input_id.html'
        },

        css: [
            'css/api.css'
        ],

        resources: {
            'api.list': {
                url: '{api_url}/v1/schemas',
                contentType: 'application/json',
                verb: 'GET'
            },
            'api.show': {
                url: '{api_url}/v1/schemas/{id}',
                contentType: 'application/json',
                verb: 'GET'
            }
        }

    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        THIS.test();
    },
    {

        render_api: function(args) {
            var THIS = this,
                form_html = null,
                schema_html = null
                input_id_html = THIS.templates.input_id.tmpl();

            winkstart.request(true, 'api.show', {
                    api_url: 'http://192.168.1.42:8000',
                    id: args.id
                },
                function(data, status) {
                    winkstart.registerResources(THIS.__whapp, THIS.apis[data.data.id].ressources);

                    THIS.schema_to_template(data.data.properties, function(required, not_required, schema) {

                        form_html =  THIS.templates.form.tmpl({
                            title: data.data.id,
                            api_url: winkstart.apps.developer.api_url,
                            apis: THIS.apis[data.data.id].api,
                            rest: THIS.rest
                        });

                        schema_html = THIS.templates.schema.tmpl({
                            required: required,
                            not_required: not_required
                        });

                        $('.try', form_html).click(function(e) {
                            e.preventDefault();
                            
                            var id = $(this).data('id')
                                verb = $(this).data('verb');
                                request = {
                                    account_id: winkstart.apps['developer'].account_id,
                                    api_url: winkstart.apps['developer'].api_url,
                                };


                            switch(verb) {
                                case 'put':
                                    var tmp = form2object(id + "_" + verb + "_form");

                                    request.data = tmp;
                                    break;
                                case 'post':
                                    var tmp = form2object(id + "_" + verb + "_form");

                                    request.device_id = tmp.id; 
                                    delete tmp.id;
                                    request.data = tmp;
                                    break;
                                case 'get':
                                    var tmp = form2object(id + "_" + verb + "_form");

                                    request.device_id = tmp.id; 
                                    break;
                                case 'delete':
                                    var tmp = form2object(id + "_" + verb + "_form");

                                    request.device_id = tmp.id;
                                    break;
                            }

                            console.log(request);

                            winkstart.request('developer.' + id + '.' + verb, 
                                request,
                                function(_data, status) {
                                    $('#' + id + '_' + verb + ' .result', form_html)
                                        .html("<pre>{\n" + THIS.print_r(_data) + "\n}</pre>");
                                },
                                function(_data, status) {
                                    $('#' + id + '_' + verb + ' .result', form_html)
                                        .html("<pre>{\n" + THIS.print_r(_data) + "\n}</pre>");
                                }
                            );
                        });

                    });

                    $('*[rel=popover]:not([type="text"])', form_html).popover({
                        trigger: 'hover'
                    });

                    $('*[rel=popover][type="text"]', form_html).popover({
                        trigger: 'focus'
                    });

                    winkstart.accordion(form_html, false);

                    $('.details', form_html).click(function(e){
                        e.preventDefault();
                        var id = $(this).data('id');
                        $('#' + id + ' .hide', form_html).slideToggle();
                    });

                    $('.clean', form_html).click(function(e){
                        e.preventDefault();
                        var id = $(this).data('id');
                        $('#' + id + ' .result', form_html).empty();
                    });


                    $('#api-view')
                        .empty()
                        .append(form_html);

                    $('.schema', form_html)
                        .empty()
                        .append(schema_html);

                    $('.id', form_html)
                        .empty()
                        .append(input_id_html);
                }
            );
        },

        schema_to_template: function(schema, callback) {
            var tmp = {},
                new_schema = {},
                required = {},
                not_required = {},
                clean = function(data, target) {
                    var new_schema = {};

                    if(typeof data == "object") {
                        $.each(data, function(k, o){
                            switch(o.type) {
                                case 'object':
                                    if(o.properties) {
                                        target[k] = {};
                                        clean(o.properties, target[k]);
                                    } else {
                                        new_schema[k] = o;
                                    }
                                    break;
                                case 'array':
                                    if(o.enum || !o.items || !o.items.properties ){
                                        new_schema[k] = o;
                                    } else {
                                        target[k] = {};
                                        clean(o.items.properties, target[k]);
                                    }
                                    break;
                                default:
                                    new_schema[k] = o;
                                    break;
                            }
                        });
                    }

                    $.extend(target, new_schema);
                },
                template = function (data, target, name) {
                    var new_schema = {};

                    $.each(data, function(k, o){
                        if(o.type){
                            (name) ? o.input_name = name + '.' + k : o.input_name = k;
                            new_schema[k] = o
                        } else {
                            (name) ? k = name + '.' + k : k = k;
                            template(o, target, k);
                        }

                    });

                    $.extend(target, new_schema);
                };

            clean(schema, tmp);
            template(tmp, new_schema); 

            $.each(new_schema, function(k, o){
                if(o.required) {
                    required[k] = o;
                } else {
                    not_required[k] = o;
                }
            });

            if(typeof callback == "function"){
                callback(required, not_required, schema);
            }
        },

        render_list: function(parent) {
            var THIS = this;

            winkstart.request(true, 'api.list', {
                    api_url: 'http://192.168.1.42:8000'
                },
                function(data, status) {
                    var map_crossbar_data = function(data) {
                        var new_list = [];

                        if(data.length > 0) {
                            $.each(data, function(key, val) {
                                new_list.push({
                                    id: val,
                                    title: val || '(name)'
                                });
                            });
                        }

                        new_list.sort(function(a, b) {
                            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                        });

                        return new_list;
                    };

                    $('#api-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: 'Apis',
                            identifier: 'api-listview',
                            new_entity_label: 'APIs',
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'api.render',
                            notifyCreateMethod: '',
                            notifyParent: parent
                    });
                }
            );         
        },

        print_r: function(arr, level) {
            var THIS = this,
                dumped_text = "",
                level_padding = "";

            if(!level) level = 0;
            
            for(var j=0; j< level+1; j++) level_padding += "    ";

            if(typeof(arr) == 'object') { 
                for(var item in arr) {
                    var value = arr[item];
             
                    if(typeof(value) == 'object') { 
                       dumped_text += level_padding + "'" + item + "': { \n";
                       dumped_text += THIS.print_r(value, level+1);
                       dumped_text += level_padding + "}\n";
                    } else {
                       dumped_text += level_padding + "'" + item + "': \"" + value + "\"\n";
                    }
                }
            } else { 
                dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
            }

            return dumped_text;
        },

        activate: function(parent) {
            var THIS = this,
               api_html = THIS.templates.api.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(api_html);

            THIS.render_list(api_html);
        },

        test: function() {
            var THIS = this;

            THIS.rest = {
                'get_all': {
                    btn: 'primary'
                },
                'get': {
                    btn: 'info',
                    class: ['id']
                },
                'put': {
                    btn: 'success',
                    class: ['schema']
                },
                'post': {
                    btn: '',
                    class: ['id', 'schema']
                },
                'delete': {
                    btn: 'danger',
                    class: ['id']
                }
            };

            THIS.apis = {
                'devices': {
                    api: {
                        'devices': {
                            verbs: ['get_all', 'get', 'put', 'post', 'delete'],
                            title: 'Devices',
                            url: '/devices'
                        },
                        'devices_status': {
                            verbs: ['get'],
                            title: 'Devices Status',
                            url: '/devices/status'
                        }
                    },
                    ressources: {
                        'developer.devices.get_all': {
                            url: '{api_url}/accounts/{account_id}/devices',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.devices.get': {
                            url: '{api_url}/accounts/{account_id}/devices/{device_id}',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.devices.put': {
                            url: '{api_url}/accounts/{account_id}/devices',
                            contentType: 'application/json',
                            verb: 'PUT'
                        },
                        'developer.devices.post': {
                            url: '{api_url}/accounts/{account_id}/devices/{device_id}',
                            contentType: 'application/json',
                            verb: 'POST'
                        },
                        'developer.devices.delete': {
                            url: '{api_url}/accounts/{account_id}/devices/{device_id}',
                            contentType: 'application/json',
                            verb: 'DELETE'
                        },
                        'developer.devices_status.get': {
                            url: '{api_url}/accounts/{account_id}/devices/status',
                            contentType: 'application/json',
                            verb: 'GET'
                        }
                    }
                }
            };
        }
    }
);