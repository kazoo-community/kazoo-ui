winkstart.module('voip', 'prompt', {
		css: [
			'css/prompt.css'
		],

		templates: {
			prompt: 'tmpl/prompt.html',
			create: 'tmpl/create.html',
			edit: 'tmpl/edit.html',
			add_language: 'tmpl/add_language.html',
			dialog_add_language: 'tmpl/dialog_add_language.html'
		},

		subscribe: {
			'prompt.activate': 'activate',
			'prompt.create': 'render_create_prompt',
			'prompt.edit': 'render_edit_prompt'
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
			icon: 'earth',
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

		render_create_prompt: function(){
			var THIS = this,
				target = $('#prompt-view');

			THIS.getListAvailablePrompts(function(prompts) {
				var data = {
						 _t: function(param) {
								return window.translate['prompt'][param]
						},
						data: {},
						field_data: {
							prompts: prompts
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
						THIS.save_prompt(clean_data, function(data) {
							THIS.upload_file(file, data.data.id, function() {
								THIS.refresh_view(clean_data.prompt_id);
							});
						});
					}
				});

				(target)
					.empty()
					.append(prompt_html);
			});
		},

		render_edit_prompt: function(data) {
			var THIS = this,
				target = $('#prompt-view');

			THIS.getDataEditPrompt(data.id, function(dataPrompts) {
				var dataTemplate = {
					 _t: function(param) {
							return window.translate['prompt'][param]
					},
					data: {
						prompt_id: data.id,
						prompts: dataPrompts
					}
				};

				var prompt_html = THIS.templates.edit.tmpl(dataTemplate);

				prompt_html.find('.delete-prompt').click(function() {
					var $this = $(this),
						localPromptId = $this.data('id'),
						globalPromptId = $this.parents('#prompt-form').data('promptid');

					THIS.delete_prompt(localPromptId, function(data) {
						THIS.refresh_view(globalPromptId);
					});
				});

				prompt_html.find('#add_language').click(function(e) {
					e.preventDefault();

					THIS.display_add_language_dialog(data.id);
				});

				target.empty()
					  .append(prompt_html);
			});
		},

		display_add_language_dialog: function(globalPromptId) {
			var THIS = this,
				dataTemplate = {
					 _t: function(param) {
							return window.translate['prompt'][param]
					},
					data: {
						prompt_id: globalPromptId
					}
				},
				file,
				dialogTemplate = THIS.templates.dialog_add_language.tmpl(dataTemplate),
				addLanguageTemplate = THIS.templates.add_language.tmpl(dataTemplate);

			dialogTemplate.find('.add-language-content')
						  .append(addLanguageTemplate);

			dialogTemplate.find('#add_language').click(function(ev) {
				ev.preventDefault();

				var form_data = form2object('language-form'),
					clean_data = THIS.clean_form_data(form_data);

				clean_data.prompt_id = globalPromptId;

				if(file === 'updating') {
					winkstart.alert(_t('prompt', 'the_file_you_want_to_apply'));
				}
				else {
					THIS.save_prompt(clean_data, function(data) {
						THIS.upload_file(file, data.data.id, function() {
							dialogNewLanguage.dialog('close').remove();

							THIS.refresh_view(globalPromptId);
						});
					});
				}
			});

			dialogTemplate.find('#file').bind('change', function(evt){
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

			var dialogNewLanguage = winkstart.dialog(dialogTemplate, {
				title: _t('prompt', 'language'),
				width: '500px'
			});
		},

		refresh_view: function(promptId) {
			var THIS = this,
				canEdit = false,
				target = $('#prompt-view');

			THIS.render_list(function(data) {
				if(data.length > 0) {
					$.each(data[0], function(k, v) {
						if(promptId === k) {
							canEdit = true;
							return false;
						}
					});
				}

				if(canEdit) {
					THIS.render_edit_prompt({ id: promptId });
				}
				else {
					target.empty();
				}
			});
		},

		getDataEditPrompt: function(promptId, callback) {
			var THIS = this;

			winkstart.request('prompt.get', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url,
					prompt_id: promptId
				},
				function(_data, status) {
					var prompts = THIS.formatListPrompts(_data.data);

					callback && callback(prompts);
				}
			);
		},

		formatListPrompts: function(data) {
			var THIS = this,
				apiUrl = winkstart.apps.voip.api_url,
				authToken = winkstart.apps.voip.auth_token,
				accountId = winkstart.apps.voip.account_id,
				prompts = [];

			$.each(data, function(k,v) {
				var promptSplit = v.split('%2F'),
					prompt = {};

				prompt.language = promptSplit.length > 1 ? promptSplit[0] : '-';
				prompt.link = apiUrl + '/accounts/' + accountId + '/media/' + v + '/raw?auth_token=' + authToken;
				prompt.id = v;

				prompts.push(prompt);
			});

			return prompts;
		},

		delete_prompt: function(promptId, callback) {
			var THIS = this;

			winkstart.request(true, 'prompt.delete', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url,
					prompt_id: promptId
				},
				function(_data, status) {
					callback && callback(_data);
				}
			);
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

		clean_form_data: function(form_data) {
			form_data.description = form_data.extra.upload_prompt;
			form_data.name = form_data.language + '%2F' + form_data.prompt_id;

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

		render_list: function(callback){
			var THIS = this,
				parent = $('#prompt-content');

			winkstart.request(true, 'prompt.list', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url
				},
				function(dataRequest, status) {
					var data = dataRequest.hasOwnProperty('data') ? dataRequest.data : [],
						map_crossbar_data = function(data) {
							var new_list = [];

							if(data.length > 0) {
								$.each(data[0], function(key, val) {
									new_list.push({
										id: key,
										title: key + ' (' + val + ')'
									});
								});

								new_list.sort(function(a, b) {
									return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
								});
							}

							return new_list;
						};

					$('#prompt-listpanel', parent)
						.empty()
						.listpanel({
							label: _t('prompt', 'prompt_label'),
							identifier: 'prompt-listview',
							new_entity_label: _t('prompt', 'add_prompt_label'),
							data: map_crossbar_data(data),
							publisher: winkstart.publish,
							notifyMethod: 'prompt.edit',
							notifyCreateMethod: 'prompt.create',
							notifyParent: parent
						});

					callback && callback(data);
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
					THIS.arrayPrompts = [];

					$.each(data.data[0], function(k,v) {
						THIS.arrayPrompts.push(k);
					});

					THIS.render_list();
				}
			);
			
		},

		get_list_prompts: function(callback) {
			var THIS = this;

			return THIS.arrayPrompts;
		},

		getListAvailablePrompts: function(callback) {
			var THIS = this,
				allPrompts = THIS.get_list_prompts();

			winkstart.request('prompt.list', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url
				},
				function(data) {
					var availablePrompts = [];

					$.each(allPrompts, function(k, v) {
						if(!(data.data.length > 0 && data.data[0].hasOwnProperty(v) && data.data[0][v] > 0)) {
							availablePrompts.push(v);
						}
					});

					callback && callback(availablePrompts);
				}
			);
		}
	}
);
