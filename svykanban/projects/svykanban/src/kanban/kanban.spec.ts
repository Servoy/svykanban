import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { SvyKanban } from './kanban';

describe('SvyKanban', () => {
  let component: SvyKanban;
  let fixture: ComponentFixture<SvyKanban>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SvyKanban]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SvyKanban);
    component = fixture.componentInstance;
    component.servoyApi = {
      getMarkupId: vi.fn(),
      trustAsHtml: vi.fn(),
      registerComponent: vi.fn(),
      unRegisterComponent: vi.fn(),
    } as any;
    fixture.detectChanges();
  });

  it.skip('should create', () => {
    expect(component).toBeTruthy();
  });
});
