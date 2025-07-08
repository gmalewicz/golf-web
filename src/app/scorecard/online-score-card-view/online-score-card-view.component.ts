import { NavigationService } from './../_services/navigation.service';
import { AuthenticationService, HttpService } from '@/_services';
import { Component, computed, OnDestroy, OnInit, signal, Signal} from '@angular/core';
import { combineLatest, fromEvent, Subscription, timer } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { OnlineRound, OnlineScoreCard } from '../_models';
import { Course} from '@/_models';
import { ScorecardHttpService } from '../_services';
import { calculateCourseHCP, calculateHoleHCP, createMPResultHistory, createMPResultText, getPlayedCoursePar} from '@/_helpers';
import { ballPickedUpStrokes } from '@/_helpers/common';
import { RxStompService } from '../_services/rx-stomp.service';
import { NgClass, DecimalPipe } from '@angular/common';
import { HALF_HOLES } from '../_helpers/constants';

@Component({
    selector: 'app-online-score-card-view',
    templateUrl: './online-score-card-view.component.html',
    styleUrls: ['./online-score-card-view.component.css'],
    imports: [NgClass, RouterLink, DecimalPipe],
    providers: [NavigationService]
})
export class OnlineScoreCardViewComponent implements OnInit, OnDestroy {

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

  // computed signals
  first9parSgn: Signal<number>;
  last9parSgn: Signal<number>;
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

    if (this.authenticationService.currentPlayerValue === null ||
        (this.courseSgn() === undefined && this.onlineRoundsSgn().length === 0)) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      this.handleDocumentVisibilityChanges();

      this.elapsedSgn.set({hours: 0, minutes: 0, seconds: 0});
      
      // get owner in case of match play online score card
      this.ownerSgn = this.navigationService.getOwnerSgn();

      if (this.onlineRoundsSgn().length !== 0 && this.ownerSgn() === undefined) {
        this.onlineRoundsSgn.set([...[this.onlineRoundsSgn()[0]]]); // trigger change detection
        this.courseSgn.set(this.onlineRoundsSgn()[0].course);
        this.finalizedSgn.set(this.onlineRoundsSgn()[0].finalized);
        this.showRound();
      } else if (this.ownerSgn() !== undefined) {
        this.holeHCP = new Array(2).fill(0).map(() => new Array(18).fill(0));
        this.highlightHCPSgn = signal(new Array(2).fill('no-edit').map(() => new Array(18).fill('no-edit')));
        this.finalizedSgn.set(this.onlineRoundsSgn()[0].finalized);
        this.mpScore = new Array(18).fill(-2);    
        this.teeTime  = this.onlineRoundsSgn()[0].teeTime;
        this.showMatch();
      } else {
        this.showCourse();
      }
    }
  }

  startLisenning() {

    this.rxStompService.activate();
    this.queueSubscription = this.rxStompService.watch('/topic').subscribe((message) => {

        this.handleMessage(JSON.parse(message.body));

    });
  }

  showMatch() {

    combineLatest([this.scorecardHttpService.getOnlineRoundsForOwner(
      this.ownerSgn()), this.httpService.getHoles(this.courseSgn().id)]).subscribe(([retOnlineRounds, retHoles]) => {

        this.courseSgn().holes = retHoles;

        retOnlineRounds = retOnlineRounds.filter(or => or.matchPlay === true && or.teeTime === this.teeTime);

        retOnlineRounds.forEach(or => {

            or.courseHCP = calculateCourseHCP(or.tee.teeType,
              or.player.whs,
              or.tee.sr,
              or.tee.cr,
              getPlayedCoursePar(this.courseSgn().holes , or.tee.teeType, this.courseSgn().par));

            this.updateStartingHole(or);

        });

        if (this.ownerSgn() != undefined) {

          const hcpDiff = retOnlineRounds[0].courseHCP - retOnlineRounds[1].courseHCP;
          let corHcpDiff = Math.abs(hcpDiff * retOnlineRounds[0].mpFormat);

          if (corHcpDiff - Math.floor(corHcpDiff) >= 0.5) {
            corHcpDiff = Math.ceil(corHcpDiff);
          } else {
            corHcpDiff = Math.floor(corHcpDiff);
          }

          if (hcpDiff >= 0) {
            retOnlineRounds[0].courseHCP = corHcpDiff;
            retOnlineRounds[1].courseHCP = 0;
          } else {
            retOnlineRounds[0].courseHCP = 0;
            retOnlineRounds[1].courseHCP = Math.abs(corHcpDiff);
          }

          calculateHoleHCP( 0,
            retOnlineRounds[0].tee.teeType,
            retOnlineRounds[0].courseHCP,
             this.holeHCP,
             this.courseSgn());

          calculateHoleHCP( 1,
            retOnlineRounds[1].tee.teeType,
            retOnlineRounds[1].courseHCP,
            this.holeHCP,
            this.courseSgn());
  
          this.highlightHCPSgn()[0] = this.holeHCP[0].map(hcp => hcp > 0 ? 'highlightHcp' : 'no-edit');
          this.highlightHCPSgn()[1] = this.holeHCP[1].map(hcp => hcp > 0 ? 'highlightHcp' : 'no-edit');  
          this.highlightHCPSgn.set([...this.highlightHCPSgn()]); // trigger change detection
          
        }

        this.calculateMpResult(retOnlineRounds);

        this.onlineRoundsSgn.set([...retOnlineRounds]); // trigger change detection

        
        // calculate MP result texts
        this.mpResultSgn = computed(() => createMPResultText(this.onlineRoundsSgn()[0].player.nick, this.onlineRoundsSgn()[1].player.nick, this.mpScore));
        // calculate MP result history
        this.mpResultHistorySgn.set(...[createMPResultHistory(this.mpScore)]);
        
        this.first9parSgn = computed(() => this.courseSgn().holes.map(h => h.par).
          reduce((p, n, i) => { if (i < HALF_HOLES) { return p + n; } else { return p; } }, 0));
        this.last9parSgn = computed(() => this.onlineRoundsSgn()[0].course.par - this.first9parSgn());
        this.startLisenning();
        this.displaySgn.set(true);
    });
  }

  private calculateMpResult(retOnlineRounds: OnlineRound[]) {

    retOnlineRounds[0].scoreCardAPI.forEach((sc, index) => {

      // calculate mp result
      if (sc !== null && retOnlineRounds[1].scoreCardAPI[index] !== null) {

        const result = sc.stroke - this.holeHCP[0][index] -
        (retOnlineRounds[1].scoreCardAPI[index].stroke - this.holeHCP[1][index]);

        if (result < 0) {
          sc.mpResult = 1;
          this.mpScore[index] = -1;
          retOnlineRounds[1].scoreCardAPI[index].mpResult = 0;
        } else if (result === 0) {
          sc.mpResult = 0;
          this.mpScore[index] = 0;
          retOnlineRounds[1].scoreCardAPI[index].mpResult = 0;
        } else {
          sc.mpResult = 0;
          this.mpScore[index] = 1;
          retOnlineRounds[1].scoreCardAPI[index].mpResult = 1;
        }
        this.lstUpdTimeSgn.set(this.compareTime(this.lstUpdTimeSgn(), sc.time));
        this.resetCounter();
      }
    });
  }

  private updateStartingHole(onlineRound: OnlineRound) {

    const retScoreCardAPI = onlineRound.scoreCardAPI;

    onlineRound.scoreCardAPI = Array(18).fill(null);

    onlineRound.first9score = 0;
    onlineRound.last9score = 0;

    retScoreCardAPI.forEach(scoreCardAPI => {
      onlineRound.scoreCardAPI[scoreCardAPI.hole - 1] = scoreCardAPI;
      if (scoreCardAPI.hole < 10) {
        onlineRound.first9score += scoreCardAPI.stroke;
      } else {
        onlineRound.last9score += scoreCardAPI.stroke;
      }

    });
  }

  showRound() {

    // initialize colour display class for results
    this.scoreBruttoClassSgn.set(new Array(1).fill('').map(() => new Array(18).fill('')));

    combineLatest([this.scorecardHttpService.getOnlineScoreCard(
      this.onlineRoundsSgn()[0].id), this.httpService.getHoles(this.onlineRoundsSgn()[0].course.id)]).subscribe(([retScoreCards, retHoles]) => {

        this.first9ballPickedUpSgn.set(Array(this.onlineRoundsSgn().length).fill(false));
        this.last9ballPickedUpSgn.set(Array(this.onlineRoundsSgn().length).fill(false));

        const onlineScoreCards: OnlineScoreCard[] = Array(18);

        this.onlineRoundsSgn()[0].course.holes = retHoles;
        this.onlineRoundsSgn()[0].first9score = 0;
        this.onlineRoundsSgn()[0].last9score = 0;

        let idx = retScoreCards.length;

        while (idx > 0) {
          onlineScoreCards[retScoreCards[idx - 1].hole - 1] = retScoreCards[idx - 1];

          // set ball picked up for a player
          if (retScoreCards[idx - 1].stroke === ballPickedUpStrokes && retScoreCards[idx - 1].hole <= HALF_HOLES) {
            this.first9ballPickedUpSgn()[0] = true;
            this.first9ballPickedUpSgn.set([...this.first9ballPickedUpSgn()]); // trigger change detection
          }
          if (retScoreCards[idx - 1].stroke === ballPickedUpStrokes && retScoreCards[idx - 1].hole > HALF_HOLES) {
            this.last9ballPickedUpSgn()[0] = true;
            this.last9ballPickedUpSgn.set([...this.last9ballPickedUpSgn()]); // trigger change detection
          }

          // initiate first and last 9 total strokes
          if (retScoreCards[idx - 1].hole < 10) {
            this.onlineRoundsSgn()[0].first9score += retScoreCards[idx - 1].stroke;
          } else {
            this.onlineRoundsSgn()[0].last9score += retScoreCards[idx - 1].stroke;
          }
          // create colour
          this.scoreBruttoClassSgn()[0][retScoreCards[idx - 1].hole - 1] =
            this.prepareColoursForResults(retScoreCards[idx - 1].stroke, this.onlineRoundsSgn()[0].course.holes[retScoreCards[idx - 1].hole - 1].par);
          this.scoreBruttoClassSgn.set([...this.scoreBruttoClassSgn()]); // trigger change detection

          this.lstUpdTimeSgn.set(this.compareTime(this.lstUpdTimeSgn(), retScoreCards[idx - 1].time));
          idx--;
        }
        this.resetCounter();

        this.onlineRoundsSgn()[0].scoreCardAPI = onlineScoreCards;

        // create pars for first and last 9
        this.first9parSgn = computed(() => this.onlineRoundsSgn()[0].course.holes.map(h => h.par).
          reduce((p, n, i) => { if (i < HALF_HOLES) { return p + n; } else { return p; } }, 0));
        this.last9parSgn = computed(() => this.onlineRoundsSgn()[0].course.par - this.first9parSgn());
        this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection
        this.startLisenning();
        this.displaySgn.set(true);
    });
  }

  showCourse() {

    combineLatest([this.scorecardHttpService.getOnlineRoundsForCourse(
      this.courseSgn().id), this.httpService.getHoles(this.courseSgn().id)]).subscribe(([retOnlineRounds, retHoles]) => {

        this.first9ballPickedUpSgn.set(Array(retOnlineRounds.length).fill(false));
        this.last9ballPickedUpSgn.set(Array(retOnlineRounds.length).fill(false));
        this.courseSgn().holes = retHoles;

        // initialize colour display class for results
        this.scoreBruttoClassSgn.set(new Array(retOnlineRounds.length).fill('').map(() => new Array(18).fill('')));

        this.finalizedSgn.set(true);

        retOnlineRounds.forEach((retOnlineRound, idx) => {

          if (!retOnlineRound.finalized) {
            this.finalizedSgn.set(false);
          }

          const retScoreCardAPI = retOnlineRound.scoreCardAPI;
          retOnlineRound.scoreCardAPI = Array(18).fill(null);
          retOnlineRound.first9score = 0;
          retOnlineRound.last9score = 0;

          let lastIdx = 0;

          retScoreCardAPI.forEach((scoreCardAPI, id) => {
            // set ball picked up for a player
            this.setBallPickUp(scoreCardAPI, idx);

            retOnlineRound.scoreCardAPI[scoreCardAPI.hole - 1] = scoreCardAPI;
            if (scoreCardAPI.hole < 10) {
              retOnlineRound.first9score += scoreCardAPI.stroke;
            } else {
              retOnlineRound.last9score += scoreCardAPI.stroke;
            }

            // create colour
            this.scoreBruttoClassSgn()[idx][scoreCardAPI.hole - 1] =
              this.prepareColoursForResults(scoreCardAPI.stroke, this.courseSgn().holes[scoreCardAPI.hole - 1].par);
            this.scoreBruttoClassSgn.set([...this.scoreBruttoClassSgn()]); // trigger change detection

            this.lstUpdTimeSgn.set(this.compareTime(this.lstUpdTimeSgn(), scoreCardAPI.time));
            this.resetCounter();

            if (id > lastIdx) {
              lastIdx = id;
            }
          });
          this.onlineRoundsSgn.update(() => retOnlineRounds);           
        });

        this.onlineRoundsSgn.update(() => retOnlineRounds); 
        // create pars for first and last 9
        this.first9parSgn = computed(() => this.courseSgn().holes.map(h => h.par).
          reduce((p, n, i) => { if (i < HALF_HOLES) { return p + n; } else { return p; } }, 0));
        this.last9parSgn = computed(() => this.courseSgn().par - this.first9parSgn());
        this.onlineRoundsSgn.set([...this.onlineRoundsSgn()]); // trigger change detection
        this.startLisenning();
        this.displaySgn.set(true);
    });
  }

  private setBallPickUp(scoreCardAPI: OnlineScoreCard, idx: number) {

    if (scoreCardAPI.stroke === ballPickedUpStrokes && scoreCardAPI.hole <= HALF_HOLES) {
      this.first9ballPickedUpSgn()[idx] = true;
      this.first9ballPickedUpSgn.set([...this.first9ballPickedUpSgn()]); // trigger change detection
    }
    if (scoreCardAPI.stroke === ballPickedUpStrokes && scoreCardAPI.hole > HALF_HOLES) {
      this.last9ballPickedUpSgn()[idx] = true;
      this.last9ballPickedUpSgn.set([...this.last9ballPickedUpSgn()]); // trigger change detection
    }
  }


  // helper function to provide array for html
  counterSgn = signal<Array<number>>([...Array(HALF_HOLES).keys()]) 

  // process score card received from the web socket
  handleMessage(onlineScoreCard: OnlineScoreCard) {

    if (this.ownerSgn()) {
      this.handleMatchPlayMessage(onlineScoreCard);
       // calculate MP result texts
      this.mpResultSgn = computed(() => createMPResultText(this.onlineRoundsSgn()[0].player.nick, this.onlineRoundsSgn()[1].player.nick, this.mpScore));
       // calculate MP result history
      this.mpResultHistorySgn.set(...[createMPResultHistory(this.mpScore)]);
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
          this.prepareColoursForResults(onlineScoreCard.stroke, this.courseSgn().holes[onlineScoreCard.hole - 1].par);
         this.scoreBruttoClassSgn.set([...this.scoreBruttoClassSgn()]); // trigger change detection

        // check if at least for one hole the ball was picked up for each 9
        this.first9ballPickedUpSgn()[idx] = onlineRound.scoreCardAPI.some((v => v != null && v.stroke === ballPickedUpStrokes && v.hole <= HALF_HOLES));
        this.first9ballPickedUpSgn.set([...this.first9ballPickedUpSgn()]); // trigger change detection

        this.last9ballPickedUpSgn()[idx] = onlineRound.scoreCardAPI.some((v => v != null && v.stroke === ballPickedUpStrokes && v.hole > HALF_HOLES));
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


  prepareColoursForResults(stroke: number, par: number): string {

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

    if (typeof this.lstUpdTimeSgn() === 'undefined') {
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
    let totalSeconds = Math.floor((new Date().getTime() - entry.getTime()) / 1000);

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

  private compareTime(first: string, second: string): string {

    if (typeof first === 'undefined') {
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
