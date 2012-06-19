winkstart.module('myaccount', 'nav', {
        css: [
            'css/style.css'
        ],

        templates: {
            myaccount_navbar: 'tmpl/myaccount_navbar.html'
        },

        subscribe: {
            'nav.add_sublink': 'add_sublink',
            'nav.activate': 'activate',
            'nav.masquerade': 'masquerade',
            'nav.company_name': 'company_name'
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

            $('#help_link', container).attr('href', winkstart.config.nav.help || 'http://www.2600hz.org/support.html');

            $('.masquerade', container).click(function() {
                winkstart.publish('nav.company_name_click');
            });

            winkstart.publish('linknav.add', {
                name: 'nav',
                weight: 10,
                content: container,
                modifier: function(link_html) {
                    $('> a', link_html).css('padding', 0);
                    $('> .dropdown-menu', link_html).css('width', '100%');
                }
            });

            winkstart.publish('myaccount.nav.post_loaded');

            winkstart.publish('nav.add_sublink', {
                link: 'nav',
                sublink: 'logout',
                label: 'Sign out',
                weight: '25',
                publish: 'auth.activate'
            });
        },

        add_sublink: function(args, callback) {
            var THIS = this;

            winkstart.publish('linknav.sub_add', args);

            /*
            winkstart.publish('linknav.get', {
                    link: args.link
                },
                function(link_html) {
                    THIS.update_size(link_html);
                }
            );
            */
        },

        update_size: function(link_html) {
            var width = $('> .dropdown-toggle', link_html).width();
            $('> .dropdown-menu', link_html).width(width);
        },

        company_name: function(callback) {
            var THIS = this;

            winkstart.publish('linknav.get', {
                    link: 'nav'
                },
                function(link_html) {
                    var name = $('#myaccount_info .masquerade', link_html).text(name);
                    if(typeof callback === 'function') {
                        ret = callback(name);

                        if(ret != undefined) {
                            $('#myaccount_info .masquerade', link_html).text(ret);
                        }
                    }
                }
            );
        }
    }
);
