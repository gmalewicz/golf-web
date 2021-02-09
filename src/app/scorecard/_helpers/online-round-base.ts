import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Course } from '@/_models/course';
import { teeTypes } from '@/_models/tee';
import { AlertService } from '@/_services/alert.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { faPlay, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { combineLatest } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/operators';
import { OnlineRound } from '../_models/onlineRound';
import { OnlineScoreCard } from '../_models/onlineScoreCard';
import { ScorecardHttpService } from '../_services/scorecardHttp.service';
import { WebSocketAPI } from './web.socket.api';

@Component({
  template: ''
})
export class OnlineRoundBaseComponent implements OnDestroy, OnInit {

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
  // total stokes per player
  totalStrokes: number[];
  // round competion indicator
  roundCompleted: boolean;
  // last played hole
  lastPlayed: number;
  // edit / no-edit class
  editClass: string[];
  submitted: boolean;
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


  constructor(protected httpService: HttpService,
              protected scorecardHttpService: ScorecardHttpService,
              protected alertService: AlertService,
              protected dialog: MatDialog,
              protected authenticationService: AuthenticationService,
              protected router: Router) {
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

      // zero putts in case tracking is not required
      if (this.onlineRounds[0].putts) {
        this.curHolePutts = new Array(this.onlineRounds.length).fill(2);
        this.puttSelectorActive[2] = ({ active: true });
      } else {
        this.curHolePutts = new Array(this.onlineRounds.length).fill(0);
      }
      this.putts = new Array(18).fill(0).map(() => new Array(this.onlineRounds.length).fill(0));

      this.getRoundData();
      // open web socket
      this.webSocketAPI = new WebSocketAPI(this, this.alertService, this.authenticationService, false, true);
    }
  }

  getRoundData() {

    this.httpService.getHoles(this.course.id).pipe(
      tap(
        retHoles => {
          this.course.holes = retHoles;
          this.loadScoreCards();
        })
    ).subscribe();
  }

  ngOnDestroy(): void {

    if (this.webSocketAPI !== undefined) {
      this.webSocketAPI._disconnect();
    }
  }

  handleLostConnection(lost: boolean) {
    this.lostConnection = lost;
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
    this.curHoleStrokes =  this.curHoleStrokes.map((s, idx) => this.strokes[this.curHoleIdx][idx]);
    this.curHolePutts =  this.curHolePutts.map((s, idx) => this.putts[this.curHoleIdx][idx]);
    this.curHolePenalties =  this.curHolePenalties.map((s, idx) => this.penalties[this.curHoleIdx][idx]);
    // in case if stroke is 0 load par instead
    this.curHoleStrokes = this.curHoleStrokes.map((s, idx) => {
      if (s === 0) {
        s = this.course.holes[holeIdx].par;
        this.curHolePutts[idx] =  2;
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

  protected updateMpResult(strokeIdx: number) {}

  protected updateMpTotal() {}

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
        orId: this.onlineRounds[this.curPlayerIdx].id,
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

  protected calculateHCP(i: number) {}

  protected updateMPresults() {}

  loadScoreCards() {

    const calls: Observable<OnlineScoreCard[]>[] = Array(this.onlineRounds.length);
    // console.log(calls);
    for (let i = 0; i < this.onlineRounds.length; i++) {
      // calculate course HCP for each player
      this.calculateHCP(i);

      calls[i] = this.scorecardHttpService.getOnlineScoreCard(this.onlineRounds[i].id);
    }
    // calls[0] = this.httpService.getOnlineScoreCard(this.onlineRounds[0].id);
    // console.log(calls);

    combineLatest(calls).subscribe((onlineScoreCards: OnlineScoreCard[][]) => {

      for (let i = 0; i < onlineScoreCards.length; i++) {

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
      this.updateMPresults();

      // this.curHoleStrokes =  this.curHoleStrokes.map((s, idx) => s += this.strokes[this.curHoleIdx][idx]);
      // in case if stroke is 0 load par instead
      this.curHoleStrokes = this.curHoleStrokes.map((s, idx) => {
        s += this.strokes[this.curHoleIdx][idx];
        if (s === 0) {
          s = this.course.holes[this.curHoleIdx].par;
          // console.log('s: ' + s);
        } else {
          this.curHolePutts[idx] = this.putts[this.curHoleIdx][idx];
          this.curHolePenalties[idx] = this.penalties[this.curHoleIdx][idx];

          if (idx === 0) {
            this.puttSelectorActive[2] = ({ active: false });
            this.puttSelectorActive[this.curHolePutts[0]] = ({ active: true });
            this.penaltySelectorActive[0] = ({ active: false });
            this.penaltySelectorActive[this.curHolePenalties[0]] = ({ active: true });
          }

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
}
