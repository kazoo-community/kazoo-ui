winkstart.module('auth', 'myaccount', {
        css: [
            'css/style.css',
            'css/popups.css'
        ],

        templates: {
            myaccount: 'tmpl/myaccount.html',
            billing: 'tmpl/billing.html',
            apps: 'tmpl/apps.html',
            userlevel: 'tmpl/userlevel.html',
            apikey: 'tmpl/apikey.html',
            info: 'tmpl/personalinfos.html'
        },

        subscribe: {
            'myaccount.display' : 'display',
            'myaccount.update_billing' : 'update_billing',
            'nav.my_account_click' : 'my_account_click',
            'nav.my_logout_click' : 'my_logout_click'
        },

        resources: {
            "billing.update": {
                url: '{api_url}/accounts/{account_id}/braintree/customer',
                contentType: 'application/json',
                verb: 'POST'
            },
            "billing.get": {
                url: '{api_url}/accounts/{account_id}/braintree/customer',
                contentType: 'application/json',
                verb: 'GET'
            },
            "myaccount.user_get": {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            "myaccount.user_update": {
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
        my_account_click: function() {
            if(winkstart.apps['auth'].auth_token != '') {
                winkstart.publish('myaccount.display');
            }
            else {
                winkstart.publish('auth.activate');
            }
        },

        my_logout_click: function() {
            winkstart.publish('auth.activate');
        },

        update_acct: function(data, new_data, success, error) {
            winkstart.request('myaccount.user_update', {
                    account_id: winkstart.apps['auth'].account_id,
                    api_url: winkstart.apps['auth'].api_url,
                    user_id: winkstart.apps['auth'].user_id,
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

        update_billing: function(data, new_data, success, error) {
            winkstart.request('billing.update', {
                    account_id: winkstart.apps['auth'].account_id,
                    api_url: winkstart.apps['auth'].api_url,
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

/*
        selectApp: function() {
            var THIS = this;

            $.each(winkstart.apps, function(index, value) {
                var $itm = $('#'+index);
                $('#tabs1 .apps').find($itm).addClass('active');
            });
        },

        activateApp: function(data) {
            winkstart.getJSON('myaccount.user.get', {
                crossbar: true,
                account_id: winkstart.apps['auth'].account_id,
                api_url: winkstart.apps['auth'].api_url,
                user_id: winkstart.apps['auth'].user_id
            }, function(json, xhr) {

                newapp = {};



                if(data.whapp == "voip") {
                    newapp = {"apps": {"voip": {
                        "label": "VoIP Services",
                        "icon": "phone",
                        "api_url": "http://apps001-demo-ord.2600hz.com:8000/v1"
                    }}};
                } else if (data.whapp == "cluster") {
                    newapp = {"apps": {"cluster": {
                        "label": "Cluster Manager",
                        "icon": "cluster_manager",
                        "api_url": "http://apps.2600hz.com:8000/v1"
                    }}};
                } else if (data.whapp == "userportal") {
                    newapp = {"apps": {"userportal": {
                        "label": "User Portal",
                        "icon": "user_portal",
                        "api_url": "http://apps001-demo-ord.2600hz.com:8000/v1"
                    }}};
                } else if (data.whapp == "connect") {
                    newapp = {"apps": {"connect": {
                        "label": "Connect Tool",
                        "icon": "connectivity",
                        "api_url": "http://store.2600hz.com/v1"
                    }}};
                }

                final_data = $.extend(true, {}, json.data, newapp);

                var rest_data = {};
                rest_data.crossbar = true;
                rest_data.account_id = winkstart.apps['auth'].account_id,
                rest_data.api_url = winkstart.apps['auth'].api_url,
                rest_data.user_id = winkstart.apps['auth'].user_id;
                rest_data.auth_token = winkstart.apps['auth'].auth_token;
                rest_data.data = final_data;

                winkstart.postJSON('myaccount.user.update', rest_data, function (json, xhr) {});

                alert('Please REFRESH the page in order to apply the changes');
            });
        },

        deactivateApp: function(data) {
            winkstart.getJSON('myaccount.user.get', {
                crossbar: true,
                account_id: winkstart.apps['auth'].account_id,
                api_url: winkstart.apps['auth'].api_url,
                user_id: winkstart.apps['auth'].user_id
            }, function(json, xhr) {

                if(data.whapp == "voip") {
                    delete json.data.apps.voip;
                } else if (data.whapp == "cluster") {
                    delete json.data.apps.cluster;
                } else if (data.whapp == "userportal") {
                    delete json.data.apps.userportal;
                } else if (data.whapp == "connect") {
                    delete json.data.apps.connect;
                }

                var rest_data = {};
                rest_data.crossbar = true;
                rest_data.account_id = winkstart.apps['auth'].account_id,
                rest_data.api_url = winkstart.apps['auth'].api_url,
                rest_data.user_id = winkstart.apps['auth'].user_id;
                rest_data.auth_token = winkstart.apps['auth'].auth_token;
                rest_data.data = json.data;

                winkstart.postJSON('myaccount.user.update', rest_data, function (json, xhr) {});

                alert('Please REFRESH the page in order to apply the changes');
            });
        },

        display_old: function() {
            var THIS = this;

            var tmpl = {
                api:['Linode', 'Rackspace', 'Amazon']
            };
            THIS.templates.apikey.tmpl(tmpl).appendTo('.pane #tabs3');

            $('#tabs1 .app_holder').click(function() {
                if($(this).hasClass('active')) {
                    $(this).removeClass('active');
                    winkstart.publish('myaccount.app.deactivateApp', {
                        whapp: $(this).attr('id')
                    });
                } else {
                    $(this).addClass('active');
                    winkstart.publish('myaccount.app.activateApp', {
                        whapp: $(this).attr('id')
                    });
                }
            });
        },
*/

        display: function() {
            var THIS = this;

            THIS.render_popup();
        },

        render_popup: function() {
            var THIS = this,
                popup_html = THIS.templates.myaccount.tmpl(),
                popup;

            $('#tabs > ul a[href="#tab_app"]', popup_html).click(function(ev) {
                ev.preventDefault();

                $('#tabs > ul a').removeClass('current');
                $(this).addClass('current');

                THIS.render_app({}, $('#content', popup_html));
            }).trigger('click');

            $('#tabs > ul a[href="#tab_billing"]', popup_html).click(function(ev) {
                ev.preventDefault();

                $('#tabs > ul a').removeClass('current');
                $(this).addClass('current');

                winkstart.request('billing.get', {
                        account_id: winkstart.apps['auth'].account_id,
                        api_url: winkstart.apps['auth'].api_url
                    },
                    function(data, status) {
                        var defaults = {
                            data: {
                                credit_cards: [{
                                    billing_address: {}
                                }]
                            }
                        };

                        THIS.render_billing($.extend(true, defaults, data), $('#content', popup_html));
                    }
                );
            });

            $('#tabs > ul a[href="#tab_info"]', popup_html).click(function(ev) {
                ev.preventDefault();

                $('#tabs > ul a').removeClass('current');
                $(this).addClass('current');

                winkstart.request('myaccount.user_get', {
                        account_id: winkstart.apps['auth'].account_id,
                        api_url: winkstart.apps['auth'].api_url,
                        user_id: winkstart.apps['auth'].user_id
                    },
                    function(data, status) {
                        THIS.render_info(data, $('#content', popup_html));
                    }
                );
            });

            popup = winkstart.dialog(popup_html, {
                height: '640',
                width: '570',
                title: 'My account',
                open: function() {
                    // Gross hack to prevent scroll bar glitch (should be in the css sheet)
                    $(this).css('overflow-x', 'hidden');
                }
            });

        },

        render_app: function(data, target) {
            var THIS = this,
                app_html = THIS.templates.apps.tmpl();

            (target)
                .empty()
                .append(app_html);
        },

        render_billing: function(data, target) {
            var THIS = this,
                billing_html = THIS.templates.billing.tmpl(data);

            $('#save-billing', billing_html).click(function() {
                var form_data = form2object('billing-form');

                THIS.clean_billing_form_data(form_data);

                console.log(form_data);

                THIS.update_billing({}, form_data, function(_data) {
                        THIS.render_billing(_data, target);

                        alert('Credit card updated!');
                    },
                    function(_data, status) {
                        if(status == 400) {
                            alert('The following errors occurred:\n' + _data.data.message);
                        }
                        else {
                            alert('There was an unspecified server error, please try again later.');
                        }
                    }
                );
            });

            (target)
                .empty()
                .append(billing_html);
        },

        render_info: function(data, target) {
            var THIS = this,
                info_html = THIS.templates.info.tmpl(data);

            $('#btnEmail', info_html).click(function() {
                THIS.update_acct(data.data, {
                        email: $('#infos_email', info_html).val()
                    },
                    function() {
                        alert('Email address updated!');
                    }
                );
            });

            $('#btnPwd', info_html).click(function() {
                var pass = $('#infos_pwd1', info_html).val();

                if(pass == $('#infos_pwd2', info_html).val()) {
                    THIS.update_acct(data.data, {
                            password: pass
                        },
                        function() {
                            alert('Password updated!');
                        }
                    );
                }
                else {
                    alert('Passwords do not match, please retype the passwords.');
                }
            });

            (target)
                .empty()
                .append(info_html);
        },

        clean_billing_form_data: function(form_data) {
            if(form_data.credit_card.number.indexOf('*') != -1) {
                delete form_data.credit_card.number;
            }

            if(form_data.credit_card.cvv == '') {
                delete form_data.credit_card.cvv;
            }

            if(form_data.credit_card.billing_address.country_code_three == '') {
                delete form_data.credit_card.billing_address.country_code_three;
            }


            return form_data;
        }
    }
);
