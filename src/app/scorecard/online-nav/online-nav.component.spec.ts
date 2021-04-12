import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineNavComponent } from './online-nav.component';

describe('OnlineNavComponent', () => {

  let component: OnlineNavComponent;
  let fixture: ComponentFixture<OnlineNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnlineNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineNavComponent);
    component = fixture.componentInstance;
    component.curHoleStrokes = [1];
    component.curPlayerIdx = 0;
    component.rounds = [{putts: false, penalties: false, matchPlay: false}];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
