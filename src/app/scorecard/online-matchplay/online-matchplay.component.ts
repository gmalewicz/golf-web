import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ScorecardHttpService } from '../_services';
import { calculateCourseHCP, calculateHoleHCP, getPlayedCoursePar } from '@/_helpers';
import { OnlineRoundBaseComponent } from '../_helpers/online-round-base';

@Component({
  selector: 'app-online-matchplay',
  templateUrl: './online-matchplay.component.html',
  styleUrls: ['./online-matchplay.component.css']
})
export class OnlineMatchplayComponent extends OnlineRoundBaseComponent implements OnInit  {

  holeHCP: number[][];
  // -2 not set
  // -1 first player won
  // 0 tie
  // 1 second player won
  mpScore: number[];
  mpTotal: number[];

  constructor(protected httpService: HttpService,
              protected scorecardHttpService: ScorecardHttpService,
              protected alertService: AlertService,
              protected dialog: MatDialog,
              protected authenticationService: AuthenticationService,
              protected router: Router) {
    super(httpService, scorecardHttpService, alertService, dialog, authenticationService, router);
  }


  ngOnInit(): void {

    this.mpScore = new Array(18).fill(-2);
    this.mpTotal = new Array(2).fill(0);
    super.ngOnInit();
  }

  getRoundData() {

    this.holeHCP = new Array(this.onlineRounds.length).fill(0).map(() => new Array(18).fill(0));

    super.getRoundData();
  }

  protected calculateHCP(i: number) {
     // calculate course HCP for each player
     const par = getPlayedCoursePar(this.course.holes, this.onlineRounds[i].tee.teeType, this.course.par);

     this.onlineRounds[i].courseHCP = calculateCourseHCP(this.onlineRounds[i].tee.teeType,
                                                         this.onlineRounds[i].player.whs,
                                                         this.onlineRounds[i].tee.sr,
                                                         this.onlineRounds[i].tee.cr,
                                                         par);

     calculateHoleHCP( i,
                       this.onlineRounds[i].tee.teeType,
                       this.onlineRounds[i].courseHCP,
                       this.holeHCP,
                       this.course);
  }

  protected updateMPresults() {
    this.mpScore.forEach((result, idx) => this.updateMpResult(idx));
    this.updateMpTotal();
  }

  protected updateMpResult(strokeIdx: number) {

    // console.log('p1: ' + this.mpScore[strokeIdx]);

    // update mp score if score enetered for both players
    if (this.strokes[strokeIdx][0] > 0 && this.strokes[strokeIdx][1] > 0) {
      const result = this.strokes[strokeIdx][0] - this.holeHCP[0][strokeIdx] - (this.strokes[strokeIdx][1] - this.holeHCP[1][strokeIdx]);

      // console.log('result: ' + result);

      if (result < 0) {
        this.mpScore[strokeIdx] = -1;
      } else if (result === 0) {
        this.mpScore[strokeIdx] = 0;
      } else {
        this.mpScore[strokeIdx] = 1;
      }
    }
  }

  protected updateMpTotal() {

    // console.log('mscore: ' + this.mpScore);
    // console.log('updMPTotal called: ' + this.mpTotal[0]);

    this.mpTotal[0] = this.mpScore.reduce((p, c) => {if (c === -1) {return p + 1; } else {return p; }}, 0);
    this.mpTotal[1] = this.mpScore.reduce((p, c) => {if (c === 1) {return p + 1; } else {return p; }}, 0);

    // console.log('updMPTotal called: ' + this.mpTotal[0]);
    // console.log('updMPTotal called: ' + this.mpTotal[1]);

  }
}
