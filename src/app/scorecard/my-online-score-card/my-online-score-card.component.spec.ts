import { NavigationService } from '../_services/navigation.service';
import { routing } from '@/app.routing';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScorecardHttpService } from '../_services';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { getOnlineRoundFirstPlayer } from '../_helpers/test.helper';
import { getTestCourse, MyRouterStub } from '@/_helpers/test.helper';
import { PreloadAllModules, Router, provideRouter, withPreloading } from '@angular/router';
import { MyOnlineScoreCardComponent } from './my-online-score-card.component';

describe('OnlineScoreCardComponent', () => {
  let component: MyOnlineScoreCardComponent;
  let fixture: ComponentFixture<MyOnlineScoreCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        FontAwesomeModule,
        MyOnlineScoreCardComponent
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
    fixture = TestBed.createComponent(MyOnlineScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create and display', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(MyOnlineScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should execute continue round', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(MyOnlineScoreCardComponent);
    component = fixture.componentInstance;
    component.myOnlineRounds = [getOnlineRoundFirstPlayer()];
    component.myOnlineRounds[0].course = getTestCourse();
    component.showRound();
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
