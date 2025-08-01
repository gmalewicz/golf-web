import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { Component, computed, OnInit, signal, WritableSignal } from '@angular/core';
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
import { RangePipe } from "../../_helpers/range";

@Component({
    selector: 'app-online-matchplay',
    templateUrl: './online-matchplay.component.html',
    styleUrls: ['./online-matchplay.component.css'],
    imports: [CommonScorecardTopComponent, NgClass, FaIconComponent, MatButton, RangePipe],
    providers: [NavigationService]
})
export class OnlineMatchplayComponent extends OnlineRoundBaseComponent implements OnInit  {

  // local variables
  holeHCP: number[][];


  // signals
  highlightHCPSgn: WritableSignal<string[][]> = signal(new Array(2).fill('no-edit').map(() => new Array(18).fill('no-edit')));

  // -2 not set
  // -1 first player won
  // 0 tie
  // 1 second player won
  mpScoreSgn: WritableSignal<number[]> = signal(new Array(18).fill(-2));
  
  //computed signals
  // calculate MP result texts
  mpResultSgn = computed(() => createMPResultText(this.onlineRoundsSgn()[0].player.nick, this.onlineRoundsSgn()[1].player.nick, this.mpScoreSgn()));
  firstPlayerResultSgn = computed(() => this.mpResultSgn()[0]);
  secondPlayerResultSgn = computed(() => this.mpResultSgn()[1]);

  // if greater than 0, the first player has additional strokes
  hcpDiff: WritableSignal<number> = signal(undefined);

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
    super.ngOnInit();
  }

  getRoundData() {

    this.holeHCP = new Array(this.onlineRoundsSgn().length).fill(0).map(() => new Array(18).fill(0));

    super.getRoundData();
  }

  protected calculateHCP(i: number) {
     // calculate course HCP for each player
     const par = getPlayedCoursePar(this.courseSgn().holes, this.onlineRoundsSgn()[i].tee.teeType, this.courseSgn().par);

     this.onlineRoundsSgn()[i].courseHCP = calculateCourseHCP(this.onlineRoundsSgn()[i].tee.teeType,
                                                         this.onlineRoundsSgn()[i].player.whs,
                                                         this.onlineRoundsSgn()[i].tee.sr,
                                                         this.onlineRoundsSgn()[i].tee.cr,
                                                         par);
     this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection    
  }

  protected calculateMPHoleHCP() {

    this.hcpDiff.set(this.onlineRoundsSgn()[0].courseHCP - this.onlineRoundsSgn()[1].courseHCP);
    let corHcpDiff = Math.abs(this.hcpDiff() * this.onlineRoundsSgn()[0].mpFormat);

    if (corHcpDiff - Math.floor(corHcpDiff) >= 0.5) {
      corHcpDiff = Math.ceil(corHcpDiff);
    } else {
      corHcpDiff = Math.floor(corHcpDiff);
    }

    if (this.hcpDiff() >= 0) {
      this.hcpDiff.set(corHcpDiff);
      this.onlineRoundsSgn()[0].courseHCP = corHcpDiff;
      this.onlineRoundsSgn()[1].courseHCP = 0;
    } else {
      this.hcpDiff.set(-corHcpDiff);
      this.onlineRoundsSgn()[0].courseHCP = 0;
      this.onlineRoundsSgn()[1].courseHCP = corHcpDiff;
    }
    this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection

    calculateHoleHCP( 0,
                      this.onlineRoundsSgn()[0].tee.teeType,
                      this.onlineRoundsSgn()[0].courseHCP,
                       this.holeHCP,
                       this.courseSgn());

    calculateHoleHCP( 1,
                      this.onlineRoundsSgn()[1].tee.teeType,
                      this.onlineRoundsSgn()[1].courseHCP,
                      this.holeHCP,
                      this.courseSgn());
    this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection
    
    this.highlightHCPSgn()[0] = this.holeHCP[0].map(hcp => hcp > 0 ? 'highlightHcp' : 'no-edit');
    this.highlightHCPSgn()[1] = this.holeHCP[1].map(hcp => hcp > 0 ? 'highlightHcp' : 'no-edit');  
    this.highlightHCPSgn.set([...this.highlightHCPSgn()]); // trigger change detection
  }

  protected updateMPresults() {
        
    this.mpScoreSgn().forEach((_result, idx) => this.updateMpResult(idx));
    this.mpScoreSgn.set([...this.mpScoreSgn()]); // trigger change detection

  }

  protected updateMpResult(strokeIdx: number) {

    // update mp score if score enetered for both players
    if (this.strokesSgn()[strokeIdx][0] > 0 && this.strokesSgn()[strokeIdx][1] > 0) {
      const result = this.strokesSgn()[strokeIdx][0] - this.holeHCP[0][strokeIdx] - (this.strokesSgn()[strokeIdx][1] - this.holeHCP[1][strokeIdx]);

      if (result < 0) {
        this.mpScoreSgn()[strokeIdx] = -1;
      } else if (result === 0) {
        this.mpScoreSgn()[strokeIdx] = 0;
      } else {
        this.mpScoreSgn()[strokeIdx] = 1;
      }
      this.mpScoreSgn.set([...this.mpScoreSgn()]); // trigger change detection
    }
  }
}
