import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { OnlineRound, OnlineScoreCard } from '../_models';
import { Course} from '@/_models';
import { WebSocketAPI } from '../_helpers';
import { ScorecardHttpService } from '../_services';
import { calculateCourseHCP, calculateHoleHCP, createMPResultText, getPlayedCoursePar} from '@/_helpers';

@Component({
  selector: 'app-online-score-card-view',
  templateUrl: './online-score-card-view.component.html'
})
export class OnlineScoreCardViewComponent implements OnInit, OnDestroy {

  onlineRounds: OnlineRound[];
  course: Course;
  owner: number;
  display = false;
  first9par: number;
  last9par: number;
  webSocketAPI: WebSocketAPI;
  // matchPlayResults: number[][];
  holeHCP: number[][];
  finalized: boolean;
  // -2 not set
  // -1 first player won
  // 0 tie
  // 1 second player won
  mpScore: number[];
  mpResult: string[];

  constructor(private httpService: HttpService,
              private scorecardHttpService: ScorecardHttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router) { }

  ngOnDestroy(): void {
    if (this.webSocketAPI != null) {
      this.webSocketAPI._disconnect();
    }
  }


  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {
      // get round from state
      const onlineRound: OnlineRound = history.state.data.onlineRound;
      // get course from state
      this.course = history.state.data.course;
      // get owner in case of match play online score card
      this.owner = history.state.data.owner;

      if (onlineRound != null) {
        this.onlineRounds = new Array(1);
        this.onlineRounds[0] = onlineRound;
        this.course = onlineRound.course;
        this.showRound();
      } else if (this.owner != null) {
        this.holeHCP = new Array(2).fill(0).map(() => new Array(18).fill(0));
        this.finalized = history.state.data.finalized;
        this.mpScore = new Array(18).fill(-2);
        this.mpResult = new Array(2);
        this.showMatch();
      } else {
        this.showCourse();
      }

      this.webSocketAPI = new WebSocketAPI(this, this.alertService, this.authenticationService, true, false);
    }
  }

  showMatch() {

    combineLatest([this.scorecardHttpService.getOnlineRoundsForOwner(
      this.owner), this.httpService.getHoles(this.course.id)]).subscribe(([retOnlineRounds, retHoles]) => {

        this.course.holes = retHoles;

        // the assumption is that only idiots play more than 2 match play a day
        retOnlineRounds = retOnlineRounds.filter(or => or.finalized === this.finalized);

        retOnlineRounds.forEach((or, index) => {

            or.courseHCP = calculateCourseHCP(or.tee.teeType,
              or.player.whs,
              or.tee.sr,
              or.tee.cr,
              getPlayedCoursePar(this.course.holes , or.tee.teeType, this.course.par));

            // for all than MP round
            if (this.owner === null) {
                calculateHoleHCP( index,
                                    or.tee.teeType,
                                    or.courseHCP,
                                    this.holeHCP,
                                    this.course);
            }

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

        // update for match play
        retOnlineRounds[0].first9score = 0;
        retOnlineRounds[1].first9score = 0;
        retOnlineRounds[0].last9score = 0;
        retOnlineRounds[1].last9score = 0;

        this.calculateMpResult(retOnlineRounds);

        this.onlineRounds = retOnlineRounds;

        // calculate MP result texts
        this.mpResult = createMPResultText(this.onlineRounds[0].player.nick, this.onlineRounds[1].player.nick, this.mpScore);

        this.first9par = this.course.holes.map(h => h.par).
          reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9par = this.onlineRounds[0].course.par - this.first9par;
        this.webSocketAPI._connect(true);
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
          sc.hole <= 9 ? retOnlineRounds[0].first9score++ : retOnlineRounds[0].last9score++;
        } else if (result === 0) {
          sc.mpResult = 0;
          this.mpScore[index] = 0;
          retOnlineRounds[1].scoreCardAPI[index].mpResult = 0;
        } else {
          sc.mpResult = 0;
          this.mpScore[index] = 1;
          retOnlineRounds[1].scoreCardAPI[index].mpResult = 1;
          sc.hole <= 9 ? retOnlineRounds[1].first9score++ : retOnlineRounds[1].last9score++;
        }
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

    combineLatest([this.scorecardHttpService.getOnlineScoreCard(
      this.onlineRounds[0].id), this.httpService.getHoles(this.onlineRounds[0].course.id)]).subscribe(([retScoreCards, retHoles]) => {

        const onlineScoreCards: OnlineScoreCard[] = Array(18);

        this.onlineRounds[0].course.holes = retHoles;
        this.onlineRounds[0].first9score = 0;
        this.onlineRounds[0].last9score = 0;

        let idx = retScoreCards.length;
        while (idx > 0) {
          onlineScoreCards[retScoreCards[idx - 1].hole - 1] = retScoreCards[idx - 1];

          // initiate first and last 9 total strokes
          if (retScoreCards[idx - 1].hole < 10) {
            this.onlineRounds[0].first9score += retScoreCards[idx - 1].stroke;
          } else {
            this.onlineRounds[0].last9score += retScoreCards[idx - 1].stroke;
          }
          idx--;
        }
        this.onlineRounds[0].scoreCardAPI = onlineScoreCards;

        // create pars for first and last 9
        this.first9par = this.onlineRounds[0].course.holes.map(h => h.par).
          reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9par = this.onlineRounds[0].course.par - this.first9par;
        this.webSocketAPI._connect(true);
        this.display = true;
    });
  }

  showCourse() {
    combineLatest([this.scorecardHttpService.getOnlineRoundsForCourse(
      this.course.id), this.httpService.getHoles(this.course.id)]).subscribe(([retOnlineRounds, retHoles]) => {

        this.course.holes = retHoles;

        retOnlineRounds.forEach(retOnlineRound => {

          const retScoreCardAPI = retOnlineRound.scoreCardAPI;
          retOnlineRound.scoreCardAPI = Array(18).fill(null);
          retOnlineRound.first9score = 0;
          retOnlineRound.last9score = 0;

          retScoreCardAPI.forEach(scoreCardAPI => {
            retOnlineRound.scoreCardAPI[scoreCardAPI.hole - 1] = scoreCardAPI;
            if (scoreCardAPI.hole < 10) {
              retOnlineRound.first9score += scoreCardAPI.stroke;
            } else {
              retOnlineRound.last9score += scoreCardAPI.stroke;
            }

          });

          this.onlineRounds = retOnlineRounds;

        });

        this.onlineRounds = retOnlineRounds;
        // create pars for first and last 9
        this.first9par = this.course.holes.map(h => h.par).
          reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9par = this.course.par - this.first9par;
        this.webSocketAPI._connect(true);
        this.display = true;
    });
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
        holeIdx = onlineScoreCard.hole - 1;
      }
    });

    // calculate mp result
    const scPlayer0 = this.onlineRounds[0].scoreCardAPI[holeIdx];
    const scPlayer1 = this.onlineRounds[1].scoreCardAPI[holeIdx];

    if (holeIdx !== -1 &&  scPlayer0 !== null && scPlayer1 !== null) {

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

  private createSummary() {

    this.first9par = this.course.holes.map(h => h.par).
    reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
    this.onlineRounds[0].first9score = this.onlineRounds[0].scoreCardAPI.filter(sc => sc !== null && sc.hole <= 9)
      .map(sc => sc.mpResult).reduce((p, n) => p + n, 0);
    this.onlineRounds[1].first9score = this.onlineRounds[1].scoreCardAPI.filter(sc => sc !== null  && sc.hole <= 9)
      .map(sc => sc.mpResult).reduce((p, n) => p + n, 0);
    this.onlineRounds[0].last9score = this.onlineRounds[0].scoreCardAPI.filter(sc => sc !== null && sc.hole > 9)
      .map(sc => sc.mpResult).reduce((p, n) => p + n, 0);
    this.onlineRounds[1].last9score = this.onlineRounds[1].scoreCardAPI.filter(sc => sc !== null && sc.hole > 9)
    .map(sc => sc.mpResult).reduce((p, n) => p + n, 0);
  }

  private handleStrokeMessage(onlineScoreCard: OnlineScoreCard) {

    this.onlineRounds.forEach(onlineRound => {

      // update if applicable for that card
      if (onlineRound.player.id === onlineScoreCard.player.id) {

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
      }
    });
  }


  handleLostConnection(lost: boolean) {

    this.router.navigate(['/']);

  }
}
