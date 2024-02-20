import { Component, OnInit } from '@angular/core';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService} from '@/_services';
import { Router, RouterModule, Routes } from '@angular/router';
import { TournamentHttpService, TournamentNavigationService } from '../_services';
import { tap } from 'rxjs/operators';
import { Tournament } from '../_models';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '@/_helpers/auth.guard';
import { TournamentResultsComponent } from '../tournament-results/tournament-results.component';
import { TournamentRoundsComponent } from '../tournament-rounds/tournament-rounds.component';
import { AddTournamentComponent } from '../add-tournament/add-tournament.component';
import { AddRoundComponent } from '../add-round/add-round.component';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [RouterModule,
            FontAwesomeModule,
            CommonModule,
            TournamentResultsComponent],
  templateUrl: './tournaments.component.html'
})
export class TournamentsComponent implements OnInit {

  faSearchPlus: IconDefinition;
  tournaments: Tournament[];
  display: boolean;

  constructor(private tournamentHttpService: TournamentHttpService,
              public authenticationService: AuthenticationService,
              private router: Router,
              private navigationService: TournamentNavigationService) {}

  ngOnInit(): void {

    this.display = false;

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.faSearchPlus = faSearchPlus;
      this.tournamentHttpService.getTournaments().pipe(
        tap(
          (retTournaments: Tournament[]) => {
            this.tournaments = retTournaments;
            this.display = true;
        })
      ).subscribe();
    }
  }

  showTournament(tournament: Tournament) {
    this.navigationService.tournament.set(tournament);
    console.log(this.navigationService.tournament());
    this.router.navigate(['tournaments/tournamentResults']).catch(error => console.log(error));
  }
}

export const tournamentRoutes: Routes = [

  { path: '', component: TournamentsComponent, canActivate: [AuthGuard] },
  { path: 'tournaments', component: TournamentsComponent, canActivate: [AuthGuard] },
  { path: 'tournamentResults', component: TournamentResultsComponent, canActivate: [AuthGuard] },
  { path: 'tournamentRounds', component: TournamentRoundsComponent, canActivate: [AuthGuard] },
  { path: 'addTournament', component: AddTournamentComponent, canActivate: [AuthGuard] },
  { path: 'addRound', component: AddRoundComponent, canActivate: [AuthGuard] },

];
