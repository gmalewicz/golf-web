import { Component, OnInit } from '@angular/core';
import { Round } from '@/_models';
import { AlertService, AuthenticationService } from '@/_services';
import { IconDefinition, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { TournamentHttpService } from '../_services';
import { tap } from 'rxjs/operators';
import { Tournament } from '../_models';

@Component({
  selector: 'app-tournament-rounds',
  templateUrl: './tournament-rounds.component.html',
  styleUrls: ['./tournament-rounds.component.css']
})
export class TournamentRoundsComponent implements OnInit {

  faPlusCircle: IconDefinition;

  tournament: Tournament;
  rounds: Round[];

  constructor(private tournamentHttpService: TournamentHttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router) {}

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.faPlusCircle = faPlusCircle;
      this.tournament = history.state.data.tournament;

      this.tournamentHttpService.getTournamentRounds(this.tournament.id).subscribe((retRounds: Round[]) => {
        this.rounds = retRounds;
      });
    }
  }

  addRound(round: Round) {

    this.tournamentHttpService.addRoundToTournament(round, this.tournament.id).pipe(
      tap(
        () => {
          this.alertService.success($localize`:@@tourRunds-succ:Round successfully added to tournamnet`, false);
          // remove that round from the list
          this.rounds = this.rounds.filter(r => r.id !== round.id);
        })
    ).subscribe();
  }
}
