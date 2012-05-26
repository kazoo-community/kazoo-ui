winkstart.module('developer', 'api', {

        subscribe: {
             'api.activate' : 'activate',
             'api.render' : 'render_api'
        },

        templates: {
            api: 'tmpl/api.html',
            form: 'tmpl/form.html',
            schema: 'tmpl/schema.html'
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
    },
    {

        render_api: function(args) {
            var THIS = this,
                form_html = null,
                schema_html = null,
                rest = {
                    'get': {
                        btn: 'info'
                    },
                    'post': {
                        btn: 'success'
                    },
                    'put': {
                        btn: ''
                    },
                    'delete': {
                        btn: 'danger'
                    }
                };

            winkstart.request(true, 'api.show', {
                    api_url: 'http://192.168.1.42:8000',
                    id: args.id
                },
                function(data, status) {

                    console.log(data);

                    THIS.schema_to_template(data.data.properties, function(required, not_required, schema) {
                        form_html =  THIS.templates.form.tmpl({
                            title: data.data.id,
                            api_url: winkstart.apps.developer.api_url,
                            rest: rest
                        });

                        schema_html = THIS.templates.schema.tmpl({
                            required: required,
                            not_required: not_required
                        });

                    });

                    $('*[rel=popover]:not([type="text"])', form_html).popover({
                        trigger: 'hover'
                    });

                    $('*[rel=popover][type="text"]', form_html).popover({
                        trigger: 'focus'
                    });

                    winkstart.accordion(form_html, false);

                    $('.try', form_html).click(function(e){
                        e.preventDefault();

                        console.log($(this).data('rest'));
                    });

                    $('#api-view')
                        .empty()
                        .append(form_html);

                    $('.rest', form_html)
                        .empty()
                        .append(schema_html);
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

        render_list: function(parent){
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

        activate: function(parent) {
            var THIS = this,
               api_html = THIS.templates.api.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(api_html);

            THIS.render_list(api_html);
        }
    }
);