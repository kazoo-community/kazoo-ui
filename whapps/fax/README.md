kazoo_ui_mod_fax
================

Fax module for 2600hz Kazoo UI 

Written by Vladislav Dushenkov vlad@onnet.info

TODO:

- find out the best approach to store outbound faxes in CouchDB in order users be allowed to view it later in case needed.

++++++++++++++++++++++++++++++++++++++++++++++++++++++

Caution:

Atm default account's CID is used as Fax Sendr's number

So be aware to set it up in your account's DB and doc

	"caller_id": {

		"internal": {
			"name": "Inti CID",
			"number": "18121234567"
		},

		"external": {
			"name": "Ext CID",
			"number": "18121234567"
		},

		"default": {
			"name": "Def CID",
			"number": "18121234567"
		}
	}

