import { OnlineNavComponent } from './../online-nav/online-nav.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonScorecardComponent } from '../common-scorecard/common-scorecard.component';
import { CommonScorecardTopComponent } from './common-scorecard-top.component';
import { AuthenticationService } from '@/_services/authentication.service';
import { authenticationServiceAdminStub } from '@/_helpers/test.helper';

describe('CommonScorecardTopComponent', () => {
  let component: CommonScorecardTopComponent;
  let fixture: ComponentFixture<CommonScorecardTopComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonScorecardTopComponent, CommonScorecardComponent, OnlineNavComponent],
      providers: [
        { provide: AuthenticationService, useValue: authenticationServiceAdminStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonScorecardTopComponent);
    component = fixture.componentInstance;
    component.rounds = [{putts: false, penalties: false, matchPlay: false, player: {nick: 'test'}}];
    component.calculateStyle = () => 'edit';
    component.addScore = () => null;

    component.counter = () => [1];
    component.curHoleIdx = 0;
    component.curHoleStrokes = [1];
    component.ballPickedUp = false;
    component.totalStrokes = [1];

    component.curHolePutts = [1];
    component.curHolePenalties = [1];

    component.switchMode= () => null;


    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
