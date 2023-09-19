
/** 
 * Adds all the boards to be displayed by the component,
 * any previous boards will be replaced by the new ones
 * 
 * @param {Array<CustomType<svykanban-board.boardItem>>} boards
 */
function addBoards(boards) {

}

/**
 * Adds an item to a specific Board
 * 
 * @param {String} bid the Board Id, if not found the item will be ignored
 * @param {CustomType<svykanban-board.item>} el the item to be added to the Board
 * @param {number} [position] the position to insert the new item at, if not provided it will be inserted at the end
 */
function addElement(bid, el, position) {

}

/**
 * Updates the title of an existing item
 * 
 * @param {String} bid the Board Id, if not found the item will be ignored
 * @param {CustomType<svykanban-board.item>} el the item to be updated, the title of the existing item will be replaced with this one, if not found by id it will be ignored
 */
function updateElement(bid, el) {

}
