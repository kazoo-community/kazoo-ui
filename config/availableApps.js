
(function(winkstart) {
	winkstart.config.available_apps = {
		'voip': {
			id: 'voip',
			label: _t('config', 'voip_label'),
			icon: 'device',
			desc: _t('config', 'voip_desc')
		},
		'cluster': {
			id: 'cluster',
			label: _t('config', 'cluster_label'),
			icon: 'cluster_manager',
			desc: _t('config', 'cluster_desc')
		},
		'userportal': {
			id: 'userportal',
			label: _t('config', 'userportal_label'),
			icon: 'user',
			desc: _t('config', 'userportal_desc')
		},
		'accounts': {
			id: 'accounts',
			label: _t('config', 'accounts_label'),
			icon: 'account',
			desc: _t('config', 'accounts_desc')
		},
		'developer': {
			id: 'developer',
			label: _t('config', 'developer_label'),
			icon: 'connectivity',
			desc: _t('config', 'developer_desc')
		},
		'pbxs': {
			id: 'pbxs',
			label:  _t('config', 'pbxs_label'),
			icon: 'device',
			desc: _t('config', 'pbxs_desc')
		},
		'numbers': {
			id: 'numbers',
			label:  _t('config', 'numbers_label'),
			icon: 'menu1',
			desc: _t('config', 'numbers_desc')
		},
		'browserphone': {
			id: 'browserphone',
			label: _t('config', 'browserphone_label'),
			icon: 'menu1',
			desc: _t('config', 'browserphone_desc')
		},
		'call_center': {
			id: 'call_center',
			label: 'Call Center',
			icon: 'menu1',
			desc: 'Manage your Call Center'
		}
	};
})(window.winkstart);
