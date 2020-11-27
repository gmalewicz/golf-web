import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TournamentHttpService } from './_services';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddTournamentComponent } from './add-tournament/add-tournament.component';
import { TournamentResultsComponent } from './tournament-results/tournament-results.component';
import { TournamentRoundsComponent } from './tournament-rounds/tournament-rounds.component';
import { TournamentsComponent } from './tournaments/tournaments.component';
import { routing } from './tournament.routing';

@NgModule({
  declarations: [
    AddTournamentComponent,
    TournamentResultsComponent,
    TournamentRoundsComponent,
    TournamentsComponent
  ],
  imports: [
    routing,
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HttpClientModule,
    HttpClientXsrfModule
  ],
  providers: [TournamentHttpService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
})
export class TournamentModule { }
