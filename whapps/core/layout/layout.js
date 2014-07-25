winkstart.module('core', 'layout', {
        css: [
            '../../../config/css/welcome.css',
            'css/layout.css',
            'css/icons.css',
            'css/popups.css',
            'css/trunkstore_popups.css',
            'css/jquery.override.css',
            'css/popover.css',
            'css/whapp.css'
        ],

        templates: {
            layout: 'tmpl/layout.html',
            layout_welcome: 'tmpl/layout_welcome.html',
            left_welcome: '../../../config/tmpl/left_welcome.html',
            not_supported_browsers: 'tmpl/not_supported_browsers.html'
        },

        subscribe: {
            'layout.detect_logo': 'detect_and_set_logo',
            'layout.render_welcome': 'render_welcome'
        },

        resources: {
            'layout.get_logo': {
                url: '{api_url}/whitelabel/{domain}/logo',
                contentType: 'application/json',
                dataType: 'text',
                verb: 'GET'
            },
            'layout.get_icon': {
                url: '{api_url}/whitelabel/{domain}/icon',
                contentType: 'application/json',
                dataType: 'text',
                verb: 'GET'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources('auth', THIS.config.resources);

        THIS.parent = args.parent || $('body');

        document.title = winkstart.config.company_name || '' + ' WinkStart';

        THIS.attach();

        if(!$.cookie('c_winkstart_auth')) {
            //IF NOT EXTERNAL LOGIN
            if(!('c' in URL_DATA && 'a' in URL_DATA && 'f' in URL_DATA)) {
                THIS.render_welcome();
            }
        }

        /*$('#ws-content .welcomediv').click(function() {
            winkstart.publish('nav.get_started');
        });*/

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
            var THIS = this,
                timeout,
                domain = URL.match(/^(?:https?:\/\/)*([^\/?#]+).*$/)[1],
                layout_html = THIS.templates.layout.tmpl({
					_t: function(param){
						return window.translate['layout'][param];
					}
				}).appendTo(THIS.parent),
                api_url = winkstart.config.whitelabel_api_url || winkstart.apps['auth'].api_url;

            if(winkstart.config.hide_powered) {
                $('#powered', layout_html).remove();
            }

            $('#loading').ajaxStart(function(){
                $('#loading .close-button').hide();
                $(this).show();
                timeout = setTimeout(function() {
                    if($('#loading').is(':visible')) {
                        $('#loading .close-button').show();
                    }
                }, 10000);
            }).ajaxStop(function(){
                $(this).hide();
                clearTimeout(timeout);
            }).ajaxError(function(){
                if($.active === 0) {
                    $(this).hide();
                    clearTimeout(timeout);
                }
            });

            $('#loading .close-button').click(function() {
                $('#loading').hide();
                clearTimeout(timeout);

                if($.active > 0) { $.active--; }
            });

            winkstart.get_version(function(version) {
                $('.footer_wrapper .tag_version').html('('+version+')');

                winkstart.config.version = version
            });

            $('#ws-topbar .brand.logo', layout_html).click(function() {
            	if ($.cookie('c_winkstart_auth')){
            		$('.whapps .whapp > a').removeClass('activate');
            		winkstart.publish('auth.landing');
            	}
            });

            winkstart.request('layout.get_logo', {
                    api_url: api_url,
                    domain: domain
                },
                function(_data, status) {
                    $('#ws-topbar .brand.logo', layout_html).css('background-image', 'url(' + api_url + '/whitelabel/' + domain + '/logo?_='+new Date().getTime()+')');
                },
                function(_data, status) {
                    if(status != 404) {
                        $('#ws-topbar .brand.logo', layout_html).css('background-image', '');
                    }
                    else {
                        $('#ws-topbar .brand.logo', layout_html).css('background-image', 'url(config/images/logo.png)');
                    }
                }
            );
            winkstart.request('layout.get_icon', {
                    api_url: api_url,
                    domain: domain
                },
                function(_data, status) {
                    var src = api_url + '/whitelabel/' + domain + '/icon?_='+new Date().getTime();

                    winkstart.changeFavIcon(src);
                },
                function(_data, status) {
                    var src = winkstart.config.favicon || 'img/wsLogo.png';
                    
                    winkstart.changeFavIcon(src);
                }
            );
        },

        render_welcome: function(args) {
            var THIS = this;
            /*if(navigator.appName == 'Microsoft Internet Explorer') {
                THIS.templates.not_supported_browsers.tmpl().appendTo($('#ws-content'));
            }
            else {*/
                layout_welcome_html = THIS.templates.layout_welcome.tmpl().appendTo($('#ws-content'));
                var data_welcome = {
                    company_name: winkstart.config.company_name,
                    company_website: winkstart.config.company_website,
                    learn_more: winkstart.config.nav.learn_more || "http://www.2600hz.com/",
					_t: function(param){
						return window.translate['layout'][param];
					}
                };

                THIS.templates.left_welcome.tmpl(data_welcome).appendTo($('.welcome-page-top .left_div', layout_welcome_html));

                args && args.callback && args.callback();
            //}
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
