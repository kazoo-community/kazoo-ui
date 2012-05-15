winkstart.module('core', 'layout', {
        css: [
            '../../../config/css/welcome.css',
            'css/layout.css',
            'css/icons.css',
            'css/popups.css',
            'css/jquery.override.css'
        ],

        templates: {
            layout: 'tmpl/layout.html',
            layout_welcome: 'tmpl/layout_welcome.html',
            left_welcome: '../../../config/tmpl/left_welcome.html',
            not_supported_browsers: 'tmpl/not_supported_browsers.html'
        },

        subscribe: {
            'layout.detect_logo': 'detect_and_set_logo'
        }
    },

    function(args) {
        var THIS = this;

        THIS.parent = args.parent || $('body');

        THIS.attach();

        if(!$.cookie('c_winkstart_auth')) {
            THIS.render_welcome();
        }

        $('#ws-content .welcomediv').click(function() {
            winkstart.publish('nav.my_logout_click');
        });

        $('#ws-topbar .links .help').click(function() {
            winkstart.publish('nav.my_help_click');
        });

        $('#ws-topbar .links .logout').click(function() {
            winkstart.publish('nav.my_logout_click');
        });

        if('nav' in winkstart.config) {
            if('help' in winkstart.config.nav || 'my_help' in winkstart.config.nav) {
                $('#ws-topbar .links .help').unbind('click')
                                            .attr('href', winkstart.config.nav.help || winkstart.config.nav.my_help);
            }

            if('logout' in winkstart.config.nav || 'my_logout' in winkstart.config.nav) {
                $('#ws-topbar .links .logout').unbind('click')
                                              .attr('href', winkstart.config.nav.logout || winkstart.config.nav.my_logout);
            }

        }

        THIS.detect_and_set_logo();

        winkstart.log ('Layout: Initialized layout.');
    },
    {
        attach: function() {
            var THIS = this;

            var layout_html = THIS.templates.layout.tmpl().appendTo(THIS.parent);

            $("#loading").ajaxStart(function(){
                $(this).show();
             }).ajaxStop(function(){
                $(this).hide();
             }).ajaxError(function(){
                $(this).hide();
             });
        },

        render_welcome: function() {
            var THIS = this;
            if(navigator.appName == 'Microsoft Internet Explorer') {
                THIS.templates.not_supported_browsers.tmpl().appendTo($('#ws-content'));
            }
            else {
                layout_welcome_html = THIS.templates.layout_welcome.tmpl().appendTo($('#ws-content'));
                var data_welcome = { company_name: winkstart.config.company_name, company_website: winkstart.config.company_website };
                THIS.templates.left_welcome.tmpl(data_welcome).appendTo($('.left_div', layout_welcome_html));
            }
        },

        detect_and_set_logo: function() {
            var host = URL.match(/^(?:https?:\/\/)*([^\/?#]+).*$/)[1],
                host_parts = host.split('.'),
                partial_host = host_parts.slice(1).join('.'),
                logo_html = $('.header > .logo > .img'),
                img_prefix = 'config/images/logos/',
                img;

            if(typeof winkstart.config.base_urls == 'object') {
                if(host in winkstart.config.base_urls && winkstart.config.base_urls[host].custom_logo) {
                    img = host_parts.join('_') + '.png';

                    logo_html.css('background-image', 'url(' + img_prefix + img + ')');

                    return true;
                }
                else if(partial_host in winkstart.config.base_urls && winkstart.config.base_urls[partial_host].custom_logo) {
                    img = host_parts.slice(1).join('_') + '.png';

                    logo_html.css('background-image', 'url(' + img_prefix + img + ')');

                    return true;
                }
            }

            /* Unfortunately we have to use the old path for the default logo (to not break other installs) */
            logo_html.css('background-image', 'url(config/images/logo.png)');
        }
    }
);
