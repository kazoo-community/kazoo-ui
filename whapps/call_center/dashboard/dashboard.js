winkstart.module('call_center', 'dashboard', {
        css: [
            'css/dashboard.css'
        ],

        templates: {
            dashboard: 'tmpl/dashboard.html'
        },

        subscribe: {
            'dashboard.activate': 'activate',
        },

        validation: [
        ],

        resources: {
            'dashboard.queue.list': {
                url: '{api_url}/accounts/{account_id}/queues',
                contentType: 'application/json',
                verb: 'GET'
            },
            'dashboard.queue.get': {
                url: '{api_url}/accounts/{account_id}/queues/{queue_id}',
                contentType: 'application/json',
                verb: 'GET'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        winkstart.publish('whappnav.subnav.add', {
            whapp: 'call_center',
            module: THIS.__module,
            label: 'Dashboard',
            icon: 'graph1_box',
            weight: '20'
        });
    },

    {
        render_callwaiting_list: function(_parent){
            var THIS = this,
                parent = _parent || $('#dashboard-content');;

            /*winkstart.request(true, 'dashboard.queue.list', {
                    account_id: winkstart.apps['call_center'].account_id,
                    api_url: winkstart.apps['call_center'].api_url
                },
                function (data, status) {
                    var map_crossbar_data = function(data) {
                       var new_list = [];

                        if(data.length > 0) {
                            $.each(data, function(key, val) {
                                new_list.push({
                                    id: val.id,
                                    title: val.name || '(no name)'
                                });
                            });
                        }

                        new_list.sort(function(a, b) {
                            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                        });

                        return new_list;
                    };
                    //data: map_crossbar_data(data.data),
                }
            );*/

            var array_cw = [
                { id: 'bl0', title: '123.123.123.120', wait_time: 32 },
                { id: 'bl1', title: '123.123.123.121', wait_time: 135 },
                { id: 'bl2', title: '123.123.123.122', wait_time: 637 },
                { id: 'bl3', title: '123.123.123.123', wait_time: 2 },
                { id: 'bl4', title: '123.123.123.124', wait_time: 292 }
            ];

            $('#callwaiting-list', parent)
                .empty()
                .listpanel({
                    label: 'Call Waiting',
                    identifier: 'callwaiting-listview',
                    data: array_cw
                });

            $('.add_flow', parent).empty()
                                  .html('Call Waiting Log...');

            $.each(array_cw, function(k, v) {
                $('#'+v.id).append('<span class="timer" data-seconds="'+ v.wait_time +'"></span>');
            });
        },

        render_gauge: function(_parent) {
            var THIS = this,
                parent = _parent,
                data = [
                      ['Label', 'Value'],
                      ['Total Calls', 135],
                    ],
                options = {
                    width: 400,
                    height: 205,
                    minorTicks: 4,
                    min: 0,
                    max: 280,
                    yellowFrom: 210,
                    yellowTo: 245,
                    redFrom: 245,
                    redTo: 280
                },
                chart = new winkstart.chart('gauge_calls', data, options, 'gauge');
        },

        render_timers: function(_parent) {
            var THIS = this,
                parent = _parent,
                get_time_seconds = function(seconds) {
                    var hours = Math.floor(seconds / 3600),
                        minutes = Math.floor(seconds / 60) % 60,
                        seconds = seconds % 60,
                        display_time = (hours < 10 ? '0' + hours : '' + hours) + ':' + (minutes < 10 ? '0' + minutes : '' + minutes) + ':' + (seconds < 10 ? '0' + seconds : '' + seconds);

                    return display_time;
                },
                start = function(target) {
                    if(!(target.hasClass('off'))) {
                        var seconds = parseFloat(target.dataset('seconds'));

                        target.dataset('seconds', ++seconds)
                              .html(get_time_seconds(seconds));
                    }
                };

                $('.timer', parent).each(function(k, v) {
                    setInterval(function(){ start($(v)) }, 1000);
                });
        },

        render_dashboard: function(_parent) {
            var THIS = this,
                parent = _parent;

            /*winkstart.request('queues.get', {
                    api_url: winkstart.apps['call_center'].api_url,
                    account_id: winkstart.apps['call_center'].account_id
                },
                function(_data, status) {*/
                    var _data = {
                        queues: [
                            { id: 'queue_1', name: 'Sales Queue', current_calls: 5, max_calls: 20, current_agents: 10, max_agents: 20, dropped_calls: 2, average_hold_time: 202 },
                            { id: 'queue_2', name: 'Tech Queue', current_calls: 15, max_calls: 20, current_agents: 18, max_agents: 20, dropped_calls: 7, average_hold_time: 431 },
                            { id: 'queue_3', name: 'QA Queue', current_calls: 2, max_calls: 5, current_agents: 2, max_agents: 5, dropped_calls: 7, average_hold_time: 1207 },
                            { id: 'queue_4', name: 'Executives Queue', current_calls: 1, max_calls: 1, current_agents: 1, max_agents: 1, dropped_calls: 232, average_hold_time: 23202 }
                        ],
                        agents: [
                            { id: 'agent_3', first_name: 'Xavier', last_name: 'De la Grange', call_time: 0, break_time: 442, call_per_hour: 6, call_per_day: 42, status: 'break', queue_id: 'queue_1' },
                            { id: 'agent_8', first_name: 'Richard', last_name: 'Hurlock', call_time: 0, break_time: 332, call_per_hour: 4, call_per_day: 24, status: 'break', queue_id: 'queue_2' },
                            { id: 'agent_1', first_name: 'Jean-Roch', last_name: 'Maitre', call_time: 321, break_time: 0, call_per_hour: 3, call_per_day: 21, status: 'calling', queue_id: 'queue_3' },
                            { id: 'agent_4', first_name: 'Rachel', last_name: 'Lee', call_time: 194, break_time: 0, call_per_hour: 6, call_per_day: 37, status: 'calling', queue_id: 'queue_1' },
                            { id: 'agent_5', first_name: 'Kate', last_name: 'Zucchino', call_time: 222, break_time: 0, call_per_hour: 1, call_per_day: 2, status: 'calling', queue_id: 'queue_2' },
                            { id: 'agent_9', first_name: 'Erik', last_name: 'Muramoto', call_time: 1, break_time: 0, call_per_hour: 9, call_per_day: 47, status: 'calling', queue_id: 'queue_4' },
                            { id: 'agent_2', first_name: 'Jon', last_name: 'Blanton', call_time: 25, break_time: 0, call_per_hour: 2, call_per_day: 13, status: 'slacking', queue_id: 'queue_4' },
                            { id: 'agent_7', first_name: 'Patrick', last_name: 'Sullivan', call_time: 29, break_time: 0, call_per_hour: 5, call_per_day: 33, status: 'slacking', queue_id: 'queue_3' },
                            { id: 'agent_6', first_name: 'Dhruvi', last_name: 'Shah', call_time: 118, break_time: 0, call_per_hour: 12, call_per_day: 129, status: 'off', queue_id: 'queue_2' },
                            { id: 'agent_10', first_name: 'James', last_name: 'Aimonetti', call_time: 534, break_time: 0, call_per_hour: 1, call_per_day: 4, status: 'off', queue_id: 'queue_1' },
                        ]
                    };

                    dashboard_html = THIS.templates.dashboard.tmpl(_data);

                    $('.list_queues_inner > li', dashboard_html).click(function() {
                        var $this_queue = $(this),
                            queue_id = $this_queue.attr('id');

                        if($this_queue.hasClass('active')) {
                            $('.agent_wrapper', dashboard_html).show();

                            $('.list_queues_inner > li', dashboard_html).removeClass('active');
                        }
                        else {
                            $('.list_queues_inner > li', dashboard_html).removeClass('active');
                            $this_queue.addClass('active');

                            $('.agent_wrapper', dashboard_html).each(function(k, v) {
                                var $v = $(v);

                                if($v.dataset('queue_id') !== queue_id) {
                                    $v.hide();
                                }
                                else {
                                    $v.show();
                                }
                            });
                        }
                    });

                    THIS.render_gauge(dashboard_html);

                    (parent)
                        .empty()
                        .append(dashboard_html);

                    THIS.render_callwaiting_list(dashboard_html);

                    THIS.render_timers(dashboard_html);
                /*},
                function(_data, status) {

                }
            );*/
        },

        activate: function(_parent) {
            var THIS = this,
                parent = _parent || $('#ws-content');

            THIS.render_dashboard(parent);
        }
    }
);
