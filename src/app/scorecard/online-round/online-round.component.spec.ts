import { NavigationService } from './../_services/navigation.service';
import { routing } from '@/app.routing';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ScorecardHttpService } from '../_services/scorecardHttp.service';
import { OnlineRoundComponent } from './online-round.component';
import { CommonScorecardTopComponent } from '../common-scorecard-top/common-scorecard-top.component';
import { OnlineNavComponent } from '../online-nav/online-nav.component';
import { CommonScorecardComponent } from '../common-scorecard/common-scorecard.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthenticationService } from '@/_services';
import { MatDialogMock, RxStompServiceStub, authenticationServiceStub, getTestCourse } from '@/_helpers/test.helper';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { getOnlineRoundFirstPlayer } from '../_helpers/test.helper';
import { RxStompService } from '../_services/rx-stomp.service';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';


describe('OnlineRoundComponent', () => {
  let component: OnlineRoundComponent;
  let fixture: ComponentFixture<OnlineRoundComponent>;
  let navigationService: NavigationService;
  const dialog = new MatDialogMock();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        MatDialogModule,
        FontAwesomeModule,
        OnlineRoundComponent, CommonScorecardTopComponent, OnlineNavComponent, CommonScorecardComponent,
    ],
    providers: [HttpService,
        ScorecardHttpService,
        NavigationService,
        { provide: MatDialog, useValue: dialog },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: RxStompService, useClass: RxStompServiceStub },
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
  });

  it('should create but no data', () => {
    fixture = TestBed.createComponent(OnlineRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create with correct data', () => {
    navigationService.setCourse(getTestCourse());
    const onlineRound = getOnlineRoundFirstPlayer();
    onlineRound.matchPlay= false;
    navigationService.setOnlineRounds([onlineRound]);
    fixture = TestBed.createComponent(OnlineRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should add score 2', fakeAsync(() => {
    navigationService.setCourse(getTestCourse());
    const onlineRound = getOnlineRoundFirstPlayer();
    onlineRound.matchPlay= false;
    navigationService.setOnlineRounds([onlineRound]);
    fixture = TestBed.createComponent(OnlineRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.curHoleStrokes[component.curPlayerIdx] = 10;
    component.addScore();
    tick(200);
    expect(component.curHoleIdx).toBe(1);
  }));

  it('should call info for match play round', fakeAsync(() => {
    navigationService.setCourse(getTestCourse());
    const onlineRound = getOnlineRoundFirstPlayer();
    onlineRound.matchPlay= false;
    navigationService.setOnlineRounds([onlineRound]);
    fixture = TestBed.createComponent(OnlineRoundComponent);
    component = fixture.componentInstance;
    component.onlineRounds = [onlineRound];
    component.course = getTestCourse()
    component.onInfo();
  }));

  it('should call info for stroke play round', fakeAsync(() => {
    navigationService.setCourse(getTestCourse());
    const onlineRound = getOnlineRoundFirstPlayer();
    navigationService.setOnlineRounds([onlineRound]);
    fixture = TestBed.createComponent(OnlineRoundComponent);
    component = fixture.componentInstance;
    component.onlineRounds = [onlineRound];
    component.onInfo();
  }));

   it('should call onFinal', fakeAsync(() => {
    navigationService.setCourse(getTestCourse());
    const onlineRound = getOnlineRoundFirstPlayer();
    navigationService.setOnlineRounds([onlineRound]);
    fixture = TestBed.createComponent(OnlineRoundComponent);
    component = fixture.componentInstance;
    component.onFinal();
    expect(component.loadingFin).toBe(false);
  }));

  it('should call onDelete', fakeAsync(() => {
    navigationService.setCourse(getTestCourse());
    const onlineRound = getOnlineRoundFirstPlayer();
    navigationService.setOnlineRounds([onlineRound]);
    fixture = TestBed.createComponent(OnlineRoundComponent);
    component = fixture.componentInstance;
    component.onDelete();
    expect(component.loadingDel).toBe(false);
  }));

  it('should call refresh', fakeAsync(() => {
    navigationService.setCourse(getTestCourse());
    const onlineRound = getOnlineRoundFirstPlayer();
    navigationService.setOnlineRounds([onlineRound]);
    fixture = TestBed.createComponent(OnlineRoundComponent);
    component = fixture.componentInstance;
    component.refresh();
    expect(component.loadingDel).toBe(false);
  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
