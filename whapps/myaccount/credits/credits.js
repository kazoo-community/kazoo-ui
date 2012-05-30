winkstart.module('myaccount', 'credits', {
        css: [
            'css/credits.css'
        ],

        templates: {
            credits: 'tmpl/credits.html',
            stat_credits: 'tmpl/stat_credits.html'
        },

        resources: {
            'myaccount_credits.update': {
                url: '{api_url}/accounts/{account_id}/{billing_provider}/credits',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'myaccount_credits.get_no_loading': {
                url: '{api_url}/accounts/{account_id}/{billing_provider}/credits',
                contentType: 'application/json',
                trigger_events: false,
                verb: 'GET'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        winkstart.publish('statistics.add_stat', THIS.define_stats());
    },

    {
        get_credits: function(success, error) {
            var THIS = this;

            winkstart.request('myaccount_credits.get_no_loading', {
                    account_id: winkstart.apps['myaccount'].account_id,
                    api_url: winkstart.apps['myaccount'].api_url,
                    billing_provider: winkstart.apps['myaccount'].billing_provider
                },
                function(data, status) {
                    if(typeof success == 'function') {
                        success(data, status);
                    }
                },
                function(data, status) {
                    if(typeof error == 'function') {
                        error(data, status);
                    }
                }
            );
        },

        add_credits: function(credits, success, error) {
            var THIS = this;

            winkstart.request('myaccount_credits.update', {
                    account_id: winkstart.apps['myaccount'].account_id,
                    api_url: winkstart.apps['myaccount'].api_url,
                    billing_provider: winkstart.apps['myaccount'].billing_provider,
                    data: {
                        'amount': credits
                    }
                },
                function(data, status) {
                    if(typeof success == 'function') {
                        success(data, status);
                    }
                },
                winkstart.error_message.process_error()
            );
        },

        render_credits_dialog: function(data) {
            var THIS = this,
                data_tmpl = {
                    credits: data.amount,
                },
                credits_html = THIS.templates.credits.tmpl(data_tmpl),
                popup;

            $('#per_minute', credits_html).show();

            $('.purchase_credits', credits_html).click(function(ev) {
                ev.preventDefault();
                var credits_to_add = parseFloat($('#add_credits', credits_html).val().replace(',','.'));

                THIS.add_credits(credits_to_add, function() {
                    winkstart.publish('statistics.update_stat', 'credits');

                    popup.dialog('close');
                });
            });

            popup = winkstart.dialog(credits_html, { title: 'Add Credits' });
        },

        define_stats: function() {
            var THIS = this;

            var stats = {
                'credits': {
                    number: 'loading',
                    color: 'green',
                    get_stat: function(callback) {
                        THIS.get_credits(
                            function(_data, status) {
                                var stat_attributes = {
                                    number: _data.data.amount,
                                    color: _data.data.amount < 1 ? 'red' : (_data.data.amount > 10 ? 'green' : 'orange')
                                };

                                if(typeof callback === 'function') {
                                    callback(stat_attributes);
                                }
                            },
                            function(_data, status) {
                                callback({error: true});
                            }
                        );
                    },
                    click_handler: function() {
                        THIS.get_credits(function(_data, status) {
                            THIS.render_credits_dialog(_data.data);
                        });
                    },
                    container: function(stat) {
                        return THIS.templates.stat_credits.tmpl(stat);
                    },
                    update_container: function(html) {
                        $('#credits_label', html).removeClass('green orange red')
                                                 .addClass(this.color)
                                                 .html('$ '+ this.number.toFixed(2));
                    }
                }
            };

            return stats;
        }
    }
);
