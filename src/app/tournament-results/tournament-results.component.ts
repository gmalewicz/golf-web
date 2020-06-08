import { Component, OnInit } from '@angular/core';
import { TournamentResult, Tournament } from '@/_models';
import { HttpService, AlertService, AuthenticationService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-tournament-results',
  templateUrl: './tournament-results.component.html',
  styleUrls: ['./tournament-results.component.css']
})
export class TournamentResultsComponent implements OnInit {

  tournament: Tournament;
  nick: string;

  tournamentResults: Array<TournamentResult>;

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService) {

    this.tournament = history.state.data.tournament;
    this.nick = this.authenticationService.currentPlayerValue.nick;

    // to do
    this.httpService.getTournamentResults().subscribe((retTournamentResults: TournamentResult[]) => {
      this.tournamentResults = retTournamentResults;
    },
    (error: HttpErrorResponse) => {
      this.alertService.error(error.error.message, false);
    });
  }

  ngOnInit(): void {
  }

  addRound(): void {


  }
}
