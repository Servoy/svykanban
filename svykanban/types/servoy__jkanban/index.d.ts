export default class jKanban {
    constructor(options: any);
    drake: any;
    addBoards(boards: any[]): void;
    removeBoard(id: string): void;
    addElement(boardId: string, element: any, position?: number): void;
    findElement(id: string): HTMLElement;
    getParentBoardID(elementId: string): string | null;
    getBoardElements(boardId: string): NodeListOf<HTMLElement> | null;
}
