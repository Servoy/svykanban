import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServoyApi } from '@servoy/public';
import { EventEmitter } from 'events';

import { SvyKanban } from './kanban';

// ---------------------------------------------------------------------------
// Mock @servoy/jkanban. We DO NOT test the 3rd-party board; we capture the
// options the component passes to the constructor so we can drive the inline
// buttonClick / click / dropEl callbacks, and we stub the instance methods our
// component calls (addElement, addBoards, removeBoard, findElement, etc.).
//
// vi.mock is hoisted above imports, so the mock factory and the shared state it
// touches must be created with vi.hoisted (also hoisted) to avoid TDZ errors.
// ---------------------------------------------------------------------------
class MockDrake extends EventEmitter {
    destroy() { /* no-op */ }
}

const { lastCtorOptions, jKanbanMock } = vi.hoisted(() => {
    const lastCtorOptions: { value: any } = { value: null };
    const jKanbanMock = vi.fn().mockImplementation(function (this: any, options: any) {
        lastCtorOptions.value = options;
        this.options = options;
        this.drake = { on: vi.fn() };
        this.addElement = vi.fn();
        this.addBoards = vi.fn();
        this.removeBoard = vi.fn();
        this.findBoard = vi.fn();
        this.findElement = vi.fn();
        this.getParentBoardID = vi.fn();
        this.getBoardElements = vi.fn();
    });
    return { lastCtorOptions, jKanbanMock };
});

vi.mock('@servoy/jkanban', () => ({
    __esModule: true,
    default: jKanbanMock
}));

function createMockServoyApi(): ServoyApi {
    return {
        registerComponent: vi.fn(),
        unRegisterComponent: vi.fn(),
        getMarkupId: vi.fn().mockReturnValue('test-id'),
        trustAsHtml: vi.fn().mockReturnValue(false),
        startEdit: vi.fn(),
        apply: vi.fn(),
        callServerSideApi: vi.fn(),
        isInDesigner: vi.fn().mockReturnValue(false),
        isInAbsoluteLayout: vi.fn().mockReturnValue(true),
        getFormName: vi.fn().mockReturnValue('testForm'),
        getClientProperty: vi.fn(),
        formWillShow: vi.fn().mockResolvedValue(true),
        hideForm: vi.fn().mockResolvedValue(true),
    } as any;
}

function makeComponent(): { component: SvyKanban; fixture: ComponentFixture<SvyKanban> } {
    TestBed.configureTestingModule({ imports: [SvyKanban] });
    const fixture = TestBed.createComponent(SvyKanban);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('servoyApi', createMockServoyApi());
    fixture.componentRef.setInput('name', 'testKanban');
    return { component, fixture };
}

describe('SvyKanban - svyOnInit / jKanban construction', () => {
    let component: SvyKanban;
    let fixture: ComponentFixture<SvyKanban>;

    beforeEach(() => {
        lastCtorOptions.value = null;
        jKanbanMock.mockClear();
        const made = makeComponent();
        component = made.component;
        fixture = made.fixture;
    });

    afterEach(() => {
        // stop any running autoscroll RAF so the fork exits cleanly
        (component as any).stopAutoScroll?.();
    });

    it('constructs jKanban with the computed element id and passes through options', () => {
        fixture.componentRef.setInput('gutter', '10px');
        fixture.componentRef.setInput('responsivePercentage', true);
        fixture.componentRef.setInput('dragItems', true);
        fixture.componentRef.setInput('dragBoards', false);
        fixture.detectChanges();

        expect(jKanbanMock).toHaveBeenCalledTimes(1);
        const opts = lastCtorOptions.value;
        expect(opts.element).toBe('#kboard_test-id');
        expect(opts.gutter).toBe('10px');
        expect(opts.responsivePercentage).toBe(true);
        expect(opts.dragItems).toBe(true);
        expect(opts.dragBoards).toBe(false);
        expect(component.getNativeElement().id).toBe('kboard_test-id');
    });

    it('defaults itemAddOptions and itemHandleOptions to empty objects when not provided', () => {
        fixture.detectChanges();
        const opts = lastCtorOptions.value;
        expect(opts.itemAddOptions).toEqual({});
        expect(opts.itemHandleOptions).toEqual({});
    });

    it('passes through provided itemAddOptions and itemHandleOptions', () => {
        const add = { enabled: true, content: '+', footer: false, class: 'add' };
        const handle = { enabled: true, handleClass: 'h' };
        fixture.componentRef.setInput('itemAddOptions', add);
        fixture.componentRef.setInput('itemHandleOptions', handle);
        fixture.detectChanges();
        const opts = lastCtorOptions.value;
        expect(opts.itemAddOptions).toBe(add);
        expect(opts.itemHandleOptions).toBe(handle);
    });

    it('converts numeric widthBoard to px, leaves non-numeric untouched', () => {
        fixture.componentRef.setInput('widthBoard', '300');
        fixture.detectChanges();
        expect(lastCtorOptions.value.widthBoard).toBe('300px');
    });

    it('keeps widthBoard with explicit unit untouched', () => {
        fixture.componentRef.setInput('widthBoard', '40%');
        fixture.detectChanges();
        expect(lastCtorOptions.value.widthBoard).toBe('40%');
    });
});

describe('SvyKanban.addPxIfNumber', () => {
    let component: SvyKanban;

    beforeEach(() => {
        const made = makeComponent();
        component = made.component;
    });

    it('returns undefined/empty untouched', () => {
        expect(component.addPxIfNumber(undefined)).toBeUndefined();
        expect(component.addPxIfNumber('')).toBe('');
    });

    it('appends px to a plain integer string', () => {
        expect(component.addPxIfNumber('250')).toBe('250px');
        expect(component.addPxIfNumber(' 120 ')).toBe('120px');
    });

    it('leaves values that already carry a unit', () => {
        expect(component.addPxIfNumber('250px')).toBe('250px');
        expect(component.addPxIfNumber('50%')).toBe('50%');
        expect(component.addPxIfNumber('10em')).toBe('10em');
    });
});

describe('SvyKanban - inline constructor callbacks (buttonClick / click / dropEl)', () => {
    let component: SvyKanban;
    let fixture: ComponentFixture<SvyKanban>;

    beforeEach(() => {
        lastCtorOptions.value = null;
        jKanbanMock.mockClear();
        const made = makeComponent();
        component = made.component;
        fixture = made.fixture;
    });

    afterEach(() => {
        (component as any).stopAutoScroll?.();
    });

    it('buttonClick forwards eid, boardId, event and resolved data-target', () => {
        const handler = vi.fn();
        fixture.componentRef.setInput('buttonClick', handler);
        fixture.detectChanges();

        const el = document.createElement('div');
        el.setAttribute('data-eid', 'task-7');

        // event.target closest('[data-target]')
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-target', 'modal-1');
        const inner = document.createElement('span');
        wrapper.appendChild(inner);
        const event = { target: inner } as any;

        lastCtorOptions.value.buttonClick(el, 'board-A', event);

        expect(handler).toHaveBeenCalledWith('task-7', 'board-A', event, 'modal-1');
    });

    it('buttonClick passes null data-target when none is found', () => {
        const handler = vi.fn();
        fixture.componentRef.setInput('buttonClick', handler);
        fixture.detectChanges();

        const el = document.createElement('div');
        el.setAttribute('data-eid', 'task-1');
        const orphan = document.createElement('span');
        lastCtorOptions.value.buttonClick(el, 'b', { target: orphan } as any);

        expect(handler).toHaveBeenCalledWith('task-1', 'b', expect.anything(), null);
    });

    it('buttonClick does nothing when no handler is set', () => {
        fixture.detectChanges();
        const el = document.createElement('div');
        el.setAttribute('data-eid', 'x');
        expect(() => lastCtorOptions.value.buttonClick(el, 'b', { target: null } as any)).not.toThrow();
    });

    it('click forwards eid, event and resolved data-target', () => {
        const handler = vi.fn();
        fixture.componentRef.setInput('click', handler);
        fixture.detectChanges();

        const el = document.createElement('div');
        el.setAttribute('data-eid', 'card-9');

        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-target', 'detail');
        const inner = document.createElement('i');
        wrapper.appendChild(inner);

        lastCtorOptions.value.click(el, { target: inner } as any);

        expect(handler).toHaveBeenCalledWith('card-9', expect.anything(), 'detail');
    });

    it('click passes null data-target when event has no target', () => {
        const handler = vi.fn();
        fixture.componentRef.setInput('click', handler);
        fixture.detectChanges();

        const el = document.createElement('div');
        el.setAttribute('data-eid', 'card-2');
        lastCtorOptions.value.click(el, { target: null } as any);

        expect(handler).toHaveBeenCalledWith('card-2', expect.anything(), null);
    });

    it('click does nothing when no handler is set', () => {
        fixture.detectChanges();
        const el = document.createElement('div');
        el.setAttribute('data-eid', 'x');
        expect(() => lastCtorOptions.value.click(el, { target: null } as any)).not.toThrow();
    });

    it('dropEl forwards eid, target/source board ids and sibling eid', () => {
        const handler = vi.fn();
        fixture.componentRef.setInput('dropEl', handler);
        fixture.detectChanges();

        const el = document.createElement('div');
        el.setAttribute('data-eid', 'moved');

        const target = { offsetParent: { getAttribute: (n: string) => n === 'data-id' ? 'target-board' : null } } as any;
        const source = { offsetParent: { getAttribute: (n: string) => n === 'data-id' ? 'source-board' : null } } as any;
        const sibling = document.createElement('div');
        sibling.setAttribute('data-eid', 'sib');

        lastCtorOptions.value.dropEl(el, target, source, sibling);

        expect(handler).toHaveBeenCalledWith('moved', 'target-board', 'source-board', 'sib');
    });

    it('dropEl passes null sibling eid when there is no sibling', () => {
        const handler = vi.fn();
        fixture.componentRef.setInput('dropEl', handler);
        fixture.detectChanges();

        const el = document.createElement('div');
        el.setAttribute('data-eid', 'moved');
        const target = { offsetParent: { getAttribute: () => 'tb' } } as any;
        const source = { offsetParent: { getAttribute: () => 'sb' } } as any;

        lastCtorOptions.value.dropEl(el, target, source, null);

        expect(handler).toHaveBeenCalledWith('moved', 'tb', 'sb', null);
    });

    it('dropEl does nothing when no handler is set', () => {
        fixture.detectChanges();
        const el = document.createElement('div');
        el.setAttribute('data-eid', 'x');
        const target = { offsetParent: { getAttribute: () => 'tb' } } as any;
        const source = { offsetParent: { getAttribute: () => 'sb' } } as any;
        expect(() => lastCtorOptions.value.dropEl(el, target, source, null)).not.toThrow();
    });
});

describe('SvyKanban - initAutoscroll guard', () => {
    let component: SvyKanban;

    beforeEach(() => {
        const made = makeComponent();
        component = made.component;
    });

    afterEach(() => {
        (component as any).stopAutoScroll?.();
    });

    it('warns and returns when drake is unavailable', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { /* silence */ });
        component.jkanban = { drake: null } as any;
        (component as any).initAutoscroll();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it('wires drop and cancel to stopAutoScroll', () => {
        const drake = new MockDrake();
        component.jkanban = { drake } as any;
        (component as any).initAutoscroll();

        const stopSpy = vi.spyOn(component as any, 'stopAutoScroll');
        drake.emit('drop');
        drake.emit('cancel');
        expect(stopSpy).toHaveBeenCalledTimes(2);
    });

    it('starts autoscroll on drag and stops it on drop', () => {
        const drake = new MockDrake();
        component.jkanban = { drake } as any;
        (component as any).initAutoscroll();

        const startSpy = vi.spyOn(component as any, 'startAutoScroll');
        const el = document.createElement('div');
        const source = document.createElement('div');
        drake.emit('drag', el, source);
        expect(startSpy).toHaveBeenCalled();

        drake.emit('drop');
        expect((component as any).autoScrollRunning).toBe(false);
    });
});

describe('SvyKanban - autoscroll loop', () => {
    let component: SvyKanban;

    beforeEach(() => {
        const made = makeComponent();
        component = made.component;
    });

    afterEach(() => {
        (component as any).stopAutoScroll?.();
        vi.restoreAllMocks();
    });

    it('startAutoScroll is idempotent while running', () => {
        const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(1 as any);
        (component as any).startAutoScroll();
        (component as any).startAutoScroll();
        expect(rafSpy).toHaveBeenCalledTimes(1);
        expect((component as any).autoScrollRunning).toBe(true);
    });

    it('the RAF loop stops scheduling once stopped', () => {
        let captured: FrameRequestCallback | null = null;
        vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
            captured = cb;
            return 42 as any;
        });
        const updateSpy = vi.spyOn(component as any, 'updateAutoScroll').mockImplementation(() => { /* no-op */ });

        (component as any).startAutoScroll();
        expect(captured).toBeTypeOf('function');

        // run one frame -> calls update and reschedules
        captured!(0);
        expect(updateSpy).toHaveBeenCalledTimes(1);

        // stop, then a late frame must not update again
        (component as any).stopAutoScroll();
        captured!(0);
        expect(updateSpy).toHaveBeenCalledTimes(1);
    });

    it('stopAutoScroll cancels any pending RAF id', () => {
        const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => { /* no-op */ });
        (component as any).autoScrollRafId = 7;
        (component as any).autoScrollRunning = true;
        (component as any).stopAutoScroll();
        expect(cancelSpy).toHaveBeenCalledWith(7);
        expect((component as any).autoScrollRafId).toBeNull();
    });

    it('updateAutoScroll returns early when there is no gu-mirror', () => {
        // no .gu-mirror in the DOM -> must return without throwing
        expect(() => (component as any).updateAutoScroll()).not.toThrow();
    });

    it('updateAutoScroll scrolls the container left when the mirror is near the left edge', () => {
        const mirror = document.createElement('div');
        mirror.className = 'gu-mirror';
        mirror.getBoundingClientRect = () => ({ top: 100, bottom: 150, left: 10, right: 60 } as DOMRect);
        document.body.appendChild(mirror);

        const container = document.createElement('div');
        container.className = 'kanban-container';
        container.getBoundingClientRect = () => ({ top: 90, bottom: 400, left: 0, right: 500 } as DOMRect);
        Object.defineProperty(container, 'scrollLeft', { value: 100, writable: true, configurable: true });
        document.body.appendChild(container);

        (component as any).updateAutoScroll();

        expect(container.scrollLeft).toBeLessThan(100);

        mirror.remove();
        container.remove();
    });

    it('updateAutoScroll scrolls the container right when the mirror is near the right edge', () => {
        const mirror = document.createElement('div');
        mirror.className = 'gu-mirror';
        mirror.getBoundingClientRect = () => ({ top: 100, bottom: 150, left: 470, right: 498 } as DOMRect);
        document.body.appendChild(mirror);

        const container = document.createElement('div');
        container.className = 'kanban-container';
        container.getBoundingClientRect = () => ({ top: 90, bottom: 400, left: 0, right: 500 } as DOMRect);
        Object.defineProperty(container, 'scrollLeft', { value: 0, writable: true, configurable: true });
        document.body.appendChild(container);

        (component as any).updateAutoScroll();

        expect(container.scrollLeft).toBeGreaterThan(0);

        mirror.remove();
        container.remove();
    });

    it('updateAutoScroll scrolls a board drag-area vertically near its bottom', () => {
        const mirror = document.createElement('div');
        mirror.className = 'gu-mirror';
        mirror.getBoundingClientRect = () => ({ top: 100, bottom: 395, left: 10, right: 60 } as DOMRect);
        document.body.appendChild(mirror);

        const board = document.createElement('div');
        board.className = 'kanban-board';
        const dragArea = document.createElement('div');
        dragArea.className = 'kanban-drag';
        dragArea.getBoundingClientRect = () => ({ top: 90, bottom: 400, left: 0, right: 200 } as DOMRect);
        Object.defineProperty(dragArea, 'scrollTop', { value: 0, writable: true, configurable: true });
        board.appendChild(dragArea);
        document.body.appendChild(board);

        (component as any).updateAutoScroll();

        expect(dragArea.scrollTop).toBeGreaterThan(0);

        mirror.remove();
        board.remove();
    });

    it('updateAutoScroll scrolls a board drag-area up near its top', () => {
        const mirror = document.createElement('div');
        mirror.className = 'gu-mirror';
        mirror.getBoundingClientRect = () => ({ top: 95, bottom: 140, left: 10, right: 60 } as DOMRect);
        document.body.appendChild(mirror);

        const board = document.createElement('div');
        board.className = 'kanban-board';
        const dragArea = document.createElement('div');
        dragArea.className = 'kanban-drag';
        dragArea.getBoundingClientRect = () => ({ top: 90, bottom: 400, left: 0, right: 200 } as DOMRect);
        Object.defineProperty(dragArea, 'scrollTop', { value: 50, writable: true, configurable: true });
        board.appendChild(dragArea);
        document.body.appendChild(board);

        (component as any).updateAutoScroll();

        expect(dragArea.scrollTop).toBeLessThan(50);

        mirror.remove();
        board.remove();
    });

    it('updateAutoScroll ignores boards without a drag-area', () => {
        const mirror = document.createElement('div');
        mirror.className = 'gu-mirror';
        mirror.getBoundingClientRect = () => ({ top: 100, bottom: 150, left: 10, right: 60 } as DOMRect);
        document.body.appendChild(mirror);

        const board = document.createElement('div');
        board.className = 'kanban-board';
        document.body.appendChild(board);

        expect(() => (component as any).updateAutoScroll()).not.toThrow();

        mirror.remove();
        board.remove();
    });
});

describe('SvyKanban - svyOnChanges (boards)', () => {
    let component: SvyKanban;
    let fixture: ComponentFixture<SvyKanban>;
    let board: any;

    beforeEach(() => {
        const made = makeComponent();
        component = made.component;
        fixture = made.fixture;
        board = {
            addBoards: vi.fn(),
            removeBoard: vi.fn(),
            addElement: vi.fn(),
            findElement: vi.fn(),
            getParentBoardID: vi.fn(),
            getBoardElements: vi.fn(),
        };
        component.jkanban = board;
    });

    afterEach(() => {
        (component as any).stopAutoScroll?.();
    });

    it('removes previous boards then adds the new ones', () => {
        const newBoards = [{ id: 'b1', title: 'B1' }] as any;
        fixture.componentRef.setInput('boards', newBoards);

        component.svyOnChanges({
            boards: { previousValue: [{ id: 'old1' }, { id: 'old2' }], currentValue: newBoards, firstChange: false, isFirstChange: () => false }
        } as any);

        expect(board.removeBoard).toHaveBeenCalledWith('old1');
        expect(board.removeBoard).toHaveBeenCalledWith('old2');
        expect(board.addBoards).toHaveBeenCalledWith(newBoards);
    });

    it('adds boards without removing when there is no previous value', () => {
        const newBoards = [{ id: 'b1' }] as any;
        fixture.componentRef.setInput('boards', newBoards);

        component.svyOnChanges({
            boards: { previousValue: undefined, currentValue: newBoards, firstChange: true, isFirstChange: () => true }
        } as any);

        expect(board.removeBoard).not.toHaveBeenCalled();
        expect(board.addBoards).toHaveBeenCalledWith(newBoards);
    });

    it('ignores unrelated property changes', () => {
        component.svyOnChanges({
            gutter: { previousValue: '5px', currentValue: '10px', firstChange: false, isFirstChange: () => false }
        } as any);
        expect(board.removeBoard).not.toHaveBeenCalled();
        expect(board.addBoards).not.toHaveBeenCalled();
    });

    it('does nothing when changes object is empty', () => {
        expect(() => component.svyOnChanges({} as any)).not.toThrow();
        expect(board.addBoards).not.toHaveBeenCalled();
    });
});

describe('SvyKanban - public API methods', () => {
    let component: SvyKanban;
    let board: any;

    beforeEach(() => {
        const made = makeComponent();
        component = made.component;
        board = {
            addElement: vi.fn(),
            findElement: vi.fn(),
            getParentBoardID: vi.fn(),
            getBoardElements: vi.fn(),
        };
        component.jkanban = board;
    });

    afterEach(() => {
        (component as any).stopAutoScroll?.();
    });

    it('addElement forwards board id, element and position', () => {
        const el = { id: 'i1', title: 'Item' };
        component.addElement('b1', el, 2);
        expect(board.addElement).toHaveBeenCalledWith('b1', el, 2);
    });

    it('addElement converts a null position to -1 (append)', () => {
        const el = { id: 'i2', title: 'Item' };
        component.addElement('b1', el, null);
        expect(board.addElement).toHaveBeenCalledWith('b1', el, -1);
    });

    it('updateElement sets innerHTML when the element exists', () => {
        const node = document.createElement('div');
        board.findElement.mockReturnValue(node);
        component.updateElement('b1', { id: 'i1', title: '<b>new</b>' });
        expect(board.findElement).toHaveBeenCalledWith('i1');
        expect(node.innerHTML).toBe('<b>new</b>');
    });

    it('updateElement is a no-op when the element is not found', () => {
        board.findElement.mockReturnValue(null);
        expect(() => component.updateElement('b1', { id: 'missing', title: 'x' })).not.toThrow();
    });

    it('getElementIndex returns -1 when there is no parent board', () => {
        board.getParentBoardID.mockReturnValue(null);
        expect(component.getElementIndex('e1')).toBe(-1);
    });

    it('getElementIndex returns -1 when the board has no elements', () => {
        board.getParentBoardID.mockReturnValue('b1');
        board.getBoardElements.mockReturnValue([]);
        expect(component.getElementIndex('e1')).toBe(-1);
    });

    it('getElementIndex returns -1 when getBoardElements is null', () => {
        board.getParentBoardID.mockReturnValue('b1');
        board.getBoardElements.mockReturnValue(null);
        expect(component.getElementIndex('e1')).toBe(-1);
    });

    it('getElementIndex returns the zero-based index of the element by data-eid', () => {
        board.getParentBoardID.mockReturnValue('b1');
        const a = document.createElement('div'); a.setAttribute('data-eid', 'e0');
        const b = document.createElement('div'); b.setAttribute('data-eid', 'e1');
        const c = document.createElement('div'); c.setAttribute('data-eid', 'e2');
        board.getBoardElements.mockReturnValue([a, b, c]);
        expect(component.getElementIndex('e1')).toBe(1);
        expect(component.getElementIndex('e2')).toBe(2);
    });

    it('getElementIndex returns -1 when the element is not present', () => {
        board.getParentBoardID.mockReturnValue('b1');
        const a = document.createElement('div'); a.setAttribute('data-eid', 'e0');
        board.getBoardElements.mockReturnValue([a]);
        expect(component.getElementIndex('nope')).toBe(-1);
    });
});
