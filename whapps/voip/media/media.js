winkstart.module('voip', 'media', {
        css: [
            'css/media.css'
        ],

        templates: {
            media: 'tmpl/media.html',
            edit: 'tmpl/edit.html',
            media_callflow: 'tmpl/media_callflow.html'
        },

        subscribe: {
            'media.activate': 'activate',
            'media.edit': 'edit_media',
            'callflow.define_callflow_nodes': 'define_callflow_nodes',
            'media.popup_edit': 'popup_edit_media'
        },

        validation : [
            { name: '#name', regex: /^.+$/ }
        ],

        resources: {
            'media.list': {
                url: '{api_url}/accounts/{account_id}/media',
                contentType: 'application/json',
                verb: 'GET'
            },
            'media.get': {
                url: '{api_url}/accounts/{account_id}/media/{media_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'media.create': {
                url: '{api_url}/accounts/{account_id}/media',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'media.update': {
                url: '{api_url}/accounts/{account_id}/media/{media_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'media.delete': {
                url: '{api_url}/accounts/{account_id}/media/{media_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        winkstart.publish('subnav.add', {
            whapp: 'voip',
            module: THIS.__module,
            label: 'Media',
            icon: 'media',
            weight: '45'
        });
    },

    {
        save_media: function(form_data, data, success, error) {
            var THIS = this,
                normalized_data = THIS.normalize_data($.extend(true, {}, data.data, form_data));

            if(typeof data.data == 'object' && data.data.id) {
                winkstart.request(true, 'media.update', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        media_id: data.data.id,
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
                winkstart.request(true, 'media.create', {
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

        _hijackForm: function(media_id, media_html, callback) {
            var THIS = this;

            $('#media-form', media_html).submit(function() {
                /* Mad hax */
                $('#media-form', media_html).attr('target', 'upload_target');

                $('#upload_target', media_html).load(function() {
                    if(typeof callback == 'function') {
                        callback();
                    }
                });
            });

            $('#media-form', media_html).attr('action', winkstart.apps['voip'].api_url + '/accounts/'+ winkstart.apps['voip'].account_id + '/media/'+ media_id +'/raw');
            $('#media-form', media_html).submit();
        },

        edit_media: function(data, _parent, _target, _callbacks, data_defaults){
            var THIS = this,
                parent = _parent || $('#media-content'),
                target = _target || $('#media-view', parent),
                _callbacks = _callbacks || {},
                callbacks = {
                    save_success: _callbacks.save_success || function(_data) {
                        THIS.render_list(parent);

                        THIS.edit_media({ id: _data.data.id }, parent, target, callbacks);
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
                        streamable: true
                    }, data_defaults || {}),
                    auth_token: winkstart.apps['voip'].auth_token
                };

            if(typeof data == 'object' && data.id) {
                winkstart.request(true, 'media.get', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        media_id: data.id
                    },
                    function(_data, status) {
                        THIS.format_data(_data);

                        THIS.render_media($.extend(true, defaults, _data), target, callbacks);

                        if(typeof callbacks.after_render == 'function') {
                            callbacks.after_render();
                        }
                    }
                );
            }
            else {
                THIS.render_media(defaults, target, callbacks);

                if(typeof callbacks.after_render == 'function') {
                    callbacks.after_render();
                }
            }
        },

        delete_media: function(data, success, error) {
            var THIS = this;

            if(data.data.id) {
                winkstart.request(true, 'media.delete', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        media_id: data.data.id
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

        render_media: function(data, target, callbacks){
            var THIS = this,
                media_html = THIS.templates.edit.tmpl(data);

            winkstart.validate.set(THIS.config.validation, media_html);

            $('*[tooltip]', media_html).each(function() {
                $(this).tooltip({ attach: media_html });
            });

            $('ul.settings1', media_html).tabs($('.pane > div', media_html));
            $('ul.settings2', media_html).tabs($('.advanced_pane > div', media_html));

            $('#name', media_html).focus();

            $('.advanced_pane', media_html).hide();
            $('.advanced_tabs_wrapper', media_html).hide();

            $('#advanced_settings_link', media_html).click(function() {
                if($(this).attr('enabled') === 'true') {
                    $(this).attr('enabled', 'false');

                    $('.advanced_pane', media_html).slideToggle(function() {
                        $('.advanced_tabs_wrapper', media_html).animate({ width: 'toggle' });
                    });
                }
                else {
                    $(this).attr('enabled', 'true');

                    $('.advanced_tabs_wrapper', media_html).animate({
                            width: 'toggle'
                        },
                        function() {
                            $('.advanced_pane', media_html).slideToggle();
                        }
                    );
                }
            });

            if(data.data.id != undefined && data.data.description != '') {
                $('#upload_span', media_html).hide();
                $('#player_file', media_html).show();
            }
            else {
                $('#upload_span', media_html).show();
                $('#player_file', media_html).hide();
            }

            $('#change_link', media_html).click(function() {
                $('#upload_span', media_html).show();
                $('#player_file', media_html).hide();
            });

            $('#download_link', media_html).click(function() {
                window.location.href = winkstart.apps['voip'].api_url + '/accounts/' +
                                       winkstart.apps['voip'].account_id + '/media/' +
                                       data.data.id + '/raw?auth_token=' + winkstart.apps['voip'].auth_token;
            });

            $('.media-save', media_html).click(function(ev) {
                ev.preventDefault();

                winkstart.validate.is_valid(THIS.config.validation, media_html, function() {
                        var form_data = form2object('media-form');

                        form_data = THIS.clean_form_data(form_data);

                        THIS.save_media(form_data, data, function(_data, status) {
                                if($('#upload_span', media_html).is(':visible') && $('#file').val() != '') {
                                    THIS._hijackForm(_data.data.id, media_html, function() {
                                        if(typeof callbacks.save_success == 'function') {
                                            callbacks.save_success(_data, status);
                                        }
                                    });
                                }
                                else {
                                    if(typeof callbacks.save_success == 'function') {
                                        callbacks.save_success(_data, status);
                                    }
                                }
                            },
                            callbacks.save_error
                        );
                    },
                    function() {
                        alert('There were errors on the form, please correct!');
                    }
                );
            });

            $('.media-delete', media_html).click(function(ev) {
                ev.preventDefault();

                THIS.delete_media(data, callbacks.delete_success, callbacks.delete_error);
            });

            (target)
                .empty()
                .append(media_html);
        },

        clean_form_data: function(form_data) {
            form_data.description = form_data.upload_media;

            if(form_data.description == '') {
                delete form_data.description;
            }

            return form_data;
        },

        format_data: function(data) {
            /* On creation, crossbar store streamable as a string, and as a boolean on update
            * And as we're using the same template for both behaviors, we need the same kind of data.
            * TODO: delete once this bug is fixed!
            */
            if(data.data.streamable == 'false') {
                 data.data.streamable = false;
            }
            else if(data.data.streamable == 'true') {
                data.data.streamable = true;
            }

            if(data.data.description != undefined && data.data.description.substr(0,12) == 'C:\\fakepath\\') {
                data.data.description = data.data.description.substr(12);
            }

            return data;
        },

        normalize_data: function(form_data) {
            delete form_data.upload_media;

            if('field_data' in form_data) {
                delete form_data.field_data;
            }

            return form_data;
        },

        render_list: function(parent){
            var THIS = this;

            winkstart.request(true, 'media.list', {
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
                                    title: val.name || '(no name)'
                                });
                            });
                        }

                        new_list.sort(function(a, b) {
                            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                        });

                        return new_list;
                    };

                    $('#media-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: 'Media',
                            identifier: 'media-listview',
                            new_entity_label: 'Add Media',
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'media.edit',
                            notifyCreateMethod: 'media.edit',
                            notifyParent: parent
                        });
                }
            );
        },

        activate: function(parent) {
            var THIS = this,
                media_html = THIS.templates.media.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(media_html);

            THIS.render_list(media_html);
        },

        popup_edit_media: function(data, callback) {
            var popup, popup_html;

            popup_html = $('<div class="inline_popup"><div class="inline_content"/></div>');

            winkstart.publish('media.edit', data, popup_html, $('.inline_content', popup_html), {
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
                        title: (data.id) ? 'Edit media' : 'Create media'
                    });
                }
            });
        },

        define_callflow_nodes: function(callflow_nodes) {
            var THIS = this;

            $.extend(callflow_nodes, {
                'play[id=*]': {
                    name: 'Play Media',
                    icon: 'play',
                    category: 'Advanced',
                    module: 'play',
                    tip: 'Play an audio file such as a greeting',
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

                        return (id) ? caption_map[id].name : '';
                    },
                    edit: function(node, callback) {
                        var _this = this;

                        winkstart.request(true, 'media.list', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html;

                                popup_html = THIS.templates.media_callflow.tmpl({
                                    items: data.data,
                                    selected: node.getMetadata('id') || ''
                                });

                                if($('#media_selector option:selected', popup_html).val() == undefined) {
                                    $('#edit_link', popup_html).hide();
                                }

                                $('.inline_action', popup_html).click(function(ev) {
                                    var _data = ($(this).dataset('action') == 'edit') ?
                                                    { id: $('#media_selector', popup_html).val() } : {};

                                    ev.preventDefault();

                                    winkstart.publish('media.popup_edit', _data, function(_data) {
                                        node.setMetadata('id', _data.data.id || 'null');

                                        node.caption = _data.data.name || '';

                                        popup.dialog('close');
                                    });
                                });

                                $('.submit_btn', popup_html).click(function() {
                                    node.setMetadata('id', $('#media_selector', popup_html).val());

                                    node.caption = $('#media_selector option:selected', popup_html).text();

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                     title: 'Media',
                                    beforeClose: function() {
                                        if(typeof callback == 'function') {
                                            callback();
                                        }
                                    }
                                });
                            }
                        );
                    }
                }
            });
        }
    }
);
