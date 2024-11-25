import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, Routes } from '@angular/router';
import { IconDefinition, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { tap } from 'rxjs/operators';
import { League, LeagueStatus } from '../_models';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { NavigationService } from '../_services/navigation.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AuthGuard } from '@/_helpers';
import { AddLeagueComponent } from '../add-league/add-league.component';
import { AddMatchComponent } from '../add-match/add-match.component';
import { LeaguePlayerComponent } from '../league-player/league-player.component';
import { LeagueComponent } from '../league/league.component';
import { RemoveMatchComponent } from '../remove-match/remove-match.component';


@Component({
    selector: 'app-mp-ligues',
    templateUrl: './mp-leagues.component.html',
    providers: [LeagueHttpService],
    imports: [FaIconComponent, RouterLink]
})
export class MpLeaguesComponent implements OnInit {

  readonly PAGE_SIZE = 10;

  page: number;
  faSearchPlus: IconDefinition;
  leagues: League[];
  display: boolean;
  statusOpen: boolean = LeagueStatus.STATUS_OPEN;
  statusClose: boolean = LeagueStatus.STATUS_CLOSE;


  constructor(private readonly leagueHttpService: LeagueHttpService,
              private readonly navigationService: NavigationService,
              public authenticationService: AuthenticationService,
              private readonly router: Router) {}

  ngOnInit(): void {

    this.display = false;
    this.page = 0;

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.faSearchPlus = faSearchPlus;
      this.getLeagues()
    }
  }

  goToLeague(league: League) {
    this.navigationService.league.set(league);
    this.navigationService.init();
    this.router.navigate(['mpLeagues/league']).catch(error => console.log(error));
  }

  getLeagues(): void {
    this.leagueHttpService.getLeagues(this.page).pipe(
      tap(
        (retLeagues: League[]) => {
          this.leagues = retLeagues;
          this.display = true;
      })
    ).subscribe();
  }

  onNext() {
    if (this.leagues.length === this.PAGE_SIZE) {
      this.page++;
      this.getLeagues();
    }
  }

  onPrevious() {
    if (this.page > 0) {
      this.page--;
      this.getLeagues();
    }
  }
}

export const mpLeaguesRoutes: Routes = [

  { path: '', component: MpLeaguesComponent, canActivate: [AuthGuard] },
  { path: 'addLeague', component: AddLeagueComponent, canActivate: [AuthGuard] },
  { path: 'league', component: LeagueComponent, canActivate: [AuthGuard] },
  { path: 'playerLeague', component: LeaguePlayerComponent, canActivate: [AuthGuard] },
  { path: 'addMatch', component: AddMatchComponent, canActivate: [AuthGuard] },
  { path: 'removeMatch', component: RemoveMatchComponent, canActivate: [AuthGuard] },
];
