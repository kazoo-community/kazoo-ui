( function(winkstart, amplify, $) {
	winkstart.check_routes = function(routes) {
		var THIS = this;

        if (window.location.hash.length > 1) {
            var account,
                handler,
                matches,
                path = window.location.hash.substring(1);

            for (var routeIdx = 0; routeIdx < routes.length; routeIdx++) {
                var route = routes[routeIdx];
                matches = path.match(route.pattern);

                if (matches && matches[1]) {
                    account = {'id': matches[1], 'name': 'demo'};
                    handler = route.handler;
                    break;
                }
            }
            if (!account) return; // Account not found in path. Do nothing.

            // get the account
            winkstart.publish('accounts_manager.trigger_masquerade', { account: account }, function() {
                if (!handler) return; // No handler defined for route, do nothing.
                handler.apply(THIS, matches.slice(1));
            });
        }
	};

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

    winkstart.changeFavIcon = function(src) {
        var link = document.createElement('link'),
            oldLink = document.getElementById('dynamicFavicon');

        link.id = 'dynamicFavicon';
        link.rel = 'shortcut icon';
        link.href = src;

        if (oldLink) {
            document.head.removeChild(oldLink);
        }

        document.head.appendChild(link);
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

        html = $('<div class="center"><div class="alert_img confirm_alert"></div><div class="alert_text_wrapper info_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><button id="confirm_button" class="btn success confirm_button">' + _t('config', 'OK') + '</button><button id="cancel_button" class="btn danger confirm_button">' + _t('config', 'CANCEL') + '</button></div></div>');

        options.title = _t('config', 'please_confirm_title');
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

    winkstart.charges = function(data, callback_ok, callback_cancel) {
        var html = $('<div class="center"><div class="alert_img confirm_alert"></div><div class="alert_text_wrapper info_alert charges-info" id="charges_description"></div><div class="alert_text_wrapper info_alert charges-info">' + _t('config', 'press_OK_or_Cancel') + '</div><div class="clear"/><div class="alert_buttons_wrapper"><button id="confirm_button" class="btn success confirm_button">' + _t('config', 'OK') + '</button><button id="cancel_button" class="btn danger confirm_button">' + _t('config', 'CANCEL') + '</button></div></div>'),
            ok = false,
            options = {
                title: _t('config', 'charges_summary_title'),
                maxWidth: 'auto',
                width: 'auto',
                onClose: function() {
                    if (ok) {
                        if (typeof callback_ok == 'function') {
                            callback_ok();
                        }
                    } else {
                        if (typeof callback_cancel == 'function') {
                            callback_cancel();
                        }
                    }
                }
            },
            formatData = function(data) {
                var totalAmount = 0,
                    renderData = [];

                $.each(data, function(categoryName, category) {
                    if ( categoryName != 'activation_charges' && categoryName != 'activation_charges_description' ) {
                        $.each(category, function(itemName, item) {
                            var discount = item.single_discount_rate + (item.cumulative_discount_rate * item.cumulative_discount),
                                monthlyCharges = parseFloat(((item.rate * item.quantity) - discount) || 0).toFixed(2);

                            renderData.push({
                                service: itemName.toUpperCase().replace("_"," "),
                                rate: item.rate || 0,
                                quantity: item.quantity || 0,
                                discount: discount > 0 ? '- $' + parseFloat(discount).toFixed(2) : 0,
                                monthlyCharges: monthlyCharges < 0 ? '- $' + Math.abs(monthlyCharges).toFixed(2) : '$' + monthlyCharges
                            });

                            totalAmount += parseFloat(monthlyCharges);
                        });
                    }
                });

                var sortByPrice = function(a, b) {
                    return parseFloat(a.monthlyCharges) >= parseFloat(b.monthlyCharges) ? -1 : 1;
                };

                renderData.sort(sortByPrice);

                return renderData;
            },
            formattedData = formatData(data),
            dataTemplate,
            content,
            popup;

        if (typeof data.activation_charges_description !== 'undefined') {
            var description = data.activation_charges_description.replace("_", " ");

            if (typeof data.activation_charges !== 'undefined' && data.activation_charges !== 0) {
                content = _t('config', 'you_will_pay') + data.activation_charges + _t('config', 'one_time') + description + '. '
            } else {
               content = _t('config', 'there_is_no') + description + '.<br />'
            }
        }

        if (formattedData.length > 0) {
            content += _t('config', 'content_charges');
        }

        $('#charges_description', html).append(content);

        if ( formattedData.length > 0 ) {
            var tableHtml = $('<div class="alert_text_wrapper info_alert" id="charges_table"><table class="charges-summary"><thead><tr><th>' + _t('config', 'service') + '</th><th>' + _t('config', 'rate') + '</th><th></th><th>' + _t('config', 'quantity') + '</th><th>' + _t('config', 'discount') + '</th><th>' + _t('config', 'monthly_charges') + '</th></tr></thead><tbody></tbody></table></div>');

            for ( var service in formattedData ) {
                var cellHtml = $('<tr><td>' + formattedData[service].service + '</td><td>$' + formattedData[service].rate + '</td><td>X</td><td>' + formattedData[service].quantity + '</td><td>' + formattedData[service].discount + '</td><td>' + formattedData[service].monthlyCharges + '</td></tr>');

               tableHtml.find('tbody').append(cellHtml);
            }

            tableHtml.insertAfter(html.find('#charges_description'));
        }

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
            type_temp = type.toLowerCase(),
            f_data = {};

        if(content && content.data) {
            f_data = winkstart.print_r(content.data);
        }

        if(type_temp == 'error') {
            html = $('<div class="center"><div class="alert_img error_alert"></div><div class="alert_text_wrapper error_alert"><span>' +
                content +
                '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><button class="btn primary alert_button">' + _t('config', 'CLOSE') + '</button></div></div>');

            if(content && content.data) {
                html = $('<div class="center"><div class="alert_img error_alert"></div><div class="alert_text_wrapper error_alert"><span><p>' +
                    content.text +
                    '<p>' +
                    '<p><button class="btn small danger json">Show Errors</button>' +
                    '</p><p style="display:none" class="json_error"></p>' +
                    '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><button class="btn primary alert_button">' + _t('config', 'CLOSE') + '</button></div></div>');
            }
        }
        else if(type_temp == 'info'){
            html = $('<div class="center"><div class="alert_img info_alert"></div><div class="alert_text_wrapper info_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><button class="btn primary alert_button">' + _t('config', 'CLOSE') + '</button></div></div>');
        }
        else {
            callback = content;
            content = type;
            type_temp = _t('config', 'WARNING');
            html = $('<div class="center"><div class="alert_img warning_alert"></div><div class="alert_text_wrapper warning_alert"><span>' + content + '</span></div><div class="clear"/><div class="alert_buttons_wrapper"><button class="btn primary alert_button">' + _t('config', 'CLOSE') + '</button></div></div>');
        }

        options.title = type_temp.charAt(0).toUpperCase() + type_temp.slice(1);
        options.maxWidth = '600px';
        options.onClose = function() {
            if(typeof callback == 'function') {
                callback();
            }
        };

        popup = winkstart.dialog(html, options);

        $('.btn.alert_button', html).click(function() {
            popup.dialog('close');
        });

        if(content && content.data) {
            $('.json_error', popup)
                .css({
                    'cursor': 'pointer'
                })
                .append(f_data);

            $('.json', popup)
                .css('min-width', 0)
                .click(function(e){
                    e.preventDefault();
                   $('.json_error', popup).toggle();
                });
        }


        return popup;
    };

    winkstart.dialog = function(content, options) {
        var newDiv = $(document.createElement('div')).html(content);

        $('input', content).keypress(function(e) {
            if(e.keyCode == 13) {
                e.preventDefault();
                return false;
            }
        });

        //Unoverridable options
        var strict_options = {
            show: { effect : 'fade', duration : 200 },
            hide: { effect : 'fade', duration : 200 },
            zIndex: 20000,
            close: function() {
                $('div.popover').remove();
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

    winkstart.friendly_timestamp = function(timestamp) {
        var THIS = this,
            timestamp = timestamp,
            parsed_date = '-';

        if(timestamp) {
            var date = new Date((timestamp - 62167219200)*1000),
                month = date.getMonth() +1,
                year = date.getFullYear(),
                day = date.getDate(),
                humanDate = month+'/'+day+'/'+year,
                humanTime = date.toLocaleTimeString();

            parsed_date = humanDate + ' ' + humanTime;
        }

        return parsed_date;
    },

    winkstart.friendly_seconds = function(duration, type) {
        var duration = parseFloat(duration);
            seconds = duration % 60,
            minutes = ((duration - seconds) / 60) % 60,
            hours = Math.floor((duration-seconds)/3600),
            type = type || 'numbers';

        if(hours < 10 && type == 'numbers') {
            hours = '0' + hours;
        }
        if(minutes < 10) {
            minutes = '0' + minutes;
        }
        if(seconds < 10) {
            seconds = '0' + seconds;
        }

        if(type == 'verbose') {
            duration = hours+' hours '+minutes+' minutes and '+seconds+' seconds';
        }
        else {
            duration = hours+':'+minutes+':'+seconds;
        }

        return duration;
    },

    winkstart.link_form = function(html){
        $('input', html).bind('change.link keyup.link focus.link', function() {
            var input = $(this),
            	name = input.attr('name'),
                type = input.attr('type'),
                value = input.val(),
                id = input.attr('id'),
                input_fields = $('input[name="' + name + '"]', html);

            if(input_fields.size() > 1) {
                if(type == 'checkbox'){
                    input_fields = input_fields.filter('[value='+value+']');
                    (input.attr('checked')) ? input_fields.attr('checked', 'checked') : input_fields.removeAttr('checked');
                }
                else {
                	$.each(input_fields, function(k, v) {
                		var element = $(v);

                		if(element.attr('id') !== id) {
                			element.val(value);
						}
                	});
                }
            }
            else {
                input.unbind('.link');
            }
        });
    };

    winkstart.tabs = function(buttons_html, tabs_html, advanced) {

        if(advanced) {
            $('.btn', buttons_html).removeClass('activate');
            $('.advanced', buttons_html).addClass('activate');
        } else {
            if(winkstart.config.advancedView) {
                $('.btn', buttons_html).removeClass('activate');
                $('.advanced', buttons_html).addClass('activate');
            } else {
                 tabs_html.hide('blind');
            }
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

    winkstart.accordion = function(html, change_name) {

        function toggle(btn, state) {
            var div = $('#' + btn.data('toggle'));

            if(state) {
                btn.addClass('activated');
                if(change_name != false) {
                    btn.html(_t('config','hide'));
                }
                div.slideDown();
            } else {
                btn.removeClass('activated');
                if(change_name != false) {
                    btn.html(_t('config','show'));
                }
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
                btn.html(_t('config','show_all'));
            } else {
                btn.addClass('activate');
                btn.html(_t('config','hide_all'));
            }
        });

        $('.toggle', html).click(function(ev){
            var btn = $(this);
            ev.preventDefault();

            toggle(btn, !btn.hasClass('activated'));
        });

    };

    winkstart.chart = function(target, data, opt, type) {
        this.target = target;
        this.data = data;
        this.options = {
            seriesDefaults: {
                renderer: jQuery.jqplot.PieRenderer,
                rendererOptions: {
                    showDataLabels: true,
                    dataLabels: 'value',
                    startAngle: -90,
                    padding: 10
                }
            },
            grid: {
                background: 'transparent',
                drawBorder: false,
                shadow: false
            },
            gridPadding: { top: 15, right: 0, bottom: 0, left: 0 },
            legend: {
                show: true,
                location: 'e',
                background: 'transparent',
                border: 'none',
                fontFamily: 'Helvetica',
                fontSize: '8pt'
            }
        };

        $.extend(true, this.options, opt);

        // 'type' not used yet as we only use piecharts for now. To be implemented if other types of charts are needed.
        if(type) {
            this.type = type;
        }

        return this.init();
    };

    winkstart.chart.prototype = {
        init: function() {
            var THIS = this;
            THIS.loadChart(THIS);
        },

        loadChart: function(THIS) {
            switch(THIS.type) {
                case 'line': //TODO: To be implemented if needed
                case 'gauge': //TODO: To be implemented if needed
                default:
                    THIS.chart = jQuery.jqplot(THIS.target, [THIS.data], THIS.options);
                    break;
            }
        },

        setData: function(data, push) {
            if(push) {
                this.data.push(data);
            } else {
                this.data = data;
            }
        },

        setOptions: function(options, ext) {
            if(ext) {
                $.extend(true, this.options, options);
            } else {
                this.options = options;
            }
        },

        refresh: function() {
            this.chart = jQuery.jqplot(THIS.target, [THIS.data], THIS.options);
        }
    };

    winkstart.print_r = function(arr) {

        var arrayToString = function(arr, level) {
                var dumped_text = "",
                    level_padding = "";

                if(!level) level = 0;

                for(var j=0; j< level+1; j++) level_padding += "    ";

                if(typeof(arr) == 'object') {
                    for(var item in arr) {
                        var value = arr[item];

                        if(typeof(value) == 'object') {
                           dumped_text += level_padding + "'" + item + "': { \n";
                           dumped_text += arrayToString(value, level+1);
                           dumped_text += level_padding + "}\n";
                        } else {
                           dumped_text += level_padding + "'" + item + "': \"" + value + "\"\n";
                        }
                    }
                } else {
                    dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
                }

                return dumped_text;
            },
            str = "";

        str += "<pre style='text-align:left;'>{\n";
        str += arrayToString(arr);
        str += "\n}</pre>";

        return str;
    },

    winkstart.jsonToString = function(obj) {
        return JSON.stringify(obj);
    };

    /* If we want to limit the # of simultaneous request, we can use async.parallelLimit(list_functions, LIMIT_# (ex: 3), callback) */
    winkstart.parallel = function(list_functions, callback) {
        async.parallel(
            list_functions,
            function(err, results) {
                callback(err, results);
            }
        );
    };

	/* Automatically sorts an array of objects. secondArg can either be a custom sort to be applied to the dataset, or a fieldName to sort alphabetically on */
    winkstart.sort = function(dataSet, secondArg) {
		var fieldName = 'name',
    		sortFunction = function(a, b) {
    			var aString = a[fieldName].toLowerCase(),
    				bString = b[fieldName].toLowerCase(),
    				result = (aString > bString) ? 1 : (aString < bString) ? -1 : 0;;

				return result;
    		};

    	if(typeof secondArg === 'function') {
			sortFunction = secondArg;
    	}
    	else if(typeof secondArg === 'string') {
			fieldName = secondArg;
    	}

    	result = dataSet.sort(sortFunction);

		return result;
    };

    winkstart.autoLogout = function() {
        if(!winkstart.config.hasOwnProperty('logout_timer') || winkstart.config.logout_timer > 0) {
             var timerAlert,
                timerLogout,
                wait = winkstart.config.logout_timer || 15 ,
                alertBeforeLogout = 2,
                alertTriggered = false,
                alertDialog,
                logout = function() {
                    winkstart.publish('auth.logout');
                },
                resetTimer = function() {
                    clearTimeout(timerAlert);
                    clearTimeout(timerLogout);

                    if(alertTriggered) {
                        alertTriggered = false;

                        alertDialog.dialog('close').remove();
                    }

                    timerAlert=setTimeout(function() {
                        alertTriggered = true;

                        alertDialog = winkstart.alert(_t('config', 'alert_logout'));
                    }, 60000*(wait-alertBeforeLogout));

                    timerLogout=setTimeout(function() {
                        logout();
                    }, 60000*wait);
                };

            document.onkeypress = resetTimer;
            document.onmousemove = resetTimer;

            resetTimer();
        }
	};

})(window.winkstart = window.winkstart || {}, window.amplify = window.amplify || {}, jQuery);
