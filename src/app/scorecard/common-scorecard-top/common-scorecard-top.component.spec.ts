import { OnlineNavComponent } from './../online-nav/online-nav.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonScorecardComponent } from '../common-scorecard/common-scorecard.component';
import { CommonScorecardTopComponent } from './common-scorecard-top.component';

describe('CommonScorecardTopComponent', () => {
  let component: CommonScorecardTopComponent;
  let fixture: ComponentFixture<CommonScorecardTopComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonScorecardTopComponent, CommonScorecardComponent, OnlineNavComponent],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonScorecardTopComponent);
    component = fixture.componentInstance;
    component.rounds = [{putts: false, penalties: false, matchPlay: false, player: {nick: 'test'}}];
    component.calculateStyle = () => 'edit';
    component.addScore = () => null;
    // tslint:disable-next-line: variable-name
    component.counter = () => [1];
    component.curHoleIdx = 0;
    component.curHoleStrokes = [1];
    component.ballPickedUp = false;
    component.totalStrokes = [1];

    component.curHolePutts = [1];
    component.curHolePenalties = [1];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
