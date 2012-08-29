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
                { id: 'bl0', title: '107.88.123.120', wait_time: 32, queue_id: 'queue_1' },
                { id: 'bl1', title: '107.88.123.121', wait_time: 135, queue_id: 'queue_2' },
                { id: 'bl2', title: '107.88.123.122', wait_time: 637, queue_id: 'queue_3' },
                { id: 'bl3', title: '107.88.123.88', wait_time: 2, queue_id: 'queue_4' },
                { id: 'bl4', title: '107.88.123.124', wait_time: 292, queue_id: 'queue_3' },
                { id: 'bl5', title: '107.88.123.125', wait_time: 282, queue_id: 'queue_1' },
                { id: 'bl6', title: '107.123.123.126', wait_time: 870, queue_id: 'queue_2' },
                { id: 'bl7', title: '123.107.88.127', wait_time: 95, queue_id: 'queue_3' },
                { id: 'bl8', title: '123.107.123.128', wait_time: 14, queue_id: 'queue_4' },
                { id: 'bl9', title: '123.107.88.129', wait_time: 547, queue_id: 'queue_1' },
                { id: 'bl10', title: '123.107.88.130', wait_time: 32, queue_id: 'queue_2' },
                { id: 'bl11', title: '123.107.123.131', wait_time: 135, queue_id: 'queue_1' },
                { id: 'bl12', title: '123.107.88.132', wait_time: 637, queue_id: 'queue_1' },
                { id: 'bl13', title: '123.88.107.133', wait_time: 2, queue_id: 'queue_1' },
                { id: 'bl14', title: '123.88.107.134', wait_time: 292, queue_id: 'queue_1' },
                { id: 'bl15', title: '123.88.107.135', wait_time: 282, queue_id: 'queue_1' },
                { id: 'bl16', title: '123.88.107.136', wait_time: 870, queue_id: 'queue_1' },
                { id: 'bl17', title: '123.88.107.137', wait_time: 95, queue_id: 'queue_1' },
                { id: 'bl18', title: '123.88.107.138', wait_time: 14, queue_id: 'queue_3' },
                { id: 'bl19', title: '123.88.107.139', wait_time: 547, queue_id: 'queue_1' }
            ];

            array_cw.sort(function(a, b) {
                return a.wait_time < b.wait_time ? -1 : 1;
            });

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
                $('#'+v.id).append('<span class="timer" data-seconds="'+ v.wait_time +'"></span>')
                           .dataset('queue_id', v.queue_id);
            });
        },

        move_gauge: function(active_calls, total_calls, _parent) {
            var THIS = this,
                parent = _parent;

            var rotate_deg = 'rotate('+(active_calls / total_calls) * 180+'deg)';
            $('#gauge_total_calls .min_calls', parent).html(active_calls);
            $('#gauge_total_calls .max_calls', parent).html(total_calls);
            $('#gauge_total_calls .top_part', parent).css({'-moz-transform': rotate_deg, '-webkit-transform': rotate_deg});
        },

        get_time_seconds: function(seconds) {
            var hours = Math.floor(seconds / 3600),
                minutes = Math.floor(seconds / 60) % 60,
                seconds = seconds % 60,
                display_time = (hours < 10 ? '0' + hours : '' + hours) + ':' + (minutes < 10 ? '0' + minutes : '' + minutes) + ':' + (seconds < 10 ? '0' + seconds : '' + seconds);

            return display_time;
        },

        render_timers: function(_parent) {
            var THIS = this,
                parent = _parent,
                start = function(target) {
                    if(!(target.hasClass('off'))) {
                        var seconds = parseFloat(target.dataset('seconds'));

                        target.dataset('seconds', ++seconds)
                              .html(THIS.get_time_seconds(seconds));
                    }
                };

            $('.timer', parent).each(function(k, v) {
                setInterval(function(){
                    start($(v));
                }, 1000);
            });
        },

        format_data: function(_data) {
            var THIS = this,
                data = _data,
                map_sort_status = {
                    'slacking': 1,
                    'calling': 2,
                    'break': 3,
                    'off': 4
                },
                total_calls = 0,
                active_calls = 0;

            data.agents.sort(function(a , b) {
                return map_sort_status[a.status] < map_sort_status[b.status] ? -1 : 1;
            });

            $.each(data.agents, function(k, v) {
                var queue_string = '';
                $.each(v.queues, function(k2, v2) {
                    queue_string += v2 + ' ';
                });
                v.queues = queue_string;
            });

            $.each(data.queues, function(k, v) {
                if(v.average_hold_time) {
                    v.average_hold_time = THIS.get_time_seconds(v.average_hold_time);
                    total_calls += v.max_calls;
                    active_calls += v.current_calls;
                }
            });

            data.total_calls = total_calls;
            data.active_calls = active_calls;

            return data;
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
                            { id: 'queue_1', name: 'Sales Queue', current_calls: 50, max_calls: 200, current_agents: 10, max_agents: 20, dropped_calls: 2, average_hold_time: 202 },
                            { id: 'queue_2', name: 'Tech Queue', current_calls: 15, max_calls: 20, current_agents: 18, max_agents: 20, dropped_calls: 7, average_hold_time: 431 },
                            { id: 'queue_3', name: 'QA Queue', current_calls: 2, max_calls: 5, current_agents: 2, max_agents: 5, dropped_calls: 7, average_hold_time: 1207 },
                            { id: 'queue_4', name: 'Executives Queue', current_calls: 1, max_calls: 1, current_agents: 1, max_agents: 1, dropped_calls: 232, average_hold_time: 23202 }
                        ],
                        agents: [
                            { id: 'agent_9', first_name: 'Erik', last_name: 'Muramoto', call_time: 1, break_time: 0, call_per_hour: 9, call_per_day: 47, status: 'calling', queues: ['queue_4'] },
                            { id: 'agent_3', first_name: 'Xavier', last_name: 'De la Grange', call_time: 0, break_time: 442, call_per_hour: 6, call_per_day: 42, status: 'break', queues: ['queue_4'] },
                            { id: 'agent_8', first_name: 'Richard', last_name: 'Hurlock', call_time: 0, break_time: 332, call_per_hour: 4, call_per_day: 24, status: 'break', queues: ['queue_4', 'queue_3'] },
                            { id: 'agent_4', first_name: 'Rachel', last_name: 'Lee', call_time: 194, break_time: 0, call_per_hour: 6, call_per_day: 37, status: 'calling', queues: ['queue_4', 'queue_2'] },
                            { id: 'agent_2', first_name: 'Jon', last_name: 'Blanton', call_time: 25, break_time: 0, call_per_hour: 2, call_per_day: 13, status: 'slacking', queues: ['queue_4', 'queue_1'] },
                            { id: 'agent_7', first_name: 'Patrick', last_name: 'Sullivan', call_time: 29, break_time: 0, call_per_hour: 5, call_per_day: 33, status: 'slacking', queues: ['queue_3', 'queue_2', 'queue_1', 'queue_4'] },
                            { id: 'agent_6', first_name: 'Dhruvi', last_name: 'Shah', call_time: 118, break_time: 0, call_per_hour: 12, call_per_day: 129, status: 'off', queues: ['queue_2', 'queue_1'] },
                            { id: 'agent_1', first_name: 'Jean-Roch', last_name: 'Maitre', call_time: 321, break_time: 0, call_per_hour: 3, call_per_day: 21, status: 'calling', queues: ['queue_3', 'queue_1'] },
                            { id: 'agent_5', first_name: 'Kate', last_name: 'Zucchino', call_time: 222, break_time: 0, call_per_hour: 1, call_per_day: 2, status: 'calling', queues: ['queue_2'] },
                            { id: 'agent_10', first_name: 'James', last_name: 'Aimonetti', call_time: 534, break_time: 0, call_per_hour: 1, call_per_day: 4, status: 'off', queues: ['queue_1'] }
                        ]
                    };

                    _data = THIS.format_data(_data);

                    dashboard_html = THIS.templates.dashboard.tmpl(_data);

                    $('.list_queues_inner > li', dashboard_html).click(function() {
                        var $this_queue = $(this),
                            queue_id = $this_queue.attr('id');

                        if($this_queue.hasClass('active')) {
                            THIS.move_gauge(_data.active_calls, _data.total_calls, parent);
                            $('.agent_wrapper', dashboard_html).show();
                            $('#callwaiting-list li', dashboard_html).show();

                            $('.list_queues_inner > li', dashboard_html).removeClass('active');
                        }
                        else {
                            THIS.move_gauge($this_queue.dataset('current_calls'), $this_queue.dataset('total_calls'), parent);

                            $('.list_queues_inner > li', dashboard_html).removeClass('active');
                            $this_queue.addClass('active');

                            $('#callwaiting-list li', dashboard_html).each(function(k, v) {
                                var $v = $(v);

                                if($v.dataset('queue_id') !== queue_id) {
                                    $v.hide();
                                }
                                else {
                                    $v.show();
                                }
                            });

                            $('.agent_wrapper', dashboard_html).each(function(k, v) {
                                var $v = $(v);

                                if($v.dataset('queues').indexOf(queue_id) < 0) {
                                    $v.hide();
                                }
                                else {
                                    $v.show();
                                }
                            });
                        }
                    });

                    THIS.move_gauge(_data.active_calls, _data.total_calls, dashboard_html);

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
