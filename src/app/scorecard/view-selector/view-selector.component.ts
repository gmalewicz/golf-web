
import { NavigationService, ViewType } from './../_services/navigation.service';
import { Course } from '@/_models/course';
import { AuthenticationService } from '@/_services';
import { ChangeDetectionStrategy, Component, OnInit, signal, WritableSignal, inject } from '@angular/core';
import { Router, RouterLink, Routes } from '@angular/router';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { OnlineRound } from '../_models';
import { ScorecardHttpService } from '../_services';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { KeyValuePipe } from '@angular/common';
import { AuthGuard } from '@/_helpers';
import { OnlineMatchplayComponent } from '../online-matchplay/online-matchplay.component';
import { OnlineRoundDefComponent } from '../online-round-def/online-round-def.component';
import { OnlineScoreCardViewComponent } from '../online-score-card-view/online-score-card-view.component';
import { OnlineFbMatchplayComponent } from '../online-fb-matchplay/online-fb-matchplay.component';
import { OnlineFbStrokeplayComponent } from '../online-fb-strokeplay/online-fb-strokeplay.component';
import { OnlineStrokeplayComponent } from '../online-strokeplay/online-strokeplay.component';
import { Format } from '@/_models/format';


@Component({
    selector: 'app-view-selector',
    templateUrl: './view-selector.component.html',
    imports: [FaIconComponent, RouterLink, KeyValuePipe],
    providers: [NavigationService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewSelectorComponent implements OnInit {
  private readonly scorecardHttpService = inject(ScorecardHttpService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);


  readonly ViewType = ViewType;
  readonly Format = Format;
  readonly faSearchPlus: IconDefinition = faSearchPlus;

  playersSgn: WritableSignal <Map<number, string[]>> = signal(new Map());
  displaySgn: WritableSignal<boolean> = signal(false);
  onlineRoundsSgn: WritableSignal<OnlineRound[]> = signal([]);
  coursesSgn: WritableSignal<Map<number, Course>> = signal(new Map());

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      // initialization
      this.navigationService.clear();

      this.scorecardHttpService.getOnlineRounds().subscribe((retOnlineRounds: OnlineRound[]) => {

        // set all rounds except the open one for this player
        this.onlineRoundsSgn.set(retOnlineRounds.filter(v => v.owner !==
          this.authenticationService.currentPlayerValue.id || v.finalized === true));

        const players = new Map<number, string[]>();  
        for (const or of this.onlineRoundsSgn()) {
          this.coursesSgn().set(or.course.id , or.course);

          if (!players.has(or.identifier)) {
            players.set(or.identifier, new Array<string>());
          }
          players.get(or.identifier).push("Team " + or.team + " : " + or.player.nick);
        }
        this.playersSgn.set(players);
        this.displaySgn.set(true);
      });
    }
  }

  viewRound(viewType: ViewType, course: Course, onlineRound: OnlineRound) {

    this.navigationService.setViewTypeSgn(signal(viewType));

    switch (viewType)  {
      case ViewType.COURSE: { // view for course
        this.navigationService.setCourseSgn(signal(course));
        break;
      }
      case ViewType.PLAYER: { // view for player
        this.navigationService.setOnlineRoundsSgn(signal([onlineRound]));
        break;
      }
      case ViewType.MP: // view for MP round
      case ViewType.FBMP: { // view for FBMP round
      
        this.navigationService.setOwnerSgn(signal(onlineRound.owner));
        this.navigationService.setCourseSgn(signal(course));
        this.navigationService.setOnlineRoundsSgn(signal([onlineRound]));
        break;
      }
    }
    this.router.navigate(['/scorecard/onlineScoreCardView']).catch(error => console.log(error));
  }
}

export const onlineScoreCardRouts: Routes = [

  { path: '', component: ViewSelectorComponent, canActivate: [AuthGuard] },
  { path: 'viewSelector', component: ViewSelectorComponent, canActivate: [AuthGuard] },
  { path: 'onlineStrokeplay', component: OnlineStrokeplayComponent, canActivate: [AuthGuard] },
  { path: 'onlineScoreCardView', component: OnlineScoreCardViewComponent, canActivate: [AuthGuard] },
  { path: 'onlineRoundDef', component: OnlineRoundDefComponent, canActivate: [AuthGuard] },
  { path: 'onlineMatchplay', component: OnlineMatchplayComponent, canActivate: [AuthGuard] },
  { path: 'onlineFbMatchplay', component: OnlineFbMatchplayComponent, canActivate: [AuthGuard] },
  { path: 'onlineFbStrokeplay', component: OnlineFbStrokeplayComponent, canActivate: [AuthGuard] },
];
