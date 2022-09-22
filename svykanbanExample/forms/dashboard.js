/**
 * @properties={typeid:35,uuid:"F69D6E60-85ED-4BDA-A4B9-EF0E4009EDF1",variableType:-4}
 */
var ORDER_STATUS = ['pending', 'backorder', 'shipped', 'delivered'];

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"61962871-223B-467A-AF60-B04BB05D1178"}
 */
function onShow(firstShow, event) {
	if (firstShow) {
		loadTestData();
		loadBoard();
	}
}

/**
 * callback when any board's item drop in a board.
 *
 * @param {String} elementId		ID of element dropped
 * @param {String} targetColumnId	ID of board column where dropped
 * @param {String} sourceColumnId	ID of board column where dragged from
 * @param {Object} sibling 			Not used at the moment
 *
 * @properties={typeid:24,uuid:"7A893FFC-9085-48BD-AE20-5B2218AF34E5"}
 */
function onDropElement(elementId, targetColumnId, sourceColumnId, sibling) {
	if (targetColumnId == sourceColumnId) {
		// TODO Handle ordering?
		return;
	}
	
	var order = getOrder(parseInt(elementId));
	if (!order) {
		// TODO Handle revert in the board, it looks like the board needs to be refresh
		return;
	}
	
	// Handle status change, the id of the target board is the status so set the order to the new status
	order.status = targetColumnId;
	if (!databaseManager.saveData(order)) {
		application.output('Could not move Order: ' + elementId + ' to status: ' + targetColumnId + ' - ex: ' + order.exception, LOGGINGLEVEL.ERROR);
		order.revertChanges();
		// TODO Handle revert in the board, it looks like the board needs to be refresh
	}
}

/**
 * callback when any board's item are clicked.
 *
 * @param {string} taskId	ID of element clicked
 *
 * @properties={typeid:24,uuid:"B1F761D9-BF72-4BC4-AE48-226C7185FB1A"}
 */
function onElementClick(taskId) {
	if (taskId && taskId.includes('dummy-')) {
		return;
	}
	
	var order = getOrder(parseInt(taskId));
	if (!order) {
		plugins.dialogs.showErrorDialog('Error', 'Order #' + taskId + ' not found');
		return;
	}
	
	var html = 
		<div>
			<p><b>Order #{order.orderid}</b></p>
			<p>Date: {utils.dateFormat(order.orderdate, 'MM/dd/yyyy')}</p>
			<p>Customer: {order.customerid}</p>
			<p>Employee: {order.employeeid}</p>
			<p>Required Date: {utils.dateFormat(order.requireddate, 'MM/dd/yyyy')}</p>
			<p>Status: {order.status.toUpperCase()}</p>
			<p>Ship To: {order.shipaddress}, {order.shipcity}, {order.shipregion} {order.shippostalcode}, {order.shipcountry}</p>
		</div>;

	plugins.dialogs.showInfoDialog('Order Details', html.toString());
}

/**
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"E8751909-7D65-41EC-85A9-D73CE547F1DB"}
 */
function onActionRefresh(event) {
	loadBoard();
}

/**
 * @private 
 * 
 * @properties={typeid:24,uuid:"55D93906-1895-4E8E-8B5C-C9C66FCBB6AE"}
 */
function loadTestData() {
	plugins.svyBlockUI.show('Loading Test Data...');
	
	var columnNames = ["orderid","customerid","employeeid","orderdate","requireddate","shippeddate","shipvia","freight","shipname","shipaddress","shipcity","shipregion","shippostalcode","shipcountry", "status"];
	var data = [
		[11077,"RATTC",1,"2022-05-06","2022-06-03",null,2,"8.53","Rattlesnake Canyon Grocery","2817 Milton Dr.","Albuquerque","NM",87110,"USA","delivered"],
		[11074,"SIMOB",7,"2022-05-06","2022-06-03",null,2,"18.44","Simons bistro","Vinbæltet 34","Kobenhavn",null,1734,"Denmark","backorder"],
		[11076,"BONAP",4,"2022-05-06","2022-06-03",null,2,"38.28","Bon app'","12, rue des Bouchers","Marseille",null,13008,"France","delivered"],
		[11075,"RICSU",8,"2022-05-06","2022-06-03",null,2,"6.19","Richter Supermarkt","Starenweg 5","Genève",null,1204,"Switzerland","backorder"],
		[11070,"LEHMS",2,"2022-05-05","2022-06-02",null,1,136,"Lehmanns Marktstand","Magazinweg 7","Frankfurt a.M.",null,60528,"Germany","shipped"],
		[11072,"ERNSH",4,"2022-05-05","2022-06-02",null,2,"258.64","Ernst Handel","Kirchgasse 6","Graz",null,8010,"Austria","delivered"],
		[11073,"PERIC",2,"2022-05-05","2022-06-02",null,2,"24.95","Pericles Comidas clásicas","Calle Dr. Jorge Cash 321","México D.F.",null,5033,"Mexico","pending"],
		[11071,"LILAS",1,"2022-05-05","2022-06-02",null,1,"0.93","LILA-Supermercado","Carrera 52 con Ave. Bolívar #65-98 Llano Largo","Barquisimeto","Lara",3508,"Venezuela","delivered"],
		[11067,"DRACD",1,"2022-05-04","2022-05-18","2022-05-06",2,"7.98","Drachenblut Delikatessen","Walserweg 21","Aachen",null,52066,"Germany","backorder"],
		[11069,"TORTU",1,"2022-05-04","2022-06-01","2022-05-06",2,"15.67","Tortuga Restaurante","Avda. Azteca 123","México D.F.",null,5033,"Mexico","shipped"],
		[11068,"QUEEN",8,"2022-05-04","2022-06-01",null,2,"81.75","Queen Cozinha","Alameda dos Canàrios, 891","Sao Paulo","SP","05487-020","Brazil","shipped"],
		[11065,"LILAS",8,"2022-05-01","2022-05-29",null,1,"12.91","LILA-Supermercado","Carrera 52 con Ave. Bolívar #65-98 Llano Largo","Barquisimeto","Lara",3508,"Venezuela","backorder"],
		[11066,"WHITC",7,"2022-05-01","2022-05-29","2022-05-04",2,"44.72","White Clover Markets","1029 - 12th Ave. S.","Seattle","WA",98124,"USA","shipped"],
		[11064,"SAVEA",1,"2022-05-01","2022-05-29","2022-05-04",1,"30.09","Save-a-lot Markets","187 Suffolk Ln.","Boise","ID",83720,"USA","shipped"],
		[11062,"REGGC",4,"2022-04-30","2022-05-28",null,2,"29.93","Reggiani Caseifici","Strada Provinciale 124","Reggio Emilia",null,42100,"Italy","pending"],
		[11060,"FRANS",2,"2022-04-30","2022-05-28","2022-05-04",2,"10.98","Franchi S.p.A.","Via Monte Bianco 34","Torino",null,10100,"Italy","delivered"],
		[11061,"GREAL",4,"2022-04-30","2022-06-11",null,3,"14.01","Great Lakes Food Market","2732 Baker Blvd.","Eugene","OR",97403,"USA","delivered"],
		[11063,"HUNGO",3,"2022-04-30","2022-05-28","2022-05-06",2,"81.73","Hungry Owl All-Night Grocers","8 Johnstown Road","Cork","Co. Cork",null,"Ireland","shipped"],
		[11058,"BLAUS",9,"2022-04-29","2022-05-27",null,3,"31.14","Blauer See Delikatessen","Forsterstr. 57","Mannheim",null,68306,"Germany","backorder"],
		[11059,"RICAR",2,"2022-04-29","2022-06-10",null,2,"85.8","Ricardo Adocicados","Av. Copacabana, 267","Rio de Janeiro","RJ","02389-890","Brazil","delivered"],
		[11057,"NORTS",3,"2022-04-29","2022-05-27","2022-05-01",3,"4.13","North/South","South House 300 Queensbridge","London",null,"SW7 1RZ","UK","delivered"],
		[11054,"CACTU",8,"2022-04-28","2022-05-26",null,1,"0.33","Cactus Comidas para llevar","Cerrito 333","Buenos Aires",null,1010,"Argentina","shipped"],
		[11056,"EASTC",8,"2022-04-28","2022-05-12","2022-05-01",2,"278.96","Eastern Connection","35 King George","London",null,"WX3 6FW","UK","backorder"],
		[11055,"HILAA",7,"2022-04-28","2022-05-26","2022-05-05",2,"120.92","HILARION-Abastos","Carrera 22 con Ave. Carlos Soublette #8-35","San Cristóbal","Táchira",5022,"Venezuela","delivered"],
		[11050,"FOLKO",8,"2022-04-27","2022-05-25","2022-05-05",2,"59.41","Folk och fä HB","Åkergatan 24","Bräcke",null,"S-844 67","Sweden","shipped"],
		[11051,"LAMAI",7,"2022-04-27","2022-05-25",null,3,"2.79","La maison d'Asie","1 rue Alsace-Lorraine","Toulouse",null,31000,"France","shipped"],
		[11053,"PICCO",2,"2022-04-27","2022-05-25","2022-04-29",2,"53.05","Piccolo und mehr","Geislweg 14","Salzburg",null,5020,"Austria","backorder"],
		[11052,"HANAR",3,"2022-04-27","2022-05-25","2022-05-01",1,"67.26","Hanari Carnes","Rua do Paço, 67","Rio de Janeiro","RJ","05454-876","Brazil","shipped"],
		[11048,"BOTTM",7,"2022-04-24","2022-05-22","2022-04-30",3,"24.12","Bottom-Dollar Markets","23 Tsawassen Blvd.","Tsawassen","BC","T2F 8M4","Canada","backorder"],
		[11049,"GOURL",3,"2022-04-24","2022-05-22","2022-05-04",1,"8.34","Gourmet Lanchonetes","Av. Brasil, 442","Campinas","SP","04876-786","Brazil","backorder"],
		[11047,"EASTC",7,"2022-04-24","2022-05-22","2022-05-01",3,"46.62","Eastern Connection","35 King George","London",null,"WX3 6FW","UK","delivered"],
		[11045,"BOTTM",6,"2022-04-23","2022-05-21",null,2,"70.58","Bottom-Dollar Markets","23 Tsawassen Blvd.","Tsawassen","BC","T2F 8M4","Canada","delivered"],
		[11044,"WOLZA",4,"2022-04-23","2022-05-21","2022-05-01",1,"8.72","Wolski Zajazd","ul. Filtrowa 68","Warszawa",null,"01-012","Poland","pending"],
		[11046,"WANDK",8,"2022-04-23","2022-05-21","2022-04-24",2,"71.64","Die Wandernde Kuh","Adenauerallee 900","Stuttgart",null,70563,"Germany","shipped"],
		[11040,"GREAL",4,"2022-04-22","2022-05-20",null,3,"18.84","Great Lakes Food Market","2732 Baker Blvd.","Eugene","OR",97403,"USA","shipped"],
		[11042,"COMMI",2,"2022-04-22","2022-05-06","2022-05-01",1,"29.99","Comércio Mineiro","Av. dos Lusíadas, 23","Sao Paulo","SP","05432-043","Brazil","pending"],
		[11043,"SPECD",5,"2022-04-22","2022-05-20","2022-04-29",2,"8.8","Spécialités du monde","25, rue Lauriston","Paris",null,75016,"France","backorder"],
		[11041,"CHOPS",3,"2022-04-22","2022-05-20","2022-04-28",2,"48.22","Chop-suey Chinese","Hauptstr. 31","Bern",null,3012,"Switzerland","shipped"],
		[11039,"LINOD",1,"2022-04-21","2022-05-19",null,2,65,"LINO-Delicateses","Ave. 5 de Mayo Porlamar","I. de Margarita","Nueva Esparta",4980,"Venezuela","shipped"],
		[11037,"GODOS",7,"2022-04-21","2022-05-19","2022-04-27",1,"3.2","Godos Cocina Típica","C/ Romero, 33","Sevilla",null,41101,"Spain","delivered"],
		[11038,"SUPRD",1,"2022-04-21","2022-05-19","2022-04-30",2,"29.59","Suprêmes délices","Boulevard Tirou, 255","Charleroi",null,"B-6000","Belgium","delivered"],
		[11034,"OLDWO",8,"2022-04-20","2022-06-01","2022-04-27",1,"40.32","Old World Delicatessen","2743 Bering St.","Anchorage","AK",99508,"USA","delivered"],
		[11035,"SUPRD",2,"2022-04-20","2022-05-18","2022-04-24",2,"0.17","Suprêmes délices","Boulevard Tirou, 255","Charleroi",null,"B-6000","Belgium","backorder"],
		[11036,"DRACD",8,"2022-04-20","2022-05-18","2022-04-22",3,"149.47","Drachenblut Delikatessen","Walserweg 21","Aachen",null,52066,"Germany","backorder"],
		[11030,"SAVEA",7,"2022-04-17","2022-05-15","2022-04-27",2,"830.75","Save-a-lot Markets","187 Suffolk Ln.","Boise","ID",83720,"USA","delivered"],
		[11031,"SAVEA",6,"2022-04-17","2022-05-15","2022-04-24",2,"227.22","Save-a-lot Markets","187 Suffolk Ln.","Boise","ID",83720,"USA","backorder"],
		[11032,"WHITC",2,"2022-04-17","2022-05-15","2022-04-23",3,"606.19","White Clover Markets","1029 - 12th Ave. S.","Seattle","WA",98124,"USA","delivered"],
		[11033,"RICSU",7,"2022-04-17","2022-05-15","2022-04-23",3,"84.74","Richter Supermarkt","Starenweg 5","Genève",null,1204,"Switzerland","delivered"],
		[11028,"KOENE",2,"2022-04-16","2022-05-14","2022-04-22",1,"29.59","Königlich Essen","Maubelstr. 90","Brandenburg",null,14776,"Germany","backorder"],
		[11029,"CHOPS",4,"2022-04-16","2022-05-14","2022-04-27",1,"47.84","Chop-suey Chinese","Hauptstr. 31","Bern",null,3012,"Switzerland","backorder"],
	];
	
	var fs = datasources.mem.orders.getFoundSet();

	data.forEach(function(d) {
		fs.newRecord();
		columnNames.forEach(function(c, i) {
			fs[c] = d[i];
		})
	});
	
	if (!databaseManager.saveData(fs)) {
		databaseManager.getFailedRecords(fs).forEach(function(r) {
			application.output(r.exception);
		});
		
		databaseManager.revertEditedRecords(fs);
	}
	
	plugins.svyBlockUI.stop();
}

/**
 * @properties={typeid:24,uuid:"BDE9F15F-B6A0-4FEB-B98D-3F3E46394598"}
 */
function loadBoard() {
	plugins.svyBlockUI.show('Loading Board...');
	
	/** @type {Array<CustomType<svykanban-board.boardItem>>} */
	var boards = [];
	
	var fs = datasources.mem.orders.getFoundSet();
	fs.sort('orderdate DESC', true);
	
	// Create four boards, one per status
	ORDER_STATUS.forEach(function (status) {
		// Add Orders to the board depending on the status
		fs.removeFoundSetFilterParam('status');
		fs.addFoundSetFilterParam('status', '=', status, 'status');
		fs.loadAllRecords();
		
		// Id of the board is the status to be used easily when moving tasks from one column to the other
		/** @type {CustomType<svykanban-board.boardItem>} */
		var boardColumn = {
			id 		: status,
			title 	: status.toUpperCase(),
			"class"	: 'board-' + status,
			item 	: []
		};
		
		for (var i = 1; i <= fs.getSize(); i++) {
			var record = fs.getRecord(i);
			var html =
				<table style="width:100%;">
					<tr>
						<td><b>Order #{record.orderid}</b></td>
						<td style="text-align:right;">{utils.dateFormat(record.orderdate, 'MM/dd/yyyy')}</td>
					</tr>
					<tr>
						<td>Customer: {record.customerid}</td>
						<td style="text-align:right;">To: {record.shipcity}, {record.shipcountry}</td>
					</tr>
					<tr>
						<td colspan="2"><i>Some dummy long text that occupies the entire row</i></td>
					</tr>
				</table>;
				
			// Id of the task is the order pk to be used easily when moving tasks from one column to the other
			// "title" is the actual content of the board item, it can have html markup with css classes or inline style 
			/** @type {CustomType<svykanban-board.item>} */
			var item = {
				id			: record.orderid.toString(),
				title		: html.toString()
			};
			
			boardColumn.item.push(item);
		}
		
		boards.push(boardColumn);
	});
	
	elements.board.addBoards(boards);

	plugins.svyBlockUI.stop();
}

/**
 * Get an Order by pk
 * 
 * @param {Number} orderId
 * @return {JSRecord<mem:orders>}
 *
 * @properties={typeid:24,uuid:"0FDFAFA8-83D6-4CFA-BBF3-2FAF7592DC9A"}
 */
function getOrder(orderId) {
	var fs = datasources.mem.orders.getFoundSet();
	if (!fs.loadRecords(orderId)) {
		application.output('Could not load Order: ' + orderId, LOGGINGLEVEL.WARNING);
		// TODO Handle revert in the board
		return null;
	}
	
	return fs.getRecord(1);
}

/**
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"93247835-1507-49AE-A023-10F526FFA4A8"}
 */
function onActionAddElement(event) {
	var board = plugins.dialogs.showSelectDialog('Select Board', '', ORDER_STATUS.join(',').toUpperCase().split(','));
	if (!board) {
		return;
	}
	
	elements.board.addElement(board.toLowerCase(), {id: 'dummy-' + Date.now().toString(), title: 'Dummy Item at the top (not an Order)', "class": ['item-danger']}, 0);
}

/**
 * @param {String} boardId
 *
 * @properties={typeid:24,uuid:"1DD5FAC4-F3B6-4200-B726-1D76F54D8D46"}
 */
function addDummyElement(boardId) {
	elements.board.addElement(boardId, {id: 'dummy-' + Date.now().toString(), title: 'Dummy Item at the bottom (not an Order)'});
}


/**
 * callback when the board's button is clicked.
 *
 * @param {object} el
 * @param {string} boardId
 *
 * @properties={typeid:24,uuid:"AE7F774A-3E83-4022-A602-5E9CD89BE7C2"}
 */
function buttonClick(el, boardId) {
	addDummyElement(boardId);
}
