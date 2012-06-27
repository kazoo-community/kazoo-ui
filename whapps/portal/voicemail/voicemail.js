winkstart.module('userportal', 'voicemail', {
    css: [
        'css/style.css'
    ],

    templates: {
        voicemail: 'tmpl/voicemail.html'
    },

    subscribe: {
        'voicemail.activate': 'activate'
    },

    resources: {
        'vmbox.list': {
            url: '{api_url}/accounts/{account_id}/vmboxes',
            contentType: 'application/json',
            verb: 'GET'
        },
        'vmbox.read': {
            url: '{api_url}/accounts/{account_id}/vmboxes/{vmbox_id}',
            contentType: 'application/json',
            verb: 'GET'
        },
        'vmbox.update': {
            url: '{api_url}/accounts/{account_id}/vmboxes/{vmbox_id}',
            contentType: 'application/json',
            verb: 'POST'
        },
        'message.delete': {
            url: '{api_url}/accounts/{account_id}/vmboxes/{msg_uri}',
            contentType: 'application/json',
            verb: 'DELETE'
        },
        'message.update': {
            url: '{api_url}/accounts/{account_id}/vmboxes/{msg_uri}',
            contentType: 'application/json',
            verb: 'POST'
        }

    }
},
function(args) {
    winkstart.registerResources(this.__whapp, this.config.resources);

    winkstart.publish('whappnav.subnav.add', {
        whapp: 'userportal',
        module: this.__module,
        label: 'My Voicemail',
        icon: 'vmbox',
        weight: '20'
    });
},
{
    activate: function(data) {
        var THIS = this;

        winkstart.getJSON('vmbox.list', {
                crossbar: true,
                account_id: winkstart.apps['userportal'].account_id,
                api_url: winkstart.apps['userportal'].api_url
            },
            function(reply) {
                THIS.page_setup();
                $.each(reply.data, function() {
                    var vmbox_id = this.id;
                    if(this.owner_id == winkstart.apps['userportal'].user_id) {

                        winkstart.getJSON('vmbox.read', {
                                crossbar: true,
                                account_id: winkstart.apps['userportal'].account_id,
                                api_url: winkstart.apps['userportal'].api_url,
                                vmbox_id: vmbox_id
                            },
                            function(reply) {
                                if(reply.data.messages == undefined)
                                    return false;

                                $.each(reply.data.messages, function(index, msg) {
                                    if(this.folder != 'deleted') {
                                        var msg_id = msg.media_id;
                                        var msg_uri = vmbox_id + '/messages/' + msg_id;

                                        var date = new Date((msg.timestamp - 62167219200)*1000);
                                        var month = date.getMonth() +1;
                                        var year = date.getFullYear();
                                        var day = date.getDate();
                                        var humanDate = month+'/'+day+'/'+year;

                                        var humanTime = date.toLocaleTimeString();

                                        var humanFullDate = humanDate + " " + humanTime;

                                        winkstart.table.voicemail.fnAddData(['0', index, vmbox_id, msg.caller_id_number, humanFullDate, msg.folder, msg_uri, msg_uri]);
                                    }
                                }
                            )
                        });
                    }
                });
            }
        );

        winkstart.publish('layout.updateLoadedModule', {
            label: 'My Voicemail',
            module: this.__module
            });
    },

    setup_table: function() {
        var THIS = this;
        var columns = [
            { 'sTitle': '<div style="margin-left: 8px;"><input type="checkbox" id="select_all_voicemails"/></div>',
              'sWidth': '40px',
              'bSortable': false,
              'fnRender': function(obj) {
                  var msg_uri = obj.aData[obj.iDataColumn];
                  return '<input type="checkbox" class="select-checkbox" msg_uri="'+ msg_uri  +'"/>';
              }},
            { 'sTitle': 'Message Index',
              'bSearchable': false,
              'bVisible': false },
            { 'sTitle': 'Voicemail Box ID',
              'bSearchable': false,
              'bVisible': false },
            { 'sTitle': 'Caller ID' },
            { 'sTitle': 'Date' },
            { 'sTitle': 'Status' },
            { 'sTitle': 'Listen',
              'bSortable': false,
              'fnRender': function(obj) {
                  var msg_uri = obj.aData[obj.iDataColumn];
                  return '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="150" height="19">' +
                         '<param name="quality" value="high" />' +
                         '<param name="wmode" value="transparent">' +
                         '<param name="menu" value="false" />' +
                         '<embed src="whapps/userportal/voicemail/assets/flash/xspf_player.swf?' +
                         'player_mode=mini&skin_mode=on&song_url=' + THIS.voicemail_uri(msg_uri) +
                         '&song_title=voicemail&autoload=1&bg_color=595959&txt_color=BCB5AB&button_color=BCB5AB"type="application/x-shockwave-flash" width="150" height="17"></embed>' +
                         '</object>';
            }},
            { 'sTitle': 'Actions',
              'sWidth': '70px',
              'bSortable': false,
              'fnRender': function(obj) {
                  var msg_uri = obj.aData[obj.iDataColumn];
                  return '<a href="' + THIS.voicemail_uri(msg_uri)  + '"><span class="icon medium download" alt="Download"/></a><span id="'+msg_uri+'" class="icon medium trash clickable delete_message" alt="Delete"/></a>';
            }}
        ];

        winkstart.table.create('voicemail', $('#voicemail-grid'), columns, {}, {
            sDom: 'frtlip'
        });
		$.fn.dataTableExt.afnFiltering.pop();
    },

    page_setup: function() {
        var THIS = this;
        $('#ws-content').empty();
        var html = THIS.templates.voicemail.tmpl({}).appendTo( $('#ws-content') );


        $(html).delegate('.delete_message','click',function() {
            if(confirm('Are you sure that you want to delete this voicemail?')) {
                var tabId = $(this).attr('id').split(/[\/]+/);
                var vmbox_id = tabId[0];
                var msg_id = tabId[2];
                var row = $(this).parents('tr')[0];

                winkstart.getJSON('vmbox.read', {
                        crossbar: true,
                        account_id: winkstart.apps['userportal'].account_id,
                        api_url: winkstart.apps['userportal'].api_url,
                        vmbox_id: vmbox_id
                    },
                    function(reply) {
                        if(reply.data.messages == undefined) {
                            return false;
                        }
                        var msg_index = winkstart.table.voicemail.fnGetData(row, 1);
                        reply.data.messages[msg_index].folder = 'deleted';

                        winkstart.postJSON('vmbox.update', {
                                crossbar: true,
                                account_id: winkstart.apps['userportal'].account_id,
                                api_url: winkstart.apps['userportal'].api_url,
                                vmbox_id: vmbox_id,
                                data: reply.data
                            },
                            function() {
                                winkstart.table.voicemail.fnDeleteRow(row);
                            }
                        );
                });
            }
        });

        $('#save-voicemail-link, #delete-voicemail-link, #new-voicemail-link').click(function() {
            var vmboxes, action = $(this).dataset('action');
            if($('.select-checkbox:checked').size()) {
                if(action == 'delete' && !confirm('Are you sure that you want to delete the selected voicemail message(s)?')) {
                    return false;
                }
                vmboxes = {};
                $('.select-checkbox:checked').each(function() {
                    var row = $(this).parents('tr')[0],
                        vmbox_id = winkstart.table.voicemail.fnGetData(row, 2);

                    if(vmboxes[vmbox_id] == undefined) {
                        vmboxes[vmbox_id] = [row];
                    }
                    else {
                        vmboxes[vmbox_id].push(row);
                    }
                });

                $.each(vmboxes, function(key, rows) {
                    winkstart.getJSON('vmbox.read', {
                            crossbar: true,
                            account_id: winkstart.apps['userportal'].account_id,
                            api_url: winkstart.apps['userportal'].api_url,
                            vmbox_id: key
                        },
                        function(reply) {
                            var msg_index;
                            if(reply.data.messages == undefined) {
                                return false;
                            }

                            $.each(rows, function(i, row) {
                                msg_index = winkstart.table.voicemail.fnGetData(row, 1);

                                if(action == 'save') {
                                    reply.data.messages[msg_index].folder = 'saved';
                                }
                                else if(action == 'delete') {
                                    reply.data.messages[msg_index].folder = 'deleted';
                                } else if(action == 'new') {
                                    reply.data.messages[msg_index].folder = 'new';
                                }
                            }
                        );

                        winkstart.postJSON('vmbox.update', {
                                crossbar: true,
                                account_id: winkstart.apps['userportal'].account_id,
                                api_url: winkstart.apps['userportal'].api_url,
                                vmbox_id: key,
                                data: reply.data
                            },
                            function() {
                                $.each(rows, function(i, row) {
                                    if(action == "save") {
                                        winkstart.table.voicemail.fnUpdate('saved', row, 5);
                                    }
                                    else if(action == "new") {
                                        winkstart.table.voicemail.fnUpdate('new', row, 5);
                                    }
                                    else if(action == "delete") {
                                        //winkstart.table.voicemail.fnUpdate('deleted', row, 6);
                                        winkstart.table.voicemail.fnDeleteRow(row);
                                    }
                                });
                                $('.select-checkbox', '#voicemail-grid').prop('checked', false);
                                $('#select_all_voicemails', '#voicemail-grid').prop('checked', false);
                            }
                        );
                    });
                });
            }
        });

        THIS.setup_table();

        $('#select_all_voicemails', '#voicemail-grid').change(function() {
            $('.select-checkbox', '#voicemail-grid').prop('checked', $('#select_all_voicemails').attr('checked') != undefined);
        });

    },

    voicemail_uri: function(msg_uri) {
        return winkstart.apps['userportal'].api_url + '/accounts/' +
               winkstart.apps['userportal'].account_id + '/vmboxes/' +
               msg_uri + '/raw?auth_token=' + winkstart.apps['userportal'].auth_token;
    }

});
