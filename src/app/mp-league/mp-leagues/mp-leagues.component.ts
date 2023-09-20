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


    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.faSearchPlus = faSearchPlus;
      this.leagueHttpService.getLeagues().pipe(
        tap (
          (retLeagues: League[]) => {
            this.leagues = retLeagues;
            this.display = true;
        })
      ).subscribe();
    }
  }

  goToLeague(league: League) {
    this.navigationService.setLeague(league);
    this.navigationService.init();
    this.router.navigate(['mpLeagues/league']).catch(error => console.log(error));
  }

}
