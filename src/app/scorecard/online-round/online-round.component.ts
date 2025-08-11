import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
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
import { RangePipe } from "../../_helpers/range";

@Component({
    selector: 'app-online-round',
    templateUrl: './online-round.component.html',
    styleUrls: ['./online-round.component.css'],
    imports: [CommonScorecardTopComponent, NgClass, NgTemplateOutlet, FaIconComponent, MatButton, RangePipe],
    providers: [NavigationService]
})
export class OnlineRoundComponent extends OnlineRoundBaseComponent {

  holeHcp: number[][];

  stbNetSgn = signal<number[][]>(undefined);
  totalStbNetSgn = signal<number[]>(undefined);

  strNetSgn = signal<number[][]>(undefined);
  totalStrNetSgn = signal<number[]>(undefined);

  skinSgn = signal<string[][]>(undefined);
  totalSkinSgn = signal<number[]>(undefined);


  // 0 - strokes brutto
  // 1 - stb netto
  // 2 - strokes netto
  displayModeSgn = signal<number>(0);

  constructor(protected httpService: HttpService,
              protected scorecardHttpService: ScorecardHttpService,
              protected alertService: AlertService,
              protected dialog: MatDialog,
              protected authenticationService: AuthenticationService,
              protected router: Router,
              protected navigationService: NavigationService,
              protected rxStompService: RxStompService,
              protected location: LocationStrategy,
              private readonly cd: ChangeDetectorRef,) {
    super(httpService, scorecardHttpService, alertService, dialog, authenticationService, router, navigationService, rxStompService, location);
  }

  protected prepareAndCalculateNetStatistic() {

    this.holeHcp = Array(this.onlineRoundsSgn().length).fill(0).map(() => new Array(18).fill(0));

    this.stbNetSgn.set(Array(this.onlineRoundsSgn().length).fill(0).map(() => new Array(18).fill(0)));
    this.totalStbNetSgn.set(new Array(this.onlineRoundsSgn().length).fill(0));

    this.strNetSgn.set(Array(this.onlineRoundsSgn().length).fill(0).map(() => new Array(18).fill(0)));
    this.totalStrNetSgn.set(new Array(this.onlineRoundsSgn().length).fill(0));

    this.skinSgn.set(Array(this.onlineRoundsSgn().length).fill("").map(() => new Array(18).fill("")));
    this.totalSkinSgn.set(new Array(this.onlineRoundsSgn().length).fill(0));

    

    this.onlineRoundsSgn().forEach( (onlineRound, idx) => {
      const courseHcp = calculateCourseHCP(
        onlineRound.tee.teeType,
        onlineRound.player.whs,
        onlineRound.tee.sr,
        onlineRound.tee.cr,
        getPlayedCoursePar(this.courseSgn().holes,
                           onlineRound.tee.teeType,
                           this.courseSgn().par));

      calculateHoleHCP( idx,
        onlineRound.tee.teeType,
        courseHcp,
        this.holeHcp,
        this.courseSgn());

      this.holeHcp[idx].forEach((hHcp, id) => {

        if (this.strokesSgn()[id][idx]  > 0) {
          this.stbNetSgn()[idx][id] = this.courseSgn().holes[id].par - this.strokesSgn()[id][idx] + hHcp + 2;
          this.strNetSgn()[idx][id] = this.strokesSgn()[id][idx] - hHcp;
        }
        if (this.stbNetSgn()[idx][id] < 0) {
          this.stbNetSgn()[idx][id] = 0;
        }
      })
      this.totalStbNetSgn()[idx] = this.stbNetSgn()[idx].reduce((p, n) => p + n, 0);     
      this.totalStrNetSgn()[idx] = this.strNetSgn()[idx].reduce((p, n) => p + n, 0);
    })

    // calculate skins for each hole
    Array.from({ length: 18 }, (_, idx) => this.calculateSkins(idx));
    
    // calculate total skins per player
    this.calculateTotalSkins();

    this.cd.markForCheck(); // trigger change detection
  }

  protected updateNetStatistic() {

    // update stableford netto
    this.stbNetSgn()[this.curPlayerIdxSgn()][this.curHoleIdxSgn()] =
      this.courseSgn().holes[this.curHoleIdxSgn()].par - this.curHoleStrokesSgn()[this.curPlayerIdxSgn()] + this.holeHcp[this.curPlayerIdxSgn()][this.curHoleIdxSgn()] + 2;
    if (this.stbNetSgn()[this.curPlayerIdxSgn()][this.curHoleIdxSgn()] < 0) {
      this.stbNetSgn()[this.curPlayerIdxSgn()][this.curHoleIdxSgn()] = 0;
    }
   

    // update stroke play netto
    this.totalStbNetSgn()[this.curPlayerIdxSgn()] = this.stbNetSgn()[this.curPlayerIdxSgn()].reduce((p, n) => p + n, 0);
   

    this.strNetSgn()[this.curPlayerIdxSgn()][this.curHoleIdxSgn()] = this.curHoleStrokesSgn()[this.curPlayerIdxSgn()] - this.holeHcp[this.curPlayerIdxSgn()][this.curHoleIdxSgn()];
    
    this.totalStrNetSgn()[this.curPlayerIdxSgn()] = this.strNetSgn()[this.curPlayerIdxSgn()].reduce((p, n) => p + n, 0);
    

    // calculate hole result for skin game
    this.calculateSkins(this.curHoleIdxSgn());
    // calculate total skins per player
    this.calculateTotalSkins();

    this.cd.markForCheck(); // trigger change detection
  }

  selectMode(mode: number) {
    this.displayModeSgn.set(mode);
  }

  private calculateTotalSkins() : void {

    // clear totals before recalculation
    this.totalSkinSgn.set(Array(this.onlineRoundsSgn().length).fill(0));

    let cumulation: number = 0;

    Array.from({ length: 18 }, (_, idx) => {

      let increaseCumulation: boolean = false;

      for (let plr = 0; plr < this.onlineRoundsSgn().length; plr++) {

        if (this.skinSgn()[plr][idx] === 'highlight') {

          this.totalSkinSgn()[plr] += (cumulation + 1);
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

    while (plr < this.onlineRoundsSgn().length) {

      if (this.strokesSgn()[hole][plr] === 0) {
        this.skinSgn()[plr][hole] = this.holeHcp[plr][hole]+ "";
        plr++;
        continue;
      }

      if (this.strokesSgn()[hole][plr] - this.holeHcp[plr][hole] < minResult) {
        minResult = this.strokesSgn()[hole][plr] - this.holeHcp[plr][hole];
        tie = false;
        plrIdx = plr;
      } else if (this.strokesSgn()[hole][plr] - this.holeHcp[plr][hole] == minResult) {
        tie = true;
      }
      this.skinSgn()[plr][hole] = "";
      plr++;
    }
    if (minResult < 17 && !tie) {
      this.skinSgn()[plrIdx][hole] = "highlight"
    }
    
  }
}

