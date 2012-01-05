winkstart.module('core', 'appnav', {
    /* Config */
        css: {
            appnav: 'css/appnav.css'
        },

        templates: {
            appnav:  'tmpl/appnav.html',
            item:    'tmpl/item.html',
            subitem: 'tmpl/subitem.html',
            module_category: 'tmpl/module_category.html'
        },

        subscribe: {
            'appnav.add'        : 'add',
            'appnav.activate'   : 'activate',
            'appnav.remove'     : 'remove',
            'subnav.add'        : 'sub_add',
            'subnav.show'       : 'show_menu',
            'subnav.hide'       : 'hide_menu'
        }

    },

    /* Init */
    function() {
        var THIS = this;

        THIS.templates.appnav.tmpl({}).appendTo( $('div.header .main_nav') );

        // Set up the Module Click handlers
        $('div.header .main_nav').delegate('li', 'click', function() {
            winkstart.publish('appnav.activate', $(this).attr('whapp-name'));
            return false;
        });

        winkstart.log('AppNav: Initialized application nav bar.');
    },

        /* Methods */
    {
        add: function(args) {
            var THIS = this,
                list_node = $('div.header .main_nav').find('ul'),
                item = THIS.templates.item.tmpl({
                    name: args.name,
                    whapp: winkstart.apps[args.name]
                }).appendTo(list_node),
                columns = args.columns || 1;

            $('.dropdown', item)
                .hide()
                .width((item.innerWidth()  * columns) - 1);

            $(item).hoverIntent({
                sensitivity: 1,
                interval: 40,
                timeout: 300,
                over: function() {
                    winkstart.publish('subnav.show', args.name);
                },
                out: function() {
                    winkstart.publish('subnav.hide', args.name);
                }
            });

            $(item).click( function() {
                $('div.header .main_nav .whapp a').removeClass('selected');
                $('.whapp a', $(this)).addClass('selected');
            });

            $('.dropdown .content', item).delegate('.module', 'click', function() {
                $('div.header .main_nav .whapp a').removeClass('selected');
                $('.whapp a', $(this).parents('li')).addClass('selected');
                winkstart.publish(args.name + '.module_activate', { name: $(this).attr('module-name') });

                return false;
            });
        },

        show_menu: function(whapp_name) {
            var whapp = $('li[whapp-name=' + whapp_name + ']', '.main_nav > ul');

            if(whapp.attr('menu') != 'false') {
                $('.dropdown', whapp).slideDown(100);
            }
        },

        hide_menu: function(whapp_name) {
            var whapp = $('li[whapp-name=' + whapp_name + ']', '.main_nav > ul');

            if(whapp.attr('menu') != 'false') {
                $('.dropdown', whapp).slideUp(100);
            }
        },

        activate: function(app_name) {
            var THIS = this;
            // TODO: De-activate current app & unload it

            THIS._activate(app_name);
        },

        _activate: function(app_name) {
            winkstart.publish ( app_name + '.activate', { });
        },

        remove: function() {
            // TODO: Implement me
        },

        sub_add: function(data) {
            var THIS = this,
                whapp = $('.main_nav li[whapp-name="' + data.whapp + '"]'),
                content = $('.dropdown .content', whapp),
                category = $('.module_category[name="' + (data.category || 'default') + '"]', content);

            whapp.attr('menu', 'true');

            /* Check to see if category exists */
            if(category.size() == 0) {
                category = THIS.templates.module_category.tmpl({ name: data.category }).appendTo(content);
            }

            THIS.templates.subitem.tmpl(data).appendTo(category);
        }

            /*
            if(listModules.length == 0) {
                this.templates.subitem.tmpl(data).appendTo($('.dropdown .content', whapp));
                whapp.attr('menu', 'true');
            }
            else {
                $.each(listModules, function(k, v) {
                    if(listModules[k].attributes['module-weight'] != undefined) {
                        var currentModule = new String(listModules[k].attributes['module-weight'].value),
                            compare = ((module_weight == currentModule) ? 0 : ((module_weight > currentModule) ? 1 : -1));

                        if(k == listModules.length - 1 && compare > 0) {
                            THIS.templates.subitem.tmpl(data).appendTo($('.dropdown .content', whapp));
                            winkstart.log(data.module + ' appended');
                            return false;
                        }
                        else if(compare < 0){
                            THIS.templates.subitem.tmpl(data).insertBefore(listModules[k]);
                            winkstart.log(data.module + ' insertBefore');
                            return false;
                        }
                    } else {
                        THIS.templates.subitem.tmpl(data).appendTo($('.dropdown .content', whapp));
                        return false;
                    }
                });
            }
            */

    }
);
