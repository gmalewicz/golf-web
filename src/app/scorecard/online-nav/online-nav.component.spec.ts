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
    componentRef.setInput('roundsSgn', signal([{putts: false, penalties: false, matchPlay: false}]));
    componentRef.setInput('curHoleStrokes', [1]);
    componentRef.setInput('curPlayerIdx', [0]);
    componentRef.setInput('puttSelectorActive', [{active: false}]);
    componentRef.setInput('curHolePutts', []);
    componentRef.setInput('curHolePenalties', []);
    componentRef.setInput('penaltySelectorActive', [{active: false}]);
    componentRef.setInput('inProgress', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call onPickUp', () => {
    component.onPickUp();
    expect(component.curHoleStrokes()[0]).toBe(16);
  });

  it('should call onDecrease for strokes greater than 0', () => {
    component.onDecrease();
    expect(component.curHoleStrokes()[0]).toBe(0);
  });

  it('should call onDecrease for strokes equal 0', () => {
    component.curHoleStrokes[0] = 0;
    component.onDecrease();
    expect(component.curHoleStrokes()[0]).toBe(0);
  });

  it('should call onIncrease for strokes lower than 15', () => {
    component.onIncrease();
    expect(component.curHoleStrokes()[0]).toBe(2);
  });

  it('should call onIncrease for strokes equals 15', () => {
    component.curHoleStrokes()[0] = 15;
    component.onIncrease();
    expect(component.curHoleStrokes()[0]).toBe(15);
  });

  it('should call selectPutt', () => {
    component.selectPutt(1);
    expect(component.curHolePutts()[component.curPlayerIdx()]).toBe(1);
  });

  it('should call selectPenalty', () => {
    component.selectPenalty(1);
    expect(component.curHolePenalties()[component.curPlayerIdx()]).toBe(1);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});

