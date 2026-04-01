import { CommonScorecardComponent } from './../common-scorecard/common-scorecard.component';
import { OnlineNavComponent } from './../online-nav/online-nav.component';
import { CommonScorecardTopComponent } from './../common-scorecard-top/common-scorecard-top.component';
import { NavigationService } from './../_services/navigation.service';
import { ScorecardHttpService } from './../_services/scorecardHttp.service';
import { routing } from '@/app.routing';
import { AuthenticationService, HttpService } from '@/_services';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { getOnlineRoundFirstPlayer, getOnlineRoundFourthPlayer, getOnlineRoundSecondPlayer, getOnlineRoundThirdPlayer } from '../_helpers/test.helper';
import { authenticationServiceStub, getTestCourse } from '@/_helpers/test.helper';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { signal } from '@angular/core';
import { OnlineFbMatchplayComponent } from './online-fb-matchplay.component';
import { Format } from '@/_models/format';

describe('OnlineFbMatchplayComponent', () => {

  let component: OnlineFbMatchplayComponent;
  let fixture: ComponentFixture<OnlineFbMatchplayComponent>;
  let navigationService: NavigationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        MatDialogModule,
        FontAwesomeModule,
        OnlineFbMatchplayComponent, CommonScorecardTopComponent, OnlineNavComponent, CommonScorecardComponent,
    ],
    providers: [HttpService,
        ScorecardHttpService,
        NavigationService,
        { provide: MatDialogRef, useValue: {} },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendScoreInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    navigationService = TestBed.inject(NavigationService);
    navigationService.setCourseSgn(signal(getTestCourse()));
    const or1 = getOnlineRoundFirstPlayer();
    or1.format = Format.FOUR_BALL_MATCH_PLAY;
    const or2 = getOnlineRoundSecondPlayer();
    or2.format = Format.FOUR_BALL_MATCH_PLAY;
    navigationService.setOnlineRoundsSgn(signal([or1, or2, getOnlineRoundThirdPlayer(), getOnlineRoundFourthPlayer()]));
    fixture = TestBed.createComponent(OnlineFbMatchplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateMPResults', () => {
   component.getRoundData();
   expect(component).toBeTruthy();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

});

