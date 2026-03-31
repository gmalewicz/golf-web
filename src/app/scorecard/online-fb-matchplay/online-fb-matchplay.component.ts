import { Component, computed, OnInit, signal, WritableSignal } from '@angular/core';
import { calculateHoleHCP, calculateUnroundedCourseHCP, createMPResultText } from '@/_helpers';
import { OnlineRoundBaseComponent } from '../_helpers/online-round-base';
import { NavigationService } from '../_services/navigation.service';
import { NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CommonScorecardTopComponent } from '../common-scorecard-top/common-scorecard-top.component';
import { RangePipe } from "../../_helpers/range";
import { Format } from '@/_models/format';
import { MPLegendComponent } from '@/_helpers/mpLegend.component';

@Component({
    selector: 'app-online-fb-matchplay',
    templateUrl: './online-fb-matchplay.component.html',
    styleUrls: ['./online-fb-matchplay.component.css'],
    imports: [CommonScorecardTopComponent, NgClass, FaIconComponent, MatButton, RangePipe, MPLegendComponent],
    providers: [NavigationService]
})
export class OnlineFbMatchplayComponent extends OnlineRoundBaseComponent implements OnInit  {

  // local variables
  holeHCP: number[][];


  // signals
  highlightHCPSgn: WritableSignal<string[][]> = signal(new Array(4).fill('no-highlight').map(() => new Array(18).fill('no-highlight')));

  // -2 not set
  // -1 first team won
  // 0 tie
  // 1 second team won
  mpScoreSgn: WritableSignal<number[]> = signal(new Array(18).fill(-2));
  
  //computed signals
  // calculate MP result texts
  mpResultSgn = computed(() => createMPResultText(this.onlineRoundsSgn()[0].player.nick, this.onlineRoundsSgn()[1].player.nick, this.mpScoreSgn(), Format.FOUR_BALL_MATCH_PLAY));
  firstPlayerResultSgn = computed(() => this.mpResultSgn()[0]);
  secondPlayerResultSgn = computed(() => this.mpResultSgn()[1]);

  // if greater than 0, the first player has additional strokes
  //hcpDiff: WritableSignal<number[]> = signal(undefined);

  constructor() {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  getRoundData() {

    this.holeHCP = new Array(this.onlineRoundsSgn().length).fill(0).map(() => new Array(18).fill(0));

    super.getRoundData();
  }

  protected calculateHCP(i: number) {
     
    // calculate course HCP for each player
     this.onlineRoundsSgn()[i].courseHCP = calculateUnroundedCourseHCP(this.onlineRoundsSgn()[i].tee.teeType,
                                                         this.onlineRoundsSgn()[i].player.whs,
                                                         this.onlineRoundsSgn()[i].tee.sr,
                                                         this.onlineRoundsSgn()[i].tee.cr,
                                                         this.courseSgn().par);  
  }

  protected calculateMPHoleHCP() {

    const minHcp = this.onlineRoundsSgn().reduce((prevVal, round) => Math.min(round.courseHCP, prevVal), this.onlineRoundsSgn()[0].courseHCP);
    this.onlineRoundsSgn().forEach(round => round.courseHCP -= minHcp);
    this.onlineRoundsSgn().forEach(round => round.courseHCP = Math.round(round.courseHCP * round.mpFormat));

    this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection

    for (let i = 0; i < 4; i++) {
      calculateHoleHCP(
        i,
        this.onlineRoundsSgn()[i].tee.teeType,
        this.onlineRoundsSgn()[i].courseHCP,
        this.holeHCP,
        this.courseSgn()
      );
    }

    this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection
    
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
  }

  protected updateMPresults() {
        
    this.mpScoreSgn().forEach((_result, idx) => this.updateMpResult(idx));
    this.mpScoreSgn.set([...this.mpScoreSgn()]); // trigger change detection

  }

  protected updateMpResult(strokeIdx: number) {

    // first check if all results for the hole are in
    const allResultsIn = !this.strokesSgn()[strokeIdx].includes(0);

    // all results are in
    if (allResultsIn) {
      const firstTeamResult = Math.min(this.strokesSgn()[strokeIdx][0] - this.holeHCP[0][strokeIdx], this.strokesSgn()[strokeIdx][1] - this.holeHCP[1][strokeIdx]);
      const secondTeamResult = Math.min(this.strokesSgn()[strokeIdx][2] - this.holeHCP[2][strokeIdx], this.strokesSgn()[strokeIdx][3] - this.holeHCP[3][strokeIdx]);

      if (firstTeamResult < secondTeamResult) {
        this.mpScoreSgn()[strokeIdx] = -1;
      } else if (firstTeamResult === secondTeamResult) {
        this.mpScoreSgn()[strokeIdx] = 0;
      } else {
        this.mpScoreSgn()[strokeIdx] = 1;
      }

      this.mpScoreSgn.set([...this.mpScoreSgn()]); // trigger change detection
    }
  }
}
