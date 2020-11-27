import { Component, OnInit } from '@angular/core';
import { Tournament, Round } from '@/_models';
import { AlertService, AuthenticationService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { TournamentHttpService } from '../_services';

@Component({
  selector: 'app-tournament-rounds',
  templateUrl: './tournament-rounds.component.html',
  styleUrls: ['./tournament-rounds.component.css']
})
export class TournamentRoundsComponent implements OnInit {

  faSearchPlus: IconDefinition;

  tournament: Tournament;
  rounds: Round[];

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
      this.tournament = history.state.data.tournament;

      this.tournamentHttpService.getTournamentRounds(this.tournament.id).subscribe((retRounds: Round[]) => {
        // console.log('test');
        this.rounds = retRounds;
      },
        (error: HttpErrorResponse) => {
          this.alertService.error(error.error.message, false);
      });
    }
  }

  addRound(round: Round) {

    this.tournamentHttpService.addRoundToTournament(round, this.tournament.id).subscribe(data => {
      // console.log('adding round to tournament');
      this.alertService.success('Round successfully added to tournamnet', true);
      this.router.navigate(['/']);
    },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, true);
        this.router.navigate(['/']);
    });
  }
}
