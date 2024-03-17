import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IconDefinition, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { tap } from 'rxjs/operators';
import { League, LeagueStatus } from '../_models';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { NavigationService } from '../_services/navigation.service';

@Component({
  selector: 'app-mp-ligues',
  templateUrl: './mp-leagues.component.html'
})
export class MpLeaguesComponent implements OnInit {

  readonly PAGE_SIZE = 10;

  page: number;
  faSearchPlus: IconDefinition;
  leagues: League[];
  display: boolean;
  statusOpen: boolean = LeagueStatus.STATUS_OPEN;
  statusClose: boolean = LeagueStatus.STATUS_CLOSE;


  constructor(private leagueHttpService: LeagueHttpService,
              private navigationService: NavigationService,
              public authenticationService: AuthenticationService,
              private router: Router) {}

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
