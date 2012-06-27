winkstart.module('portal', 'portal_manager', {
        css: [
            'css/portal_manager.css'
        ],

        templates: {
            portal_manager: 'tmpl/portal_manager.html',
        },

        subscribe: {
            'portal_manager.activate' : 'activate'
        },

        validation: {
            { name : '#vm-to-email-txt', regex: /^(([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+)?$/ },
            { name : '#ring-number-txt', regex: /^[\+]?[0-9\s\-\.\(\)]{7,20}$|(sip[s]?:[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+)$|^$/ }
        },

        resources: {
            'settings.get': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'settings.post': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'POST'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);
    },

    {
        activate: function(parent) {
            var THIS = this,
                portal_manager_html = THIS.templates.portal_manager.tmpl();

            (parent || $('#ws-content'))
                .empty()
                .append(portal_manager_html);
        }
    }
);
