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
                weight: '10',
                publish: 'app_store.popup'
            });
        },

        render_app_store: function(data, target) {
            var THIS = this;
               
                winkstart.request('app_store.user_get', {
                    account_id: winkstart.apps['myaccount'].account_id,
                    api_url: winkstart.apps['myaccount'].api_url,
                    user_id: winkstart.apps['myaccount'].user_id
                },
                function(user_info, status) {
                    var data = $.extend({}, data, {
                            available_app: winkstart.config.available_app,
                            apps: user_info.data.apps
                        }),
                        app_store_html = THIS.templates.app_store.tmpl(data),
                        count = 0,
                        total = $('.app-store-ul li', app_store_html).length;

                    $('.switch', app_store_html).switch();
                        
                    $('#left_scroll', app_store_html).click(function() {
                        if(count > 0){
                            var width = $('.app-store-ul li', app_store_html).outerWidth();
                            $('.app-store-ul').animate(
                                {left: '+=' + width},
                                500
                            );
                            count--;
                        }
                    });

                    $('#right_scroll', app_store_html).click(function() {
                        if(count+5 < total) {
                            var width = $('.app-store-ul li', app_store_html).outerWidth();
                            $('.app-store-ul').animate(
                                {left: '-=' + width},
                                500
                            );
                            count++;
                        }
                    });

                    $('#app_store_save', app_store_html).click(function(e) {
                        e.preventDefault();

                        winkstart.confirm(
                            'Warning! This is going to refresh the page.',
                            function(){
                               var apps = {},
                                    tmp = user_info.data;

                                $('.app', app_store_html).find('[checked]').each(function() {
                                    var id = $(this).attr('name');
                                    apps[id] = winkstart.config.available_app[id];
                                });
                                tmp.apps = apps;

                                THIS.update_acct(tmp, {}, function() {
                                    window.location.reload();
                                }); 
                            }
                        );
                    });

                    (target)
                        .empty()
                        .append(app_store_html);

                });
        },

        popup: function(){
            var THIS = this,
                popup_html = $('<div class="inline_popup"><div class="inline_content main_content app-store"/></div>');

            THIS.render_app_store({}, $('.inline_content', popup_html));

            winkstart.dialog(popup_html, {
                height: 'auto',
                modal: true,
                title: 'App Store',
                autoOpen: true
            });
        }
    }
);
