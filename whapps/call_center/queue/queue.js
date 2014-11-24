winkstart.module('call_center', 'queue', {
        css: [
            'css/queue.css'
        ],

        templates: {
            queue: 'tmpl/queue.html',
            edit: 'tmpl/edit.html',
            queue_callflow: 'tmpl/queue_callflow.html',
            agent_pause_callflow: 'tmpl/agent_pause_callflow.html',
            agent_presence_callflow: 'tmpl/agent_presence_callflow.html',
            add_agents: 'tmpl/add_agents.html',
            edit_agents: 'tmpl/edit_agents.html',
            selected_agent: 'tmpl/selected_agent.html',
            available_user: 'tmpl/available_user.html',
            account_fields: 'tmpl/account_fields.html'
        },

        subscribe: {
            'queue.activate': 'activate',
            'queue.edit': 'edit_queue',
            'callflow.define_callflow_nodes': 'define_callflow_nodes',
            'queue.popup_edit': 'popup_edit_queue',
            'call_center.render_account_fields': 'render_account_fields'
        },

        validation: [
            { name: '#name', regex: /.+/ }
        ],

        resources: {
            'queue.list': {
                url: '{api_url}/accounts/{account_id}/queues',
                contentType: 'application/json',
                verb: 'GET'
            },
            'queue.get': {
                url: '{api_url}/accounts/{account_id}/queues/{queue_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'queue.get_stats': {
                url: '{api_url}/accounts/{account_id}/queues/{queue_id}/stats',
                contentType: 'application/json',
                verb: 'GET'
            },
            'queue.create': {
                url: '{api_url}/accounts/{account_id}/queues',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'queue.update': {
                url: '{api_url}/accounts/{account_id}/queues/{queue_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'queue.update_users': {
                url: '{api_url}/accounts/{account_id}/queues/{queue_id}/roster',
                contentType: 'application/json',
                verb: 'POST'
            },
            'queue.delete': {
                url: '{api_url}/accounts/{account_id}/queues/{queue_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            },
            'queue.user_list': {
                url: '{api_url}/accounts/{account_id}/users',
                contentType: 'application/json',
                verb: 'GET'
            },
            'queue.media_list': {
                url: '{api_url}/accounts/{account_id}/media',
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
            label: _t('queue', 'manage_queues'),
            icon: 'wrench_left',
            weight: '10',
        });
    },

    {
        queue_get_stats: function(queue_id, success, error) {
            winkstart.request(true, 'queue.get_stats', {
                    account_id: winkstart.apps['call_center'].account_id,
                    api_url: winkstart.apps['call_center'].api_url,
                    queue_id: queue_id,
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

        queue_update_users: function(array_users, queue_id, success, error) {
            winkstart.request(true, 'queue.update_users', {
                    account_id: winkstart.apps['call_center'].account_id,
                    api_url: winkstart.apps['call_center'].api_url,
                    queue_id: queue_id,
                    data: array_users
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

        save_queue: function(form_data, data, success, error) {
            var THIS = this,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

            if (typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'queue.update', {
                        account_id: winkstart.apps['call_center'].account_id,
                        api_url: winkstart.apps['call_center'].api_url,
                        queue_id: data.data.id,
                        data: normalized_data
                    },
                    function(_data, status) {
                        if(typeof success == 'function') {
                            success(_data, status, 'update');
                        }
                    },
                    function(_data, status) {
                        if(typeof error == 'function') {
                            error(_data, status, 'update');
                        }
                    }
                );
            }
            else {
                winkstart.request(true, 'queue.create', {
                        account_id: winkstart.apps['call_center'].account_id,
                        api_url: winkstart.apps['call_center'].api_url,
                        data: normalized_data
                    },
                    function (_data, status) {
                        if(typeof success == 'function') {
                            success(_data, status, 'create');
                        }
                    },
                    function(_data, status) {
                        if(typeof error == 'function') {
                            error(_data, status, 'update');
                        }
                    }

                );
            }
        },

        update_single_user: function(user_id, queue_id, action, callback) {
            var THIS = this;

            winkstart.request(false, 'user.get', {
                    account_id: winkstart.apps['call_center'].account_id,
                    api_url: winkstart.apps['call_center'].api_url,
                    user_id: user_id
                },
                function(_data, status) {
                    if(action =='add') {
                        if(!_data.data.queues || typeof _data.data.queues != 'object') {
                            _data.data.queues = [];
                        }
                        _data.data.queues.push(queue_id);

                        /* If a user is added to a queue, but is not enabled as an agent, we enable this user automatically */
                        if(!('queue_pin' in _data.data)) {
                            _data.data.queue_pin = '';
                        }
                    }
                    else { //remove
                        _data.data.queues.splice(_data.data.queues.indexOf(queue_id), 1);
                    }

                    winkstart.request(false, 'user.update', {
                            account_id: winkstart.apps['call_center'].account_id,
                            api_url: winkstart.apps['call_center'].api_url,
                            user_id: user_id,
                            data: _data.data
                        },
                        function(_data, status) {
                            if(typeof callback === 'function') {
                                callback(status);
                            }
                        },
                        function(_data, status) {
                            if(typeof callback === 'function') {
                                callback(status);
                            }
                        }
                    );
                }
            );
        },

        update_users: function(data, queue_id, success) {
            var THIS = this;

            THIS.queue_update_users(data.new_list, queue_id, function() {
                if(typeof success === 'function') {
                    success();
                }
            });
        },

        edit_queue: function(data, _parent, _target, _callbacks, data_defaults){
            var THIS = this,
                parent = _parent || $('#queue-content'),
                target = _target || $('#queue-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.render_list(parent);

                        THIS.edit_queue({ id: _data.data.id }, parent, target, callbacks);
                    },

                    save_error: _callbacks.save_error,

                    delete_success: _callbacks.delete_success || function() {
                        target.empty();

                        THIS.render_list(parent);
                    },

                    delete_error: _callbacks.delete_error,

                    after_render: _callbacks.after_render
                },
                defaults = {
                    data: $.extend(true, {
                        connection_timeout: '0',
                        member_timeout: '5',
                        agent_wrapup_time: '30',
                        record_caller: true,
                        moh: {},
                        notifications: {},
                        max_queue_size: '0'
                    }, data_defaults || {}),
                    field_data: {
                        /*sort_by: {
                            'first_name': 'First Name',
                            'last_name': 'Last Name'
                        }*/
                    }
                };

            winkstart.request(true, 'queue.media_list', {
                    account_id: winkstart.apps['call_center'].account_id,
                    api_url: winkstart.apps['call_center'].api_url
                },
                function(_data_media, status) {
                    _data_media.data.unshift(
                        {
                            id: '',
                            name: _t('queue', 'default_music')
                        },
                        {
                            id: 'silence_stream://300000',
                            name: _t('queue', 'silence')
                        }
                    );

                    defaults.field_data.media = _data_media.data;

                    winkstart.request(true, 'queue.user_list', {
                            account_id: winkstart.apps['call_center'].account_id,
                            api_url: winkstart.apps['call_center'].api_url
                        },
                        function(_data, status) {
                            //defaults.field_data.users = _data.data;
                            defaults.field_data.users = {};

                            $.each(_data.data, function(k, v) {
                                defaults.field_data.users[v.id] = v;
                            });

                            if(typeof data == 'object' && data.id) {
                                //THIS.queue_get_stats(data.id, function(_data_stat) {
                                    winkstart.request(true, 'queue.get', {
                                            account_id: winkstart.apps['call_center'].account_id,
                                            api_url: winkstart.apps['call_center'].api_url,
                                            queue_id: data.id
                                        },
                                        function(_data, status) {
                                            var render_data = $.extend(true, defaults, _data);
                                            render_data.field_data.old_list = [];
                                            render_data.stats = {};// _data_stat.data;
                                            if('agents' in _data.data) {
                                                render_data.field_data.old_list = _data.data.agents;
                                            }
                                            THIS.render_edit_agents(render_data, target, callbacks);

                                            if(typeof callbacks.after_render == 'function') {
                                                callbacks.after_render();
                                            }
                                        }
                                    );
                                //});
                            }
                            else {
                                THIS.render_queue(defaults, target, callbacks);

                                if(typeof callbacks.after_render == 'function') {
                                    callbacks.after_render();
                                }
                            }
                        }
                    );
                }
            );
        },

        delete_queue: function(data, success, error) {
            var THIS = this;

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'queue.delete', {
                        account_id: winkstart.apps['call_center'].account_id,
                        api_url: winkstart.apps['call_center'].api_url,
                        queue_id: data.data.id
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
            }
        },

		render_account_fields: function(parent, data, callback) {
			data._t = function(param){
				return window.translate['queue'][param];
			};
			var THIS = this,
				fields_html = THIS.templates.account_fields.tmpl(data);

			$('*[rel=popover]', fields_html).popover({
                trigger: 'focus'
            });

            $('*[rel=popover]:not([type="text"])', fields_html).popover({
                trigger: 'hover'
            });

			parent.find('#options').append(fields_html);

			callback && callback();

			return false;
		},

        render_edit_agents: function(data, target, callbacks) {
			data._t = function(param){
				return window.translate['queue'][param];
			};
            var THIS = this,
                agents_html = THIS.templates.edit_agents.tmpl(data);

            THIS.render_reports(data, agents_html);
            THIS.render_user_list(data, agents_html);

            $('.detail_queue', agents_html).click(function() {
                THIS.popup_edit_queue(data, callbacks);
            });

            $('.view_stats', agents_html).click(function() {
                winkstart.publish('dashboard.activate_queue_stat', { id: $(this).dataset('id'), parent: $('#ws-content') });
            });

            (target)
                    .empty()
                    .append(agents_html);
        },

        render_queue: function(data, target, callbacks){
			data._t = function(param){
				return window.translate['queue'][param];
			};
            var THIS = this,
                queue_html = THIS.templates.edit.tmpl(data);

            winkstart.validate.set(THIS.config.validation, queue_html);

            $('*[rel=popover]', queue_html).popover({
                trigger: 'focus'
            });

            $('*[rel=popover]:not([type="text"])', queue_html).popover({
                trigger: 'hover'
            });

            winkstart.tabs($('.view-buttons', queue_html), $('.tabs', queue_html));

            if(!$('#moh', queue_html).val()) {
                $('#edit_link_media', queue_html).hide();
            }

            $('#moh', queue_html).change(function() {
                !$('#moh option:selected', queue_html).val() ? $('#edit_link_media', queue_html).hide() : $('#edit_link_media', queue_html).show();
            });

            $('.inline_action_media', queue_html).click(function(ev) {
                var _data = ($(this).dataset('action') == 'edit') ? { id: $('#moh', queue_html).val() } : {},
                    _id = _data.id;

                ev.preventDefault();

                winkstart.publish('media.popup_edit', _data, function(_data) {
                    /* Create */
                    if(!_id) {
                        $('#moh', queue_html).append('<option id="'+ _data.data.id  +'" value="'+ _data.data.id +'">'+ _data.data.name +'</option>')
                        $('#moh', queue_html).val(_data.data.id);

                        $('#edit_link_media', queue_html).show();
                    }
                    else {
                        /* Update */
                        if('id' in _data.data) {
                            $('#moh #'+_data.data.id, queue_html).text(_data.data.name);
                        }
                        /* Delete */
                        else {
                            $('#moh #'+_id, queue_html).remove();
                            $('#edit_link_media', queue_html).hide();
                        }
                    }
                });
            });


            $('.queue-save', queue_html).click(function(ev) {
                ev.preventDefault();

                winkstart.validate.is_valid(THIS.config.validation, queue_html, function() {
                        var form_data = form2object('queue-form');

                        THIS.clean_form_data(form_data);

                        THIS.save_queue(form_data, data, callbacks.save_success, winkstart.error_message.process_error(callbacks.save_error));
                    },
                    function() {
                        winkstart.alert(_t('queue', 'there_were_errors_on_the_form'));
                    }
                );
            });

            $('.queue-delete', queue_html).click(function(ev) {
                ev.preventDefault();

                winkstart.confirm(_t('queue', 'this_will_remove_this_queue'), function() {
                    THIS.delete_queue(data, callbacks.delete_success, callbacks.delete_error);
                });
            });

            (target)
                .empty()
                .append(queue_html);
        },

        normalize_data: function(form_data) {
            delete form_data.users;
            return form_data;
        },

        clean_form_data: function(form_data) {
            delete form_data.user_id;
        },

        render_list: function(_parent, callback){
            var THIS = this,
                parent = _parent || $('#queue-content');;

            winkstart.request(true, 'queue.list', {
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
                                    title: val.name || _t('queue', 'no_name')
                                });
                            });
                        }

                        new_list.sort(function(a, b) {
                            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                        });

                        return new_list;
                    };

                    $('#queue-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: 'Queues',
                            identifier: 'queue-listview',
                            new_entity_label: _t('queue', 'add_acd'),
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'queue.edit',
                            notifyCreateMethod: 'queue.edit',
                            notifyParent: parent
                        });

                    if(typeof callback === 'function') {
                        callback();
                    }
                }
            );
        },

        activate: function(args) {
            var THIS = this,
                queue_html = THIS.templates.queue.tmpl(),
                args = args || {};

            (args.parent || $('#ws-content'))
                .empty()
                .append(queue_html);

            THIS.render_list(queue_html, args.callback);
        },

        render_reports: function(data, parent) {
            var THIS = this,
                tab_data = [];

            THIS.setup_reports(parent);

            if(data.stats) {
                $.each(data.stats, function(k, v) {
                    if(v.calls) {
                        $.each(v.calls, function(k2, v2) {
                            if(v2.duration && v2.wait_time && v2.agent_id) {
                                if(v2.agent_id in data.field_data.users) {
                                    tab_data.push([k2, winkstart.friendly_seconds(v2.duration), data.field_data.users[v2.agent_id].first_name + ' ' + data.field_data.users[v2.agent_id].last_name, v.recorded_at]);
                                }
                                else {
                                    tab_data.push([k2, winkstart.friendly_seconds(v2.duration), 'Unknown', v.recorded_at]);
                                }
                            }
                            else {
                                tab_data.push([k2, '-', 'None ('+ v2.abandoned +')', v.recorded_at]);
                            }
                        });
                    }
                });
            }

            winkstart.table.reports.fnAddData(tab_data);
        },

        render_user_list: function(data, parent) {
            var THIS = this,
                user_data = {},
                sorted_users = [],
                list_names = [];

            THIS.setup_table(parent);

            /* First we're going through the list of users to get the last names */
            $.each(data.field_data.users, function(k, v) {
                if(v.last_name && list_names.indexOf(v.last_name.toLowerCase()) < 0) {
                    list_names.push(v.last_name.toLowerCase());
                }
            });

            /* Then we sort the array */
            list_names.sort();

            /* We build the function which will be use the second time we'll loop over users */
            var build_sort_users = function(k, user) {
                if(user.last_name) {
                    if(sorted_users[list_names.indexOf(user.last_name.toLowerCase())]) {
                        sorted_users[list_names.indexOf(user.last_name.toLowerCase())].push({
                            first_name: user.first_name,
                            last_name: user.last_name,
                            id: user.id
                        });
                    }
                    else {
                        sorted_users[list_names.indexOf(user.last_name.toLowerCase())] = [{
                            first_name: user.first_name,
                            last_name: user.last_name,
                            id: user.id
                        }];
                    }
                }
            };

            if(data.data.id && 'agents' in data.data && data.data.agents.length > 0) {
                $.each(data.field_data.users, function(k, v) {
                    if(data.data.agents.indexOf(v.id) >= 0) {
                        user_data[v.id] = {
                            first_name: v.first_name,
                            last_name: v.last_name,
                            id: v.id
                        }
                    }

                    build_sort_users(k, v);
                });

                THIS.refresh_table(user_data);
            }
            else {
                $.each(data.field_data.users, function(k, v) {
                    build_sort_users(k, v);
                });
            }

            $('#select_all_agents', parent).click(function() {
                $('.select_agent', parent).prop('checked', $(this).is(':checked'));
            });

            $('#add_agents', parent).click(function(ev) {
                ev.preventDefault();

                var add_agents_html = THIS.templates.add_agents.tmpl({
					_t: function(param){
						return window.translate['queue'][param];
					}
				}),
                    popup_agents = winkstart.dialog(add_agents_html, {
                        title: _t('queue', 'select_agents')
                    });

                var count_agents = 0;
                $.each(sorted_users, function(k, v) {
                    $.each(v, function(k2, v2) {
                        if(!(v2.id in user_data)) {
                            $('.unassigned_users', popup_agents).append(THIS.templates.available_user.tmpl(v2));
                        }
                        else {
                            count_agents++;
                            $('.list_agents', popup_agents).append(THIS.templates.selected_agent.tmpl(v2))
                        }
                    });
                });

                $('.count_agents', popup_agents).html(count_agents);

                $('.new_searchfield', popup_agents).keyup(function() {
                    var input = $(this),
                        rows = $('.unassigned_users .user_box', popup_agents),
                        search_string = $.trim(input.val().toLowerCase()),
                        matches = [],
                        cache = {};

                    $.each(rows, function(k, v) {
                        var data = $(this).dataset(),
                            key = data.first_name.toLowerCase() + ' ' + data.last_name.toLowerCase();

                        cache[key] ? cache[key].push($(this)) : cache[key] = [ $(this) ];
                    });

                    if (!search_string) {
                        rows.show();
                    }
                    else {
                        rows.hide();

                        $.each(cache, function(k, row_array) {
                            if (k.indexOf(search_string)>-1) {
                                $.each(row_array, function(k, v) {
                                    matches.push(v);
                                });
                            }
                        });

                        $.each(matches, function(k, v) {
                            $(v).show();
                        });
                    }
                });

                $(popup_agents).delegate('.queue_agent', 'click', function() {
                    $('.unassigned_users', popup_agents).prepend(THIS.templates.available_user.tmpl($(this).dataset()));
                    $(this).remove();
                    $('.count_agents', popup_agents).html(--count_agents);
                });

                $(popup_agents).delegate('.user_box', 'click', function() {
                    $('.list_agents', popup_agents).prepend(THIS.templates.selected_agent.tmpl($(this).dataset()));
                    $(this).remove();
                    $('.count_agents', popup_agents).html(++count_agents);
                });

                $('.create-agent', popup_agents).click(function() {
                    var _data = {};

                    ev.preventDefault();

                    winkstart.publish('user.popup_edit', _data, function(_data) {
                        var data_user = {
                            first_name: _data.data.first_name,
                            last_name: _data.data.last_name,
                            id: _data.data.id
                        };

                        $('.unassigned_users', popup_agents).prepend(THIS.templates.available_user.tmpl(data_user));
                    });
                });

                $('.add-agents', popup_agents).click(function() {
                    new_list = [],
                    //raw_data = winkstart.table.agents.fnGetData();

                    $('.list_agents .queue_agent', popup_agents).each(function(k, v) {
                        new_list.push($(this).dataset('id'));
                    });

                    data.field_data.user_list = {
                        old_list: data.data.agents || [],
                        new_list: new_list
                    };

                    THIS.update_users(data.field_data.user_list, data.data.id, function() {
                        //refresh grid
                        THIS.edit_queue({ id: data.data.id });

                        $(popup_agents).dialog('close');
                    });
                });
            });

            $('#remove_agents', parent).click(function(ev) {
                ev.preventDefault();

                if($('.select_agent:checked', parent).size() > 0) {
                    var map_agents = {};

                    $.each(data.data.agents, function(k, v) {
                        map_agents[v] = true;
                    });

                    $('.select_agent:checked', parent).each(function(k, v) {
                        delete map_agents[$(this).dataset('id')];
                    });

                    data.field_data.user_list = {
                        old_list: data.data.agents || [],
                        new_list: []
                    };

                    $.each(map_agents, function(k, v) {
                        data.field_data.user_list.new_list.push(k);
                    });

                    THIS.update_users(data.field_data.user_list, data.data.id, function() {
                        THIS.edit_queue({ id: data.data.id });
                    });
                }
                else {
                    winkstart.alert(_t('queue', 'you_didnt_select_any_agent'));
                }
            });

            $(parent).delegate('.action_user.edit', 'click', function() {
                var _data = {
                    id: $(this).parents('tr').first().attr('id')
                };

                winkstart.publish('user.popup_edit', _data, function(_data) {
                    user_data[_data.data.id] = {
                        first_name: _data.data.first_name,
                        last_name: _data.data.last_name
                    };

                    THIS.refresh_table(user_data);
                });
            });
        },

        refresh_table: function(user_data) {
            var THIS = this,
                tab_data = [];

            winkstart.table.agents.fnClearTable();

            $.each(user_data, function(k, v) {
                tab_data.push([k, k, v.first_name + ' ' + v.last_name, k]);
            });

            winkstart.table.agents.fnAddData(tab_data);
        },

        setup_reports: function(parent) {
            var THIS = this,
                columns = [
                {
                    'sTitle': _t('queue', 'call_id_title')
                },
                {
                    'sTitle': _t('queue', 'duration_title')
                },
                {
                    'sTitle': _t('queue', 'agent_title')
                },
                {
                    'sTitle': _t('queue', 'recorded_at_title'),
                    'fnRender': function(obj) {
                        var timestamp = obj.aData[obj.iDataColumn];
                        return winkstart.friendly_timestamp(timestamp);
                    }
                }
            ];

            winkstart.table.create('reports', $('#reports-grid', parent), columns, {}, {
                sDom: '<"buttons_div">frtlip',
                bAutoWidth: false,
                aaSorting: [[3, 'desc']],
            });

            $('#reports-grid_filter input[type=text]', parent).first().focus();

            $('.cancel-search', parent).click(function(){
                $('#reports-grid_filter input[type=text]', parent).val('');
                winkstart.table.reports.fnFilter('');
            });
        },

        setup_table: function(parent) {
            var THIS = this,
                columns = [
                {
                    'sTitle': '<input type="checkbox" id="select_all_agents"/>',
                    'fnRender': function(obj) {
                        var id = obj.aData[obj.iDataColumn];
                        return '<input data-id="'+ id +'" type="checkbox" class="select_agent"/>';
                    },
                    'bSortable': false,
                    'sWidth': '5%'
                },
                {
                    'sTitle': 'ID',
                    'bVisible': false
                },
                {
                    'sTitle': '<span class="icon medium user"></span> User',
                    'sWidth': '80%',
                    'fnRender': function(obj) {
                        var name = obj.aData[obj.iDataColumn];
                        return '<a class="action_user edit">'+ name +'</a>';
                    }
                },
                {
                    'sTitle': _t('queue', 'actions_title'),
                    'sWidth': '15%',
                    'bSortable': false,
                    'fnRender': function(obj) {
                        var id = obj.aData[obj.iDataColumn];
                        return '<a class="action_user edit icon medium pencil" data-id="'+ id +'"></a>';
                    }
                }
            ];

            winkstart.table.create('agents', $('#agents-grid', parent), columns, {}, {
                sDom: '<"buttons_div">frtlip',
                bAutoWidth: false,
                aaSorting: [[2, 'asc']],
                fnRowCallback: function(nRow, aaData, iDisplayIndex) {
                    $(nRow).attr('id', aaData[1]);
                    return nRow;
                }
            });

            $('#agents .buttons_div', parent).html('<button class="btn primary" id="add_agents">' + _t('queue', 'add_agents') + '</button>&nbsp;<button class="btn danger" id="remove_agents">' + _t('queue', 'remove_selected_agents') + '</button>');

            $('#agents-grid_filter input[type=text]', parent).first().focus();

            $('.cancel-search', parent).click(function(){
                $('#agents-grid_filter input[type=text]', parent).val('');
                winkstart.table.agents.fnFilter('');
            });
        },

        popup_edit_queue: function(data, callbacks, data_defaults) {
            var THIS = this,
                popup = winkstart.dialog($('<div class="inline_popup"><div class="inline_content main_content"/></div>'), {
                    title: _t('queue', 'edit_queue_title'),
                    position: ['center', 100]
                });

            THIS.render_queue(data, $('.main_content', popup), {
                save_success: function(_data) {
                    popup.dialog('close');

                    if(typeof callbacks.save_success == 'function') {
                        callbacks.save_success(_data);
                    }
                },
                delete_success: function() {
                    popup.dialog('close');

                    if(typeof callbacks.delete_success == 'function') {
                        callbacks.delete_success({ data: {} });
                    }
                }
            }, data_defaults);
        },

        define_callflow_nodes: function(callflow_nodes) {
            var THIS = this;

            $.extend(callflow_nodes, {
                'acdc_member[id=*]': {
                    name: _t('queue', 'queue'),
                    icon: 'queue',
                    category: _t('config', 'call_center_cat'),
                    module: 'acdc_member',
                    tip: _t('queue', 'queue_tip'),
                    data: {
                        id: 'null'
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        var id = node.getMetadata('id'),
                            returned_value = '';

                        if(id in caption_map) {
                            returned_value = caption_map[id].name;
                        }

                        return returned_value;
                    },
                    edit: function(node, callback) {
                        var _this = this;

                        winkstart.request(true, 'queue.list',  {
                                account_id: winkstart.apps['call_center'].account_id,
                                api_url: winkstart.apps['call_center'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html;

                                popup_html = THIS.templates.queue_callflow.tmpl({
                                    _t: function(param){
										return window.translate['queue'][param];
									},
									title: _t('queue', 'connect_a_caller_to_a_queue'),
                                    items: data.data,
                                    selected: node.getMetadata('id') || ''
                                });

                                if($('#queue_selector option:selected', popup_html).val() == undefined) {
                                    $('#edit_link', popup_html).hide();
                                }

                                $('.inline_action', popup_html).click(function(ev) {
                                    var _data = ($(this).dataset('action') == 'edit') ?
                                                    { id: $('#queue_selector', popup_html).val() } : {};

                                    ev.preventDefault();

                                    winkstart.publish('queue.popup_edit', _data, function(_data) {
                                        node.setMetadata('id', _data.data.id || 'null');

                                        node.caption = _data.data.name || '';

                                        popup.dialog('close');
                                    });
                                });

                                $('#add', popup_html).click(function() {
                                    node.setMetadata('id', $('#queue_selector', popup).val());

                                    node.caption = $('#queue_selector option:selected', popup).text();

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                    title: _t('queue', 'queue_title'),
                                    minHeight: '0',
                                    beforeClose: function() {
                                        if(typeof callback == 'function') {
                                            callback();
                                        }
                                    }
                                });
                            }
                        );
                    }
                },
                'acdc_queue[id=*,action=login]': {
                    name: _t('queue', 'queue_login'),
                    icon: 'queue',
                    category: _t('config', 'call_center_cat'),
                    module: 'acdc_queue',
                    tip: _t('queue', 'queue_login_tip'),
                    data: {
                        id: 'null',
                        action: 'login'
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        var id = node.getMetadata('id'),
                            returned_value = '';

                        if(id in caption_map) {
                            returned_value = caption_map[id].name;
                        }

                        return returned_value;
                    },
                    edit: function(node, callback) {
                        var _this = this;

                        winkstart.request(true, 'queue.list',  {
                                account_id: winkstart.apps['call_center'].account_id,
                                api_url: winkstart.apps['call_center'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html;

                                popup_html = THIS.templates.queue_callflow.tmpl({
									_t: function(param){
										return window.translate['queue'][param];
									},
                                    title: _t('queue', 'connects_an_agent_to_a_queue'),
                                    items: data.data,
                                    selected: node.getMetadata('id') || ''
                                });

                                if($('#queue_selector option:selected', popup_html).val() == undefined) {
                                    $('#edit_link', popup_html).hide();
                                }

                                $('.inline_action', popup_html).click(function(ev) {
                                    var _data = ($(this).dataset('action') == 'edit') ?
                                                    { id: $('#queue_selector', popup_html).val() } : {};

                                    ev.preventDefault();

                                    winkstart.publish('queue.popup_edit', _data, function(_data) {
                                        node.setMetadata('id', _data.data.id || 'null');

                                        node.caption = _data.data.name || '';

                                        popup.dialog('close');
                                    });
                                });

                                $('#add', popup_html).click(function() {
                                    node.setMetadata('id', $('#queue_selector', popup).val());

                                    node.caption = $('#queue_selector option:selected', popup).text();

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                    title: _t('queue', 'queue_title'),
                                    minHeight: '0',
                                    beforeClose: function() {
                                        if(typeof callback == 'function') {
                                            callback();
                                        }
                                    }
                                });
                            }
                        );
                    }
                },
                'acdc_queue[id=*,action=logout]': {
                    name: _t('queue', 'queue_logout'),
                    icon: 'queue',
                    category: _t('config', 'call_center_cat'),
                    module: 'acdc_queue',
                    tip: _t('queue', 'queue_logout_tip'),
                    data: {
                        id: 'null',
                        action: 'logout'
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        var id = node.getMetadata('id'),
                            returned_value = '';

                        if(id in caption_map) {
                            returned_value = caption_map[id].name;
                        }

                        return returned_value;
                    },
                    edit: function(node, callback) {
                        var _this = this;

                        winkstart.request(true, 'queue.list',  {
                                account_id: winkstart.apps['call_center'].account_id,
                                api_url: winkstart.apps['call_center'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html;

                                popup_html = THIS.templates.queue_callflow.tmpl({
									_t: function(param){
										return window.translate['queue'][param];
									},
                                    title: _t('queue', 'disconnects_an_agent_from_a_queue'),
                                    items: data.data,
                                    selected: node.getMetadata('id') || ''
                                });

                                if($('#queue_selector option:selected', popup_html).val() == undefined) {
                                    $('#edit_link', popup_html).hide();
                                }

                                $('.inline_action', popup_html).click(function(ev) {
                                    var _data = ($(this).dataset('action') == 'edit') ?
                                                    { id: $('#queue_selector', popup_html).val() } : {};

                                    ev.preventDefault();

                                    winkstart.publish('queue.popup_edit', _data, function(_data) {
                                        node.setMetadata('id', _data.data.id || 'null');

                                        node.caption = _data.data.name || '';

                                        popup.dialog('close');
                                    });
                                });

                                $('#add', popup_html).click(function() {
                                    node.setMetadata('id', $('#queue_selector', popup).val());

                                    node.caption = $('#queue_selector option:selected', popup).text();

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                    title: _t('queue', 'queue_title'),
                                    minHeight: '0',
                                    beforeClose: function() {
                                        if(typeof callback == 'function') {
                                            callback();
                                        }
                                    }
                                });
                            }
                        );
                    }
                },
                'acdc_agent[action=pause]': {
                    name: _t('queue', 'agent_pause'),
                    icon: 'rightarrow',
                    category: _t('config', 'call_center_cat'),
                    module: 'acdc_agent',
                    tip: _t('queue', 'agent_pause_tip'),
                    data: {
                        action: 'pause',
                        timeout: '900',
                        presence_id: ''
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        var id = node.getMetadata('timeout');

                        return (id) + ' seconds';
                    },
                    edit: function(node, callback) {
                        var popup, popup_html;

                        popup_html = THIS.templates.agent_pause_callflow.tmpl({
							_t: function(param){
								return window.translate['queue'][param];
							},
                            data_agent: {
                                'timeout': node.getMetadata('timeout') || '900',
                                'presence_id': node.getMetadata('presence_id')
                            }
                        });

                        $('#add', popup_html).click(function() {
                            var timeout = parseInt($('#timeout', popup_html).val()),
                            	presence_id = $('#presence_id', popup_html).val();

                            if(timeout > 0) {
                                node.setMetadata('timeout', timeout);
                                node.setMetadata('presence_id', presence_id);

                                node.caption = timeout + _t('queue', 'seconds');

                                popup.dialog('close');
                            }
                            else {
                                winkstart.alert(_t('queue', 'please_enter_a_valid_number_of_seconds'));
                            }
                        });

                        popup = winkstart.dialog(popup_html, {
                            title: _t('queue', 'pause_agent_title'),
                            minHeight: '0',
                            beforeClose: function() {
                                if(typeof callback == 'function') {
                                     callback();
                                }
                            }
                        });

                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                },
                'acdc_agent[action=resume]': {
                    name: _t('queue', 'agent_resume'),
                    icon: 'rightarrow',
                    category: _t('config', 'call_center_cat'),
                    module: 'acdc_agent',
                    tip: _t('queue', 'agent_resume_tip'),
                    data: {
                        action: 'resume',
                        presence_id: ''
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        return '';
                    },
                    edit: function(node, callback) {
                    	var popup, popup_html;

                        popup_html = THIS.templates.agent_presence_callflow.tmpl({
							_t: function(param){
								return window.translate['queue'][param];
							},
                            data_agent: {
                            	'action': _t('queue', 'resume_action'),
                                'presence_id': node.getMetadata('presence_id')
                            }
                        });

                        $('#add', popup_html).click(function() {
                            var presence_id = $('#presence_id', popup_html).val();

                            node.setMetadata('presence_id', presence_id);

                            popup.dialog('close');
                        });

                        popup = winkstart.dialog(popup_html, {
                            title: _t('queue', 'agent_resume_title'),
                            minHeight: '0',
                            beforeClose: function() {
                                if(typeof callback == 'function') {
                                     callback();
                                }
                            }
                        });

                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                },
                'acdc_agent[action=logout]': {
                    name: _t('queue', 'logout_agent'),
                    icon: 'rightarrow',
                    category: _t('config', 'call_center_cat'),
                    module: 'acdc_agent',
                    tip: _t('queue', 'logout_agent_tip'),
                    data: {
                        action: 'logout',
                        presence_id: ''
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        return '';
                    },
                    edit: function(node, callback) {
                    	var popup, popup_html;

                        popup_html = THIS.templates.agent_presence_callflow.tmpl({
							_t: function(param){
								return window.translate['queue'][param];
							},
                            data_agent: {
                            	'action': _t('queue', 'logout_action'),
                                'presence_id': node.getMetadata('presence_id')
                            }
                        });

                        $('#add', popup_html).click(function() {
                            var presence_id = $('#presence_id', popup_html).val();

                            node.setMetadata('presence_id', presence_id);

                            popup.dialog('close');
                        });

                        popup = winkstart.dialog(popup_html, {
                            title: _t('queue', 'logout_agent_title'),
                            minHeight: '0',
                            beforeClose: function() {
                                if(typeof callback == 'function') {
                                     callback();
                                }
                            }
                        });

                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                },
                'acdc_agent[action=login]': {
                    name: _t('queue', 'login_agent'),
                    icon: 'rightarrow',
                    category: _t('config', 'call_center_cat'),
                    module: 'acdc_agent',
                    tip: _t('queue', 'login_agent_tip'),
                    data: {
                        action: 'login',
                        presence_id: ''
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        return '';
                    },
                    edit: function(node, callback) {
						var popup, popup_html;

                        popup_html = THIS.templates.agent_presence_callflow.tmpl({
							_t: function(param){
								return window.translate['queue'][param];
							},
                            data_agent: {
                            	'action': _t('queue', 'login_action'),
                                'presence_id': node.getMetadata('presence_id')
                            }
                        });

                        $('#add', popup_html).click(function() {
                            var presence_id = $('#presence_id', popup_html).val();

                            node.setMetadata('presence_id', presence_id);

                            popup.dialog('close');
                        });

                        popup = winkstart.dialog(popup_html, {
                            title: _t('queue', 'login_agent_title'),
                            minHeight: '0',
                            beforeClose: function() {
                                if(typeof callback == 'function') {
                                     callback();
                                }
                            }
                        });

                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                }
            });
        }
    }
);
