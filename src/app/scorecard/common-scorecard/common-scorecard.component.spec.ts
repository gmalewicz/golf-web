/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonScorecardComponent } from './common-scorecard.component';
import { ComponentRef, signal } from '@angular/core';

describe('CommonScorecardComponent', () => {
  let component: CommonScorecardComponent;
  let fixture: ComponentFixture<CommonScorecardComponent>;
  let componentRef: ComponentRef<CommonScorecardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [CommonScorecardComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonScorecardComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('roundsSgn', [{putts: false, penalties: false, matchPlay: false, player: {nick: 'test'}}]);
    componentRef.setInput('curPlayerStyleSgn', ['edit']);
    componentRef.setInput('curHoleIdxSgn', 0);
    componentRef.setInput('curHoleStrokesSgn', [1]);
    componentRef.setInput('ballPickedUpSgn', false);
    componentRef.setInput('totalStrokesSgn', [1]);
    componentRef.setInput('curHolePuttsSgn', [1]);
    componentRef.setInput('curHolePenaltiesSgn', [1]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
