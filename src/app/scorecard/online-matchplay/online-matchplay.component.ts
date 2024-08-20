import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ScorecardHttpService } from '../_services';
import { calculateCourseHCP, calculateHoleHCP, createMPResultText, getPlayedCoursePar } from '@/_helpers';
import { OnlineRoundBaseComponent } from '../_helpers/online-round-base';
import { NavigationService } from '../_services/navigation.service';
import { RxStompService } from '../_services/rx-stomp.service';
import { LocationStrategy, NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CommonScorecardTopComponent } from '../common-scorecard-top/common-scorecard-top.component';

@Component({
    selector: 'app-online-matchplay',
    templateUrl: './online-matchplay.component.html',
    styleUrls: ['./online-matchplay.component.css'],
    standalone: true,
    imports: [CommonScorecardTopComponent, NgClass, FaIconComponent, MatButton],
    providers: [NavigationService]
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
              protected router: Router,
              protected navigationService: NavigationService,
              protected rxStompService: RxStompService,
              protected location: LocationStrategy) {
    super(httpService, scorecardHttpService, alertService, dialog, authenticationService, router, navigationService, rxStompService, location);
  }

  ngOnInit(): void {

    this.mpScore = new Array(18).fill(-2);
    this.mpResult = new Array(2);
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

    this.hcpDiff = this.onlineRounds[0].courseHCP - this.onlineRounds[1].courseHCP;
    let corHcpDiff = Math.abs(this.hcpDiff * this.onlineRounds[0].mpFormat);

    if (corHcpDiff - Math.floor(corHcpDiff) >= 0.5) {
      corHcpDiff = Math.ceil(corHcpDiff);
    } else {
      corHcpDiff = Math.floor(corHcpDiff);
    }

    if (this.hcpDiff >= 0) {
      this.hcpDiff = corHcpDiff;
      this.onlineRounds[0].courseHCP = corHcpDiff;
      this.onlineRounds[1].courseHCP = 0;
    } else {
      this.hcpDiff = -corHcpDiff;
      this.onlineRounds[0].courseHCP = 0;
      this.onlineRounds[1].courseHCP = corHcpDiff;
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
    // tslint:disable-next-line: variable-name
    this.mpScore.forEach((_result, idx) => this.updateMpResult(idx));
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
