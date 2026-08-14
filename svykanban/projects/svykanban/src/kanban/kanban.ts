import { Component, SimpleChanges, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICustomObjectValue, ServoyBaseComponent } from '@servoy/public';
import jKanban from "@servoy/jkanban";

@Component({
    selector: 'svykanban-board',
    templateUrl: './kanban.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule]
})
export class SvyKanban extends ServoyBaseComponent<HTMLDivElement> {

    readonly gutter = input<string>();
    readonly widthBoard = input<string>();
    readonly responsivePercentage = input<boolean>();
    readonly dragItems = input<boolean>();
    readonly dragBoards = input<boolean>();
    readonly boards = input<BoardItem[]>();
    readonly itemAddOptions = input<ItemAddOptions>();
    readonly itemHandleOptions = input<ItemHandlerOptions>();

    readonly dropEl = input<(el: any, target: any, source: any, sibbling: any) => void>();
    readonly click = input<(taskID: string, event: any, dataTarget: string | null) => void>();
    readonly buttonClick = input<(taskID: string, boardID: string, event: any, dataTarget: string | null) => void>();

    jkanban!: jKanban;

    private autoScrollRunning = false;
    private autoScrollRafId: number | null = null;
    private readonly SCROLL_ZONE = 50;
    private readonly MAX_SCROLL_SPEED = 10;

    svyOnInit() {
        super.svyOnInit();
        this.jkanban = new jKanban({
            element: '#kboard_' + this.servoyApi().getMarkupId(),
            responsivePercentage: this.responsivePercentage(),
            gutter: this.gutter(),
            widthBoard: this.addPxIfNumber(this.widthBoard()),
            dragItems: this.dragItems(),
            dragBoards: this.dragBoards(),
            itemAddOptions: this.itemAddOptions() || {},
            itemHandleOptions: this.itemHandleOptions() || {},
            buttonClick: (el: any, boardId: any, event: any) => {
                const handler = this.buttonClick();
                if (handler) {
                    const dataTarget = event?.target ? (event.target as HTMLElement).closest('[data-target]') : null;
                    handler(el.getAttribute("data-eid"), boardId, event, dataTarget ? dataTarget.getAttribute('data-target') : null);
                }
            },
            click: (el: any, e: any) => {
                const handler = this.click();
                if (handler) {
                    const dataTarget = e?.target ? (e.target as HTMLElement).closest('[data-target]') : null;
                    handler(el.getAttribute("data-eid"), e, dataTarget ? dataTarget.getAttribute('data-target') : null);
                }
            },
            dropEl: (el: any, target: any, source: any, sibling: any) => {
                const handler = this.dropEl();
                if (handler) {
                    handler(el.getAttribute("data-eid"), target.offsetParent.getAttribute("data-id"), source.offsetParent.getAttribute("data-id"), sibling ? sibling.getAttribute("data-eid") : null);
                }
            }
        });

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

        const kanbanContainer = document.querySelector('.kanban-container') as HTMLElement;
        if (kanbanContainer) {
            const containerRect = kanbanContainer.getBoundingClientRect();

            if (mirrorRect.top < containerRect.bottom && mirrorRect.bottom > containerRect.top) {
                if (mirrorRect.left < containerRect.left + this.SCROLL_ZONE && kanbanContainer.scrollLeft > 0) {
                    const proximity = Math.max(0, 1 - ((mirrorRect.left - containerRect.left) / this.SCROLL_ZONE));
                    const scrollAmount = this.MAX_SCROLL_SPEED * proximity;
                    kanbanContainer.scrollLeft -= scrollAmount;
                }
                else if (mirrorRect.right > containerRect.right - this.SCROLL_ZONE) {
                    const proximity = Math.max(0, 1 - ((containerRect.right - mirrorRect.right) / this.SCROLL_ZONE));
                    const scrollAmount = this.MAX_SCROLL_SPEED * proximity;
                    kanbanContainer.scrollLeft += scrollAmount;
                }
            }
        }

        const boardElements = document.querySelectorAll('.kanban-board');
        boardElements.forEach((board: Element) => {
            const boardElement = board as HTMLElement;
            const dragArea = boardElement.querySelector('.kanban-drag') as HTMLElement;
            if (!dragArea) return;

            const dragRect = dragArea.getBoundingClientRect();

            if (mirrorRect.left < dragRect.right && mirrorRect.right > dragRect.left) {
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
                            change.previousValue.forEach((board: any) => {
                                this.jkanban.removeBoard(board.id)

                            });
                        }
                        if (this.jkanban && this.boards()) {
                            this.jkanban.addBoards(this.boards()!);
                        }
                        break;
                }
            }
        }
    }

    public addElement(bid: any, el: any, position: any): void {
        if (position === null) {
            position = -1;
        }
        this.jkanban.addElement(bid, el, position);
    }

    public updateElement(bid: any, el: any): void {
        const t = this.jkanban.findElement(el.id);
        if (t) t.innerHTML = el.title;
    }

    public getElementIndex(element: string): number {
        const boardID = this.jkanban.getParentBoardID(element);
        if (!boardID) return -1;
        const boardsElements = this.jkanban.getBoardElements(boardID);
        if (!boardsElements?.length) return -1;
        return [...boardsElements].map(item => (item as HTMLElement).getAttribute("data-eid")).indexOf(element);
    }

    addPxIfNumber(value: string | undefined): string | undefined {
        if (!value) return value;
        const v = value.trim();
        return /^\d+$/.test(v) ? v + "px" : value;
    }
}

export class Item implements ICustomObjectValue {
    public id!: string;
    public title!: string;
    public priority!: string;
    public class!: string;
}

export class BoardItem implements ICustomObjectValue {
    public id!: string;
    public title!: string;
    public tabindex!: string;
    public class!: string;
    public dragTo!: string[];
    public item!: Item[];
}

export class ItemAddOptions implements ICustomObjectValue {
    public enabled!: boolean;
    public content!: string;
    public footer!: boolean;
    public class!: string;
}

export class ItemHandlerOptions implements ICustomObjectValue {
    public enabled!: boolean;
    public handleClass!: string;
    public customCssHandler!: boolean;
    public customCssIconHandler!: string;
    public customHandler!: string;
}
