import { NavigationService, ViewType } from './../_services/navigation.service';
import { Format } from '@/_models/format';
import { of } from 'rxjs';
import { routing } from '@/app.routing';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScorecardHttpService } from '../_services';
import { ViewSelectorComponent } from './view-selector.component';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { getOnlineRoundFirstPlayer } from '../_helpers/test.helper';
import { getTestCourse, MyRouterStub } from '@/_helpers/test.helper';
import { PreloadAllModules, Router, provideRouter, withPreloading } from '@angular/router';

describe('ViewSelectorComponent', () => {
  let component: ViewSelectorComponent;
  let fixture: ComponentFixture<ViewSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        FontAwesomeModule,
        ViewSelectorComponent
    ],
    providers: [HttpService,
        ScorecardHttpService,
        NavigationService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendScoreInterceptor, multi: true },
        { provide: Router, useClass: MyRouterStub },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
    ]
})
    .compileComponents();
  }));

  it('should create and logout', () => {
    fixture = TestBed.createComponent(ViewSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create and display', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(ViewSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });


  it('should execute view round for view Course', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(ViewSelectorComponent);
    component = fixture.componentInstance;
    component.viewRound(1, getTestCourse(), null);
    expect(component).toBeTruthy();
  });

  it('should execute view round for view player', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(ViewSelectorComponent);
    component = fixture.componentInstance;
    component.viewRound(2, null, getOnlineRoundFirstPlayer());
    expect(component).toBeTruthy();
  });

  it('should execute view round for view MP round', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(ViewSelectorComponent);
    component = fixture.componentInstance;
    component.viewRound(3, getTestCourse(), getOnlineRoundFirstPlayer());
    expect(component).toBeTruthy();
  });

  it('should define fourball tabs for match play and stroke play', () => {
    fixture = TestBed.createComponent(ViewSelectorComponent);
    component = fixture.componentInstance;
    expect(component.fourballTabs.map(t => [t.id, t.format, t.viewType])).toEqual([
      ['FBMProunds', Format.FOUR_BALL_MATCH_PLAY, ViewType.FBMP],
      ['FBSProunds', Format.FOUR_BALL_STROKE_PLAY, ViewType.FBSP]
    ]);
  });

  it('should render fourball panes and open the round with the matching view type', () => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));

    const base = getOnlineRoundFirstPlayer();
    const fbmp = {...base, id: 21, format: Format.FOUR_BALL_MATCH_PLAY, owner: 2, identifier: 5, team: 1,
      player: {id: 2, nick: 'p2', sex: false, whs: 10}};
    const fbsp = {...base, id: 22, format: Format.FOUR_BALL_STROKE_PLAY, owner: 2, identifier: 6, team: 1,
      player: {id: 2, nick: 'p2', sex: false, whs: 10}};
    // not the round owner, so it must not get its own row
    const fbspPartner = {...fbsp, id: 23, player: {id: 3, nick: 'p3', sex: false, whs: 12}};

    spyOn(TestBed.inject(ScorecardHttpService), 'getOnlineRounds').and.returnValue(of([fbmp, fbsp, fbspPartner]));

    fixture = TestBed.createComponent(ViewSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const viewRoundSpy = spyOn(component, 'viewRound');
    const el: HTMLElement = fixture.nativeElement;

    const mpRows = el.querySelectorAll<HTMLElement>('#FBMProunds tbody tr');
    const spRows = el.querySelectorAll<HTMLElement>('#FBSProunds tbody tr');
    expect(mpRows).toHaveSize(1);
    expect(spRows).toHaveSize(1);
    expect(el.querySelector('#FBMProunds')?.getAttribute('aria-labelledby')).toBe('FBMProunds-tab');
    expect(el.querySelector('#FBSProunds table')?.getAttribute('aria-describedby')).toBe('Fourball StrokePlay rounds');

    mpRows[0].click();
    expect(viewRoundSpy).toHaveBeenCalledWith(ViewType.FBMP, fbmp.course, fbmp);

    spRows[0].click();
    expect(viewRoundSpy).toHaveBeenCalledWith(ViewType.FBSP, fbsp.course, fbsp);
  });

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
