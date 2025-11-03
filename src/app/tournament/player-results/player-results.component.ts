import { Round } from '@/_models/round';
import { Component, EventEmitter, OnInit, Output, input } from '@angular/core';
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

  @Output() notify = new EventEmitter<void>();

  readonly HCP_NOT_SUPPORTED = -90; 
  playerId: number;

  tournamentResult = input.required<TournamentResult>();

  faSearchPlus: IconDefinition;
  faMinusCircle: IconDefinition;

  constructor(private readonly tournamentHttpService: TournamentHttpService,
              private readonly router: Router,
              public readonly tournamentNavigationService: TournamentNavigationService,
              private readonly authenticationService: AuthenticationService
             ) { }

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
