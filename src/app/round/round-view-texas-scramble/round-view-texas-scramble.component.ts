import { ChangeDetectionStrategy, Component, OnInit, computed, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Round } from '@/_models/round';
import { RangePipe } from '../../_helpers/range';
import { LoadingDirective } from '@/_helpers/directives/LoadingDirective';
import { FbspPlayerSum, FbspResult } from '@/_helpers/fbsp.routines';
import {
  buildTexasTeams,
  calculateTexasGrossSums,
  calculateTexasHoleHcp,
  calculateTexasPlayerHcp,
  calculateTexasResult,
  hcpStrokesClass,
  TexasTeam
} from '@/_helpers/texas-scramble.routines';

const HOLES = 18;

@Component({
    selector: 'app-round-view-texas-scramble',
    templateUrl: './round-view-texas-scramble.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RangePipe, NgClass, LoadingDirective]
})
export class RoundViewTexasScrambleComponent implements OnInit {

  round = input.required<Round>();

  displaySgn = signal(false);
  teams: TexasTeam[] = [];
  // team players names [team], e.g. "anna/bob"
  teamNames: string[] = [];
  resultSgn = signal<FbspResult>({ teams: [], counting: [] });
  // css classes highlighting team handicap strokes [team][hole], same colours as on the online score card
  highlightHCPSgn = signal<string[][]>([]);
  // gross strokes sums per team
  grossSums: FbspPlayerSum[] = [];
  // gross strokes [player][hole]
  strokes: (number | undefined)[][] = [];

  first9parSgn = computed(() => this.round().course.holes!.map(h => h.par).reduce((p, n, i) => (i < 9 ? p + n : p), 0));
  last9parSgn = computed(() => this.round().course.par - this.first9parSgn());

  // css class marking the winning team on the hole [team][hole], same as for match play
  holeWinnerSgn = computed<string[][]>(() => {
    const teams = this.resultSgn().teams;
    return teams.map((team, teamIdx) => team.holes.map((net, hole) => {
      const other = teams[1 - teamIdx]?.holes[hole];
      return teams.length === 2 && net !== undefined && other !== undefined && net < other ? 'highlightMPResult' : '';
    }));
  });

  ngOnInit(): void {

    const players = this.round().player!;
    const course = this.round().course;

    this.teams = buildTexasTeams(players.map((pl, idx) => ({
      team: pl.roundDetails!.team ?? (players.length === 3 || idx < 2 ? 1 : 2),
      teeType: pl.roundDetails!.teeType,
      hcp: calculateTexasPlayerHcp(pl.roundDetails!.teeType,
                                   pl.roundDetails!.whs,
                                   pl.roundDetails!.sr,
                                   pl.roundDetails!.cr,
                                   course.holes!,
                                   course.par)
    })));

    const holeHcp = calculateTexasHoleHcp(this.teams, course);
    this.teamNames = this.teams.map(team => team.players.map(idx => players[idx].nick).join('/'));
    this.highlightHCPSgn.set(holeHcp.map(teamHoles => teamHoles.map(hcpStrokesClass)));

    this.strokes = players.map((_, idx) =>
      Array.from({ length: HOLES }, (__, hole) => this.round().scoreCard?.[hole + idx * HOLES]?.stroke));

    this.grossSums = calculateTexasGrossSums(this.teams, this.strokes);
    this.resultSgn.set(calculateTexasResult(this.teams, this.strokes, holeHcp));
    this.displaySgn.set(true);
  }
}
