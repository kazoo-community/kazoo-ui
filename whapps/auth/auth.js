winkstart.module('auth', 'auth',
    {
        templates: {
            thankyou: 'tmpl/thankyou.html',
            recover_password: 'tmpl/recover_password.html',
            login: 'tmpl/login.html',
            register: 'tmpl/register.html'
        },

        subscribe: {
            'auth.activate' : 'activate',
            'auth.login' : 'login',
            'auth.load_account' : 'load_account',
            'auth.recover_password' : 'recover_password',
            'auth.authenticate' : 'authenticate',
            'auth.shared_auth' : 'shared_auth',
            'auth.register' : 'register',
            'auth.save_registration' : 'save_registration'
        },

        validation: [
            { name: '#username', regex: /^[a-zA-Z0-9\_\-]{3,16}$/ }
        ],

        resources: {
            "auth.user_auth": {
                url: '{api_url}/user_auth',
                contentType: 'application/json',
                verb: 'PUT'
            },
            "auth.shared_auth": {
                url: '{api_url}/shared_auth',
                contentType: 'application/json',
                verb: 'PUT'
            },
            "auth.register": {
                url: '{api_url}/signup',
                contentType: 'application/json',
                verb: 'PUT'
            },
            "auth.activate": {
                url: '{api_url}/signup/{activation_key}',
                contentType: 'application/json',
                verb: 'POST'
            },
            "auth.get_user": {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            "auth.user.update": {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'POST'
            }
        }
    },
    function() {
        var cookie_data;

        winkstart.registerResources(this.__whapp, this.config.resources);

        if(URL_DATA['activation_key']) {
            winkstart.postJSON('auth.activate', {crossbar: true, api_url : winkstart.apps['auth'].api_url, activation_key: URL_DATA['activation_key'], data: {}}, function(data) {
               alert('You are now registered! Please log in.');

               winkstart.publish('auth.login', {username: data.data.user.username});
               if(data.auth_token != '' && data.auth_token != 'null'){
                    winkstart.apps['auth'].account_id = data.data.account.id;
                    winkstart.apps['auth'].auth_token = data.auth_token;
                    winkstart.apps['auth'].user_id = data.data.user.id;
                    winkstart.apps['auth'].realm = data.data.account.realm;
                    winkstart.publish('auth.load_account');
               }
            });
        }

        // Check if we have an auth token. If yes, assume pre-logged in and show the My Account button
        if(winkstart.apps['auth'].auth_token) {
            $('.universal_nav .my_account_wrapper').css('visibility', 'visible');
        }

        if('auth_url' in URL_DATA) {
            winkstart.apps['auth'].api_url = URL_DATA['auth_url'];
        }

        if(cookie_data = $.cookie('c_winkstart_auth')) {
            $('#ws-content').empty();
            eval('winkstart.apps["auth"] = ' + cookie_data);
            winkstart.publish('auth.load_account');
        }

        // Into the My Account utility. Note that we don't care if this utility isn't present or loads slowly
        winkstart.module.loadModule('auth', 'myaccount', function() {
            this.init();
            winkstart.log('Core: Loaded My Account manager');
        });
    },

    {
        request_realm : false,

        register: function() {
            var THIS = this;

            var dialogRegister = winkstart.dialog(THIS.templates.register.tmpl({}), {
                title: 'Register a New Account',
                resizable : false,
                modal: true
            });

            winkstart.validate.set(THIS.config.validation, dialogRegister);

            $('button.register', dialogRegister).click(function(event) {
                event.preventDefault(); // Don't run the usual "click" handler

                winkstart.validate.is_valid(THIS.config.validation, dialogRegister, function() {
                        if ($('#password', dialogRegister).val() == $('#password2', dialogRegister).val()) {
                            var realm;
                            if(THIS.request_realm) {
                                realm = $('#realm', dialogRegister).val();
                            } else {
                                realm = $('#username', dialogRegister).val() + winkstart.config.realm_suffix;
                            }

                            // If realm was set in the URL, override all
                            if('realm' in URL_DATA) {
                                realm = URL_DATA['realm'];
                            }

                            var rest_data = {
                                crossbar : true,
                                api_url : winkstart.apps['auth'].api_url,
                                data : {
                                    'account': {
                                        'realm': realm,
					'name':$('#name', dialogRegister).val(),
                                        'app_url': URL
                                    },
                                    'user': {
                                        'username':$('#username', dialogRegister).val(),
                                        'password' : $('#password', dialogRegister).val(),
                                        'first_name': $('#first_name', dialogRegister).val() ,
                                        'last_name':$('#last_name', dialogRegister).val(),
                                        'email': $('#email', dialogRegister).val(),
                                        'apps': winkstart.config.register_apps
                                    }
                                }
                            };
                            winkstart.putJSON('auth.register', rest_data, function (json, xhr) {
                                alert('Registered successfully. Please check your e-mail to activate your account!');
                                dialogRegister.dialog('close');
                            });
                        }
                        else {
                            alert('Please confirm your password');
                        }
                    },
                    function() {
                        alert('Your username is invalid (chars, digits, dashes and underscores only)');
                    }
                );
            });
        },

        login: function(args) {
            var THIS = this;
            var username = args == undefined ? '' : args.username;

            var dialogDiv = winkstart.dialog(THIS.templates.login.tmpl({username: username}), {
                title : 'Login',
                resizable : false,
                modal: true
            });

            if(username != '') {
                $('#password', dialogDiv).focus();
            }

            $('button.login', dialogDiv).click(function(event) {
                event.preventDefault(); // Don't run the usual "click" handler

                var hashed_creds = $('#login', dialogDiv).val() + ':' + $('#password', dialogDiv).val();
                hashed_creds = $.md5(hashed_creds);

                //hash MD5 hashed_creds
                var realm;
                if (THIS.request_realm) {
                    realm = $('#realm', dialogDiv).val();
                } else {
                    realm = $('#login', dialogDiv).val() + winkstart.config.realm_suffix;
                }

                // If realm was set in the URL, override all
                if('realm' in URL_DATA) {
                    realm = URL_DATA['realm'];
                }

                var rest_data = {
                    crossbar : true,
                    api_url : winkstart.apps['auth'].api_url,
                    data : {
                        'credentials': hashed_creds,
                        'realm': realm
                    }
                };

                winkstart.putJSON('auth.user_auth', rest_data, function (data, status) {
                        winkstart.apps['auth'].account_id = data.data.account_id;
                        winkstart.apps['auth'].auth_token = data.auth_token;
                        winkstart.apps['auth'].user_id = data.data.owner_id;
                        winkstart.apps['auth'].realm = realm;

                        $(dialogDiv).dialog('close');

                        // Deleting the welcome message
                        $('#ws-content').empty();

                        $.cookie('c_winkstart_auth', JSON.stringify(winkstart.apps['auth']));

                        winkstart.publish('auth.load_account');
                    },
                    function(data, status) {
                        if(status == '401' || status == '403') {
                            alert('Invalid credentials, please check that your username and password are correct.');
                        }
                        else {
                            alert('An error was encountered while attemping to process your request (Error: ' + status + ')');
                        }
                    }
                );
            });

            $('a.register', dialogDiv).click(function(event) {
                event.preventDefault(); // Don't run the usual "click" handler

                winkstart.publish('auth.register');

                $(dialogDiv).dialog('close');
            });

            $('a.recover_password', dialogDiv).click(function(event) {
                event.preventDefault(); // Don't run the usual "click" handler

                winkstart.publish('auth.recover_password');

                $(dialogDiv).dialog('close');
            });
        },

        load_account: function(args) {
            winkstart.log('Loading your apps!');
            rest_data = {
                crossbar : true,
                account_id : winkstart.apps['auth'].account_id,
                api_url : winkstart.apps['auth'].api_url,
                user_id : winkstart.apps['auth'].user_id
            }

            winkstart.getJSON('auth.get_user', rest_data, function (json, xhr) {
                $('.universal_nav #my_logout').html("Logout");
                $('.universal_nav .my_account_wrapper').css('visibility', 'visible');
                $('.universal_nav #my_account').html(json.data.first_name + ' ' + json.data.last_name);

                $.each(json.data.apps, function(k, v) {
                    winkstart.log('WhApps: Loading ' + k + ' from URL ' + v.api_url);
                    winkstart.apps[k] = v;

                    if(!('account_id' in v)) {
                        winkstart.apps[k].account_id = winkstart.apps['auth'].account_id;
                    }

                    if(!('user_id' in v)) {
                        winkstart.apps[k].user_id = winkstart.apps['auth'].user_id;
                    }

                    winkstart.module.loadApp(k, function() {
                        this.init();
                        winkstart.log('WhApps: Initializing ' + k);
                    })
                });
            });

        },

        // Use this to attempt a shared auth token login if the requested app doesn't have it's own auth token.
        // TODO: If this fails, pop-up a login box for this particular app
        shared_auth: function(args) {
            var THIS = this;

            rest_data = {
                crossbar : true,
                api_url : winkstart.apps[args.app_name].api_url,
                data: {
                    realm : winkstart.apps['auth'].realm,                     // Treat auth as global
                    account_id : winkstart.apps['auth'].account_id,           // Treat auth as global
                    shared_token : winkstart.apps['auth'].auth_token          // Treat auth as global
                }
            };

            get_user_fn = function(auth_token, app_name, callback) {
                var options = {
                    crossbar: true,
                    account_id: winkstart.apps['auth'].account_id,
                    api_url : winkstart.apps['auth'].api_url,
                    user_id: winkstart.apps['auth'].user_id
                };

                winkstart.apps[app_name]['auth_token'] = auth_token;

                winkstart.getJSON('auth.get_user', options, function(json, xhr) {
                    //$('a#my_account').html(json.data.first_name + ' ' + json.data.last_name);
                    $('#my_logout').html("Logout");
                    $('.main_nav').show();

                    if(typeof callback == 'function') {
                        callback();
                    }
                });
            }

            if(winkstart.apps['auth'].api_url != winkstart.apps[args.app_name].api_url) {
                winkstart.putJSON('auth.shared_auth', rest_data, function (json, xhr) {
                    // If this is successful, we'll get a server-specific auth token back
                    get_user_fn(json.auth_token, args.app_name, args.callback);
                });
            }
            else {
                get_user_fn(winkstart.apps['auth'].auth_token, args.app_name, args.callback);
            }
        },

        recover_password: function(args) {
            var THIS = this;
            var dialogDiv = winkstart.dialog(THIS.templates.recover_password.tmpl({}), {
                title: 'Recover Password'
            });
        },

        authenticate: function() {
            // A few things need to be done here
            // 1) If we're not authenticated, do so

            var _t = this;
            amplify.request('auth.establish', {
                username: '',
                passwordhash: ''
            }, function(data) {
                _t.session.authenticated = true;
                _t.session.token         = data.auth_token;
                _t.session.expires       = data.expires;
                alert('User authenticated');
            });
        },

        init: function() {
            // Check if we already have a session stored in a cookie
            var auth = $.cookie('winkstart');
            if ( auth ) {
                this.session = auth;
            }
        },

        activate: function() {
/*            if(ACTIVATION_KEY) {
                var rest_data = { activtion_key : ACTIVATION_KEY, data: {} };
                winkstart.postJSON('auth.activate', rest_data, function (json, xhr) {
                    winkstart.log(json);
                    REALM_LOGIN = json.data.account.realm;
                    alert('You are now registered');
                });
                ACTIVATION_KEY = null;
            }
            else */
            if(winkstart.apps['auth'].auth_token == null) {
                winkstart.publish('auth.login');
            } else {
                if(confirm('Are you sure that you want to log out?')) {
                    // Remove any individual keys
                    $.each(winkstart.apps, function(k, v) {
                        // TODO: ADD APP UNLOADING CODE HERE. Remove CSS and scripts. This should inherently delete apps.

                        winkstart.apps[k].realm = null;
                        winkstart.apps[k].auth_token = null;
                        winkstart.apps[k].user_id = null;
                        winkstart.apps[k].account_id = null;
                    });

                    $.cookie('c_winkstart_auth', null);

                    $('#ws-content').empty();
                    $('a#my_logout').html("Login");
                    $('.universal_nav .my_account_wrapper').hide();

                    // Temporary hack until module unloading works properly
                    window.location.reload();

                    //winkstart.publish('auth.activate');
                }
            }
        }
    }
);

