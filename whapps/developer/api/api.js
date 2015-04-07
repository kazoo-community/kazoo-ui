winkstart.module('developer', 'api', {

        subscribe: {
            'api.activate' : 'activate',
            'api.render' : 'render_api',
            'api.request' : 'send_request',
            'api.schema_to_template': 'schema_to_template'
        },

        templates: {
            api: 'tmpl/api.html',
            form: 'tmpl/form.html',
            schema: 'tmpl/schema.html',
            input_id: 'tmpl/input_id.html',
            info: 'tmpl/info_popup.html'
        },

        css: [
            'css/api.css'
        ],

        resources: {
            'api.list': {
                url: '{api_url}/schemas',
                contentType: 'application/json',
                verb: 'GET'
            },
            'api.show': {
                url: '{api_url}/schemas/{id}',
                contentType: 'application/json',
                verb: 'GET'
            }
        }
    },

    function(args) {
        var THIS = this;
		
		THIS.module = 'api';

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        THIS.ressources();
    },
    {
        clean_form: function(obj) {
            var THIS = this,
                isEmpty = function (o) {
                    for(var i in o) {return false;}
                    return true;
                };

            $.each(obj, function(k, o) {
                if(typeof o == "object") {
                    if(isEmpty(o)) {
                        delete obj[k];
                    } else {
                        obj[k] = THIS.clean_form(o);
                        if(isEmpty(obj[k])) {
                            delete obj[k];
                        }
                    }
                } else {
                    if(o == "") {
                        delete obj[k];
                    }
                }
            });

            return obj;
        },

        send_request: function(api, verb, data, success, failed) {
            var THIS = this,
                request = {
                    account_id: winkstart.apps['developer'].account_id,
                    api_url: winkstart.apps['developer'].api_url,
                },
                _data = {};

            $.extend(true, _data, data);

            if(_data.id) {
                request.id = _data.id;
                delete _data.id;
            }
            request.data = _data

            if(typeof success == "function" && typeof failed == "function") {
                winkstart.request('developer.' + api + '.' + verb,
                    request,
                    success,
                    failed
                );
            }
        },

        build_url: function(api, id, verb, data) {
            var THIS = this,
                url = "";

            url += winkstart.config.fake_api_url || winkstart.apps['developer'].api_url;
            url += THIS.apis[api].ressources['developer.' + id + "." + verb].url
                        .substr(9)
                        .replace("{account_id}", winkstart.apps['developer'].account_id)
                        .replace("{id}", data.id);

            return url;
        },

        build_curl: function(verb, url, data) {
            var THIS = this,
                curl = "",
                rest = {
                    get_all: 'GET',
                    get: 'GET',
                    put: 'PUT',
                    post: 'POST',
                    'delete': 'DELETE'
                },
                _data = {};

            curl += 'curl -i -H "Accept: application/json" -H "Content-Type: application/json"';
            curl += ' -H "X-Auth-Token: ' + winkstart.apps['developer'].auth_token + '"';
            curl += ' -X ' + rest[verb];

            $.extend(true, _data, data);
            delete _data.id;

            if(Object.getOwnPropertyNames(_data).length != 0) {
                var obj = {
                    "data": data,
                    "verb": rest[verb]
                };
                curl += ' -d \'' + winkstart.jsonToString(obj) + '\'';
            }

            curl += ' ' + url;

            return curl;
        },

        render_api: function(args) {
            var THIS = this,
                form_html = null,
                not_required_schema_html = null,
                required_schema_html = null,
                info_html = THIS.templates.info.tmpl({
                    developer: {
                        api_url: winkstart.config.fake_api_url || winkstart.apps['developer'].api_url,
                        auth_token: winkstart.apps['developer'].auth_token,
                        account_id: winkstart.apps['developer'].account_id
                    },
					_t: function(param){
						return window.translate['api'][param];
					}
                }),
                input_id_html = THIS.templates.input_id.tmpl();

            winkstart.request('api.show', {
                    api_url: winkstart.apps['developer'].api_url,
                    id: args.id
                },
                function(data, status) {

                    if(THIS.apis[data.data.id]){
                        winkstart.registerResources(THIS.__whapp, THIS.apis[data.data.id].ressources);
                    } else {
                        winkstart.alert('Api ' + data.data.id + ' not available');
                        return false;
                    }

                    winkstart.publish('api.schema_to_template', data.data.properties, function(required, not_required, schema) {

                        form_html =  THIS.templates.form.tmpl({
                            title: THIS.apis[data.data.id].title,
                            apis: THIS.apis[data.data.id].api,
                            ressources: THIS.apis[data.data.id].ressources,
                            rests: THIS.rest,
							_t: function(param){
								return window.translate['api'][param];
							}
                        });

                        not_required_schema_html = THIS.templates.schema.tmpl({
                            schema: not_required,
                            hide: true
                        });

                        required_schema_html = THIS.templates.schema.tmpl({
                            schema: required
                        });

                        $('.toggle', form_html).click(function() {
                            var $header = $(this).parent('.whapp-header');
                            (!$header.hasClass('active')) ? $header.addClass('active') : $header.removeClass('active');
                        });

                        $('.try', form_html).click(function(e) {
                            e.preventDefault();

                            var id = $(this).data('id'),
                                verb = $(this).data('verb'),
                                id_verb = id + "_" + verb,
                                form_data = THIS.clean_form(form2object(id_verb + "_form")),
                                url = THIS.build_url(data.data.id, id, verb, form_data),
                                curl = THIS.build_curl(verb, url, form_data);

                            var print_result = function(_data) {
                                var $curl = $('<pre>')
                                                .append(curl)
                                                .css({
                                                    cursor: 'pointer'
                                                })
                                                .click(function() {
                                                    prompt(_t('api', 'copy_paste_curl_command'), curl);
                                                });

                                    $('#' + id_verb + ' .result_content', form_html)
                                        .empty()
                                        .append('<pre>URL: ' + url + '</pre>')
                                        .append(winkstart.print_r(_data))
                                        .append($curl);

                                    $('#' + id_verb + ' .result', form_html)
                                        .show('fade');
                                };

                            winkstart.publish('api.request', id, verb, form_data,
                                function(_data, status) {
                                    print_result(_data);
                                },
                                function(_data, status) {
                                    print_result(_data);
                                }
                            );
                        });


                        $('.details', form_html).click(function(e){
                            e.preventDefault();

                            var id = $(this).data('id'),
                                state = $(this).data('state'),
                                div = $('#' + id  + ' .hide', form_html);


                                if(!state) {
                                    $(this)
                                        .data('state', true)
                                        .text(_t('api', 'hide_advanced'));
                                    div.slideDown();
                                } else {
                                     $(this)
                                        .data('state', false)
                                        .text(_t('api', 'show_advanced'));
                                    div.slideUp();
                                }
                        });

                        $('.clean', form_html).click(function(e){
                            e.preventDefault();
                            $('#' +  $(this).data('id') + ' .result', form_html)
                                .hide()
                                .find('.result_content')
                                .empty();
                        });

                        $('.api-urls', form_html).click(function(){
                            info_popup = winkstart.dialog(info_html, {
                                height: 'auto',
                                width: 400,
                                modal: true,
                                title: _t('api', 'api_information')
                            });
                        });

                        winkstart.accordion(form_html, false);

                    });

                    //Uggly Fix ...
                    $('#accounts_get .id', form_html).remove();

                    $('#api-view')
                        .empty()
                        .append(form_html);

                    $('.schema', form_html)
                        .empty()
                        .append(required_schema_html)
                        .append(not_required_schema_html);

                    $('.id', form_html)
                        .empty()
                        .append(input_id_html);

                    $('*[rel=popover]:not([type="text"])', (form_html)).popover({
                        trigger: 'hover'
                    });

                    $('*[rel=popover][type="text"]', form_html).popover({
                        trigger: 'focus'
                    });
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
                                    if(o["enum"] || !o.items || !o.items.properties ){
                                        new_schema[k] = o;
                                    } else {
                                        target[k] = {};
                                        target[k].type = 'array';
                                        clean(o.items.properties, target[k]);
                                    }
                                    break;
                                default:
                                    new_schema[k] = o;
                                    break;
                            }
                        });
                    }

                    $.extend(true, target, new_schema);
                },
                template = function (data, target, name) {
                    var new_schema = {};

                    $.each(data, function(k, o){
                        if(o.type){
                            var n = "";
                            (name) ? n = name + '.' + k : n = k;
                            o.input_name = n;
                            o.id = k;
                            new_schema[n] = o;
                        }
                    });

                    $.extend(true, target, new_schema);
                };

            try {
                clean(schema, tmp);
                template(tmp, new_schema);

                $.each(new_schema, function(k, o) {
                    if(o.required) {
                        required[k] = o;
                    } else {
                        not_required[k] = o;
                    }
                });

                if(typeof callback == "function") {
                    callback(required, not_required, new_schema, schema);
                }
            } catch(err) {
                winkstart.alert('error', _t('api', 'something_went_wrong'))
            }
        },

        render_list: function(parent) {
            var THIS = this;

            winkstart.request(true, 'api.list', {
                    api_url: winkstart.apps['developer'].api_url
                },
                function(data, status) {
                    var map_crossbar_data = function(data) {
                        var new_list = [];

                        if(data.length > 0) {
                            $.each(data, function(key, val) {
                                if(THIS.apis[val]) {
                                    new_list.push({
                                        id: val,
                                        title: THIS.apis[val].title || '(name)'
                                    });
                                }
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
                            label: _t('api', 'apis_developer_label'),
                            identifier: 'api-listview',
                            new_entity_label: _t('api', 'apis_developer'),
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
        },

        ressources: function() {
            var THIS = this,
                ressources_schema = function(id, title, rest) {
                    var REST = {
                        get_all: 'GET',
                        get: 'GET',
                        put: 'PUT',
                        post: 'POST',
                        'delete': 'DELETE'
                    };

                    THIS.apis[id] = {
                        title: title,
                        api: {},
                        ressources: {}
                    };


                    THIS.apis[id].api[id] = {
                        verbs: rest,
                        title: title,
                        url: '/' + id
                    };

                    $.each(rest, function(k, v){
                        var tmp = "";

                        if(v == "get" || v == "post"  || v == "delete" ){
                            tmp = "/{id}";
                        }

                        THIS.apis[id].ressources['developer.' + id + '.' + v] = {
                            url: '{api_url}/accounts/{account_id}/' + id + tmp,
                            contentType: 'application/json',
                            verb: REST[v]
                        };
                    });
                },
                normal_apis = {
                    menus: {
                        title: _t('api', 'menus'),
                        verbs: ['get_all', 'get', 'put', 'post', 'delete']
                    },
                    vmboxes: {
                        title: _t('api', 'vmboxes'),
                        verbs: ['get_all', 'get', 'put', 'post', 'delete']
                    },
                    callflows: {
                        title: _t('api', 'callflows'),
                        verbs: ['get_all', 'get', 'put', 'post', 'delete']
                    },
                    conferences: {
                        title: _t('api', 'conferences'),
                        verbs: ['get_all', 'get', 'put', 'post', 'delete']
                    },
                    directories: {
                        title: _t('api', 'directories'),
                        verbs: ['get_all', 'get', 'put', 'post', 'delete']
                    },
                    queues: {
                        title: _t('api', 'queues'),
                        verbs: ['get_all', 'get', 'put', 'post', 'delete']
                    },
                    resources: {
						title: _t('api', 'resources'),
                        verbs: ['get_all', 'get', 'put', 'post', 'delete']
                    },
                    temporal_rules: {
                        title: _t('api', 'temporal_rules'),
                        verbs: ['get_all', 'get', 'put', 'post', 'delete']
                    },
                    phone_numbers: {
                        title: _t('api', 'phone_numbers'),
                        verbs: ['get_all', 'post', 'delete']
                    },
                    limits: {
                        title: _t('api', 'limits'),
                        verbs: ['get_all']
                    },
                    user_auth: {
                        title: _t('api', 'user_auth'),
                        verbs: ['put']
                    }
                };

            THIS.rest = {
                'get_all': {
                    btn: 'primary'
                },
                'get': {
                    btn: 'info',
                    'class': ['id']
                },
                'put': {
                    btn: 'success',
                    'class': ['schema']
                },
                'post': {
                    btn: '',
                    'class': ['id', 'schema']
                },
                'delete': {
                    btn: 'danger',
                    'class': ['id']
                }
            };

            THIS.apis = {
                'devices': {
                    title: _t(THIS.module, 'devices'),
                    api: {
                        'devices': {
                            verbs: ['get_all', 'get', 'put', 'post', 'delete'],
                            title: _t('api', 'devices'),
                            url: '/devices'
                        },
                        'devices_status': {
                            verbs: ['get_all'],
                            title: _t('api', 'devices_status'),
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
                            url: '{api_url}/accounts/{account_id}/devices/{id}',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.devices.put': {
                            url: '{api_url}/accounts/{account_id}/devices',
                            contentType: 'application/json',
                            verb: 'PUT'
                        },
                        'developer.devices.post': {
                            url: '{api_url}/accounts/{account_id}/devices/{id}',
                            contentType: 'application/json',
                            verb: 'POST'
                        },
                        'developer.devices.delete': {
                            url: '{api_url}/accounts/{account_id}/devices/{id}',
                            contentType: 'application/json',
                            verb: 'DELETE'
                        },
                        'developer.devices_status.get_all': {
                            url: '{api_url}/accounts/{account_id}/devices/status',
                            contentType: 'application/json',
                            verb: 'GET'
                        }
                    }
                },
                'accounts': {
                    title: _t('api', 'accounts'),
                    api: {
                        'accounts': {
                            verbs: ['get', 'post'],
                            title: _t('api', 'accounts'),
                            url: '/accounts'
                        },
                        'accounts_children': {
                            verbs: ['get_all'],
                            title: _t('api', 'accounts_children'),
                            url: '/accounts/{account_id}/children'
                        },
                        'accounts_descendants': {
                            verbs: ['get_all'],
                            title: _t('api', 'accounts_descendants'),
                            url: '/accounts/{account_id}/descendants'
                        },
                        'accounts_siblings': {
                            verbs: ['get_all'],
                            title: _t('api', 'accounts_siblings'),
                            url: '/accounts/{account_id}/siblings'
                        }
                    },
                    ressources: {
                        'developer.accounts.get': {
                            url: '{api_url}/accounts/{account_id}',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.accounts.post': {
                            url: '{api_url}/accounts/{account_id}',
                            contentType: 'application/json',
                            verb: 'POST'
                        },
                        'developer.accounts_children.get_all': {
                            url: '{api_url}/accounts/{account_id}/children',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.accounts_descendants.get_all': {
                            url: '{api_url}/accounts/{account_id}/descendants',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.accounts_siblings.get_all': {
                            url: '{api_url}/accounts/{account_id}/siblings',
                            contentType: 'application/json',
                            verb: 'GET'
                        }
                    }
                },
                'users': {
                    title: _t(THIS.module, 'users'),
                    api: {
                        'users': {
                            verbs: ['get_all', 'get', 'put', 'post', 'delete'],
                            title: _t('api', 'users'),
                            url: '/users'
                        },
                        'hotdesk': {
                            verbs: ['get_all'],
                            title: _t('api', 'hotdesk'),
                            url: '/users/hotdesk'
                        }
                    },
                    ressources: {
                        'developer.users.get_all': {
                            url: '{api_url}/accounts/{account_id}/users',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.users.get': {
                            url: '{api_url}/accounts/{account_id}/users/{id}',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.users.put': {
                            url: '{api_url}/accounts/{account_id}/users',
                            contentType: 'application/json',
                            verb: 'PUT'
                        },
                        'developer.users.post': {
                            url: '{api_url}/accounts/{account_id}/users/{id}',
                            contentType: 'application/json',
                            verb: 'POST'
                        },
                        'developer.users.delete': {
                            url: '{api_url}/accounts/{account_id}/users/{id}',
                            contentType: 'application/json',
                            verb: 'DELETE'
                        },
                        'developer.hotdesk.get_all': {
                            url: '{api_url}/accounts/{account_id}/users/hotdesk',
                            contentType: 'application/json',
                            verb: 'GET'
                        }
                    }
                },
                'servers': {
                    title: _t('api', 'servers'),
                    api: {
                        'servers': {
                            verbs: ['get_all'],
                            title: _t('api', 'servers'),
                            url: '/servers'
                        },
                        'servers_deployment': {
                            verbs: ['get', 'put'],
                            title: _t('api', 'servers_deployment'),
                            url: '/servers/{id}/deployment',
                            rest: {
                                put: ['id']
                            }
                        },
                        'servers_log': {
                            verbs: ['get'],
                            title: _t('api', 'servers_log'),
                            url: '/servers/{id}/log'
                        }
                    },
                    ressources: {
                        'developer.servers.get_all': {
                            url: '{api_url}/accounts/{account_id}/servers',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.servers_deployment.get': {
                            url: '{api_url}/accounts/{account_id}/servers/{id}/deployment',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.servers_deployment.put': {
                            url: '{api_url}/accounts/{account_id}/servers/{id}/deployment',
                            contentType: 'application/json',
                            verb: 'PUT'
                        },
                        'developer.servers_log.get': {
                            url: '{api_url}/accounts/{account_id}/servers/{id}/log',
                            contentType: 'application/json',
                            verb: 'GET'
                        }
                    }
                },
		'media': {
                    title: _t(THIS.module, 'media'),
                    api: {
                        'media': {
                            verbs: ['get_all', 'get', 'put', 'post', 'delete'],
                            title: _t('api', 'media'),
                            url: '/media'
                        },
                        'languages': {
                            verbs: ['get_all'],
                            title: _t('api', 'languages'),
                            url: '/media/languages'
                        },
                        'languages_missing': {
                            verbs: ['get_all'],
                            title: _t('api', 'languages_missing'),
                            url: '/media/languages/missing'
                        }
                    },
                    ressources: {
                        'developer.media.get_all': {
                            url: '{api_url}/accounts/{account_id}/media',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.media.get': {
                            url: '{api_url}/accounts/{account_id}/media/{id}',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.media.put': {
                            url: '{api_url}/accounts/{account_id}/media',
                            contentType: 'application/json',
                            verb: 'PUT'
                        },
                        'developer.media.post': {
                            url: '{api_url}/accounts/{account_id}/media/{id}',
                            contentType: 'application/json',
                            verb: 'POST'
                        },
                        'developer.media.delete': {
                            url: '{api_url}/accounts/{account_id}/media/{id}',
                            contentType: 'application/json',
                            verb: 'DELETE'
                        },
                        'developer.languages.get_all': {
                            url: '{api_url}/accounts/{account_id}/media/languages',
                            contentType: 'application/json',
                            verb: 'GET'
                        },
                        'developer.languages_missing.get_all': {
                            url: '{api_url}/accounts/{account_id}/media/languages/missing',
                            contentType: 'application/json',
                            verb: 'GET'
                        }
                    }
                }
            };

            $.each(normal_apis, function(k, api){
                ressources_schema(k, api.title, api.verbs);
            });
        }
    }
);





















