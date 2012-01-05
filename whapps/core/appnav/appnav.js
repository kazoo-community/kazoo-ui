winkstart.module('core', 'appnav', {
        css: [
            'css/appnav.css'
        ],

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

    function() {
        var THIS = this;

        THIS.templates.appnav.tmpl({}).appendTo( $('div.header .main_nav') );
    },

    {
        add: function(args) {
            var THIS = this,
                columns = args.columns || 1,
                list_node = $('body > div > .header .main_nav ul'),
                item = THIS.templates.item.tmpl({
                    name: args.name,
                    whapp: winkstart.apps[args.name]
                }).appendTo(list_node);

            (item)
                .hoverIntent({
                    sensitivity: 1,
                    interval: 40,
                    timeout: 300,
                    over: function() {
                        winkstart.publish('subnav.show', item);
                    },
                    out: function() {
                        winkstart.publish('subnav.hide', item);
                    }
                })
                .click(function() {
                    $('.whapp a', list_node).removeClass('selected');
                    $('.whapp a', item).addClass('selected');

                    winkstart.publish('appnav.activate', args.name);
                });

            $('.dropdown', item)
                .hide()
                .width((item.innerWidth()  * columns) - 1)
                .delegate('.module', 'click', function() {
                    $('.whapp a', list_node).removeClass('selected');
                    $('.whapp a', item).addClass('selected');

                    winkstart.publish(args.name + '.module_activate', { name: $(this).attr('module-name') });

                    return false;
                });
        },

        show_menu: function(whapp_arg) {
            var whapp;

            if(typeof whapp_arg == 'string') {
                whapp = $('li[whapp-name=' + whapp_arg + ']', '.main_nav > ul');
            }
            else if(typeof whapp_arg == 'object') {
                whapp = whapp_arg;
            }

            if(whapp.attr('menu') != 'false') {
                $('.dropdown', whapp).slideDown(100);
            }
        },

        hide_menu: function(whapp_arg) {
            var whapp;

            if(typeof whapp_arg == 'string') {
                whapp = $('li[whapp-name=' + whapp_arg + ']', '.main_nav > ul');
            }
            else if(typeof whapp_arg == 'object') {
                whapp = whapp_arg;
            }

            if(whapp.attr('menu') != 'false') {
                $('.dropdown', whapp).slideUp(100);
            }
        },

        activate: function(app_name) {
            var THIS = this;

            winkstart.publish ( app_name + '.activate', { });
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

                $('.header', category)
                    .click(function() {
                        category.toggleClass('not_expanded');
                    });
            }

            THIS.templates.subitem.tmpl(data).appendTo($('.module_wrapper', category));
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
