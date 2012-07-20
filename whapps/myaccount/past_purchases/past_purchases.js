winkstart.module('myaccount', 'past_purchases', {
        css: [
            'css/past_purchases.css'
        ],

        templates: {
            past_purchases: 'tmpl/past_purchases.html'
        },

        subscribe: {
            'myaccount.nav.post_loaded': 'myaccount_loaded',
            'past_purchases.popup': 'popup',
            'past_purchases.ext_link': 'ext_link'
        },

        resources: {
            'past_purchases.get': {
                url: '{api_url}/accounts/{account_id}/braintree/transactions',
                contentType: 'application/json',
                verb: 'GET'
            },
            'past_purchases.list_accounts': {
                url: '{api_url}/accounts/{account_id}/descendants',
                contentType: 'application/json',
                verb: 'GET'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);
    },

    {
        list_accounts: function(success, error) {
            winkstart.request('past_purchases.list_accounts', {
                    api_url: winkstart.apps['myaccount'].api_url,
                    account_id: winkstart.apps['myaccount'].account_id
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

        myaccount_loaded: function(user_data) {
            if(winkstart.config.display_past_purchases || (!user_data.priv_level || user_data.priv_level === 'admin')){
                winkstart.publish('nav.add_sublink', {
                    link: 'nav',
                    sublink: 'past_purchases',
                    label: 'Past Purchases',
                    weight: '18',
                    publish: (winkstart.config.nav.past_purchases) ? 'past_purchases.ext_link' : 'past_purchases.popup'
                });
            }
        },

        ext_link: function() {
            window.open(winkstart.config.nav.past_purchases);
        },

        render_past_purchases: function(data, target) {
            var THIS = this,
                past_purchases_html = THIS.templates.past_purchases.tmpl(data);

            THIS.setup_transactions(past_purchases_html);
            THIS.setup_subscriptions(past_purchases_html);

            THIS.list_payments(data, past_purchases_html);

            (target)
                .empty()
                .append(past_purchases_html);
        },

        popup: function() {
            var THIS = this,
                popup_html = $('<div class="inline_popup past_purchases"><div class="inline_content main_content"/></div>');

             winkstart.request('past_purchases.get', {
                    account_id: winkstart.apps['myaccount'].account_id,
                    api_url: winkstart.apps['myaccount'].api_url
                },
                function(data, status) {
                    THIS.render_past_purchases(data, $('.inline_content', popup_html));

                    winkstart.dialog(popup_html, {
                        modal: true,
                        title: 'Past Purchases',
                        autoOpen: true,
                        position: 'top'
                    });
                }
            );
        },

        setup_transactions: function(parent) {
            var THIS = this,
                columns = [
                {
                    'sTitle': 'Date'
                },
                {
                    'sTitle': 'Status'
                },
                {
                    'sTitle': 'Amount ($)'
                }
            ];

            winkstart.table.create('transactions', $('#transactions-grid', parent), columns, {}, {
                sDom: 'frtlip',
                aaSorting: [[0, 'desc']]
            });

            $('#transactions-grid_filter input[type=text]', parent).first().focus();

            $('.cancel-search', parent).click(function(){
                $('#transactions-grid_filter input[type=text]', parent).val('');
                winkstart.table.transactions.fnFilter('');
            });
        },

        setup_subscriptions: function(parent) {
            var THIS = this,
                columns = [
                {
                    'sTitle': 'Date'
                },
                {
                    'sTitle': 'Subscription'
                },
                {
                    'sTitle': 'Status'
                },
                {
                    'sTitle': 'Amount ($)'
                }
            ];

            winkstart.table.create('subscriptions', $('#subscriptions-grid', parent), columns, {}, {
                sDom: 'frtlip',
                aaSorting: [[0, 'desc']]
            });

            $('#subscriptions-grid_filter input[type=text]', parent).first().focus();

            $('.cancel-search', parent).click(function(){
                $('#subscriptions-grid_filter input[type=text]', parent).val('');
                winkstart.table.subscriptions.fnFilter('');
            });
        },

        list_payments: function(data, parent) {
            var THIS = this,
                tab_transactions = [],
                tab_subscriptions = [],
                payment,
                account_name;

            THIS.list_accounts(function(_data_accounts) {
                var map_accounts = {};


                $.each(_data_accounts.data, function(k, v) {
                    map_accounts[v.id] = v;
                });

                $.each(data.data, function(k, v) {
                    v.created_at = v.created_at.replace(/-/g,'/').replace('T', ' - ').replace('Z', '');
                    if(v.subscription_id) {
                        var account_id = v.subscription_id.split('_')[0];
                        console.log(account_id);
                        console.log(map_accounts);
                        account_name = account_id.length === 32 ? map_accounts[v.subscription_id.split('_')[0]].name : 'Account not found';
                        payment = [v.created_at, account_name, v.status, v.amount];

                        tab_subscriptions.push(payment);
                    }
                    else {
                        payment = [v.created_at, v.status, v.amount];

                        tab_transactions.push(payment);
                    }
                });

                winkstart.table.transactions.fnClearTable();
                winkstart.table.subscriptions.fnClearTable();

                winkstart.table.transactions.fnAddData(tab_transactions);
                winkstart.table.subscriptions.fnAddData(tab_subscriptions);
            });
        },
    }
);
