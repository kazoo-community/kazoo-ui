winkstart.module('voip', 'cdr', {
	css: [
        'css/cdr.css'
	],

	templates: {
		cdr: 'tmpl/cdr.html'
	},

	subscribe: {
		'cdr.activate': 'activate',
	},

	resources: {
		'cdr.list': {
			url: '{api_url}/accounts/{account_id}/cdrs',
			contentType: 'application/json',
			verb: 'GET'
		},
		'cdr.read': {
			url: '{api_url}/accounts/{account_id}/cdrs/{cdr_id}',
			contentType: 'application/json',
			verb: 'GET'
		},
        'cdr.list_by_week': {
			url: '{api_url}/accounts/{account_id}/cdrs?created_from={created_from}&created_to={created_to}',
			contentType: 'application/json',
			verb: 'GET'
        }
	}
},
function(args) {
    winkstart.registerResources(this.__whapp, this.config.resources);

	winkstart.publish('subnav.add', {
        whapp: 'voip',
		module: this.__module,
		label: 'Call History',
		icon: 'cdr',
        weight: '50',
        category: 'advanced'
	});
},
{
    list_by_date: function(start_date, end_date) {
		function noData(data){
			if(data == null || data == undefined){
				data = '-';
			}

			return data;
		}

		winkstart.getJSON('cdr.list_by_week', {
                crossbar: true,
                account_id: winkstart.apps['voip'].account_id,
                api_url: winkstart.apps['voip'].api_url,
                created_from: start_date,
                created_to: end_date
            },
            function(reply) {
                $.each(reply.data, function() {
                    var cdr_id = this.cid || this.id;
                    var caller_id_name = this.caller_id_name;
                    var caller_id_number = this.caller_id_number;
                    var callee_id_name = this.callee_id_name;
                    var callee_id_number = this.callee_id_number;
                    //var duration = this.billing_seconds;
                    var duration = this.duration_seconds;
                    var seconds = duration % 60;
                    var minutes = (duration-seconds) / 60;

                    if(minutes > 59) {
                        minutes -= 60;
                    }
                    var hours = (duration - (minutes*60) - seconds) / 3600;
                    if(hours < 10) {
                        hours = '0' + hours;
                    }
                    if(minutes < 10) {
                        minutes = '0' + minutes;
                    }
                    if(seconds < 10) {
                        seconds = '0' + seconds;
                    }
                    duration = hours+':'+minutes+':'+seconds;
                    var date = new Date((this.timestamp - 62167219200)*1000);
                    var month = date.getMonth() +1;
                    var year = date.getFullYear();
                    var day = date.getDate();
                    var humanDate = month+'/'+day+'/'+year;
                    var humanTime = date.toLocaleTimeString();

                    var humanFullDate = humanDate + ' ' + humanTime;

                    if(caller_id_name && caller_id_number && callee_id_name && callee_id_number){
                        winkstart.table.cdr.fnAddData([
                            noData(caller_id_name),
                            noData(caller_id_number),
                            noData(callee_id_name),
                            noData(callee_id_number),
                            noData(duration),
                            noData(humanFullDate)
                        ]);
                    }
                });
            }
        );
    },

    init_table: function(parent) {
        var cdr_html = parent,
		    columns = [
            {
                'sTitle': 'Caller ID Name',
                'sWidth': '150px'
            },

            {
                'sTitle': 'Caller ID Number',
                'sWidth': '150px'
            },
            {
                'sTitle': 'Callee ID Name',
                'sWidth': '150px'
            },
            {
                'sTitle': 'Callee ID Number',
                'sWidth': '150px'
            },
            {
                'sTitle': 'Duration',
                'sWidth': '80px'
            },
            {
                'sTitle': 'Date'
            }
		];

		winkstart.table.create('cdr', $('#cdr-grid', cdr_html), columns, {}, {
			sDom: '<"date">frtlip'
		});
    },

	activate: function(data) {
		var THIS = this,
            cdr_html = this.templates.cdr.tmpl({});

		$('#ws-content').empty().append(cdr_html);

        THIS.init_table(cdr_html);

		var functionFilter = function(oSettings, aData, iDataIndex) {
			var dateMin = '',
			    dateMax = '';

			if($('#startDate', cdr_html).val() != '') {
				dateMin = new Date($('#startDate', cdr_html).val());
			}
			if($('#endDate', cdr_html).val() != '') {
				dateMax = new Date($('#endDate', cdr_html).val());
			}
			var dateVersion = new Date(aData[5]);
			if ( dateMin == "" && dateMax == "" )
			{
				return true;
			}
			else if ( dateMin == "" && dateVersion <= dateMax )
			{
				return true;
			}
			else if ( dateMin <= dateVersion && "" == dateMax )
			{
				return true;
			}
			else if ( dateMin <= dateVersion && dateVersion <= dateMax )
			{
				return true;
			}
			return false;
		};

		$.fn.dataTableExt.afnFiltering.pop();

		$('div.date', cdr_html).html('Start Date: <input id="startDate" type="text"/>&nbsp;&nbsp;End Date: <input id="endDate" type="text"/>&nbsp;&nbsp;&nbsp;&nbsp;<a class="button-search fancy_button blue" id="searchLink" href="javascript:void(0);">Filter</a>');

		$('#startDate, #endDate', cdr_html).focus(function() {
			$('div.date input', cdr_html).removeClass('focusField');
			$(this).addClass('focusField');
		});

		$('#searchLink', cdr_html).click(function() {
//			$.fn.dataTableExt.afnFiltering.push(functionFilter);
//			winkstart.table.cdr.fnDraw();

            winkstart.table.cdr.fnClearTable();
            var start_date = $('#startDate', cdr_html).val(),
                end_date = $('#endDate', cdr_html).val();

            //todo regex to match date
            var start_date_sec = (new Date(start_date).getTime()/1000) + 62167219200,
                end_date_sec = (new Date(end_date).getTime()/1000) + 62167219200

            THIS.list_by_date(start_date_sec, end_date_sec);
		});

		$('#startDate', cdr_html).datepicker();
		$('#endDate', cdr_html).datepicker();

        var current_time = Math.floor(new Date().getTime()/1000) + 62167219200,
            prev_week_time = current_time - (7*24*60*60);

        THIS.list_by_date(prev_week_time, current_time);
	}
});
