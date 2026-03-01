import { NavigationService } from '../_services/navigation.service';
import { AuthenticationService } from '@/_services';
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink, Routes } from '@angular/router';
import { OnlineRound } from '../_models';
import { ScorecardHttpService } from '../_services';
import { AuthGuard } from '@/_helpers/auth.guard';
import { OnlineRoundDefComponent } from '../online-round-def/online-round-def.component';
import { OnlineMatchplayComponent } from '../online-matchplay/online-matchplay.component';
import { InfoComponent } from '../info/info.component';
import { OnlineStrokeplayComponent } from '../online-strokeplay/online-strokeplay.component';
import { Format } from '@/_models/format';
import { ViewSelectorComponent } from '../view-selector/view-selector.component';

@Component({
    selector: 'app-my-online-score-card',
    templateUrl: './my-online-score-card.component.html',
    imports: [RouterLink],
    providers: [NavigationService]
})
export class MyOnlineScoreCardComponent implements OnInit {

  displaySgn: WritableSignal<boolean> = signal(false);
  myOnlineRoundsSgn: WritableSignal<OnlineRound[]> = signal([]);

  constructor(private readonly scorecardHttpService: ScorecardHttpService,
              private readonly authenticationService: AuthenticationService,
              private readonly router: Router,
              private readonly navigationService: NavigationService) {
  }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      // initialization
      this.displaySgn.set(false);
      this.navigationService.clear();

      this.scorecardHttpService.getOnlineRounds().subscribe((retOnlineRounds: OnlineRound[]) => {

        // initialize this player open round written by him if any
        this.myOnlineRoundsSgn.set(retOnlineRounds.filter(v => v.owner ===
          this.authenticationService.currentPlayerValue.id && v.finalized === false));

        if (this.myOnlineRoundsSgn().length > 0) {
          this.showRound();
        }

        // set all rounds except the open one that is written by this player
        const activeOnlineRound: OnlineRound = retOnlineRounds.find(v => v.player.id ===
          this.authenticationService.currentPlayerValue.id && v.finalized === false);

        if (activeOnlineRound) {

          this.myOnlineRoundsSgn.set(retOnlineRounds.filter(v => v.owner ===
            activeOnlineRound.owner && v.finalized === false));

          this.showRound();
        }
        this.displaySgn = signal(true);
      });
    }
  }

  showRound() {
    this.navigationService.setCourseSgn(signal(this.myOnlineRoundsSgn()[0].course));
    this.navigationService.setOnlineRoundsSgn(signal(this.myOnlineRoundsSgn()));
    switch (this.myOnlineRoundsSgn()[0].format) {
      case Format.MATCH_PLAY:
        this.router.navigate(['/scorecard/onlineMatchplay']).catch(error => console.log(error));
        break;
      case Format.FOUR_BALL_MATCH_PLAY:
        this.router.navigate(['/scorecard/onlineFbMatchplay']).catch(error => console.log(error));
        break;
      case Format.FOUR_BALL_STROKE_PLAY:
        this.router.navigate(['/scorecard/onlineFbStrokeplay']).catch(error => console.log(error));
        break;
      default:
        this.router.navigate(['/scorecard/onlineStrokeplay']).catch(error => console.log(error));
        break;
    }
  }
}

export const myOnlineScoreCardRouts: Routes = [

  { path: '', component: MyOnlineScoreCardComponent, canActivate: [AuthGuard] },
  { path: 'viewSelector', component: ViewSelectorComponent, canActivate: [AuthGuard] },
  { path: 'onlineStrokeplay', component: OnlineStrokeplayComponent, canActivate: [AuthGuard] },
  { path: 'onlineRoundDef', component: OnlineRoundDefComponent, canActivate: [AuthGuard] },
  { path: 'onlineMatchplay', component: OnlineMatchplayComponent, canActivate: [AuthGuard] },
  { path: 'onlineScoreCardInfo', component: InfoComponent, canActivate: [AuthGuard] },

];


