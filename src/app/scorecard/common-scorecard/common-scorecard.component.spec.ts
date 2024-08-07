/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonScorecardComponent } from './common-scorecard.component';
import { ComponentRef } from '@angular/core';

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
    componentRef.setInput('rounds', [{putts: false, penalties: false, matchPlay: false, player: {nick: 'test'}}]);

    component.calculateStyle = () => 'edit';
    component.counter = () => [1];
    componentRef.setInput('curHoleIdx', 0);
    componentRef.setInput('curHoleStrokes', [1]);
    componentRef.setInput('ballPickedUp', false);
    componentRef.setInput('totalStrokes', [1]);
    componentRef.setInput('curHolePutts', [1]);
    componentRef.setInput('curHolePenalties', [1]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
