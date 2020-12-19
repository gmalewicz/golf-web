import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { OnlineRound, OnlineScoreCard } from '../_models';
import { Course} from '@/_models';
import { WebSocketAPI } from '../_helpers';
import { ScorecardHttpService } from '../_services';
import { calculateCourseHCP, calculateHoleHCP, getPlayedCoursePar } from '@/_helpers';

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
  webSocketAPI: WebSocketAPI;
  // matchPlayResults: number[][];
  holeHCP: number[][];

  constructor(private httpService: HttpService,
              private scorecardHttpService: ScorecardHttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router) { }

  ngOnDestroy(): void {
    // console.log('destroy');
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
      // get owner in case of patch play online score card
      this.owner = history.state.data.owner;

      if (onlineRound != null) {
        this.onlineRounds = new Array(1);
        this.onlineRounds[0] = onlineRound;
        this.course = onlineRound.course;
        this.showRound();
      } else if (this.owner != null) {
        this.holeHCP = new Array(2).fill(0).map(() => new Array(18).fill(0));
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

        retOnlineRounds.forEach((or, index) => {

          or.courseHCP = calculateCourseHCP(or.tee.teeType,
            or.player.whs,
            or.tee.sr,
            or.tee.cr,
            getPlayedCoursePar(this.course.holes , or.tee.teeType, this.course.par));

          calculateHoleHCP( index,
                              or.tee.teeType,
                              or.courseHCP,
                              this.holeHCP,
                              this.course);

          this.updateStartingHole(or);
        });

        // update for match play
        retOnlineRounds[0].first9score = 0;
        retOnlineRounds[1].first9score = 0;
        retOnlineRounds[0].last9score = 0;
        retOnlineRounds[1].last9score = 0;

        retOnlineRounds[0].scoreCardAPI.forEach((sc, index) => {

          console.log(sc);

          // calculate mp result
          if (sc !== null && retOnlineRounds[1].scoreCardAPI[index] !== null) {

            console.log('inside: ' + sc.stroke);
            const result = sc.stroke - this.holeHCP[0][index] -
            (retOnlineRounds[1].scoreCardAPI[index].stroke - this.holeHCP[1][index]);

            if (result < 0) {
              sc.mpResult = 1;
              retOnlineRounds[1].scoreCardAPI[index].mpResult = 0;
              if (sc.hole < 9) {
                retOnlineRounds[0].first9score++;
              } else {
                retOnlineRounds[0].last9score++;
              }
            } else if (result === 0) {
              sc.mpResult = 0;
              retOnlineRounds[1].scoreCardAPI[index].mpResult = 0;
            } else {
              sc.mpResult = 0;
              retOnlineRounds[1].scoreCardAPI[index].mpResult = 1;
              if (sc.hole < 9) {
                retOnlineRounds[1].first9score++;
              } else {
                retOnlineRounds[1].last9score++;
              }
            }
          }
        });

        this.onlineRounds = retOnlineRounds;

        this.first9par = this.course.holes.map(h => h.par).
          reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9par = this.onlineRounds[0].course.par - this.first9par;
        this.webSocketAPI._connect(true);
        this.display = true;
    });
  }

  private updateStartingHole(onlineRound: OnlineRound) {

    const retScoreCardAPI = onlineRound.scoreCardAPI;

    onlineRound.scoreCardAPI = Array(18).fill(null);

    onlineRound.first9score = 0;
    onlineRound.last9score = 0;

    retScoreCardAPI.forEach(scoreCardAPI => {
      // console.log(scoreCardAPI.hole - 1);
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
        // console.log(this.onlineScoreCard);

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
          // const onlineScoreCards = Array(18).fill(null);
          retOnlineRound.scoreCardAPI = Array(18).fill(null);
          // console.log('retScoreCardAPIs ' + retScoreCardAPI);
          // console.log('retScoreCardAPI ' + retOnlineRound.scoreCardAPI);
          retOnlineRound.first9score = 0;
          retOnlineRound.last9score = 0;

          retScoreCardAPI.forEach(scoreCardAPI => {
            // console.log(scoreCardAPI.hole - 1);
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
      } else if (result === 0) {
        scPlayer0.mpResult = 0;
        scPlayer1.mpResult = 0;
      } else {
        scPlayer0.mpResult = 0;
        scPlayer1.mpResult = 1;
      }

      this.onlineRounds[0].first9score = this.onlineRounds[0].scoreCardAPI.filter(sc => sc !== null && sc.hole < 9)
        .map(sc => sc.mpResult).reduce((p, n) => p + n, 0);
      // console.log('p0 first 9 total: ' + this.onlineRounds[0].first9score);
      this.onlineRounds[1].first9score = this.onlineRounds[1].scoreCardAPI.filter(sc => sc !== null  && sc.hole < 9)
        .map(sc => sc.mpResult).reduce((p, n) => p + n, 0);
      // console.log('p1 first 9 total: ' + this.onlineRounds[1].first9score);
      this.onlineRounds[0].last9score = this.onlineRounds[0].scoreCardAPI.filter(sc => sc !== null && sc.hole >= 9)
        .map(sc => sc.mpResult).reduce((p, n) => p + n, 0);
      // console.log('p0 last 9 total: ' + this.onlineRounds[0].last9score);
      this.onlineRounds[1].last9score = this.onlineRounds[1].scoreCardAPI.filter(sc => sc !== null && sc.hole >= 9)
      .map(sc => sc.mpResult).reduce((p, n) => p + n, 0);
      // console.log('p1 last 9 total: ' + this.onlineRounds[1].last9score);
    }
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

    // console.log('Handling lost connection');
    this.router.navigate(['/']);

  }
}
