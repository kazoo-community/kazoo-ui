( function(winkstart, amplify, $) {

    winkstart.config =  {
        //was winkstart.debug
        debug: false,

        //was winkstart.realm_suffix
        realm_suffix: '.sip.2600hz.com',

        //What applications is available for a user that just registered
        register_apps: {
            'cluster': {
               'label': 'Cluster Manager',
               'icon': 'cluster_manager',
               'api_url': 'http://apps.2600hz.com:8000/v1'
            },
            'voip': {
                'label': 'Trial PBX',
                'icon': 'phone',
                'api_url': 'http://apps001-demo-ord.2600hz.com:8000/v1'
            }
        },

        //Custom links
        nav: {
            //'my_account':'http://www.google.com/',
            'my_help': 'http://help.2600hz.com/'
            /*'my_logout':''*/
        }
    };

    winkstart.apps = {
        'auth' : {   // This is our global/failback auth mechanism
            'api_url': 'http://apps.2600hz.com:8000/v1',
            'label': 'Login',
            'icon': 'user',
            'realm': null,
            'account_id': null,
            'auth_token': null,
            'user_id': null
        }
    };

    amplify.cache = false;
    
    document.title = "2600hz WinkStart";

})(window.winkstart = window.winkstart || {}, window.amplify = window.amplify || {}, jQuery);
