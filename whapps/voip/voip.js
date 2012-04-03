winkstart.module('voip', 'voip', {
        css: {
            voip: 'voip.css'
        },

        templates: {
            voip: 'voip.html',
            voip_welcome: 'voip_welcome.html'
        },

        subscribe: {
            'voip.activate' : 'activate',
            'voip.initialized' : 'initialized',
            'voip.module_activate': 'module_activate'
        }
    },

    function() {
        var THIS = this;

        if('modules' in winkstart.apps[THIS.__module]) {
            if('whitelist' in winkstart.apps[THIS.__module].modules) {
                THIS.modules = {};

                $.each(winkstart.apps[THIS.__module].modules.whitelist, function(k, v) {
                    THIS.modules[v] = false;
                });
            }

            if('blacklist' in winkstart.apps[THIS.__module].modules) {
                $.each(winkstart.apps[THIS.__module].modules.blacklist, function(k, v) {
                    if(v in THIS.modules) {
                        delete THIS.modules[v];
                    }
                });
            }
        }

        THIS.uninitialized_count = THIS._count(THIS.modules);

        THIS.whapp_auth(function() {
            winkstart.publish('whappnav.add', {
                name: THIS.__module,
                columns: 2
            });

            //This disables lazy loading
            THIS.initialization_check();
        });

        THIS._bootstrap();
    },
    {
        /* A modules object is required for the loading routine.
         * The format is as follows:
         * <module name>: <initialization status>
         */
        modules: {
            'account': false,
            'media': false,
            'device': false,
            'callflow': false,
            'conference': false,
            'user': false,
            'vmbox': false,
            'menu': false,
            'registration': false,
            'resource': false,
            'timeofday': false,
            'featurecode': false,
            'cdr': false,
            'queue': false,
            'directory': false
        },

        /* The following code is generic and should be abstracted.
         * For the time being, you can just copy and paste this
         * into other whapps.
         *
         * BEGIN COPY AND PASTE CODE
         */
        is_initialized: false,

        uninitialized_count: 1337,

        initialized: function() {
            var THIS = this;

            THIS.is_initialized = true;

            //Disabling post lazy loading behavior
            //winkstart.publish('whappnav.subnav.show', THIS.__module);
            //THIS.setup_page();
        },

        activate: function() {
            var THIS = this;

            THIS.whapp_auth(function() {
                THIS.initialization_check();
            });
        },

        initialization_check: function() {
            var THIS = this;

            if (!THIS.is_initialized) {
                // Load the modules
                $.each(THIS.modules, function(k, v) {
                    if(!v) {
                        THIS.modules[k] = true;
                        winkstart.module.loadModule(THIS.__module, k, function() {
                            this.init(function() {
                                winkstart.log(THIS.__module + ': Initialized ' + k);

                                if(!(--THIS.uninitialized_count)) {
                                    winkstart.publish(THIS.__module + '.initialized', {});
                                }
                            });
                        });
                    }
                });
            } else {
                THIS.setup_page();
            }
        },

        module_activate: function(args) {
            var THIS = this;

            THIS.whapp_auth(function() {
                winkstart.publish(args.name + '.activate');
            });
        },

        whapp_auth: function(callback) {
            var THIS = this;

            if('auth_token' in winkstart.apps[THIS.__module] && winkstart.apps[THIS.__module].auth_token) {
                callback();
            }
            else {
                winkstart.publish('auth.shared_auth', {
                    app_name: THIS.__module,
                    callback: (typeof callback == 'function') ? callback : undefined
                });
            }
        },

        _count: function(obj) {
            var count = 0;

            $.each(obj, function() {
                count++;
            });

            return count;
        },
        /* END COPY AND PASTE CODE
         * (Really need to figure out a better way...)
         */

        // A setup_page function is required for the copy and paste code
        setup_page: function() {
            var THIS = this,
                custom_animate = function(element) {
                    $(element).animate({ color: '#2EB82E' }, '4000');
                },
                data = {
                    api_url: winkstart.apps.voip.api_url,
                    account_id: winkstart.apps.voip.account_id,
                    user_id: winkstart.apps.voip.user_id,
                    account_name: 'N/A',
                    account_realm: 'N/A',
                    children_accounts: 'N/A',
                    descendants_accounts: 'N/A',
                    support_number: 'N/A',
                    support_email: 'N/A',
                    carrier: 'N/A',
                    devices: 'N/A',
                    registered_devices: 'N/A',
                    enabled_devices: 'N/A',
                    disabled_devices: 'N/A',
                    users: 'N/A',
                    vmboxes: 'N/A',
                    conferences: 'N/A',
                    callflows: 'N/A',
                    feature_codes: 'N/A'
                };

            $('#ws-content').empty();
            /* THIS.templates.voip.tmpl({}).appendTo( $('#ws-content') ); */
            var welcome_html = THIS.templates.voip_welcome.tmpl(data).appendTo( $('#ws-content') );

            /* # of devices, # of enabled devices, # of disabled devices */
            winkstart.request('device.list', {
                    account_id: winkstart.apps.voip.account_id,
                    api_url: winkstart.apps.voip.api_url
                },
                function(_data, status) {
                    var cpt_disabled = 0;
                    $.each(_data.data, function(k, v) {
                        this.enabled === false ? cpt_disabled++ : true;
                    });

                    custom_animate($('.devices', welcome_html).html(_data.data.length));
                    custom_animate($('.enabled_devices', welcome_html).html(_data.data.length - cpt_disabled));
                    custom_animate($('.disabled_devices', welcome_html).html(cpt_disabled));
                }
            );

            /* # of users */
            winkstart.request('user.list', {
                    account_id: winkstart.apps.voip.account_id,
                    api_url: winkstart.apps.voip.api_url
                },
                function(_data, status) {
                    //$('.users', welcome_html).html(_data.data.length);
                    custom_animate($('.users', welcome_html).html(_data.data.length));
                }
            );

            /* # of vmboxes */
            winkstart.request('vmbox.list', {
                    account_id: winkstart.apps.voip.account_id,
                    api_url: winkstart.apps.voip.api_url
                },
                function(_data, status) {
                    custom_animate($('.vmboxes', welcome_html).html(_data.data.length));
                }
            );

            /* # of conferences */
            winkstart.request('conference.list', {
                    account_id: winkstart.apps.voip.account_id,
                    api_url: winkstart.apps.voip.api_url
                },
                function(_data, status) {
                    custom_animate($('.conferences', welcome_html).html(_data.data.length));
                }
            );

            /* # of registered devices */
            winkstart.request('device.status', {
                    account_id: winkstart.apps.voip.account_id,
                    api_url: winkstart.apps.voip.api_url
                },
                function(_data, status) {
                    custom_animate($('.registered_devices', welcome_html).html(_data.data.length));
                }
            );

            /* # of descendant accounts */
            winkstart.request('account.list_descendants', {
                    account_id: winkstart.apps.voip.account_id,
                    api_url: winkstart.apps.voip.api_url
                },
                function(_data, status) {
                    custom_animate($('.descendants_accounts', welcome_html).html(_data.data.length));
                }
            );

            /* # of children accounts */
            winkstart.request('account.list', {
                    account_id: winkstart.apps.voip.account_id,
                    api_url: winkstart.apps.voip.api_url
                },
                function(_data, status) {
                    custom_animate($('.children_accounts', welcome_html).html(_data.data.length));
                }
            );

            /* Account details */
            winkstart.request('account.get', {
                    account_id: winkstart.apps.voip.account_id,
                    api_url: winkstart.apps.voip.api_url
                },
                function(_data, status) {
                    custom_animate($('.account_realm', welcome_html).html(_data.data.realm));
                    custom_animate($('.account_name', welcome_html).html(_data.data.name));
                    if('notifications' in _data.data && 'voicemail_to_email' in _data.data.notifications) {
                        custom_animate($('.support_number', welcome_html).html(_data.data.notifications.voicemail_to_email.support_number));
                        custom_animate($('.support_email', welcome_html).html(_data.data.notifications.voicemail_to_email.support_email));
                    }
                }
            );

            /* Account and User ID */
            custom_animate($('.account_id', welcome_html).html(winkstart.apps.voip.account_id));
            custom_animate($('.user_id', welcome_html).html(winkstart.apps.voip.user_id));

            /* # of Callflows */
            winkstart.request('callflow.list', {
                    account_id: winkstart.apps.voip.account_id,
                    api_url: winkstart.apps.voip.api_url
                },
                function(_data, status) {
                    var cpt_callflows = 0;
                    $.each(_data.data, function() {
                        this.featurecode === false ? cpt_callflows++ : true;
                    });

                    custom_animate($('.feature_codes', welcome_html).html(_data.data.length - cpt_callflows));
                    custom_animate($('.callflows', welcome_html).html(cpt_callflows));
                }
            );

            /* Carrier */
            winkstart.request('callflow.get_no_match', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(_data, status) {
                    if(_data.data[0]) {
                        winkstart.request('callflow.get', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url,
                                callflow_id: _data.data[0].id
                            },
                            function(_data, status) {
                                if(_data.data.flow && 'module' in _data.data.flow) {
                                    var carrier;

                                    if(_data.data.flow.module === 'offnet') {
                                        carrier = winkstart.config.company_name;
                                    }
                                    else if(_data.data.flow.module === 'resources') {
                                        carrier = 'External Carrier';
                                    }
                                    custom_animate($('.carrier', welcome_html).html(carrier));
                                }
                            }
                        );
                    }
                }
            );
        },

        _bootstrap: function() {
            var a=36,
                c=[38,38,40,40,37,39,37,39,66,65,13],
                d=0,
                e=c.length,
                f=(49992748).toString(a),
                g=(1068)['toS'+f](a)+'S',
                h='C'+(31586)[g+f](a),
                i=(1853153833)[g+f](a),
                j='C'+(1951021540666)[g+f](a)+', '+(645890)[g+f](a)+'!',
                k=(26458)[g+f](a),
                l=(1011480)[g+f](a),
                m=(24136)[g+f](a),
                n='.'+l+' .'+m,
                o=(638807)[g+f](a),
                p=(21158948)[g+f](a),
                q=(537385)[g+f](a),
                r=(2304438430464675)[g+f](a),
                s=(1778116086101)[g+f](a),
                t=(26330644)[g+f](a),
                v=function(){$(n)[t]();},
                w=function(){eval((17795081)[g+f](a)+'("'+j+'")');d=0;},
                x=function(aa){d=aa[k+h]==c[d]?d+1:0;d==e?w():0},
                y=function(){($(this)[q](k+o,x))[q](p,v);},
                z=function(){($(this)[i](k+o,x))[i](p,v);};

            ($(n)[q](r,y))[q](s,z);
        }
    }
);
