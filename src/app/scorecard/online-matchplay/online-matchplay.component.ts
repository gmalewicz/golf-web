import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ScorecardHttpService } from '../_services';
import { calculateCourseHCP, calculateHoleHCP, createMPResultText, getPlayedCoursePar } from '@/_helpers';
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
  mpResult: string[];

  // if greater than 0, the first player has additional strokes
  hcpDiff: number;

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
    this.mpResult = new Array(2);
    // this.mpTotal = new Array(2).fill(0);
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
  }

  protected calculateMPHoleHCP() {

    // set the better player to be scratch
    this.hcpDiff = this.onlineRounds[0].courseHCP - this.onlineRounds[1].courseHCP;
    if (this.hcpDiff >= 0) {
      this.onlineRounds[0].courseHCP = this.hcpDiff;
      this.onlineRounds[1].courseHCP = 0;
    } else {
      this.onlineRounds[0].courseHCP = 0;
      this.onlineRounds[1].courseHCP = Math.abs(this.hcpDiff);
    }

    calculateHoleHCP( 0,
                      this.onlineRounds[0].tee.teeType,
                      this.onlineRounds[0].courseHCP,
                       this.holeHCP,
                       this.course);

    calculateHoleHCP( 1,
                      this.onlineRounds[1].tee.teeType,
                      this.onlineRounds[1].courseHCP,
                      this.holeHCP,
                      this.course);

  }

  protected updateMPresults() {
    this.mpScore.forEach((result, idx) => this.updateMpResult(idx));
    // calculate MP result texts
    this.mpResult = createMPResultText(this.onlineRounds[0].player.nick, this.onlineRounds[1].player.nick, this.mpScore);
  }

  protected updateMpResult(strokeIdx: number) {

    // update mp score if score enetered for both players
    if (this.strokes[strokeIdx][0] > 0 && this.strokes[strokeIdx][1] > 0) {
      const result = this.strokes[strokeIdx][0] - this.holeHCP[0][strokeIdx] - (this.strokes[strokeIdx][1] - this.holeHCP[1][strokeIdx]);

      if (result < 0) {
        this.mpScore[strokeIdx] = -1;
      } else if (result === 0) {
        this.mpScore[strokeIdx] = 0;
      } else {
        this.mpScore[strokeIdx] = 1;
      }
      this.mpResult = createMPResultText(this.onlineRounds[0].player.nick, this.onlineRounds[1].player.nick, this.mpScore);
    }
  }

  highlightHcp(hole: number, player: number) {
    if (this.holeHCP[player][hole] > 0) {
      return 'highlightHcp';
    }
    return 'no-edit';
  }
}
