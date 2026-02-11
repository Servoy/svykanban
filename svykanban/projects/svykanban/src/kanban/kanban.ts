import { Component, SimpleChanges, Input, Renderer2, ChangeDetectorRef } from '@angular/core';
import { ICustomObjectValue, ServoyBaseComponent } from '@servoy/public';
import jKanban from "@servoy/jkanban";

@Component({
    selector: 'svykanban-board',
    templateUrl: './kanban.html',
    standalone: false
})
export class SvyKanban extends ServoyBaseComponent<HTMLDivElement> {

    @Input() gutter: string;
    @Input() widthBoard: string;
    @Input() responsivePercentage: boolean;
    @Input() dragItems: boolean;
    @Input() dragBoards: boolean;
    @Input() boards: Array<BoardItem>;
    @Input() itemAddOptions: ItemAddOptions;
    @Input() itemHandleOptions: ItemHandlerOptions;

    @Input() dropEl: (el: any, target: any, source: any, sibbling: any) => void;
    @Input() click: (taskID: string, event) => void;
    @Input() buttonClick: (taskID: string, boardID: string, event) => void;

    jkanban: jKanban;

    // Autoscroll properties
    private autoScrollRunning = false;
    private autoScrollRafId: number | null = null;
    private readonly SCROLL_ZONE = 50; // pixels from edge to trigger scroll
    private readonly MAX_SCROLL_SPEED = 10; // max pixels per frame

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef) {
        super(renderer, cdRef);
    }

    svyOnInit() {
        super.svyOnInit();
        this.jkanban = new jKanban({
            element: '#kboard_' + this.servoyApi.getMarkupId(),
            responsivePercentage: this.responsivePercentage,
            gutter: this.gutter,
            widthBoard: this.addPxIfNumber(this.widthBoard),
            dragItems: this.dragItems,
            dragBoards: this.dragBoards,
            itemAddOptions: this.itemAddOptions || {},
            itemHandleOptions: this.itemHandleOptions || {},
            buttonClick: (el, boardId, event) => {
                if (this.buttonClick) {
                    this.buttonClick(el.getAttribute("data-eid"), boardId, event)
                }
            },
            click: (el, e) => {
                if (this.click) {
                    this.click(el.getAttribute("data-eid"), e);
                }
            },
            dropEl: (el, target, source, sibling) => {
                if (this.dropEl) {
                    this.dropEl(el.getAttribute("data-eid"), target.offsetParent.getAttribute("data-id"), source.offsetParent.getAttribute("data-id"), sibling ? sibling.getAttribute("data-eid") : null);
                }
            }
        });

        // Initialize autoscroll for drag items
        this.initAutoscroll();
    }

    private initAutoscroll(): void {
        if (!this.jkanban || !this.jkanban.drake) {
            console.warn('Drake not available for autoscroll. Window might be too narrow or dragItems disabled.');
            return;
        }

        this.jkanban.drake.on('drag', () => this.startAutoScroll());
        this.jkanban.drake.on('drop', () => this.stopAutoScroll());
        this.jkanban.drake.on('cancel', () => this.stopAutoScroll());
        this.jkanban.drake.on('dragend', () => this.stopAutoScroll());
    }

    private startAutoScroll(): void {
        if (this.autoScrollRunning) return;

        this.autoScrollRunning = true;

        const loop = () => {
            if (!this.autoScrollRunning) return;

            this.updateAutoScroll();
            this.autoScrollRafId = requestAnimationFrame(loop);
        };

        this.autoScrollRafId = requestAnimationFrame(loop);
    }

    private stopAutoScroll(): void {
        this.autoScrollRunning = false;

        if (this.autoScrollRafId !== null) {
            cancelAnimationFrame(this.autoScrollRafId);
            this.autoScrollRafId = null;
        }
    }


    private updateAutoScroll(): void {
        const mirror = document.querySelector('.gu-mirror');
        if (!mirror) return;

        const mirrorRect = mirror.getBoundingClientRect();

        // Scroll the main kanban container horizontally
        const kanbanContainer = document.querySelector('.kanban-container') as HTMLElement;
        if (kanbanContainer) {
            const containerRect = kanbanContainer.getBoundingClientRect();

            // Check if mirror is over the kanban container
            if (mirrorRect.top < containerRect.bottom && mirrorRect.bottom > containerRect.top) {
                // Horizontal scroll - left edge (tight scroll)
                if (mirrorRect.left < containerRect.left + this.SCROLL_ZONE && kanbanContainer.scrollLeft > 0) {
                    const proximity = Math.max(0, 1 - ((mirrorRect.left - containerRect.left) / this.SCROLL_ZONE));
                    const scrollAmount = this.MAX_SCROLL_SPEED * proximity;
                    kanbanContainer.scrollLeft -= scrollAmount;
                }
                // Horizontal scroll - right edge
                else if (mirrorRect.right > containerRect.right - this.SCROLL_ZONE) {
                    const proximity = Math.max(0, 1 - ((containerRect.right - mirrorRect.right) / this.SCROLL_ZONE));
                    const scrollAmount = this.MAX_SCROLL_SPEED * proximity;
                    kanbanContainer.scrollLeft += scrollAmount;
                }
            }
        }

        // Scroll individual board columns (vertical scroll within a board)
        const boards = document.querySelectorAll('.kanban-board');
        boards.forEach((board: Element) => {
            const boardElement = board as HTMLElement;
            const dragArea = boardElement.querySelector('.kanban-drag') as HTMLElement;
            if (!dragArea) return;

            const dragRect = dragArea.getBoundingClientRect();

            // Check if mirror is over this board
            if (mirrorRect.left < dragRect.right && mirrorRect.right > dragRect.left) {
                // Vertical scroll within board
                if (mirrorRect.bottom > dragRect.bottom - this.SCROLL_ZONE) {
                    const proximity = Math.max(0, 1 - ((dragRect.bottom - mirrorRect.bottom) / this.SCROLL_ZONE));
                    const scrollAmount = this.MAX_SCROLL_SPEED * proximity;
                    dragArea.scrollTop += scrollAmount;
                } else if (mirrorRect.top < dragRect.top + this.SCROLL_ZONE && dragArea.scrollTop > 0) {
                    const proximity = Math.max(0, 1 - ((mirrorRect.top - dragRect.top) / this.SCROLL_ZONE));
                    const scrollAmount = this.MAX_SCROLL_SPEED * proximity;
                    dragArea.scrollTop -= scrollAmount;
                }
            }
        });
    }

    svyOnChanges(changes: SimpleChanges) {
        super.svyOnChanges(changes);
        if (changes) {
            for (const property of Object.keys(changes)) {
                const change = changes[property];
                switch (property) {
                    case 'boards':
                        if (this.jkanban && change.previousValue) {
                            change.previousValue.forEach((board) => {
                                this.jkanban.removeBoard(board.id)

                            });
                        }
                        if (this.jkanban && this.boards) {
                            this.jkanban.addBoards(this.boards);
                        }
                        break;
                }
            }
        }
    }

    public addElement(bid, el, position): void {
        if (position === null) {
            position = -1;
        }
        this.jkanban.addElement(bid, el, position);
    }

    public updateElement(bid, el): void {
        var t = this.jkanban.findElement(el.id);
        t.innerHTML = el.title;
    }

    public getElementIndex(element: string): number {
        const boardID = this.jkanban.getParentBoardID(element);
        if (!boardID) return -1;
        const boardsElements = this.jkanban.getBoardElements(boardID);
        if (!boardsElements?.length) return -1;
        return [...boardsElements].map(item => item.getAttribute("data-eid")).indexOf(element);
    }

    addPxIfNumber(value: string): string {
        const v = value.trim();
        return /^\d+$/.test(v) ? v + "px" : value;
    }
}

export class Item implements ICustomObjectValue {
    public id: string;
    public title: string;
    public priority: string;
    public class: string;
}

export class BoardItem implements ICustomObjectValue {
    public id: string;
    public title: string;
    public tabindex: string;
    public class: string;
    public dragTo: Array<string>;
    public item: Array<Item>;
}

export class ItemAddOptions implements ICustomObjectValue {
    public enabled: boolean;
    public content: string;
    public footer: boolean;
    public class: string;
}

export class ItemHandlerOptions implements ICustomObjectValue {
    public enabled: boolean;
    public handleClass: string;
    public customCssHandler: boolean;
    public customCssIconHandler: string;
    public customHandler: string;
}