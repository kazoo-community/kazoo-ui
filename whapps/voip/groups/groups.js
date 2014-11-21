winkstart.module('voip', 'groups', {
        css: [
            'css/groups.css'
        ],

        templates: {
            groups: 'tmpl/groups.html',
            edit: 'tmpl/edit.html',
            groups_callflow: 'tmpl/groups_callflow.html',
            endpoint_row: 'tmpl/endpoint_row.html'
        },

        subscribe: {
            'groups.activate': 'activate',
            'groups.edit': 'edit_groups',
            'callflow.define_callflow_nodes': 'define_callflow_nodes',
            'groups.popup_edit': 'popup_edit_groups'
        },

        validation: [
            { name: '#name',                 regex: /^.*/ }
        ],

        resources: {
            'groups.list': {
                url: '{api_url}/accounts/{account_id}/groups',
                contentType: 'application/json',
                verb: 'GET'
            },
            'groups.get': {
                url: '{api_url}/accounts/{account_id}/groups/{groups_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'groups.create': {
                url: '{api_url}/accounts/{account_id}/groups',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'groups.update': {
                url: '{api_url}/accounts/{account_id}/groups/{groups_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'groups.delete': {
                url: '{api_url}/accounts/{account_id}/groups/{groups_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            },
            'groups.user_list': {
                url: '{api_url}/accounts/{account_id}/users',
                contentType: 'application/json',
                verb: 'GET'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        winkstart.publish('whappnav.subnav.add', {
            whapp: 'voip',
            module: THIS.__module,
            label: _t('groups', 'groups_label'),
            icon: 'user',
            weight: '60',
            category: _t('config', 'advanced_menu_cat')
        });
    },

    {
        save_groups: function(form_data, data, success, error) {
            var THIS = this,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

            if (typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'groups.update', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        groups_id: data.data.id,
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
                winkstart.request(true, 'groups.create', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
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

        edit_groups: function(data, _parent, _target, _callbacks, data_defaults){
            var THIS = this,
                parent = _parent || $('#groups-content'),
                target = _target || $('#groups-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.render_list(parent);

                        THIS.edit_groups({ id: _data.data.id }, parent, target, callbacks);
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
                    	endpoints: {},
                        music_on_hold: {}
                    }, data_defaults || {}),
                    field_data: {}
                };

            winkstart.parallel({
                    device_list: function(callback) {
                        winkstart.request(true, 'device.list', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(_data_devices, status) {
                                defaults.field_data.devices = _data_devices.data;

                                callback(null, _data_devices);
                            }
                        );
                    },
                    user_list: function(callback) {
                        winkstart.request(true, 'user.list', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(_data, status) {
                                defaults.field_data.users = _data.data;

                                callback(null, _data);
                            }
                        );
                    },
                    groups_get: function(callback) {
                        if(typeof data === 'object' && data.id) {
                            winkstart.request(true, 'groups.get', {
                                    account_id: winkstart.apps['voip'].account_id,
                                    api_url: winkstart.apps['voip'].api_url,
                                    groups_id: data.id
                                },
                                function(_data, status) {
                                    callback(null, _data);
                                }
                            );
                        }
                        else {
                            callback(null, {});
                        }
                    }
                },
                function(err, results) {
                    var render_data = defaults;

                    if(typeof data === 'object' && data.id) {
                        render_data = $.extend(true, defaults, results.groups_get);
                    }

                    render_data = THIS.format_data(render_data);

                    THIS.render_groups(render_data, target, callbacks);

                    if(typeof callbacks.after_render == 'function') {
                        callbacks.after_render();
                    }
                }
            );
        },

        delete_groups: function(data, success, error) {
            var THIS = this;

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'groups.delete', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        groups_id: data.data.id
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

        render_groups: function(data, target, callbacks){
			data._t = function(param){
				return window.translate['groups'][param];
			};
            var THIS = this,
                groups_html = THIS.templates.edit.tmpl(data);

            THIS.render_endpoint_list(data, groups_html);

            winkstart.validate.set(THIS.config.validation, groups_html);

            winkstart.timezone.populate_dropdown($('#timezone', groups_html), data.data.timezone);

            $('#tab_users > .rows', groups_html).sortable({
                handle: '.column.first'
            });

            $('*[rel=popover]:not([type="text"])', groups_html).popover({
                trigger: 'hover'
            });

            $('*[rel=popover][type="text"]', groups_html).popover({
                trigger: 'focus'
            });

            winkstart.tabs($('.view-buttons', groups_html), $('.tabs', groups_html));

            $('.group-save', groups_html).click(function(ev) {
                ev.preventDefault();

                winkstart.validate.is_valid(THIS.config.validation, groups_html, function() {
                        var form_data = form2object('group-form');
                        THIS.clean_form_data(form_data, data.field_data);

                        form_data.endpoints = {};

                        $('.rows .row:not(#row_no_data)', groups_html).each(function(k, v) {
                            form_data.endpoints[$(v).dataset('id')] = { 
                                type: $(v).dataset('type'),
                                weight: k+1
                            };
                        });

                        delete data.data.resources;
                        delete data.data.endpoints;

                        THIS.save_groups(form_data, data, callbacks.save_success, winkstart.error_message.process_error(callbacks.save_error));
                    },
                    function() {
                        winkstart.alert(_t('groups', 'there_were_errors_on_the_form'));
                    }
                );
            });

            $('.group-delete', groups_html).click(function(ev) {
                ev.preventDefault();

                winkstart.confirm(_t('groups', 'are_you_sure_you_want_to_delete'), function() {
                    THIS.delete_groups(data, callbacks.delete_success, callbacks.delete_error);
                });
            });

            add_user = function() {
                var $user = $('#select_user_id', groups_html);

                if($user.val() != 'empty_option_user') {
                    var user_id = $user.val();

                    $.each(data.field_data.users, function(k, v) {
                        if(user_id === v.id) {
                            var user_data = {
                                endpoint_id: user_id,
                                endpoint_type: 'user',
                                endpoint_name: v.first_name + ' ' + v.last_name,
                            };

                            data.data.endpoints.push(user_data);

                            data.data.endpoints.sort(function(a,b){
                                return a.endpoint_name.toLowerCase() > b.endpoint_name.toLowerCase();
                            });

                            THIS.render_endpoint_list(data, groups_html);

                            $user.val('empty_option_user');
                        }

                    });
                }

            },
            add_device = function() {
                var $device = $('#select_device_id', groups_html);

                if($device.val() != 'empty_option_device') {
                    var device_id = $device.val();

                    $.each(data.field_data.devices, function(k, v){
                        if(device_id === v.id) {
                            var device_data = {
                                endpoint_id: device_id,
                                endpoint_type: 'device',
                                endpoint_name: v.name,
                            };

                            data.data.endpoints.push(device_data);

                            data.data.endpoints.sort(function(a,b){
                                return a.endpoint_name.toLowerCase() > b.endpoint_name.toLowerCase();
                            });

                            THIS.render_endpoint_list(data, groups_html);

                            $device.val('empty_option_device');
                        }

                    });
                }
            },

            $('#select_user_id', groups_html).change(function() {
                add_user();
            });
            $('#select_device_id', groups_html).change(function() {
                add_device();
            });

            if(!$('#music_on_hold_media_id', groups_html).val()) {
                $('#edit_link_media', groups_html).hide();
            }

            $('#music_on_hold_media_id', groups_html).change(function() {
                !$('#music_on_hold_media_id option:selected', groups_html).val() ? $('#edit_link_media', groups_html).hide() : $('#edit_link_media', groups_html).show();
            });

            $('.inline_action_media', groups_html).click(function(ev) {
                var _data = ($(this).dataset('action') == 'edit') ? { id: $('#music_on_hold_media_id', groups_html).val() } : {},
                    _id = _data.id;

                ev.preventDefault();

                winkstart.publish('media.popup_edit', _data, function(_data) {
                    /* Create */
                    if(!_id) {
                        $('#music_on_hold_media_id', groups_html).append('<option id="'+ _data.data.id  +'" value="'+ _data.data.id +'">'+ _data.data.name +'</option>')
                        $('#music_on_hold_media_id', groups_html).val(_data.data.id);

                        $('#edit_link_media', groups_html).show();
                    }
                    else {
                        /* Update */
                        if('id' in _data.data) {
                            $('#music_on_hold_media_id #'+_data.data.id, groups_html).text(_data.data.name);
                        }
                        /* Delete */
                        else {
                            $('#music_on_hold_media_id #'+_id, groups_html).remove();
                            $('#edit_link_media', groups_html).hide();
                        }
                    }
                });
            });

            $(groups_html).delegate('.action_endpoint.delete', 'click', function() {
                var endpoint_id = $(this).dataset('id');
                //removes it from the grid
                $('#row_endpoint_'+endpoint_id, groups_html).remove();
                //re-add it to the dropdown
                $('#option_endpoint_'+endpoint_id, groups_html).show();
                //if grid empty, add no data line
                if($('.rows .row', groups_html).size() === 0) {
                    $('.rows', groups_html).append(THIS.templates.endpoint_row.tmpl({
						_t: function(param){
							return window.translate['groups'][param];
						}
					}));
                }

				/* TODO For some reason splice doesn't work and I don't have time to make it better for now */
                var new_list = [];

                $.each(data.data.endpoints, function(k, v) {
                    if(!(v.endpoint_id === endpoint_id)) {
                        new_list.push(v);
                    }
                });

                data.data.endpoints = new_list;
            });

            (target)
                .empty()
                .append(groups_html);
        },

        format_data: function(data){
	        var user_item,
	            list_endpoint = [];

	        $.each(data.field_data.users, function(k, v) {
	            if(v.id in data.data.endpoints) {
	                endpoint_item = {
	                    endpoint_type: 'user',
	                    endpoint_id: v.id,
	                    endpoint_name: v.first_name + ' ' + v.last_name,
                        endpoint_weight: data.data.endpoints[v.id].weight || 0
	                };

	                list_endpoint.push(endpoint_item);
	            }
	        });

	        $.each(data.field_data.devices, function(k, v) {
	            if(v.id in data.data.endpoints) {
	                endpoint_item = {
	                    endpoint_type: 'device',
	                    endpoint_id: v.id,
	                    endpoint_name: v.name,
                        endpoint_weight: data.data.endpoints[v.id].weight || 0
	                };

	                list_endpoint.push(endpoint_item);
	            }
	        });

	        list_endpoint.sort(function(a,b){
	            return a.endpoint_weight - b.endpoint_weight;
	        });

	        data.data.endpoints = list_endpoint;

			return data;
        },

        normalize_data: function(form_data) {
            delete form_data.users;
            return form_data;
        },

        clean_form_data: function(form_data, field_data) {
            var new_resource = {};

            if('resources' in form_data) {
                $.each(form_data.resources, function(k, v) {
                    if(v !== false) {
                        if(v in field_data.resources['local']) {
                            new_resource[v] = { type: 'local' };
                        }
                        else {
                            new_resource[v] = { type: 'global' };
                        }
                    }
                });
            }

            form_data.resources = new_resource;

            delete form_data.extra;
        },

        render_list: function(_parent){
            var THIS = this,
                parent = _parent || $('#groups-content');;

            winkstart.request(true, 'groups.list', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function (data, status) {
                    var map_crossbar_data = function(data) {
                       var new_list = [];

                        if(data.length > 0) {
                            $.each(data, function(key, val) {
                                new_list.push({
                                    id: val.id,
                                    title: val.name || _t('groups', 'no_name')
                                });
                            });
                        }

                        new_list.sort(function(a, b) {
                            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                        });

                        return new_list;
                    };

                    $('#groups-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: _t('groups', 'groups_label'),
                            identifier: 'groups-listview',
                            new_entity_label: _t('groups', 'add_group_label'),
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'groups.edit',
                            notifyCreateMethod: 'groups.edit',
                            notifyParent: parent
                        });
                }
            );
        },

        activate: function(parent) {
            var THIS = this,
                groups_html = THIS.templates.groups.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(groups_html);

            THIS.render_list(groups_html);
        },

        render_endpoint_list: function(data, parent) {
            var THIS = this;

            $('.rows', parent).empty();

            if('endpoints' in data.data && data.data.endpoints.length > 0) {
                console.log(data.data.endpoints)
                $.each(data.data.endpoints, function(k, item){
                    $('.rows', parent).append(THIS.templates.endpoint_row.tmpl(item));
                    $('#option_endpoint_'+item.endpoint_id, parent).hide();
                });
            }
            else {
                $('.rows', parent).empty()
                                  .append(THIS.templates.endpoint_row.tmpl({
									_t: function(param){
										return window.translate['groups'][param];
									}
								  }));
            }
        },

        popup_edit_groups: function(data, callback, data_defaults) {
            var popup, popup_html;

            popup_html = $('<div class="inline_popup"><div class="inline_content main_content"/></div>');

            winkstart.publish('groups.edit', data, popup_html, $('.inline_content', popup_html), {
                save_success: function(_data) {
                    popup.dialog('close');

                    if(typeof callback == 'function') {
                        callback(_data);
                    }
                },
                delete_success: function() {
                    popup.dialog('close');

                    if(typeof callback == 'function') {
                        callback({ data: {} });
                    }
                },
                after_render: function() {
                    popup = winkstart.dialog(popup_html, {
                        title: (data.id) ? _t('groups', 'edit_groups') : _t('groups', 'create_groups')
                    });
                }
            }, data_defaults);
        }
    }
);
