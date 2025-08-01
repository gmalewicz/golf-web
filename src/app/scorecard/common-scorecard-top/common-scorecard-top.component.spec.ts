import { OnlineNavComponent } from './../online-nav/online-nav.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonScorecardComponent } from '../common-scorecard/common-scorecard.component';
import { CommonScorecardTopComponent } from './common-scorecard-top.component';
import { AuthenticationService } from '@/_services/authentication.service';
import { authenticationServiceAdminStub } from '@/_helpers/test.helper';
import { ComponentRef, signal } from '@angular/core';

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

    
    component.addScore = () => null;

    componentRef.setInput('curPlayerStyleSgn', ['edit']);
    componentRef.setInput('curHoleIdxSgn', 0);
    componentRef.setInput('curHoleStrokesSgn', [1]);
    componentRef.setInput('curHolePuttsSgn', [1]);
    componentRef.setInput('curHolePenaltiesSgn', [1]);
    componentRef.setInput('roundsSgn', [{putts: false, penalties: false, matchPlay: false, player: {nick: 'test'}}]);
    componentRef.setInput('ballPickedUpSgn', false);
    componentRef.setInput('totalStrokesSgn', [1]);
    componentRef.setInput('penaltySelectorActiveSgn', [{active: false}]);
    componentRef.setInput('curPlayerIdxSgn', 0);
    componentRef.setInput('puttSelectorActiveSgn', [{active: false}]);
    componentRef.setInput('inProgressSgn', false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
