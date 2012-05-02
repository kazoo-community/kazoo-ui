winkstart.module('myaccount', 'personal_info', {
        css: [
            //'css/personal_info.css'
        ],

        templates: {
            info: 'tmpl/personal_info.html'
        },

        subscribe: {
            'personal_info.activate': 'tab_click',
            'myaccount.define_submodules': 'define_submodules'
        },

        resources: {
            'personal_info.user_get': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'personal_info.user_update': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'POST'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);
    },

    {
        update_acct: function(data, new_data, success, error) {
            winkstart.request('personal_info.user_update', {
                    account_id: winkstart.apps['myaccount'].account_id,
                    api_url: winkstart.apps['myaccount'].api_url,
                    user_id: winkstart.apps['myaccount'].user_id,
                    data: $.extend(true, {}, data, new_data)
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

        tab_click: function(args) {
            var THIS = this,
                target = args.target;

            winkstart.request('personal_info.user_get', {
                    account_id: winkstart.apps['myaccount'].account_id,
                    api_url: winkstart.apps['myaccount'].api_url,
                    user_id: winkstart.apps['myaccount'].user_id
                },
                function(data, status) {
                    THIS.render_info(data, target);
                }
            );
        },

        render_info: function(data, target) {
            var THIS = this,
                info_html = THIS.templates.info.tmpl(data);

            $('#btnEmail', info_html).click(function() {
                THIS.update_acct(data.data, {
                        email: $('#infos_email', info_html).val()
                    },
                    function() {
                        winkstart.alert('info', 'Email address updated!');
                    }
                );
            });

            $('#btnPwd', info_html).click(function() {
                var pass = $('#infos_pwd1', info_html).val();

                if(pass == $('#infos_pwd2', info_html).val()) {
                    if(winkstart.is_password_valid(pass)) {
                        THIS.update_acct(data.data, {
                                password: pass
                            },
                            function() {
                                winkstart.alert('info', 'Password updated!');
                            }
                        );
                    }
                }
                else {
                    winkstart.alert('Passwords do not match, please retype the passwords.');
                }
            });

            (target)
                .empty()
                .append(info_html);
        },

        define_submodules: function(list_submodules) {
            var THIS = this;

            $.extend(list_submodules, {
                'personal_info': {
                    display_name: 'Personal Info'
                }
            });
            list_submodules.list.push('personal_info');
        }
    }
);
