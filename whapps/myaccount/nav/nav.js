winkstart.module('myaccount', 'nav', {
        css: [
            'css/style.css'
        ],

        templates: {
            myaccount_navbar: 'tmpl/myaccount_navbar.html'
        },

        subscribe: {
            'nav.activate': 'activate',
            'nav.add_sublink': 'add_sublink',
            'myaccount.initialized': 'activate',
            'nav.masquerade': 'masquerade'
        }
    },

    function() {
        var THIS = this;
    },
    {
        activate: function(user_data) {
            var THIS = this;
            
            (user_data.first_name) ? user_name = user_data.first_name + ' ' + user_data.last_name : user_name = user_data;

            var container = THIS.templates.myaccount_navbar.tmpl({
                user_name: user_name,
                company_name: winkstart.config.company_name 
            });

            $('ul.secondary-nav').empty();

            winkstart.publish('linknav.add', {
                name: 'nav',
                weight: 10,
                content: container,
                modifier: function(link_html) {
                    $('> a', link_html).css('padding', 0);
                }
            });

            winkstart.publish('myaccount.nav.post_loaded');

            winkstart.publish('nav.add_sublink', {
                link: 'nav',
                sublink: 'logout',
                label: 'Sign out',
                weight: '20',
                publish: 'auth.activate'
            });
        },

        add_sublink: function(args, callback) {
            var THIS = this;

            winkstart.publish('linknav.sub_add', args);

            winkstart.publish('linknav.get', {
                    link: args.link
                },
                function(link_html) {
                    THIS.update_size(link_html);
                }
            );
        },

        update_size: function(link_html) {
            var width = $('> .dropdown-toggle', link_html).width();
            $('> .dropdown-menu', link_html).width(width);
        }
    } 
);
