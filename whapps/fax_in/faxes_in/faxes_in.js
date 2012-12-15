winkstart.module('fax_in', 'faxes_in', {
        css: [
            'css/faxes_in.css'
        ],

        templates: {
            faxes_in: 'tmpl/faxes_in.html'
        },

        subscribe: {
            'faxes_in.activate' : 'activate'
        },

        resources: {
            'fax_in_account.get': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'user_settings.get': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
			'user_settings.post': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'POST'
            },
            'fax_in.list': {
                url: '{api_url}/accounts/{account_id}/faxes/incoming',
                contentType: 'application/json',
                verb: 'GET'
            },
			'fax_in.raw': {
                url: '{api_url}/accounts/{account_id}/faxes/incoming/{fax_id}/raw',
                contentType: 'application/json',
                verb: 'GET'
            },
			'callflows_list.get': {
                url: '{api_url}/accounts/{account_id}/callflows',
                contentType: 'application/json',
                verb: 'GET'
            },
			'callflow.get': {
                url: '{api_url}/accounts/{account_id}/callflows/{callflow_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
			'callflow.put': {
                url: '{api_url}/accounts/{account_id}/callflows',
                contentType: 'application/json',
                verb: 'PUT'
            },
			'callflow.post': {
                url: '{api_url}/accounts/{account_id}/callflows/{callflow_id}',
                contentType: 'application/json',
                verb: 'POST'
            }
        }
    },

    function(args) {
        var THIS = this;
		
        winkstart.registerResources(THIS.__whapp, THIS.config.resources);
		
		winkstart.publish('whappnav.subnav.add', {
			whapp: 'fax_in',
			module: this.__module,
			label: 'Received Faxes',
			icon: 'device', /* Check the icon.css file in whapps/core/layout/css */
			weight: '00'
		});
    },

    {
        get_settings: function(success, error) {
            winkstart.request('user_settings.get', {
                    api_url: winkstart.apps['fax_in'].api_url,
                    account_id: winkstart.apps['fax_in'].account_id,
                    user_id: winkstart.apps['fax_in'].user_id
                },
                function(_data, status) {
                    if(typeof success === 'function') {
                        success(_data);
                    }
                },
                function(_data, status) {
                    if(typeof error === 'function') {
                        error(_data);
                    }
                }
            );
        },

        activate: function(parent) {
            var THIS = this;
		
            THIS.render_faxes_in();
        },

        render_faxes_in: function(parent) {
            var THIS = this,
            parent = parent || $('#ws-content');
						
            THIS.get_settings(function(_data_settings) {
                faxes_html_in = THIS.templates.faxes_in.tmpl(_data_settings);	
		$.datepicker.setDefaults(
			$.extend($.datepicker.regional["ru"])
		);
	
		$( "#start_date" , faxes_html_in).datepicker({
            defaultDate: "-7",
            changeMonth: true,
            numberOfMonths: 1,
			dateFormat: "dd M yy",
            onClose: function( selectedDate ) {
                $( "#to" ).datepicker( "option", "minDate", selectedDate );
            }
        });
        $( "#end_date" , faxes_html_in).datepicker({
            defaultDate: "+1",
            changeMonth: true,
            numberOfMonths: 1,
			dateFormat: "dd M yy",
            onClose: function( selectedDate ) {
                $( "#from" ).datepicker( "option", "maxDate", selectedDate );
            }
        });
			
			$( "#start_date" , faxes_html_in).change( function () { list_update(); } )
			$( "#end_date" , faxes_html_in).change( function () { list_update(); } )
			$( "#cancel_date", faxes_html_in).click( function () {
			$( "#start_date" , faxes_html_in).val("");
			$( "#end_date" , faxes_html_in).val("");
			list_update();
			});
			$('#searchLink', faxes_html_in).click(function() {
				winkstart.table.user_fax.fnClearTable();
            });
			$( "#button_save_email", faxes_html_in).click( function () { fax_callflow_write();	})
			
			function fax_callflow_write() {
				THIS.callflow_write(faxes_html_in);
			}
			
			function list_update() {
				THIS.list_by_date("change",faxes_html_in);
			}
				
                (parent)
                    .empty()
                    .append(faxes_html_in);

                //Hack to display columns properly
                $('.dataTables_scrollHeadInner, .dataTables_scrollHeadInner table', faxes_html_in).attr('style', 'width:100%');
		
		THIS.list_by_date();
		THIS.callflow_read(faxes_html_in);
            });
        },
		
        
		callflow_read: function(faxes_html_in) {
			winkstart.request('fax_account.get', { // Узнаю номер _data.data.caller_id.default.number
                    account_id: winkstart.apps['fax'].account_id,
                    api_url: winkstart.apps['fax'].api_url, 
                    },
                    function(_data, status) {
                       if(status == 200) {
					   var number_default = _data.data.caller_id.default.number;
					   	$('#phone_fax', faxes_html_in).val(number_default);
						$('#user_id', faxes_html_in).val(_data.data.id);
					 	winkstart.request(true, 'callflows_list.get', {		
							account_id: winkstart.apps['fax'].account_id,
							api_url: winkstart.apps['fax'].api_url
							},
							function(_data, status) {
							if(status == 200) {
								$.each(_data.data, function() {
								if ( this.numbers == number_default ) {
								var callflow_id = this.id;
									winkstart.request(true, 'callflow.get', {		
										account_id: winkstart.apps['fax'].account_id,
										api_url: winkstart.apps['fax'].api_url,
										callflow_id: callflow_id
										},
										function(_data, status) {
										if(status == 200) {
											if (_data.data.flow.module == "receive_fax"){
												winkstart.request(true, 'user_settings.get', {		
													account_id: winkstart.apps['fax'].account_id,
													api_url: winkstart.apps['fax'].api_url,
													user_id: _data.data.flow.data.owner_id
													},
													function(_data, status) {
														if(status == 200) {
															if ( _data.data.email != " " ) {
															$('#email_check', faxes_html_in).attr('checked', 'checked');
															}
															$('#email_check_hide', faxes_html_in).attr('checked', 'checked'); // Наличие CallFlow
															$('#email_fax', faxes_html_in).val(_data.data.email);
														}
													},
													function(_data, status) {
														if(typeof error == 'function') {
															error(_data, status, 'create');
														}
													}
												)
											
											}
										}
										},
										function(_data, status) {
										if(typeof error == 'function') {
											error(_data, status, 'create');
											}
										}
									); 
								}
								});
							}
							},
							function(_data, status) {
								if(typeof error == 'function') {
									error(_data, status, 'create');
								}
							}
						); 
                      }
                    },
                    function(_data, status) {
                        if(typeof error == 'function') {
                            error(_data, status, 'create');
                        }
                    }
                );
		},
		
		callflow_write: function(faxes_html_in) {
						
			if ( $('#email_check_hide', faxes_html_in).attr('checked') == "checked" || $('#email_check', faxes_html_in).attr('checked') != "checked" || $(		'#email_fax', faxes_html_in).val() == "" ) {
				if ( $('#email_fax', faxes_html_in).val() != "") {
					user_email = {
						email: $('#email_fax', faxes_html_in).val()
					}
				}
				else {
					user_email = {
						email: " "
					}
				}
				winkstart.request(true, 'user_settings.get', {	
					account_id: winkstart.apps['fax'].account_id,
					api_url: winkstart.apps['fax'].api_url,
					user_id: winkstart.apps['fax_in'].user_id
					},
					function(_data, status) {
						if(status == 200) {
							winkstart.request(true, 'user_settings.post', {	
							account_id: winkstart.apps['fax'].account_id,
							api_url: winkstart.apps['fax'].api_url,
							user_id: winkstart.apps['fax_in'].user_id,
							data: $.extend(true, {}, _data.data, user_email)
							},
								function(_data, status) {
									winkstart.alert('info', 'Account Email address updated!');
								},
								function(_data, status) {
									if(typeof error == 'function') {
									error(_data, status, 'create');
								}
							}
						)}
					},
					function(_data, status) {
						if(typeof error == 'function') {
							error(_data, status, 'create');
						}
					}
				)						
			}
			else {
				var phone = $('#phone_fax', faxes_html_in).val();
				winkstart.request(true, 'callflow.put', {	
							account_id: winkstart.apps['fax'].account_id,
							api_url: winkstart.apps['fax'].api_url,
							data: { 
								"numbers": [phone],
								"flow": { data: {"owner_id": winkstart.apps['fax_in'].user_id }, "module": "receive_fax", "children":{}}
								}
							},
							function(_data, status) {
							if(status == 201) {
							}
							},
							function(_data, status) {
								if(typeof error == 'function') {
									error(_data, status, 'create');
											}
							}
					);
			}
		},
		
		list_by_date: function(a, faxes_html_in) {
            var THIS = this;
			if ( a == "change" ) { winkstart.table.user_fax_in.fnClearTable(); }
			start_date1 = $( "#start_date" , faxes_html_in).val();
			end_date1 = $( "#end_date" , faxes_html_in).val();
			if (start_date1 == "") {
			start_date = new Date();
			start_date.setDate(start_date.getDate() - 10);			
			}
			else {
			start_date = new Date(start_date1);
			}
			if (end_date1 == "") {
			end_date = new Date();
			end_date.setDate(end_date.getDate() + 1);			
			}
			else {
			end_date = new Date(end_date1);
			end_date.setDate(end_date.getDate() + 1);
			}
		
            winkstart.request('fax_in.list', {
                    account_id: winkstart.apps['fax_in'].account_id,
                    api_url: winkstart.apps['fax_in'].api_url,
                    user_id: winkstart.apps['fax_in'].user_id //,
                  //  created_from: start_date,
                 //   created_to: end_date
                },
                function(_data, status) {
					var created_time;
                    var tab_data_in = [];
					var tmp = 0;
					var tmp_status = "completed"
                    $.each(_data.data, function() {
						
							created_time = new Date();
							created_time = new Date(created_time.setTime(this.timestamp / 1000));
							var month = created_time.getMonth()+1 < 10 ? '0'+(created_time.getMonth()+1) : created_time.getMonth()+1;
							var day = created_time.getDate() < 10 ? '0'+created_time.getDate() : created_time.getDate();
							var hour = created_time.getHours()+1 < 10 ? '0'+(created_time.getHours()) : created_time.getHours();
							var minute = created_time.getMinutes() < 10 ? '0'+created_time.getMinutes() : created_time.getMinutes();
						
						if (created_time <= end_date && created_time >= start_date) {
							
							created_time1 = day + '.' + month + '.'  + created_time.getFullYear() + ' / ' + hour + ':' + minute;
						   
						   fax_in_link = winkstart.apps['fax_in'].api_url + '/accounts/' + winkstart.apps['fax_in'].account_id + '/faxes/incoming/' + this.id + '/attachment?auth_token=' + winkstart.apps['fax_in'].auth_token;
						   fax_in_link_1 = "<a href='" + fax_in_link + "'><span class='icon medium download' alt='Download' style='background-position: -732px -6px; height: 20px;'/></a>";
						   
                            tab_data_in.push([
                                created_time1,
								this.total_pages,
								fax_in_link_1,
								created_time
                            ]);
							}
              
                    });	
									
               var columns = [
                {
                    'sTitle': 'Date / Time',
                    'sWidth': '450px'
                },

                {
                    'sTitle': 'Pages',
                    'sWidth': '360px'
                },
                {
                    'sTitle': 'Download',
                    'sWidth': '260px'
                },
                {
                    'sTitle': 'Created',
                'bVisible': false
                }
            ];
					if (a == "change") {
					winkstart.table.user_fax_in.destroy();
					}
					
					winkstart.table.create('user_fax_in', $('#user_faxes_in-grid', faxes_html_in), columns, {}, {
                sDom: '<"date">frtlip',
                sScrollY: '222px',
                aaSorting: [[3, 'desc']]
            });
	
                   winkstart.table.user_fax_in.fnAddData(tab_data_in);
					
                    $('.dataTables_scrollHeadInner, .dataTables_scrollHeadInner table').attr('style', 'width:100%');
			});
        }
});
		
function  EmailChange() {
		var a = $("#email_fax").val();
		var b = $("#email_check").attr("checked");
		var x = false;
		if ( a.length >= 7 && b == "checked" ) {
			x = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(a);
			}
		if  (a.length < 7 || b != "checked" || x == false) {
			$("#button_save_email").attr("disabled", "disabled");
			}
		if ( ( x == true  && b == "checked" ) || a == ""  && b != "checked" ) {
			$("#button_save_email").removeAttr("disabled");
			}
		if (b != "checked") {
			$("#email_fax").attr("disabled","disabled");
			}
		if (b == "checked") {
			$("#email_fax").removeAttr("disabled");
			}
		};
