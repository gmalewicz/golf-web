import { NavigationService } from './../_services/navigation.service';
import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { getTestCourse} from '@/_helpers/test.helper';
import { AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { getOnlineRoundFirstPlayer, getOnlineRoundSecondPlayer, getOnlineScoreCard } from '../_helpers/test.helper';
import { ScorecardHttpService } from '../_services';
import { OnlineScoreCardViewComponent } from './online-score-card-view.component';

describe('OnlineScoreCardViewComponent', () => {
  let component: OnlineScoreCardViewComponent;
  let fixture: ComponentFixture<OnlineScoreCardViewComponent>;
  let authenticationService: AuthenticationService;
  let navigationService: NavigationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineScoreCardViewComponent ],
      imports: [
        HttpClientModule,
        routing,
      ]
      ,
      providers: [HttpService,
        ScorecardHttpService,
        AuthenticationService,
        NavigationService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendScoreInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
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
    navigationService.setCourse(getTestCourse());
    navigationService.setOnlineRounds([getOnlineRoundFirstPlayer()]);
    navigationService.setOwner(1);
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create and display round for player', () => {
    navigationService.setCourse(getTestCourse());
    navigationService.setOnlineRounds([getOnlineRoundFirstPlayer()]);
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create and display course round', () => {
    navigationService.setCourse(getTestCourse());
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
    component.owner = 1;
    component.holeHCP = new Array(2).fill(0).map(() => new Array(18).fill(1));
    component.mpScore = new Array(18).fill(0);
    component.onlineRounds = [getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer()];
    component = fixture.componentInstance;
    component.handleMessage( getOnlineScoreCard());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });


  afterEach(() => {
    navigationService.clear();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
