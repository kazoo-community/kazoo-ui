( function(winkstart, amplify, $) {

    winkstart.config =  {
        /* Was winkstart.debug */
        debug: false,

        base_urls: {
            'u.2600hz.com': {
                /* If this was set to true, Winkstart would look for u_2600hz_com.png in config/images/logos */
                custom_logo: false
            },
            'apps.2600hz.com': {
                custom_logo: false
            }
        },

        /* Was winkstart.realm_suffix */
        realm_suffix: '.sip.2600hz.com',

        /* What applications is available for a user that just registered */
        register_apps: {
            cluster: {
               label: 'Cluster Manager',
               icon: 'cluster_manager',
               api_url: 'http://apps.2600hz.com:8000/v1'
            },
            voip: {
                label: 'Trial PBX',
                icon: 'phone',
                api_url: 'http://apps001-demo-ord.2600hz.com:8000/v1'
            }
        },

        /* Custom links */
        nav: {
            /* 'my_account':'http://www.google.com/', */
            my_help: 'http://help.2600hz.com/'
            /*'my_logout:''*/
        }
    };

    winkstart.apps = {
        'auth' : {
            api_url: 'http://apps.2600hz.com:8000/v1',
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

    document.title = "2600hz WinkStart";

})(window.winkstart = window.winkstart || {}, window.amplify = window.amplify || {}, jQuery);
