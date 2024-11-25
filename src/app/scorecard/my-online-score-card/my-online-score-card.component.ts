import { NavigationService } from '../_services/navigation.service';
import { AuthenticationService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, Routes } from '@angular/router';
import { OnlineRound } from '../_models';
import { ScorecardHttpService } from '../_services';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { KeyValuePipe } from '@angular/common';
import { AuthGuard } from '@/_helpers/auth.guard';
import { OnlineRoundComponent } from '../online-round/online-round.component';
import { OnlineScoreCardComponent } from '../online-score-card/online-score-card.component';
import { OnlineRoundDefComponent } from '../online-round-def/online-round-def.component';
import { OnlineMatchplayComponent } from '../online-matchplay/online-matchplay.component';

@Component({
    selector: 'app-my-online-score-card',
    templateUrl: './my-online-score-card.component.html',
    imports: [FaIconComponent, RouterLink, KeyValuePipe],
    providers: [NavigationService]
})
export class MyOnlineScoreCardComponent implements OnInit {

  display: boolean;
  myOnlineRounds: OnlineRound[];

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
      this.display = false;
      this.navigationService.clear();

      this.scorecardHttpService.getOnlineRounds().subscribe((retOnlineRounds: OnlineRound[]) => {

        // initialize this player open round written by him if any
        this.myOnlineRounds = retOnlineRounds.filter(v => v.owner ===
          this.authenticationService.currentPlayerValue.id && v.finalized === false);

        if (this.myOnlineRounds.length > 0) {
          this.showRound();
        }

        // set all rounds except the open one that is written by this player
        const activeOnlineRound: OnlineRound = retOnlineRounds.find(v => v.player.id ===
          this.authenticationService.currentPlayerValue.id && v.finalized === false);

        if (activeOnlineRound) {

          this.myOnlineRounds = retOnlineRounds.filter(v => v.owner ===
            activeOnlineRound.owner && v.finalized === false);

          this.showRound();
        }
        this.display = true;
      });
    }
  }

  showRound() {
    this.navigationService.setCourse(this.myOnlineRounds[0].course);
    this.navigationService.setOnlineRounds(this.myOnlineRounds);
    if (this.myOnlineRounds[0].matchPlay) {
      this.router.navigate(['myScorecard/onlineMatchplay']).catch(error => console.log(error));
    } else {
      this.router.navigate(['myScorecard/onlineRound']).catch(error => console.log(error));
    }
  }
}

export const myOnlineScoreCardRouts: Routes = [

  { path: '', component: MyOnlineScoreCardComponent, canActivate: [AuthGuard] },
  { path: 'onlineScoreCard', component: OnlineScoreCardComponent, canActivate: [AuthGuard] },
  { path: 'onlineRound', component: OnlineRoundComponent, canActivate: [AuthGuard] },
  //{ path: 'onlineScoreCardView', component: OnlineScoreCardViewComponent, canActivate: [AuthGuard] },
  { path: 'onlineRoundDef', component: OnlineRoundDefComponent, canActivate: [AuthGuard] },
  { path: 'onlineMatchplay', component: OnlineMatchplayComponent, canActivate: [AuthGuard] },

];


