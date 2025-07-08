import { calculateCourseHCP, calculateHoleHCP, createMPResultHistory, createMPResultText, getPlayedCoursePar } from '@/_helpers/whs.routines';
import { Round } from '@/_models/round';
import { HttpService } from '@/_services/http.service';
import { Component, OnInit, input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { NgClass } from '@angular/common';
import { RangePipe } from "../../_helpers/range";

@Component({
    selector: 'app-round-view-mp',
    templateUrl: './round-view-mp.component.html',
    imports: [NgClass, RangePipe]
})
export class RoundViewMPComponent implements OnInit {

  round = input.required<Round>();

  holeHCP: number[][];
  highlightHCP: string[][];
  holeMpResult: number[][];
  display = false;
  first9par: number;
  last9par: number;
  // -2 not set
  // -1 first player won
  // 0 tie
  // 1 second player won
  mpScore: number[];
  mpResult: string[];
  mpResultHistory: string[][];

  constructor(private readonly httpService: HttpService) { }

  ngOnInit(): void {

    this.holeHCP = new Array(2).fill(0).map(() => new Array(18).fill(0));
    this.highlightHCP = new Array(2).fill('no-edit').map(() => new Array(18).fill('no-edit'));
    this.holeMpResult = new Array(2).fill(0).map(() => new Array(18).fill(0));
    this.mpScore = new Array(18).fill(-2);
    this.mpResult = new Array(2);
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
          this.display = true;
        })
      ).subscribe();
    } else {
      this.updMPresults();
      this.display = true;
    }
  }

  private updMPresults() {

    this.round().player.forEach((pl) => {

      pl.roundDetails.courseHCP = calculateCourseHCP(pl.roundDetails.teeType,
                                                    pl.roundDetails.whs,
                                                    pl.roundDetails.sr,
                                                    pl.roundDetails.cr,
                                                    getPlayedCoursePar(this.round().course.holes ,
                                                                      pl.roundDetails.teeType,
                                                                      this.round().course.par));
    });

    const hcpDiff = this.round().player[0].roundDetails.courseHCP - this.round().player[1].roundDetails.courseHCP;
    let corHcpDiff = Math.abs(hcpDiff * this.round().mpFormat);
    if (corHcpDiff - Math.floor(corHcpDiff) >= 0.5) {
      corHcpDiff = Math.ceil(corHcpDiff);
    } else {
      corHcpDiff = Math.floor(corHcpDiff);
    }

    if (hcpDiff >= 0) {
      this.round().player[0].roundDetails.mpHCP = corHcpDiff;
      this.round().player[1].roundDetails.mpHCP = 0;
    } else {
      this.round().player[0].roundDetails.mpHCP = 0;
      this.round().player[1].roundDetails.mpHCP = corHcpDiff;
    }

    calculateHoleHCP( 0,
      this.round().player[0].roundDetails.teeType,
      this.round().player[0].roundDetails.mpHCP,
       this.holeHCP,
       this.round().course);

    calculateHoleHCP( 1,
      this.round().player[1].roundDetails.teeType,
      this.round().player[1].roundDetails.mpHCP,
      this.holeHCP,
      this.round().course);

    this.highlightHCP[0] = this.holeHCP[0].map(hcp => hcp > 0 ? 'highlightHcp' : 'no-edit');
    this.highlightHCP[1] = this.holeHCP[1].map(hcp => hcp > 0 ? 'highlightHcp' : 'no-edit');  

    this.calculateMpResult();
    // calculate MP result texts
    this.mpResult = createMPResultText(this.round().player[0].nick, this.round().player[1].nick, this.mpScore);
    // calculate MP result history
    this.mpResultHistory = createMPResultHistory(this.mpScore);

    this.first9par = this.round().course.holes.map(h => h.par).
            reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } }, 0);
    this.last9par = this.round().course.par - this.first9par;
  }

  private calculateMpResult() {

    this.round().scoreCard.slice(0, 18).forEach((sc, index) => {

      // skip holes that are not played
      if (sc.stroke === 0 || this.round().scoreCard[18 + index].stroke === 0) {
        return;
      }

      // calculate mp result
      const result = sc.stroke - this.holeHCP[0][index] -
      (this.round().scoreCard[18 + index].stroke - this.holeHCP[1][index]);

      if (result < 0) {
        this.holeMpResult[0][index] = 1;
        this.mpScore[index] = -1;
      } else if (result > 0) {
        this.holeMpResult[1][index] = 1;
        this.mpScore[index] = 1;
      } else {
        this.mpScore[index] = 0;
      }
    });
  }
}
