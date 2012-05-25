winkstart.module('myaccount', 'statistics', {
        css: [
            'css/statistics.css'
        ],

        templates: {
            statistics: 'tmpl/statistics.html',
            stat: 'tmpl/stat.html'
        },

        subscribe: {
            'myaccount.initialized': 'activate',
            'voip.loaded': 'voip_loaded',
            'statistics.update_stat': 'update_stat',
            'statistics.get_nav': 'get_stat_html',
            'statistics.add_stat': 'add_stat'
        },

        targets: {
            stats_nav: '#ws-topbar #statistics_navbar'
        }
    },

    function(args) {
        var THIS = this;
    },

    {
        stats: {},

        activate: function() {
            var THIS = this;

            THIS.poll_stat();
        },

        poll_stat: function() {
            var THIS = this,
                polling_interval = 10,
                poll = function() {
                    $.each(THIS.stats, function(k, v) {
                        THIS.update_stat(k);
                    });
                    setTimeout(poll, polling_interval * 1000);
                };

            setTimeout(poll, polling_interval * 1000);
        },

        add_stat: function(data_stat) {
            var THIS = this;

            if($.isEmptyObject(THIS.stats)) {
                statistics_html = THIS.templates.statistics.tmpl();

                winkstart.publish('linknav.add', {
                    name: 'stats',
                    weight: '05',
                    content: statistics_html
                });
            }

            var stats_html = $(THIS.config.targets.stats_nav);

            /* Set defaults values */
            console.log(data_stat);
            $.each(data_stat, function(k,v) {
                v.active = v.active || false;
                v.number = v.number || 0;
                v.color = v.color || 'green';
                v.name = k;
                v.clickable = v.click_handler ? true : false;
            });

            $.extend(THIS.stats, data_stat);

            $.each(data_stat, function(k,v) {
                stat_html = THIS.templates.stat.tmpl({stat: v}).appendTo(stats_html);

                if(v.click_handler && typeof v.click_handler === 'function') {
                    $(stat_html, stats_html).click(function() {
                        v.click_handler();
                    });
                }
                THIS.update_stat(k);
            });
        },

        update_stat: function(stat_name) {
            var THIS = this,
                current_stat = THIS.stats[stat_name];

            if(!current_stat.error || current_stat.error < 3) {
                THIS.stats[stat_name].get_stat(function(args) {
                    if(!args.error) {
                        delete current_stat.error;

                        winkstart.publish('statistics.get_nav', {name: stat_name}, function(stat_html) {
                            if(args.active) {
                                $('.icon', stat_html).addClass('blue');
                                $('.bubble', stat_html).removeClass('inactive');
                            }
                            else {
                                $('.icon', stat_html).removeClass('blue');
                                $('.bubble', stat_html).addClass('inactive');
                            }
                            $('.bubble', stat_html).html(args.number);
                            $('.bubble', stat_html).removeClass('green orange red').addClass(args.color);
                        });
                    }
                    else {
                        current_stat.error = current_stat.error ? current_stat.error++ : 1;
                    }
                });
            }
        },

        get_stat_html: function(data, callback) {
            var THIS = this,
                stats_html = $(THIS.config.targets.stats_nav),
                stat_html = $('.stat_wrapper[data-name="' + data.name + '"]', stats_html);

            if(typeof callback === 'function') {
                callback(stat_html);
            }
        }
    }
);
