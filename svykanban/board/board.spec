{
	"name": "svykanban-board",
	"displayName": "board",
	"version": 1,
	"definition": "svykanban/board/board.js",
	"serverscript": "svykanban/board/board_server.js",
	"doc": "svykanban/board/board_doc.js",
	"ng2Config": {
        "dependencies": {
           "serverscript": "svykanban/board/board_server_ng2.js"
        }
    },
	"libraries": 
	[
		{
			"name": "kbjs",
			"version": "master",
			"url": "svykanban/board/jkanban.js",
			"mimetype": "text/javascript"
		},

		{
			"name": "kbcss",
			"version": "master",
			"url": "svykanban/board/jkanban.css",
			"mimetype": "text/css"
		},
		
		{
			"name": "bcss",
			"version": "1.0.0",
			"url": "svykanban/board/board.css",
			"mimetype": "text/css"
		}
	],

	"model": 
	{
		"gutter"     		   : {"type": "string"},
		"widthBoard" 		   : {"type": "string"},
		"responsivePercentage" : {"type": "boolean","default": false},
		"boards" 		       : {"type": "boardItem[]", "pushToServer": "shallow"},
		"dragItems"            : {"type": "boolean"},
		"dragBoards"           : {"type": "boolean"},
		"itemAddOptions"       : {"type": "itemAddOptions"},
		"itemHandleOptions"    : {"type": "itemHandleOptions"}
	},
	
	"handlers": 
	{
		"click": {
			"doc": "callback when any board's item are clicked",
			"parameters": [{
				"name": "taskID",
				"type": "string"
			},
			{ "name" : "event", "type" : "JSEvent" }]
		},	
		"dragEl": {
			"doc": "callback when any board's item are clicked",
			"parameters": [{
				"name": "el",
				"type": "object"
			},{
				"name": "source",
				"type": "object"
			}]
		},
		"dragendEl": {
			"doc": "callback when any board's item stop drag",
			"parameters": [{
				"name": "el",
				"type": "object"
			}]
		},
		"dropEl": {
			"doc": "callback when any board's item drop in a board",
			"parameters": [{
				"name": "el",
				"type": "object"
			},{
				"name": "target",
				"type": "object"
			},{
				"name": "source",
				"type": "object"
			},{
				"name": "sibling",
				"type": "object"
			}]
		},
		"dragBoard": {
			"doc": "callback when any board stop drag",
			"parameters": [{
				"name": "el",
				"type": "object"
			},{
				"name": "source",
				"type": "object"
			}]
		},
		"dragendBoard": {
			"doc": "callback when any board stop drag",
			"parameters": [{
				"name": "el",
				"type": "object"
			}]
		},
			"buttonClick": {
			"doc": "callback when the board's button is clicked",
			"parameters": [{
				"name": "el",
				"type": "object"
			},{
				"name": "boardId",
				"type": "string"
			}, { "name" : "event", "type" : "JSEvent" }]
		}
	},

	"api": 
	{
		"render": {
			"parameters": []
				},					
		"addBoards": {
			"parameters": [{ 
				"name": "boardItems",
			    "type": "boardItem[]"}]
		},
		"addElement": {
			"parameters": [{ 
				"name": "boardID",
			    "type": "string"},
			    { 
				"name": "element",
			    "type": "object"},
			    { 
				"name": "position",
			    "type": "int",
			    "optional": true}]
		},
		"updateElement": {
			"parameters": [{ 
				"name": "elementID",
			    "type": "string"},
			    { 
				"name": "element",
			    "type": "object"}]
		}
			
	},
	"internalApi":
    {    	
		"getBoards": {
		 "returns": "object",
			"parameters": []
		},					
		"setBoards": {
			"parameters": [{ 
				"name": "boardItems",
			    "type": "boardItem[]"}]
		}	
    },
	"types":
	{
		"boardItem": {
			"id"								: {"type": "string"},
			"title"								: {"type": "string"},	
			"tabindex"							: {"type": "string"},
			"class"	 							: {"type": "styleclass"},
			"dragTo"	 						: {"type": "string[]"},
			"item"								: {"type": "item[]"}			
		},
		"item": {
			"id"								: {"type": "string"},
			"title"								: {"type": "string"},
			"priority"							: {"type": "string"},
			"class"	 							: {"type": "styleclass"}
		},
		"itemAddOptions": {
			"enabled"							: {"type": "boolean", "default": false},
			"content"							: {"type": "string", "default" : "+"},
			"class"								: {"type": "string"},
			"footer"							: {"type": "boolean"}
		},
		"itemHandleOptions": {
			"enabled"							: {"type": "boolean", "default": false},
			"handleClass"						: {"type": "string"},
			"customCssHandler"					: {"type": "string"},
			"customCssIconHandler"				: {"type": "string"},
			"customHandler"						: {"type": "string"}
		}
	}
}