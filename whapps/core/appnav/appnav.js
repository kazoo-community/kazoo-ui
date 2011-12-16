winkstart.module('core', 'appnav', {
    /* Config */
        css: {
            appnav: 'appnav.css'
        },

        templates: {
            appnav:  'appnav.html',
            item:    'item.html',
            subitem: 'subitem.html'
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
        
        this.templates.appnav.tmpl({}).appendTo( $('div.header .main_nav') );
        
        // Set up the Module Click handlers
        $('div.header .main_nav').delegate('li', 'click', function() {
            winkstart.publish('appnav.activate', $(this).attr('module-name'));
            return false;
        });

        winkstart.log('AppNav: Initialized application nav bar.');
    },

        /* Methods */
    {   
        add: function(args) {
            var list_node = $('div.header .main_nav').find('ul'),
                item = this.templates.item.tmpl({ 'name' : args.name, 'module' : winkstart.apps[args.name] }).appendTo(list_node);

            $('.dropdown', item).hide();

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

            winkstart.log('AppNav: Adding navigation item ' + args.name);

            // Set up the subnav click handler
            $('.dropdown .content', item).delegate('.module', 'click', function() {
                $('div.header .main_nav .whapp a').removeClass('selected');
                $('.whapp a', $(this).parents('li')).addClass('selected');
                winkstart.publish(args.name + '.module_activate', { name: $(this).attr('module-name') });

                return false;
            });
        },

        show_menu: function(module_name) {
            var module = $('li[module-name=' + module_name + ']', '.main_nav > ul');

            if(module.attr('menu') != 'false') {
                $('.dropdown', module).slideDown(100);
            }
        },

        hide_menu: function(module_name) {
            var module = $('li[module-name=' + module_name + ']', '.main_nav > ul');

            if(module.attr('menu') != 'false') {
                $('.dropdown', module).slideUp(100);
            }
        },

        activate: function(app_name) {
            var THIS = this;
            // TODO: De-activate current app & unload it

            THIS._activate(app_name);
        },

        _activate: function(app_name) {
            winkstart.log('AppNav: Click detected - calling ' + app_name + '.activate');
            winkstart.publish ( app_name + '.activate', { });
        },

        remove: function() {
            // TODO: Implement me
        },

        sub_add: function(data) {
            var THIS = this,
                whapp_name = new String(data.whapp),
                whapp = $('.main_nav li[module-name="' + whapp_name + '"]'),
                module_weight = new String(data.weight),
                listModules = $('.module', whapp);

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
        }

    }
);
