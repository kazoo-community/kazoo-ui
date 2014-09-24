/**
 * Integrates the ctxSip softphone (https://github.com/collecttix/ctxSip) into Kazoo,
 * and provides call event notification to listeners.
 * - Allows other whapps to initiate calls via the softphone.
 * - Publishes an event on incoming call.
 * - Allows interested parties to bind to SIP.js call events.
 *
 * Author: Sam Metson (https://github.com/Bat-o-matic)
 */

winkstart.module('browserphone', 'browserphone', {
        subscribe: {
            'browserphone.activate' : 'activate',
            'browserphone.initialized' : 'initialized',
            'browserphone.module_activate': 'module_activate',
            'browserphone.make_call': 'make_call' // allows other whapps to make calls from the softphone.
        },

        css: [
            'css/credentials_popup.css',
        ],

        templates: {
            credentials_popup: 'tmpl/credentials_popup.html'
        },

        resources: {
            'account.get': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'account.get_registered_devices': {
                url: '{api_url}/accounts/{account_id}/devices/status',
                contentType: 'application/json',
                verb: 'GET'
            },

            'user.get': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'GET'
            },

            'user.update': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'POST'
            },

            'user_device.get': {
                url: '{api_url}/accounts/{account_id}/devices/{device_id}',
                contentType: 'application/json',
                verb: 'GET'
            },

            'user_device.create': {
                url: '{api_url}/accounts/{account_id}/devices',
                contentType: 'application/json',
                verb: 'PUT'
            }
        }
    },

    function() {
        var THIS = this;

        THIS.module = 'browserphone';
        winkstart.registerResources(this.__whapp, this.config.resources);

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
                weight: 0 /* TODO: Whapps are displayed from left to right depending on their weight (higher weight are on the right) */
            });

            //This disables lazy loading
            THIS.initialization_check();
        });

        THIS.whapp_config();

        winkstart.publish('browserphone.loaded');
    },
    {
        /* A modules object is required for the loading routine.
         * The format is as follows:
         * <module name>: <initialization status>
         */
        modules: {},

        /* The following code is generic and should be abstracted.
         * For the time being, you can just copy and paste this
         * into other whapps.
         *
         * BEGIN COPY AND PASTE CODE
         */
        is_initialized: true,

        uninitialized_count: 1337,

        initialized: function() {
            var THIS = this;

            THIS.is_initialized = true;

            if(winkstart.apps['browserphone']['default']) {
                $('[data-whapp="browserphone"] > a').addClass('activate');
                THIS.setup_page();
            }
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
                        winkstart.module(THIS.__module, k).init(function() {
                            winkstart.log(THIS.__module + ': Initialized ' + k);

                            if(!(--THIS.uninitialized_count)) {
                                winkstart.publish(THIS.__module + '.initialized', {});
                            }
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

        whapp_config: function() {
            var THIS = this;

            /* Uncomment if you want this whapp to be masqueradable
            winkstart.apps['browserphone'] = $.extend(true, {
                is_masqueradable: true
            }, winkstart.apps['browserphone']);
            */
        },

        /* A setup_page function is required for the copy and paste code */
        setup_page: function() {
            var THIS = this;

            // winkstart.publish('browserphone.module_activate', {name: 'softphone'});
            THIS.maybe_start_softphone();
        },
        /* End copy and paste */

////////////////////////////////////////////////////////////////////////////////

        /* Resources callbacks */
        get_account: function(success, error) {
            winkstart.request('account.get', {
                    api_url    : winkstart.apps['browserphone'].api_url,
                    account_id : winkstart.apps['browserphone'].account_id,
                },
                function(_data, status) {
                    if(typeof success === 'function') {
                        success(_data, status);
                    }
                },
                function(_data, status) {
                    if(typeof error === 'function') {
                        error(_data, status);
                    }
                }
            );
        },

        get_registered_devices: function(success, error) {
            winkstart.request('account.get_registered_devices', {
                    api_url    : winkstart.apps['browserphone'].api_url,
                    account_id : winkstart.apps['browserphone'].account_id,
                },
                function(_data, status) {
                    if(typeof success === 'function') {
                        success(_data, status);
                    }
                },
                function(_data, status) {
                    if(typeof error === 'function') {
                        error(_data, status);
                    }
                }
            );
        },

        get_user: function(success, error) {
            winkstart.request('user.get', {
                    api_url    : winkstart.apps['browserphone'].api_url,
                    account_id : winkstart.apps['browserphone'].account_id,
                    user_id    : winkstart.apps['browserphone'].user_id
                },
                function(_data, status) {
                    if(typeof success === 'function') {
                        success(_data, status);
                    }
                },
                function(_data, status) {
                    if(typeof error === 'function') {
                        error(_data, status);
                    }
                }
            );
        },

        update_user: function(data, success, error) {
            winkstart.request('user.update', {
                    api_url: winkstart.apps['browserphone'].api_url,
                    account_id : winkstart.apps['browserphone'].account_id,
                    user_id    : winkstart.apps['browserphone'].user_id,
                    data       : data || {}
                },
                function(_data, status) {
                    if(typeof success === 'function') {
                        success(_data, status);
                    }
                },
                function(_data, status) {
                    if(typeof error === 'function') {
                        error(_data, status);
                    }
                }
            );
        },

        get_device: function(device_id, success, error) {
            winkstart.request('user_device.get', {
                    api_url    : winkstart.apps['browserphone'].api_url,
                    account_id : winkstart.apps['browserphone'].account_id,
                    api_url    : winkstart.apps['browserphone'].api_url,
                    device_id  : device_id
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
        },

        create_browserphone_device: function(data, success, failure) {
            winkstart.request('user_device.create', {
                    api_url    : winkstart.apps['browserphone'].api_url,
                    account_id : winkstart.apps['browserphone'].account_id,
                    api_url    : winkstart.apps['browserphone'].api_url,
                    data       : data || {}
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
        },


        /**
         * Generic error popup.
         */
        browserphone_error: function(error_msg, data, status) {
            // @todo More information.
            winkstart.alert(error_msg);
        },

        /**
         * Starts the softphone, or focuses it if it is already started.
         */
        maybe_start_softphone: function(callback) {
            var THIS = this,
                features = 'menubar=no,location=no,resizable=no,scrollbars=no,status=no,addressbar=no,width=320,height=480';


            if (THIS.phoneWindow === undefined || !THIS.phoneWindow || THIS.phoneWindow.closed) {
                THIS.get_sip_credentials(function(user, _status) {
                    localStorage.setItem('SIPCreds', JSON.stringify(user));
                    THIS.phoneWindow = window.open('js/external/phone', 'ctxPhone', features);

                    // Handle popup blockers. Phone will work, but won't be linked to window.
                    if (THIS.phoneWindow === undefined) {
                        THIS.browserphone_error('To ensure your browserphone works correctly, please enable popups for this site.');
                    }
                    else {
                        $(THIS.phoneWindow).load(function() {
                            THIS.phoneWindow.ctxSip.phone.on('invite',
                                function(evt){
                                    THIS.incoming_call(evt);
                                }
                            );

                            if (typeof callback === 'function') {
                                callback();
                            };
                        });

                        $(window).unload(function() {
                            THIS.phoneWindow.ctxSip.phone.unregister();
                            THIS.phoneWindow.close();
                        });
                    }
                });
            } else {
                THIS.phoneWindow.focus();
                if (typeof callback === 'function') {
                    callback();
                };
            }
        },

        /**
         * Obtain this user's softphone credentials or create a new softphone.
         */
        get_sip_credentials: function(success) {
            var device_id,
                device_data
                THIS  = this,
                // Success/error callbacks
                fnSuccess = function(data) {
                    if (typeof success === 'function') {
                        success(data);
                    }
                },
                // Failure returns a function, so we can pass the error message into it.
                fnFailure = function(error_msg) {
                    return function(data, status) {
                        THIS.browserphone_error(error_msg, data, status);
                    }
                },

            // Get user doc, check for existing softphone.
            THIS.get_user(
                function(user_data) {
                    // Create phone if !exists.
                    if ('browserphone_id' in user_data.data && user_data.data.browserphone_id) {
                        device_id = user_data.data.browserphone_id;
                        THIS.get_registered_devices(
                            function(reg_data) {
                                // Check if registered devices contains user's browserphone.
                                var is_reg = false;

                                $.each(reg_data.data, function(index, val) {
                                    is_reg = is_reg || (val.device_id === device_id && val.registered);
                                });

                                if (is_reg) {
                                    // Browserphone is registered elsewhere, prompt user for new credentials.
                                    THIS.popup_get_credentials(fnSuccess);
                                }
                                else {
                                    // Get credentials from device.
                                    THIS.get_device(device_id,
                                        function(data) {
                                            THIS.creds_from_device_data(data, fnSuccess);
                                        },
                                        function(data, status) {
                                            delete user_data.data.browserphone_id;
                                            THIS.update_user(user_data.data);
                                            THIS.browserphone_error('Could not retrieve browserphone device info', data, status);
                                        }
                                    );
                                };
                            },
                            fnFailure('Could not retrieve browserphone registration info')
                        );
                    } else {
                        // Create device.
                        device_data = THIS.new_browserphone_data(user_data.data);
                        THIS.create_browserphone_device(device_data,
                            function(data) {
                                user_data.data.browserphone_id = data.data.id;
                                THIS.update_user(user_data.data);
                                THIS.creds_from_device_data(data, fnSuccess);
                            },
                            fnFailure('Could not create browserphone device')
                        );
                    }
                },
                fnFailure('Could not retrieve user data')
            );
        },

        /**
         * Pops up a window that prompts the user to enter credentials.
         *
         * Called when the browserphone is registered elswhere already.
         */
        popup_get_credentials: function(success) {
            var dialog,
                credentials_data,
                THIS       = this,
                errors     = '',
                popup_html = THIS.templates.credentials_popup.tmpl();

            var fnShow = function() {
                dialog = winkstart.dialog(popup_html, {
                    title: 'Enter SIP Credentials'
                });
            };

            // Prepopulate realm if possible.
            THIS.get_account(function(account_data, status) {
                    $('#Realm', popup_html).val(account_data.data.realm);
                    fnShow();
                },
                fnShow
            );

            $('.submit', popup_html).click(function(ev) {
                ev.preventDefault();
                credentials_data = form2object('credentials');

                // Validate !empty fields
                errors = '';
                $('.invalid').removeClass('invalid');
                $.each(credentials_data, function(index, el) {
                    if (el === '') {
                        errors += index + ': Field is empty. <br/>';
                        $('#'+index).addClass('invalid');
                    }
                });

                if (errors === '') {
                    credentials_data.WSServer = winkstart.config.ws_server;

                    dialog.dialog('close');
                    success(credentials_data);
                }
                else {
                    THIS.browserphone_error(errors);
                }
            });
        },

        /**
         * Creates the initial data for a new browserphone.
         */
        new_browserphone_data: function(user) {
            // @todo Extract defaults into config, so they can be reused here
            // and in device.js
            var device_name = user.first_name + ' ' + user.last_name + '\'s Browserphone',
                device = {
                sip : {
                    username       : 'user_' + winkstart.random_string(6),
                    password       : winkstart.random_string(12),
                    invite_format  : 'username',
                    method         : 'password',
                    expire_seconds : '360'
                },
                media : {
                    secure_rtp   : 'none',
                    peer_to_peer : 'false',
                    audio : {
                        codecs: ['PCMU', 'PCMA']
                    },
                    video : {
                        codecs: []
                    },
                    fax : {
                        option : 'true'
                    },
                    fax_option : true
                },
                call_forward  : {},
                music_on_hold : {},
                owner_id      : user.id,
                name          : device_name
            };

            return device;
        },

        /**
         * Extracts credentials from the result of an API call to /devices/{id}.
         */
        creds_from_device_data: function(device, callback) {
            var user = {};

            user.User     = device.data.sip.username,
            user.Pass     = device.data.sip.password,
            user.WSServer = winkstart.config.ws_server

            // Try and get realm from account document.
            THIS.get_account(
                function(account_data, status) {
                    user.Realm = account_data.data.realm;
                    callback(user);
                },
                function(_data, status) {
                    // @todo Could ask user to manually enter realm.
                    THIS.browserphone_error('Could not retrieve account realm data');
                }
            );
        },

        /**
         * Makes a call to the target number or SIP endpoint.
         *
         * Also takes an array of events (see SIP.js' session event types) and
         * a callback that is called when those events are triggered.
         */
        make_call: function(target, publish, events) {
            var session,
                THIS = this;

            THIS.maybe_start_softphone(function() {
                session = THIS.phoneWindow.ctxSip.sipCall(target);
                // @todo Do we want to bind here, or only on publish?
                THIS.bind_call_events(session, publish, events);
            });
        },

        /**
         * Binds a callback to a number of events to a SIP.js session object.
         *
         * Takes a function and a list of event types to bind that callback to.
         * The callback is called as publish(event_name, event_data).
         */
        bind_call_events: function(session, publish, events) {
            if (session != null && typeof publish === 'function') {
                $.each(events, function(index, evt) {
                    session.on(evt, function(event) {
                        publish(evt, event);
                    });
                });
            }
        },

        /**
         * Publishes a notification when an incoming call is received.
         *
         * Notifies subscribers that a call has been received, and allows them
         * to bind to events on that call.
         */
        incoming_call: function(session) {
            var bindCallback,
                THIS = this;

            THIS.phoneWindow.focus();

            // bindCallback allows subscribers to bind to events on this call.
            bindCallback = function(publish, events) {
                THIS.bind_call_events(session, publish, events);
            }

            // @todo Don't pass full session, just caller data.
            winkstart.publish('browserphone.incoming_call', session, bindCallback);
        },

        /**
         * Allows subscribers to be notified when a call is made from the browserphone.
         *
         * Warning: If your whapp started the call (via the 'browserphone.make_call' event),
         * be careful not to bind to events on the same call twice!
         * @todo Hook into the ctx phone so that this event actually fires!
         */
        outgoing_call: function(session) {
            var bindCallback,
                THIS = this;
            // bindCallback allows subscribers to bind to events on this call.
            bindCallback = function(publish, events) {
                THIS.bind_call_events(session, publish, events);
            }
            winkstart.publish('browserphone.outgoing_call', session, bindCallback);
        }
    }
);
