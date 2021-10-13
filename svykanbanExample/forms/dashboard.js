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
		loadBoard();
	}
}

/**
 * callback when any board's item drop in a board.
 *
 * @param {String} taskId			ID of element dropped
 * @param {String} targetColumnId	ID of board column where dropped
 * @param {String} sourceColumnId	ID of board column where dragged from
 * @param {Object} sibling 			Not used at the moment
 *
 * @properties={typeid:24,uuid:"7A893FFC-9085-48BD-AE20-5B2218AF34E5"}
 */
function onDropElement(taskId, targetColumnId, sourceColumnId, sibling) {
	if (targetColumnId == sourceColumnId) {
		return;
	}
	
	var order = getOrder(parseInt(taskId));
	if (!order) {
		// TODO Handle revert in the board, it looks like the board needs to be refresh
		return;
	}
	
	// Handle status change, the id of the target board is the status so set the order to the new status
	order.status = targetColumnId;
	if (!databaseManager.saveData(order)) {
		application.output('Could not move Order: ' + taskId + ' to status: ' + targetColumnId + ' - ex: ' + order.exception, LOGGINGLEVEL.ERROR);
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
	var order = getOrder(parseInt(taskId));
	if (!order) {
		// TODO Show user message?
		return;
	}
	
	var html = 
		<div>
			<p><b>Order #{order.orderid}</b></p>
			<p>Date: {utils.dateFormat(order.orderdate, 'MM/dd/yyyy')}</p>
			<p>Customer: {order.customerid}</p>
			<p>Employee: {order.employeeid}</p>
			<p>Required Date: {utils.dateFormat(order.requireddate, 'MM/dd/yyyy')}</p>
			<p>Status: {order.status}</p>
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
 * @properties={typeid:24,uuid:"BDE9F15F-B6A0-4FEB-B98D-3F3E46394598"}
 */
function loadBoard() {
	plugins.svyBlockUI.show('Loading Board...');
	
	/** @type {Array<CustomType<svykanban-board.boardItem>>} */
	var boards = [];
	
	var fs = datasources.db.example_data.orders.getFoundSet();
	fs.sort('orderdate DESC', true);
	
	// Create four boards, one per status
	['pending', 'backorder', 'shipped', 'delivered'].forEach(function (s) {
		// Add Orders to the board depending on the status
		fs.removeFoundSetFilterParam('status');
		fs.addFoundSetFilterParam('status', '=', s, 'status');
		fs.loadAllRecords();
		
		// Id of the board is the status to be used easily when moving tasks from one column to the other
		/** @type {CustomType<svykanban-board.boardItem>} */
		var boardColumn = {
			id 		: s,
			title 	: s.toUpperCase(),
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
				id		: record.orderid.toString(),
				title	: html.toString()
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
 * @return {JSRecord<db:/example_data/orders>}
 *
 * @properties={typeid:24,uuid:"0FDFAFA8-83D6-4CFA-BBF3-2FAF7592DC9A"}
 */
function getOrder(orderId) {
	var fs = datasources.db.example_data.orders.getFoundSet();
	if (!fs.loadRecords(orderId)) {
		application.output('Could not load Order: ' + orderId, LOGGINGLEVEL.WARNING);
		// TODO Handle revert in the board
		return null;
	}
	
	return fs.getRecord(1);
}
