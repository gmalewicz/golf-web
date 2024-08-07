import { OnlineNavComponent } from './../online-nav/online-nav.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonScorecardComponent } from '../common-scorecard/common-scorecard.component';
import { CommonScorecardTopComponent } from './common-scorecard-top.component';
import { AuthenticationService } from '@/_services/authentication.service';
import { authenticationServiceAdminStub } from '@/_helpers/test.helper';
import { ComponentRef } from '@angular/core';

describe('CommonScorecardTopComponent', () => {
  let component: CommonScorecardTopComponent;
  let fixture: ComponentFixture<CommonScorecardTopComponent>;
  let componentRef: ComponentRef<CommonScorecardTopComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [CommonScorecardTopComponent, CommonScorecardComponent, OnlineNavComponent,],
    providers: [
        { provide: AuthenticationService, useValue: authenticationServiceAdminStub },
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonScorecardTopComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    component.calculateStyle = () => 'edit';
    component.addScore = () => null;

    component.counter = () => [1];

    componentRef.setInput('curHoleIdx', 0);
    componentRef.setInput('curHoleStrokes', [1]);
    componentRef.setInput('curHolePutts', [1]);
    componentRef.setInput('curHolePenalties', [1]);
    componentRef.setInput('rounds', [{putts: false, penalties: false, matchPlay: false, player: {nick: 'test'}}]);
    componentRef.setInput('ballPickedUp', false);
    componentRef.setInput('totalStrokes', [1]);
    componentRef.setInput('penaltySelectorActive', [{active: false}]);
    componentRef.setInput('curPlayerIdx', 0);
    componentRef.setInput('puttSelectorActive', [{active: false}]);
    componentRef.setInput('inProgress', false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
