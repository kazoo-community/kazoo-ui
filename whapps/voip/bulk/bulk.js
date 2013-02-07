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
		'bulk.list': {
			url: '{api_url}/accounts/{account_id}/bulks',
			contentType: 'application/json',
			verb: 'GET'
		}
	}
},
function(args) {
    winkstart.registerResources(this.__whapp, this.config.resources);

	winkstart.publish('whappnav.subnav.add', {
        whapp: 'voip',
		module: this.__module,
		label: 'Bulk Edit',
		icon: 'device',
        weight: '80',
        category: 'advanced'
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
                'sTitle': 'Name'
            },
            {
                'sTitle': 'Endpoint Type',
                'sWidth': '200px'
            },
            {
                'sTitle': 'bulk_id',
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
            defaults = {
                field_data: {}
            };

        winkstart.request(true, 'media.list', {
                account_id: winkstart.apps['voip'].account_id,
                api_url: winkstart.apps['voip'].api_url
            },
            function(_data, status) {
                if(_data.data) {
                    _data.data.unshift(
                        {
                            id: '',
                            name: 'Default Music'
                        },
                        {
                            id: 'silence_stream://300000',
                            name: 'Silence'
                        }
                    );
                    defaults.field_data.media = _data.data;

                    var bulk_html = THIS.templates.bulk.tmpl(defaults);

                    THIS.bind_events(bulk_html);

                    $('#ws-content').empty().append(bulk_html);

                    THIS.init_table(bulk_html);

                    $.fn.dataTableExt.afnFiltering.pop();

                    THIS.list_endpoints();
                }
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
                operation: 'update',
                endpoints: selected_endpoints,
                settings: form_data
            };
        });
    },

    list_endpoints: function() {
        var map_endpoints = {};

        winkstart.request(true, 'user.list', {
                account_id: winkstart.apps['voip'].account_id,
                api_url: winkstart.apps['voip'].api_url
            },
            function(_data, status) {
                $.each(_data.data, function() {
                    map_endpoints[this.id] = $.extend(true, { name: this.first_name + ' ' + this.last_name, endpoint_type: 'user'}, this);
                });

                winkstart.request(true, 'device.list', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url
                    },
                    function(_data, status) {
                        $.each(_data.data, function() {
                            map_endpoints[this.id] = $.extend(true, { endpoint_type: 'device'}, this);
                        });
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
            }
        );
    }
});
