winkstart.module('myaccount', 'app_store', {
        css: [
            'css/app_store.css'
        ],

        templates: {
            app_store: 'tmpl/app_store.html'
        },

        subscribe: {
            'myaccount.nav.post_loaded': 'myaccount_loaded',
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

        myaccount_loaded: function() {
            var THIS = this;

            winkstart.publish('nav.add_sublink', {
                link: 'nav',
                sublink: 'app_store',
                label: 'App Store',
                weight: '20',
                publish: 'app_store.popup'
            });
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
        }
    }
);
