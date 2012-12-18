winkstart.module('call_center', 'dashboard', {
        css: [
            'css/dashboard.css'
        ],

        templates: {
            dashboard: 'tmpl/dashboard.html',
            agents_dashboard: 'tmpl/agents_dashboard.html',
            queues_dashboard: 'tmpl/queues_dashboard.html',
            call: 'tmpl/call_list_element.html'
        },

        subscribe: {
            'dashboard.activate': 'activate',
            'dashboard.activate_queue_stat': 'activate_queue_stat'
        },

        resources: {
            'dashboard.agents.livestats': {
                url: '{api_url}/accounts/{account_id}/agents/stats',
                contentType: 'application/json',
                verb: 'GET',
                trigger_events: false
            },
            'dashboard.queues.livestats': {
                url: '{api_url}/accounts/{account_id}/queues/stats',
                contentType: 'application/json',
                verb: 'GET',
                trigger_events: false
            },
            'dashboard.queues.stats': {
                url: '{api_url}/accounts/{account_id}/queues/stats',
                contentType: 'application/json',
                verb: 'GET',
                trigger_events: false
            },
            'dashboard.agents.stats': {
                url: '{api_url}/accounts/{account_id}/agents/stats',
                contentType: 'application/json',
                verb: 'GET',
                trigger_events: false
            },
            'dashboard.queues.list': {
                url: '{api_url}/accounts/{account_id}/queues',
                contentType: 'application/json',
                verb: 'GET',
                trigger_events: false
            },
            'dashboard.agents.list': {
                url: '{api_url}/accounts/{account_id}/agents',
                contentType: 'application/json',
                verb: 'GET',
                trigger_events: false
            },
            'dashboard.queues.stats_loading': {
                url: '{api_url}/accounts/{account_id}/queues/stats',
                contentType: 'application/json',
                verb: 'GET'
            },
            'dashboard.agents.stats_loading': {
                url: '{api_url}/accounts/{account_id}/agents/stats',
                contentType: 'application/json',
                verb: 'GET'
            },
            'dashboard.queues.list_loading': {
                url: '{api_url}/accounts/{account_id}/queues',
                contentType: 'application/json',
                verb: 'GET'
            },
            'dashboard.agents.list_loading': {
                url: '{api_url}/accounts/{account_id}/agents',
                contentType: 'application/json',
                verb: 'GET'
            },
            'dashboard.agents.livestats_loading': {
                url: '{api_url}/accounts/{account_id}/agents/stats',
                contentType: 'application/json',
                verb: 'GET'
            },
            'dashboard.queues.livestats_loading': {
                url: '{api_url}/accounts/{account_id}/queues/stats',
                contentType: 'application/json',
                verb: 'GET'
            },
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
        global_timer: false,
        current_queue_id: undefined,
        map_timers: {
            users: {},
            breaks: {},
            calls: {}
        },

        render_global_data: function(data, id, _parent) {
            var THIS = this,
                agents_html = THIS.templates.agents_dashboard.tmpl(data),
                queues_html = THIS.templates.queues_dashboard.tmpl(data),
                //calls_html = THIS.templates.calls_waiting.tmpl(data),
                parent = _parent || $('#ws-content');

            $('#ws-content #dashboard-view').empty()
                                            .append(agents_html);

            $('#ws-content .topbar-right').empty()
                                          .append(queues_html);

                //TODO handle callwaiting list
            /*$('#ws-content #callwaiting-list').empty()
                                              .append(calls_html)*/;

            if(id) {
                THIS.detail_stat(id, parent);
            }
        },

        poll_agents: function(global_data, _parent) {
            var THIS = this,
                parent = _parent,
                polling_interval = 5,
                map_agents = {},
                cpt = 0,
                current_queue,
                current_global_data = global_data,
                stop_light_polling = false,
                poll = function() {
                    var data_template = $.extend(true, {}, {agents: current_global_data.agents, queues: current_global_data.queues}); //copy without reference;

                    if(stop_light_polling === false) {
                        THIS.get_queues_livestats(false, function(_data_queues) {
                            THIS.get_agents_livestats(false, function(_data_agents) {
                                /* agents */
                                data_template = THIS.format_live_data(data_template, {queues_live_stats: _data_queues.data, agents_live_stats: _data_agents.data});
                                THIS.render_global_data(data_template, THIS.current_queue_id);
                                //THIS.render_timers({active_calls: _data_agents.data.current_calls, waiting_calls: _data_queues.data.current_calls, current_statuses: _data_agents.data.current_statuses});
                            });
                        });
                    }
                },
                huge_poll = function() {
                    if($('#dashboard-content').size() === 0) {
                        THIS.clean_timers();
                        //clearInterval(THIS.global_timer);
                        //THIS.global_timer = false;
                    }
                    else {
                        if(++cpt % 30 === 0) {
                            THIS.fetch_all_data(false, function(data) {
                                THIS.render_global_data(data, THIS.current_queue_id);
                                //THIS.render_timers({active_calls: data.agents_live_stats.data.current_calls, waiting_calls: data.queues_live_stats.data.current_calls, current_statuses: data.agents_live_stats.data.current_statuses});
                                current_global_data = data;
                            });
                        }
                        else {
                            poll();
                        }
                    }
                };

            $.each(global_data.agents, function(k, v) {
                map_agents[v.id] = 'off';
            });

            THIS.global_timer = setInterval(huge_poll, polling_interval * 1000);
        },

        get_queues_livestats: function(display_loading, success, error) {
            var request_string = display_loading ? 'dashboard.queues.livestats_loading' : 'dashboard.queues.livestats';

            winkstart.request(request_string, {
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

        get_agents_livestats: function(display_loading, success, error) {
            var request_string = display_loading ? 'dashboard.agents.livestats_loading' : 'dashboard.agents.livestats';

            winkstart.request(request_string, {
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

        get_agents_stats: function(display_loading, success, error) {
            var request_string = display_loading ? 'dashboard.agents.stats_loading' : 'dashboard.agents.stats';

            winkstart.request(request_string, {
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

        get_queues_stats: function(display_loading, success, error) {
            var request_string = display_loading ? 'dashboard.queues.stats_loading' : 'dashboard.queues.stats';

            winkstart.request(request_string, {
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

        get_queues: function(display_loading, success, error) {
            var request_string = display_loading ? 'dashboard.queues.list_loading' : 'dashboard.queues.list';

            winkstart.request(request_string, {
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

        get_agents: function(display_loading, success, error) {
            var request_string = display_loading ? 'dashboard.agents.list_loading' : 'dashboard.agents.list';

            winkstart.request(request_string, {
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

            $('#callwaiting-list', parent)
                .empty()
                .listpanel({
                    label: 'Call Waiting',
                    identifier: 'callwaiting-listview',
                    data: []//array_cw
                });

            $('.add_flow', parent).empty()
                                  .html('Call Waiting Log...');
        },

        add_callwaiting: function(call) {
            var THIS = this;

            call.friendly_duration = THIS.get_time_seconds(call.wait_time);
            var call_html = THIS.templates.call.tmpl(call);
            $('#callwaiting-list .list-panel-anchor ul').append(call_html);

            /* TODO Uncomment
            THIS.map_timers.calls[call.call_id.toLowerCase()] = {};
            THIS.map_timers.calls[call.call_id.toLowerCase()].timer = setInterval(function(){
                $('.timer', call_html).html(THIS.get_time_seconds(++call.wait_time));
            }, 1000);
            */
        },

        remove_callwaiting: function(call_id) {
            var THIS = this;

            $('#callwaiting-list .list-panel-anchor ul li').each(function(k, v) {
                if($(v).attr('id').toLowerCase() === call_id) {
                    $(v).remove().hide();
                }
            });

            /* TODO Uncomment
            clearInterval(THIS.map_timers.calls[call_id.toLowerCase()].timer);
            delete THIS.map_timers.calls[call_id.toLowerCase()];
            */
        },

        get_time_seconds: function(seconds) {
            var seconds = Math.floor(seconds),
                hours = Math.floor(seconds / 3600),
                minutes = Math.floor(seconds / 60) % 60,
                remaining_seconds = seconds % 60,
                display_time = (hours < 10 ? '0' + hours : '' + hours) + ':' + (minutes < 10 ? '0' + minutes : '' + minutes) + ':' + (remaining_seconds < 10 ? '0' + remaining_seconds : '' + remaining_seconds);

            return display_time;
        },

        start_timer: function(target, seconds, id, state) {
            var THIS = this;

            if(target.size() > 0 && id) {
                var timer_type = state === 'paused' ? 'breaks' : 'users';

                THIS.map_timers[timer_type][id] = {};

                target.html(THIS.get_time_seconds(seconds));
                THIS.map_timers[timer_type][id].duration = seconds;

                THIS.map_timers[timer_type][id].timer = setInterval(function(){
                    target = $('.agent_wrapper#'+id+' .call_time .data_value');
                    if(target.size() > 0) {
                        target.html(THIS.get_time_seconds(++seconds));
                        THIS.map_timers[timer_type][id].duration = seconds;
                    }
                    else {
                        clearInterval(THIS.map_timers[timer_type][id].timer);
                        delete THIS.map_timers[timer_type][id];
                    }
                }, 1000);
            }
        },

        format_live_data: function(formatted_data, data) {
            var THIS = this;

            if('queues_live_stats' in data) {
                $.each(data.queues_live_stats.queues, function(k, queue_stats) {
                    formatted_data.queues[k].current_calls = 0;
                    formatted_data.queues[k].current_agents = 0;
                    formatted_data.queues[k].max_agents = 0;

                    if(queue_stats.totals.total_calls > 0) {
                        formatted_data.queues[k].total_calls = queue_stats.totals.total_calls;
                        formatted_data.queues[k].average_hold_time = THIS.get_time_seconds((queue_stats.totals.wait_time || 0) / queue_stats.totals.total_calls);
                    }
                });
            }

            if('agents_live_stats' in data) {
                $.each(data.agents_live_stats.agents, function(k, agent_stats) {
                    if(!(k in formatted_data.agents)) {
                        formatted_data.agents[k] = {};
                    }

                    formatted_data.agents[k].status = agent_stats.current_status;
                    formatted_data.agents[k].missed_calls = agent_stats.totals.missed_calls;
                    formatted_data.agents[k].total_calls = agent_stats.totals.total_calls;

                    $.each(agent_stats.queues, function(queue_id, queue_stat) {
                        //TODO remove hack
                        if('totals' in queue_stat) {
                            formatted_data.agents[k].queues_list[queue_id] = {
                                missed_calls: queue_stat.totals.missed_calls || 0,
                                total_calls: queue_stat.totals.total_calls || 0
                            };
                        }
                    });
                });
            }

            console.log(formatted_data);
            return formatted_data;
        },

        format_data: function(data) {
            var THIS = this,
                formatted_data = {};

            /* Formatting Queues */
            formatted_data.queues = {};

            $.each(data.queues, function(k, v) {
                formatted_data.queues[v.id] = $.extend(true, {
                    current_calls: 0,
                    total_calls: 0,
                    current_agents: 0,
                    max_agents: 0,
                    average_hold_time: THIS.get_time_seconds(0),
                    dropped_calls: 0
                }, v);
            });

            /* Formatting Agents */
            formatted_data.agents = {};

            $.each(data.agents, function(k, v) {
                formatted_data.agents[v.id] = $.extend(true, {
                    status: 'off',
                    missed_calls: 0,
                    total_calls: 0,
                    queues_list: {}
                }, v);

                $.each(v.queues, function(k, queue_id) {
                    formatted_data.agents[v.id].queues_list[queue_id] = {
                        missed_calls: 0,
                        total_calls: 0
                    };
                });
            });

            formatted_data = THIS.format_live_data(formatted_data, data);

            return formatted_data;
        },

        get_diff_seconds: function(timestamp) {
            var date_var = new Date((timestamp - 62167219200)*1000).valueOf(),
                date_now = new Date().valueOf();

            return Math.round((date_now - date_var)/1000);
        },

        render_timers: function(data, parent) {
            var THIS = this,
                map_new_calls = {};

            if(data.waiting_calls) {
                $.each(data.waiting_calls, function(queue_id, queue_calls) {
                    $.each(queue_calls, function(call_id, call) {
                        call.queue_id = queue_id;
                        map_new_calls[call_id.toLowerCase()] = call;
                    });
                });

                $.each(map_new_calls, function(k, v) {
                    if(!(k in THIS.map_timers.calls)) {
                        THIS.add_callwaiting(v);
                    }
                });
            }

            if(data.current_statuses) {
                $.each(data.current_statuses, function(k, v) {
                    if(v === 'paused' && !(k in THIS.map_timers.breaks)) {
                        //TODO We don't have the duration of a break for now so we won't display the timer.
                        //THIS.start_timer($('.agent_wrapper#'+k+' .call_time .data_value'), 0, k, 'paused');
                    }
                    else if(v !== 'paused' && k in THIS.map_timers.breaks) {
                        clearInterval(THIS.map_timers.breaks[k].timer);
                        delete THIS.map_timers.breaks[k];
                    }
                });
            }

            if(data.active_calls) {
                $.each(data.active_calls, function(k, v) {
                    if(v.agent_state === 'handling' && !(k in THIS.map_timers.users)) {
                        THIS.start_timer($('.agent_wrapper#'+k+' .call_time .data_value'), v.duration, k);
                    }
                });
            }

            if(THIS.map_timers) {
                $.each(THIS.map_timers.calls, function(k, v) {
                    if(!(k in map_new_calls)) {
                        THIS.remove_callwaiting(k);
                    }
                });

                $.each(THIS.map_timers.breaks, function(k, v) {
                    if(!(k in data.current_statuses)) {
                        clearInterval(THIS.map_timers.breaks[k].timer);
                        delete THIS.map_timers.breaks[k];
                    }
                });

                $.each(THIS.map_timers.users, function(k, v) {
                    if(!(k in data.active_calls) || data.active_calls[k].agent_state === 'wrapup') {
                        clearInterval(THIS.map_timers.users[k].timer);
                        delete THIS.map_timers.users[k];
                    }
                });
            }
        },

        render_dashboard: function(_parent, callback) {
            var THIS = this,
                parent = _parent;

            THIS.clean_timers();

            THIS.fetch_all_data(true, function(data) {
                dashboard_html = THIS.templates.dashboard.tmpl(data);

                THIS.templates.queues_dashboard.tmpl(data).appendTo($('.topbar-right', dashboard_html));
                THIS.templates.agents_dashboard.tmpl(data).appendTo($('#dashboard-view', dashboard_html));

                THIS.poll_agents(data, parent);

                (parent)
                    .empty()
                    .append(dashboard_html);

                THIS.render_callwaiting_list(dashboard_html);

                THIS.bind_live_events(parent);

                //THIS.render_timers({active_calls: data.agents_live_stats.current_calls, waiting_calls: data.queues_live_stats.current_calls, current_statuses: data.agents_live_stats.current_statuses});

                if(typeof callback === 'function') {
                    callback()
                }
            });
        },

        fetch_all_data: function(loading, callback) {
            var THIS = this;

            //THIS.get_agents_stats(loading, function(_data_stats_agents) {
                //THIS.get_queues_stats(loading, function(_data_stats_queues) {
                    THIS.get_queues_livestats(loading, function(_data_live_queues) {
                        THIS.get_agents_livestats(loading, function(_data_live_agents) {
                            THIS.get_queues(loading, function(_data_queues) {
                                THIS.get_agents(loading, function(_data_agents) {
                                    var _data = {
                                        queues: _data_queues.data,
                                        agents: _data_agents.data,
                                        //agents_stats: _data_stats_agents,
                                        //queues_stats: _data_stats_queues,
                                        agents_live_stats: _data_live_agents.data,
                                        queues_live_stats: _data_live_queues.data,
                                    };

                                    _data = THIS.format_data(_data);

                                    if(typeof callback === 'function') {
                                        callback(_data);
                                    }
                                });
                            });
                        });
                    });
                //});
            //});
        },

        bind_live_events: function(parent) {
            var THIS = this;
            //TODO After first display, tooltip are not showing up anymore
            $('*[rel=popover]:not([type="text"])', parent).popover({
                trigger: 'hover'
            });

            $('.list_queues_inner > li', parent).die().live('click', function() {
                //THIS IS A HACK. :)
                $('.popover').remove();
                var $this_queue = $(this),
                    queue_id = $this_queue.attr('id');

                if($this_queue.hasClass('active')) {
                    THIS.current_queue_id = undefined;
                    $('.agent_wrapper', parent).show();
                    $('.all_data', parent).show();
                    $('.queue_data', parent).hide();
                    $('#callwaiting-list li', parent).show();
                    $('.icon.edit_queue', parent).hide();
                    $('.list_queues_inner > li', parent).removeClass('active');
                }
                else {
                    THIS.detail_stat(queue_id, parent);
                }
            });

            $('.list_queues_inner > li .edit_queue', parent).die().live('click', function() {
                //THIS IS A HACK. :)
                $('.popover').remove();

                var dom_id = $(this).parents('li').first().attr('id');
                winkstart.publish('queue.activate', { parent: $('#ws-content'), callback: function() {
                    winkstart.publish('queue.edit', { id: dom_id });
                }});
            });
        },

        detail_stat: function(queue_id, parent) {
            var THIS = this,
                $this_queue = $('#'+queue_id, parent);

            THIS.current_queue_id = queue_id;

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
                    $('.all_data', $v).hide();
                    $('.queue_stat', $v).hide();
                    $('.queue_stat[data-id='+queue_id+']', $v).show();
                    $('.queue_data', $v).show();
                }
            });
        },

        clean_timers: function() {
            var THIS = this;

            if(THIS.global_timer !== false) {
                clearInterval(THIS.global_timer);
                THIS.global_timer = false;
            }

            $.each(THIS.map_timers, function(type, list_timers) {
                $.each(list_timers, function(k, v) {
                    clearInterval(v.timer);
                });
            });

            THIS.map_timers = {
                users: {},
                breaks: {},
                calls: {}
            };
        },

        activate_queue_stat: function(args) {
            //TODO check render global data
            var THIS = this,
                parent = args.parent || $('#ws-content');

            parent.empty();

            THIS.render_dashboard(parent, function() {
                var $this_queue = $('#'+args.id, parent);

                THIS.detail_stat(args.id, parent);
            });
        },

        activate: function(_parent) {
            var THIS = this,
                parent = _parent || $('#ws-content');

            parent.empty();

            //TODO check render global data
            THIS.render_dashboard(parent);
        }
    }
);
