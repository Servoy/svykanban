import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServoyApi } from '@servoy/public';
import { EventEmitter } from 'events';

import { SvyKanban } from './kanban';

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

class MockDrake extends EventEmitter {
    destroy() {}
}

describe('SvyKanban', () => {
    let component: SvyKanban;
    let fixture: ComponentFixture<SvyKanban>;
    let mockDrake: MockDrake;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SvyKanban],
        });
        fixture = TestBed.createComponent(SvyKanban);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('servoyApi', createMockServoyApi());
        fixture.componentRef.setInput('name', 'testKanban');
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should accept all handler inputs', () => {
        fixture.componentRef.setInput('dragEl', vi.fn());
        fixture.componentRef.setInput('dragendEl', vi.fn());
        fixture.componentRef.setInput('dragBoard', vi.fn());
        fixture.componentRef.setInput('dragendBoard', vi.fn());
        fixture.componentRef.setInput('dropEl', vi.fn());
        fixture.componentRef.setInput('click', vi.fn());
        fixture.componentRef.setInput('buttonClick', vi.fn());

        expect(component.dragEl()).toBeTruthy();
        expect(component.dragendEl()).toBeTruthy();
        expect(component.dragBoard()).toBeTruthy();
        expect(component.dragendBoard()).toBeTruthy();
        expect(component.dropEl()).toBeTruthy();
        expect(component.click()).toBeTruthy();
        expect(component.buttonClick()).toBeTruthy();
    });
});

describe('SvyKanban - drag handler wiring', () => {
    let component: SvyKanban;
    let fixture: ComponentFixture<SvyKanban>;
    let mockDrake: MockDrake;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SvyKanban],
        });
        fixture = TestBed.createComponent(SvyKanban);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('servoyApi', createMockServoyApi());
        fixture.componentRef.setInput('name', 'testKanban');

        mockDrake = new MockDrake();
        component.jkanban = { drake: mockDrake } as any;
    });

    it('should call dragEl handler when item is dragged', () => {
        const handler = vi.fn();
        fixture.componentRef.setInput('dragEl', handler);

        (component as any).initAutoscroll();

        const mockEl = document.createElement('div');
        const mockSource = document.createElement('div');
        mockSource.classList.add('kanban-drag');
        mockDrake.emit('drag', mockEl, mockSource);

        expect(handler).toHaveBeenCalledWith(mockEl, mockSource);
    });

    it('should call dragBoard handler when board is dragged', () => {
        const handler = vi.fn();
        fixture.componentRef.setInput('dragBoard', handler);

        (component as any).initAutoscroll();

        const mockEl = document.createElement('div');
        const mockSource = document.createElement('div');
        mockSource.classList.add('kanban-container');
        mockDrake.emit('drag', mockEl, mockSource);

        expect(handler).toHaveBeenCalledWith(mockEl, mockSource);
    });

    it('should call dragendEl handler when item drag ends', () => {
        const handler = vi.fn();
        fixture.componentRef.setInput('dragendEl', handler);

        (component as any).initAutoscroll();

        const mockEl = document.createElement('div');
        mockDrake.emit('dragend', mockEl);

        expect(handler).toHaveBeenCalledWith(mockEl);
    });

    it('should call dragendBoard handler when board drag ends', () => {
        const handler = vi.fn();
        fixture.componentRef.setInput('dragendBoard', handler);

        (component as any).initAutoscroll();

        const mockEl = document.createElement('div');
        mockEl.classList.add('kanban-board');
        mockDrake.emit('dragend', mockEl);

        expect(handler).toHaveBeenCalledWith(mockEl);
    });

    it('should not throw when drag handlers are not set', () => {
        (component as any).initAutoscroll();

        const mockEl = document.createElement('div');
        const mockSource = document.createElement('div');
        expect(() => mockDrake.emit('drag', mockEl, mockSource)).not.toThrow();
        expect(() => mockDrake.emit('dragend', mockEl)).not.toThrow();
    });

    it('should not call dragEl when source is kanban-container (board drag)', () => {
        const dragElHandler = vi.fn();
        const dragBoardHandler = vi.fn();
        fixture.componentRef.setInput('dragEl', dragElHandler);
        fixture.componentRef.setInput('dragBoard', dragBoardHandler);

        (component as any).initAutoscroll();

        const mockEl = document.createElement('div');
        const mockSource = document.createElement('div');
        mockSource.classList.add('kanban-container');
        mockDrake.emit('drag', mockEl, mockSource);

        expect(dragElHandler).not.toHaveBeenCalled();
        expect(dragBoardHandler).toHaveBeenCalled();
    });

    it('should not call dragendBoard when element is not a board', () => {
        const dragendElHandler = vi.fn();
        const dragendBoardHandler = vi.fn();
        fixture.componentRef.setInput('dragendEl', dragendElHandler);
        fixture.componentRef.setInput('dragendBoard', dragendBoardHandler);

        (component as any).initAutoscroll();

        const mockEl = document.createElement('div');
        mockDrake.emit('dragend', mockEl);

        expect(dragendElHandler).toHaveBeenCalled();
        expect(dragendBoardHandler).not.toHaveBeenCalled();
    });
});
