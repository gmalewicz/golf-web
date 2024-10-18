import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { Component } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ScorecardHttpService } from '../_services';
import { OnlineRoundBaseComponent } from '../_helpers/online-round-base';
import { NavigationService } from '../_services/navigation.service';
import { RxStompService } from '../_services/rx-stomp.service';
import { LocationStrategy, NgClass, NgTemplateOutlet } from '@angular/common';
import { calculateCourseHCP, calculateHoleHCP, getPlayedCoursePar } from '@/_helpers/whs.routines';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CommonScorecardTopComponent } from '../common-scorecard-top/common-scorecard-top.component';

@Component({
    selector: 'app-online-round',
    templateUrl: './online-round.component.html',
    styleUrls: ['./online-round.component.css'],
    standalone: true,
    imports: [CommonScorecardTopComponent, NgClass, NgTemplateOutlet, FaIconComponent, MatButton],
    providers: [NavigationService]
})
export class OnlineRoundComponent extends OnlineRoundBaseComponent {

  holeHcp: number[][];

  stbNet: number[][];
  totalStbNet: number[];

  strNet: number[][];
  totalStrNet: number[];

  skin: string[][];
  totalSkin: number[];


  // 0 - strokes brutto
  // 1 - stb netto
  // 2 - strokes netto
  displayMode: number = 0;

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

  // helper function to provide verious arrays for html
  counter(i: number) {
    return [...Array(i).keys()];
  }

  protected prepareAndCalculateNetStatistic() {

    this.holeHcp = Array(this.onlineRounds.length).fill(0).map(() => new Array(18).fill(0));

    this.stbNet = Array(this.onlineRounds.length).fill(0).map(() => new Array(18).fill(0));
    this.totalStbNet = new Array(this.onlineRounds.length).fill(0);

    this.strNet = Array(this.onlineRounds.length).fill(0).map(() => new Array(18).fill(0));
    this.totalStrNet = new Array(this.onlineRounds.length).fill(0);

    this.skin = Array(this.onlineRounds.length).fill("").map(() => new Array(18).fill(""));
    this.totalSkin = new Array(this.onlineRounds.length).fill(0);

    this.onlineRounds.forEach( (onlineRound, idx) => {
      const courseHcp = calculateCourseHCP(
        onlineRound.tee.teeType,
        onlineRound.player.whs,
        onlineRound.tee.sr,
        onlineRound.tee.cr,
        getPlayedCoursePar(this.course.holes,
                           onlineRound.tee.teeType,
                           this.course.par));

      calculateHoleHCP( idx,
        onlineRound.tee.teeType,
        courseHcp,
        this.holeHcp,
        this.course);

      this.holeHcp[idx].forEach((hHcp, id) => {

        if (this.strokes[id][idx]  > 0) {
          this.stbNet[idx][id] = this.course.holes[id].par - this.strokes[id][idx] + hHcp + 2;
          this.strNet[idx][id] = this.strokes[id][idx] - hHcp;
        }
        if (this.stbNet[idx][id] < 0) {
          this.stbNet[idx][id] = 0;
        }
      })
      this.totalStbNet[idx] = this.stbNet[idx].reduce((p, n) => p + n, 0);
      this.totalStrNet[idx] = this.strNet[idx].reduce((p, n) => p + n, 0);
    })

    this.counter(18).forEach(id => this.calculateSkins(id));
    // calculate total skins per player
    this.calculateTotalSkins();
  }

  protected updateNetStatistic() {

    // update stableford netto
    this.stbNet[this.curPlayerIdx][this.curHoleIdx] =
      this.course.holes[this.curHoleIdx].par - this.curHoleStrokes[this.curPlayerIdx] + this.holeHcp[this.curPlayerIdx][this.curHoleIdx] + 2;
    if (this.stbNet[this.curPlayerIdx][this.curHoleIdx] < 0) {
      this.stbNet[this.curPlayerIdx][this.curHoleIdx] = 0;
    }

    // update stroke play netto
    this.totalStbNet[this.curPlayerIdx] = this.stbNet[this.curPlayerIdx].reduce((p, n) => p + n, 0);

    this.strNet[this.curPlayerIdx][this.curHoleIdx] = this.curHoleStrokes[this.curPlayerIdx] - this.holeHcp[this.curPlayerIdx][this.curHoleIdx];
    this.totalStrNet[this.curPlayerIdx] = this.strNet[this.curPlayerIdx].reduce((p, n) => p + n, 0);

    // calculate hole result for skin game
    this.calculateSkins(this.curHoleIdx);
    // calculate total skins per player
    this.calculateTotalSkins();
  }

  selectMode(mode: number) {
    this.displayMode = mode;
  }

  private calculateTotalSkins() : void {

    // clear totals before recalculation
    this.totalSkin = Array(this.onlineRounds.length).fill(0);

    let cumulation: number = 0;

    this.counter(18).forEach((idx) => {

      let increaseCumulation: boolean = false;

      for (let plr = 0; plr < this.onlineRounds.length; plr++) {

        if (this.skin[plr][idx] === 'highlight') {

          this.totalSkin[plr] += (cumulation + 1);
          cumulation = 0;
          increaseCumulation = false;
          break;
        }
        increaseCumulation = true;
      }

      if (increaseCumulation) {
        cumulation++;
      }

    })
  }

  private calculateSkins(hole: number) : void {

    let plr: number = 0;
    let minResult = 17;
    let plrIdx = 0;
    let tie: boolean = false;


    while (plr < this.onlineRounds.length) {

      if (this.strokes[hole][plr] === 0) {
        this.skin[plr][hole] = this.holeHcp[plr][hole]+ "";
        plr++;
        continue;
      }

      if (this.strokes[hole][plr] - this.holeHcp[plr][hole] < minResult) {
        minResult = this.strokes[hole][plr] - this.holeHcp[plr][hole];
        tie = false;
        plrIdx = plr;
      } else if (this.strokes[hole][plr] - this.holeHcp[plr][hole] == minResult) {
        tie = true;
      }
      this.skin[plr][hole] = "";
      plr++;
    }
    if (minResult < 17 && !tie) {
      this.skin[plrIdx][hole] = "highlight"
    }

  }
}

