import { authenticationServiceAdminStub } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineNavComponent } from './online-nav.component';
import { ComponentRef, signal } from '@angular/core';

describe('OnlineNavComponent', () => {

  let component: OnlineNavComponent;
  let fixture: ComponentFixture<OnlineNavComponent>;
  let componentRef: ComponentRef<OnlineNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [OnlineNavComponent],
    providers: [
        { provide: AuthenticationService, useValue: authenticationServiceAdminStub },
    ]
  })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineNavComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('roundsSgn', [{putts: false, penalties: false, matchPlay: false}]);
    componentRef.setInput('curHoleStrokesSgn', [1]);
    componentRef.setInput('curPlayerIdxSgn', [0]);
    componentRef.setInput('puttSelectorActiveSgn', [{active: false}]);
    componentRef.setInput('curHolePuttsSgn', []);
    componentRef.setInput('curHolePenaltiesSgn', []);
    componentRef.setInput('penaltySelectorActiveSgn', [{active: false}]);
    componentRef.setInput('inProgressSgn', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call onPickUp', () => {
    component.onPickUp();
    expect(component.curHoleStrokesSgn()[0]).toBe(16);
  });

  it('should call onDecrease for strokes greater than 0', () => {
    component.onDecrease();
    expect(component.curHoleStrokesSgn()[0]).toBe(0);
  });

  it('should call onDecrease for strokes equal 0', () => {
    component.curHoleStrokesSgn[0] = 0;
    component.onDecrease();
    expect(component.curHoleStrokesSgn()[0]).toBe(0);
  });

  it('should call onIncrease for strokes lower than 15', () => {
    component.onIncrease();
    expect(component.curHoleStrokesSgn()[0]).toBe(2);
  });

  it('should call onIncrease for strokes equals 15', () => {
    component.curHoleStrokesSgn()[0] = 15;
    component.onIncrease();
    expect(component.curHoleStrokesSgn()[0]).toBe(15);
  });

  it('should call selectPutt', () => {
    component.selectPutt(1);
    expect(component.curHolePuttsSgn()[component.curPlayerIdxSgn()]).toBe(1);
  });

  it('should call selectPenalty', () => {
    component.selectPenalty(1);
    expect(component.curHolePenaltiesSgn()[component.curPlayerIdxSgn()]).toBe(1);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});

