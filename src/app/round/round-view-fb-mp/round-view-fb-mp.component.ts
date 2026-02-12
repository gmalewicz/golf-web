import { calculateHoleHCP, calculateUnroundedCourseHCP, createMPResultHistory, createMPResultText } from '@/_helpers/whs.routines';
import { Round } from '@/_models/round';
import { HttpService } from '@/_services/http.service';
import { ChangeDetectionStrategy, Component, OnInit, WritableSignal, computed, input, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { RangePipe } from "../../_helpers/range";
import { Format } from '@/_models/format';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-round-view-fb-mp',
    templateUrl: './round-view-fb-mp.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RangePipe, NgClass]
})
export class RoundViewFbMpComponent implements OnInit {

  round = input.required<Round>();

  holeHCP: number[][];
  highlightHCPSgn: WritableSignal<string[][]> = signal(new Array(4).fill('no-highlight').map(() => new Array(18).fill('no-highlight')));
  highlightWinnerSgn:  WritableSignal<string[][]> = signal(new Array(4).fill('').map(() => new Array(18).fill('')));
  highlightResultSgn:  WritableSignal<string[][]> = signal(new Array(2).fill('').map(() => new Array(18).fill('')));
  holeMpResult: number[][];
  displaySgn = signal(false);
  last9parSgn = computed (() => this.round().course.par - this.first9parSgn());

  first9parSgn = computed (() => this.round().course.holes.map(h => h.par).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } }, 0));

  // -2 not set
  // -1 first player won
  // 0 tie
  // 1 second player won
  mpScore: number[];
  mpResultSgn: WritableSignal<string[]> = signal(new Array(2));
  mpResultHistorySgn: WritableSignal<string[][]> = signal((new Array(2).fill('').map(() => new Array(18).fill(''))));

  readonly teamNumbers: number[] = [1,1,2,2];

  constructor(private readonly httpService: HttpService) { }

  ngOnInit(): void {

    this.holeHCP = new Array(4).fill(0).map(() => new Array(18).fill(0));
    this.holeMpResult = new Array(2).fill(0).map(() => new Array(18).fill(0));
    this.mpScore = new Array(18).fill(-2);
    this.calculateResults();
  }

  private calculateResults() {

    if (this.round().player[0].roundDetails === undefined) {

      this.httpService.getPlayersRoundDetails(this.round().id).pipe(tap(
        prList => {
          prList.forEach(pr => {
            this.round().player.forEach(pl => {
              if (pl.id === pr.playerId) {
                pl.roundDetails = pr;
              }
            });
          });

          this.updMPresults();
          this.displaySgn.set(true);
        })
      ).subscribe();
    } else {
      this.updMPresults();
      this.displaySgn.set(true);
    }
  }

  private updMPresults() {

    this.round().player.forEach((pl) => {

      pl.roundDetails.courseHCP = calculateUnroundedCourseHCP(pl.roundDetails.teeType,
                                                              pl.roundDetails.whs,
                                                              pl.roundDetails.sr,
                                                              pl.roundDetails.cr,
                                                              this.round().course.par);  
    });

    const minHcp = this.round().player.reduce((prevVal, pl) => Math.min(pl.roundDetails.courseHCP, prevVal), this.round().player[0].roundDetails.courseHCP);
    this.round().player.forEach(pl => pl.roundDetails.courseHCP -= minHcp);
    this.round().player.forEach(pl => pl.roundDetails.courseHCP = Math.round(pl.roundDetails.courseHCP * this.round().mpFormat));

    for (let i = 0; i < 4; i++) {
      calculateHoleHCP(
        i,
        this.round().player[i].roundDetails.teeType,
        this.round().player[i].roundDetails.courseHCP,
        this.holeHCP,
        this.round().course
      );
    }

    //prepare highlightHcp array based on holeHCP
    this.holeHCP.forEach((_result, idx) => 
      _result.forEach((_, jdx) => {     
        switch (this.holeHCP[idx][jdx]) {
          case 3:
            this.highlightHCPSgn()[idx][jdx] = 'highlightHcp3';
            break;
          case 2:
            this.highlightHCPSgn()[idx][jdx] = 'highlightHcp2';
            break;
          case 1:
            this.highlightHCPSgn()[idx][jdx] = 'highlightHcp';
            break;
          default:
            this.highlightHCPSgn()[idx][jdx] = 'no-highlight';
        }
      })
    );  

    this.highlightHCPSgn.set([...this.highlightHCPSgn()]); // trigger change detection

    this.calculateMpResult();
    // calculate MP result texts
    this.mpResultSgn.set(createMPResultText("Team 1", "Team 2", this.mpScore, Format.MATCH_PLAY));
    // calculate MP result history
    this.mpResultHistorySgn.set(createMPResultHistory(this.mpScore));
  }

  private calculateMpResult() {

    this.round().scoreCard.slice(0, 18).forEach((sc, index) => {

      // not all holes played
      if (sc.hole !== index + 1) {
        return;
      }

      // skip holes that are not played
      const allResultsIn = (sc.stroke !== 0 && 
                            this.round().scoreCard[index + 18].stroke !== 0 &&
                            this.round().scoreCard[index + 36].stroke !== 0 &&
                            this.round().scoreCard[index + 54].stroke !== 0);

      // all results are in
      if (allResultsIn) {

        const player1Result = sc.stroke - this.holeHCP[0][index];
        const player2Result = this.round().scoreCard[index + 18].stroke - this.holeHCP[1][index];
        const player3Result = this.round().scoreCard[index + 36].stroke - this.holeHCP[2][index];
        const player4Result = this.round().scoreCard[index + 54].stroke - this.holeHCP[3][index];

        const firstTeamResult = Math.min(player1Result, player2Result);
        const secondTeamResult = Math.min(player3Result, player4Result);

        if (firstTeamResult < secondTeamResult) {
          this.mpScore[index] = -1;
          this.highlightResultSgn()[0][index] = "highlightMPResult";
        } else if (firstTeamResult === secondTeamResult) {
          this.mpScore[index] = 0;
        } else {
          this.highlightResultSgn()[1][index] = "highlightMPResult";
          this.mpScore[index] = 1;
        }

        const minScore = Math.min(player1Result, player2Result, player3Result, player4Result);

        //highlight the winner(s)
        this.highlightWinnerSgn()[0][index] = (player1Result === minScore) ? 'golf-red-bold' : '';
        this.highlightWinnerSgn()[1][index] = (player2Result === minScore) ? 'golf-red-bold' : '';
        this.highlightWinnerSgn()[2][index] = (player3Result === minScore) ? 'golf-red-bold' : '';
        this.highlightWinnerSgn()[3][index] = (player4Result === minScore) ? 'golf-red-bold' : '';
      }
    });
  }
}
