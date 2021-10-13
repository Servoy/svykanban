/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"EFCA9408-EDCF-492B-9C96-9E4AE5FAC464"}
 */
function onShow(firstShow, event) {
	/** @type {Array<CustomType<svykanban-board.boardItem>>} */
	var boards = [];

	//create boards
	for (var i = 1; i <= 5; i++) {
		/** @type {CustomType<svykanban-board.boardItem>} */
		var boardTemp = { };
		boardTemp.id = application.getUUID().toString().substring(30);
		boardTemp.title = '<span style="vertical-align: middle; float:left; line-height: 22px;"> Board : ' + boardTemp.id + '</span>';
		boardTemp.item = []

		//create item for boards
		for (var j = 0; j < 3; j++) {
			/** @type {CustomType<svykanban-board.item>} */
			var taskTemp = { };
			taskTemp.id = application.getUUID().toString().substring(25);
			taskTemp.title = '<span style="border-radius:15px;cursor:pointer;font-size:15px;cursor:pointer;"><u>' + 'ID : ' + taskTemp.id + '</u></span><br> An item on a board.. <hr style="margin-top: 10px;margin-bottom: 10px;">';
			boardTemp.item.push(taskTemp)
		}

		boards.push(boardTemp)
	}
	elements.board.addBoards(boards)
}

/**
 * callback when any board's item drop in a board.
 *
 * @param {object} el
 * @param {object} target
 * @param {object} source
 * @param {object} sibling
 *
 * @private
 *
 * @properties={typeid:24,uuid:"713B819A-F16A-4100-9308-37E121CF126C"}
 */
function dropEl(el, target, source, sibling) {
	application.output('el : ' + el);
	application.output('target : ' + target);
	application.output('source : ' + source);
	plugins.dialogs.showInfoDialog('INFO', 'Moved item ' + el + ' from Board ' + source + ' to Board ' + target);
}

/**
 * callback when any board's item are clicked.
 *
 * @param {string} taskID
 *
 * @private
 *
 * @properties={typeid:24,uuid:"8295AC60-535C-4241-AA8B-7450B074DE4A"}
 */
function click(taskID) {
	plugins.dialogs.showInfoDialog('INFO', 'clicked on item ID: ' + taskID);
}
