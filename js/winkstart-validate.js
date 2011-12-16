(function(winkstart, amplify, undefined) {

    winkstart.validate = {
        set: function(items, _parent) {
            var THIS = this,
                parent = _parent || $('body');

            if($.isArray(items)) {
                $.each(items, function(key, val) {
                    if('name' in val && 'regex' in val) {
                        THIS.add($(val.name, parent), val.regex);   
                    }
                });
            }
            else {
                if('name' in items && 'regex' in items) {
                    THIS.add($(items.name, parent), items.regex);
                }
            }
        },

        is_valid: function(items, _parent, success, failure) {
            var parent,
                invalid_num,
                ret;

            if(typeof _parent == 'function') {
                failure = success;
                success = _parent;
                _parent = null;
            }

            parent = _parent || $('body');

            if($.isArray(items)) {
                invalid_num = items.length;
                
                $.each(items, function(key, val) {
                    if('name' in val && 'regex' in val) {
                        ret = $(val.name, parent)
                                  .trigger('keyup')
                                  .parents('.validated')
                                  .hasClass('valid');

                        if(ret) {
                            invalid_num--;
                        }
                    }
                });
            }
            else {
                invalid_num = 1;
                if('name' in items && 'regex' in items) {
                    ret = $(items.name, parent)
                              .trigger('keyup')
                              .parents('.validated')
                              .hasClass('valid');
                    
                    if(ret) {
                        invalid_num--;
                    }
                }
            }

            if(invalid_num) {
                if(typeof failure == 'function') {
                    failure();
                }
            }
            else {
                if(typeof success == 'function') {
                    success();
                }
            }
        },

        /* Old functions */
        add: function($element, regex) {
            $element.wrap('<span class="validated" />');
            $element.keyup(function() {
                if($element.val().match(regex) == null) {
                    $element.parents('.validated')
                                .removeClass('valid')
                                .addClass('invalid');
                }
                else {
                    $element.parents('.validated')
                                .removeClass('invalid')
                                .addClass('valid');
                }
            });
        },

        save: function($element, regex) {
            $element.trigger('keyup');
        }
    }

})( window.winkstart = window.winkstart || {}, window.amplify = window.amplify || {});
