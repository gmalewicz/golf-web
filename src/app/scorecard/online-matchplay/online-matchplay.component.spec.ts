import { CommonScorecardComponent } from './../common-scorecard/common-scorecard.component';
import { OnlineNavComponent } from './../online-nav/online-nav.component';
import { CommonScorecardTopComponent } from './../common-scorecard-top/common-scorecard-top.component';
import { NavigationService } from './../_services/navigation.service';
import { ScorecardHttpService } from './../_services/scorecardHttp.service';
import { routing } from '@/app.routing';
import { AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnlineMatchplayComponent } from './online-matchplay.component';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { getOnlineRoundFirstPlayer, getOnlineRoundSecondPlayer } from '../_helpers/test.helper';
import { authenticationServiceStub, getTestCourse } from '@/_helpers/test.helper';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('OnlineMatchplayComponent', () => {

  let component: OnlineMatchplayComponent;
  let fixture: ComponentFixture<OnlineMatchplayComponent>;
  let navigationService: NavigationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnlineMatchplayComponent, CommonScorecardTopComponent, OnlineNavComponent, CommonScorecardComponent],
      imports: [
        HttpClientModule,
        routing,
        MatDialogModule,
        FontAwesomeModule,
      ]
      ,
      providers: [HttpService,
        ScorecardHttpService,
        NavigationService,
        { provide: MatDialogRef, useValue: {} },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendScoreInterceptor, multi: true },
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    navigationService = TestBed.inject(NavigationService);
    navigationService.setCourse(getTestCourse());
    navigationService.setOnlineRounds([getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer()]);
    fixture = TestBed.createComponent(OnlineMatchplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call highlightHcp and ecpect no-edit', () => {
    component.holeHCP = [];
    component.holeHCP[0] = [];
    component.holeHCP[0][0] = 0;
    component.highlightHcp(0, 0);
    expect(component.highlightHcp(0, 0)).toBe('no-edit');
  });

  it('should call highlightHcp and ecpect highlightHcp', () => {
    component.holeHCP = [];
    component.holeHCP[0] = [];
    component.holeHCP[0][0] = 1;
    component.highlightHcp(0, 0);
    expect(component.highlightHcp(0, 0)).toBe('highlightHcp');
  });

  it('should call updateMPResults', () => {
   component.getRoundData();
   expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});

