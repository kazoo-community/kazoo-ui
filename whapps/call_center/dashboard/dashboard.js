winkstart.module('call_center', 'dashboard', {
        css: [
            'css/dashboard.css'
        ],

        templates: {
            dashboard: 'tmpl/dashboard.html',
            agents_dashboard: 'tmpl/agents_dashboard.html',
            calls_dashboard: 'tmpl/calls_dashboard.html',
            queues_dashboard: 'tmpl/queues_dashboard.html',
            list_devices: 'tmpl/list_devices.html',
            call: 'tmpl/call_list_element.html'
        },

        subscribe: {
            'dashboard.activate': 'activate',
            'dashboard.activate_queue_stat': 'activate_queue_stat'
        },

        resources: {
            'dashboard.queue_eavesdrop': {
                url: '{api_url}/accounts/{account_id}/queues/{queue_id}/eavesdrop',
                contentType: 'application/json',
                verb: 'PUT',
            },
            'dashboard.call_eavesdrop': {
                url: '{api_url}/accounts/{account_id}/queues/eavesdrop',
                contentType: 'application/json',
                verb: 'PUT',
            },
            'dashboard.list_devices': {
                url: '{api_url}/accounts/{account_id}/devices',
                contentType: 'application/json',
                verb: 'GET',
            },
            'dashboard.agents.livestats': {
                url: '{api_url}/accounts/{account_id}/agents/stats',
                contentType: 'application/json',
                verb: 'GET',
                trigger_events: false
            },
            'dashboard.agents.status': {
                url: '{api_url}/accounts/{account_id}/agents/status',
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
            'dashboard.agents.status_loading': {
                url: '{api_url}/accounts/{account_id}/agents/status',
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
            label: _t('dashboard', 'dashboard'),
            icon: 'graph1_box',
            weight: '20'
        });
    },

    {
        global_timer: false,
        current_queue_id: undefined,
        hide_logout: false,
        map_timers: {
            calls_waiting: {},
            calls_in_progress: {}
        },

        render_global_data: function(param_data, id, _parent) {
            var THIS = this,
                data = $.extend({}, param_data, {
					show_queues: THIS.show_queues,
					hide_logout: THIS.hide_logout,
					_t: function(param){
						return window.translate['dashboard'][param];
					}
				}),
                agents_html = THIS.templates.agents_dashboard.tmpl(data),
                queues_html = THIS.templates.queues_dashboard.tmpl(data),
                calls_html = THIS.templates.calls_dashboard.tmpl(data),
                parent = _parent || $('#ws-content'),
                scroll_value = $('.topbar-right .list_queues_inner', parent).scrollLeft() || 0;

            $('#dashboard-view', parent).empty()
                                        .append(agents_html);

            $('.topbar-right', parent).empty()
                                      .append(queues_html);

            $('.topbar-right .list_queues_inner', parent).animate({ scrollLeft: scroll_value }, 0);

            $('#callwaiting-list .list-panel-anchor ul', parent).empty()
                                                                .append(calls_html);

            THIS.render_timers(data);

            if(id) {
                THIS.detail_stat(id, parent);
            }
        },

        poll_agents: function(global_data, _parent) {
            var THIS = this,
                parent = _parent,
                polling_interval = 2,
                map_agents = {},
                cpt = 0,
                current_queue,
                current_global_data = global_data,
                stop_light_polling = false,
                poll = function() {
                    var data_template = $.extend(true, {}, {agents: current_global_data.agents, queues: current_global_data.queues}); //copy without reference;

                    if(stop_light_polling === false) {
                        winkstart.parallel({
                                get_queues: function(callback) {
                                    THIS.get_queues_livestats(false, function(_data_queues) {
                                        callback(null, _data_queues);
                                    });
                                },
                                get_agents: function(callback) {
                                    THIS.get_agents_livestats(false, function(_data_agents) {
                                        callback(null, _data_agents);
                                    });
                                },
                                get_status: function(callback) {
                                    THIS.get_agents_status(false, function(_data_status) {
                                        callback(null, _data_status);
                                    },
                                    function(_data_status) {
                                    	callback(null, {});
                                    });
                                }
                            },
                            function(err, results) {
                                data_template = THIS.format_live_data(data_template, {queues_live_stats: results.get_queues.data, agents_live_stats: results.get_agents.data, agents_live_status: results.get_status.data});

                                THIS.render_global_data(data_template, THIS.current_queue_id);
                            }
                        );
                    }
                },
                huge_poll = function() {
                    if($('#dashboard-content').size() === 0) {
                        THIS.clean_timers();
                    }
                    else {
                        if(++cpt % 30 === 0) {
                            THIS.fetch_all_data(false, function(data) {
                                THIS.render_global_data(data, THIS.current_queue_id);
                                current_global_data = data;
                            });
                        }
                        else {
                            poll();
                        }
                    }
                };

            $.each(global_data.agents, function(k, v) {
                map_agents[v.id] = 'logged_out';
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

        get_agents_status: function(display_loading, success, error) {
            var request_string = display_loading ? 'dashboard.agents.status_loading' : 'dashboard.agents.status';

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
                    data: []
                });

            $('.add_flow', parent).empty()
                                  .html(_t('dashboard', 'call_waiting_log'));
        },

        get_time_seconds: function(seconds) {
            var seconds = Math.floor(seconds),
                hours = Math.floor(seconds / 3600),
                minutes = Math.floor(seconds / 60) % 60,
                remaining_seconds = seconds % 60,
                display_time = (hours < 10 ? '0' + hours : '' + hours) + ':' + (minutes < 10 ? '0' + minutes : '' + minutes) + ':' + (remaining_seconds < 10 ? '0' + remaining_seconds : '' + remaining_seconds);

            return seconds >= 0 ? display_time : '00:00:00';
        },

        start_timer: function(type, _data, _timer_type) {
            var THIS = this,
                $target,
                id = _data.id,
                data = _data.data,
                timer_type = _timer_type || 'increment';

            if(type === 'in_progress' || type === 'agent_status') {
                $target = $('.agent_wrapper#'+id+' .call_time .data_value');
            }
            else if(type === 'waiting') {
                $target = $('.call-waiting[data-call_id="'+id+'"] .timer');
            }

            if(!THIS.map_timers[type]) {
                THIS.map_timers[type] = {};
            }

            THIS.map_timers[type][id] = data;

            THIS.map_timers[type][id].timer = setInterval(function(){
                if($target.size() > 0) {
                    if(timer_type === 'decrement') {
                        var new_duration = --THIS.map_timers[type][id].duration;
                        $target.html(THIS.get_time_seconds(new_duration > 0 ? new_duration : 0));
                    }
                    else {
                        $target.html(THIS.get_time_seconds(++THIS.map_timers[type][id].duration));
                    }
                }
                else {
                    clearInterval(THIS.map_timers[type][id].timer);
                    delete THIS.map_timers[type][id];
                }
            }, 1000);
        },

        render_timers: function(data) {
            var THIS = this;

            $.each(THIS.map_timers, function(type, list_timers) {
                $.each(list_timers, function(k, v) {
                    clearInterval(v.timer);
                });
            });

            THIS.map_timers = {
                waiting: {},
                in_progress: {}
            };

            if(data.calls_waiting) {
                $.each(data.calls_waiting, function(k, v) {
                    v.duration = data.current_timestamp - v.entered_timestamp;
                    THIS.start_timer('waiting', {data: v, id: k});
                });
            }

            if(data.calls_in_progress) {
                $.each(data.calls_in_progress, function(k, v) {
                    v.duration = data.current_timestamp - v.handled_timestamp;
                    THIS.start_timer('in_progress', {data: v, id: v.agent_id});
                });
            }

            if(data.agent_status) {
                if('busy' in data.agent_status) {
                    $.each(data.agent_status.busy, function(agent_id, data_status) {
                        data_status.duration = data.current_timestamp - data_status.timestamp;
                        THIS.start_timer('agent_status', {data: data_status, id: agent_id});
                    });
                }

                if('wrapup' in data.agent_status) {
                    $.each(data.agent_status.wrapup, function(agent_id, data_status) {
                        data_status.duration = data_status.wait_time - (data.current_timestamp - data_status.timestamp);
                        THIS.start_timer('agent_status', {data: data_status, id: agent_id}, 'decrement');
                    });
                }

                if('paused' in data.agent_status) {
                    $.each(data.agent_status.paused, function(agent_id, data_status) {
                        if('pause_time' in data_status) {
                        	data_status.duration = data_status.pause_time - (data.current_timestamp - data_status.timestamp);
                        	THIS.start_timer('agent_status', {data: data_status, id: agent_id}, 'decrement');
                        }
                       	else {
                        	data_status.duration = data.current_timestamp - data_status.timestamp;
                        	THIS.start_timer('agent_status', {data: data_status, id: agent_id});
                        }
                    });
                }
            }
        },

        format_live_data: function(formatted_data, data) {
            var THIS = this,
                current_agents_by_queue = {};

            formatted_data.current_timestamp = data.queues_live_stats.current_timestamp;

            formatted_data.calls_waiting = {};
            formatted_data.calls_in_progress = {};
            formatted_data.agent_status = {
                busy: {},
                wrapup: {},
                paused: {}
            };

            //Reinitializing previous data;
            $.each(formatted_data.queues, function(k, queue) {
                queue.abandoned_calls = 0;
                queue.average_hold_time = THIS.get_time_seconds(0);
                queue.current_calls = 0;
                queue.total_calls = 0;
                queue.total_wait_time = 0;
            });

			if(data.agents_live_status) {
            	$.each(data.agents_live_status, function(k, agent_status) {
                	if(k in formatted_data.agents) {
                    	if(agent_status.status === 'outbound') {
                        	agent_status.status = 'busy';
                    	}

                    	if(agent_status.status === 'connected') {
                        	agent_status.status = 'handling';
                    	}

                    	var current_status = agent_status.status;

                    	formatted_data.agents[k].status = current_status;
                    	formatted_data.agents[k].status_started = agent_status.timestamp;

                    	if($.inArray(current_status, ['busy', 'wrapup', 'paused']) >= 0) {
                        	formatted_data.agent_status[current_status][k] = agent_status;

                        	if(current_status === 'busy') {
                            	formatted_data.agents[k].call_time = THIS.get_time_seconds(formatted_data.current_timestamp - agent_status.timestamp)
                        	}
                        	else if(current_status === 'paused') {
                        		if('pause_time' in agent_status) {
                            		formatted_data.agents[k].call_time = THIS.get_time_seconds(agent_status.pause_time - (formatted_data.current_timestamp - agent_status.timestamp))
                        		}
                        		else {
                            		formatted_data.agents[k].call_time = THIS.get_time_seconds(formatted_data.current_timestamp - agent_status.timestamp)
                            	}
                        	}
                        	else {
                            	formatted_data.agents[k].call_time = THIS.get_time_seconds(agent_status.wait_time  - (formatted_data.current_timestamp - agent_status.timestamp));
                        	}
                    	}
                    	else if(current_status === 'connecting') {
							formatted_data.agents[k].current_call = { friendly_title: agent_status.caller_id_name || agent_status.caller_id_number || agent_status.call_id };
                    	}

                    	if(current_status !== 'logged_out') {
                        	$.each(formatted_data.agents[k].queues_list, function(queue_id, queue_data) {
                            	if(!(queue_id in current_agents_by_queue)) {
                                	current_agents_by_queue[queue_id] = 1;
                            	}
                            	else {
                                	current_agents_by_queue[queue_id]++;
                            	}
                        	});
                    	}
                	}
            	});
            }

            $.each(current_agents_by_queue, function(queue_id, count) {
                if(queue_id in formatted_data.queues) {
                    formatted_data.queues[queue_id].current_agents = count || 0;
                }
            });

            $.each(data.agents_live_stats, function(k, agent_stats) {
                if(k in formatted_data.agents) {
                    formatted_data.agents[k].missed_calls = agent_stats.missed_calls || 0;
                    formatted_data.agents[k].total_calls = agent_stats.total_calls || 0;

                    if('queues' in agent_stats) {
                        $.each(agent_stats.queues, function(queue_id, queue_stat) {
                        	if(queue_id in formatted_data.agents[k].queues_list) {
                            	formatted_data.agents[k].queues_list[queue_id] = {
                                	missed_calls: queue_stat.missed_calls || 0,
                                	total_calls: queue_stat.total_calls || 0
                            	};
                            }
                        });
                    }
                }
            });

            if('stats' in data.queues_live_stats) {
                $.each(data.queues_live_stats.stats, function(index, queue_stats) {
                    var k = queue_stats.queue_id,
                        call_id = queue_stats.call_id;

                    formatted_data.queues[k].current_calls = formatted_data.queues[k].current_calls || 0;

                    if('wait_time' in queue_stats && queue_stats.status !== 'abandoned') {
                        formatted_data.queues[k].total_wait_time += queue_stats.wait_time;
                    }

                    if(queue_stats.status === 'abandoned') {
                        formatted_data.queues[k].abandoned_calls++;
                        formatted_data.queues[k].total_calls++;
                    }
                    else if(queue_stats.status === 'waiting') {
                        formatted_data.calls_waiting[call_id] = queue_stats;
                        formatted_data.calls_waiting[call_id].friendly_duration = THIS.get_time_seconds(formatted_data.current_timestamp - queue_stats.entered_timestamp);
                        formatted_data.calls_waiting[call_id].friendly_title = queue_stats.caller_id_name || queue_stats.caller_id_number || call_id;
                        formatted_data.queues[k].current_calls++;
                    }
                    else if(queue_stats.status === 'handled') {
                        formatted_data.calls_in_progress[call_id] = queue_stats;
                        formatted_data.agents[queue_stats.agent_id].call_time = THIS.get_time_seconds(formatted_data.current_timestamp - queue_stats.handled_timestamp);
                        formatted_data.agents[queue_stats.agent_id].current_call = queue_stats;
                        formatted_data.agents[queue_stats.agent_id].current_call.friendly_title = queue_stats.caller_id_name || queue_stats.caller_id_number || call_id;
                        formatted_data.queues[k].total_calls++;

                        formatted_data.queues[k].current_calls++;
                    }
                    else if(queue_stats.status === 'processed') {
                        formatted_data.queues[k].total_calls++;
                    }
                });
            }

            $.each(formatted_data.queues, function(k, v) {
                if(v.total_calls > 0) {
                	var completed_calls = v.total_calls - v.abandoned_calls;

                    v.average_hold_time = THIS.get_time_seconds(v.total_wait_time / completed_calls);
                }
            });

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
                    total_wait_time: 0,
                    abandoned_calls: 0
                }, v);
            });

            /* Formatting Agents */
            formatted_data.agents = {};

            $.each(data.agents, function(k, v) {
            	if(v.queues && v.queues.length > 0) {
                	formatted_data.agents[v.id] = $.extend(true, {
                    	status: 'logged_out',
                    	missed_calls: 0,
                    	total_calls: 0,
                    	queues_list: {}
                	}, v);
                }

                $.each(v.queues, function(k, queue_id) {
                    if(queue_id in formatted_data.queues) {
                        formatted_data.queues[queue_id].max_agents++;
                        formatted_data.agents[v.id].queues_list[queue_id] = {
                            missed_calls: 0,
                            total_calls: 0
                        };
                    }
                });
            });

            formatted_data = THIS.format_live_data(formatted_data, data);

            return formatted_data;
        },

        render_dashboard: function(_parent, callback) {
            var THIS = this,
                parent = _parent;

            THIS.clean_timers();

            THIS.fetch_all_data(true, function(data) {
				data._t = function(param){
					return window.translate['dashboard'][param];
				};
				
                dashboard_html = THIS.templates.dashboard.tmpl({
					_t: function(param){
						return window.translate['dashboard'][param];
					}
				});

                THIS.templates.queues_dashboard.tmpl(data).appendTo($('.topbar-right', dashboard_html));
                THIS.templates.agents_dashboard.tmpl(data).appendTo($('#dashboard-view', dashboard_html));
                THIS.templates.calls_dashboard.tmpl(data).appendTo($('#callwaiting-list .list-panel-anchor ul', dashboard_html));

                THIS.poll_agents(data, parent);

                (parent)
                    .empty()
                    .append(dashboard_html);

                THIS.render_callwaiting_list(dashboard_html);

                THIS.bind_live_events(parent);
                THIS.render_timers(data);

                if(typeof callback === 'function') {
                    callback()
                }
            });
        },

        fetch_all_data: function(loading, callback) {
            var THIS = this;

            winkstart.parallel({
                    queues_livestats: function(callback) {
                        THIS.get_queues_livestats(loading, function(_data_live_queues) {
                            callback(null, _data_live_queues);
                        });
                    },
                    agents_livestats: function(callback) {
                        THIS.get_agents_livestats(loading, function(_data_live_agents) {
                            callback(null, _data_live_agents);
                        });
                    },
                    agents_status: function(callback) {
                        THIS.get_agents_status(loading,
                        	function(_data_live_status) {
                            	callback(null, _data_live_status);
                        	},
                        	function(_data_live_status) {
                        		callback(null, {});
                        	}
                        );
                    },
                    queues: function(callback) {
                        THIS.get_queues(loading, function(_data_queues) {
                            callback(null, _data_queues);
                        });
                    },
                    agents: function(callback) {
                        THIS.get_agents(loading, function(_data_agents) {
                            callback(null, _data_agents);
                        });
                    },
                },
                function(err, results) {
                    var _data = {
                        queues: results.queues.data,
                        agents: results.agents.data,
                        agents_live_stats: results.agents_livestats.data,
                        queues_live_stats: results.queues_livestats.data,
                        agents_live_status: results.agents_status.data
                    };

                    _data = THIS.format_data(_data);

                    if(typeof callback === 'function') {
                        callback(_data);
                    }
                }
            );
        },

        eavesdrop_popup: function(mode, data_options) {
            var THIS = this;

            winkstart.request('dashboard.list_devices', {
                    account_id: winkstart.apps['call_center'].account_id,
                    api_url: winkstart.apps['call_center'].api_url
                },
                function(_data, status) {
                    var popup_html = THIS.templates.list_devices.tmpl({
                        objects: {
                            items: _data.data
                        },
						_t: function(param){
							return window.translate['dashboard'][param];
						}
                    });

                    $('#ring', popup_html).click(function() {
                        var options = {
                                account_id: winkstart.apps['call_center'].account_id,
                                api_url: winkstart.apps['call_center'].api_url,
                                data: {
                                    id: $('#object-selector', popup_html).val()
                               }
                        };

                        if(mode === 'call') {
                            options.data.call_id = data_options.call_id;
                        }
                        else if(mode === 'queue') {
                            options.queue_id = data_options.queue_id;
                        }

                        winkstart.request('dashboard.'+ mode +'_eavesdrop', options,
                            function(_data, status) {
                                popup.dialog('close');
                            },
                            function(_data, status) {
                                winkstart.alert(_t('dashboard', 'eavesdrop_request_failed')+status);
                            }
                        );
                    });

                    $('#cancel', popup_html).click(function() {
                        popup.dialog('close');
                    });

                    popup = winkstart.dialog(popup_html, {
                        title: _t('dashboard', 'devices_title')
                    });
                }
            );
        },

        bind_live_events: function(parent) {
            var THIS = this;

            $('#hide_logout_agents', parent).die().live('click', function(event) {
                var checked = $(this).is(':checked');
                THIS.hide_logout = checked;

                checked ? $('#agents-view', parent).addClass('hide-logout') : $('#agents-view', parent).removeClass('hide-logout');
            });

            $('.toggle-button', parent).die().live('click', function(event) {
                var $topbar = $('.topbar-right', parent),
                    $listpanel = $('.list-panel-anchor', parent),
                    new_height;

                if($topbar.is(':hidden')) {
                    new_height = $listpanel.outerHeight() - $topbar.outerHeight() + 'px';
                    $('.toggle-button', parent).html(_t('dashboard', 'hide_queues_html'));
                }
                else {
                    new_height = $listpanel.outerHeight() + $topbar.outerHeight() + 'px';
                    $('.toggle-button', parent).html(_t('dashboard', 'show_queues_html'));
                }

                $listpanel.css({'min-height': new_height, 'height': new_height });
                $listpanel.data('jsp').reinitialise();

                $topbar.toggle();
            });

            $('.list_queues_inner > li', parent).die().live('click', function(event) {
                if($(event.target).hasClass('eavesdrop_queue')) {

                }
                else {
                    var $this_queue = $(this),
                        queue_id = $this_queue.attr('id');

                    if($this_queue.hasClass('active')) {
                        THIS.current_queue_id = undefined;
                        $('.agent_wrapper', parent).css('display', 'inline-block');
                        $('.all_data', parent).show();
                        $('.queue_data', parent).hide();
                        $('#callwaiting-list li', parent).show();
                        $('.icon.edit_queue', parent).hide();
                        $('.icon.eavesdrop_queue', parent).hide();
                        $('.list_queues_inner > li', parent).removeClass('active');
                    }
                    else {
                        THIS.detail_stat(queue_id, parent);
                    }
                }
            });

            $('.agent_wrapper .call .eavesdrop', parent).die().live('click', function() {
                var data = {
                    call_id: $(this).data('call_id')
                };

                THIS.eavesdrop_popup('call', data);
            });

            $('.list_queues_inner > li .eavesdrop_queue', parent).die().live('click', function() {
                var data = {
                    queue_id: $(this).parents('li').first().attr('id')
                };

                THIS.eavesdrop_popup('queue', data);
            });

            $('.list_queues_inner > li .edit_queue', parent).die().live('click', function() {
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
            $('.icon.eavesdrop_queue', parent).hide();

            $('.icon.edit_queue', $this_queue).show();
            $('.icon.eavesdrop_queue', $this_queue).show();
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
                    if(!THIS.hide_logout) {
                        $v.css('display', 'inline-block');
                    }
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

            THIS.map_timers = {};
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

            THIS.current_queue_id = undefined;
            THIS.hide_logout = false;

            //TODO check render global data
            THIS.render_dashboard(parent);
        }
    }
);
