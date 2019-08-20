winkstart.module('voip', 'integration_tray',
	{
		css: [
			'css/integration_tray.css'
		],

		templates: {
			tray_container: 'tmpl/tray_container.html'
		},

		subscribe: {
			'callflow.define_callflow_nodes': 'loadCallflowNodes'
		},

		resources: {
			'tray.instances.create': {
				url: '{apiUrl}/accounts/{accountId}/tray',
				verb: 'POST'
			},
			'tray.instances.getConfig': {
				url: '{apiUrl}/accounts/{accountId}/tray/{instanceId}',
				verb: 'GET'
			},
			'tray.instances.list': {
				url: '{apiUrl}/accounts/{accountId}/tray/',
				verb: 'GET'
			},
			'tray.instances.update': {
				url: '{apiUrl}/accounts/{accountId}/tray/{instanceId}',
				verb: 'PATCH'
			},
			'tray.solutions.list': {
				url: '{apiUrl}/tray/',
				verb: 'GET'
			}
		}
	},

	function() {
		winkstart.registerResources(this.__whapp, this.config.resources);
	},

	{
		/**
		 * Makes an API request to create a solution instance with the given parameters
		 *
		 * @param {string} options.id - ID of the solution this instance is created from
		 * @param {string} options.name - Label for the new instance
		 * @param {function(popupUrl: string, instanceId: string)} [options.success] - Callback on success
		 * @param {function(response: Object, status: number)} [options.error] - Callback on error
		 */
		createInstance: function(options) {
			winkstart.request(true, 'tray.instances.create', {
				apiUrl: winkstart.apps.voip.api_url,
				accountId: winkstart.apps.voip.account_id,
				data: {
					id: options.id,
					name: options.name
				}
			},
			function(response) {
				var popupUrl = response.data.popupUrl;
				var instanceId = popupUrl
					.split('/configure/')[1]
					.split('?code')[0];

				if (typeof options.success === 'function') {
					options.success(popupUrl, instanceId);
				}
			},
			function(response, status) {
				if (typeof options.error === 'function') {
					options.error(response, status);
				}
			});
		},

		/**
		 * Retrieves the url at which the user can edit the given instance
		 *
		 * @param {string} options.id - ID of the solution instance
		 * @param {function(popupUrl: string)} [options.success] - Callback on success
		 * @param {function(response: Object, status: number)} [options.error] - Callback on error
		 */
		editInstance: function(options) {
			winkstart.request(true, 'tray.instances.getConfig', {
				apiUrl: winkstart.apps.voip.api_url,
				accountId: winkstart.apps.voip.account_id,
				instanceId: options.id
			},
			function(response) {
				var popupUrl = response.data.popupUrl;

				if (typeof options.success === 'function') {
					options.success(popupUrl);
				}
			},
			function(response, status) {
				if (typeof options.error === 'function') {
					options.error(response, status);
				}
			});
		},

		/**
		 * Gets a list from the API of all solution instances attached to this account
		 *
		 * @param {function(instances: Object[])} [options.success] - Callback on success
		 * @param {function(response: Object, status: number)} [options.error] - Callback on error
		 */
		getInstances: function(options) {
			winkstart.request(true, 'tray.instances.list', {
				apiUrl: winkstart.apps.voip.api_url,
				accountId: winkstart.apps.voip.account_id
			},
			function(response) {
				var instances = response.data.map(function(item) {
					return item.node;
				});

				if (typeof options.success === 'function') {
					options.success(instances);
				}
			},
			function(response, status) {
				if (typeof options.error === 'function') {
					options.error(response, status);
				}
			});
		},

		/**
		 * Sets enabled/disabled state of the given solution instance
		 *
		 * @param {string} options.id - ID of the solution instance
		 * @param {boolean} options.enabled - Desired state
		 * @param {function(response: Object, status: number)} [options.error] - Callback on error
		 */
		setInstanceEnabled: function(options) {
			winkstart.request(true, 'tray.instances.update', {
				apiUrl: winkstart.apps.voip.api_url,
				accountId: winkstart.apps.voip.account_id,
				instanceId: options.id,
				data: {
					enabled: options.enabled
				}
			},
			null,
			function(response, status) {
				if (typeof options.error === 'function') {
					options.error(response, status);
				}
			});
		},

		/**
		 * Fetches tray solutions from the API, filters for those applicable to callflows,
		 * and cleans up the data a bit
		 *
		 * @param {Object} callflow_nodes - KazooUI object containing all active callflow nodes
		 */
		loadCallflowNodes: function(callflow_nodes) {
			var THIS = this,

				/**
				 * Array Reducer to convert array of key-value pairs to a single object
				 * and clean up the "" that tray adds unnecessarily
				 *
				 * @param {Object} acc - Accumulator for the collected settings
				 * @param {Object} field - Key/Value pair of the form {key: x, value: y}
				 * @return {Object} - Accumulator
				 */
				reduceSettingsArrayToObject = function(acc, field) {
					acc[field.key] = field.value.replace(/^"(.+(?="$))"$/, '$1');
					return acc;
				},

				/**
				 * Array Map to simplify the structure of each solution object passed
				 *
				 * @param {Object} solution - Tray.io solution, as returned from the API
				 * @return {Object} - Parsed solution
				 */
				parseSolutionResponse = function(solution) {
					solution.node.settings = solution.node.customFields
						.reduce(reduceSettingsArrayToObject, {});
					return solution.node;
				},

				/**
				 * Array Filter to return only solutions of type `callflow` or `callflow_hidden`
				 *
				 * @param {Object} solution - Parsed Tray.io solution
				 * @return {boolean} - True when solution is meant for callflows
				 */
				filterCallflowSolutions = function(solution) {
					return solution.settings
						&& (
							solution.settings.type === 'callflow'
							|| solution.settings.type === 'callflow_hidden'
						);
				};

			winkstart.request(
				true,
				'tray.solutions.list',
				{ apiUrl: winkstart.apps.voip.api_url },
				function(response) {
					if (!response.data || !Array.isArray(response.data)) {
						return;
					}
					var solutions = response.data
						.map(parseSolutionResponse)
						.filter(filterCallflowSolutions);
					THIS.defineCallflowNodes(callflow_nodes, solutions);
				}
			);
		},

		/**
		 * Adds a callflow webhook module to `callflow_nodes` for each tray.io solution passed in `solutions`
		 *
		 * @param {Object} callflow_nodes - KazooUI object containing all active callflow nodes
		 * @param {Object[]} solutions - Array of all tray.io solutions which should be represented in the callflow
		 */
		defineCallflowNodes: function(callflow_nodes, solutions) {
			var THIS = this;
			if (!(Array.isArray(solutions) && solutions.length)) {
				return;
			}

			var nodes = solutions.map(function(solution) {
				if (!solution.settings) {
					return [];
				}

				var node = {},
					key = 'webhook[variable=' + solution.settings.moduleId + ']';

				node[key] = {
					name: solution.settings.name,
					icon: solution.settings.icon,
					category: _t('config', 'integrations_cat'),
					module: 'webhook',
					tip: solution.settings.tip,
					data: {
						// The first three props configure the webhook
						http_verb: 'post',
						retries: '3',
						uri: null,
						variable: solution.settings.moduleId,
						solutionId: solution.id,
						instanceId: null,
						name: solution.settings.name, // Needed here to be sent to tray later
						popupTitle: solution.settings.popupTitle
					},
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
						if (node.getMetadata('instanceId')) {
							THIS.editInstance({
								id: node.getMetadata('instanceId'),
								success: function(url) {
									THIS.loadPopup(node, url, callback);
								},
								error: THIS.alertApiError
							});
						} else {
							THIS.createInstance({
								id: node.getMetadata('solutionId'),
								name: node.getMetadata('name'),
								success: function(url, instanceId) {
									node.setMetadata('instanceId', instanceId);
									THIS.setWebhookUri(node);
									THIS.loadPopup(node, url, callback);
								},
								error: THIS.alertApiError
							});
						}
					}
				};

				// Hides the module from the Actions toolbar (so it can't be added)
				if (solution.settings.type === 'callflow_hidden') {
					delete node[key].category;
				}

				return node;
			});

			nodes.forEach(function(node) {
				$.extend(callflow_nodes, node);
			});
		},

		/**
		 * Sets the node/webhook's uri. The API call here is unfortunately necessary, as that's
		 * the only way to get this value from tray.io
		 *
		 * @param {Object} node - Callflow node associated with this instance & webhook
		 */
		setWebhookUri: function(node) {
			var instanceId = node.getMetadata('instanceId');
			this.getInstances({
				success: function(instances) {
					var thisInstance = instances.find(function(instance) {
						return instance.id === instanceId;
					});
					try {
						node.setMetadata('uri', thisInstance.workflows.edges[0].node.triggerUrl);
					} catch (e) {
						winkstart.alert('error', {
							'text': _t('integration_tray', 'uriError'),
							data: e
						});
					}
				},
				error: this.alertApiError
			});
		},

		/**
		 * Sets up and loads a popup where the user can configure the integration
		 *
		 * @param {Object} node - Callflow node that this popup belongs to
		 * @param {string} url - Url for the iframe in the popup
		 * @param {function} [onClose] - Called when the popup is closed
		 */
		loadPopup: function(node, url, onClose) {
			var popup,
				popup_html = this.templates.tray_container.tmpl({
					_t: function(param) {
						return window.translate.integration_tray[param];
					},
					url: url
				});

			popup = winkstart.dialog(popup_html, {
				title: node.getMetadata('popupTitle'),
				minHeight: '0',
				beforeClose: function() {
					if (typeof onClose === 'function') {
						onClose();
					}
				}
			});

			window.addEventListener('message', this.onTrayMessage(popup, node).bind(this), popup);
		},

		/**
		 * Builds a handler for any messages emitted by tray.io via the iframe
		 *
		 * @param {Object} popup - Popup that this message came from
		 *
		 * @return {function(e: Event)} - An event handler for tray.io messages
		 */
		onTrayMessage: function(popup) {
			return function(e) {
				if (!(e && e.data && e.data.data)) {
					return;
				}
				var instanceId = e.data.data.solutionInstanceId,
					instanceType = e.data.type;

				switch (instanceType) {
					// Close the popup window if user cancels the editing process
					case 'tray.configPopup.cancel':
						popup.dialog('close');
						break;

					// Ensure the instance is enabled if the user saves
					case 'tray.configPopup.finish':
						this.setInstanceEnabled({
							id: instanceId,
							enabled: true,
							error: this.alertApiError
						});
						popup.dialog('close');
						break;
				}
			};
		},

		/**
		 * Opens a winkstart alert for an API response (error)
		 *
		 * @param {Object} response - API response with error message
		 */
		alertApiError: function(response) {
			winkstart.alert('error', _t('integration_tray', 'api_error') + response.message);
		}
	}
);
