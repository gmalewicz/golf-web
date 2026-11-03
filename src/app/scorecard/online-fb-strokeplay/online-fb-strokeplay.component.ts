import { Component, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { calculateHoleHCP, calculateUnroundedCourseHCP, getPlayedCoursePar } from '@/_helpers';
import { ballPickedUpStrokes } from '@/_helpers/common';
import { LoadingDirective } from '@/_helpers/directives/LoadingDirective';
import { OnlineRoundBaseComponent } from '../_helpers/online-round-base';
import { NavigationService } from '../_services/navigation.service';
import { CommonScorecardTopComponent } from '../common-scorecard-top/common-scorecard-top.component';
import { RangePipe } from '../../_helpers/range';

export interface TeamHoleResult {
  // best net score of the team for the hole, undefined if not all players have entered the score
  // or all of them picked up the ball
  score?: number;
  pickedUp: boolean;
}

export interface TeamInfo {
  team: number;
  // indexes of the team players in onlineRoundsSgn
  players: number[];
}

@Component({
    selector: 'app-online-fb-strokeplay',
    templateUrl: './online-fb-strokeplay.component.html',
    styleUrls: ['./online-fb-strokeplay.component.css'],
    imports: [CommonScorecardTopComponent,
              NgClass,
              FaIconComponent,
              MatButton,
              RangePipe,
              LoadingDirective],
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [NavigationService]
})
export class OnlineFbStrokeplayComponent extends OnlineRoundBaseComponent {

  // hole handicap strokes [player][hole]
  holeHcpSgn = signal<number[][]>([]);

  teamsSgn = computed<TeamInfo[]>(() =>
    [1, 2]
      .map(team => ({
        team,
        players: this.onlineRoundsSgn()
          .map((round, idx) => ({ round, idx }))
          .filter(item => item.round.team === team)
          .map(item => item.idx)
      }))
      .filter(teamInfo => teamInfo.players.length > 0)
  );

  highlightHCPSgn = computed<string[][]>(() =>
    this.holeHcpSgn().map(playerHoles =>
      playerHoles.map(hcp => {
        switch (hcp) {
          case 3:
            return 'highlightHcp3';
          case 2:
            return 'highlightHcp2';
          case 1:
            return 'highlightHcp';
          default:
            return 'no-highlight';
        }
      })
    )
  );

  // team results [team][hole]
  teamResultsSgn = computed<TeamHoleResult[][]>(() =>
    this.teamsSgn().map(teamInfo =>
      this.strokesSgn().map((holeStrokes, hole) => {

        // the team result is known only after all players entered the score
        if (teamInfo.players.some(player => holeStrokes[player] === 0)) {
          return { pickedUp: false };
        }

        const nets = teamInfo.players
          .filter(player => holeStrokes[player] < ballPickedUpStrokes)
          .map(player => holeStrokes[player] - (this.holeHcpSgn()[player]?.[hole] ?? 0));

        if (nets.length === 0) {
          return { pickedUp: true };
        }
        return { score: Math.min(...nets), pickedUp: false };
      })
    )
  );

  totalTeamNetSgn = computed<number[]>(() =>
    this.teamResultsSgn().map(results => results.reduce((sum, result) => sum + (result.score ?? 0), 0))
  );

  // true for the players whose score is counted for their team on the hole [hole][player]
  countingScoresSgn = computed<boolean[][]>(() => {
    const counting: boolean[][] = this.strokesSgn().map(holeStrokes => new Array(holeStrokes.length).fill(false));

    this.teamsSgn().forEach((teamInfo, teamIdx) =>
      this.teamResultsSgn()[teamIdx].forEach((result, hole) => {
        if (result.score === undefined) {
          return;
        }
        teamInfo.players
          .filter(player => this.strokesSgn()[hole][player] < ballPickedUpStrokes &&
            this.strokesSgn()[hole][player] - (this.holeHcpSgn()[player]?.[hole] ?? 0) === result.score)
          .forEach(player => counting[hole][player] = true);
      })
    );
    return counting;
  });

  constructor() {
    super();
  }

  protected calculateHCP(i: number) {

    const round = this.onlineRoundsSgn()[i];

    // allowance is applied to the unrounded course HCP and the result is rounded
    round.courseHCP = Math.round(
      calculateUnroundedCourseHCP(round.tee.teeType,
                                  round.player.whs,
                                  round.tee.sr,
                                  round.tee.cr,
                                  getPlayedCoursePar(this.courseSgn().holes, round.tee.teeType, this.courseSgn().par)) *
      (round.mpFormat ?? 1));
  }

  protected calculateMPHoleHCP() {

    const holeHcp: number[][] = new Array(this.onlineRoundsSgn().length).fill(0).map(() => new Array(18).fill(0));

    this.onlineRoundsSgn().forEach((round, idx) =>
      calculateHoleHCP(idx, round.tee.teeType, round.courseHCP, holeHcp, this.courseSgn())
    );

    this.holeHcpSgn.set(holeHcp);
    this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection
  }
}
