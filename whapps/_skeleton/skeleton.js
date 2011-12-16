winkstart.module('skeleton', 'skeleton', 
    /* Start module resource definitions */
    {
        /* What CSS stylesheets do you want automatically loaded? */
        css: [
            'css/style.css'
        ],

        /* What HTML templates will we be using? */
        templates: {
            index: 'tmpl/index.html',        // This is utilized later as THIS.templates.index.tmpl({ data_here})
            results: 'tmpl/results.html'
        },

        /* What events do we listen for, in the browser? */
        subscribe: {
            'skeleton.activate' : 'activate',
            'skeleton.index' : 'viewIndex'
        },

        /* What API URLs are we going to be calling? Variables are in { }s */
        resources: {
            "skeleton.list": {
                url: 'http://www.mysite.com/get_json.php?somevar={some_value}',
                contentType: 'application/json',
                verb: 'GET'
            }
        }
    }, // End module resource definitions



    /* Bootstrap routine - runs automatically when the module is first loaded */
    function(args) {
        /* Tell winkstart about the APIs you are going to be using (see top of this file, under resources */
        winkstart.registerResources(this.__whapp, this.config.resources);

        winkstart.publish('subnav.add', {
            module: this.__module,
            label: 'Skeleton'
        });
    }, // End initialization routine



    /* Define the functions for this module */
    {

        /*
         * View some data
         * Called when someone clicks something on the screen or does winkstart.publish('skeleton.index');'
         */
        viewIndex : function() {
            var THIS = this;
            winkstart.log('Sample debug message!');

            // Clear out the section of the screen named skeleton-view
            $('#skeleton-view').empty();

            // Go get data from the server
            winkstart.getJSON('skeleton.list', 
                /* Arguments to pass to the other server, or config parameters on HOW to pass to the server */
                {
                    crossbar: true,
                    account_id: winkstart.apps['app'].account_id,
                    some_value: "blah"
                },

                /* What to do on successfully getting JSON */
                function (json, xhr) {
                    /* Clear the results pane */
                    $('div#blah').empty();

                    /* Draw the results.html template on the screen */
                    THIS.templates.results.tmpl( { "some_key" : "some_value" }).appendTo( $('#skeleton-view') );
                }
            );

        },

        /* This runs when this module is first loaded - you should register to any events at this time and clear the screen
         * if appropriate. You should also attach to any default click items you want to respond to when people click
         * on them. Also register resources.
         */
        activate: function(data) {
            var THIS = this;
            /* Clear out the center part of the window - get ready to put our own content in there */
            $('#ws-content').empty();

            /* Draw our base template into the window */
            THIS.templates.index.tmpl().appendTo( $('#ws-content') );

            winkstart.publish('layout.updateLoadedModule', {
                label: 'Skeleton',
                module: this.__module
            });

            /* Global binding to click event */
            $('.list-skeleton').live({
                click: function(evt){
                    winkstart.publish('skeleton.index');
                }
            });
        }
    } // End function definitions

);  // End module
