winkstart.module('voip', 'bulk', {
	css: [
        'css/bulk.css'
	],

	templates: {
		bulk: 'tmpl/bulk.html'
	},

	subscribe: {
		'bulk.activate': 'activate',
	},

	resources: {
        'bulk.list_classifiers': {
			url: '{api_url}/accounts/{account_id}/phone_numbers/classifiers',
			contentType: 'application/json',
			verb: 'GET'
		},
		'bulk.list': {
			url: '{api_url}/accounts/{account_id}/bulk',
			contentType: 'application/json',
			verb: 'GET'
		},
        'bulk.update': {
			url: '{api_url}/accounts/{account_id}/bulk',
			contentType: 'application/json',
			verb: 'POST'
        }
	}
},
function(args) {
    winkstart.registerResources(this.__whapp, this.config.resources);

	winkstart.publish('whappnav.subnav.add', {
        whapp: 'voip',
		module: this.__module,
		label: _t('bulk', 'bulk_edit_label'),
		icon: 'device',
        weight: '80',
        category: _t('config', 'advanced_menu_cat')
	});
},
{

    init_table: function(parent) {
        var bulk_html = parent,
		    columns = [
            {
                'sTitle': '<input type="checkbox" id="select_all_endpoints"/>',
                'fnRender': function(obj) {
                    return '<input type="checkbox" class="select_endpoint" data-id="'+ obj.aData[obj.iDataColumn] +'"/>';
                },
                'bSortable': false,
                'sWidth': '100px'
            },
            {
                'sTitle': _t('bulk', 'name_stitle')
            },
            {
                'sTitle': _t('bulk', 'endpoint_type_stitle'),
                'sWidth': '200px'
            },
            {
                'sTitle': _t('bulk', 'bulk_id_stitle'),
                'bVisible': false
            },
		];

		winkstart.table.create('bulk', $('#bulk-grid', bulk_html), columns, {}, {
			sDom: '<"date">frtlip',
            aaSorting: [[7, 'desc']]
		});

        $('.cancel-search', bulk_html).click(function(){
            $('#registration-grid_filter input[type=text]', bulk_html).val('');
            winkstart.table.bulk.fnFilter('');
        });

        $('#select_all_endpoints', parent).click(function() {
            $('.select_endpoint', parent).prop('checked', $(this).is(':checked'));
        });
    },

	activate: function(data) {
		var THIS = this,
            map_endpoints = {},
            defaults = {
                data: {
                    call_restriction: {}
                },
                field_data: {
                    call_restriction: {}
                }
            };

        winkstart.parallel({
                list_classifiers: function(callback) {
                    winkstart.request('bulk.list_classifiers', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url,
                        },
                        function(_data_classifiers, status) {
                            if('data' in _data_classifiers) {
                                $.each(_data_classifiers.data, function(k, v) {
                                    defaults.field_data.call_restriction[k] = {
                                        friendly_name: v.friendly_name
                                    };

                                    defaults.data.call_restriction[k] = { action: 'inherit' };
                                });
                            }

                            callback(null, _data_classifiers);
                        }
                    );
                },
                media_list: function(callback) {
                     winkstart.request(true, 'media.list', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url
                        },
                        function(_data, status) {
                            if(_data.data) {
                                _data.data.unshift(
                                    {
                                        id: '',
                                        name: _t('bulk', 'default_music')
                                    },
                                    {
                                        id: 'silence_stream://300000',
                                        name: _t('bulk', 'silence')
                                    }
                                );
                                defaults.field_data.media = _data.data;
                            }

                            callback(null, _data);
                        }
                    );
                },
                device_list: function(callback) {
                    winkstart.request(true, 'device.list', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url
                        },
                        function(_data, status) {
                            $.each(_data.data, function() {
                                map_endpoints[this.id] = $.extend(true, { endpoint_type: 'device'}, this);
                            });

                            callback(null, _data);
                        }
                    );
                },
                user_list: function(callback) {
                    winkstart.request(true, 'user.list', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url
                        },
                        function(_data, status) {
                            $.each(_data.data, function() {
                                map_endpoints[this.id] = $.extend(true, { name: this.first_name + ' ' + this.last_name, endpoint_type: 'user'}, this);
                            });

                            callback(null, _data);
                        }
                    );
                },
                group_list: function(callback) {
                     winkstart.request(true, 'groups.list', {
                            account_id: winkstart.apps['voip'].account_id,
                            api_url: winkstart.apps['voip'].api_url
                        },
                        function(_data, status) {
                            $.each(_data.data, function() {
                                map_endpoints[this.id] = $.extend(true, { endpoint_type: 'group'}, this);
                            });
                            callback(null, _data);
                        }
                    );
                }
            },
            function(err, results) {
				defaults._t = function(param){
					return window.translate['bulk'][param];
				};
                var bulk_html = THIS.templates.bulk.tmpl(defaults);

                THIS.bind_events(bulk_html);

                $('#ws-content').empty().append(bulk_html);

                THIS.init_table(bulk_html);

                $.fn.dataTableExt.afnFiltering.pop();

                var tab_data = [];

                $.each(map_endpoints, function(k, v) {
                    tab_data.push([
                        k,
                        v.name,
                        v.endpoint_type,
                        k
                    ]);
                });

                winkstart.table.bulk.fnAddData(tab_data);
            }
        );
	},

    bind_events: function(parent) {
        winkstart.timezone.populate_dropdown($('#timezone', parent));

        $('.input', $('.bulk-edit-checkbox', parent).parents('.clearfix')).hide();

        $('.bulk-edit-checkbox', parent).click(function() {
            $(this).prop('checked') ? $('.input', $(this).parents('.clearfix').first()).show() : $('.input', $(this).parents('.clearfix').first()).show().hide();
        });

        $('.bulk-save', parent).click(function() {
            var selected_endpoints = [];
            $('.select_endpoint:checked', parent).each(function(k, v) {
                selected_endpoints.push($(v).data('id'));
            });

            var form_data = {};

            $('.clearfix', parent).each(function(k, v) {
                if($('.bulk-edit-checkbox', $(v)).prop('checked')) {
                    form_data = $.extend(true, form_data, form2object($(v).attr('id')));
                }
            });

            delete form_data.extra;

            var data_api = {
                ids: selected_endpoints,
                updates: form_data
            };

            winkstart.request('bulk.update', {
                    api_url: winkstart.apps['voip'].api_url,
                    account_id: winkstart.apps['voip'].account_id,
                    data: data_api
                },
                function(data) {
                    var error = false;

                    $.each(data.data, function(k, v) {
                        if(v.status !== 'success') {
                            error = true;
                        }
                    });

                    if(error === true) {
                        winkstart.alert(_t('bulk', 'an_error_occured_during'));
                    }
                    else {
                        winkstart.alert('info', _t('bulk', 'the_endpoints_selected'));
                    }
                }
            );
        });
    }
});
