{
	"name": "svykanban-board",
	"displayName": "board",
	"version": 1,
	"definition": "svykanban/board/board.js",
	"serverscript": "svykanban/board/board_server.js",
	"libraries": 
	[
		{
			"name": "kbjs",
			"version": "1",
			"url": "svykanban/board/jkanban.js",
			"mimetype": "text/javascript"
		},

		{
			"name": "kbcss",
			"version": "1",
			"url": "svykanban/board/jkanban.css",
			"mimetype": "text/css"
		},
		
		{
			"name": "bcss",
			"version": "1",
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
		"dragBoards"           : {"type": "boolean"},
		"addItemButton"        : {"type": "boolean","default": false},
		"buttonContent" 	   : {"type": "string"}	
	},
	
	"handlers": 
	{
		"click": {
			"doc": "callback when any board's item are clicked",
			"parameters": [{
				"name": "taskID",
				"type": "string"
			}]
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
			}]
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
			    "type": "object"}]
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
			"priority"							: {"type": "string"}
		}
	}
}