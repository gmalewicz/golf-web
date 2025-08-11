import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { ballPickedUpStrokes } from '@/_helpers/common';
import { Course } from '@/_models/course';
import { teeTypes } from '@/_models/tee';
import { AlertService } from '@/_services/alert.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { LocationStrategy, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { faPlay, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, fromEvent, Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/operators';
import { OnlineRound } from '../_models/onlineRound';
import { OnlineScoreCard } from '../_models/onlineScoreCard';
import { NavigationService } from '../_services/navigation.service';
import { RxStompService } from '../_services/rx-stomp.service';
import { ScorecardHttpService } from '../_services/scorecardHttp.service';
import { calculateCourseHCP, getPlayedCoursePar } from '@/_helpers';

@Component({
    template: '',
    providers: [NavigationService]

})
export class OnlineRoundBaseComponent implements OnDestroy, OnInit {

  ballPickedUpSgn = signal<boolean[]>([]);
  //course: Course;
  courseSgn =  signal<Course>(undefined);
  onlineRoundsSgn =  signal<OnlineRound[]>([]);
  // strokes, putts, penalties containers for display
  strokesSgn = signal<number[][]>([]);
  curHoleIdxSgn = signal<number>(0);
  faPlaySgn = signal<IconDefinition>(faPlay);
  puttsSgn = signal<number[][]>([]);
  penaltiesSgn = signal<number[][]>([]);
  loggedIdSgn = signal<number>(0);
  ownerIdSgn = signal<number>(0);
  loadingDelSgn = signal<boolean>(false);
  loadingFinSgn = signal<boolean>(false);
  displaySgn = signal<boolean>(false);
  // total stokes per player
  totalStrokesSgn = signal<number[]>([]);
  curPlayerStyleSgn = signal<string[]>([]);
  curHoleStrokesSgn = signal<number[]>([]);
  curPlayerIdxSgn = signal<number>(0);

  // strokes, putts, penalties for the current hole
  curHolePutts: number[];
  curHolePenalties: number[];
  // round competion indicator
  roundCompleted: boolean;
  // last played hole
  lastPlayed: number;
  // edit / no-edit class
  //editClass: string[];
  submitted: boolean;
  // selectedPutt and penalty
  // selectedPutt: number;
  // selectedPenalty: number;
  public puttSelectorActive = Array(6).fill(null).map(() => ({ active: false })); 
  public penaltySelectorActive = Array(6).fill(null).map(() => ({ active: false })); 

  dialogRef: MatDialogRef<ConfirmationDialogComponent>;

  
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
              protected rxStompService: RxStompService,
              protected location: LocationStrategy) {

    history.pushState(null, null, window.location.href);
    // check if back or forward button is pressed.
    this.location.onPopState(() => {
        history.pushState(null, null, window.location.href);
    });
  }

  ngOnInit(): void {

    // get passed data
    this.onlineRoundsSgn = this.navigationService.getOnlineRoundsSgn();

    if (this.authenticationService.currentPlayerValue === null ||
        this.navigationService.getCourseSgn() === undefined ||
        this.onlineRoundsSgn().length === 0 
      ) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      this.inProgress = false;

       // set owner and logged in user
       this.loggedIdSgn.set(this.authenticationService.currentPlayerValue.id);
       this.ownerIdSgn.set(this.onlineRoundsSgn()[0].owner);

      // 2.0.0 - adding sort of the array to have always the same sequence of players even
      // if retreiving from backend
      this.onlineRoundsSgn().sort((or1, or2) => or1.player.id - or2.player.id);
      this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection


      this.courseSgn =  this.navigationService.getCourseSgn();
      // initialize variables
      this.curPlayerIdxSgn.set(0);

      let initPlayerStyleArray = new Array(this.onlineRoundsSgn().length).fill('no-highlight')
      initPlayerStyleArray[0] = 'highlight';
      this.curPlayerStyleSgn.set(initPlayerStyleArray);
      
      this.curHoleStrokesSgn.set(new Array(this.onlineRoundsSgn().length).fill(0));
      this.curHolePenalties = new Array(this.onlineRoundsSgn().length).fill(0);
      this.strokesSgn.set(new Array(18).fill(0).map(() => new Array(this.onlineRoundsSgn().length).fill(0)));
      this.penaltiesSgn.set(new Array(18).fill(0).map(() => new Array(this.onlineRoundsSgn().length).fill(0)));
      this.lastPlayed = 0;
      
      this.submitted = false;
      this.loadingDelSgn.set(false);
      this.loadingFinSgn.set(false);
      this.displaySgn.set(false);
      this.roundCompleted = false;

      this.totalStrokesSgn.set(new Array(this.onlineRoundsSgn().length).fill(0));
      this.ballPickedUpSgn.set(new Array(this.onlineRoundsSgn().length).fill(false));

      // zero putts in case tracking is not required
      if (this.onlineRoundsSgn()[0].putts) {
        this.curHolePutts = new Array(this.onlineRoundsSgn().length).fill(2);
        this.puttSelectorActive[2] = ({ active: true });
      } else {
        this.curHolePutts = new Array(this.onlineRoundsSgn().length).fill(0);
      }
      this.puttsSgn.set(new Array(18).fill(0).map(() => new Array(this.onlineRoundsSgn().length).fill(0)));

      this.rxStompService.activate();
      this.handleDocumentVisibilityChanges()
      this.getRoundData();
    }
  }

  getRoundData() {

    this.httpService.getHoles(this.courseSgn().id).pipe(
      tap(
        retHoles => {
          this.courseSgn().holes = retHoles;
          this.loadScoreCards();
          this.courseSgn.set(this.courseSgn()); // trigger change detection
        })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.navigationService.clear();
    this.rxStompService.deactivate().catch(error => console.log(error));
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  selectHole(holeIdx: number) {

    // check if it is not the last hole in the scorecard
    if (this.onlineRoundsSgn()[0].tee.teeType === teeTypes.TEE_TYPE_FIRST_9 && holeIdx > 8) {
      this.curHoleIdxSgn.set(8);
      return;
    }
    if (holeIdx === 18) {
      this.curHoleIdxSgn.set(17);
      return;
    }

    // check if the requested hole is not below hole 9 in case if the last 9 is played
    if (this.onlineRoundsSgn()[0].tee.teeType === teeTypes.TEE_TYPE_LAST_9 && holeIdx <= 8) {
      this.curHoleIdxSgn.set(9);
      return;
    }

    this.curHoleIdxSgn.set(holeIdx);
    // copy strokes from stokes table
    // tslint:disable-next-line: variable-name
    this.curHoleStrokesSgn.set(this.curHoleStrokesSgn().map((_s, idx) => this.strokesSgn()[this.curHoleIdxSgn()][idx]));
    // tslint:disable-next-line: variable-name
    this.curHolePutts =  this.curHolePutts.map((_s, idx) => this.puttsSgn()[this.curHoleIdxSgn()][idx]);
    // tslint:disable-next-line: variable-name
    this.curHolePenalties =  this.curHolePenalties.map((_s, idx) => this.penaltiesSgn()[this.curHoleIdxSgn()][idx]);
    // in case if stroke is 0 load par instead
    this.curHoleStrokesSgn.set(this.curHoleStrokesSgn().map((s, idx) => {
      if (s === 0) {
        s = this.courseSgn().holes[holeIdx].par;
        if (this.onlineRoundsSgn()[idx].putts) {
          this.curHolePutts[idx] =  2;
        }
      }
      return s;
    }));
    // set player index to 0 and update edit style
    this.curPlayerIdxSgn.set(0);
    this.puttSelectorActive.fill({ active: false });
    this.puttSelectorActive[this.curHolePutts[this.curPlayerIdxSgn()]] = ({ active: true });
    this.penaltySelectorActive.fill({ active: false });
    this.penaltySelectorActive[this.curHolePenalties[this.curPlayerIdxSgn()]] = ({ active: true });
  }

  onFinal() {

    // display dialog box for verification if the user for sure want to finalize the round
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = $localize`:@@onLineRndBse-finRndCnf:Are you sure you want to finish the round?`;
    this.dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.loadingFinSgn.set(true);

        this.scorecardHttpService.finalizeOnlineOwnerRound(this.authenticationService.currentPlayerValue.id).pipe(
          tap(
            () => {
              this.loadingFinSgn.set(false);
              this.alertService.success($localize`:@@onLineRndBse-finRndMsg:The round has been successfuly saved`, true);
              this.router.navigate(['/rounds']).catch(error => console.log(error));
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
    this.dialogRef.componentInstance.makeItDanger = true;
    this.dialogRef.afterClosed().subscribe(result => {

      if (result) {
        this.loadingDelSgn.set(true);

        this.scorecardHttpService.deleteOnlineRoundForOwner(this.authenticationService.currentPlayerValue.id).pipe(
          tap(
            () => {
              this.loadingDelSgn.set(false);
              this.alertService.success($localize`:@@onLineRndBse-delRndMsg:This score card has been successfully deleted`, false);
              this.router.navigate(['/home']).catch(error => console.log(error));
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

  protected prepareAndCalculateNetStatistic() {
    // This is intentional
  }

  protected updateNetStatistic() {
    // This is intentional
  }

  addScore() {

    // save only if anything has been changed
    if (this.curHoleStrokesSgn()[this.curPlayerIdxSgn()] !== this.strokesSgn()[this.curHoleIdxSgn()][this.curPlayerIdxSgn()] ||
      this.curHolePutts[this.curPlayerIdxSgn()] !== this.puttsSgn()[this.curHoleIdxSgn()][this.curPlayerIdxSgn()] ||
      this.curHolePenalties[this.curPlayerIdxSgn()] !== this.penaltiesSgn()[this.curHoleIdxSgn()][this.curPlayerIdxSgn()]) {

       // create new online score card
      const currentOnlineScoreCard: OnlineScoreCard = {
        hole: this.curHoleIdxSgn() + 1,
        stroke: this.curHoleStrokesSgn()[this.curPlayerIdxSgn()],
        putt: this.curHolePutts[this.curPlayerIdxSgn()],
        penalty: this.curHolePenalties[this.curPlayerIdxSgn()],
        player: {
          id: this.onlineRoundsSgn()[this.curPlayerIdxSgn()].player.id,
          nick: this.onlineRoundsSgn()[this.curPlayerIdxSgn()].player.nick
        },
        orId: this.onlineRoundsSgn()[this.curPlayerIdxSgn()].id,
        update: false,
        time: formatDate(new Date(), 'HH:mm', 'en-US')
      };

      // verify if it is an update
      if ((this.curHoleStrokesSgn()[this.curPlayerIdxSgn()] !== this.strokesSgn()[this.curHoleIdxSgn()][this.curPlayerIdxSgn()] ||
        this.curHolePutts[this.curPlayerIdxSgn()] !== this.puttsSgn()[this.curHoleIdxSgn()][this.curPlayerIdxSgn()] ||
        this.curHolePenalties[this.curPlayerIdxSgn()] !== this.penaltiesSgn()[this.curHoleIdxSgn()][this.curPlayerIdxSgn()]) &&
        this.strokesSgn()[this.curHoleIdxSgn()][this.curPlayerIdxSgn()] !== 0) {

          currentOnlineScoreCard.update = true;
          this.sendMessage(currentOnlineScoreCard);

      } else {
          this.sendMessage(currentOnlineScoreCard);
      }
    } else {
      this.moveToNextPlayer();
    }
  }

  private processReceipt() {
    this.updateTotals();
    this.moveToNextPlayer();
    this.inProgress = false;
  }

  private moveToNextPlayer() {
    // move to the next player
    //this.editClass[this.curPlayerIdx] = 'no-edit';
    // increase current player index is not last or set to 0 if last
    // update mp score if score enetered for both players
    this.updateMpResult(this.curHoleIdxSgn());
    this.updateMpTotal();
    this.updateNetStatistic();

    if (this.curPlayerIdxSgn() < this.onlineRoundsSgn().length - 1) {

      let initPlayerStyleArray = new Array(this.onlineRoundsSgn().length).fill('no-highlight')
      this.curPlayerIdxSgn.set(this.curPlayerIdxSgn() + 1);
      initPlayerStyleArray[this.curPlayerIdxSgn()] = 'highlight';
      this.curPlayerStyleSgn.set(initPlayerStyleArray);
    } else {

      let initPlayerStyleArray = new Array(this.onlineRoundsSgn().length).fill('no-highlight')
      this.curPlayerIdxSgn.set(0);
      initPlayerStyleArray[this.curPlayerIdxSgn()] = 'highlight';
      this.curPlayerStyleSgn.set(initPlayerStyleArray);
      this.selectHole(this.curHoleIdxSgn() + 1);
      
    }

    this.puttSelectorActive.fill({ active: false });
    this.puttSelectorActive[this.curHolePutts[this.curPlayerIdxSgn()]] = ({ active: true });
    this.penaltySelectorActive.fill({ active: false });
  }


  private updateTotals() {
    // update total strokes by substracting current value and adding the new one
    this.totalStrokesSgn()[this.curPlayerIdxSgn()] -= this.strokesSgn()[this.curHoleIdxSgn()][this.curPlayerIdxSgn()];
    this.totalStrokesSgn()[this.curPlayerIdxSgn()] += this.curHoleStrokesSgn()[this.curPlayerIdxSgn()];
    this.totalStrokesSgn.set([...this.totalStrokesSgn()]); // trigger change detection

    // udate strokes for display
    this.strokesSgn()[this.curHoleIdxSgn()][this.curPlayerIdxSgn()] = this.curHoleStrokesSgn()[this.curPlayerIdxSgn()];
    this.strokesSgn.set([...this.strokesSgn()]); // trigger change detection

    // verify if at least for one hole the ball has been picked up
    this.setBallPickUp();

    this.puttsSgn()[this.curHoleIdxSgn()][this.curPlayerIdxSgn()] = this.curHolePutts[this.curPlayerIdxSgn()];
    this.puttsSgn.set([...this.puttsSgn()]); // trigger change detection
    this.penaltiesSgn()[this.curHoleIdxSgn()][this.curPlayerIdxSgn()] = this.curHolePenalties[this.curPlayerIdxSgn()];
    this.penaltiesSgn.set([...this.penaltiesSgn()]); // trigger change detection
  }

  private sendMessage(onlineScoreCard: OnlineScoreCard) {
    this.inProgress = true;

    const receiptId = '' + Math.random() * 10000;
    this.rxStompService.publish({ destination: '/app/hole', headers: {receipt: receiptId}, body: JSON.stringify(onlineScoreCard) });
    const prom = this.rxStompService.asyncReceipt(receiptId);
    prom.then(() => {
      this.processReceipt();
    }).catch(error => console.log(error))
  }

  private setBallPickUp() {

    for  (let idx = 0; idx < 18; idx++) {

      if (this.strokesSgn()[idx][this.curPlayerIdxSgn()] === ballPickedUpStrokes) {
        this.ballPickedUpSgn()[this.curPlayerIdxSgn()] = true;
        break;
      }
      if (idx === 17) {
        this.ballPickedUpSgn()[this.curPlayerIdxSgn()] = false;
      }
    }
    this.ballPickedUpSgn.set([...this.ballPickedUpSgn()]); // trigger change detection
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

    const calls: Observable<OnlineScoreCard[]>[] = Array(this.onlineRoundsSgn().length);

    for (let i = 0; i < this.onlineRoundsSgn().length; i++) {
      // calculate course HCP for each player
      this.calculateHCP(i);
      calls[i] = this.scorecardHttpService.getOnlineScoreCard(this.onlineRoundsSgn()[i].id);
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
        this.curHoleStrokesSgn.set(this.curHoleStrokesSgn().map((s, idx) => {
          s += this.strokesSgn()[this.curHoleIdxSgn()][idx];
          if (s === 0) {
            s = this.courseSgn().holes[this.curHoleIdxSgn()].par;
          } else {
            this.curHolePutts[idx] = this.puttsSgn()[this.curHoleIdxSgn()][idx];
            this.curHolePenalties[idx] = this.penaltiesSgn()[this.curHoleIdxSgn()][idx];

            if (idx === 0) {
              this.puttSelectorActive[2] = ({ active: false });
              this.puttSelectorActive[this.curHolePutts[0]] = ({ active: true });
              this.penaltySelectorActive[0] = ({ active: false });
              this.penaltySelectorActive[this.curHolePenalties[0]] = ({ active: true });
            }

          }
          return s;
        }));
        this.prepareAndCalculateNetStatistic();
        this.displaySgn.set(true);
        
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
        this.strokesSgn()[sc.hole - 1][i] = sc.stroke;
        this.puttsSgn()[sc.hole - 1][i] = sc.putt;
        this.penaltiesSgn()[sc.hole - 1][i] = sc.penalty;
        
        // initialize total strokes per player
        if (!this.ballPickedUpSgn()[i] && sc.stroke < ballPickedUpStrokes) {
          this.totalStrokesSgn()[i] += sc.stroke;
          
        } else {
          this.ballPickedUpSgn()[i] = true;
        }
      });
      this.strokesSgn.set([...this.strokesSgn()]); // trigger change detection
      this.puttsSgn.set([...this.puttsSgn()]); // trigger change detection
      this.penaltiesSgn.set([...this.penaltiesSgn()]); // trigger change detection
      this.totalStrokesSgn.set([...this.totalStrokesSgn()]); // trigger change detection
    }
  }

  private initCurHoleIdx(onlineScoreCards: OnlineScoreCard[][]) {
     // initialize the current hole inedex (assumed all players will play the same number of holes)
     if (onlineScoreCards[0].length === 0 && this.onlineRoundsSgn()[0].tee.teeType === teeTypes.TEE_TYPE_LAST_9) {
      this.curHoleIdxSgn.set(9);
    } else if (onlineScoreCards[0].length === 0) {
      this.curHoleIdxSgn.set(0);
    } else {
      this.curHoleIdxSgn.set(onlineScoreCards[0].map(scoreCard => scoreCard.hole).reduce((p, c) => p < c ? c : p, 0) - 1);
    }
  }

  private checkIfRoundCompleted() {
    // check if round is completed completed
    if ((this.onlineRoundsSgn()[0].tee.teeType === teeTypes.TEE_TYPE_FIRST_9 && this.curHoleIdxSgn() === 8) || this.curHoleIdxSgn() === 17) {
      this.roundCompleted = true;
    } else {
      this.roundCompleted = false;
    }
  }

  private handleDocumentVisibilityChanges(): void {

    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    this.visibilityChangeEvent = fromEvent(document, 'visibilitychange');

    this.subscriptions.push(this.visibilityChangeEvent.subscribe(() => {

      if (document.visibilityState === 'visible') {
        this.rxStompService.deactivate().catch(error => console.log(error));
        this.rxStompService.activate();
      }

    }));

  }

  refresh() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.ngOnInit();
  }

  onInfo() {
    
    if (!this.onlineRoundsSgn()[0].matchPlay && this.onlineRoundsSgn()[0].courseHCP == undefined) {
      this.onlineRoundsSgn().forEach(onlineRound => {
        onlineRound.courseHCP = calculateCourseHCP(onlineRound.tee.teeType,
                                                   onlineRound.player.whs,
                                                   onlineRound.tee.sr,
                                                   onlineRound.tee.cr,
                                                   getPlayedCoursePar(this.courseSgn().holes,
                                                                      onlineRound.tee.teeType,
                                                                      this.courseSgn().par));
      });
    }

    this.router.navigate(['myScorecard/onlineScoreCardInfo'], {state: {onlineRounds: this.onlineRoundsSgn()}}).catch(error => console.log(error));
  }
}
