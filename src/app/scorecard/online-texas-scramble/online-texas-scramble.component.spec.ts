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
import { provideRouter, withPreloading, PreloadAllModules, Router } from '@angular/router';
import { signal } from '@angular/core';
import { OnlineTexasScrambleComponent } from './online-texas-scramble.component';
import { Format } from '@/_models/format';
import { OnlineRound } from '../_models/onlineRound';
import { RxStompService } from '../_services/rx-stomp.service';
import { IFrame } from '@stomp/stompjs';

describe('OnlineTexasScrambleComponent', () => {

  let component: OnlineTexasScrambleComponent;
  let fixture: ComponentFixture<OnlineTexasScrambleComponent>;
  let navigationService: NavigationService;

  function getRounds(): OnlineRound[] {
    const rounds = [getOnlineRoundFirstPlayer(), getOnlineRoundSecondPlayer(), getOnlineRoundThirdPlayer(), getOnlineRoundFourthPlayer()];
    rounds.forEach((round, idx) => {
      round.format = Format.TEXAS_SCRAMBLE;
      round.mpFormat = undefined;
      round.team = Math.floor(idx / 2) + 1;
    });
    return rounds;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        MatDialogModule,
        FontAwesomeModule,
        OnlineTexasScrambleComponent, CommonScorecardTopComponent, OnlineNavComponent, CommonScorecardComponent,
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
    fixture = TestBed.createComponent(OnlineTexasScrambleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should enter the result once per team, for the first player of the team', () => {
    expect(component.allRoundsSgn().map(round => round.player.id)).toEqual([1, 2, 3, 4]);
    expect(component.onlineRoundsSgn().map(round => round.player.id)).toEqual([1, 3]);
    expect(component.entryRoundsSgn().map(round => round.player.nick)).toEqual(['Team 1', 'Team 2']);
  });

  it('should apply the allowances to the team handicap', () => {
    component['calculateMPHoleHCP']();

    const par = getTestCourse().par;
    const hcp1 = 38.4 * 116 / 113 + 66.1 - par;
    const hcp2 = 12.3 * 135 / 113 + 70.3 - par;

    const [team1, team2] = component.teamsSgn();
    // the lower handicap gets 35%
    expect(team1.allowances).toEqual([15, 35]);
    expect(team1.hcp).toBe(Math.round(hcp1 * 0.15 + hcp2 * 0.35));
    expect(team2.allowances).toEqual([35, 15]);
    expect(component.holeHcpSgn()[0].reduce((p, n) => p + n, 0)).toBe(team1.hcp);
  });

  it('should calculate net result per team from the team strokes', () => {
    component['calculateMPHoleHCP']();
    component.holeHcpSgn.set([new Array(18).fill(0), new Array(18).fill(0)]);
    component.holeHcpSgn()[0][0] = 1;
    component.strokesSgn.set(new Array(18).fill(0).map(() => new Array(2).fill(0)));
    component.strokesSgn()[0] = [5, 4];
    component.strokesSgn()[1] = [16, 0];
    component.strokesSgn.set([...component.strokesSgn()]);

    const teams = component.resultSgn().teams;
    expect(teams[0].holes.slice(0, 2)).toEqual([4, undefined]);
    expect(teams[1].holes.slice(0, 2)).toEqual([4, undefined]);
  });

  it('should mark the team with the lower net score on the hole as the winner', () => {
    component['calculateMPHoleHCP']();
    component.holeHcpSgn.set([new Array(18).fill(0), new Array(18).fill(0)]);
    component.strokesSgn.set(new Array(18).fill(0).map(() => new Array(2).fill(0)));
    component.strokesSgn()[0] = [4, 5];
    component.strokesSgn()[1] = [4, 0];
    component.strokesSgn.set([...component.strokesSgn()]);

    expect(component.holeWinnerSgn()[0].slice(0, 2)).toEqual([true, false]);
    expect(component.holeWinnerSgn()[1].slice(0, 2)).toEqual([false, false]);
  });

  it('should show the team handicap for every team player on the info page', () => {
    component['calculateMPHoleHCP']();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));

    component.onInfo();

    const rounds = navigate.calls.mostRecent().args[1]?.state?.['onlineRounds'] as OnlineRound[];
    expect(rounds).toHaveSize(4);
    expect(rounds[0].courseHCP).toBe(component.teamsSgn()[0].hcp);
    expect(rounds[1].courseHCP).toBe(component.teamsSgn()[0].hcp);
    expect(rounds[2].courseHCP).toBe(component.teamsSgn()[1].hcp);
    expect(rounds[3].courseHCP).toBe(component.teamsSgn()[1].hcp);
  });

  it('should store the team result for all team players', () => {
    const rxStompService = TestBed.inject(RxStompService);
    const publish = spyOn(rxStompService, 'publish');
    spyOn(rxStompService, 'asyncReceipt').and.returnValue(new Promise<IFrame>(() => undefined));

    component.curPlayerIdxSgn.set(1);
    component['sendMessage']({ hole: 3, stroke: 5, putt: 0, penalty: 0, orId: 19, time: '10:00', update: false,
      player: { id: 3, nick: 'test 2' } });

    expect(publish).toHaveBeenCalledTimes(2);
    const teammate = JSON.parse(publish.calls.mostRecent().args[0].body as string);
    expect(teammate.orId).toBe(20);
    expect(teammate.player.id).toBe(4);
    expect(teammate.stroke).toBe(5);
    expect(teammate.hole).toBe(3);
  });

  it('should show the winning team with the margin in the result header', () => {
    component['calculateMPHoleHCP']();
    component.holeHcpSgn.set([new Array(18).fill(0), new Array(18).fill(0)]);
    component.strokesSgn.set(new Array(18).fill(0).map(() => new Array(2).fill(0)));
    component.strokesSgn()[0] = [4, 5];
    component.strokesSgn()[1] = [4, 5];
    component.strokesSgn()[2] = [3, 4];
    component.strokesSgn.set([...component.strokesSgn()]);
    fixture.detectChanges();

    const heading = () => (fixture.nativeElement.querySelector('h3') as HTMLElement).textContent.replace(/\s+/g, ' ').trim();

    // net 11 against 14
    expect(component.teamDiffSgn()).toBe(3);
    expect(heading()).toBe('Team 1: 3');

    component.strokesSgn()[2] = [7, 4];
    component.strokesSgn.set([...component.strokesSgn()]);
    fixture.detectChanges();
    expect(component.teamDiffSgn()).toBe(-1);
    expect(heading()).toBe('Team 2: 1');
  });

  it('should show Tie in the result header when the teams have the same net score', () => {
    component['calculateMPHoleHCP']();
    component.holeHcpSgn.set([new Array(18).fill(0), new Array(18).fill(0)]);
    component.strokesSgn.set(new Array(18).fill(0).map(() => new Array(2).fill(0)));
    component.strokesSgn()[0] = [4, 4];
    component.strokesSgn.set([...component.strokesSgn()]);
    fixture.detectChanges();

    expect(component.teamDiffSgn()).toBe(0);
    expect((fixture.nativeElement.querySelector('h3') as HTMLElement).textContent.trim()).toBe('Tie');
  });

  it('should show the header rows in black, the first translatable and the second bold', () => {
    component['calculateMPHoleHCP']();
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('table[aria-describedby="Texas scramble online round results"] thead tr') as NodeListOf<HTMLElement>;
    const firstRowTeam = rows[0].querySelector('th.text-center') as HTMLElement;
    const secondRowTeam = rows[1].querySelector('th.text-center') as HTMLElement;

    expect(firstRowTeam.classList).not.toContain('golf-red');
    expect(firstRowTeam.textContent.trim()).toMatch(/^Team 1 \(/);
    expect(rows[1].classList).not.toContain('fw-normal');
    expect(secondRowTeam.classList).not.toContain('fw-normal');
  });

  it('should show the total net score of the team when there are 3 players in one team', () => {
    const rounds = getRounds().slice(0, 3);
    rounds.forEach(round => round.team = 1);
    navigationService.setOnlineRoundsSgn(signal(rounds));
    const localFixture = TestBed.createComponent(OnlineTexasScrambleComponent);
    const localComponent = localFixture.componentInstance;
    localFixture.detectChanges();

    localComponent['calculateMPHoleHCP']();
    localComponent.holeHcpSgn.set([new Array(18).fill(0)]);
    localComponent.strokesSgn.set(new Array(18).fill(0).map(() => new Array(1).fill(0)));
    localComponent.strokesSgn()[0] = [4];
    localComponent.strokesSgn()[1] = [5];
    localComponent.strokesSgn.set([...localComponent.strokesSgn()]);
    localFixture.detectChanges();

    expect(localComponent.teamDiffSgn()).toBeUndefined();
    const heading = localFixture.nativeElement.querySelector('h3') as HTMLElement;
    expect(heading.textContent.replace(/\s+/g, ' ').trim()).toBe('Team 1: 9');
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

});
