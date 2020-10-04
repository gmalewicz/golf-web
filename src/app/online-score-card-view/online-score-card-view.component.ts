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

  onlineRound: OnlineRound;
  // holes: Hole[];
  onlineScoreCard: OnlineScoreCard[];
  display = false;
  first9par: number;
  last9par: number;
  first9score = 0;
  last9score = 0;
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
    this.onlineRound = history.state.data.onlineRound;
    this.showRound();
    this.webSocketAPI = new WebSocketAPI(this, this.alertService, this.authenticationService);

  }

  showRound() {

    combineLatest([this.httpService.getOnlineScoreCard(
      this.onlineRound.id), this.httpService.getHoles(this.onlineRound.course.id)]).subscribe(([retScoreCards, retHoles]) => {

        this.onlineScoreCard = Array(18);
        this.onlineRound.course.holes = retHoles;

        let idx = retScoreCards.length;
        while (idx > 0) {
          this.onlineScoreCard[retScoreCards[idx - 1].hole - 1] = retScoreCards[idx - 1];

          // initiate first and last 9 total strokes
          if (retScoreCards[idx - 1].hole < 10) {
            this.first9score += retScoreCards[idx - 1].stroke;
          } else {
            this.last9score += retScoreCards[idx - 1].stroke;
          }
          idx--;
        }
        // console.log(this.onlineScoreCard);

        // create pars for first and last 9
        this.first9par = this.onlineRound.course.holes.map(h => h.par).
          reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9par = this.onlineRound.course.par - this.first9par;
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

    // update if applicable for that card
    if (this.onlineRound.player.id === onlineScoreCard.player.id) {

      // update score total
      if (onlineScoreCard.hole < 10) {

        // for update
        if (this.onlineScoreCard[onlineScoreCard.hole - 1] != null) {
          this.first9score -= this.onlineScoreCard[onlineScoreCard.hole - 1].stroke;
        }
        this.first9score += onlineScoreCard.stroke;
      } else {
        // for update
        if (this.onlineScoreCard[onlineScoreCard.hole - 1] != null) {
          this.last9score -= this.onlineScoreCard[onlineScoreCard.hole - 1].stroke;
        }
        this.last9score += onlineScoreCard.stroke;
      }
      this.onlineScoreCard[onlineScoreCard.hole - 1] = onlineScoreCard;
    }
  }
}
