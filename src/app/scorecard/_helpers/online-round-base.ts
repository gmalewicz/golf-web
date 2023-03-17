import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { ballPickedUpStrokes } from '@/_helpers/common';
import { Course } from '@/_models/course';
import { teeTypes } from '@/_models/tee';
import { AlertService } from '@/_services/alert.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { faPlay, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, fromEvent, Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/operators';
import { OnlineRound } from '../_models/onlineRound';
import { OnlineScoreCard } from '../_models/onlineScoreCard';
import { NavigationService } from '../_services/navigation.service';
import { RxStompService } from '../_services/rx-stomp.service';
import { ScorecardHttpService } from '../_services/scorecardHttp.service';

@Component({
  template: ''
})
export class OnlineRoundBaseComponent implements OnDestroy, OnInit {

  ballPickedUp: boolean[];

  faPlay = faPlay;
  faSearchPlus = faSearchPlus;

  course: Course;
  onlineRounds: OnlineRound[];

  curPlayerIdx: number;
  curHoleIdx: number;

  useWebSocket: boolean;


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

  loadingDel: boolean;
  loadingFin: boolean;

  dialogRef: MatDialogRef<ConfirmationDialogComponent>;

  display: boolean;

  visibilityChangeEvent: Observable<Event>;
  subscriptions: Subscription[] = [];

  // waiting for server response
  inProgress: boolean;

  constructor(protected httpService: HttpService,
              protected scorecardHttpService: ScorecardHttpService,
              protected alertService: AlertService,
              protected dialog: MatDialog,
              protected authenticationService: AuthenticationService,
              protected router: Router,
              protected navigationService: NavigationService,
              protected rxStompService: RxStompService) {
  }

  ngOnInit(): void {


    if (this.authenticationService.currentPlayerValue === null ||
        this.navigationService.getCourse() === null ||
        this.navigationService.getOnlineRounds() === null
      ) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {

      this.useWebSocket = false;
      this.inProgress = false;

      // get passed data
      this.onlineRounds = this.navigationService.getOnlineRounds();

      // 2.0.0 - adding sort of the array to have always the same sequence of players even
      // if retreiving from backend
      this.onlineRounds.sort((or1, or2) => or1.player.id - or2.player.id);

      this.course =  this.navigationService.getCourse();
      // initialize variables
      this.curPlayerIdx = 0;
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
      this.loadingDel = false;
      this.loadingFin = false;
      this.display = false;
      this.roundCompleted = false;

      this.totalStrokes = new Array(this.onlineRounds.length).fill(0);
      this.ballPickedUp = new Array(this.onlineRounds.length).fill(false);

      // zero putts in case tracking is not required
      if (this.onlineRounds[0].putts) {
        this.curHolePutts = new Array(this.onlineRounds.length).fill(2);
        this.puttSelectorActive[2] = ({ active: true });
      } else {
        this.curHolePutts = new Array(this.onlineRounds.length).fill(0);
      }
      this.putts = new Array(18).fill(0).map(() => new Array(this.onlineRounds.length).fill(0));

      this.getRoundData();
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
    this.navigationService.clear();
    this.rxStompService.deactivate();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // helper function to provide verious arrays for html
  counter(i: number) {
    return new Array(i);
  }

  calculateStyle(playerIdx: number) {
    if (playerIdx === this.curPlayerIdx) {
      return 'highlight';
    }
    return 'no-highlight';
  }

  selectHole(holeIdx: number) {

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
    // tslint:disable-next-line: variable-name
    this.curHoleStrokes =  this.curHoleStrokes.map((_s, idx) => this.strokes[this.curHoleIdx][idx]);
    // tslint:disable-next-line: variable-name
    this.curHolePutts =  this.curHolePutts.map((_s, idx) => this.putts[this.curHoleIdx][idx]);
    // tslint:disable-next-line: variable-name
    this.curHolePenalties =  this.curHolePenalties.map((_s, idx) => this.penalties[this.curHoleIdx][idx]);
    // in case if stroke is 0 load par instead
    this.curHoleStrokes = this.curHoleStrokes.map((s, idx) => {
      if (s === 0) {
        s = this.course.holes[holeIdx].par;
        if (this.onlineRounds[idx].putts) {
          this.curHolePutts[idx] =  2;
        }
      }
      return s;
    });
    // set player index to 0 and update edit style
    this.editClass[this.curPlayerIdx] = 'no-edit';
    this.curPlayerIdx = 0;
    this.editClass[this.curPlayerIdx] = 'edit';
    this.puttSelectorActive.fill({ active: false });
    this.puttSelectorActive[this.curHolePutts[this.curPlayerIdx]] = ({ active: true });
    this.penaltySelectorActive.fill({ active: false });
    this.penaltySelectorActive[this.curHolePenalties[this.curPlayerIdx]] = ({ active: true });
  }

  syncHole(curHoleIdx: number) {

    const onlineScoreCards: OnlineScoreCard[] = [];

    this.onlineRounds.forEach((or, idx) => {

       // create new online score card
       const currentOnlineScoreCard: OnlineScoreCard = {
        hole: curHoleIdx + 1,
        stroke: this.strokes[curHoleIdx][idx],
        putt: this.putts[curHoleIdx][idx],
        penalty: this.penalties[curHoleIdx][idx],
        player: {
          id: this.onlineRounds[idx].player.id
        },
        orId: this.onlineRounds[idx].id,
        update: false,
        time: formatDate(new Date(), 'HH:mm', 'en-US')
      };

       onlineScoreCards.push(currentOnlineScoreCard);
    });

    this.display = false;
    this.scorecardHttpService.syncOnlineScoreCards(onlineScoreCards).pipe(
      tap(
        () => {
          this.display = true;
        })
    ).subscribe();
  }

  onFinal() {

    // display dialog box for verification if the user for sure want to finalize the round
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = $localize`:@@onLineRndBse-finRndCnf:Are you sure you want to finish the round?`;
    this.dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.loadingFin = true;

        this.scorecardHttpService.finalizeOnlineOwnerRound(this.authenticationService.currentPlayerValue.id).pipe(
          tap(
            () => {
              this.loadingFin = false;
              this.alertService.success($localize`:@@onLineRndBse-finRndMsg:The round has been successfuly saved`, true);
              this.router.navigate(['/rounds']);
            })
        ).subscribe();
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
    this.dialogRef.componentInstance.confirmMessage = $localize`:@@onLineRndBse-delRndCnf:Are you sure you want to delete this scorecard permanently?`;
    this.dialogRef.afterClosed().subscribe(result => {

      if (result) {
        this.loadingDel = true;

        this.scorecardHttpService.deleteOnlineRoundForOwner(this.authenticationService.currentPlayerValue.id).pipe(
          tap(
            () => {
              this.loadingDel = false;
              this.alertService.success($localize`:@@onLineRndBse-delRndMsg:This score card has been successfully deleted`, false);
              this.router.navigate(['/home']);
            })
        ).subscribe();
      }
      // do nothing if not
      this.dialogRef = null;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected updateMpResult(_strokeIdx: number) {
    // This is intentional
  }

  protected updateMpTotal() {
    // This is intentional
  }

  addScore() {

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
        time: formatDate(new Date(), 'HH:mm', 'en-US')
      };

      // verify if it is an update
      if ((this.curHoleStrokes[this.curPlayerIdx] !== this.strokes[this.curHoleIdx][this.curPlayerIdx] ||
        this.curHolePutts[this.curPlayerIdx] !== this.putts[this.curHoleIdx][this.curPlayerIdx] ||
        this.curHolePenalties[this.curPlayerIdx] !== this.penalties[this.curHoleIdx][this.curPlayerIdx]) &&
        this.strokes[this.curHoleIdx][this.curPlayerIdx] !== 0) {
          currentOnlineScoreCard.update = true;

          const onlineScoreCards: OnlineScoreCard[] = [];
          onlineScoreCards.push(currentOnlineScoreCard);

          this.saveUpdateToServer(onlineScoreCards, currentOnlineScoreCard);

      } else {
        if (this.useWebSocket) {
          this.sendMessage(currentOnlineScoreCard);
        }
      }

      if (!this.useWebSocket) {
        this.updateTotals();
        this.moveToNextPlayer();
      }
    } else {
      this.moveToNextPlayer();
    }
  }

  private processReceipt() {
    console.log('start processing receipt');
    this.updateTotals();
    this.moveToNextPlayer();
    this.inProgress = false;
  }

  private moveToNextPlayer() {
    // move to the next player
    this.editClass[this.curPlayerIdx] = 'no-edit';
    // increase current player index is not last or set to 0 if last
    // update mp score if score enetered for both players
    this.updateMpResult(this.curHoleIdx);
    this.updateMpTotal();

    if (this.curPlayerIdx < this.onlineRounds.length - 1) {
      this.curPlayerIdx++;
    } else {

      if (!this.useWebSocket) {
        // synchronize hole reults
        this.syncHole(this.curHoleIdx);
      }

      this.curPlayerIdx = 0;
      this.selectHole(this.curHoleIdx + 1);
    }
    this.editClass[this.curPlayerIdx] = 'edit';

    this.puttSelectorActive.fill({ active: false });
    this.puttSelectorActive[this.curHolePutts[this.curPlayerIdx]] = ({ active: true });
    this.penaltySelectorActive.fill({ active: false });
    this.penaltySelectorActive[this.curHolePenalties[this.curPlayerIdx]] = ({ active: true });
  }


  private updateTotals() {
    // update total strokes by substracting current value and adding the new one
    this.totalStrokes[this.curPlayerIdx] -= this.strokes[this.curHoleIdx][this.curPlayerIdx];
    this.totalStrokes[this.curPlayerIdx] += this.curHoleStrokes[this.curPlayerIdx];

    // udate strokes for display
    this.strokes[this.curHoleIdx][this.curPlayerIdx] = this.curHoleStrokes[this.curPlayerIdx];

    // verify if at least for one hole the ball has been picked up
    this.setBallPickUp();

    this.putts[this.curHoleIdx][this.curPlayerIdx] = this.curHolePutts[this.curPlayerIdx];
    this.penalties[this.curHoleIdx][this.curPlayerIdx] = this.curHolePenalties[this.curPlayerIdx];

  }


  private saveUpdateToServer (onlineScoreCards: OnlineScoreCard[], currentOnlineScoreCard: OnlineScoreCard) {
    if (!this.useWebSocket) {
      this.display = false;

      this.scorecardHttpService.syncOnlineScoreCards(onlineScoreCards).pipe(
        tap(
          () => {
            this.display = true;
          })
      ).subscribe();
    } else {
      this.sendMessage(currentOnlineScoreCard);
    }
  }

  private sendMessage(onlineScoreCard: OnlineScoreCard) {
    this.inProgress = true;
      const receiptId = '' + Math.random() * 10000;
      this.rxStompService.publish({ destination: '/app/hole', headers: {receipt: receiptId}, body: JSON.stringify(onlineScoreCard) });
      const prom = this.rxStompService.asyncReceipt(receiptId);
      prom.then(() => {
        this.processReceipt();
      })
  }

  private setBallPickUp() {

    for  (let idx = 0; idx < 18; idx++) {

      if (this.strokes[idx][this.curPlayerIdx] === ballPickedUpStrokes) {
        this.ballPickedUp[this.curPlayerIdx] = true;
        break;
      }
      if (idx === 17) {
        this.ballPickedUp[this.curPlayerIdx] = false;
      }
    }
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected calculateHCP(_i: number) {
    // This is intentional
  }

  protected updateMPresults() {
    // This is intentional
  }

  protected calculateMPHoleHCP() {
    // This is intentional
  }

  loadScoreCards() {

    const calls: Observable<OnlineScoreCard[]>[] = Array(this.onlineRounds.length);

    for (let i = 0; i < this.onlineRounds.length; i++) {
      // calculate course HCP for each player
      this.calculateHCP(i);
      calls[i] = this.scorecardHttpService.getOnlineScoreCard(this.onlineRounds[i].id);
    }
    this.calculateMPHoleHCP();

    combineLatest(calls).pipe(tap(
      (onlineScoreCards: OnlineScoreCard[][]) => {

        this.processOnlineScoreCards(onlineScoreCards);

        this.initCurHoleIdx(onlineScoreCards);

        this.checkIfRoundCompleted();

        // update mp results
        this.updateMPresults();

        // in case if stroke is 0 load par instead
        this.curHoleStrokes = this.curHoleStrokes.map((s, idx) => {
          s += this.strokes[this.curHoleIdx][idx];
          if (s === 0) {
            s = this.course.holes[this.curHoleIdx].par;
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
        this.display = true;
      })
    ).subscribe();
  }

  private processOnlineScoreCards(onlineScoreCards: OnlineScoreCard[][]) {

    for (let i = 0; i < onlineScoreCards.length; i++) {

      // set lastPlayed hole
      if (onlineScoreCards.length > this.lastPlayed - 1) {
        this.lastPlayed = onlineScoreCards.length;
      }

      onlineScoreCards[i].forEach((sc: OnlineScoreCard) => {

        // initialize strokes per holes for display
        this.strokes[sc.hole - 1][i] = sc.stroke;
        this.putts[sc.hole - 1][i] = sc.putt;
        this.penalties[sc.hole - 1][i] = sc.penalty;
        // initialize total strokes per player
        if (!this.ballPickedUp[i] && sc.stroke < ballPickedUpStrokes) {
          this.totalStrokes[i] += sc.stroke;
        } else {
          this.ballPickedUp[i] = true;
        }
      });
    }
  }

  private initCurHoleIdx(onlineScoreCards: OnlineScoreCard[][]) {
     // initialize the current hole inedex (assumed all players will play the same number of holes)
     if (onlineScoreCards[0].length === 0 && this.onlineRounds[0].tee.teeType === teeTypes.TEE_TYPE_LAST_9) {
      this.curHoleIdx = 9;
    } else if (onlineScoreCards[0].length === 0) {
      this.curHoleIdx = 0;
    } else {
      this.curHoleIdx = onlineScoreCards[0].map(scoreCard => scoreCard.hole).reduce((p, c) => p < c ? c : p) - 1;
    }
  }

  private checkIfRoundCompleted() {
    // check if round is completed completed
    if ((this.onlineRounds[0].tee.teeType === teeTypes.TEE_TYPE_FIRST_9 && this.curHoleIdx === 8) || this.curHoleIdx === 17) {
      this.roundCompleted = true;
    } else {
      this.roundCompleted = false;
    }
  }

  switchMode() {
    this.useWebSocket = !this.useWebSocket;
    if (this.useWebSocket) {
      this.handleDocumentVisibilityChanges();
      this.rxStompService.activate();
    } else  {
      this.rxStompService.deactivate();
    }
  }

  private handleDocumentVisibilityChanges(): void {

    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    this.visibilityChangeEvent = fromEvent(document, 'visibilitychange');

    this.subscriptions.push(this.visibilityChangeEvent.subscribe(() => {

      if (document.visibilityState === 'visible') {
        this.rxStompService.deactivate();
        this.rxStompService.activate();
      }

    }));

  }
}
