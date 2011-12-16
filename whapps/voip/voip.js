// This is the VoIP Services base application
winkstart.module('voip', 'voip', {
        css: {
            voip: 'voip.css'
        },

        templates: {
            voip: 'voip.html'
        },

        subscribe: {
            'voip.activate' : 'activate',
            'voip.initialized' : 'initialized',
            'voip.module_activate': 'module_activate'
        }
    },
    /* The code in this initialization function is required for
     * loading routine.
     */
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
            winkstart.publish('appnav.add', { 'name' : THIS.__module });
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
            'featurecode': false
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

            winkstart.publish('subnav.show', THIS.__module);

            THIS.setup_page();
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
            var THIS = this; 

            $('#ws-content').empty();
            THIS.templates.voip.tmpl({}).appendTo( $('#ws-content') );
            
            $('#cur_api_url').append('You are currently using the API on: <b>'+ winkstart.apps['voip'].api_url +'</b>');

            // Link the main buttons
            $('.options #users').click(function() {
                winkstart.publish('user.activate');
            });

            $('.options #devices').click(function() {
                winkstart.publish('device.activate');
            });

            $('.options #users').click(function() {
                winkstart.publish('user.activate');
            });

            $('.options #auto_attendant').click(function() {
                winkstart.publish('menu.activate');
            });

            $('.options #ring_groups').click(function() {
                winkstart.publish('callflow.activate');
            });

            $('.options #conferences').click(function() {
                winkstart.publish('conference.activate');
            });

            $('.options #registrations').click(function() {
                winkstart.publish('registration.activate');
            });

            $('.options #stats').click(function() {
                winkstart.publish('stats.activate');
            });

            $('.options #time_of_day').click(function() {
                winkstart.publish('timeofday.activate');
            });
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
