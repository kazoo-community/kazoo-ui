winkstart.module('myaccount', 'report', {
        css: [
            'css/report.css'
        ],

        templates: {
            report: 'tmpl/report.html'
        },

        subscribe: {
            'myaccount.nav.post_loaded': 'myaccount_loaded',
            'report.render': 'render_report'
        },

        resources: {
            'report.list_accounts_children': {
                url: '{api_url}/accounts/{account_id}/children',
                contentType: 'application/json',
                verb: 'GET'
            },
            'report.list_accounts_descendants': {
                url: '{api_url}/accounts/{account_id}/descendants',
                contentType: 'application/json',
                verb: 'GET'
            },
            'report.account_devices': {
                url: '{api_url}/accounts/{account_id}/devices',
                contentType: 'application/json',
                verb: 'GET'
            },
            'report.account_dids': {
                url: '{api_url}/accounts/{account_id}/phone_numbers',
                contentType: 'application/json',
                verb: 'GET'
            },
            'report.account_data': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'report.account_credits': {
                url: '{api_url}/accounts/{account_id}/braintree/credits',
                contentType: 'application/json',
                verb: 'GET'
            },
            'report.account_limits': {
                url: '{api_url}/accounts/{account_id}/limits',
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
        get_account_data: function(args, success, error) {
            winkstart.request('report.account_' + args.type, {
                    api_url: winkstart.apps['myaccount'].api_url,
                    account_id: args.account_id || ('accounts' in winkstart.apps ? winkstart.apps['accounts'].account_id : winkstart.apps['myaccount'].account_id)
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

        list_accounts: function(type, success, error) {
            var THIS = this,
                account_id = 'accounts' in winkstart.apps ? winkstart.apps['accounts'].account_id : winkstart.apps['myaccount'].account_id,
                list_accounts = function(type, _additional_account) {
                    winkstart.request('report.list_accounts_'+type, {
                            api_url: winkstart.apps['myaccount'].api_url,
                            account_id: account_id
                        },
                        function(data, status) {
                            if(typeof success == 'function') {
                                if(_additional_account) {
                                    data.data.push(_additional_account);
                                }
                                success(data, status);
                            }
                        },
                        function(data, status) {
                            if(typeof error == 'function') {
                                error(data, status);
                            }
                        }
                    );
                };

            if(type === 'with_account') {
                THIS.get_account_data({type: 'data'}, function(data) {
                    var account = {
                        id: data.data.id,
                        name: data.data.name
                    };
                    list_accounts('children', account);
                });
            }
            else {
                list_accounts(type);
            }
        },

        myaccount_loaded: function(user_data) {
            if(winkstart.config.display_report || (!user_data.priv_level || user_data.priv_level === 'admin')){
                winkstart.publish('nav.add_sublink', {
                    link: 'nav',
                    sublink: 'report',
                    masqueradable: true,
                    label: _t('report', 'report_label'),
                    weight: '17',
                    publish: 'report.render'
                });
            }
        },

        render_report: function(target) {
            var THIS = this,
                popup_html = $('<div id="report_popup" class="inline_popup"><div class="inline_content main_content"/></div>'),
                container = $('.inline_content', popup_html).append(THIS.templates.report.tmpl({
					_t: function(param){
						return window.translate['report'][param];
					}
				}));
                report_dialog = winkstart.dialog(popup_html, {
                    modal: true,
                    title: _t('report', 'report_title')
                });

            THIS.setup_report(container);

            $('#trigger_report', container).click(function() {
                $('#report_filters', container).hide();

                $('.table-report', container).show();
                $('#subtotals', container).hide();

                var type = $('input[type=radio][name=filter_account]:checked', container).val();

                if(type) {
                    THIS.list_data_report(type, container);
                }
            });
        },

        list_data_account: function(parent, accounts_tab, _callback, _total_data) {
            var THIS = this;

            if(_total_data === undefined){
                _total_data = {
                    dids: 0,
                    softphones: 0,
                    sip_devices: 0,
                    inbound_trunks: 0,
                    twoway_trunks: 0,
                    credits: 0
                };
            }

            if($('.table-report', parent).is(':visible')) {
                if(accounts_tab.length) {
                    var account = accounts_tab.splice(0, 1)[0];
                    winkstart.parallel({
                            dids: function(callback) {
                                THIS.get_account_data({type: 'dids', account_id: account.id}, function(_data) {
                                    callback(null, _data.data);
                                });
                            },
                            devices: function(callback) {
                                THIS.get_account_data({type: 'devices', account_id: account.id}, function(_data) {
                                    callback(null, _data.data);
                                });
                            },
                            credits: function(callback) {
                                THIS.get_account_data({type: 'credits', account_id: account.id}, function(_data) {
                                    callback(null, _data.data);
                                });
                            },
                            limits: function(callback) {
                                THIS.get_account_data({type: 'limits', account_id: account.id}, function(_data) {
                                    callback(null, _data.data);
                                });
                            }
                        },
                        function(err, results) {
                            var softphones = 0,
                                sip_devices = 0,
                                dids = 0,
                                inbound_trunks = results.limits.inbound_trunks || 0,
                                twoway_trunks = results.limits.twoway_trunks || 0;

							if('numbers' in results.dids) {
                            	$.each(results.dids.numbers, function(k, v) {
                                	dids++;
                            	});
                            }

                            $.each(results.devices, function(k, v) {
                                if(v.device_type === 'softphone') {
                                    softphones++;
                                }
                                else if($.inArray(v.device_type, ['sip_device', 'fax', 'smartphone', 'sip_uri']) > -1) {
                                    sip_devices++;
                                }
                            });

                            _total_data.dids += dids;
                            _total_data.sip_devices += sip_devices;
                            _total_data.softphones += softphones;
                            _total_data.credits += results.credits.amount;
                            _total_data.inbound_trunks += inbound_trunks;
                            _total_data.twoway_trunks += twoway_trunks;

                            var data_account = [
                                account.name, sip_devices, softphones, dids, inbound_trunks, twoway_trunks, '$'+parseFloat(results.credits.amount).toFixed(2)
                            ];

                            winkstart.table.report.fnAddData(data_account);

                            THIS.list_data_account(parent, accounts_tab, _callback, _total_data);
                        }
                    );
                }
                else {
                    if(typeof _callback === 'function') {
                        _callback(_total_data);
                    }
                }
            }
        },

        list_data_report: function(type, parent) {
            var THIS = this;

            winkstart.table.report.fnClearTable();

            THIS.list_accounts(type, function(_data_accounts) {
                THIS.list_data_account(parent, _data_accounts.data, function(_total_data) {
                    $('#amount_softphones', parent).html(_total_data.softphones);
                    $('#amount_dids', parent).html(_total_data.dids);
                    $('#amount_sip_devices', parent).html(_total_data.sip_devices);
                    $('#amount_inbound_trunks', parent).html(_total_data.inbound_trunks);
                    $('#amount_outbound_trunks', parent).html(_total_data.twoway_trunks);
                    $('#amount_credits', parent).html('$'+parseFloat(_total_data.credits).toFixed(2));

                    $('#report_filters', parent).show();
                    $('#subtotals', parent).show();
                });
            });
        },

        setup_report: function(parent) {
            var THIS = this,
                columns = [
                {
                    'sTitle': _t('report', 'account_stitle')
                },
                {
                    'sTitle': _t('report', 'sip_devices_stitle')
                },
                {
                    'sTitle': _t('report', 'softphones_stitle')
                },
                {
                    'sTitle': _t('report', 'dids_stitle')
                },
                {
                    'sTitle': _t('report', 'inbound_trunks_stitle')
                },
                {
                    'sTitle': _t('report', 'outbound_trunks_stitle')
                },
                {
                    'sTitle': _t('report', 'available_credits_stitle'),
                    'sType': 'currency'
                }
            ];

            winkstart.table.create('report', $('#report-grid', parent), columns, {}, {
                sDom: 'frtlip',
                aaSorting: [[0, 'desc']]
            });

            $('#report-grid_filter input[type=text]', parent).first().focus();

            $('.cancel-search', parent).click(function(){
                $('#report-grid_filter input[type=text]', parent).val('');
                winkstart.table.report.fnFilter('');
            });
        }
    }
);
