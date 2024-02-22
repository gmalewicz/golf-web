import { Round } from '@/_models/round';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { tap } from 'rxjs';
import { TournamentResult } from '../_models/tournamentResult';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-results',
  standalone: true,
  imports: [
    FontAwesomeModule,
    CommonModule,
    ],
  templateUrl: './player-results.component.html'
})
export class PlayerResultsComponent implements OnInit {

  @Input() tournamentResult: TournamentResult;

  faSearchPlus: IconDefinition;

  constructor(private tournamentHttpService: TournamentHttpService,
              private router: Router) { }

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
