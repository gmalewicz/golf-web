import { Component, OnInit } from '@angular/core';
import { TournamentResult, Tournament, TournamentRound } from '@/_models';
import { AuthenticationService } from '@/_services';
import { faSearchPlus, faSearchMinus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { TournamentHttpService } from '../_services';
import { tap } from 'rxjs/operators';

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

  display: boolean;
  rndSpinner: boolean[];

  tournamentResults: Array<TournamentResult>;

  tournamentRounds: Array<Array<TournamentRound>>;

  constructor(private tournamentHttpService: TournamentHttpService,
              private authenticationService: AuthenticationService,
              private router: Router) {}

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.display = false;

      this.faSearchPlus = faSearchPlus;
      this.faSearchMinus = faSearchMinus;

      this.tournament = history.state.data.tournament;
      this.playerId = this.authenticationService.currentPlayerValue.id;
      this.tournamentHttpService.getTournamentResults(this.tournament.id).pipe(
        tap(
          (retTournamentResults: TournamentResult[]) => {
            this.tournamentResults = retTournamentResults;
            this.tournamentRounds = Array(this.tournamentResults.length);
            this.displayRound = Array(this.tournamentResults.length).fill(false);
            this.rndSpinner = Array(this.tournamentResults.length).fill(false);
            this.display = true;
          })
      ).subscribe();
    }
  }

  showPlayerDetails(tournamentResult: TournamentResult, index: number) {

    if (this.tournamentRounds[index] === undefined) {
      this.rndSpinner[index] = true;
      this.tournamentHttpService.getTournamentResultRounds(tournamentResult.id).pipe(
        tap(
          (retTournamentResultRounds: TournamentRound[]) => {
            this.tournamentRounds[index] = retTournamentResultRounds;
            this.rndSpinner[index] = false;
          })
      ).subscribe();
    }
    this.displayRound[index] = true;
  }

  hidePlayerDetails(index: number) {

    this.displayRound[index] = false;
  }
}
