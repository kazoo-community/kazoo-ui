winkstart.module('myaccount', 'app_store', {
        css: [
            'css/app_store.css'
        ],

        templates: {
            app_store: 'tmpl/app_store.html'
        },

        subscribe: {
            'app_store.activate': 'tab_click',
            'myaccount.define_submodules': 'define_submodules',
            'app_store.popup': 'popup'
        },

        resources: {
            'app_store.user_get': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'app_store.user_update': {
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
            winkstart.request('app_store.user_update', {
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

            THIS.render_app_store({}, target);
        },

        update_app_store: function(data, new_data, success, error) {

        },

        render_app_store: function(data, target) {
            var THIS = this,
                app_store_html = THIS.templates.app_store.tmpl(data);

            (target)
                .empty()
                .append(app_store_html);
        },

        popup: function(data){
            var THIS = this,
                app_store_html = THIS.templates.app_store.tmpl(data);

            winkstart.dialog(app_store_html, {
                height: 'auto',
                modal: true,
                title: 'App Store',
                autoOpen: true
            });
        },

        define_submodules: function(list_submodules) {
            var THIS = this;

            $.extend(list_submodules, {
                'app_store': {
                    display_name: 'App Store'
                }
            });
            list_submodules.list.push('app_store');
        }
    }
    /*
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
);
