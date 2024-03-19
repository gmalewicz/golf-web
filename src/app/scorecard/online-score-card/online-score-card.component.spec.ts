import { NavigationService } from './../_services/navigation.service';
import { routing } from '@/app.routing';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScorecardHttpService } from '../_services';
import { OnlineScoreCardComponent } from './online-score-card.component';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { getOnlineRoundFirstPlayer } from '../_helpers/test.helper';
import { getTestCourse, MyRouterStub } from '@/_helpers/test.helper';
import { PreloadAllModules, Router, provideRouter, withPreloading } from '@angular/router';

describe('OnlineScoreCardComponent', () => {
  let component: OnlineScoreCardComponent;
  let fixture: ComponentFixture<OnlineScoreCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        FontAwesomeModule,
        OnlineScoreCardComponent
    ],
    providers: [HttpService,
        ScorecardHttpService,
        NavigationService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendScoreInterceptor, multi: true },
        { provide: Router, useClass: MyRouterStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
    ]
})
    .compileComponents();
  }));

  it('should create and logout', () => {
    fixture = TestBed.createComponent(OnlineScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create and display', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(OnlineScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should execute continue round', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(OnlineScoreCardComponent);
    component = fixture.componentInstance;
    component.myOnlineRounds = [getOnlineRoundFirstPlayer()];
    component.myOnlineRounds[0].course = getTestCourse();
    component.continueRound('onlineRound');
    expect(component).toBeTruthy();
  });

  it('should execute view round for view Course', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(OnlineScoreCardComponent);
    component = fixture.componentInstance;
    component.viewRound(1, getTestCourse(), null);
    expect(component).toBeTruthy();
  });

  it('should execute view round for view player', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(OnlineScoreCardComponent);
    component = fixture.componentInstance;
    component.viewRound(2, null, getOnlineRoundFirstPlayer());
    expect(component).toBeTruthy();
  });

  it('should execute view round for view MP round', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(OnlineScoreCardComponent);
    component = fixture.componentInstance;
    component.viewRound(3, getTestCourse(), getOnlineRoundFirstPlayer());
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
