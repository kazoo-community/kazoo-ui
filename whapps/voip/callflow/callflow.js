winkstart.module('voip', 'callflow', {
        css: [
            'css/style.css',
            'css/popups.css',
            'css/two_columns.css',
            'css/callflow.css'
        ],

        templates: {
            callflow: 'tmpl/callflow.html',
            callflow_main: 'tmpl/callflow_main.html',
            branch: 'tmpl/branch.html',
            tools: 'tmpl/tools.html',
            root: 'tmpl/root.html',
            node: 'tmpl/node.html',
            num_row: 'tmpl/num_row.html',
            add_number: 'tmpl/add_number.html',
            edit_dialog: 'tmpl/edit_dialog.html',
            two_column: 'tmpl/two_column.html',
            ring_group_dialog: 'tmpl/ring_group_dialog.html'
        },

        elements: {
            flow: '#ws_cf_flow',
            tools: '#ws_cf_tools',
            save: '#ws_cf_save',
            buf: '#ws_cf_buf'
        },

        subscribe: {
            'callflow.activate' : 'activate',
            'callflow.list-panel-click' : 'editCallflow',
            'callflow.edit-callflow' : 'editCallflow',
            'callflow.define_callflow_nodes': 'define_callflow_nodes'
        },

        resources: {
            'callflow.list': {
                url: '{api_url}/accounts/{account_id}/callflows',
                contentType: 'application/json',
                verb: 'GET'
            },
            'callflow.get': {
                url: '{api_url}/accounts/{account_id}/callflows/{callflow_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'callflow.create': {
                url: '{api_url}/accounts/{account_id}/callflows',
                contentType: 'application/json',
                verb: 'PUT'
            },
            'callflow.update': {
                url: '{api_url}/accounts/{account_id}/callflows/{callflow_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'callflow.delete': {
                url: '{api_url}/accounts/{account_id}/callflows/{callflow_id}',
                contentType: 'application/json',
                verb: 'DELETE'
            }
        }
    },
    function (args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);

        winkstart.publish('subnav.add', {
            whapp: 'voip',
            module: THIS.__module,
            label: 'Callflows',
            icon: 'callflow',
            weight: '50'
        });
    },
    {
        actions: {},

        activate: function () {
            var THIS = this;

            $('#ws-content').empty();
            THIS.templates.callflow_main.tmpl({}).appendTo($('#ws-content'));

            THIS.renderList(function() {
                THIS.templates.callflow.tmpl(THIS.config.elements).appendTo($('#callflow-view'));
            });

            winkstart.publish('callflow.define_callflow_nodes', THIS.actions);

            $(this.config.elements.save).click(function() {
                THIS.save();
            }).hover(function() {
                    $(this).addClass('active');
                },
                function() {
                    $(this).removeClass('active');
                }
            );
        },

        editCallflow: function(data) {
            var THIS = this;

            THIS._resetFlow();

            if(data && data.id) {
                winkstart.getJSON('callflow.get', {
                        crossbar: true,
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        callflow_id: data.id
                    },
                    function(json) {
                        THIS._resetFlow();
                        THIS.flow.id = json.data.id;
                        THIS.flow.caption_map = json.data.metadata;

                        if(json.data.flow.module != undefined) {
                            THIS.flow.root = THIS.buildFlow(json.data.flow, THIS.flow.root, 0, '_');
                        }

                        THIS.flow.numbers = json.data.numbers || [];
                        THIS.renderFlow();
                    }
                );
            }
            else {
                THIS._resetFlow();
                THIS.renderFlow();
            }

            THIS.renderTools();
        },

        buildFlow: function (json, parent, id, key) {
            var THIS = this,

            branch = THIS.branch(THIS.construct_action(json));

            branch.data.data = ('data' in json) ? json.data : {};
            branch.id = ++id;
            branch.key = key;

            branch.caption = THIS.actions[branch.actionName].caption(branch, THIS.flow.caption_map);

            if('key_caption' in THIS.actions[parent.actionName]) {
                branch.key_caption = THIS.actions[parent.actionName].key_caption(branch, THIS.flow.caption_map);
            }

            $.each(json.children, function(key, child) {
                branch = THIS.buildFlow(child, branch, id, key);
            });

            parent.addChild(branch);

            return parent;
        },

        construct_action: function(json) {
            var action = '';

            if('data' in json) {
                if('id' in json.data) {
                    action = 'id=*,';
                }

                if('action' in json.data) {
                    action += 'action=' + json.data.action + ',';
                }
            }

            if(action != '') {
                action = '[' + action.replace(/,$/, ']');
            }
            else {
                action = '[]';
            }

            return json.module + action;
        },

        renderFlow: function() {
            var target = $(this.config.elements.flow).empty();

            target.append(this._renderFlow());
        },

        // Create a new branch node for the flow
        branch: function(actionName) {
            var THIS = this;

            function branch(actionName) {
                var that = this;
                this.id = -1;
                this.actionName = actionName;
                this.module = THIS.actions[this.actionName].module;
                this.key = '_';
                this.parent = null;
                this.children = {};
                this.data = {
                    data: $.extend(true, {}, THIS.actions[this.actionName].data)
                };
                this.caption = '';
                this.key_caption = '';

                this.potentialChildren = function() {
                    var list = [];

                    for(var i in THIS.actions) {
                        if(THIS.actions[i].isUsable) {
                            list[i] = i;
                        }
                    }

                    for(var i in THIS.actions[this.actionName].rules) {
                        var rule = THIS.actions[this.actionName].rules[i];

                        switch (rule.type) {
                            case 'quantity':
                                if(THIS._count(this.children) >= rule.maxSize) {
                                    list = [];
                                }
                                break;
                        }
                    }

                    return list;
                }

                this.contains = function(branch) {
                    var toCheck = branch;

                    while(toCheck.parent) {
                        if(this.id == toCheck.id) {
                            return true;
                        }
                        else {
                            toCheck = toCheck.parent;
                        }
                    }

                    return false;
                }

                this.removeChild = function(branch) {
                    $.each(this.children, function(i, child) {
                        if(child.id == branch.id) {
                            delete that.children[i];
                        }
                    });
                }

                this.addChild = function(branch) {
                    if(!(branch.actionName in this.potentialChildren())) {
                        return false;
                    }

                    if(branch.contains(this)) {
                        return false;
                    }

                    if(branch.parent) {
                        branch.parent.removeChild(branch);
                    }

                    branch.parent = this;

                    this.children[THIS._count(this.children)] = branch;

                    return true;
                }

                this.getMetadata = function(key) {
                    var value;

                    if('data' in this.data && key in this.data.data) {
                        value = this.data.data[key];

                        return (value == 'null') ? null : value;
                    }

                    return false;
                }

                this.setMetadata = function(key, value) {
                    if(!('data' in this.data)) {
                        this.data.data = {};
                    }

                    this.data.data[key] = (value == null) ? 'null' : value;
                }

                this.deleteMetadata = function(key) {
                    if('data' in this.data && key in this.data.data) {
                        delete node.data.data[key];
                    }
                }

                this.index = function (index) {
                    this.id = index;

                    $.each(this.children, function() {
                        index = this.index(index+1);
                    });

                    return index;
                }

                this.nodes = function() {
                    var nodes = {};

                    nodes[this.id] = this;

                    $.each(this.children, function() {
                        var buf = this.nodes();

                        $.each(buf, function() {
                            nodes[this.id] = this;
                        });
                    });

                    return nodes;
                }

                this.serialize = function () {
                    var json = $.extend(true, {}, this.data);

                    json.module = this.module;

                    json.children = {};

                    $.each(this.children, function() {
                        json.children[this.key] = this.serialize();
                    });

                    return json;
                }
            }

            return new branch(actionName);
        },

        _count: function(json) {
            var count = 0;

            $.each(json, function() {
                count++;
            });

            return count;
        },

        categories: { },

        flow: { },

        _resetFlow: function() {
            var THIS = this;

            THIS.flow = {};
            THIS.flow.root = THIS.branch('root');    // head of the flow tree
            THIS.flow.root.key = 'flow';
            THIS.flow.numbers = [];
            THIS.flow.caption_map = {};
            THIS._formatFlow();
        },

        _formatFlow: function() {
            var THIS = this;

            THIS.flow.root.index(0);
            THIS.flow.nodes = THIS.flow.root.nodes();
        },

        _renderFlow: function() {
            var THIS = this;

            THIS._formatFlow();

            var layout = THIS._renderBranch(THIS.flow.root);

            $('.node', layout).hover(function() {
                    $(this).addClass('over');
                },
                function() {
                    $(this).removeClass('over');
                }
            );

            $('.node', layout).each(function() {
                var node = THIS.flow.nodes[$(this).attr('id')],
                    $node = $(this),
                    node_html;

                if (node.actionName == 'root') {
                    $node.removeClass('icons_black root');
                    node_html = THIS.templates.root.tmpl({});


                    for(var x, size = THIS.flow.numbers.length, j = Math.floor((size) / 2) + 1, i = 0; i < j; i++) {
                        x = i * 2;
                        THIS.templates.num_row.tmpl({
                            numbers: THIS.flow.numbers.slice(x, (x + 2 < size) ? x + 2 : size)
                        }).appendTo($('.content', node_html));
                    }

                    $('.number_column.empty', node_html).click(function() {
                        var popup_html = THIS.templates.add_number.tmpl({}),
                            popup;

                        popup = winkstart.dialog(popup_html, {
                                title: 'Add number'
                        });

                        $('#add_number_text', popup).blur();

                        $('button.add_number', popup).click(function(event) {
                            event.preventDefault();
                            var number = $('#add_number_text', popup).val();
                            if(number == '' && !confirm('Are you sure that you want to add an empty number?')) {
                                return;
                            }
                            THIS.flow.numbers.push(number);

                            popup.dialog('close');

                            THIS.renderFlow();
                        });

                        $('#create_no_match', popup).click(function(event) {
                            event.preventDefault();
                            THIS.flow.numbers.push('no_match');

                            popup.dialog('close');

                            THIS.renderFlow();
                        });
                    });

                    $('.number_column .delete', node_html).click(function() {
                        var number = $(this).parent('.number_column').dataset('number'),
                            index = $.inArray(number, THIS.flow.numbers);

                        if(index >= 0) {
                            THIS.flow.numbers.splice(index, 1);
                        }

                        THIS.renderFlow();
                    });

                    $('.bottom_bar .save', node_html).click(function() {
                        THIS.save();
                    });

                    $('.bottom_bar .delete', node_html).click(function() {
                        winkstart.deleteJSON('callflow.delete', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url,
                                callflow_id: THIS.flow.id
                            },
                            function() {
                                $('#ws_cf_flow').empty();
                                THIS.renderList();
                                THIS._resetFlow();
                            }
                        );
                    });
                }
                else {
                    node_html = THIS.templates.node.tmpl({
                        node: node,
                        callflow: THIS.actions[node.actionName]
                    });

                    $('.module', node_html).click(function() {
                        THIS.actions[node.actionName].edit(node, function() {
                            THIS.renderFlow();
                        });
                    });
                }

                $(this).append(node_html);

                $(this).droppable({
                    drop: function (event, ui) {
                        var target = THIS.flow.nodes[$(this).attr('id')],
                            action;

                        if (ui.draggable.hasClass('action')) {
                            action = ui.draggable.attr('name'),

                            branch = THIS.branch(action);
                            branch.caption = THIS.actions[action].caption(branch, THIS.flow.caption_map);

                            if (target.addChild(branch)) {
                                if(branch.parent && ('key_caption' in THIS.actions[branch.parent.actionName])) {
                                    branch.key_caption = THIS.actions[branch.parent.actionName].key_caption(branch, THIS.flow.caption_map);

                                    THIS.actions[branch.parent.actionName].key_edit(branch, function() {
                                        THIS.actions[action].edit(branch, function() {
                                            THIS.renderFlow();
                                        });
                                    });
                                }
                                else {
                                    THIS.actions[action].edit(branch, function() {
                                        THIS.renderFlow();
                                    });
                                }

                                //This is just in case something goes wrong with the dialog
                                THIS.renderFlow();
                            }
                        }

                        if (ui.draggable.hasClass('node')) {
                            var branch = THIS.flow.nodes[ui.draggable.attr('id')];

                            if (target.addChild(branch)) {
                                // If we move a node, destroy its key
                                branch.key = '_';

                                if(branch.parent && ('key_caption' in THIS.actions[branch.parent.actionName])) {
                                    branch.key_caption = THIS.actions[branch.parent.actionName].key_caption(branch, THIS.flow.caption_map);
                                }

                                ui.draggable.remove();
                                THIS.renderFlow();
                            }
                        }
                    }
                });

                // dragging the whole branch
                $(this).draggable({
                    start: function () {
                        var children = $(this).next(),
                            t = children.offset().top - $(this).offset().top,
                            l = children.offset().left - $(this).offset().left;

                        THIS._enableDestinations($(this));

                        $(this).attr('t', t); $(this).attr('l', l);
                    },
                    drag: function () {
                        var children = $(this).next(),
                            t = $(this).offset().top + parseInt($(this).attr('t')),
                            l = $(this).offset().left + parseInt($(this).attr('l'));

                        children.offset({ top: t, left: l });
                    },
                    stop: function () {
                        THIS._disableDestinations();

                        THIS.renderFlow();
                    }
                });
            });

            $('.node-options .delete', layout).click(function() {
                var node = THIS.flow.nodes[$(this).attr('id')];

                if (node.parent) {
                    node.parent.removeChild(node);

                    THIS.renderFlow();
                }
            });

            return layout;
        },

        _renderBranch: function(branch) {
            var THIS = this,
                flow = THIS.templates.branch.tmpl({
                    node: branch,
                    display_key: branch.parent && ('key_caption' in THIS.actions[branch.parent.actionName])
                }),
                children;

            if(branch.parent && ('key_edit' in THIS.actions[branch.parent.actionName])) {
                $('.div_option', flow).click(function() {
                    THIS.actions[branch.parent.actionName].key_edit(branch, function() {
                        THIS.renderFlow();
                    });
                });
            }

            // This need to be evaluated before the children start adding content
            children = $('.children', flow);

            $.each(branch.children, function() {
                children.append(THIS._renderBranch(this));
            });

            return flow;
        },

        renderTools: function() {
            var THIS = this,
                buf = $(THIS.config.elements.buf),
                target,
                tools;

            /* Don't add categories here, this is just a hack to order the list on the right */
            THIS.categories = {
                'Basic': [],
                'Advanced': []
            };

            $.each(THIS.actions, function(i, data) {
                if('category' in data) {
                    data.category in THIS.categories ? true : THIS.categories[data.category] = [];
                    THIS.categories[data.category].push(i);
                }
            });

            tools = THIS.templates.tools.tmpl({
                categories: THIS.categories,
                nodes: THIS.actions
            });

            $('.content', tools).hide();

            // Set the basic drawer to open
            $('#basic', tools).removeClass('inactive').addClass('active');
            $('#basic .content', tools).show();

            $('.category .open', tools).click(function () {
                var current = $(this);

                $('.category .content', tools).hide();
                $('.category', tools).removeClass('active').addClass('inactive');

                $(this).parent('.category').removeClass('inactive').addClass('active');
                $(this).siblings('.content').show();
            });

            $('.tool', tools).hover(
                function () {
                    $(this).addClass('active');
                    $('.tool_name', '#callflow-view').removeClass('active');
                    $('.tool_name', $(this)).addClass('active');
                    $(this).attr('help') ? $('#help_box', tools).html($(this).attr('help')) : true;
                },
                function () {
                    $('#help_box', tools).html('Drag the following elements and drop them on a callflow item!');
                    $(this).removeClass('active');
                }
            );

            function action (el) {
                el.draggable({
                    start: function () {
                        var clone = $(this).clone();

                        THIS._enableDestinations($(this));

                        action(clone);
                        clone.addClass('inactive');
                        clone.insertBefore($(this));

                        $(this).addClass('active');
                    },
                    drag: function () {
                    },
                    stop: function () {
                        THIS._disableDestinations();
                        $(this).prev().removeClass('inactive');
                        $(this).remove();
                    }
                });
            }

            $('.action', tools).each(function() {
                action($(this));
            });

            target = $(THIS.config.elements.tools).empty();
            target.append(tools);

            $('#ws_cf_tools', '#callflow-view').disableSelection();

            $('*[tooltip]', target).each(function() {
                $(this).tooltip({ xMove: -80, yMove: -80, height: '40px', width: '100px' });
            });

        },

        _enableDestinations: function(el) {
            var THIS = this;

            $('.node').each(function () {
                var activate = true,
                    target = THIS.flow.nodes[$(this).attr('id')];

                if (el.attr('name') in target.potentialChildren()) {
                    if (el.hasClass('node') && THIS.flow.nodes[el.attr('id')].contains(target)) {
                        activate = false;
                    }
                }
                else {
                    activate = false;
                }

                if (activate) {
                    $(this).addClass('active');
                }
                else {
                    $(this).addClass('inactive');
                    $(this).droppable('disable');
                }
            });
        },

        _disableDestinations: function() {
            $('.node').each(function () {
                $(this).removeClass('active');
                $(this).removeClass('inactive');
                $(this).droppable('enable');
            });

            $('.tool').removeClass('active');
        },

        save: function() {
            var THIS = this;

            if(THIS.flow.id) {
                winkstart.postJSON('callflow.update', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        callflow_id: THIS.flow.id,
                        data: {
                            numbers: THIS.flow.numbers,
                            flow: (THIS.flow.root.children['0'] == undefined) ? {} : THIS.flow.root.children['0'].serialize()
                        }
                    },
                    function(json) {
                        THIS.renderList();
                        THIS.editCallflow({id: json.data.id});
                    }
                );
            }
            else {
                winkstart.putJSON('callflow.create', {
                        account_id: winkstart.apps['voip'].account_id,
                        api_url: winkstart.apps['voip'].api_url,
                        data: {
                            numbers: THIS.flow.numbers,
                            flow: (THIS.flow.root.children['0'] == undefined) ? {} : THIS.flow.root.children['0'].serialize()
                        }
                    },
                    function(json) {
                        THIS.renderList();
                        THIS.editCallflow({id: json.data.id});
                    }
                );
            }
        },

        renderList: function(callback){
            var THIS = this;

            winkstart.getJSON('callflow.list', {
                    crossbar: true,
                    account_id: winkstart.apps['voip'].account_id,
                    api_url: winkstart.apps['voip'].api_url
                },
                function (data, status) {

                    // List Data that would be sent back from server
                    function map_crossbar_data(crossbar_data){
                        var new_list = [],
                            answer;

                        if(crossbar_data.length > 0) {
                            _.each(crossbar_data, function(elem){
                                if(elem.numbers) {
                                    for(var i = 0; i < elem.numbers.length; i++) {
                                        elem.numbers[i] = elem.numbers[i].replace(/^$/, '(no number)');
                                        elem.numbers[i] = elem.numbers[i].replace(/^no_match$/, 'Catch all');
                                    }
                                }
                                if(elem.featurecode == false) {
                                    new_list.push({
                                        id: elem.id,
                                        title: (elem.numbers) ? elem.numbers.toString() : ''
                                    });
                                }
                            });
                        }

                        new_list.sort(function(a, b) {
                            a.title.toLowerCase() < b.title.toLowerCase() ? answer = -1 : answer = 1;

                            return answer;
                        });

                        return new_list;
                    }

                    var options = {};
                    options.label = 'Callflow Module';
                    options.identifier = 'callflow-module-listview';
                    options.new_entity_label = 'Add Callflow';
                    options.data = map_crossbar_data(data.data);
                    options.publisher = winkstart.publish;
                    options.notifyMethod = 'callflow.list-panel-click';
                    options.notifyCreateMethod = 'callflow.edit-callflow';  /* Edit with no ID = Create */

                    $("#callflow-listpanel").empty();
                    $("#callflow-listpanel").listpanel(options);

                    if(typeof callback == 'function') {
                        callback();
                    }
                }
            );
        },

        define_callflow_nodes: function(callflow_nodes) {
            var THIS = this;

            $.extend(callflow_nodes, {
                'root': {
                    name: 'Root',
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable : 'false'
                },

                'callflow[id=*]': {
                    name: 'Callflow',
                    icon: 'callflow',
                    category: 'Advanced',
                    module: 'callflow',
                    tip: 'Transfer the call to another call flow',
                    data: {
                        id: 'null'
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        var id = node.getMetadata('id');

                        return (id) ? caption_map[id].numbers.toString() : '';
                    },
                    edit: function(node, callback) {
                        winkstart.request(true, 'callflow.list', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html, _data = [];

                                $.each(data.data, function() {
                                    if(!this.featurecode && this.id != THIS.flow.id) {
                                        this.name = (this.numbers) ? this.numbers.toString() : '(no numbers)';

                                        _data.push(this);
                                    }
                                });

                                popup_html = THIS.templates.edit_dialog.tmpl({
                                    objects: {
                                        type: 'callflow',
                                        items: _data,
                                        selected: node.getMetadata('id') || ''
                                    }
                                });

                                $('.submit_btn', popup_html).click(function() {
                                    node.setMetadata('id', $('#object-selector', popup_html).val());

                                    node.caption = $('#object-selector option:selected', popup_html).text();

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                    title: 'Callflow',
                                    beforeClose: function() {
                                        if(typeof callback == 'function') {
                                            callback();
                                        }
                                    }
                                });
                            }
                        );
                    }
                },

                'ring_group[]': {
                    name: 'Ring Group',
                    icon: 'ring_group',
                    category: 'Basic',
                    module: 'ring_group',
                    tip: 'Ring several VoIP or cell phones in order or at the same time',
                    data: {
                        name: ''
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        return node.getMetadata('name') || '';
                    },
                    edit: function(node, callback) {
                        winkstart.request(true, 'device.list', {
                                account_id: winkstart.apps['voip'].account_id,
                                api_url: winkstart.apps['voip'].api_url
                            },
                            function(data, status) {
                                var popup, popup_html, index, endpoints
                                    selected_endpoints = {},
                                    unselected_endpoints = [];

                                if(endpoints = node.getMetadata('endpoints')) {
                                    // We need to translate the endpoints to prevent nasty O(N^2) time complexities,
                                    // we also need to clone to prevent managing of objects
                                    $.each($.extend(true, {}, endpoints), function(i, obj) {
                                        obj.name = 'Undefined';
                                        selected_endpoints[obj.id] = obj;
                                    });

                                    $.each(data.data, function(i, obj) {
                                        if(obj.id in selected_endpoints) {
                                            selected_endpoints[obj.id].name = obj.name;
                                        }
                                        else {
                                            unselected_endpoints.push(obj);
                                        }
                                    });
                                }
                                else {
                                    unselected_endpoints = data.data;
                                }

                                popup_html = THIS.templates.ring_group_dialog.tmpl({
                                    left: {
                                        title: 'Unselected devices',
                                        items: unselected_endpoints
                                    },
                                    right: {
                                        title: 'Selected devices',
                                        items: selected_endpoints
                                    },
                                    form: {
                                        name: node.getMetadata('name') || '',
                                        strategy: {
                                            items: [
                                                {
                                                    id: 'simultaneous',
                                                    name: 'At the same time'
                                                },
                                                {
                                                    id: 'single',
                                                    name: 'In order'
                                                }
                                            ],
                                            selected: node.getMetadata('strategy') || 'simultaneous'
                                        },
                                        timeout: node.getMetadata('timeout') || '30'
                                    }
                                });

                                $('.options .option', popup_html).each(function() {
                                    $(this).tooltip({ attach: $('body'), relative: false });
                                });

                                $('.column.left .options', popup_html).hide();

                                $('.options .option.delay', popup_html).bind('change blur focus', function() {
                                    $(this).parents('li').dataset('delay', $(this).val());
                                });

                                $('.options .option.timeout', popup_html).bind('change blur focus', function() {
                                    $(this).parents('li').dataset('timeout', $(this).val());
                                });

                                $('.submit_btn', popup_html).click(function() {
                                    var name = $('#name', popup_html).val();

                                    endpoints = [];

                                    $('.right .connect li', popup_html).each(function() {
                                        endpoints.push($(this).dataset());
                                    });

                                    node.setMetadata('endpoints', endpoints);
                                    node.setMetadata('name', name);
                                    node.setMetadata('strategy', $('#strategy', popup_html).val());
                                    node.setMetadata('timeout', $('#timeout', popup_html).val());

                                    node.caption = name;

                                    popup.dialog('close');
                                });

                                popup = winkstart.dialog(popup_html, {
                                    title: 'Ring Group',
                                    beforeClose: function() {
                                        if(typeof callback == 'function') {
                                            callback();
                                        }
                                    }
                                });

                                $('.scrollable', popup).jScrollPane({
                                    horizontalDragMinWidth: 0,
                                    horizontalDragMaxWidth: 0
                                });

                                $('.connect', popup).sortable({
                                    connectWith: $('.connect', popup),
                                    zIndex: 2000,
                                    helper: 'clone',
                                    appendTo: $('.wrapper', popup),
                                    scroll: false,
                                    receive: function(ev, ui) {
                                        if($(this).parents('.column').hasClass('left')) {
                                            $('.options', ui.item).hide();
                                            $('.item_name', ui.item).removeClass('right');
                                        }
                                        else {
                                            $('.options', ui.item).show();
                                            $('.item_name', ui.item).addClass('right');
                                        }

                                        $('.scrollable', popup).data('jsp').reinitialise();
                                    },
                                    remove: function(ev, ui) {
                                        $('.scrollable', popup).data('jsp').reinitialise();
                                    }
                                });

                            }
                        );
                    }
                },
                'call_forward[action=activate]': {
                    name: 'Enable call forwarding',
                    icon: 'rightarrow',
                    category: 'Call Forwarding',
                    module: 'call_forward',
                    tip: 'Enable call forwarding (using the last forwaded number)',
                    data: {
                        action: 'activate'
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        return '';
                    },
                    edit: function(node, callback) {
                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                },
                'call_forward[action=deactivate]': {
                    name: 'Disable call forwarding',
                    icon: 'rightarrow',
                    category: 'Call Forwarding',
                    module: 'call_forward',
                    tip: 'Disable call forwarding',
                    data: {
                        action: 'deactivate'
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        return '';
                    },
                    edit: function(node, callback) {
                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                },
                'call_forward[action=update]': {
                    name: 'Update call forwarding',
                    icon: 'rightarrow',
                    category: 'Call Forwarding',
                    module: 'call_forward',
                    tip: 'Update the call forwarding number',
                    data: {
                        action: 'update'
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        return '';
                    },
                    edit: function(node, callback) {
                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                },
                'dynamic_cid[]': {
                    name: 'Dynamic cid',
                    icon: 'rightarrow',
                    category: 'Advanced',
                    module: 'dynamic_cid',
                    tip: 'Set your CallerId by entering it on the phone',
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        return '';
                    },
                    edit: function(node, callback) {
                        if(typeof callback == 'function') {
                            callback();
                        }
                    }
                }
            });

            /* Migration callflows, fixes our goofs. To be removed eventually */
            $.extend(callflow_nodes, {
                'resource[]': {
                    name: 'Resource',
                    icon: 'resource',
                    module: 'resources',
                    data: {},
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '0'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        alert('This callflow is outdated, please resave this callflow before continuing.');
                        return '';
                    },
                    edit: function(node, callback) {
                    }
                },
                'hotdesk[id=*,action=call]': {
                    name: 'Hot Desking',
                    icon: 'v_phone',
                    module: 'hotdesk',
                    data: {
                        action: 'bridge',
                        id: 'null'
                    },
                    rules: [
                        {
                            type: 'quantity',
                            maxSize: '1'
                        }
                    ],
                    isUsable: 'true',
                    caption: function(node, caption_map) {
                        //Migration here:
                        node.setMetadata('action', 'bridge');

                        alert('This callflow is outdated, please resave this callflow before continuing.');
                        return '';
                    },
                    edit: function(node, callback) {
                    }
                }
            });
        }
    }
);
