winkstart.module('voip', 'prompt', {
        css: [
            'css/prompt.css'
        ],

        templates: {
            prompt: 'tmpl/prompt.html',
            create: 'tmpl/create.html',
            add_language: 'tmpl/add_language.html'
        },

        subscribe: {
            'prompt.activate': 'activate',
            'prompt.create': 'create_prompt'
        },

        validation : [
            { name: '#name', regex: /^.+$/ }
        ],

        resources: {
            'prompt.listValues': {
                url: '{api_url}/media/prompts',
                contentType: 'application/json',
                verb: 'GET'
            },
            'prompt.list': {
                url: '{api_url}/accounts/{account_id}/media/prompts',
                contentType: 'application/json',
                verb: 'GET'
            },
            'prompt.get': {
                url: '{api_url}/accounts/{account_id}/media/prompts/{prompt_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'prompt.create': {
                url: '{api_url}/accounts/{account_id}/media',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'prompt.update': {
                url: '{api_url}/accounts/{account_id}/media/{prompt_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'prompt.delete': {
                url: '{api_url}/accounts/{account_id}/media/{prompt_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            },
            'prompt.upload': {
                url: '{api_url}/accounts/{account_id}/media/{prompt_id}/raw',
                contentType: 'application/x-base64',
                verb: 'POST'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        winkstart.publish('whappnav.subnav.add', {
            whapp: 'voip',
            module: THIS.__module,
            label: _t('prompt', 'prompt_label'),
            icon: 'prompt',
            weight: '45',
            category: _t('config', 'advanced_menu_cat')
        });
    },

    {
        save_prompt: function(data, callback) {
            var THIS = this;

            winkstart.request(true, 'prompt.create', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url,
                    data: data
                },
                function(_data, status) {
                    callback && callback(_data);
                }
            );
        },

        create_prompt: function(){
            var THIS = this,
                target = $('#prompt-view'),
                data = {
                     _t: function(param) {
                            return window.translate['prompt'][param]
                    },
                    data: {},
                    field_data: {
                        prompts: THIS.get_list_prompts()
                    }
                },
                file;

            var prompt_html = THIS.templates.create.tmpl(data);

            prompt_html.find('.basic_view')
                       .append(THIS.templates.add_language.tmpl(data));

            $('#file', prompt_html).bind('change', function(evt){
                var files = evt.target.files;

                if(files.length > 0) {
                    var reader = new FileReader();

                    file = 'updating';
                    reader.onloadend = function(evt) {
                        var data = evt.target.result;

                        file = data;
                    }

                    reader.readAsDataURL(files[0]);
                }
            });

            $('.prompt-save', prompt_html).click(function(ev) {
                ev.preventDefault();

                var form_data = form2object('prompt-form'),
                    clean_data = THIS.clean_form_data(form_data);

                if(file === 'updating') {
                    winkstart.alert(_t('prompt', 'the_file_you_want_to_apply'));
                }
                else {
                    console.log(clean_data);
                    THIS.save_prompt(clean_data, function(data) {
                        THIS.upload_file(file, data.data.id, function() {
                            THIS.render_list();
                        });
                    });
                }
            });

            (target)
                .empty()
                .append(prompt_html);
        },

        delete_prompt: function(data, success, error) {
            var THIS = this;

            if(data.data.id) {
                winkstart.request(true, 'prompt.delete', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        prompt_id: data.data.id
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

        upload_file: function(data, prompt_id, success, error) {
            winkstart.request('prompt.upload', {
                    account_id: winkstart.apps.voip.account_id,
                    api_url: winkstart.apps.voip.api_url,
                    prompt_id: prompt_id,
                    data: data
                },
                function(_data, status) {
                    if(typeof success === 'function') {
                        success();
                    }
                },
                winkstart.error_message.process_error(function(_data, status) {
                    if(typeof error === 'function') {
                        error();
                    }
                })
            );
        },

        render_create_prompt: function(data, target, callbacks) {
			data._t = function(param){
				return window.translate['prompt'][param];
			};
            var THIS = this,
                prompt_html = THIS.templates.create.tmpl(data),
                file;

            $('.prompt-save', prompt_html).click(function(ev) {
                ev.preventDefault();

                var promptId = prompt_html.find('#promt_id').val();

                THIS.save_prompt(promptId, function() {
                    callbacks.save_success && callbacks.save_success();
                });
            });

            (target)
                .empty()
                .append(prompt_html);
        },

        clean_form_data: function(form_data) {
            form_data.name = form_data.extra.upload_prompt;

            delete form_data.extra;

            return form_data;
        },

        format_data: function(data) {
            if(data.data.description != undefined && data.data.description.substr(0,12) == 'C:\\fakepath\\') {
                data.data.description = data.data.description.substr(12);
            }

            return data;
        },

        normalize_data: function(form_data) {
            delete form_data.upload_prompt;

            if('field_data' in form_data) {
                delete form_data.field_data;
            }

            if(form_data.prompt_source == 'upload') {
                delete form_data.tts;
            }

            return form_data;
        },

        render_list: function(){
            var THIS = this,
                parent = $('#prompt-content');

            winkstart.request(true, 'prompt.list', {
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function(data, status) {
                    var map_crossbar_data = function(data) {
                        var new_list = [];

                        if(data.length > 0) {
                            $.each(data[0], function(key, val) {
                                new_list.push({
                                    id: key,
                                    title: key || _t('prompt', 'no_name')
                                });
                            });
                        }

                        new_list.sort(function(a, b) {
                            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                        });
                        console.log(new_list);
                        return new_list;
                    };



                    $('#prompt-listpanel', parent)
                        .empty()
                        .listpanel({
                            label: _t('prompt', 'prompt_label'),
                            identifier: 'prompt-listview',
                            new_entity_label: _t('prompt', 'add_prompt_label'),
                            data: map_crossbar_data(data.data),
                            publisher: winkstart.publish,
                            notifyMethod: 'prompt.edit',
                            notifyCreateMethod: 'prompt.create',
                            notifyParent: parent
                        });
                }
            );
        },

        activate: function(parent) {
            var THIS = this,
                prompt_html = THIS.templates.prompt.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(prompt_html);

            winkstart.request('prompt.listValues', {
                    api_url: winkstart.apps['voip'].api_url
                },
                function(data, status) {
                    THIS.mapPrompts = data.data[0];

                    THIS.render_list(prompt_html);
                }
            );
            
        },

        get_list_prompts: function() {
            return [
                'agent_enter_pin',
                'agent_logged_already_in',
                'agent_logged_in',
                'agent_logged_out',
                'agent-already_logged_in',
                'agent-enter_pin',
                'agent-invalid_choice',
                'agent-logged_in',
                'agent-logged_out',
                'agent-not_call_center_agent',
                'agent-pause',
                'agent-resume',
                'camper-deny',
                'camper-queue',
                'cf-disabled',
                'cf-disabled_menu',
                'cf-enabled_menu',
                'cf-enter_number',
                'cf-move-no_channel',
                'cf-move-no_owner',
                'cf-move-too_many_channels',
                'cf-not_available',
                'cf-now_forwarded_to',
                'cf-unauthorized_call',
                'conf-alone',
                'conf-bad_conf',
                'conf-bad_pin',
                'conf-deaf',
                'conf-enter_conf_number',
                'conf-enter_conf_pin',
                'conf-joining_conference',
                'conf-max_participants',
                'conf-muted',
                'conf-other_participants',
                'conf-single',
                'conf-there_are',
                'conf-too_many_attempts',
                'conf-undeaf',
                'conf-unmuted',
                'conf-welcome',
                'dir-confirm_menu',
                'dir-enter_person',
                'dir-enter_person_firstname',
                'dir-enter_person_lastname',
                'dir-first_name',
                'dir-found',
                'dir-invalid_key',
                'dir-last_name',
                'dir-letters_of_person_name',
                'dir-no_more_results',
                'dir-no_results_found',
                'dir-result_menu',
                'dir-result_number',
                'dir-specify_minimum',
                'disa-enter_pin',
                'disa-invalid_extension',
                'disa-invalid_pin',
                'disa-retries_exceeded',
                'dnd-activated',
                'dnd-deactivated',
                'dnd-not_available',
                'dynamic-cid-enter_cid',
                'dynamic-cid-invalid_using_default',
                'eavesdrop-no_channels',
                'fault-can_not_be_completed_as_dialed',
                'fault-can_not_be_completed_at_this_time',
                'fault-facility_trouble',
                'hotdesk-abort',
                'hotdesk-disabled',
                'hotdesk-enter_id',
                'hotdesk-enter_pin',
                'hotdesk-invalid_entry',
                'hotdesk-logged_in',
                'hotdesk-logged_out',
                'intercept-no_channels',
                'intercept-no_users',
                'ivr-group_confirm',
                'ivr-please_enter_pin_followed_by_pound',
                'menu-exit',
                'menu-invalid_entry',
                'menu-no_prompt',
                'menu-return',
                'menu-transferring_call',
                'park-already_in_use',
                'park-call_placed_in_spot',
                'park-no_caller',
                'pickup-no_channels',
                'pickup-no_users',
                'temporal-marked_disabled',
                'temporal-marked_enabled',
                'temporal-marker_reset',
                'temporal-menu',
                'vm-abort',
                'vm-deleted',
                'vm-enter_id',
                'vm-enter_new_pin',
                'vm-enter_new_pin_confirm',
                'vm-enter_pass',
                'vm-fail_auth',
                'vm-goodbye',
                'vm-greeting_intro',
                'vm-mailbox_full',
                'vm-main_menu',
                'vm-message_menu',
                'vm-message_number',
                'vm-new',
                'vm-new_and',
                'vm-new_and-old1',
                'vm-new_message',
                'vm-new_messages',
                'vm-no_access',
                'vm-no_messages',
                'vm-not_available',
                'vm-not_available_no_voicemail',
                'vm-person',
                'vm-person_not_available',
                'vm-pin_invalid',
                'vm-pin_set',
                'vm-received',
                'vm-record_greeting',
                'vm-record_message',
                'vm-record_name',
                'vm-recording_saved',
                'vm-recording_to_short',
                'vm-review_recording',
                'vm-saved',
                'vm-saved_message',
                'vm-saved_messages',
                'vm-settings_menu',
                'vm-setup_complete',
                'vm-setup_intro',
                'vm-setup_rec_greeting',
                'vm-thank_you',
                'vm-you_have',
                'vm-you_have-old1'
            ];
        }
    }
);
