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
			},
			'prompt.listGlobal': {
				url: '{api_url}/media/prompts',
				contentType: 'application/json',
				verb: 'GET'
			},
			'prompt.getGlobal': {
				url: '{api_url}/media/prompts/{prompt_id}',
				contentType: 'application/json',
				verb: 'GET'
			},
			'prompt.createGlobal': {
				url: '{api_url}/media',
				contentType: 'application/json',
				verb: 'PUT'
			},
			'prompt.uploadGlobal': {
				url: '{api_url}/media/{prompt_id}/raw',
				contentType: 'application/x-base64',
				verb: 'POST'
			},
			'prompt.deleteGlobal': {
				url: '{api_url}/media/{prompt_id}',
				contentType: 'application/json',
				verb: 'DELETE'
			},
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
		adminMode: false,

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

		refresh_view: function(promptId, callback) {
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

				callback && callback();
			});
		},

		getDataEditPrompt: function(promptId, callback) {
			var THIS = this;

			THIS.get_prompt(promptId, function(_data) {
				var prompts = THIS.formatListPrompts(_data.data);

				callback && callback(prompts);
			});
		},

		formatListPrompts: function(data) {
			var THIS = this,
				apiUrl = winkstart.apps.voip.api_url,
				authToken = winkstart.apps.voip.auth_token,
				accountId = winkstart.apps.voip.account_id,
				prompts = [];

			$.each(data, function(k,v) {
				var name = v.id,
					promptSplit = name.split('%2F'),
					prompt = {};

				prompt.language = promptSplit.length > 1 ? promptSplit[0] : '-';

				if(THIS.adminMode) {
					prompt.link = apiUrl + '/accounts/media/' + name + '/raw?auth_token=' + authToken;
				}
				else {
					prompt.link = apiUrl + '/accounts/' + accountId + '/media/' + name + '/raw?auth_token=' + authToken;
				}

				prompt.id = name;

				prompts.push(prompt);
			});

			return prompts;
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
				parent = $('#prompt-content'),
				globalCallback = function(dataRequest, paramCallback) {
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

					paramCallback && paramCallback(data);
				};

			if(THIS.adminMode) {
				THIS.getGlobalPrompts(function(dataRequest) {
					globalCallback && globalCallback(dataRequest, callback)
				});
				
			}
			else {
				THIS.getAccountPrompts(function(dataRequest) {
					globalCallback && globalCallback(dataRequest, callback)
				});
			}
		},

		activate: function(parent) {
			var THIS = this,
				dataTemplate = {
					isAdmin: winkstart.apps.auth.superduper_admin,
					_t: function(param) {
						return window.translate['prompt'][param]
					}
				},
				prompt_html = THIS.templates.prompt.tmpl(dataTemplate);

			if(THIS.adminMode) {
				prompt_html.find('.admin-mode-off').hide();
			}
			else {
				prompt_html.find('.admin-mode-on').hide();
			}

			prompt_html.find('#enable_admin_mode').click(function() {
				THIS.adminMode = true;

				THIS.refresh_view(undefined, function() {
					prompt_html.find('.admin-mode-off').hide();
					prompt_html.find('.admin-mode-on').show();
				});
			});

			prompt_html.find('#disable_admin_mode').click(function() {
				THIS.adminMode = false;

				THIS.refresh_view(undefined, function() {
					prompt_html.find('.admin-mode-off').show();
					prompt_html.find('.admin-mode-on').hide();
				});
			});

			(parent || $('#ws-content'))
				.empty()
				.append(prompt_html);


			// Initialize global list of prompts available
			THIS.getGlobalPrompts(function(data) {
				THIS.arrayPrompts = [];

				$.each(data.data[0], function(k,v) {
					THIS.arrayPrompts.push(k);
				});

				THIS.render_list();
			});
		},

		get_list_prompts: function(callback) {
			var THIS = this;

			return THIS.arrayPrompts;
		},

		getListAvailablePrompts: function(callback) {
			var THIS = this,
				allPrompts = THIS.get_list_prompts();

			THIS.list_prompts(function(data) {
					var availablePrompts = [];

					$.each(allPrompts, function(k, v) {
						if(!(data.data.length > 0 && data.data[0].hasOwnProperty(v) && data.data[0][v] > 0)) {
							availablePrompts.push(v);
						}
					});

					callback && callback(availablePrompts);
				}
			);
		},

		getGlobalPrompts: function(callback) {
			var THIS = this;

			winkstart.request('prompt.listGlobal', {
					api_url: winkstart.apps['voip'].api_url
				},
				function(data, status) {
					callback && callback(data);
				}
			);
		},

		getAccountPrompts: function(callback) {
			var THIS = this;

			winkstart.request('prompt.list', {
					account_id: winkstart.apps['voip'].account_id,
					api_url: winkstart.apps['voip'].api_url
				},
				function(data) {
					callback && callback(data);
				}
			);
		},

		list_prompts: function(callback) {
			var THIS = this;

			if(!THIS.adminMode) {
				THIS.getAccountPrompts(function(data) {
					callback && callback(data);
				});
			}
			else {
				THIS.getGlobalPrompts(function(data) {
					callback && callback(data);
				});
			}
		},

		get_prompt: function(promptId, callback) {
			var THIS = this,
				requestString = 'prompt.getGlobal',
				paramsRequest = {
					api_url: winkstart.apps['voip'].api_url,
					prompt_id: promptId
				};

			if(!THIS.adminMode) {
				requestString = 'prompt.get';
				paramsRequest.account_id = winkstart.apps['voip'].account_id;
			}

			winkstart.request(requestString, paramsRequest,	function(_data, status) {
				callback && callback(_data);
			});
		},

		save_prompt: function(data, callback) {
			var THIS = this,
				requestString = 'prompt.createGlobal',
				paramsRequest = {
					api_url: winkstart.apps['voip'].api_url,
					data: data
				};

			if(!THIS.adminMode) {
				requestString = 'prompt.create';
				paramsRequest.account_id = winkstart.apps['voip'].account_id;
			}

			winkstart.request(requestString, paramsRequest,	function(_data, status) {
				callback && callback(_data);
			});
		},

		upload_file: function(data, promptId, callback) {
			var THIS = this,
				requestString = 'prompt.uploadGlobal',
				paramsRequest = {
					api_url: winkstart.apps['voip'].api_url,
					prompt_id: promptId,
					data: data
				};

			if(!THIS.adminMode) {
				requestString = 'prompt.upload';
				paramsRequest.account_id = winkstart.apps['voip'].account_id;
			}

			winkstart.request(requestString, paramsRequest, function(_data, status) {
				callback && callback();
			});
		},

		delete_prompt: function(promptId, callback) {
			var THIS = this,
				requestString = 'prompt.deleteGlobal',
				paramsRequest = {
					api_url: winkstart.apps['voip'].api_url,
					prompt_id: promptId
				};

			if(!THIS.adminMode) {
				requestString = 'prompt.delete';
				paramsRequest.account_id = winkstart.apps['voip'].account_id;
			}

			winkstart.request(requestString, paramsRequest, function(_data, status) {
				callback && callback(_data);
			});
		}
	}
);
