import { Round } from '@/_models/round';
import { Component, EventEmitter, OnInit, Output, input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { faMinusCircle, faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { tap } from 'rxjs';
import { TournamentResult } from '../_models/tournamentResult';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentNavigationService } from '../_services';
import { AuthenticationService } from '@/_services';

@Component({
    selector: 'app-player-results',
    imports: [
        FontAwesomeModule
    ],
    templateUrl: './player-results.component.html'
})
export class PlayerResultsComponent implements OnInit {
  private readonly tournamentHttpService = inject(TournamentHttpService);
  private readonly router = inject(Router);
  readonly tournamentNavigationService = inject(TournamentNavigationService);
  private readonly authenticationService = inject(AuthenticationService);


  @Output() notify = new EventEmitter<void>();

  readonly HCP_NOT_SUPPORTED = -90; 
  playerId: number;

  tournamentResult = input.required<TournamentResult>();

  faSearchPlus: IconDefinition;
  faMinusCircle: IconDefinition;

  ngOnInit() {

    this.faSearchPlus = faSearchPlus;
    this.faMinusCircle = faMinusCircle;
    this.playerId = this.authenticationService.currentPlayerValue.id;
   
  }

  showPlayerRound(roundId: number) {

    this.tournamentHttpService.getRound(roundId).pipe(
      tap(
        (round: Round) => {

          this.router.navigate(['/round/'], { state: { data: { round } }}).catch(error => console.log(error));
        })
    ).subscribe();

  }

  deleteRound(roundId: number) {

    this.tournamentHttpService.deleteRound(this.tournamentResult().id, roundId).pipe(
      tap(
        () => {
          this.notify.emit();  
        })
    ).subscribe();

  }

}
