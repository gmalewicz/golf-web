import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@/_services';
import { faSearchPlus, faSearchMinus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { TournamentHttpService } from '../_services';
import { tap } from 'rxjs/operators';
import { Tournament, TournamentResult, TournamentRound } from '../_models';

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

  constructor(private tournamentHttpService: TournamentHttpService,
              private authenticationService: AuthenticationService,
              private router: Router) {}

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
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
            this.displayRound = Array(this.tournamentResults.length).fill(false);
            this.rndSpinner = Array(this.tournamentResults.length).fill(false);
            this.display = true;
          })
      ).subscribe();
    }
  }

  showPlayerDetails(tournamentResult: TournamentResult, index: number) {

    if (tournamentResult.tournamentRounds === undefined) {
      this.rndSpinner[index] = true;
      this.tournamentHttpService.getTournamentResultRounds(tournamentResult.id).pipe(
        tap(
          (retTournamentResultRounds: TournamentRound[]) => {
            tournamentResult.tournamentRounds = retTournamentResultRounds;
            this.rndSpinner[index] = false;
          })
      ).subscribe();
    }
    this.displayRound[index] = true;
  }

  hidePlayerDetails(index: number) {

    this.displayRound[index] = false;
  }

  updateSort(action: number) {

    this.displayRound.fill(false);

    switch (action) {
      case 0: // stb net
        this.tournamentResults.sort((a, b) => b.stbNet - a.stbNet);
        break;
      case 1: // stb
        this.tournamentResults.sort((a, b) => b.stbGross - a.stbGross);
        break;
      case 2: // strokes
        this.tournamentResults.sort((a, b) => a.strokesBrutto - b.strokesBrutto);
        break;
      case 3: // net strokes
        this.tournamentResults.sort((a, b) => a.strokesNetto - b.strokesNetto);
        break;
    }

    if  (this.tournament.bestRounds === 0) {
      this.tournamentResults.sort((a, b) => b.strokeRounds - a.strokeRounds);
    } else if (action === 2 || action === 3) {
      const tempLst = this.tournamentResults.filter(r => r.strokeRounds >= this.tournament.bestRounds);
      this.tournamentResults =
        tempLst.concat((this.tournamentResults
          .filter(r => r.strokeRounds < this.tournament.bestRounds)).sort((a, b) => b.strokeRounds - a.strokeRounds));
    }
  }
}
