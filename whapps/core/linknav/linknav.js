winkstart.module('core', 'linknav', {
        css: [
            'css/linknav.css'
        ],

        templates: {
            link: 'tmpl/link.html',
            sublink: 'tmpl/sublink.html',
            sublink_divider: 'tmpl/sublink_divider.html',
            category: 'tmpl/category.html'
        },

        subscribe: {
            'linknav.add': 'add',
            'linknav.edit': 'edit'
        },

        targets: {
            link_nav: '#ws-topbar .links'
        }
    },

    function() {
        winkstart.publish('linknav.add', {
            name: 'help',
            weight: 50,
            content: 'Help',
            new_page: true,
            href: (winkstart.config.nav || {}).help
        });
    },

    {
        add: function(args) {
            var THIS = this,
                normalized_args = {
                    name: args.name || '',
                    weight: args.weight || null,
                    content: args.content || '???',
                    new_page: args.new_page || false,
                    href: args.href || '#',
                    publish: args.publish || 'dev.null',
                    modifier: args.modifier || null
                },
                links_html = $(THIS.config.targets.link_nav),
                link_list_html = $('.link', links_html),
                link_html = THIS.templates.link.tmpl(normalized_args),
                inserted = false;

            THIS.edit(normalized_args, link_html);

            (link_html)
                .hoverIntent({
                    sensitivity: 1,
                    interval: 40,
                    timeout: 200,
                    over: function() {
                        if((link_html).dataset('dropdown')) {
                            (link_html).addClass('open');
                        }
                    },
                    out: function() {
                        if((link_html).dataset('dropdown')) {
                            (link_html).removeClass('open');
                        }
                    }
                });

            (link_list_html).each(function(index) {
                var weight = $(this).dataset('weight');

                if(normalized_args.weight < weight) {
                    $(this).before(link_html);

                    inserted = true;

                    return false;
                }
                else if(index >= link_list_html.length - 1) {
                    $(this).after(link_html);

                    inserted = true;

                    return false;
                }
            });

            if(!inserted) {
                (links_html)
                    .append(link_html);
            }
        },

        edit: function(args, target) {
            var THIS = this,
                link_html = target;

            if(!link_html) {
                link_html = $('.link[data-link="' + args.name + '"]', THIS.config.targets.link_nav);
            }

            if(args.content) {
                $('> a', link_html)
                    .empty()
                    .append(args.content);
            }

            if(args.href) {
                $('> a', link_html)
                    .attr('href', args.href);
            }

            if(args.new_page) {
                $('> a', link_html)
                    .attr('target', '_blank');
            }

            if(args.publish) {
                $('> a', link_html)
                    .unbind('click.linknav')
                    .bind('click.linknav', function(ev) {
                        var href = $(this).attr('href');

                        if(!href || href == '#') {
                            ev.preventDefault();

                            winkstart.publish(args.publish, {});
                        }
                    });
            }

            if(args.modifier) {
                if(typeof args.modifier == 'function') {
                    /* No, this is not a typo. Let the dev chose if they want 'this' or a param */
                    args.modifier.call(link_html, link_html);
                }
            }
        }

        /* This is modeled much like whappnav, there should be no problem implementing dropdowns */
    }
);
