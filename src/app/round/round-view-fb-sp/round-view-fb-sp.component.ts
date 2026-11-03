import { ChangeDetectionStrategy, Component, OnInit, computed, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Round } from '@/_models/round';
import { RangePipe } from '../../_helpers/range';
import { LoadingDirective } from '@/_helpers/directives/LoadingDirective';
import { calculateHoleHCP, calculateUnroundedCourseHCP, getPlayedCoursePar } from '@/_helpers/whs.routines';
import { calculateFbspTeamResults, FbspResult } from '@/_helpers/fbsp.routines';

const HOLES = 18;

@Component({
    selector: 'app-round-view-fb-sp',
    templateUrl: './round-view-fb-sp.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RangePipe, NgClass, LoadingDirective]
})
export class RoundViewFbSpComponent implements OnInit {

  round = input.required<Round>();

  displaySgn = signal(false);
  resultSgn = signal<FbspResult>({ teams: [], counting: [] });
  // css classes highlighting handicap strokes [player][hole], same colours as on the online score card
  highlightHCPSgn = signal<string[][]>([]);
  teamNumbers: number[] = [];
  playingHcp: number[] = [];

  first9parSgn = computed(() => this.round().course.holes!.map(h => h.par).reduce((p, n, i) => (i < 9 ? p + n : p), 0));
  last9parSgn = computed(() => this.round().course.par - this.first9parSgn());

  // css class marking the winning team result per hole [team][hole], same as for match play
  holeWinnerSgn = computed<string[][]>(() => {
    const teams = this.resultSgn().teams;
    return teams.map((team, teamIdx) => team.holes.map((net, hole) => {
      const other = teams[1 - teamIdx]?.holes[hole];
      return teams.length === 2 && net !== undefined && other !== undefined && net < other ? 'highlightMPResult' : '';
    }));
  });

  ngOnInit(): void {

    const players = this.round().player!;

    this.teamNumbers = players.map((pl, idx) => pl.roundDetails!.team ?? (players.length === 3 || idx < 2 ? 1 : 2));

    // allowance is applied to the unrounded course HCP and the result is rounded
    this.playingHcp = players.map(pl => Math.round(
      calculateUnroundedCourseHCP(pl.roundDetails!.teeType,
                                  pl.roundDetails!.whs,
                                  pl.roundDetails!.sr,
                                  pl.roundDetails!.cr,
                                  getPlayedCoursePar(this.round().course.holes!, pl.roundDetails!.teeType, this.round().course.par)) *
      (this.round().mpFormat ?? 1)));

    const holeHcp: number[][] = players.map(() => new Array(HOLES).fill(0));
    players.forEach((pl, idx) =>
      calculateHoleHCP(idx, pl.roundDetails!.teeType, this.playingHcp[idx], holeHcp, this.round().course));

    this.highlightHCPSgn.set(holeHcp.map(playerHoles => playerHoles.map(hcp => {
      switch (hcp) {
        case 0:
          return '';
        case 1:
          return 'highlightHcp';
        case 2:
          return 'highlightHcp2';
        default:
          return 'highlightHcp3';
      }
    })));

    const strokes = players.map((_, idx) =>
      Array.from({ length: HOLES }, (__, hole) => this.round().scoreCard?.[hole + idx * HOLES]?.stroke));

    this.resultSgn.set(calculateFbspTeamResults(strokes, this.teamNumbers, holeHcp));
    this.displaySgn.set(true);
  }
}
