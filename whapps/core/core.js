// This is the core module. It is responsible for loading all a base layout, a base navigation bar and any registered whApps
winkstart.module('core', 'core',
    {
    },
    function(args) {
        // First thing we're going to do is go through is load our layout
        winkstart.module('core', 'layout').init({ parent: $('body') }, function() {
            winkstart.module('core', 'whappnav').init({ parent: $('body') }, function() {
                winkstart.module('core', 'linknav').init({ parent: $('body') }, function() {
                    // Now move onto apps
                    winkstart.log('WhApps: Loading WhApps...');

                    // Load any other apps requested (only after core is initialized)
                    $.each(winkstart.apps, function(k, v) {
                        winkstart.log('WhApps: Would load ' + k + ' from URL ' + v.url);
                        winkstart.module.loadApp(k, function() {
                            this.init();
                            winkstart.log('WhApps: Initializing ' + k);
                        });
                    });

                    winkstart.log('WhApps: Finished Loading WhApps');
                });
            });
        });
    }
);
