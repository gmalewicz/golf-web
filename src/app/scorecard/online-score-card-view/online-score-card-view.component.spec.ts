import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { getTestCourse} from '@/_helpers/test.helper';
import { AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync, tick } from '@angular/core/testing';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { getOnlineRoundFirstPlayer, getOnlineRoundSecondPlayer, getOnlineScoreCard } from '../_helpers/test.helper';
import { ScorecardHttpService } from '../_services';

import { OnlineScoreCardViewComponent } from './online-score-card-view.component';

describe('OnlineScoreCardViewComponent', () => {
  let component: OnlineScoreCardViewComponent;
  let fixture: ComponentFixture<OnlineScoreCardViewComponent>;
  let authenticationService: AuthenticationService;

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
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendScoreInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1}]));
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
    history.pushState({data: {owner : 1, course: getTestCourse(), teeTime : '20:29'}}, '');
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create and display round for player', () => {
    history.pushState({data: {course: getTestCourse(), teeTime : '20:29', onlineRound: getOnlineRoundFirstPlayer()}}, '');
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create and display course round', () => {
    history.pushState({data: {course: getTestCourse(), teeTime : '20:29'}}, '');
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should handle Message for stroke play', () => {
    history.pushState({}, '');
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


  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
