( function(winkstart, amplify, $) {

    winkstart.log = function(data) {
        //if (winkstart.debug) {
        if(winkstart.config.debug) {
            console.log(data);
        }
    };

    winkstart.cleanForm = function() {
        var max = 0;
        $("label").each( function() {
            if ($(this).width() > max)
                max = $(this).width();
        });
        $("label").width(max);
    };

    winkstart.loadFormHelper = function(name) {
        var url = 'js/tmpl_snippets/'  + name + '.html';
        $.get(url, function(data) {
            $('body').append(data);
        });
    };

    winkstart.alert = function(type, content, options) {
        var html,
            popup,
            options = options || {},
            content = content || type,
            type = type.toLowerCase();

        if(type == 'error') {
            html = $('<div class="center"><div class="alert_img error_alert"></div><div class="alert_text_wrapper error_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><a class="fancy_button blue" href="javascript:void(0);">Close</a></div></div>');
        }
        else if(type == 'info'){
            html = $('<div class="center"><div class="alert_img info_alert"></div><div class="alert_text_wrapper info_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><a class="fancy_button blue" href="javascript:void(0);">Close</a></div></div>');
        }
        else {
            type = 'warning';
            html = $('<div class="center"><div class="alert_img warning_alert"></div><div class="alert_text_wrapper warning_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><a class="fancy_button blue" href="javascript:void(0);">Close</a></div></div>');
        }

        options.title = type.charAt(0).toUpperCase() + type.slice(1);
        options.maxWidth = '400px';
        options.width = '400px';

        popup = winkstart.dialog(html, options);

        $('.fancy_button', html).click(function() {
            popup.dialog('close');
        });

        return popup;
    };

    winkstart.dialog = function(content, options, buttons) {
        var newDiv = $(document.createElement('div')).html(content);

        //Unoverridable options
        var strict_options = {
            show: { effect : 'fade', duration : 200 },
            hide: { effect : 'fade', duration : 200 },
            close: function() {
                $(newDiv).dialog('destroy');
                $(newDiv).remove();
            }
        },

        //Default values
        defaults = {
            width: 'auto',
            modal: true,
            resizable: false
        };

        //Overwrite any defaults with settings passed in, and then overwrite any attributes with the unoverridable options.
        options = $.extend(defaults, options || {}, strict_options);
        $(newDiv).dialog(options);

        return $(newDiv);       // Return the new div as an object, so that the caller can destroy it when they're ready.'
    };

    winkstart.random_string = function(length, _chars) {
        var chars = _chars || "0123456789abcdefghijklmnopqrstuvwxyz",
            chars_length = chars.length,
            random_string = '';

        for(var i = length; i > 0; i--) {
            random_string += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return random_string;
    };

})(window.winkstart = window.winkstart || {}, window.amplify = window.amplify || {}, jQuery);
