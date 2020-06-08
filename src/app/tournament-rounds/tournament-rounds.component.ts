import { Component, OnInit } from '@angular/core';
import { Tournament, Round } from '@/_models';
import { HttpService, AlertService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tournament-rounds',
  templateUrl: './tournament-rounds.component.html',
  styleUrls: ['./tournament-rounds.component.css']
})
export class TournamentRoundsComponent implements OnInit {

  faSearchPlus = faSearchPlus;

  tournament: Tournament;
  rounds: Round[];

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              private router: Router) {

    this.tournament = history.state.data.tournament;

    this.httpService.getTournamentRounds(this.tournament.id).subscribe((retRounds: Round[]) => {
      console.log('test');
      this.rounds = retRounds;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, false);
    });

  }

  ngOnInit(): void {
  }

  addRound(round: Round) {

    this.httpService.addRoundToTournament(round, this.tournament.id).subscribe(data => {
      console.log('adding round to tournament');
      this.alertService.success('Round successfully added to tournamnet', true);
      this.router.navigate(['/']);
    },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, true);
        this.router.navigate(['/']);
    });
  }
}
