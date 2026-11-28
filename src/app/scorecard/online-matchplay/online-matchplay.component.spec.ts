import { CommonScorecardComponent } from './../common-scorecard/common-scorecard.component';
import { OnlineNavComponent } from './../online-nav/online-nav.component';
import { CommonScorecardTopComponent } from './../common-scorecard-top/common-scorecard-top.component';
import { NavigationService } from './../_services/navigation.service';
import { ScorecardHttpService } from './../_services/scorecardHttp.service';
import { routing } from '@/app.routing';
import { AuthenticationService, HttpService } from '@/_services';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnlineMatchplayComponent } from './online-matchplay.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { getOnlineRoundFirstPlayer, getOnlineRoundSecondPlayer } from '../_helpers/test.helper';
import { authenticationServiceStub, getTestCourse } from '@/_helpers/test.helper';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { signal } from '@angular/core';
import { NEVER } from 'rxjs';

describe('OnlineMatchplayComponent', () => {

  let component: OnlineMatchplayComponent;
  let fixture: ComponentFixture<OnlineMatchplayComponent>;
  let navigationService: NavigationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        MatDialogModule,
        FontAwesomeModule,
        OnlineMatchplayComponent, CommonScorecardTopComponent, OnlineNavComponent, CommonScorecardComponent,
    ],
    providers: [HttpService,
        ScorecardHttpService,
        NavigationService,
        { provide: MatDialogRef, useValue: {} },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendScoreInterceptor, multi: true },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    navigationService = TestBed.inject(NavigationService);
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer()]));
    fixture = TestBed.createComponent(OnlineMatchplayComponent);
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

  it('should render without errors when course holes are not loaded yet', () => {
    const courseWithoutHoles = { ...getTestCourse(), holes: undefined };
    navigationService.setCourseSgn(signal(courseWithoutHoles));
    navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer()]));
    spyOn(TestBed.inject(HttpService), 'getHoles').and.returnValue(NEVER);
    const localFixture = TestBed.createComponent(OnlineMatchplayComponent);

    expect(() => localFixture.detectChanges()).not.toThrow();
  });

  it('should highlight holes according to the number of additional strokes', () => {
    const classes = [3, 2, 1, 0].map(hcp => component['getHcpHighlightClass'](hcp));

    expect(classes).toEqual(['highlightHcp3', 'highlightHcp2', 'highlightHcp', 'no-edit']);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

});

