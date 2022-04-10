/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonScorecardComponent } from './common-scorecard.component';

describe('CommonScorecardComponent', () => {
  let component: CommonScorecardComponent;
  let fixture: ComponentFixture<CommonScorecardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonScorecardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonScorecardComponent);
    component = fixture.componentInstance;
    component.calculateStyle = () => 'edit';
    component.rounds = [{putts: false, penalties: false, matchPlay: false, player: {nick: 'test'}}];
    component.curHoleIdx = 0;
    component.curHoleStrokes = [1];
    component.ballPickedUp = false;
    component.totalStrokes = [1];
    // tslint:disable-next-line: variable-name
    component.counter = (_i: number) => [1];
    component.curHolePutts = [1];
    component.curHolePenalties = [1];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
