import { Component, OnInit } from '@angular/core';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService} from '@/_services';
import { Router, RouterModule, Routes } from '@angular/router';
import { TournamentHttpService, TournamentNavigationService } from '../_services';
import { tap } from 'rxjs/operators';
import { Tournament, TournamentStatus } from '../_models';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '@/_helpers/auth.guard';
import { TournamentResultsComponent } from '../tournament-results/tournament-results.component';
import { TournamentRoundsComponent } from '../tournament-rounds/tournament-rounds.component';
import { AddTournamentComponent } from '../add-tournament/add-tournament.component';
import { AddRoundComponent } from '../add-round/add-round.component';
import { CourseInfoComponent } from '../course-info/course-info.component';

@Component({
    selector: 'app-tournaments',
    imports: [RouterModule,
        FontAwesomeModule,
        CommonModule],
    templateUrl: './tournaments.component.html'
})
export class TournamentsComponent implements OnInit {

  readonly PAGE_SIZE = 10;

  page: number;
  faSearchPlus: IconDefinition;
  tournaments: Tournament[];
  display: boolean;
  statusOpen: boolean = TournamentStatus.STATUS_OPEN;
  statusClose: boolean = TournamentStatus.STATUS_CLOSE;

  constructor(private readonly tournamentHttpService: TournamentHttpService,
              public authenticationService: AuthenticationService,
              private readonly router: Router,
              private readonly navigationService: TournamentNavigationService) {}

  ngOnInit(): void {

    this.display = false;
    this.page = 0;

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.faSearchPlus = faSearchPlus;
      this.getTournaments();
    }
  }

  getTournaments(): void {
    this.tournamentHttpService.getTournaments(this.page).pipe(
      tap(
        (retTournaments: Tournament[]) => {
          this.tournaments = retTournaments;
          this.display = true;
      })
    ).subscribe();
  }


  showTournament(tournament: Tournament) {
    this.navigationService.init();
    this.navigationService.tournament.set(tournament);
    this.router.navigate(['tournaments/tournamentResults']).catch(error => console.log(error));
  }

  onNext() {
    if (this.tournaments.length === this.PAGE_SIZE) {
      this.page++;
      this.getTournaments();
    }
  }

  onPrevious() {
    if (this.page > 0) {
      this.page--;
      this.getTournaments();
    }
  }
}

export const tournamentRoutes: Routes = [

  { path: '', component: TournamentsComponent, canActivate: [AuthGuard] },
  { path: 'tournaments', component: TournamentsComponent, canActivate: [AuthGuard] },
  { path: 'tournamentResults', component: TournamentResultsComponent, canActivate: [AuthGuard] },
  { path: 'tournamentRounds', component: TournamentRoundsComponent, canActivate: [AuthGuard] },
  { path: 'addTournament', component: AddTournamentComponent, canActivate: [AuthGuard] },
  { path: 'addRound', component: AddRoundComponent, canActivate: [AuthGuard] },
  { path: 'courseInfo', component: CourseInfoComponent, canActivate: [AuthGuard] },

];
