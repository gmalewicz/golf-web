import { OnlineScoreCard } from './../_models/onlineScoreCard';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Course, teeTypes} from '@/_models';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { faPlay, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs/internal/Observable';
import { OnlineRound } from '../_models';
import { WebSocketAPI } from '../_helpers';
import { ScorecardHttpService } from '../_services';
import { tap } from 'rxjs/internal/operators/tap';
import { calculateCourseHCP, calculateHoleHCP, getPlayedCoursePar } from '@/_helpers';

@Component({
  selector: 'app-online-matchplay',
  templateUrl: './online-matchplay.component.html',
  styleUrls: ['./online-matchplay.component.css']
})
export class OnlineMatchplayComponent implements OnInit, OnDestroy {

  faPlay = faPlay;
  faSearchPlus = faSearchPlus;

  course: Course;
  onlineRounds: OnlineRound[];

  curPlayerIdx: number;
  curHoleIdx: number;

  // strokes, putts, penalties for the current hole
  curHoleStrokes: number[];
  curHolePutts: number[];
  curHolePenalties: number[];
  // strokes, putts, penalties containers for display
  strokes: number[][];
  putts: number[][];
  penalties: number[][];
  holeHCP: number[][];
  // -2 not set
  // -1 first player won
  // 0 tie
  // 1 second player won
  mpScore: number[];
  mpTotal: number[];
  // total stokes per player
  totalStrokes: number[];
  // round competion indicator
  roundCompleted: boolean;
  // last played hole
  lastPlayed: number;
  // edit / no-edit class
  editClass: string[];
  submitted: boolean;
  // putt and penalty buttons
  public buttons: number[];
  // selectedPutt and penalty
  // selectedPutt: number;
  // selectedPenalty: number;
  public puttSelectorActive: { active: boolean }[];
  public penaltySelectorActive: { active: boolean }[];

  loading: boolean;

  dialogRef: MatDialogRef<ConfirmationDialogComponent>;

  display: boolean;

  webSocketAPI: WebSocketAPI;

  // lost connection indicator
  lostConnection: boolean;

  constructor(private httpService: HttpService,
              private scorecardHttpService: ScorecardHttpService,
              private alertService: AlertService,
              private dialog: MatDialog,
              private authenticationService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit(): void {


    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      // get passed data
      this.onlineRounds = history.state.data.onlineRounds;
      // console.log(this.onlineRounds);
      this.course = history.state.data.course;
      // initialize variables
      this.curPlayerIdx = 0;
      // this.curHoleIdx = 0;
      this.curHoleStrokes = new Array(this.onlineRounds.length).fill(0);
      this.curHolePenalties = new Array(this.onlineRounds.length).fill(0);
      this.strokes = new Array(18).fill(0).map(() => new Array(this.onlineRounds.length).fill(0));
      this.penalties = new Array(18).fill(0).map(() => new Array(this.onlineRounds.length).fill(0));
      this.holeHCP = new Array(this.onlineRounds.length).fill(0).map(() => new Array(18).fill(0));
      this.mpScore = new Array(18).fill(-2);
      this.mpTotal = new Array(2).fill(0);

      this.lastPlayed = 0;
      this.editClass = Array(this.onlineRounds.length).fill('no-edit');
      this.editClass[0] = 'edit';

      this.puttSelectorActive = Array(6).fill({ active: false });
      this.penaltySelectorActive = Array(6).fill({ active: false });
      this.penaltySelectorActive[0] = ({ active: true });

      this.submitted = false;
      this.loading = false;
      this.display = false;
      this.roundCompleted = false;

      this.totalStrokes = new Array(this.onlineRounds.length).fill(0);

      this.lostConnection = true;

      // console.log('strokes: ' + this.strokes);
      this.buttons = [0, 1, 2, 3, 4, 5];
      // zero putts in case tracking is not required
      if (this.onlineRounds[0].putts) {
        this.curHolePutts = new Array(this.onlineRounds.length).fill(2);
        this.putts = new Array(18).fill(0).map(() => new Array(this.onlineRounds.length).fill(2));
        this.puttSelectorActive[2] = ({ active: true });
      } else {
        this.curHolePutts = new Array(this.onlineRounds.length).fill(0);
        this.putts = new Array(18).fill(0).map(() => new Array(this.onlineRounds.length).fill(0));
      }

      this.getRoundData();
      // open web socket
      this.webSocketAPI = new WebSocketAPI(this, this.alertService, this.authenticationService, false, true);
    }
  }


  ngOnDestroy(): void {

    if (this.webSocketAPI !== undefined) {
      this.webSocketAPI._disconnect();
    }
  }

  getRoundData() {

    this.httpService.getHoles(this.course.id).pipe(
      tap(
        retHoles => {
          this.course.holes = retHoles;
          // console.log(retHoles);
          this.loadScoreCards();
        })
    ).subscribe();
  }

  loadScoreCards() {

    const calls: Observable<OnlineScoreCard[]>[] = Array(this.onlineRounds.length);
    // console.log(calls);
    for (let i = 0; i < this.onlineRounds.length; i++) {
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

      calls[i] = this.scorecardHttpService.getOnlineScoreCard(this.onlineRounds[i].id);
    }
    // calls[0] = this.httpService.getOnlineScoreCard(this.onlineRounds[0].id);
    // console.log(calls);

    combineLatest(calls).subscribe((onlineScoreCards: OnlineScoreCard[][]) => {

      for (const i of Object.keys(onlineScoreCards)) {

        // set lastPlayed hole
        if (onlineScoreCards.length > this.lastPlayed - 1) {
          this.lastPlayed = onlineScoreCards.length;
        }

        // this.onlineRounds[i].scoreCardAPI = onlineScoreCards[i];
        onlineScoreCards[i].forEach((sc: OnlineScoreCard) => {
          // initialize strokes per holes for display
          this.strokes[sc.hole - 1][i] = sc.stroke;
          this.putts[sc.hole - 1][i] = sc.putt;
          this.penalties[sc.hole - 1][i] = sc.penalty;
          // initialize total strokes per player
          this.totalStrokes[i] += sc.stroke;
        });
      }
      // initialize the current hole inedex (assumed all players will play the same number of holes)
      if (onlineScoreCards[0].length === 0 && this.onlineRounds[0].tee.teeType === teeTypes.TEE_TYPE_LAST_9) {
        this.curHoleIdx = 9;
      } else if (onlineScoreCards[0].length === 0) {
        this.curHoleIdx = 0;
      } else {
        this.curHoleIdx = onlineScoreCards[0].map(scoreCard => scoreCard.hole).reduce((p, c) => p < c ? c : p) - 1;
      }
      // console.log('current hole index: ' + this.curHoleIdx);

      // check if round is completed completed
      if ((this.onlineRounds[0].tee.teeType === teeTypes.TEE_TYPE_FIRST_9 && this.curHoleIdx === 8) || this.curHoleIdx === 17) {
        this.roundCompleted = true;
      } else {
        this.roundCompleted = false;
      }

      // update mp results
      this.mpScore.forEach((result, idx) => this.updateMpResult(idx));
      this.updateMpTotal();

      this.curHoleStrokes =  this.curHoleStrokes.map((s, idx) => s += this.strokes[this.curHoleIdx][idx]);
      // in case if stroke is 0 load par instead
      this.curHoleStrokes = this.curHoleStrokes.map((s, idx) => {
        if (s === 0) {
          s = this.course.holes[this.curHoleIdx].par;
          // console.log('s: ' + s);
        }
        return s;
      });

      // establish connection to the server
      this.webSocketAPI._connect(false);
      this.lostConnection = false;
      this.display = true;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, false);
    });
  }

  addScore() {

    // return where no connection to the server
    if (this.lostConnection) {
      return;
    }

    // console.log('current hole strokes: ' + this.curHoleStrokes);
    // console.log('current strokes: ' + this.strokes);
    // console.log('stroke: ' + this.strokes[this.curHoleIdx][this.curPayerIdx]);

    // save only if anything has been changed
    if (this.curHoleStrokes[this.curPlayerIdx] !== this.strokes[this.curHoleIdx][this.curPlayerIdx] ||
      this.curHolePutts[this.curPlayerIdx] !== this.putts[this.curHoleIdx][this.curPlayerIdx] ||
      this.curHolePenalties[this.curPlayerIdx] !== this.penalties[this.curHoleIdx][this.curPlayerIdx]) {

       // create new online score card
      const currentOnlineScoreCard: OnlineScoreCard = {
        hole: this.curHoleIdx + 1,
        stroke: this.curHoleStrokes[this.curPlayerIdx],
        putt: this.curHolePutts[this.curPlayerIdx],
        penalty: this.curHolePenalties[this.curPlayerIdx],
        player: {
          id: this.onlineRounds[this.curPlayerIdx].player.id
        },
        onlineRoundId: this.onlineRounds[this.curPlayerIdx].id,
        update: false,
      };

      // verify if it is an update
      if ((this.curHoleStrokes[this.curPlayerIdx] !== this.strokes[this.curHoleIdx][this.curPlayerIdx] ||
        this.curHolePutts[this.curPlayerIdx] !== this.putts[this.curHoleIdx][this.curPlayerIdx] ||
        this.curHolePenalties[this.curPlayerIdx] !== this.penalties[this.curHoleIdx][this.curPlayerIdx]) &&
        this.strokes[this.curHoleIdx][this.curPlayerIdx] !== 0) {
          currentOnlineScoreCard.update = true;
      }

      // send scorecard to server
      this.webSocketAPI._send(currentOnlineScoreCard);
      // update total strokes by substracting current value and adding the new one
      this.totalStrokes[this.curPlayerIdx] -= this.strokes[this.curHoleIdx][this.curPlayerIdx];
      this.totalStrokes[this.curPlayerIdx] += this.curHoleStrokes[this.curPlayerIdx];
      // udate strokes for display
      this.strokes[this.curHoleIdx][this.curPlayerIdx] = this.curHoleStrokes[this.curPlayerIdx];
      this.putts[this.curHoleIdx][this.curPlayerIdx] = this.curHolePutts[this.curPlayerIdx];
      this.penalties[this.curHoleIdx][this.curPlayerIdx] = this.curHolePenalties[this.curPlayerIdx];
    }

    // move to the next player
    this.editClass[this.curPlayerIdx] = 'no-edit';
    // increase current player index is not last or set to 0 if last
     // update mp score if score enetered for both players
    this.updateMpResult(this.curHoleIdx);
    this.updateMpTotal();

    if (this.curPlayerIdx < this.onlineRounds.length - 1) {
      this.curPlayerIdx++;
    } else {
      this.curPlayerIdx = 0;
      this.selectHole(this.curHoleIdx + 1);
    }
    this.editClass[this.curPlayerIdx] = 'edit';

    this.puttSelectorActive.fill({ active: false });
    this.puttSelectorActive[this.curHolePutts[this.curPlayerIdx]] = ({ active: true });
    this.penaltySelectorActive.fill({ active: false });
    this.penaltySelectorActive[this.curHolePenalties[this.curPlayerIdx]] = ({ active: true });

    // console.log('curPlayerIdx: ' + this.curPayerIdx);
  }

  private updateMpResult(strokeIdx: number) {

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

  private updateMpTotal() {

    // console.log('mscore: ' + this.mpScore);
    // console.log('updMPTotal called: ' + this.mpTotal[0]);

    this.mpTotal[0] = this.mpScore.reduce((p, c) => {if (c === -1) {return p + 1; } else {return p; }}, 0);
    this.mpTotal[1] = this.mpScore.reduce((p, c) => {if (c === 1) {return p + 1; } else {return p; }}, 0);

    // console.log('updMPTotal called: ' + this.mpTotal[0]);
    // console.log('updMPTotal called: ' + this.mpTotal[1]);

  }



  onDelete() {

    // display dialog box for verification if the user for sure want to delete the scorecard
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this scorecard permanently?';
    this.dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.loading = true;

        this.scorecardHttpService.deleteOnlineRoundForOwner(this.authenticationService.currentPlayerValue.id).pipe(
          tap(
            () => {
              this.alertService.success('This score card has been successfully deleted', false);
            })
        ).subscribe();

        this.router.navigate(['/']);
      }
      // do nothing if not
      this.dialogRef = null;
    });
  }

  onFinal() {

    // display dialog box for verification if the user for sure want to finalize the round
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to finish the round?';
    this.dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.loading = true;

        this.scorecardHttpService.finalizeOnlineOwnerRound(this.authenticationService.currentPlayerValue.id).pipe(
          tap(
            () => {
              this.alertService.success('The round has been successfuly saved', false);
            })
        ).subscribe();

        this.router.navigate(['/']);
      }
      // do nothing if not
      this.dialogRef = null;
    });

  }

  onDecrease() {

    // number of strokes canot be lower than 1
    if (this.curHoleStrokes[this.curPlayerIdx] === 1) {
      return;
    }
    this.curHoleStrokes[this.curPlayerIdx]--;

  }

  selectHole(holeIdx: number) {

    // console.log('hole: ' + holeIdx);

    // check if it is not the last hole in the scorecard
    if (this.onlineRounds[0].tee.teeType === teeTypes.TEE_TYPE_FIRST_9 && holeIdx > 8) {
      this.curHoleIdx = 8;
      return;
    }
    if (holeIdx === 18) {
      this.curHoleIdx = 17;
      return;
    }

    // check if the requested hole is not below hole 9 in case if the last 9 is played
    if (this.onlineRounds[0].tee.teeType === teeTypes.TEE_TYPE_LAST_9 && holeIdx <= 8) {
      this.curHoleIdx = 9;
      return;
    }

    this.curHoleIdx = holeIdx;
    // copy strokes from stokes table
    this.curHoleStrokes =  this.curHoleStrokes.map((s, idx) => s = this.strokes[this.curHoleIdx][idx]);
    this.curHolePutts =  this.curHolePutts.map((s, idx) => s = this.putts[this.curHoleIdx][idx]);
    this.curHolePenalties =  this.curHolePenalties.map((s, idx) => s = this.penalties[this.curHoleIdx][idx]);
    // in case if stroke is 0 load par instead
    this.curHoleStrokes = this.curHoleStrokes.map((s, idx) => {
      if (s === 0) {
        s = this.course.holes[holeIdx].par;
        // console.log('s: ' + s);
      }
      return s;
    });
    // set player index to 0 and update edit stye
    this.editClass[this.curPlayerIdx] = 'no-edit';
    this.curPlayerIdx = 0;
    this.editClass[this.curPlayerIdx] = 'edit';
    this.puttSelectorActive.fill({ active: false });
    this.puttSelectorActive[this.curHolePutts[this.curPlayerIdx]] = ({ active: true });
    this.penaltySelectorActive.fill({ active: false });
    this.penaltySelectorActive[this.curHolePenalties[this.curPlayerIdx]] = ({ active: true });
  }

  onIncrease() {

    // number of strokes canot be greater than 15
    if (this.curHoleStrokes[this.curPlayerIdx] === 15) {
      return;
    }
    // this.strokes[this.currentHole]++;
    this.curHoleStrokes[this.curPlayerIdx]++;
  }

  // helper function to provide verious arrays for html
  counter(i: number) {
    return new Array(i);
  }

  calculateStyle(playerIdx: number) {
    if (playerIdx === this.curPlayerIdx) {
      return 'edit';
    }
    return 'no-edit';
  }

  handleLostConnection(lost: boolean) {
    this.lostConnection = lost;
  }

  selectPutt(putts: number) {
    this.curHolePutts[this.curPlayerIdx] = putts;
  }

  selectPenalty(penalties: number) {
    this.curHolePenalties[this.curPlayerIdx] = penalties;
  }
}
