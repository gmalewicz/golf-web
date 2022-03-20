import { ModuleWithProviders } from '@angular/core';
import { AuthGuard } from '@/_helpers';

import { Routes, RouterModule } from '@angular/router';
import { TournamentResultsComponent } from './tournament-results/tournament-results.component';
import { TournamentRoundsComponent } from './tournament-rounds/tournament-rounds.component';
import { TournamentModule } from './tournament.module';
import { TournamentsComponent } from './tournaments/tournaments.component';
import { AddTournamentComponent } from './add-tournament/add-tournament.component';
import { AddRoundComponent } from './add-round/add-round.component';

export const routs: Routes = [

  { path: '', component: TournamentsComponent, canActivate: [AuthGuard] },
  { path: 'tournaments', component: TournamentsComponent, canActivate: [AuthGuard] },
  { path: 'tournamentResults', component: TournamentResultsComponent, canActivate: [AuthGuard] },
  { path: 'tournamentRounds', component: TournamentRoundsComponent, canActivate: [AuthGuard] },
  { path: 'addTournament', component: AddTournamentComponent, canActivate: [AuthGuard] },
  { path: 'addRound', component: AddRoundComponent, canActivate: [AuthGuard] },
];

export const routing: ModuleWithProviders<TournamentModule> = RouterModule.forChild(routs);

