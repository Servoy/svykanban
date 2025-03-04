var gutter;

var widthBoard;

var responsivePercentage;

var boards;

var dragItems;

var dragBoards;

var itemAddOptions;

var itemHandleOptions;


var handlers = {
    /**
     * callback when any board's item are clicked
     *
     * @param {String} taskID
     * @param {JSEvent} event
     */
    click: function() {},

    /**
     * callback when any board's item are clicked
     *
     * @param {Object} el
     * @param {Object} source
     */
    dragEl: function() {},

    /**
     * callback when any board's item stop drag
     *
     * @param {Object} el
     */
    dragendEl: function() {},

    /**
     * callback when any board's item drop in a board
     *
     * @param {Object} el
     * @param {Object} target
     * @param {Object} source
     * @param {Object} sibling
     */
    dropEl: function() {},

    /**
     * callback when any board stop drag
     *
     * @param {Object} el
     * @param {Object} source
     */
    dragBoard: function() {},

    /**
     * callback when any board stop drag
     *
     * @param {Object} el
     */
    dragendBoard: function() {},

    /**
     * callback when the board's button is clicked
     *
     * @param {Object} el
     * @param {String} boardId
     * @param {JSEvent} event
     */
    buttonClick: function() {}
};


/** 
 * Adds all the boards to be displayed by the component,
 * any previous boards will be replaced by the new ones
 * 
 * @param {Array<CustomType<svykanban-board.boardItem>>} boardItems An array of board items to be displayed, replacing any existing boards.
 */
function addBoards(boards) {

}

/**
 * Adds an item to a specific Board
 * 
 * @param {String} boardID the Board Id, if not found the item will be ignored
 * @param {CustomType<svykanban-board.item>} element the item to be added to the Board
 * @param {number} [position] the position to insert the new item at, if not provided it will be inserted at the end
 */
function addElement(boardID, element, position) {

}

/**
 * Updates the title of an existing item
 * 
 * @param {String} elementID the Board Id, if not found the item will be ignored
 * @param {CustomType<svykanban-board.item>} element the item to be updated, the title of the existing item will be replaced with this one, if not found by id it will be ignored
 */
function updateElement(elementID, element) {

}
