import { NavigationService, ViewType } from './../_services/navigation.service';
import { AuthenticationService, HttpService } from '@/_services';
import { Component, computed, OnDestroy, OnInit, signal, Signal, WritableSignal} from '@angular/core';
import { fromEvent, Subscription, timer } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { OnlineRound, OnlineScoreCard } from '../_models';
import { Course, Format} from '@/_models';
import { ScorecardHttpService } from '../_services';
import { createMPResultHistory, createMPResultText } from '@/_helpers';
import { ballPickedUpStrokes } from '@/_helpers/common';
import { RxStompService } from '../_services/rx-stomp.service';
import { NgClass, DecimalPipe } from '@angular/common';
import { HALF_HOLES } from '../_helpers/constants';
import { MPView } from './formats/mp-view';
import { RoundView } from './formats/round-view';
import { CourseView } from './formats/course-view';
import { FBMPView } from './formats/fbmp-view';
import { RangePipe } from '@/_helpers/range';

@Component({
    selector: 'app-online-score-card-view',
    templateUrl: './online-score-card-view.component.html',
    styleUrls: ['./online-score-card-view.component.css'],
    imports: [RouterLink, DecimalPipe, NgClass, RangePipe],
    providers: [NavigationService]
})
export class OnlineScoreCardViewComponent implements OnInit, OnDestroy {

  readonly ViewType = ViewType;

  // component varaiables
  holeHCP: number[][];
  // -2 not set
  // -1 first player won
  // 0 tie
  // 1 second player won
  mpScore: number[];
  teeTime: string;
  queueSubscription: Subscription;
  subscriptions: Subscription[] = [];
  subscription: Subscription;

  // signals
  onlineRoundsSgn = signal<OnlineRound[]>(undefined);
  courseSgn = signal<Course>(undefined); 
  ownerSgn = signal<number>(undefined);
  displaySgn = signal<boolean>(false);
  highlightHCPSgn = signal<string[][]>(undefined);
  finalizedSgn = signal<boolean>(undefined);
  mpResultHistorySgn = signal<string[][]>(undefined);
  first9ballPickedUpSgn = signal<boolean[]>(undefined); 
  last9ballPickedUpSgn = signal<boolean[]>(undefined);
  scoreBruttoClassSgn = signal<string[][]>(undefined);
  lstUpdTimeSgn = signal<string>(undefined);
  elapsedSgn = signal<TimeSpan>(undefined);
  viewTypeSgn = signal<ViewType>(undefined);
  highlightResultSgn:  WritableSignal<string[][]> = signal(new Array(2).fill('').map(() => new Array(18).fill('')));

  // computed signals
  first9parSgn: Signal<number> = computed(() => this.courseSgn().holes.map(h => h.par)
                .reduce((p, n, i) => { if (i < HALF_HOLES) { return p + n; } else { return p; } }, 0));
  last9parSgn: Signal<number> = computed(() => this.onlineRoundsSgn()[0].course.par - this.first9parSgn());
  mpResultSgn: Signal<string[]>;

  constructor(private readonly httpService: HttpService,
              private readonly scorecardHttpService: ScorecardHttpService,
              private readonly authenticationService: AuthenticationService,
              private readonly router: Router,
              private readonly navigationService: NavigationService,
              private readonly rxStompService: RxStompService) { }

  ngOnDestroy(): void {

    this.clear();
    this.navigationService.clear();
  }

  private clear(): void {

    this.rxStompService.deactivate().catch(error => console.log(error));

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }

    this.subscriptions.forEach(subscription => subscription.unsubscribe());

  }

  ngOnInit(): void {

    this.onlineRoundsSgn = this.navigationService.getOnlineRoundsSgn();
    // get course from state
    this.courseSgn = this.navigationService.getCourseSgn();

    this.viewTypeSgn.set(this.navigationService.getViewTypeSgn()());

    if (this.authenticationService.currentPlayerValue === null ||
        (this.courseSgn() === undefined && this.onlineRoundsSgn().length === 0)) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      this.handleDocumentVisibilityChanges();

      this.elapsedSgn.set({hours: 0, minutes: 0, seconds: 0});
      
      // get owner in case of match play online score card
      this.ownerSgn = this.navigationService.getOwnerSgn();

      if (this.viewTypeSgn() === ViewType.PLAYER) {
        this.onlineRoundsSgn.set([this.onlineRoundsSgn()[0]]); // trigger change detection
        this.courseSgn.set(this.onlineRoundsSgn()[0].course);
        this.finalizedSgn.set(this.onlineRoundsSgn()[0].finalized);

        let rw = new RoundView( this.scorecardHttpService, 
                                this.httpService);

        rw.showRound( this.scoreBruttoClassSgn,
                      this.onlineRoundsSgn, 
                      this.first9ballPickedUpSgn,  
                      this.last9ballPickedUpSgn,
                      this.lstUpdTimeSgn
                    ).subscribe({ 
                        complete: () => {
                          this.resetCounter();
                          this.displaySgn.set(true);
                          this.startLisenning();
                        }
                    }) 
      } else if (this.viewTypeSgn() === ViewType.MP) {
        this.holeHCP = new Array(2).fill(0).map(() => new Array(18).fill(0));
        this.highlightHCPSgn = signal(new Array(2).fill('no-edit').map(() => new Array(18).fill('no-edit')));
        this.finalizedSgn.set(this.onlineRoundsSgn()[0].finalized);
        this.mpScore = new Array(18).fill(-2);    
        this.teeTime  = this.onlineRoundsSgn()[0].teeTime;

        let mp = new MPView( this.scorecardHttpService, 
                                this.httpService)

        mp.showMatch( this.onlineRoundsSgn, 
                      this.courseSgn, 
                      this.holeHCP, 
                      this.highlightHCPSgn,
                      this.mpScore, 
                      this.mpResultHistorySgn,
                      this.lstUpdTimeSgn
                     ).subscribe({ 
                        complete: () => {
                          this.mpResultSgn = computed(() => createMPResultText(this.onlineRoundsSgn()[0].player.nick, this.onlineRoundsSgn()[1].player.nick, this.mpScore, Format.MATCH_PLAY));
                          this.resetCounter();
                          this.displaySgn.set(true);
                          this.startLisenning();
                        }
                      }) 
      } else if (this.viewTypeSgn() === ViewType.FBMP) {
        this.holeHCP = new Array(4).fill(0).map(() => new Array(18).fill(0));
        this.highlightHCPSgn = signal(new Array(2).fill('no-edit').map(() => new Array(18).fill('no-edit')));
        this.finalizedSgn.set(this.onlineRoundsSgn()[0].finalized);
        this.mpScore = new Array(18).fill(-2);    
        this.teeTime  = this.onlineRoundsSgn()[0].teeTime;

        let fbmp = new FBMPView( this.scorecardHttpService, 
                                this.httpService)

        fbmp.showFBMatch( this.onlineRoundsSgn, 
                      this.courseSgn, 
                      this.holeHCP, 
                      this.mpScore, 
                      this.mpResultHistorySgn,
                      this.lstUpdTimeSgn,
                      this.highlightResultSgn
                     ).subscribe({ 
                        complete: () => {
                          this.mpResultSgn = computed(() => createMPResultText('Team 1', 'Team 2', this.mpScore, Format.MATCH_PLAY));
                          this.resetCounter();
                          this.displaySgn.set(true);
                          this.startLisenning();
                        }
                      }) 
      } else if (this.viewTypeSgn() === ViewType.COURSE) {
       
        let cw = new CourseView( this.scorecardHttpService, 
                                this.httpService)

        cw.showCourse(this.scoreBruttoClassSgn,
                      this.onlineRoundsSgn, 
                      this.courseSgn,
                      this.first9ballPickedUpSgn,  
                      this.last9ballPickedUpSgn,
                      this.lstUpdTimeSgn,
                      this.finalizedSgn
                    ).subscribe({ 
                        complete: () => {
                          this.resetCounter();
                          this.displaySgn.set(true);
                          this.startLisenning();
                        }
                    }) 
      }
    }
  }

  startLisenning() {

    this.rxStompService.activate();
    this.queueSubscription = this.rxStompService.watch('/topic').subscribe((message) => {

        this.handleMessage(JSON.parse(message.body));

    });
  }

  // helper function to provide array for html
  counterSgn = signal<Array<number>>([...new Array(HALF_HOLES).keys()]) 

  // process score card received from the web socket
  handleMessage(onlineScoreCard: OnlineScoreCard) {

    if (this.ownerSgn()) {
      this.handleMatchPlayMessage(onlineScoreCard);
       // calculate MP result texts
      //this.mpResultSgn = computed(() => createMPResultText(this.onlineRoundsSgn()[0].player.nick, this.onlineRoundsSgn()[1].player.nick, this.mpScore, Format.MATCH_PLAY));
       // calculate MP result history
      this.mpResultHistorySgn.set(createMPResultHistory(this.mpScore));
    } else {
      this.handleStrokeMessage(onlineScoreCard);
    }
  }

  private handleMatchPlayMessage(onlineScoreCard: OnlineScoreCard) {


    let holeIdx = -1;

    this.onlineRoundsSgn().forEach(onlineRound => {

      // update if applicable for that card
      if (onlineRound.player.id === onlineScoreCard.player.id) {

        onlineRound.scoreCardAPI[onlineScoreCard.hole - 1] = onlineScoreCard;
        this.checkForReload(onlineRound, onlineScoreCard.hole - 1);
        holeIdx = onlineScoreCard.hole - 1;

        this.lstUpdTimeSgn.set(onlineScoreCard.time);

        // calculate mp result
        const scPlayer0 = this.onlineRoundsSgn()[0].scoreCardAPI[holeIdx];
        const scPlayer1 = this.onlineRoundsSgn()[1].scoreCardAPI[holeIdx];

        if (holeIdx !== -1 &&  scPlayer0 !== null && scPlayer1 !== null) {

          this.resetCounter();

          const result = scPlayer0.stroke - this.holeHCP[0][holeIdx] -
          (scPlayer1.stroke - this.holeHCP[1][holeIdx]);

          if (result < 0) {
            scPlayer0.mpResult = 1;
            scPlayer1.mpResult = 0;
            this.mpScore[holeIdx] = -1;
          } else if (result === 0) {
            scPlayer0.mpResult = 0;
            scPlayer1.mpResult = 0;
            this.mpScore[holeIdx] = 0;
          } else {
            scPlayer0.mpResult = 0;
            scPlayer1.mpResult = 1;
            this.mpScore[holeIdx] = 1;
          }

          this.createSummary();
        }
        this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection
      }
    });

  }

  private createSummary() {

    this.first9parSgn = computed(() => this.courseSgn().holes.map(h => h.par).
    reduce((p, n, i) => { if (i < HALF_HOLES) { return p + n; } else { return p; } }, 0));
  }

  private handleStrokeMessage(onlineScoreCard: OnlineScoreCard) {

    this.onlineRoundsSgn().forEach((onlineRound, idx) => {

      // update if applicable for that card
      if (onlineRound.player.id === onlineScoreCard.player.id) {

        this.lstUpdTimeSgn.set(onlineScoreCard.time);

        this.resetCounter();

        // update score total
        if (onlineScoreCard.hole < 10) {

          // for update
          if (onlineRound.scoreCardAPI[onlineScoreCard.hole - 1] != null) {
            onlineRound.first9score -= onlineRound.scoreCardAPI[onlineScoreCard.hole - 1].stroke;
          }
          onlineRound.first9score += onlineScoreCard.stroke;

        } else {
          // for update
          if (onlineRound.scoreCardAPI[onlineScoreCard.hole - 1] != null) {
            onlineRound.last9score -= onlineRound.scoreCardAPI[onlineScoreCard.hole - 1].stroke;
          }
          onlineRound.last9score += onlineScoreCard.stroke;
        }
        onlineRound.scoreCardAPI[onlineScoreCard.hole - 1] = onlineScoreCard;
        this.checkForReload(onlineRound, onlineScoreCard.hole - 1);

        // create colour
        this.scoreBruttoClassSgn()[idx][onlineScoreCard.hole - 1] =
          OnlineScoreCardViewComponent.prepareColoursForResults(onlineScoreCard.stroke, this.courseSgn().holes[onlineScoreCard.hole - 1].par);
        this.scoreBruttoClassSgn.set([...this.scoreBruttoClassSgn()]); // trigger change detection

        // check if at least for one hole the ball was picked up for each 9
        this.first9ballPickedUpSgn()[idx] = onlineRound.scoreCardAPI.some((v => v?.stroke === ballPickedUpStrokes && v?.hole <= HALF_HOLES));
        this.first9ballPickedUpSgn.set([...this.first9ballPickedUpSgn()]); // trigger change detection

        this.last9ballPickedUpSgn()[idx] = onlineRound.scoreCardAPI.some((v => v?.stroke === ballPickedUpStrokes && v?.hole > HALF_HOLES));
        this.last9ballPickedUpSgn.set([...this.last9ballPickedUpSgn()]); // trigger change detection

        this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection
      }
    });
  }

  // reload if previous hole is not set
  checkForReload(onlineRound: OnlineRound, hole: number) {

    if (onlineRound.scoreCardAPI[hole - 1] === null) {
      this.clear();
      this.ngOnInit();
    }

  }


  public static prepareColoursForResults(stroke: number, par: number): string {

    let retVal = '';

    switch (par - stroke) {
      case 0:
        retVal = 'par';
        break;
      case -1:
        retVal = 'boggey';
        break;
      case 1:
        retVal = 'birdie';
        break;
      case 2:
        retVal = 'eagle';
        break;
      default:
        retVal = 'doubleBoggey';
        break;
      }
    return retVal;
  }

  private resetCounter() {

    if (this.lstUpdTimeSgn() === undefined) {
      return;
    }

    const startDate = new Date();
    startDate.setHours(+this.lstUpdTimeSgn().substring(0, 2));
    startDate.setMinutes(+this.lstUpdTimeSgn().substring(3, 5));

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = timer(0, 1000)
    .subscribe(() => {
      this.elapsedSgn.set(this.getElapsedTime(startDate));
    });
  }

 private  getElapsedTime(entry: Date): TimeSpan {
    let totalSeconds = Math.floor((Date.now() - entry.getTime()) / 1000);

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (totalSeconds >= 3600) {
      hours = Math.floor(totalSeconds / 3600);
      totalSeconds -= 3600 * hours;
    }

    if (totalSeconds >= 60) {
      minutes = Math.floor(totalSeconds / 60);
      totalSeconds -= 60 * minutes;
    }

    seconds = totalSeconds;

    return {
      hours,
      minutes,
      seconds
    };
  }

  public static compareTime(first: string, second: string): string {

    if (first === undefined) {
      first = '00:00';
    }

    const firstNum: number  = +first.replace(':', '');
    const secondNum: number  = +second.replace(':', '');

    return firstNum > secondNum ? first : second;
  }

  private handleDocumentVisibilityChanges(): void {

    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    const visibilityChangeEvent = fromEvent(document, 'visibilitychange');

    this.subscriptions.push(visibilityChangeEvent.subscribe(() => {

      if (document.visibilityState === 'visible') {
        this.clear();
        this.ngOnInit();
      }

    }));

  }
}

interface TimeSpan {
  hours: number;
  minutes: number;
  seconds: number;
}
