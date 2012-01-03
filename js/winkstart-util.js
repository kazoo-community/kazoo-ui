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

    winkstart.alert = function(content, type, options) {
        var html,
            popup,
            options = options || {},
            type = type || 'Error';

        if(type=='Error') {
            html = $('<div class="center"><div class="error_img"></div><div class="error_text_wrapper"><span class="error_text">' + content + '</span></div><div class="clear"/><div class="error_buttons_wrapper"><a class="fancy_button blue" href="javascript:void(0);">Close</a></div></div>');
        }
        else {
            html = $('<div class="center"><div class="warning_img"></div><div class="warning_text_wrapper"><span class="warning_text">' + content + '</span></div><div class="clear"/><div class="warning_buttons_wrapper"><a class="fancy_button blue" href="javascript:void(0);">Close</a></div></div>');
        }

        options.title = type;
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
