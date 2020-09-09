import { Component, OnInit } from '@angular/core';
import { TournamentResult, Tournament, TournamentRound } from '@/_models';
import { HttpService, AlertService, AuthenticationService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tournament-results',
  templateUrl: './tournament-results.component.html',
  styleUrls: ['./tournament-results.component.css']
})
export class TournamentResultsComponent implements OnInit {

  faSearchPlus = faSearchPlus;
  faSearchMinus = faSearchMinus;

  tournament: Tournament;
  playerId: number;
  displayRound: Array<boolean>;

  tournamentResults: Array<TournamentResult>;

  tournamentRounds: Array<Array<TournamentRound>>;

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService) {

    this.tournament = history.state.data.tournament;
    this.playerId = this.authenticationService.currentPlayerValue.id;


    this.httpService.getTournamentResults(this.tournament.id).subscribe((retTournamentResults: TournamentResult[]) => {

      this.tournamentResults = retTournamentResults;
      this.tournamentRounds = Array(this.tournamentResults.length);
      this.displayRound = Array(this.tournamentResults.length).fill(false);

    },
    (error: HttpErrorResponse) => {
      this.alertService.error(error.error.message, false);
    });
  }

  ngOnInit(): void {
  }

  showPlayerDetails(tournamentResult: TournamentResult, index: number) {

    if (this.tournamentRounds[index] === undefined) {

      this.httpService.getTournamentResultRounds(tournamentResult.id).subscribe((retTournamentResultRounds: TournamentRound[]) => {

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
