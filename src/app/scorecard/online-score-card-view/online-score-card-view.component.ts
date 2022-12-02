import { NavigationService } from './../_services/navigation.service';
import { AuthenticationService, HttpService } from '@/_services';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subscription, timer } from 'rxjs';
import { Router } from '@angular/router';
import { OnlineRound, OnlineScoreCard } from '../_models';
import { Course} from '@/_models';
import { ScorecardHttpService } from '../_services';
import { calculateCourseHCP, calculateHoleHCP, createMPResultHistory, createMPResultText, getPlayedCoursePar} from '@/_helpers';
import { ballPickedUpStrokes } from '@/_helpers/common';
import { RxStompService } from '../_services/rx-stomp.service';

@Component({
  selector: 'app-online-score-card-view',
  templateUrl: './online-score-card-view.component.html',
  styleUrls: ['./online-score-card-view.component.css']
})
export class OnlineScoreCardViewComponent implements OnInit, OnDestroy {

  onlineRounds: OnlineRound[];
  course: Course;
  owner: number;
  display = false;
  first9par: number;
  last9par: number;
  //webSocketAPI: WebSocketAPI2;
  holeHCP: number[][];
  finalized: boolean;
  // -2 not set
  // -1 first player won
  // 0 tie
  // 1 second player won
  mpScore: number[];
  mpResult: string[];
  mpResultHistory: string[][];

  // ballPickedUp: boolean[];
  first9ballPickedUp: boolean[];
  last9ballPickedUp: boolean[];

  teeTime: string;

  scoreBruttoClass: string[][];

  elapsed: TimeSpan;
  subscription: Subscription;

  lstUpdTime: string;

  queueSubscription: Subscription;

  constructor(private httpService: HttpService,
              private scorecardHttpService: ScorecardHttpService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private navigationService: NavigationService,
              private rxStompService: RxStompService) { }

  ngOnDestroy(): void {

    this.rxStompService.deactivate();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.queueSubscription) {
      this.queueSubscription.unsubscribe();
    }

    this.navigationService.clear();
  }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null &&
        this.navigationService.getCourse() === null && this.navigationService.getOnlineRounds() === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {

      this.elapsed = {hours: 0, minutes: 0, seconds: 0};
      // get round from state
      let onlineRound: OnlineRound = null;
      if (this.navigationService.getOnlineRounds() !== null) {
        onlineRound = this.navigationService.getOnlineRounds()[0];
      }
      // get course from state
      this.course = this.navigationService.getCourse();
      // get owner in case of match play online score card
      this.owner = this.navigationService.getOwner();

      if (onlineRound !== null && this.owner === null) {
        this.onlineRounds = new Array(1);
        this.onlineRounds[0] = onlineRound;
        this.course = onlineRound.course;
        this.finalized = onlineRound.finalized;
        this.showRound();
      } else if (this.owner !== null) {
        this.holeHCP = new Array(2).fill(0).map(() => new Array(18).fill(0));
        this.finalized = this.navigationService.getOnlineRounds()[0].finalized;
        this.mpScore = new Array(18).fill(-2);
        this.mpResult = new Array(2);
        this.teeTime  = this.navigationService.getOnlineRounds()[0].teeTime;
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
      this.owner), this.httpService.getHoles(this.course.id)]).subscribe(([retOnlineRounds, retHoles]) => {

        this.course.holes = retHoles;

        retOnlineRounds = retOnlineRounds.filter(or => or.matchPlay === true && or.teeTime === this.teeTime);

        retOnlineRounds.forEach(or => {

            or.courseHCP = calculateCourseHCP(or.tee.teeType,
              or.player.whs,
              or.tee.sr,
              or.tee.cr,
              getPlayedCoursePar(this.course.holes , or.tee.teeType, this.course.par));

            this.updateStartingHole(or);

        });

        if (this.owner != null) {

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
             this.course);

          calculateHoleHCP( 1,
            retOnlineRounds[1].tee.teeType,
            retOnlineRounds[1].courseHCP,
            this.holeHCP,
            this.course);
        }

        this.calculateMpResult(retOnlineRounds);

        this.onlineRounds = retOnlineRounds;

        // calculate MP result texts
        this.mpResult = createMPResultText(this.onlineRounds[0].player.nick, this.onlineRounds[1].player.nick, this.mpScore);
        // calculate MP result history
        this.mpResultHistory = createMPResultHistory(this.mpScore);
        this.first9par = this.course.holes.map(h => h.par).
          reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9par = this.onlineRounds[0].course.par - this.first9par;
        this.startLisenning();
        this.display = true;
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
        this.lstUpdTime = this.compareTime(this.lstUpdTime, sc.time);
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
    this.scoreBruttoClass = new Array(1).fill('').map(() => new Array(18).fill(''));

    combineLatest([this.scorecardHttpService.getOnlineScoreCard(
      this.onlineRounds[0].id), this.httpService.getHoles(this.onlineRounds[0].course.id)]).subscribe(([retScoreCards, retHoles]) => {

        this.first9ballPickedUp = Array(this.onlineRounds.length).fill(false);
        this.last9ballPickedUp = Array(this.onlineRounds.length).fill(false);

        const onlineScoreCards: OnlineScoreCard[] = Array(18);

        this.onlineRounds[0].course.holes = retHoles;
        this.onlineRounds[0].first9score = 0;
        this.onlineRounds[0].last9score = 0;

        let idx = retScoreCards.length;
        while (idx > 0) {
          onlineScoreCards[retScoreCards[idx - 1].hole - 1] = retScoreCards[idx - 1];

          // set ball picked up for a player
          if (retScoreCards[idx - 1].stroke === ballPickedUpStrokes && retScoreCards[idx - 1].hole <= 9) {
            this.first9ballPickedUp[0] = true;
          }
          if (retScoreCards[idx - 1].stroke === ballPickedUpStrokes && retScoreCards[idx - 1].hole > 9) {
            this.last9ballPickedUp[0] = true;
          }

          // initiate first and last 9 total strokes
          if (retScoreCards[idx - 1].hole < 10) {
            this.onlineRounds[0].first9score += retScoreCards[idx - 1].stroke;
          } else {
            this.onlineRounds[0].last9score += retScoreCards[idx - 1].stroke;
          }
          // create colour
          this.scoreBruttoClass[0][retScoreCards[idx - 1].hole - 1] =
            this.prepareColoursForResults
              (retScoreCards[idx - 1].stroke, this.onlineRounds[0].course.holes[retScoreCards[idx - 1].hole - 1].par);

          this.lstUpdTime = this.compareTime(this.lstUpdTime, retScoreCards[idx - 1].time);
          idx--;
        }
        this.resetCounter();

        this.onlineRounds[0].scoreCardAPI = onlineScoreCards;

        // create pars for first and last 9
        this.first9par = this.onlineRounds[0].course.holes.map(h => h.par).
          reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9par = this.onlineRounds[0].course.par - this.first9par;
        this.startLisenning();
        this.display = true;
    });
  }

  showCourse() {

    combineLatest([this.scorecardHttpService.getOnlineRoundsForCourse(
      this.course.id), this.httpService.getHoles(this.course.id)]).subscribe(([retOnlineRounds, retHoles]) => {
;
        this.first9ballPickedUp = Array(retOnlineRounds.length).fill(false);
        this.last9ballPickedUp = Array(retOnlineRounds.length).fill(false);
        this.course.holes = retHoles;

        // initialize colour display class for results
        this.scoreBruttoClass = new Array(retOnlineRounds.length).fill('').map(() => new Array(18).fill(''));

        this.finalized = true;

        retOnlineRounds.forEach((retOnlineRound, idx) => {

          if (!retOnlineRound.finalized) {
            this.finalized = false;
          }

          const retScoreCardAPI = retOnlineRound.scoreCardAPI;
          retOnlineRound.scoreCardAPI = Array(18).fill(null);
          retOnlineRound.first9score = 0;
          retOnlineRound.last9score = 0;

          retScoreCardAPI.forEach((scoreCardAPI) => {
            // set ball picked up for a player
            this.setBallPickUp(scoreCardAPI, idx);

            retOnlineRound.scoreCardAPI[scoreCardAPI.hole - 1] = scoreCardAPI;
            if (scoreCardAPI.hole < 10) {
              retOnlineRound.first9score += scoreCardAPI.stroke;
            } else {
              retOnlineRound.last9score += scoreCardAPI.stroke;
            }

            // create colour
            this.scoreBruttoClass[idx][scoreCardAPI.hole - 1] =
              this.prepareColoursForResults(scoreCardAPI.stroke, this.course.holes[scoreCardAPI.hole - 1].par);

            this.lstUpdTime = this.compareTime(this.lstUpdTime, scoreCardAPI.time);
            this.resetCounter();
          });
          this.onlineRounds = retOnlineRounds;
        });

        this.onlineRounds = retOnlineRounds;
        // create pars for first and last 9
        this.first9par = this.course.holes.map(h => h.par).
          reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9par = this.course.par - this.first9par;
        this.startLisenning();
        this.display = true;
    });
  }

  private setBallPickUp(scoreCardAPI: OnlineScoreCard, idx: number) {

    if (scoreCardAPI.stroke === ballPickedUpStrokes && scoreCardAPI.hole <= 9) {
      this.first9ballPickedUp[idx] = true;
    }
    if (scoreCardAPI.stroke === ballPickedUpStrokes && scoreCardAPI.hole > 9) {
      this.last9ballPickedUp[idx] = true;
    }
  }


  // helper function to provide verious arrays for html
  counter(i: number) {
    return new Array(i);
  }

  // process score card received from the web socket
  handleMessage(onlineScoreCard: OnlineScoreCard) {

    if (this.owner) {
      this.handleMatchPlayMessage(onlineScoreCard);
       // calculate MP result texts
      this.mpResult = createMPResultText(this.onlineRounds[0].player.nick, this.onlineRounds[1].player.nick, this.mpScore);
       // calculate MP result history
      this.mpResultHistory = createMPResultHistory(this.mpScore);
    } else {
      this.handleStrokeMessage(onlineScoreCard);
    }
  }

  private handleMatchPlayMessage(onlineScoreCard: OnlineScoreCard) {


    let holeIdx = -1;

    this.onlineRounds.forEach(onlineRound => {

      // update if applicable for that card
      if (onlineRound.player.id === onlineScoreCard.player.id) {

        onlineRound.scoreCardAPI[onlineScoreCard.hole - 1] = onlineScoreCard;
        this.checkForReload(onlineRound, onlineScoreCard.hole - 1);
        holeIdx = onlineScoreCard.hole - 1;

        this.lstUpdTime = onlineScoreCard.time;

        // calculate mp result
        const scPlayer0 = this.onlineRounds[0].scoreCardAPI[holeIdx];
        const scPlayer1 = this.onlineRounds[1].scoreCardAPI[holeIdx];

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
      }
    });

  }

  private createSummary() {

    this.first9par = this.course.holes.map(h => h.par).
    reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
  }

  private handleStrokeMessage(onlineScoreCard: OnlineScoreCard) {

    this.onlineRounds.forEach((onlineRound, idx) => {

      // update if applicable for that card
      if (onlineRound.player.id === onlineScoreCard.player.id) {

        this.lstUpdTime = onlineScoreCard.time;

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
        this.scoreBruttoClass[idx][onlineScoreCard.hole - 1] =
          this.prepareColoursForResults(onlineScoreCard.stroke, this.course.holes[onlineScoreCard.hole - 1].par);

        // check if at least for one hole the ball was picked up for each 9
        this.first9ballPickedUp[idx] = onlineRound.scoreCardAPI.some((v => v != null && v.stroke === ballPickedUpStrokes && v.hole <= 9));
        this.last9ballPickedUp[idx] = onlineRound.scoreCardAPI.some((v => v != null && v.stroke === ballPickedUpStrokes && v.hole > 9));
      }
    });
  }

  // reload if previous hole is not set
  checkForReload(onlineRound: OnlineRound, hole: number) {

    if (onlineRound.scoreCardAPI[hole - 1] === null) {
      this.ngOnDestroy();
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

    if (typeof this.lstUpdTime === 'undefined') {
      return;
    }

    const startDate = new Date();
    startDate.setHours(+this.lstUpdTime.substring(0, 2));
    startDate.setMinutes(+this.lstUpdTime.substring(3, 5));

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = timer(0, 1000)
    .subscribe(() => {
      this.elapsed = this.getElapsedTime(startDate);
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

  highlightHcp(hole: number, player: number) {
    if (this.holeHCP[player][hole] > 0) {
      return 'highlightHcp';
    }
    return 'no-edit';
  }
}

interface TimeSpan {
  hours: number;
  minutes: number;
  seconds: number;
}
