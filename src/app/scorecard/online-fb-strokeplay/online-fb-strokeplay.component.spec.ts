import { CommonScorecardComponent } from './../common-scorecard/common-scorecard.component';
import { OnlineNavComponent } from './../online-nav/online-nav.component';
import { CommonScorecardTopComponent } from './../common-scorecard-top/common-scorecard-top.component';
import { NavigationService } from './../_services/navigation.service';
import { ScorecardHttpService } from './../_services/scorecardHttp.service';
import { routing } from '@/app.routing';
import { AuthenticationService, HttpService } from '@/_services';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { getOnlineRoundFirstPlayer, getOnlineRoundFourthPlayer, getOnlineRoundSecondPlayer, getOnlineRoundThirdPlayer } from '../_helpers/test.helper';
import { authenticationServiceStub, getTestCourse } from '@/_helpers/test.helper';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { signal } from '@angular/core';
import { OnlineFbStrokeplayComponent } from './online-fb-strokeplay.component';
import { Format } from '@/_models/format';
import { OnlineRound } from '../_models/onlineRound';

describe('OnlineFbStrokeplayComponent', () => {

  let component: OnlineFbStrokeplayComponent;
  let fixture: ComponentFixture<OnlineFbStrokeplayComponent>;
  let navigationService: NavigationService;

  function getRounds(): OnlineRound[] {
    const rounds = [getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer(), getOnlineRoundThirdPlayer(), getOnlineRoundFourthPlayer()];
    rounds.forEach((round, idx) => {
      round.format = Format.FOUR_BALL_STROKE_PLAY;
      round.mpFormat = 0.85;
      round.team = Math.floor(idx / 2) + 1;
    });
    return rounds;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        MatDialogModule,
        FontAwesomeModule,
        OnlineFbStrokeplayComponent, CommonScorecardTopComponent, OnlineNavComponent, CommonScorecardComponent,
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
    navigationService.setOnlineRoundsSgn(signal(getRounds()));
    fixture = TestBed.createComponent(OnlineFbStrokeplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should group players into two teams', () => {
    expect(component.teamsSgn()).toEqual([
      { team: 1, players: [0, 1] },
      { team: 2, players: [2, 3] }
    ]);
  });

  it('should apply allowance to the course handicap', () => {
    component['calculateHCP'](0);
    // 38.4 * 116 / 113 + 66.1 - par, multiplied by 0.85
    const round = component.onlineRoundsSgn()[0];
    expect(round.courseHCP).toBe(Math.round((38.4 * 116 / 113 + 66.1 - getTestCourse().par) * 0.85));
  });

  it('should calculate team net as the best net score of the team players', () => {
    component.holeHcpSgn.set(new Array(4).fill(0).map(() => new Array(18).fill(0)));
    component.holeHcpSgn()[1][0] = 1;
    component.strokesSgn.set(new Array(18).fill(0).map(() => new Array(4).fill(0)));
    component.strokesSgn()[0] = [5, 5, 4, 6];
    component.strokesSgn.set([...component.strokesSgn()]);

    expect(component.teamResultsSgn()[0][0].score).toBe(4);
    expect(component.teamResultsSgn()[1][0].score).toBe(4);
    expect(component.totalTeamNetSgn()).toEqual([4, 4]);
  });

  it('should not show team result until all team players entered the score', () => {
    component.holeHcpSgn.set(new Array(4).fill(0).map(() => new Array(18).fill(0)));
    component.strokesSgn.set(new Array(18).fill(0).map(() => new Array(4).fill(0)));
    component.strokesSgn()[0] = [5, 0, 4, 6];
    component.strokesSgn.set([...component.strokesSgn()]);

    expect(component.teamResultsSgn()[0][0]).toEqual({ pickedUp: false });
    expect(component.teamResultsSgn()[1][0].score).toBe(4);
  });

  it('should ignore picked up ball unless all team players picked up', () => {
    component.holeHcpSgn.set(new Array(4).fill(0).map(() => new Array(18).fill(0)));
    component.strokesSgn.set(new Array(18).fill(0).map(() => new Array(4).fill(0)));
    component.strokesSgn()[0] = [16, 6, 16, 16];
    component.strokesSgn.set([...component.strokesSgn()]);

    expect(component.teamResultsSgn()[0][0].score).toBe(6);
    expect(component.teamResultsSgn()[1][0]).toEqual({ pickedUp: true });
    expect(component.totalTeamNetSgn()).toEqual([6, 0]);
  });

  it('should mark the counting scores of each team', () => {
    component.holeHcpSgn.set(new Array(4).fill(0).map(() => new Array(18).fill(0)));
    component.holeHcpSgn()[1][0] = 1;
    component.strokesSgn.set(new Array(18).fill(0).map(() => new Array(4).fill(0)));
    component.strokesSgn()[0] = [5, 5, 4, 4];
    component.strokesSgn()[1] = [5, 0, 4, 6];
    component.strokesSgn.set([...component.strokesSgn()]);

    // team 1: player 1 net 4 wins, team 2: tie so both count
    expect(component.countingScoresSgn()[0]).toEqual([false, true, true, true]);
    // team 1 incomplete on hole 2
    expect(component.countingScoresSgn()[1]).toEqual([false, false, true, false]);
  });

  it('should show team 1 with the winning margin when team 1 is ahead', () => {
    component.holeHcpSgn.set(new Array(4).fill(0).map(() => new Array(18).fill(0)));
    component.strokesSgn.set(new Array(18).fill(0).map(() => new Array(4).fill(0)));
    component.strokesSgn()[0] = [3, 6, 5, 6];
    component.strokesSgn.set([...component.strokesSgn()]);
    fixture.detectChanges();

    // team 1: 3, team 2: 5 => -(3 - 5) = 2
    expect(component.teamDiffSgn()).toBe(2);
    const heading: HTMLElement = fixture.nativeElement.querySelector('h3');
    expect(heading.textContent.replace(/\s+/g, ' ').trim()).toBe('Team 1: 2');
    expect(heading.querySelectorAll('.golf-red-bold').length).toBe(0);
  });

  it('should show team 2 with the winning margin when team 2 is ahead', () => {
    component.holeHcpSgn.set(new Array(4).fill(0).map(() => new Array(18).fill(0)));
    component.strokesSgn.set(new Array(18).fill(0).map(() => new Array(4).fill(0)));
    component.strokesSgn()[0] = [5, 6, 4, 6];
    component.strokesSgn.set([...component.strokesSgn()]);
    fixture.detectChanges();

    expect(component.teamDiffSgn()).toBe(-1);
    const heading: HTMLElement = fixture.nativeElement.querySelector('h3');
    expect(heading.textContent.replace(/\s+/g, ' ').trim()).toBe('Team 2: 1');
    expect(heading.querySelectorAll('.golf-red-bold').length).toBe(0);
  });

  it('should show Tie when the result is a tie', () => {
    component.holeHcpSgn.set(new Array(4).fill(0).map(() => new Array(18).fill(0)));
    component.strokesSgn.set(new Array(18).fill(0).map(() => new Array(4).fill(0)));
    component.strokesSgn()[0] = [4, 6, 4, 6];
    component.strokesSgn.set([...component.strokesSgn()]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h3').textContent.replace(/\s+/g, ' ').trim()).toBe('Tie');
  });

  it('should show the total net score of the team when there are 3 players in one team', () => {
    const rounds = getRounds().slice(0, 3);
    rounds.forEach(round => round.team = 1);
    navigationService.setOnlineRoundsSgn(signal(rounds));
    const localFixture = TestBed.createComponent(OnlineFbStrokeplayComponent);
    const localComponent = localFixture.componentInstance;
    localFixture.detectChanges();

    localComponent.holeHcpSgn.set(new Array(3).fill(0).map(() => new Array(18).fill(0)));
    localComponent.strokesSgn.set(new Array(18).fill(0).map(() => new Array(3).fill(0)));
    localComponent.strokesSgn()[0] = [5, 4, 6];
    localComponent.strokesSgn()[1] = [6, 5, 4];
    localComponent.strokesSgn.set([...localComponent.strokesSgn()]);
    localFixture.detectChanges();

    expect(localComponent.teamDiffSgn()).toBeUndefined();
    const heading: HTMLElement = localFixture.nativeElement.querySelector('h3');
    expect(heading.textContent.replace(/\s+/g, ' ').trim()).toBe('Team 1: 8');
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

});
