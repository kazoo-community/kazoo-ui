winkstart.module('myaccount', 'myaccount', {
        css: [
            'css/style.css',
            'css/popups.css'
        ],

        templates: {
            myaccount: 'tmpl/myaccount.html',
            tab_module: 'tmpl/tab_module.html'
        },

        subscribe: {
            'myaccount.activate' : 'activate',
            'myaccount.initialized' : 'initialized',
            'myaccount.module_activate': 'module_activate',
            'myaccount.display': 'render_myaccount',
            'nav.my_account_click': 'my_account_click'
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
    },
    {
        list_submodules: {
            list: []
        },

        /* A modules object is required for the loading routine.
         * The format is as follows:
         * <module name>: <initialization status>
         */
        modules: {
            'app_store': false,
            'billing': false,
            'personal_info': false
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

            winkstart.publish('myaccount.define_submodules', THIS.list_submodules);

            THIS.list_submodules.list.sort();

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

            winkstart.publish('myaccount.display');
        },

        my_account_click: function() {
            winkstart.publish('myaccount.activate');
        },

        render_myaccount: function() {
            var THIS = this,
                popup;

            var template_data = {
                data: {
                    list_module: THIS.list_submodules
                }
            };

            popup_html = THIS.templates.myaccount.tmpl({ data: { list_module: THIS.list_submodules } }),

            $.each(THIS.list_submodules.list, function(k, v) {
                var template_data = {
                    data: {
                        key: v,
                        display_name: THIS.list_submodules[v].display_name
                    }
                }

                $('.settings_tabs', popup_html).append(THIS.templates.tab_module.tmpl(template_data));
            });

            $('#tabs > ul a', popup_html).click(function(ev) {
                ev.preventDefault();

                $('#tabs > ul a').removeClass('current');
                $(this).addClass('current');

                winkstart.publish($(this).dataset('submodule') + '.activate', { target: $('#content', popup_html) });
            });

            $('#tabs > ul a', popup_html).first().trigger('click');

            popup = winkstart.dialog(popup_html, {
                height: 'auto',
                modal: true,
                title: 'My account',
                open: function() {
                    // Gross hack to prevent scroll bar glitch (should be in the css sheet)
                    $(this).css('overflow-x', 'hidden');
                    $(this).css('max-height', $(document).height()-180);
                }
            });
        }
    }
);
