winkstart.module('voip', 'registration',
	{
		css: [
            'css/registration.css'
		],

		templates: {
			registration: 'tmpl/registration.html'
		},

		subscribe: {
			'registration.activate' : 'activate'
		},

		resources: {
			'registration.list': {
				url: '{api_url}/accounts/{account_id}/registrations',
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
			label: _t('registration', 'registrations_label'),
			icon: 'registration',
			weight: '35'
		});
	},

	{
		activate: function(data) {
			var THIS = this;

			var registration_html = THIS.templates.registration.tmpl({
				_t: function(param){
					return window.translate['registration'][param];
				}
			}).appendTo( $('#ws-content').empty() );

            THIS.setup_table(registration_html);

            THIS.list_registrations(registration_html);

            $('#refresh_registrations', registration_html).click(function() {
                winkstart.table.registration.fnClearTable();

                THIS.list_registrations(registration_html);
            });
		},

        list_registrations: function(registration_html) {
            var parse_date = function(timestamp) {
                    var parsed_date = '-';

                    if(timestamp) {
                        var date = new Date((timestamp - 62167219200)*1000),
                            month = date.getMonth() +1,
                            year = date.getFullYear(),
                            day = date.getDate(),
                            humanDate = month+'/'+day+'/'+year,
                            humanTime = date.toLocaleTimeString();

                        parsed_date = humanDate + ' ' + humanTime;
                    }

                    return parsed_date;
                };

		    winkstart.getJSON('registration.list', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(reply) {
                    var tab_data = [];
                    $.each(reply.data, function() {
                        var humanTime = parse_date(this.event_timestamp);
                        this.contact = this.contact.replace(/"/g,"");
                        this.contact = this.contact.replace(/'/g,"\\'");
                        var stringToDisplay = _t('registration', 'details_of_registration') + '<br/>';
                        stringToDisplay += '<br/>' + _t('registration', 'app_name') + this.app_name;
                        stringToDisplay += '<br/>' + _t('registration', 'app_version') + this.app_version;
                        stringToDisplay += '<br/>' + _t('registration', 'call_id') + this.call_id;
                        stringToDisplay += '<br/>' + _t('registration', 'contact') + this.contact;
                        stringToDisplay += '<br/>' + _t('registration', 'event_category') + this.event_category;
                        stringToDisplay += '<br/>' + _t('registration', 'event_name') + this.event_name;
                        stringToDisplay += '<br/>' + _t('registration', 'expires') + this.expires;
                        stringToDisplay += '<br/>' + _t('registration', 'freeswitch_hostname') + this.freeswitch_hostname;
                        stringToDisplay += '<br/>' + _t('registration', 'from_host') + this.from_host;
                        stringToDisplay += '<br/>' + _t('registration', 'from_user') + this.from_user;
                        stringToDisplay += '<br/>' + _t('registration', 'network_ip') + this.network_ip;
                        stringToDisplay += '<br/>' + _t('registration', 'contact_ip') + this.contact_ip;
                        stringToDisplay += '<br/>' + _t('registration', 'contact_port') + this.contact_port;
                        stringToDisplay += '<br/>' + _t('registration', 'network_port') + this.network_port;
                        stringToDisplay += '<br/>' + _t('registration', 'presence_hosts') + this.presence_hosts;
                        stringToDisplay += '<br/>' + _t('registration', 'profile_name') + this.profile_name;
                        stringToDisplay += '<br/>' + _t('registration', 'rpid') + this.rpid;
                        stringToDisplay += '<br/>' + _t('registration', 'realm') + this.realm;
                        stringToDisplay += '<br/>' + _t('registration', 'server_id') + this.server_id;
                        stringToDisplay += '<br/>' + _t('registration', 'status') + this.status;
                        stringToDisplay += '<br/>' + _t('registration', 'to_host') + this.to_host;
                        stringToDisplay += '<br/>' + _t('registration', 'to_user') + this.to_user;
                        stringToDisplay += '<br/>' + _t('registration', 'user_agent') + this.user_agent;
                        stringToDisplay += '<br/>' + _t('registration', 'username') + this.username;
                        stringToDisplay += '<br/>' + _t('registration', 'date') + humanTime;

                        tab_data.push([this.username, this.contact_ip, this.contact_port, humanTime, stringToDisplay]);
                    });

                    winkstart.table.registration.fnAddData(tab_data);

                    //Hack to hide pagination if number of rows < 10
                    if(reply.data.length < 10){
                        $('.dataTables_paginate', registration_html).hide();
                    }
			    }
            );
        },

		setup_table: function(parent) {
			var THIS = this,
			    columns = [
                {
                    'sTitle': _t('registration', 'username_stitle')
                },
                {
                    'sTitle': _t('registration', 'ip_stitle')
                },
                {
                    'sTitle': _t('registration', 'port_stitle')
                },
                {
                    'sTitle': _t('registration', 'date_stitle')
                },
                {
                    'sTitle': _t('registration', 'details_stitle'),
                    'fnRender': function(obj) {
                        winkstart.log(obj);
                        var reg_details = obj.aData[obj.iDataColumn];
                        return '<a href="#" onClick="winkstart.alert(\'info\',\''+reg_details+'\');">' + _t('registration', 'details') + '</a>';
                    }
                }
			];

			winkstart.table.create('registration', $('#registration-grid', parent), columns, {}, {
                sDom: 'frtlip',
                aaSorting: [[3, 'desc']]
            });

			$('#registration-grid_filter input[type=text]', parent).first().focus();

			$('.cancel-search', parent).click(function(){
				$('#registration-grid_filter input[type=text]', parent).val('');
				winkstart.table.registration.fnFilter('');
			});
		}
	}
);
