(function(winkstart, amplify, undefined) {
	var modules = {},
        loading = {},
        locked_topics = {},
        slice = [].slice;
	
	winkstart.publish = function(locking) {
        var args = arguments,
            ret;

        if(locking === true) {
            args = slice.call(arguments, 1);

            if(!args.length) {
                return false;
            }

            if(args[0] in locked_topics) {
                return false;
            }
            else {
                locked_topics[args[0]] = true;
            }
        }

        ret = amplify.publish.apply(null, args);

        if(locking === true) {
            if(args[0] in locked_topics) {
                delete locked_topics[args[0]];
            }
        }

        return ret;
    }

	winkstart.subscribe   = amplify.subscribe;
	winkstart.unsubscribe = amplify.unsubscribe;
	
	winkstart.module = amplify.module;
	amplify.module.constructor = function(args, callback) {
		var completed = 0, THIS = this;
		if ( this.config.templates ) {
			this.templates = {};
			$.each(this.config.templates, function(name, url) {
				completed++;
                // Make sure you set cache = false, or things really suck
				$.ajax({
                    url: 'whapps/' + THIS.__whapp + '/' + THIS.__module + '/' + url,
                    cache: false,
                    success: function(template) {
					    completed--;
					    THIS.templates[name] = $(template);
				    }});
			});
		}
		if ( this.config.requires ) {
			$.each(this.config.requires, function(k, module) {
                                winkstart.log('Loading dependency ' + k + ' ' + module);
				completed++;
				amplify.module.loadModule(k, module, function() {
					completed--;
				});
			});
		}
		if ( this.config.css ) {
			$.each(this.config.css, function(k, css) {
				if ( css === true ) {
					THIS.__module + '.css';
				}
				css = 'whapps/' + THIS.__whapp + '/' + THIS.__module + '/' + css;
				//completed++;
				$('<link href="' + css + '" rel="stylesheet" type="text/css">').bind('load', function() {
					//completed--;
				}).appendTo('head');
			});
		}
		if ( this.config.subscribe ) {
			$.each(this.config.subscribe, function(k, v) {
				winkstart.subscribe(k, function() {
					if ( THIS[v] ) {
						THIS[v].apply(THIS, arguments);
					}
				});
			});
		}
		
		setTimeout(function() {
			completed = 0;
		}, 3000);
		
		(function() {
			if ( completed == 0 ) {
				if ( $.isFunction(callback) ) {
					callback();
				}
				return;
			}
			var _c = arguments.callee;
			setTimeout(function() { _c(); }, 10);
		})();
	};
		
	// Bootstrap the app: Start by loading the core module
	winkstart.module.loadApp('core', function() {
		// Create an instance of the core module, which loads layouts and all whApps
		this.init();
                
/*			winkstart.module.loadModule('core', 'layout', function() {
				this.init({ parent: $('body') }, function() {
					
					//Bootstrap some form data
					$.getJSON('endpoint/form/data.json', function(data){
						amplify.store('form_data', data);
					});
				});
			});
		});*/
	});

})(	window.winkstart = window.winkstart || {}, window.amplify = window.amplify || {});
