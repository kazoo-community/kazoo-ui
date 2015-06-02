//window.translate = [];
( function(winkstart, amplify, $) {

    winkstart.config =  {
        /* Was winkstart.debug */
        debug: false,

        ws_server: 'wss://sbc01.van1.voxter.net:8443',

        advancedView: false,

        /* Registration Type */
        register_type: 'onboard',

	logout_timer: '360',

	/* Provisioner Info */
	provisioner_url: "https://p.voxter.com",

        /* Do you want the signup button or not ? default to false if not set */
        hide_registration: false,

        onboard_roles: {
            'default': {
                apps: {
                    voip: {
                        label: 'Hosted PBX',
                        icon: 'phone',
                        api_url: 'http://10.2.42.73:8000/v1'
                    },
                    pbxs: {
                        label: 'SIP Trunking',
                        icon: 'device',
                        api_url: 'http://10.2.42.73:8000/v1'
                    },
                    numbers: {
                        label: 'Phone Numbers',
                        icon: 'menu1',
                        api_url: 'http://10.2.42.73:8000/v1'
                    }
                },
                available_apps: ['voip', 'cluster', 'userportal', 'accounts', 'developer', 'numbers', 'pbxs', 'browserphone'],
                default_api_url: 'http://10.2.42.73:8000/v1'
            },
            'reseller': {
                apps: {
                    voip: {
                        label: 'Hosted PBX',
                        icon: 'phone',
                        api_url: 'http://10.2.42.73:8000/v1'
                    },
                    accounts: {
                        label: 'Sub-Accounts',
                        icon: 'account',
                        api_url: 'http://10.2.42.73:8000/v1'
                    },
                    numbers: {
                        label: 'Phone Numbers',
                        icon: 'menu1',
                        api_url: 'http://10.2.42.73:8000/v1'
                    }
                },
                available_apps: ['voip', 'cluster', 'userportal', 'accounts', 'developer', 'numbers', 'pbxs'],
                default_api_url: 'http://10.2.42.73:8000/v1'
            },
            'small_office': {
                apps: {
                    voip: {
                        label: 'Hosted PBX',
                        icon: 'phone',
                        api_url: 'http://10.2.42.73:8000/v1'
                    },
                    numbers: {
                        label: 'Phone Numbers',
                        icon: 'menu1',
                        api_url: 'http://10.2.42.73:8000/v1'
                    }
                },
                available_apps: ['voip', 'cluster', 'userportal', 'accounts', 'developer', 'numbers', 'pbxs'],
                default_api_url: 'http://10.2.42.73:8000/v1'
            },
            'single_phone': {
                apps: {
                    voip: {
                        label: 'Hosted PBX',
                        icon: 'phone',
                        api_url: 'http://10.2.42.73:8000/v1'
                    },
                    numbers: {
                        label: 'Phone Numbers',
                        icon: 'menu1',
                        api_url: 'http://10.2.42.73:8000/v1'
                    }
                },
                available_apps: ['voip', 'cluster', 'userportal', 'accounts', 'developer', 'numbers', 'pbxs'],
                default_api_url: 'http://10.2.42.73:8000/v1'
            },
            'api_developer': {
                apps: {
                    developer: {
                        label: 'Developer Tool',
                        icon: 'connectivity',
                        api_url: 'http://10.2.42.73:8000/v1'
                    },
                    numbers: {
                        label: 'Phone Numbers',
                        icon: 'menu1',
                        api_url: 'http://10.2.42.73:8000/v1'
                    }
                },
                available_apps: ['voip', 'cluster', 'userportal', 'accounts', 'developer', 'numbers', 'pbxs'],
                default_api_url: 'http://10.2.42.73:8000/v1'
            },
            'voip_minutes': {
                apps: {
                    pbxs: {
                        label: 'SIP Trunking',
                        icon: 'device',
                        api_url: 'http://10.2.42.73:8000/v1'
                    },
                    numbers: {
                        label: 'Phone Numbers',
                        icon: 'menu1',
                        api_url: 'http://10.2.42.73:8000/v1'
                    }
                },
                available_apps: ['voip', 'cluster', 'userportal', 'accounts', 'developer', 'numbers', 'pbxs'],
                default_api_url: 'http://10.2.42.73:8000/v1'
            }
        },

        device_threshold: [5, 20, 50, 100],

        /* web server used by the cdr module to show the link to the logs */
        logs_web_server_url: 'http://cdrs.voxter.com/',

        /* Customized name displayed in the application (login page, resource module..) */
        company_name: 'Voxter',

        base_urls: {
            'u.voxter.com': {
                /* If this was set to true, Winkstart would look for u_voxter.com.png in config/images/logos */
                custom_logo: false
            },
            'apps.voxter.com': {
                custom_logo: false
            }
        },

        /* Was winkstart.realm_suffix */
        realm_suffix: {
            login: '.sip.voxter.com',
            register: '.trial.voxter.com'
        },

        /* What applications is available for a user that just registered */
        register_apps: {
            cluster: {
               label: 'Cluster Manager',
               icon: 'cluster_manager',
               api_url: 'http://10.2.42.73:8000/v1'
            },
            voip: {
                label: 'Trial PBX',
                icon: 'phone',
                api_url: 'http://10.2.42.73:8000/v1'
            },
            accounts: {
                label: 'Sub-Accounts',
                icon: 'account',
                api_url: 'http://10.2.42.73:8000/v1'
            }
        },

        /* Custom links */
        nav: {
            help: 'http://wiki.voxter.com',
            learn_more: 'http://www.voxter.com/'
        },

        default_api_url: 'http://10.2.42.73:8000/v1',

        available_apps: {
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
        }
    };

    winkstart.apps = {
        'auth' : {
            api_url: 'http://10.2.42.73:8000/v1',
            /* These are some settings that are set automatically. You are free to override them here.
            account_id: null,
            auth_token: null,
            user_id: null,
            realm: null
            */
        },
        'myaccount': {}
    };

    amplify.cache = false;

})(window.winkstart = window.winkstart || {}, window.amplify = window.amplify || {}, window.language, jQuery);
