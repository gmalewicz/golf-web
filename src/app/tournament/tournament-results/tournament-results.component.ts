import { Component, OnInit } from '@angular/core';
import { TournamentResult, Tournament, TournamentRound } from '@/_models';
import { AlertService, AuthenticationService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { faSearchPlus, faSearchMinus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { TournamentHttpService } from '../_services';

@Component({
  selector: 'app-tournament-results',
  templateUrl: './tournament-results.component.html',
  styleUrls: ['./tournament-results.component.css']
})
export class TournamentResultsComponent implements OnInit {

  faSearchPlus: IconDefinition;
  faSearchMinus: IconDefinition;

  tournament: Tournament;
  playerId: number;
  displayRound: Array<boolean>;

  tournamentResults: Array<TournamentResult>;

  tournamentRounds: Array<Array<TournamentRound>>;

  constructor(private tournamentHttpService: TournamentHttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router) {}

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.faSearchPlus = faSearchPlus;
      this.faSearchMinus = faSearchMinus;

      this.tournament = history.state.data.tournament;
      this.playerId = this.authenticationService.currentPlayerValue.id;

      this.tournamentHttpService.getTournamentResults(this.tournament.id).subscribe((retTournamentResults: TournamentResult[]) => {
        this.tournamentResults = retTournamentResults;
        this.tournamentRounds = Array(this.tournamentResults.length);
        this.displayRound = Array(this.tournamentResults.length).fill(false);

      },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, false);
      });
    }
  }

  showPlayerDetails(tournamentResult: TournamentResult, index: number) {

    if (this.tournamentRounds[index] === undefined) {

      this.tournamentHttpService.getTournamentResultRounds(tournamentResult.id).
        subscribe((retTournamentResultRounds: TournamentRound[]) => {

        this.tournamentRounds[index] = retTournamentResultRounds;
      },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, false);
      });
    }
    this.displayRound[index] = true;
  }

  hidePlayerDetails(index: number) {

    this.displayRound[index] = false;
  }
}
