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

        resources: {
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
