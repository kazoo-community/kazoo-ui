winkstart.module('voip', 'conference', {
        css: [
            'css/style.css'
        ],

        templates: {
            conference: 'tmpl/conference.html',
            edit: 'tmpl/edit.html',
            conference_callflow: 'tmpl/conference_callflow.html'
        },

        subscribe: {
            'conference.activate': 'activate',
            'conference.edit': 'edit_conference',
            'callflow.define_callflow_nodes': 'define_callflow_nodes',
            'conference.popup_edit': 'popup_edit_conference'
        },

        resources: {
            'conference.list': {
                url: '{api_url}/accounts/{account_id}/conferences',
                contentType: 'application/json',
                verb: 'GET'
            },
            'conference.get': {
                url: '{api_url}/accounts/{account_id}/conferences/{conference_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'conference.create': {
                url: '{api_url}/accounts/{account_id}/conferences',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'conference.update': {
                url: '{api_url}/accounts/{account_id}/conferences/{conference_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'conference.delete': {
                url: '{api_url}/accounts/{account_id}/conferences/{conference_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            },
            'user.list': {
                url: '{api_url}/accounts/{account_id}/users',
                contentType: 'application/json',
                verb: 'GET'
            }
        },

        validation: [
            { name: '#name',                  regex: /^.+$/ },
            { name: '#member_pins_string',    regex: /^[a-z0-9A-Z,\s]*$/ },
            { name: '#member_numbers_string', regex: /^[0-9,\s]*$/ }
        ]
    },
    function(args) {
        var THIS = this;

        winkstart.registerResources(this.__whapp, this.config.resources);

        winkstart.publish('subnav.add', {
            whapp: 'voip',
            module: this.__module,
            label: 'Conferences',
            icon: 'conference',
            weight: '05'
        });
    },
    {
        letters_to_numbers: function(string) {
            var result = '';

            $.each(string.split(''), function(index, value) {
                if(value.match(/^[aAbBcC]$/)) {
                    result += '2';
                }
                else if(value.match(/^[dDeEfF]$/)) {
                    result += '3';
                }
                else if(value.match(/^[gGhHiI]$/)) {
                    result += '4';
                }
                else if(value.match(/^[jJkKlL]$/)) {
                    result += '5';
                }
                else if(value.match(/^[mMnNoO]$/)) {
                    result += '6';
                }
                else if(value.match(/^[pPqQrRsS]$/)) {
                    result += '7';
                }
                else if(value.match(/^[tTuUvV]$/)) {
                    result += '8';
                }
                else if(value.match(/^[wWxXyYzZ]$/)) {
                    result += '9';
                }
                else {
                    result += value;
                }
            });

            return result;
        },

        save_conference: function(form_data, data, success, error) {
            var THIS = this,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'conference.update', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        conference_id: data.data.id,
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
                winkstart.request(true, 'conference.create', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        data: normalized_data
                    },
                    function(_data, status) {
                        if(typeof success == 'function') {
                            success(_data, status, 'create');
                        }
                    },
                    function(_data, status) {
                        if(typeof error == 'function') {
                            error(_data, status, 'create');
                        }
                    }
                );
            }
        },

        edit_conference: function(data, _parent, _target, _callbacks, data_defaults){
            var THIS = this,
                parent = _parent || $('#conference-content'),
                target = _target || $('#conference-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.render_list(parent);

                        THIS.edit_conference({ id: _data.data.id }, parent, target, callbacks);
                    },

                    save_error: _callbacks.save_error,

                    delete_success: _callbacks.delete_success || function() {
                        target.empty(),

                        THIS.render_list(parent);
                    },

                    delete_error: _callbacks.delete_error,

                    after_render: _callbacks.after_render
                },
                defaults = {
                    data: $.extend(true, {
                        member_play_name: true,
                        member: {}
                    }, data_defaults || {}),
                    field_data: {
                        users: []
                    }
                };

            winkstart.request(true, 'user.list', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(_data, status) {
                    _data.data.unshift({
                        id: '',
                        first_name: '- No',
                        last_name: 'owner -'
                    });

                    defaults.field_data.users = _data.data;

                    if(typeof data == 'object' && data.id) {
                        winkstart.request(true, 'conference.get', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url,
                                conference_id: data.id
                            },
                            function(_data, status) {
                                THIS.migrate_data(_data);

                                THIS.format_data(_data);

                                THIS.render_conference($.extend(true, defaults, _data), target, callbacks);

                                if(typeof callbacks.after_render == 'function') {
                                    callbacks.after_render();
                                }
                            }
                        );
                    }
                    else {
                        THIS.render_conference(defaults, target, callbacks);

                        if(typeof callbacks.after_render == 'function') {
                            callbacks.after_render();
                        }
                    }
                }
            );
        },

        delete_conference: function(data, success, error) {
            var THIS = this;

            if(data.data.id) {
                winkstart.request(true, 'conference.delete', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        conference_id: data.data.id
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

        render_conference: function(data, target, callbacks){
            var THIS = this,
                conference_html = THIS.templates.edit.tmpl(data);

            winkstart.validate.set(THIS.config.validation, conference_html);

            $('*[tooltip]', conference_html).each(function() {
                $(this).tooltip({ attach: conference_html });
            });

            $('ul.settings1', conference_html).tabs($('.pane > div', conference_html));
            $('ul.settings2', conference_html).tabs($('.advanced_pane > div', conference_html));

            $('#name', conference_html).focus();

            $('.advanced_pane', conference_html).hide();
            $('.advanced_tabs_wrapper', conference_html).hide();

            $('#advanced_settings_link', conference_html).click(function() {
                if($(this).attr('enabled') === 'true') {
                    $(this).attr('enabled', 'false');
                    $('.advanced_pane', conference_html).slideToggle(function() {
                        $('.advanced_tabs_wrapper', conference_html).animate({width: 'toggle'});
                    });
                }
                else {
                    $(this).attr('enabled', 'true');

                    $('.advanced_tabs_wrapper', conference_html).animate({width: 'toggle'}, function() {
                        $('.advanced_pane', conference_html).slideToggle();
                    });
                }
            });

            if(!$('#owner_id', conference_html).val()) {
                $('#edit_link', conference_html).hide();
            }

            $('#owner_id', conference_html).change(function() {
                !$('#owner_id option:selected', conference_html).val() ? $('#edit_link', conference_html).hide() : $('#edit_link', conference_html).show();
            });

            $('.inline_action', conference_html).click(function(ev) {
                var _data = ($(this).dataset('action') == 'edit') ? { id: $('#owner_id', conference_html).val() } : {},
                    _id = _data.id;

                ev.preventDefault();

                winkstart.publish('user.popup_edit', _data, function(_data) {
                    /* Create */
                    if(!_id) {
                        $('#owner_id', conference_html).append('<option id="'+ _data.data.id  +'" value="'+ _data.data.id +'">'+ _data.data.first_name + ' ' + _data.data.last_name  +'</option>');
                        $('#owner_id', conference_html).val(_data.data.id);
                        $('#edit_link', conference_html).show();
                    }
                    else {
                        /* Update */
                        if('id' in _data.data) {
                            $('#owner_id #'+_data.data.id, conference_html).text(_data.data.first_name + ' ' + _data.data.last_name);
                        }
                        /* Delete */
                        else {
                            $('#owner_id #'+_id, conference_html).remove();
                            $('#edit_link', conference_html).hide();
                        }
                    }
                });
            });

            $('.conference-save', conference_html).click(function(ev) {
                ev.preventDefault();

                winkstart.validate.is_valid(THIS.config.validation, conference_html, function() {
                        var form_data = form2object('conference-form');

                        THIS.clean_form_data(form_data);

                        if('field_data' in data) {
                            delete data.field_data;
                        }

                        THIS.save_conference(form_data, data, callbacks.save_success, callbacks.save_error);
                    },
                    function() {
                        alert('There were errors on the form, please correct!');
                    }
                );
            });

            $('.conference-delete', conference_html).click(function(ev) {
                ev.preventDefault();

                THIS.delete_conference(data, callbacks.delete_success, callbacks.delete_error);
            });

            (target)
                .empty()
                .append(conference_html);
        },

        migrate_data: function(data) {
            if($.isArray(data.data.conference_numbers)) {
                data.data.member.numbers = data.data.conference_numbers;

                delete data.data.conference_numbers;
            }

            return data;
        },

        format_data: function(data) {
            if(typeof data.data.member == 'object') {
                if($.isArray(data.data.member.pins)) {
                    data.data.member.pins_string = data.data.member.pins.join(', ');
                }

                if($.isArray(data.data.member.numbers)) {
                    data.data.member.numbers_string = data.data.member.numbers.join(', ');
                }
            }

            return data;
        },

        normalize_data: function(data) {
            if(!data.member.pins.length) {
                delete data.member.pins;
            }

            if(!data.member.numbers.length) {
                delete data.member.numbers;
            }

            if(!data.owner_id) {
                delete data.owner_id;
            }

            delete data.member.pins_string;
            delete data.member.numbers_string;

            return data;
        },

        clean_form_data: function(form_data){
            var THIS = this;

            form_data.member.pins_string = THIS.letters_to_numbers(form_data.member.pins_string);

            form_data.member.pins = $.map(form_data.member.pins_string.split(','), function(val) {
                var pin = $.trim(val);

                if(pin != '') {
                    return pin;
                }
                else {
                    return null;
                }
            });

            form_data.member.numbers = $.map(form_data.member.numbers_string.split(','), function(val) {
                var number = $.trim(val);

                if(number != '') {
                    return number;
                }
                else {
                    return null;
                }
            });

            return form_data;
        },

        render_list: function(parent){
            var THIS = this;

            winkstart.request(true, 'conference.list', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(data, status) {
                    var map_crossbar_data = function(data) {
                        var new_list = [];

                        if(data.length > 0) {
                            $.each(data, function(key, val) {
                                new_list.push({
                                    id: val.id,
                                    title: val.name || '(name)'
                                });
                            });
                        }

                        new_list.sort(function(a, b) {
                            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                        });

                        return new_list;
                };

                $('#conference-listpanel', parent)
                    .empty()
                    .listpanel({
                        label: 'Conferences',
                        identifier: 'conference-listview',
                        new_entity_label: 'Add Conference',
                        data: map_crossbar_data(data.data),
                        publisher: winkstart.publish,
                        notifyMethod: 'conference.edit',
                        notifyCreateMethod: 'conference.edit',
                        notifyParent: parent
                    });
               });
        },

        activate: function(parent) {
            var THIS = this,
                conference_html = THIS.templates.conference.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(conference_html);

            THIS.render_list(conference_html);
        },

        popup_edit_conference: function(data, callback) {
            var popup, popup_html;

            popup_html = $('<div class="inline_popup"><div class="inline_content"/></div>');

            winkstart.publish('conference.edit', data, popup_html, $('.inline_content', popup_html), {
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
                        title: (data.id) ? 'Edit conference' : 'Create conference'
                    });
                }
            });
        },

        define_callflow_nodes: function(callflow_nodes) {
            var THIS = this;

            $.extend(callflow_nodes, {
                'conference[id=*]': {
                    name: 'Conference',
                    icon: 'conference',
                    category: 'Basic',
                    module: 'conference',
                    tip: 'Connect a caller to a Meet-Me conference bridge',
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
                        var id = node.getMetadata('id');

                        return (id && id != '') ? caption_map[id].name : '';
                    },
                    edit: function(node, callback) {
                        var _this = this;

                        winkstart.request(true, 'conference.list', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html;

                                popup_html = THIS.templates.conference_callflow.tmpl({
                                    items: data.data,
                                    selected: node.getMetadata('id') || '!'
                                });

                                if($('#conference_selector option:selected', popup_html).val() == undefined) {
                                    $('#edit_link', popup_html).hide();
                                }

                                $('.inline_action', popup_html).click(function(ev) {
                                    var _data = ($(this).dataset('action') == 'edit') ?
                                                    { id: $('#conference_selector', popup_html).val() } : {};

                                    ev.preventDefault();

                                    winkstart.publish('conference.popup_edit', _data, function(_data) {
                                        node.setMetadata('id', _data.data.id || 'null');

                                        node.caption = _data.data.name || '';

                                        popup.dialog('close');
                                    });
                                });

                                $('.submit_btn', popup_html).click(function() {
                                    node.setMetadata('id', $('#conference_selector', popup_html).val());

                                    node.caption = $('#conference_selector option:selected', popup_html).text();

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                     title: 'Conference',
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

                'conference[]': {
                    name: 'Conference Service',
                    icon: 'conference',
                    category: 'Advanced',
                    module: 'conference',
                    tip: 'Transfer the caller to the conference call service, prompting for both a conference number and a pin',
                    data: {},
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node) {
                        return '';
                    },
                    edit: function(node, callback) {
                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                }
            });
        }
    }
);
