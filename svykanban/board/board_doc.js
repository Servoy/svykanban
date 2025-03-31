/**
 * A Servoy Extra Component for a Kanban Board.
 * Displays boards with items that can be dragged, dropped, and managed.
 */

/**
 * The gutter between boards.
 */
var gutter;

/**
 * The width of each board.
 */
var widthBoard;

/**
 * If true, board widths are set as a percentage of the container.
 */
var responsivePercentage;

/**
 * An array of board items to be displayed.
 */
var boards;

/**
 * Flag indicating whether items can be dragged between boards.
 */
var dragItems;

/**
 * Flag indicating whether boards can be dragged.
 */
var dragBoards;

/**
 * Options for adding items to a board.
 */
var itemAddOptions;

/**
 * Options for handling item drag operations.
 */
var itemHandleOptions;


var handlers = {
    /**
     * Callback when any board's item are clicked
     *
     * @param {String} taskID The ID of the clicked task.
     * @param {JSEvent} event The event object associated with the click.
     */
    click: function() {},

    /**
     * Callback when any board's item are clicked
     *
     * @param {Object} el The DOM element of the dragged item.
     * @param {Object} source The source board object.
     */
    dragEl: function() {},

    /**
     * Callback when any board's item stop drag
     *
     * @param {Object} el The DOM element of the dragged item.
     */
    dragendEl: function() {},

    /**
     * Callback when any board's item drop in a board
     *
     * @param {String} el The identifier of the dropped item.
     * @param {Object} target The target board object.
     * @param {Object} source The source board object.
     * @param {Object} sibling The sibling item element adjacent to the drop location.
     */
    dropEl: function() {},

    /**
     * Callback when any board stop drag
     *
     * @param {Object} el The DOM element representing the board.
     * @param {Object} source The source board object.
     */
    dragBoard: function() {},

    /**
     * Callback when any board stop drag
     *
     * @param {Object} el The DOM element representing the board.
     */
    dragendBoard: function() {},

    /**
     * Callback when the board's button is clicked
     *
     * @param {Object} el The DOM element of the clicked button.
     * @param {String} boardId The identifier of the board.
     * @param {JSEvent} event The event object associated with the click.
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

/**
 * Gets the index position of an element within its parent board
 * 
 * @param {String} elementID the element Id
 * 
 * @return {Number} the zero-based index of the element in its parent board, or -1 if parent or element not found
 */
function getElementIndex(elementID) {

}


var svy_types = {  
  /**
   * Represents a board item.
   */
  boardItem: {
    /**
     * Unique identifier for the board.
     */
    id: null,
    /**
     * Title of the board.
     */
    title: null,
    /**
     * Tab order index for keyboard navigation.
     */
    tabindex: null,
    /**
     * CSS style class applied to the board.
     */
    "class": null,
    /**
     * Array of board IDs to which items can be dragged.
     */
    dragTo: null,
    /**
     * Array of item objects contained in the board.
     */
    item: null,
  },
  
  /**
   * Represents an individual item in a board.
   */
  item: {
    /**
     * Unique identifier for the item.
     */
    id: null,
    /**
     * Title of the item.
     */
    title: null,
    /**
     * Priority level of the item.
     */
    priority: null,
    /**
     * CSS style class applied to the item.
     */
    "class": null,
  },
  
  /**
   * Options for adding new items to a board.
   */
  itemAddOptions: {
    /**
     * Flag indicating whether adding items is enabled.
     */
    enabled: null,
    /**
     * The content to display as the add item button.
     */
    content: null,
    /**
     * CSS class for styling the add item button.
     */
    "class": null,
    /**
     * Flag indicating whether a footer is shown in the add item section.
     */
    footer: null,
  },
  
  /**
   * Options for item handle behavior.
   */
  itemHandleOptions: {
    /**
     * Flag indicating whether the handle is enabled.
     */
    enabled: null,
    /**
     * CSS class applied to the handle.
     */
    handleClass: null,
    /**
     * Client-side function for custom CSS styling of the handle.
     */
    customCssHandler: null,
    /**
     * Client-side function for custom CSS styling of the handle icon.
     */
    customCssIconHandler: null,
    /**
     * Client-side function for handling custom events on the handle.
     */
    customHandler: null,
  }
}
