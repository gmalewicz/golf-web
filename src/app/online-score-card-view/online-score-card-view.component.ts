import { Course } from './../_models/course';
import { WebSocketAPI } from '@/_helpers/web.socekt.api';
import { Hole } from '@/_models';
import { OnlineRound } from '@/_models/onlineRound';
import { OnlineScoreCard } from '@/_models/onlineScoreCard';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-online-score-card-view',
  templateUrl: './online-score-card-view.component.html',
  styleUrls: ['./online-score-card-view.component.css']
})
export class OnlineScoreCardViewComponent implements OnInit, OnDestroy {

  onlineRounds: OnlineRound[];
  course: Course;
  display = false;
  first9par: number;
  last9par: number;
  webSocketAPI: WebSocketAPI;

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService) { }

  ngOnDestroy(): void {
    // console.log('destroy');
    this.webSocketAPI._disconnect();
  }

  ngOnInit(): void {

    // get round from state
    const onlineRound: OnlineRound = history.state.data.onlineRound;
    // get course from state
    this.course = history.state.data.course;

    if (onlineRound != null) {
      this.onlineRounds = new Array(1);
      this.onlineRounds[0] = onlineRound;
      this.course = onlineRound.course;
      this.showRound();
    } else {
      this.showCourse();
    }

    this.webSocketAPI = new WebSocketAPI(this, this.alertService, this.authenticationService);

  }

  showRound() {

    combineLatest([this.httpService.getOnlineScoreCard(
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
    combineLatest([this.httpService.getOnlineRoundsForCourse(
      this.course.id), this.httpService.getHoles(this.course.id)]).subscribe(([retOnlineRounds, retHoles]) => {

        this.course.holes = retHoles;

        retOnlineRounds.forEach(retOnlineRound => {

          retOnlineRound.first9score = 0;
          retOnlineRound.last9score = 0;
          let idx = retOnlineRound.scoreCardAPI.length;
          while (idx > 0) {

            // initiate first and last 9 total strokes
            if (retOnlineRound.scoreCardAPI[idx - 1].hole < 10) {
              retOnlineRound.first9score += retOnlineRound.scoreCardAPI[idx - 1].stroke;
            } else {
              retOnlineRound.last9score += retOnlineRound.scoreCardAPI[idx - 1].stroke;
            }
            idx--;
          }
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
}
