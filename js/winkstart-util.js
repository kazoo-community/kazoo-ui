( function(winkstart, amplify, $) {
    winkstart.is_password_valid = function(password_string, strength) {
        var help = {
                standard: 'The password must contain at least 6 characters and include a letter and a number.',
                strong: 'The password must contain at least 8 characters including a non-capitalized letter, a capitalized letter, a number and a special character (!%$...)'
            },
            strength = strength || 'standard', //Standard is the default value
            res = password_string.match(winkstart.get_password_regex(strength));

        if(res && res[0]) {
            return true;
        }
        else {
            winkstart.alert('Your password is not valid<br/>' + help[strength] || '');
            return false;
        }
    };

    winkstart.get_password_regex = function(strength) {
        var validation = {
            standard: /(?=^.{6,}$)(?=.*\d)((?=.*[a-z])|(?=.*[A-Z])).*$/g,
            strong: /(?=^.{8,}$)(?![.\n])(?=.*[\!\@\#\$\%\^\&\*\-\_\(\)\[\]\=\+\^])(?=.*[A-Z])(?=.*\d)(?=.*[a-z]).*$/g
        };

        return validation[strength || 'standard'];
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

        html = $('<div class="center"><div class="alert_img confirm_alert"></div><div class="alert_text_wrapper info_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><button id="confirm_button" class="btn success confirm_button">OK</button><button id="cancel_button" class="btn danger confirm_button">Cancel</button></div></div>');

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
            html = $('<div class="center"><div class="alert_img error_alert"></div><div class="alert_text_wrapper error_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><button class="btn primary alert_button">Close</button></div></div>');
        }
        else if(type_temp == 'info'){
            html = $('<div class="center"><div class="alert_img info_alert"></div><div class="alert_text_wrapper info_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><button class="btn primary alert_button">Close</button></div></div>');
        }
        else {
            callback = content;
            content = type;
            type_temp = 'warning';
            html = $('<div class="center"><div class="alert_img warning_alert"></div><div class="alert_text_wrapper warning_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><button class="btn primary alert_button">Close</button></div></div>');
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

        $('.btn', html).click(function() {
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

    winkstart.link_form = function(html){
        $('input', html).bind('change.link keyup.link focus.link', function() {
            var name = $(this).attr('name'),
                type = $(this).attr('type'),
                input_fields = $('input[name="' + name + '"]', html);

            if(input_fields.size() > 1) {
                if(type == 'checkbox'){
                    ($(this).attr('checked')) ? input_fields.attr('checked', 'checked') : input_fields.removeAttr('checked');
                }
                else {
                    input_fields.val($(this).val());
                }
            }
            else {
                $(this).unbind('.link');
            }
        });
    };

    winkstart.tabs = function(buttons_html, tabs_html, advanced) {

        if(advanced) {
            $('.btn', buttons_html).removeClass('activate');
            $('.advanced', buttons_html).addClass('activate');
        } else {
            winkstart.publish('personal_info.advanced_view', function(status){
                if(status) {
                    $('.btn', buttons_html).removeClass('activate');
                    $('.advanced', buttons_html).addClass('activate');
                } else {
                     tabs_html.hide('blind');
                }
            });
        }

        if($('li', tabs_html).length < 2){
            buttons_html.hide();
        }

        $('.basic', buttons_html).click(function(){
            if(!$(this).hasClass('activate')){
                $('.btn', buttons_html).removeClass('activate');
                $(this).addClass('activate');
                $('li:first-child > a', tabs_html).trigger('click');
                tabs_html.hide('blind');
            }
        });

        $('.advanced', buttons_html).click(function(){
            if(!$(this).hasClass('activate')){
                $('.btn', buttons_html).removeClass('activate');
                $(this).addClass('activate');
                tabs_html.show('blind');
            }
        });
    };

    winkstart.accordion = function(html){

        function toggle(btn, state) {
            var div = $('#' + btn.data('toggle'));

            if(state) {
                btn.addClass('activate');
                btn.html('Hide');
                div.slideDown();
            } else {
                btn.removeClass('activate');
                btn.html('Show');
                div.slideUp();
            }
        }

        $('.toggled', html).hide();

        $('.toggle-all', html).click(function(ev){
            var btn = $(this);
            ev.preventDefault();

            $('.toggle', html).each(function(i) {
                toggle($(this), !btn.hasClass('activate'));
            });

            if(btn.hasClass('activate')) {
                btn.removeClass('activate');
                btn.html('Show All');
            } else {
                btn.addClass('activate');
                btn.html('Hide All');
            }
        });

        $('.toggle', html).click(function(ev){
            var btn = $(this);
            ev.preventDefault();

            toggle(btn, !btn.hasClass('activate'));
        });

    };

})(window.winkstart = window.winkstart || {}, window.amplify = window.amplify || {}, jQuery);
