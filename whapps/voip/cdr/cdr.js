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
        var THIS = this;

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
                var cdr_id, caller_id_name, caller_id_number, callee_id_name, callee_id_number, hangup_cause, duration, seconds, minutes, date, hours, month, year, day, humanDate, humanTime, humanFullDate, web_browser_id;

                $.each(reply.data, function() {
                    cdr_id = this.cid || this.id;
                    caller_id_name = this.caller_id_name;
                    caller_id_number = this.caller_id_number;
                    callee_id_name = this.callee_id_name;
                    callee_id_number = this.callee_id_number;
                    hangup_cause = this.hangup_cause;
                    duration = this.duration_seconds;
                    seconds = duration % 60;
                    minutes = (duration-seconds) / 60;

                     hours = (duration - (minutes*60) - seconds) / 3600;
                    if(hours < 10) {
                        hours = '0' + hours;
                    }

                    if(minutes > 59) {
                        minutes -= 60;
                    }
                    if(minutes < 10) {
                        minutes = '0' + minutes;
                    }
                    if(seconds < 10) {
                        seconds = '0' + seconds;
                    }
                    duration = hours+':'+minutes+':'+seconds;
                    date = new Date((this.timestamp - 62167219200)*1000);
                    month = date.getMonth() +1;
                    year = date.getFullYear();
                    day = date.getDate();
                    humanDate = month+'/'+day+'/'+year;
                    humanTime = date.toLocaleTimeString();
                    web_browser_id = THIS.parse_cdr_id(cdr_id);

                    humanFullDate = humanDate + ' ' + humanTime;

                    if(caller_id_name && caller_id_number && callee_id_name && callee_id_number){
                        winkstart.table.cdr.fnAddData([
                            noData(caller_id_name),
                            noData(caller_id_number),
                            noData(callee_id_name),
                            noData(callee_id_number),
                            noData(duration),
                            noData(hangup_cause),
                            '<a href="http://www.google.com/'+web_browser_id +'" target="_blank">Log</a>',
                            noData(humanFullDate)
                        ]);
                    }
                });
            }
        );
    },

    parse_cdr_id: function(cdr_id) {
        return cdr_id.substr(0,1) + '/' + cdr_id.substr(1,1) + '/' + cdr_id.substr(2,1) + '/' + cdr_id;
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
                'sTitle': 'Hangup Cause',
                'sWidth': '150px'
            },
            {
                'sTitle': 'Logs',
                'sWidth': '150px'
            },
            {
                'sTitle': 'Date'
            }
		];

		winkstart.table.create('cdr', $('#cdr-grid', cdr_html), columns, {}, {
			sDom: '<"date">frtlip',
            aaSorting: [[7, 'desc']]
		});
    },

	activate: function(data) {
		var THIS = this,
            cdr_html = this.templates.cdr.tmpl({});

		$('#ws-content').empty().append(cdr_html);

        THIS.init_table(cdr_html);

		$.fn.dataTableExt.afnFiltering.pop();

		$('div.date', cdr_html).html('Start Date: <input id="startDate" readonly="readonly" type="text"/>&nbsp;&nbsp;End Date: <input id="endDate" readonly="readonly" type="text"/>&nbsp;&nbsp;&nbsp;&nbsp;<a class="button-search fancy_button blue" id="searchLink" href="javascript:void(0);">Filter</a>');

		$('#searchLink', cdr_html).click(function() {
            var start_date = $('#startDate', cdr_html).val(),
                end_date = $('#endDate', cdr_html).val(),
                regex = /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$/;

            winkstart.table.cdr.fnClearTable();

            if(start_date.match(regex) && end_date.match(regex)) {
                var start_date_sec = (new Date(start_date).getTime()/1000) + 62167219200,
                    end_date_sec = (new Date(end_date).getTime()/1000) + 62167219200;

                if((end_date_sec - start_date_sec) <= (7*24*60*60)) {
                    THIS.list_by_date(start_date_sec, end_date_sec);
                }
                else {
                    winkstart.alert('The range is bigger than 7 days, please correct it.');
                }
            }
            else {
                winkstart.alert('Dates in the filter are not in the proper format (mm/dd/yyyy)');
            }
		});

        THIS.init_datepicker(cdr_html);

        var tomorrow = new Date(THIS.to_string_date(new Date()));
        tomorrow.setDate(tomorrow.getDate() + 1);

        var end_date = Math.floor(tomorrow.getTime()/1000) + 62167219200,
            start_date = end_date - (7*24*60*60);

        THIS.list_by_date(start_date, end_date);
	},

    init_datepicker: function(parent) {
        var THIS = this,
            cdr_html = parent,
            $start_date = $('#startDate', cdr_html),
            $end_date = $('#endDate', cdr_html),
            start_date = new Date(),
            end_date,
            tomorrow = new Date();

        tomorrow.setDate(tomorrow.getDate() + 1);

		$('#startDate, #endDate', cdr_html).datepicker(
            {
                beforeShow: customRange,
                onSelect: customSelect
            }
        );

        start_date.setDate(tomorrow.getDate() - 7);
        end_date = tomorrow;

        $start_date.datepicker('setDate', start_date);
        $end_date.datepicker('setDate', end_date);

        function customSelect(dateText, input) {
            var date_min,
                date_max;

            if(input.id == 'startDate') {
                date_min = $start_date.datepicker('getDate');
                if($end_date.datepicker('getDate') == null) {
                    date_max = date_min;
                    date_max.setDate(date_min.getDate() + 7);
                    $end_date.val(THIS.to_string_date(date_max));
                }
                else {
                    date_max = $end_date.datepicker('getDate');
                    if((date_max > (new Date(date_min).setDate(date_min.getDate() + 7)) || (date_max <= date_min))) {
                        date_max = date_min;
                        date_max.setDate(date_max.getDate() + 7);
                        date_max > tomorrow ? date_max = tomorrow : true;
                        $end_date.val(THIS.to_string_date(date_max));
                    }
                }
            }
            else if(input.id == 'endDate') {
                if($start_date.datepicker('getDate') == null) {
                    date_min = $end_date.datepicker('getDate');
                    date_min.setDate(date_min.getDate() - 7);
                    $start_date.val(THIS.to_string_date(date_min));
                }
            }
        };

        function customRange(input) {
            var date_min = new Date(2011, 0, 0),
                date_max;

            if (input.id == 'endDate')
            {
                date_max = tomorrow;
                if ($start_date.datepicker('getDate') != null)
                {
                    date_min = $start_date.datepicker('getDate');
                    /* Range of 1 day minimum */
                    date_min.setDate(date_min.getDate() + 1);
                    date_max = $start_date.datepicker('getDate');
                    date_max.setDate(date_max.getDate() + 7);

                    if(date_max > tomorrow) {
                        date_max = tomorrow;
                    }
                }
            }
            else if (input.id == 'startDate') {
                date_max = new Date();
            }

            return {
                minDate: date_min,
                maxDate: date_max
            };
        }
    },

    to_string_date: function(date) {
       var day = date.getDate(),
                month = date.getMonth()+1,
                year = date.getFullYear();

            day < 10 ? day = '0' + day : true;
            month < 10 ? month = '0' + month : true;

            return month+'/'+day+'/'+year;
    }
});
