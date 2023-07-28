import { Component, SimpleChanges, Input, Renderer2, ChangeDetectorRef } from '@angular/core';
import { ICustomObjectValue, ServoyBaseComponent } from '@servoy/public';
import jKanban from "@servoy/jkanban";

@Component({
    selector: 'svykanban-board',
    templateUrl: './kanban.html'
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

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef) {
        super(renderer, cdRef);
    }

    svyOnInit() {
        super.svyOnInit();
        this.jkanban = new jKanban({
            element: '#kboard_' + this.servoyApi.getMarkupId(),
            responsivePercentage: this.responsivePercentage,
            gutter: this.gutter,
            widthBoard: this.widthBoard,
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
                    this.dropEl(el.getAttribute("data-eid"), target.offsetParent.getAttribute("data-id"), source.offsetParent.getAttribute("data-id"), null);
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
                        if (this.jkanban && this.boards){    
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