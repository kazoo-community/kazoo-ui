winkstart.module('call_center', 'dashboard', {
        css: [
            'css/dashboard.css'
        ],

        templates: {
            dashboard: 'tmpl/dashboard.html'
        },

        subscribe: {
            'dashboard.activate': 'activate',
            'dashboard.activate_queue_stat': 'activate_queue_stat'
        },

        resources: {
            'dashboard.queues.stats': {
                url: '{api_url}/accounts/{account_id}/queues/stats',
                contentType: 'application/json',
                verb: 'GET'
            },
            'dashboard.agents.stats': {
                url: '{api_url}/accounts/{account_id}/agents/stats',
                contentType: 'application/json',
                verb: 'GET'
            },
            'dashboard.agents.livestats': {
                url: '{api_url}/accounts/{account_id}/agents/stats/realtime',
                contentType: 'application/json',
                verb: 'GET',
                trigger_events: false
            },
            'dashboard.queues.list': {
                url: '{api_url}/accounts/{account_id}/queues',
                contentType: 'application/json',
                verb: 'GET'
            },
            'dashboard.queues.get': {
                url: '{api_url}/accounts/{account_id}/queues/{queue_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'dashboard.agents.get': {
                url: '{api_url}/accounts/{account_id}/agents',
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
        polling: false,

        map_timers: {},

        poll_agents: function(global_data, _parent) {
            console.log(global_data);
            var THIS = this,
                parent = _parent,
                polling_interval = 2,
                updated_users = {},
                map_agents = {},
                poll = function() {
                    if($('#dashboard-content').size() === 0) {
                        clearInterval(interval);
                        THIS.polling = false;
                    }
                    else {
                        THIS.get_agents_livestats(function(_data_agents) {
                            console.log(_data_agents);
                            if(_data_agents.data.current_calls) {
                                $.each(_data_agents.data.current_calls, function(k, v) {
                                    if(v.agent_state === 'answered' && !(k in updated_users)) {
                                        updated_users[k] = true;
                                        $('.agent_wrapper#'+k, parent).removeClass('slacking break off')
                                                          .addClass('calling');

                                        THIS.start_timer($('.agent_wrapper#'+k+' .call_time .data_value', parent), v.duration, k);
                                    }
                                });
                            }

                            $.each(updated_users, function(k, v) {
                                if(!(k in _data_agents.data.current_calls)) {
                                    $('.agent_wrapper#'+k, parent).removeClass('calling')
                                                                  .addClass('slacking');

                                    //THIS.stop_timer
                                    clearInterval(THIS.map_timers[k]);
                                    $('.agent_wrapper#'+k+' .call_time .data_value', parent).html('-');
                                    delete THIS.map_timers[k];

                                    delete updated_users[k];
                                }
                            });
                            console.log(updated_users);
                        });
                    }
                };

            $.each(global_data.agents, function(k, v) {
                map_agents[v.id] = true;
            });

            if(THIS.polling === false) {
                interval = setInterval(poll, polling_interval * 1000);
            }

            THIS.polling = true;
        },

        get_agents_livestats: function(success, error) {
            winkstart.request('dashboard.agents.livestats', {
                    account_id: winkstart.apps['call_center'].account_id,
                    api_url: winkstart.apps['call_center'].api_url
                },
                function(_data, status) {
                    if(typeof success == 'function') {
                        success(_data, status);
                    }
                },
                function(_data, status) {
                    if(typeof error == 'function') {
                        error(_data, status);
                    }
                }
            );
        },

        get_agents_stats: function(success, error) {
            winkstart.request('dashboard.agents.stats', {
                    account_id: winkstart.apps['call_center'].account_id,
                    api_url: winkstart.apps['call_center'].api_url
                },
                function(_data, status) {
                    if(typeof success == 'function') {
                        success(_data, status);
                    }
                },
                function(_data, status) {
                    if(typeof error == 'function') {
                        error(_data, status);
                    }
                }
            );
        },

        get_queues_stats: function(success, error) {
            winkstart.request('dashboard.queues.stats', {
                    account_id: winkstart.apps['call_center'].account_id,
                    api_url: winkstart.apps['call_center'].api_url
                },
                function(_data, status) {
                    if(typeof success == 'function') {
                        success(_data, status);
                    }
                },
                function(_data, status) {
                    if(typeof error == 'function') {
                        error(_data, status);
                    }
                }
            );
        },

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
                { id: 'bl0', title: '415-202-4335', wait_time: 32, queue_id: 'queue_1' },
                { id: 'bl1', title: '415-392-4923', wait_time: 135, queue_id: 'queue_2' },
                { id: 'bl2', title: '415-828-6293', wait_time: 637, queue_id: 'queue_3' },
                { id: 'bl12', title: '415-929-1284', wait_time: 637, queue_id: 'queue_1' },
                { id: 'bl13', title: '415-009-3929', wait_time: 2, queue_id: 'queue_1' },
                { id: 'bl14', title: '415-772-7626', wait_time: 292, queue_id: 'queue_1' },
                { id: 'bl15', title: '415-441-9929', wait_time: 282, queue_id: 'queue_1' },
                { id: 'bl16', title: '415-878-0909', wait_time: 870, queue_id: 'queue_1' },
                { id: 'bl17', title: '415-111-3202', wait_time: 95, queue_id: 'queue_1' },
                { id: 'bl18', title: '415-636-2933', wait_time: 14, queue_id: 'queue_3' },
                { id: 'bl19', title: '415-256-3929', wait_time: 547, queue_id: 'queue_1' }
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

        start_timer: function(target, seconds, id) {
            var THIS = this,
                render_timer = function(target, seconds) {
                    if(!(target.hasClass('off'))) {
                        //var seconds = seconds;//parseFloat(target.dataset('seconds'));
                        //target.dataset('seconds', ++seconds)
                          //    .html(THIS.get_time_seconds(seconds));
                        target.html(THIS.get_time_seconds(seconds));
                    }
                };

            if(id) {
                THIS.map_timers[id] = setInterval(function(){render_timer(target, ++seconds);}, 1000);
            }
        },

        render_timers: function(_parent) {
            var THIS = this,
                parent = _parent;/*,
                start = function(target) {
                    if(!(target.hasClass('off'))) {
                        var seconds = parseFloat(target.dataset('seconds'));

                        target.dataset('seconds', ++seconds)
                              .html(THIS.get_time_seconds(seconds));
                    }
                };*/

            /*$('.timer', parent).each(function(k, v) {
                setInterval(function(){
                    start($(v));
                }, 1000);
            });*/

            $('.timer', parent).each(function(k, v) {
                //setInterval(function(){
                    THIS.start_timer($(v), $(v).dataset('seconds'));
                //}, 1000);
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
                active_calls = 0,
                map_agents_stats = THIS.format_agents_stats(_data),
                get_agent_stat = function(agent_id) {
                    return map_agents_stats[agent_id] || {
                        status: 'off',
                        call_time: 0,
                        break_time: 0,
                        call_per_hour: 0,
                        call_per_day: 0,
                        calls_missed: 0
                    };
                };

            $.each(data.agents, function(k, v) {
                var queue_string = '';
                $.extend(true, v, get_agent_stat(v.id));
                $.each(v.queues, function(k2, v2) {
                    queue_string += v2 + ' ';
                });
                v.queues = queue_string;
            });

            data.agents.sort(function(a , b) {
                return map_sort_status[a.status] < map_sort_status[b.status] ? -1 : 1;
            });

            $.each(data.queues, function(k, v) {
                //TODO remove
                $.extend(true, v, THIS.get_queue_random_data());
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

        format_agents_stats: function(data) {
            var THIS = this,
                map_agents_stats = {},
                agent;

            $.each(data.agents_stats.data, function(k, v) {
                agent = map_agents_stats[v.agent_id] || {
                    status: 'slacking',
                    call_time: 0,
                    break_time: 0,
                    call_per_hour: 0,
                    call_per_day: 0,
                    calls_missed: 0
                };

                if(v.calls_missed) {
                    $.each(v.calls_missed, function(k2, v2) {
                        agent.calls_missed++;
                    });
                }

                if(v.calls_handled) {
                    $.each(v.calls_handled, function(k2, v2) {
                        agent.call_per_day++;
                        if(THIS.get_diff_seconds(v.recorded_at) < 3600) {
                            agent.call_per_hour++;
                        }
                    });
                }

                map_agents_stats[v.agent_id] = agent;
            });

            return map_agents_stats;
        },

        get_diff_seconds: function(timestamp) {
            var date_var = new Date((timestamp - 62167219200)*1000).valueOf(),
                date_now = new Date().valueOf();

            return Math.round((date_now - date_var)/1000);
        },

        get_agent_random_data: function() {
            var THIS = this,
                status_array = ['calling', 'slacking', 'break', 'off'],
                status_random = status_array[THIS.random(3)];

            return {
                status: status_random,
                call_time: status_random === 'calling' ? THIS.random(1000) : 0,
                break_time: status_random === 'break' ? THIS.random(2000) : 0,
                call_per_hour: THIS.random(5, 10),
                call_per_day: THIS.random(30, 100)
            };
        },

        get_queue_random_data: function() {
            var THIS = this;

            return {
                current_calls: THIS.random(10, 20),
                max_calls: THIS.random(30,50),
                current_agents: THIS.random(10,20),
                max_agents: THIS.random(20,50),
                dropped_calls: THIS.random(5),
                average_hold_time: THIS.random(1000)
            };
        },

        random: function(param_min, param_max) {
            var min = param_max ? param_min : 0,
                max = param_max ? param_max+1 : param_min+1;

            var random = Math.floor(min + (Math.random() * (max - min)));

            return random;
        },

        render_dashboard: function(_parent, callback) {
            var THIS = this,
                parent = _parent;

            THIS.get_agents_stats(function(_data_stats_agents) {
                THIS.get_queues_stats(function(_data_stat_queues) {
                    winkstart.request('dashboard.queues.list', {
                            api_url: winkstart.apps['call_center'].api_url,
                            account_id: winkstart.apps['call_center'].account_id
                        },
                        function(_data_queues, status) {
                            winkstart.request('dashboard.agents.get', {
                                    api_url: winkstart.apps['call_center'].api_url,
                                    account_id: winkstart.apps['call_center'].account_id
                                },
                                function(_data_agents, status) {
                                    var _data = {
                                        queues: _data_queues.data,
                                        agents: _data_agents.data,
                                        agents_stats: _data_stats_agents
                                    };

                                    _data = THIS.format_data(_data);

                                    dashboard_html = THIS.templates.dashboard.tmpl(_data);

                                    THIS.poll_agents(_data, parent);
                                    THIS.move_gauge(_data.active_calls, _data.total_calls, dashboard_html);

                                    (parent)
                                        .empty()
                                        .append(dashboard_html);

                                    THIS.render_callwaiting_list(dashboard_html);
                                    THIS.render_timers(dashboard_html);

                                    $('*[rel=popover]:not([type="text"])', parent).popover({
                                        trigger: 'hover'
                                    });

                                    $('.icon.edit_queue', dashboard_html).hide();

                                    $('.list_queues_inner > li', dashboard_html).click(function() {
                                        var $this_queue = $(this),
                                            queue_id = $this_queue.attr('id');

                                        if($this_queue.hasClass('active')) {
                                            THIS.move_gauge(_data.active_calls, _data.total_calls, parent);
                                            $('.agent_wrapper', dashboard_html).show();
                                            $('#callwaiting-list li', dashboard_html).show();
                                            $('.icon.edit_queue', dashboard_html).hide();
                                            $('.list_queues_inner > li', dashboard_html).removeClass('active');
                                        }
                                        else {
                                            THIS.detail_stat($this_queue, parent);
                                        }
                                    });

                                    $('.list_queues_inner > li .edit_queue', dashboard_html).click(function() {
                                        //THIS IS A HACK. :)
                                        $('.popover').remove();

                                        var dom_id = $(this).parents('li').first().attr('id');
                                        winkstart.publish('queue.activate', { parent: $('#ws-content'), callback: function() {
                                            winkstart.publish('queue.edit', { id: dom_id });
                                        }});
                                    });

                                    if(typeof callback === 'function') {
                                        callback()
                                    }
                                }
                            );
                        }
                    );
                });
            });

        },

        detail_stat: function(container, parent) {
            var THIS = this,
                $this_queue = container,
                queue_id = $this_queue.attr('id');

            THIS.move_gauge($this_queue.dataset('current_calls'), $this_queue.dataset('total_calls'), parent);

            $('.list_queues_inner > li', parent).removeClass('active');
            $('.icon.edit_queue', parent).hide();

            $('.icon.edit_queue', $this_queue).show();
            $this_queue.addClass('active');

            $('#callwaiting-list li', parent).each(function(k, v) {
                var $v = $(v);

                if($v.dataset('queue_id') !== queue_id) {
                    $v.hide();
                }
                else {
                    $v.show();
                }
            });

            $('.agent_wrapper', parent).each(function(k, v) {
                var $v = $(v);

                if($v.dataset('queues').indexOf(queue_id) < 0) {
                    $v.hide();
                }
                else {
                    $v.show();
                }
            });
        },

        activate_queue_stat: function(args) {
            var THIS = this,
                parent = args.parent || $('#ws-content');

            THIS.render_dashboard(parent, function() {
                var $this_queue = $('#'+args.id, parent);

                THIS.detail_stat($this_queue, parent);
            });
        },

        activate: function(_parent) {
            var THIS = this,
                parent = _parent || $('#ws-content');

            THIS.render_dashboard(parent);
        }
    }
);
