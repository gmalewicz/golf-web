import { NavigationService } from './../_services/navigation.service';
import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { getTestCourse} from '@/_helpers/test.helper';
import { AuthenticationService, HttpService } from '@/_services';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { getOnlineRoundFirstPlayer, getOnlineRoundSecondPlayer, getOnlineScoreCard, rxStompServiceStub } from '../_helpers/test.helper';
import { ScorecardHttpService } from '../_services';
import { OnlineScoreCardViewComponent } from './online-score-card-view.component';
import { RxStompService } from '../_services/rx-stomp.service';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { signal } from '@angular/core';

describe('OnlineScoreCardViewComponent', () => {
  let component: OnlineScoreCardViewComponent;
  let fixture: ComponentFixture<OnlineScoreCardViewComponent>;
  let authenticationService: AuthenticationService;
  let navigationService: NavigationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        OnlineScoreCardViewComponent,
    ],
    providers: [HttpService,
        ScorecardHttpService,
        AuthenticationService,
        NavigationService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendScoreInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: RxStompService, useValue: rxStompServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1}]));
    navigationService = TestBed.inject(NavigationService);
  });

  it('should create but player does not exists', () => {
    history.pushState({}, '');
    authenticationService = TestBed.inject(AuthenticationService);
    authenticationService.logout();
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create and display match', () => {
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer()]));
    navigationService.setOwnerSgn(signal(1));
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create and display round for player', () => {
    navigationService.setCourseSgn(signal(getTestCourse()));
    navigationService.setOnlineRoundsSgn(signal([getOnlineRoundFirstPlayer()]));
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create and display course round', () => {
    navigationService.setCourseSgn(signal(getTestCourse()));
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should handle Message for stroke play', () => {
    component = fixture.componentInstance;
    component.handleMessage( getOnlineScoreCard());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should handle Message for match play', () => {
    component.ownerSgn.set(1);
    component.holeHCP = new Array(2).fill(0).map(() => new Array(18).fill(1));
    component.mpScore = new Array(18).fill(0);
    component.onlineRoundsSgn.set([getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer()]);
    component = fixture.componentInstance;
    component.handleMessage( getOnlineScoreCard());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });


  afterEach(() => {
    navigationService.clear();
    localStorage.removeItem('currentPlayer');
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
