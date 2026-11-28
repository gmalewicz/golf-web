import { Component, computed, signal, ChangeDetectionStrategy, WritableSignal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FbspResult } from '@/_helpers/fbsp.routines';
import {
  buildTexasTeams,
  calculateTexasHoleHcp,
  calculateTexasPlayerHcp,
  calculateTexasResult,
  hcpStrokesClass,
  TexasTeam
} from '@/_helpers/texas-scramble.routines';
import { LoadingDirective } from '@/_helpers/directives/LoadingDirective';
import { OnlineRoundBaseComponent } from '../_helpers/online-round-base';
import { OnlineRound } from '../_models/onlineRound';
import { OnlineScoreCard } from '../_models/onlineScoreCard';
import { NavigationService } from '../_services/navigation.service';
import { CommonScorecardTopComponent } from '../common-scorecard-top/common-scorecard-top.component';
import { RangePipe } from '../../_helpers/range';

@Component({
    selector: 'app-online-texas-scramble',
    templateUrl: './online-texas-scramble.component.html',
    styleUrls: ['./online-texas-scramble.component.css'],
    imports: [CommonScorecardTopComponent,
              NgClass,
              FaIconComponent,
              MatButton,
              RangePipe,
              LoadingDirective],
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [NavigationService]
})
export class OnlineTexasScrambleComponent extends OnlineRoundBaseComponent {

  // All players of the round sorted by team. The base component works on the team scorers only (the first player of
  // each team), because a scramble team plays one ball and the owner enters a single result per team and hole.
  allRoundsSgn = signal<OnlineRound[]>([]);

  private readonly scorersSgn = signal<OnlineRound[]>([]);

  teamsSgn = signal<TexasTeam[]>([]);

  // team handicap strokes [team][hole]
  holeHcpSgn = signal<number[][]>([]);

  // the score entry shows teams instead of players
  entryRoundsSgn = computed<OnlineRound[]>(() =>
    this.scorersSgn().map(round => ({ ...round, player: { ...round.player, nick: `Team ${round.team}` } }))
  );

  // team players names [team], e.g. "anna/bob"
  teamNamesSgn = computed<string[]>(() =>
    this.teamsSgn().map(team => team.players.map(idx => this.allRoundsSgn()[idx].player.nick).join('/')));

  highlightHCPSgn = computed<string[][]>(() =>
    this.holeHcpSgn().map(teamHoles => teamHoles.map(hcpStrokesClass))
  );

  // gross strokes [player][hole], filled for the team scorers
  private readonly scorerStrokesSgn = computed<number[][]>(() => {
    const strokes: number[][] = this.allRoundsSgn().map(() => []);
    this.teamsSgn().forEach((team, idx) => strokes[team.scorer] = this.strokesSgn().map(holeStrokes => holeStrokes[idx]));
    return strokes;
  });

  resultSgn = computed<FbspResult>(() =>
    calculateTexasResult(this.teamsSgn(), this.scorerStrokesSgn(), this.holeHcpSgn())
  );

  // true when the team has the lower net score than the other team on the hole [team][hole]
  holeWinnerSgn = computed<boolean[][]>(() => {
    const teams = this.resultSgn().teams;
    return teams.map((team, idx) => team.holes.map((net, hole) => {
      const other = teams[1 - idx]?.holes[hole];
      return teams.length === 2 && net !== undefined && other !== undefined && net < other;
    }));
  });

  constructor() {
    super();
  }

  protected selectOnlineRounds(rounds: WritableSignal<OnlineRound[]>): WritableSignal<OnlineRound[]> {

    const all = [...rounds()].sort((or1, or2) => or1.team - or2.team || or1.player.id - or2.player.id);
    this.allRoundsSgn.set(all);
    this.scorersSgn.set(all.filter((round, idx) => all.findIndex(other => other.team === round.team) === idx));

    return this.scorersSgn;
  }

  protected calculateMPHoleHCP() {

    const course = this.courseSgn();

    const teams = buildTexasTeams(this.allRoundsSgn().map(round => ({
      team: round.team,
      teeType: round.tee.teeType,
      hcp: calculateTexasPlayerHcp(round.tee.teeType,
                                   round.player.whs,
                                   round.tee.sr,
                                   round.tee.cr,
                                   course.holes,
                                   course.par)
    })));

    this.teamsSgn.set(teams);
    this.holeHcpSgn.set(calculateTexasHoleHcp(teams, course));
    this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection
  }

  // the team result is stored for all team players
  protected sendMessage(onlineScoreCard: OnlineScoreCard) {

    super.sendMessage(onlineScoreCard);

    const team = this.onlineRoundsSgn()[this.curPlayerIdxSgn()].team;

    this.allRoundsSgn()
      .filter(round => round.team === team && round.id !== onlineScoreCard.orId)
      .forEach(round => this.rxStompService.publish({
        destination: '/app/hole',
        body: JSON.stringify({ ...onlineScoreCard, orId: round.id, player: { id: round.player.id, nick: round.player.nick } })
      }));
  }

  onInfo() {

    // the info page shows the team handicap for every player of the team
    this.allRoundsSgn().forEach(round => {
      round.courseHCP = this.teamsSgn().find(team => team.team === round.team)?.hcp;
    });

    this.router
      .navigate(['myScorecard/onlineScoreCardInfo'], { state: { onlineRounds: this.allRoundsSgn() } })
      .catch(error => console.log(error));
  }
}
