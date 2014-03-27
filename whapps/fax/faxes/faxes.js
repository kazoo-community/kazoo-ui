winkstart.module('fax', 'faxes', {
        css: [
            'css/faxes.css'
        ],

        templates: {
            faxes: 'tmpl/faxes.html'
        },

        subscribe: {
            'faxes.activate' : 'activate'
        },

        resources: {
            'fax_account.get': {
                url: '{api_url}/accounts/{account_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
          
            'user_settings.get': {
                url: '{api_url}/accounts/{account_id}/users/{user_id}',
                contentType: 'application/json',
                verb: 'GET'
            },
            'fax.list': {
                url: '{api_url}/accounts/{account_id}/faxes/outgoing',
                contentType: 'application/json',
                verb: 'GET'
            },
			'fax.send': {
                url: '{api_url}/accounts/{account_id}/faxes',
                contentType: 'application/json',
                verb: 'PUT'
            }
        }
    },

    function(args) {
        var THIS = this;
		
        winkstart.registerResources(THIS.__whapp, THIS.config.resources);
		
		winkstart.publish('whappnav.subnav.add', {
			whapp: 'fax',
			module: this.__module,
			label: 'Send Faxes',
			icon: 'device', /* Check the icon.css file in whapps/core/layout/css */
			weight: '00'
		});
    },

    {
        get_settings: function(success, error) {
            winkstart.request('user_settings.get', {
                    api_url: winkstart.apps['fax'].api_url,
                    account_id: winkstart.apps['fax'].account_id,
                    user_id: winkstart.apps['fax'].user_id
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
		
            THIS.render_faxes();
        },

        render_faxes: function(parent) {
            var THIS = this,
            parent = parent || $('#ws-content');
			Fax_List_Reload = this;
			
			
            THIS.get_settings(function(_data_settings) {
                faxes_html = THIS.templates.faxes.tmpl(_data_settings);
		
		$.datepicker.setDefaults(
			$.extend($.datepicker.regional["ru"])
		);
	
		$( "#start_date" , faxes_html).datepicker({
            defaultDate: "-7",
            changeMonth: true,
            numberOfMonths: 1,
			dateFormat: "dd M yy",
            onClose: function( selectedDate ) {
                $( "#to" ).datepicker( "option", "minDate", selectedDate );
            }
        });
        $( "#end_date" , faxes_html).datepicker({
            defaultDate: "+1",
            changeMonth: true,
            numberOfMonths: 1,
			dateFormat: "dd M yy",
            onClose: function( selectedDate ) {
                $( "#from" ).datepicker( "option", "maxDate", selectedDate );
            }
        });
			
			$( "#start_date" , faxes_html).change( function () { list_update(); } )
			$( "#end_date" , faxes_html).change( function () { list_update(); } )
			$( "#cancel_date", faxes_html).click( function () {
			$( "#start_date" , faxes_html).val("");
			$( "#end_date" , faxes_html).val("");
			list_update();
			});
			$('#searchLink', faxes_html).click(function() {
				winkstart.table.user_fax.fnClearTable();
            });
			$('#buttonUpload', faxes_html).click(	function ajaxFileUpload()
				{
				
				var a = $("#fileToUpload").val();
				a = a.substring(a.indexOf(".")+1);
				
				if (a != "pdf" && a != "tif" && a != "tiff") {
				alert("Uploaded file should be in PDF or TIFF format!");
				
				return false;
				}
				
				$("#loading")
				.ajaxStart(function(){
				$(this).show();
				})
				.ajaxComplete(function(){
					$(this).hide();
				});

				
				
				$.ajaxFileUpload
				(
					{
					url:'whapps/fax/faxes/doajaxfileupload.php',
					secureuri:false,
					fileElementId:'fileToUpload',
					dataType: 'json',
					data:{name:'logan', id:'id'},
					success: function (data, status)
					{
						if(typeof(data.error) != 'undefined')
						{
							if(data.error != '')
							{
							alert(data.error);
							}else
							{
								faxurl = data.msg;
								send(faxurl);
							
							}
						}
					},
					error: function (data, status, e)
					{
						alert(e);
					}
				}
			)
			return false;
			});
			
			function send(x) {
			Fax_List_Reload_Counter = 0;
			THIS.send_fax(x,faxes_html);
			}
			
			function list_update() {
				THIS.list_by_date("change",faxes_html);
			}
				
                (parent)
                    .empty()
                    .append(faxes_html);

                //Hack to display columns properly
                $('.dataTables_scrollHeadInner, .dataTables_scrollHeadInner table', faxes_html).attr('style', 'width:100%');
	
		THIS.list_by_date();
            });
        },
		
		send_fax: function(url,faxes_html) {
			var THIS = this;
		winkstart.request('fax_account.get', {
                    account_id: winkstart.apps['fax'].account_id,
                    api_url: winkstart.apps['fax'].api_url, 
                    },
                    function(_data, status) {
                       if(status == 200) {
					 	winkstart.request(true, 'fax.send', {
							account_id: winkstart.apps['fax'].account_id,
							api_url: winkstart.apps['fax'].api_url,
							data: { "document":{ 
								"url":url,
								"method":"get"
								},
								"retries":$( "#fax_retries" , faxes_html).val(),
								"from_name":"Fax",
								"from_number": _data.data.caller_id.default.number,
								"to_name":"For You",
								"to_number":$( "#fax_number" , faxes_html).val()
								}
						},
						function(_data, status) {
						if(status == 201) {
							list_update();
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
			
		function list_update()
		{
			$( "#start_date" , faxes_html).val("");
			$( "#end_date" , faxes_html).val("");
			$( "#fax_number" , faxes_html).val("");
			THIS.list_by_date("send");
		}		
		},
    
        list_by_date: function(a, faxes_html) {
            var THIS = this;
			if ( a == "change" ) { winkstart.table.user_fax.fnClearTable(); }
			start_date1 = $( "#start_date" , faxes_html).val();
			end_date1 = $( "#end_date" , faxes_html).val();
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
		
            winkstart.request('fax.list', {
                    account_id: winkstart.apps['fax'].account_id,
                    api_url: winkstart.apps['fax'].api_url,
                    user_id: winkstart.apps['fax'].user_id,
					created_from: start_date,
					created_to: end_date
                },
                function(_data, status) {
					var created_time;
                    var tab_data = [];
					var tmp = 0;
					var tmp_status = "completed"
                    $.each(_data.data, function() {
                   	   
							created_time = new Date((this.created - 62167219200) * 1000);
							var month = created_time.getMonth()+1 < 10 ? '0'+(created_time.getMonth()+1) : created_time.getMonth()+1;
							var day = created_time.getDate() < 10 ? '0'+created_time.getDate() : created_time.getDate();
							var hour = created_time.getHours()+1 < 10 ? '0'+(created_time.getHours()) : created_time.getHours();
							var minute = created_time.getMinutes() < 10 ? '0'+created_time.getMinutes() : created_time.getMinutes();
							
							if (created_time <= end_date && created_time >= start_date) {
							
							created_time1 = day + '.' + month + '.'  + created_time.getFullYear() + ' / ' + hour + ':' + minute;
							
						if (this.created > tmp) {
							tmp = this.created;
							tmp_status = this.status;
						   } 
					  
                            tab_data.push([
                                created_time1,
								this.to,
								this.status,
								created_time
                            ]);
							}
                    });	
									
               var columns = [
                {
                    'sTitle': 'Date',
                    'sWidth': '450px'
                },

                {
                    'sTitle': 'Dialed number',
                    'sWidth': '350px'
                },
                {
                    'sTitle': 'Result',
                    'sWidth': '260px'
                },
                {
                    'sTitle': 'Created',
                'bVisible': false
                }
            ];
					if (a == "send" || a == "change") {
					winkstart.table.user_fax.destroy();
					}
					
					winkstart.table.create('user_fax', $('#user_faxes-grid', faxes_html), columns, {}, {
                sDom: '<"date">frtlip',
                sScrollY: '222px',
                aaSorting: [[3, 'desc']]
            });
	
                   winkstart.table.user_fax.fnAddData(tab_data);
				
                    $('.dataTables_scrollHeadInner, .dataTables_scrollHeadInner table').attr('style', 'width:100%');
          
					if (tmp_status == "completed" || tmp_status == "failed") { Fax_List_Reload_Counter = 12;}
				if (a == "send") {
				if (Fax_List_Reload_Counter < 12) {
				Fax_List_Reload_Counter++;
				setTimeout("Fax_List_Reload.list_by_date('send')", 10000);
			}
			};
			}
            );
        }
});	
	function  NumberChange() {
		var a = $("#fax_number").val();
		var x = false;
		if ( a.length == 7) {
			x = /[0-9]{7,7}/.test(a);
			}
		if ( a.length == 11) {
			x = /^[7,8][0-9]{10,10}/.test(a);
			}
		if ( (a.length > 7 && a.length < 11) || a.length < 7 ) {
			$("#buttonUpload").attr("disabled", "disabled");
			}
		if ( x == true ) {
			$("#buttonUpload").removeAttr("disabled");
			}
		if ( ( a.length == 7 || a.length == 11 ) && x == false) {
			alert("Проверьте правильность номера!");
			$("#buttonUpload").attr("disabled", "disabled");
			}
		};
	
	$(document).ready(function () {
		loadjs = document.createElement('script');
		loadjs.setAttribute("type", "text/javascript");
		loadjs.setAttribute("src", "whapps/fax/faxes/ajaxfileupload.js");
		document.getElementsByTagName("head")[0].appendChild(loadjs);
			});
	
