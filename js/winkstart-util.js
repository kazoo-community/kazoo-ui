( function(winkstart, amplify, $) {
    winkstart.is_password_valid = function(password_string, strength) {
        var help_standard = 'The password must contain at least 6 characters and include a letter and a number.',
            help_strong = 'The password must contain at least 8 characters including a non-capitalized letter, a capitalized letter, a number and a special character (!%$...)',
            strength = strength || 'standard', //Standard is the default value
            res = password_string.match(winkstart.get_password_regex(strength)),
            alert_message = 'Your password is not valid<br/>';

        if(res && res[0]) {
            return true;
        }
        else {
            switch(strength) {
                case 'standard':
                    alert_message += help_standard;
                    break;

                case 'strong':
                    alert_message += help_strong;
                    break;

                default: true;
            }
            winkstart.alert(alert_message);
            return false;
        }
    };

    winkstart.get_password_regex = function(strength) {
        var standard_validation = /(?=^.{6,}$)(?=.*\d)((?=.*[a-z])|(?=.*[A-Z])).*$/g,
            strong_validation = /(?=^.{8,}$)(?![.\n])(?=.*[\!\@\#\$\%\^\&\*\-\_\(\)\[\]\=\+\^])(?=.*[A-Z])(?=.*\d)(?=.*[a-z]).*$/g;

        switch(strength) {
            case 'standard':
                return standard_validation;
                break;

            case 'strong':
                return strong_validation;
                break;

            default:
                return standard_validation;
        }
    };

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

    winkstart.confirm = function(content, callback_ok, callback_cancel) {
        var html,
            popup,
            options = {},
            ok = false;

        html = $('<div class="center"><div class="alert_img confirm_alert"></div><div class="alert_text_wrapper info_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><a id="confirm_button" class="fancy_button green confirm_button" href="javascript:void(0);">OK</a><a id="cancel_button" class="fancy_button red confirm_button" href="javascript:void(0);">Cancel</a></div></div>');

        options.title = 'Please confirm';
        options.maxWidth = '400px';
        options.width = '400px';
        options.onClose = function() {
            if(ok) {
                if(typeof callback_ok == 'function') {
                    callback_ok();
                }
            }
            else {
                if(typeof callback_cancel == 'function') {
                    callback_cancel();
                }
            }
        };

        popup = winkstart.dialog(html, options);

        $('#confirm_button', html).click(function() {
            ok = true;
            popup.dialog('close');
        });

        $('#cancel_button', html).click(function() {
            popup.dialog('close');
        });

        return popup;
    };

    winkstart.alert = function(type, content, callback) {
        var html,
            popup,
            options = {},
            type_temp = type.toLowerCase();

        if(type_temp == 'error') {
            html = $('<div class="center"><div class="alert_img error_alert"></div><div class="alert_text_wrapper error_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><a class="fancy_button blue alert_button" href="javascript:void(0);">Close</a></div></div>');
        }
        else if(type_temp == 'info'){
            html = $('<div class="center"><div class="alert_img info_alert"></div><div class="alert_text_wrapper info_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><a class="fancy_button blue alert_button" href="javascript:void(0);">Close</a></div></div>');
        }
        else {
            callback = content;
            content = type;
            type_temp = 'warning';
            html = $('<div class="center"><div class="alert_img warning_alert"></div><div class="alert_text_wrapper warning_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><a class="fancy_button blue alert_button" href="javascript:void(0);">Close</a></div></div>');
        }

        options.title = type_temp.charAt(0).toUpperCase() + type_temp.slice(1);
        options.maxWidth = '600px';
        //options.width = '400px';
        options.onClose = function() {
            if(typeof callback == 'function') {
                callback();
            }
        };

        popup = winkstart.dialog(html, options);

        $('.fancy_button', html).click(function() {
            popup.dialog('close');
        });

        return popup;
    };

    winkstart.dialog = function(content, options) {
        var newDiv = $(document.createElement('div')).html(content);

        //Unoverridable options
        var strict_options = {
            show: { effect : 'fade', duration : 200 },
            hide: { effect : 'fade', duration : 200 },
            zIndex: 20000,
            close: function() {
                $(newDiv).dialog('destroy');
                $(newDiv).remove();

                if(typeof options.onClose == 'function') {
                    /* jQuery FREAKS out and gets into an infinite loop if the following function kicks back an error.
                       Hence the try/catch. */
                    try {
                        options.onClose();
                    }
                    catch(err) {
                        if(console && err.message && err.stack) {
                            console.log(err.message);
                            console.log(err.stack);
                        }
                    }
                }
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
