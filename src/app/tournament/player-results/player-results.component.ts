import { Round } from '@/_models/round';
import { Component, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { tap } from 'rxjs';
import { TournamentResult } from '../_models/tournamentResult';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentNavigationService } from '../_services';


@Component({
    selector: 'app-player-results',
    imports: [
        FontAwesomeModule
    ],
    templateUrl: './player-results.component.html'
})
export class PlayerResultsComponent implements OnInit {

  readonly HCP_NOT_SUPPORTED = -90; 

  tournamentResult = input.required<TournamentResult>();

  faSearchPlus: IconDefinition;

  constructor(private readonly tournamentHttpService: TournamentHttpService,
              private readonly router: Router,
              public readonly tournamentNavigationService: TournamentNavigationService) { }

  ngOnInit() {

    this.faSearchPlus = faSearchPlus;
   
  }

  showPlayerRound(roundId: number) {

    this.tournamentHttpService.getRound(roundId).pipe(
      tap(
        (round: Round) => {

          this.router.navigate(['/round/'], { state: { data: { round } }}).catch(error => console.log(error));
        })
    ).subscribe();

  }

}
