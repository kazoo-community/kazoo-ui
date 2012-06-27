winkstart.module('userportal', 'user_cdr', {
	css: [
        'css/user_cdr.css'
	],

	templates: {
		user_cdr: 'tmpl/user_cdr.html'
	},

	subscribe: {
		'user_cdr.activate': 'activate',
	},

	resources: {
		'user_cdr.list': {
			url: '{api_url}/accounts/{account_id}/users/{user_id}/cdrs',
			contentType: 'application/json',
			verb: 'GET'
		},
        'user_cdr.list_by_week': {
			url: '{api_url}/accounts/{account_id}/users/{user_id}/cdrs?created_from={created_from}&created_to={created_to}',
			contentType: 'application/json',
			verb: 'GET'
        }
	}
},
function(args) {
    winkstart.registerResources(this.__whapp, this.config.resources);

	winkstart.publish('whappnav.subnav.add', {
        whapp: 'userportal',
		module: this.__module,
		label: 'My Call History',
		icon: 'cdr',
        weight: '100'
	});
},
{
    user_cdr_range: 7,

    list_by_date: function(start_date, end_date) {
        var THIS = this,
            parse_duration = function(duration, type) {
                var duration = parseFloat(duration);
                    seconds = duration % 60,
                    minutes = ((duration - seconds) / 60) % 60,
                    hours = Math.floor((duration-seconds)/3600),
                    type = type || 'numbers';

                if(hours < 10 && type == 'numbers') {
                    hours = '0' + hours;
                }
                if(minutes < 10) {
                    minutes = '0' + minutes;
                }
                if(seconds < 10) {
                    seconds = '0' + seconds;
                }

                if(type == 'verbose') {
                    duration = hours+' hours '+minutes+' minutes and '+seconds+' seconds';
                }
                else {
                    duration = hours+':'+minutes+':'+seconds;
                }

                return duration;
            },
            parse_date = function(timestamp) {
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

        winkstart.request(true, 'user_cdr.list_by_week', {
                account_id: winkstart.apps['userportal'].account_id,
                api_url: winkstart.apps['userportal'].api_url,
                user_id: winkstart.apps['userportal'].user_id,
                created_from: start_date,
                created_to: end_date
            },
            function(_data, status) {
                var duration,
                    humanFullDate,
                    call_duration = 0;

                var tab_data = [];

                $.each(_data.data, function() {
                    if(this.duration_seconds > 0) {
                        duration = this.duration_seconds >= 0 ? parse_duration(this.duration_seconds) : '--';
                        humanFullDate = parse_date(this.timestamp);
                        call_duration += this.duration_seconds >= 0 ? parseFloat(this.duration_seconds) : 0;

                        tab_data.push([
                            humanFullDate,
                            this.caller_id_number === this.caller_id_name ? this.caller_id_number || '(empty)' : this.caller_id_number + ' (' + this.caller_id_name+')',
                            this.callee_id_number === this.callee_id_name ? this.callee_id_number || this.to.substring(0, this.to.indexOf('@') != -1 ? this.to.indexOf('@') : this.to.length) || '(empty)' : this.callee_id_number + ' (' + this.callee_id_name+')',
                            duration || '-',
                            this.duration_seconds
                        ]);
                    }
                });

                call_duration = 'Total duration : ' + parse_duration(call_duration, 'verbose');
                $('.call_duration', '#user_cdr-grid_wrapper').text(call_duration);

                winkstart.table.user_cdr.fnAddData(tab_data);
            }
        );
    },

    init_table: function(parent) {
        var user_cdr_html = parent,
		    columns = [
            {
                'sTitle': 'Date',
                'sWidth': '250px'
            },

            {
                'sTitle': 'From (Caller ID)',
                'sWidth': '350px'
            },
            {
                'sTitle': 'To (Dialed number)',
                'sWidth': '350px'
            },
            {
                'sTitle': 'Duration',
                'sWidth': '160px'
            },
            {
                'sTitle': 'billing_seconds',
                'bVisible': false
            }
		];

		winkstart.table.create('user_cdr', $('#user_cdr-grid', user_cdr_html), columns, {}, {
			sDom: '<"date">frtlip',
            aaSorting: [[0, 'desc']]
		});
    },

	activate: function(data) {
		var THIS = this,
            user_cdr_html = this.templates.user_cdr.tmpl({}),
            range = THIS.user_cdr_range;

		$('#ws-content').empty().append(user_cdr_html);

        THIS.init_table(user_cdr_html);

		$.fn.dataTableExt.afnFiltering.pop();

		$('div.date', user_cdr_html).html('Start Date: <input id="startDate" readonly="readonly" type="text"/>&nbsp;&nbsp;End Date: <input id="endDate" readonly="readonly" type="text"/>&nbsp;&nbsp;&nbsp;&nbsp;<button class="button-search btn primary" id="searchLink" href="javascript:void(0);">Filter</button><label class="call_duration"/>');

        $('#user_cdr-grid_filter input[type=text]', '#user_cdr-grid_wrapper').keyup(function() {
            if($(this).val() != '') {
                $('.call_duration', '#user_cdr-grid_wrapper').hide();
            }
            else {
                $('.call_duration', '#user_cdr-grid_wrapper').show();
            }
        });

		$('#searchLink', user_cdr_html).click(function() {
            var start_date = $('#startDate', user_cdr_html).val(),
                end_date = $('#endDate', user_cdr_html).val(),
                regex = /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$/;

            winkstart.table.user_cdr.fnClearTable();
            $('.call_duration', '#user_cdr-grid_wrapper').text('');

            if(start_date.match(regex) && end_date.match(regex)) {
                var start_date_sec = (new Date(start_date).getTime()/1000) + 62167219200,
                    end_date_sec = (new Date(end_date).getTime()/1000) + 62167219200;

                if((end_date_sec - start_date_sec) <= (range*24*60*60)) {
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

        THIS.init_datepicker(user_cdr_html);

        var tomorrow = new Date(THIS.to_string_date(new Date()));
        tomorrow.setDate(tomorrow.getDate() + 1);

        var end_date = Math.floor(tomorrow.getTime()/1000) + 62167219200,
            start_date = end_date - (range*24*60*60);

        THIS.list_by_date(start_date, end_date);
	},

    init_datepicker: function(parent) {
        var THIS = this,
            user_cdr_html = parent,
            $start_date = $('#startDate', user_cdr_html),
            $end_date = $('#endDate', user_cdr_html),
            start_date = new Date(),
            end_date,
            tomorrow = new Date(),
            range = THIS.user_cdr_range;

        tomorrow.setDate(tomorrow.getDate() + 1);

		$('#startDate, #endDate', user_cdr_html).datepicker(
            {
                beforeShow: customRange,
                onSelect: customSelect
            }
        );

        end_date = tomorrow;
        start_date.setDate(new Date().getDate() - range + 1);

        $start_date.datepicker('setDate', start_date);
        $end_date.datepicker('setDate', end_date);

        function customSelect(dateText, input) {
            var date_min,
                date_max;

            if(input.id == 'startDate') {
                date_min = $start_date.datepicker('getDate');
                if($end_date.datepicker('getDate') == null) {
                    date_max = date_min;
                    date_max.setDate(date_min.getDate() + range);
                    $end_date.val(THIS.to_string_date(date_max));
                }
                else {
                    date_max = $end_date.datepicker('getDate');
                    if((date_max > (new Date(date_min).setDate(date_min.getDate() + range)) || (date_max <= date_min))) {
                        date_max = date_min;
                        date_max.setDate(date_max.getDate() + range);
                        date_max > tomorrow ? date_max = tomorrow : true;
                        $end_date.val(THIS.to_string_date(date_max));
                    }
                }
            }
            else if(input.id == 'endDate') {
                if($start_date.datepicker('getDate') == null) {
                    date_min = $end_date.datepicker('getDate');
                    date_min.setDate(date_min.getDate() - 1);
                    $start_date.val(THIS.to_string_date(date_min));
                }
            }
        };

        function customRange(input) {
            var date_min = new Date(2011, 0, 0),
                date_max,
                range = THIS.user_cdr_range;

            if (input.id == 'endDate')
            {
                date_max = tomorrow;
                if ($start_date.datepicker('getDate') != null)
                {
                    date_min = $start_date.datepicker('getDate');
                    /* Range of 1 day minimum */
                    date_min.setDate(date_min.getDate() + 1);
                    date_max = $start_date.datepicker('getDate');
                    date_max.setDate(date_max.getDate() + range);

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
