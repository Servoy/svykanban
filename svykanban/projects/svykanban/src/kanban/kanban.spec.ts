import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SvyKanban } from './kanban';

describe('SvyKanban', () => {
  let component: SvyKanban;
  let fixture: ComponentFixture<SvyKanban>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SvyKanban ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvyKanban);
    component = fixture.componentInstance;
    component.servoyApi =  jasmine.createSpyObj('ServoyApi', ['getMarkupId','trustAsHtml','registerComponent','unRegisterComponent']);
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
