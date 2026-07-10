import { Round } from '@/_models/round';
import { Component, EventEmitter, OnInit, Output, input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { faMinusCircle, faPencil, faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, tap } from 'rxjs';
import { TournamentResult } from '../_models/tournamentResult';
import { TournamentRound } from '../_models/tournamentRound';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentNavigationService } from '../_services';
import { AuthenticationService, HttpService } from '@/_services';
import { TeeColourPipe, TeeNamePipe } from '../_helpers/tee.pipe';

@Component({
    selector: 'app-player-results',
    imports: [
        FontAwesomeModule,
        TeeColourPipe,
        TeeNamePipe
    ],
    templateUrl: './player-results.component.html'
})
export class PlayerResultsComponent implements OnInit {
  private readonly tournamentHttpService = inject(TournamentHttpService);
  private readonly router = inject(Router);
  private readonly httpService = inject(HttpService);
  readonly tournamentNavigationService = inject(TournamentNavigationService);
  private readonly authenticationService = inject(AuthenticationService);


  @Output() notify = new EventEmitter<void>();

  readonly HCP_NOT_SUPPORTED = -90; 
  playerId!: number;

  tournamentResult = input.required<TournamentResult>();

  faSearchPlus!: IconDefinition;
  faMinusCircle!: IconDefinition;
  faPencil!: IconDefinition;

  ngOnInit() {

    this.faSearchPlus = faSearchPlus;
    this.faMinusCircle = faMinusCircle;
    this.faPencil = faPencil;
    this.playerId = this.authenticationService.currentPlayerValue.id!;
   
  }

  showPlayerRound(roundId: number) {

    this.tournamentHttpService.getRound(roundId).pipe(
      tap(
        (round: Round) => {

          this.router.navigate(['/round/'], { state: { data: { round, tournamentRound: true } }}).catch(error => console.log(error));
        })
    ).subscribe();

  }

  editRound(tournamentRound: TournamentRound) {

    const roundId = tournamentRound.roundId!;
    const playerId = this.tournamentResult().player!.id!;

    combineLatest([
      this.tournamentHttpService.getRound(roundId),
      this.httpService.getScoreCards(roundId)
    ]).pipe(
      tap(([round, scoreCards]) => {
        round.scoreCard = scoreCards.filter(s => s.player!.id === playerId);
        round.player = [this.tournamentResult().player!];

        this.router.navigate(
          ['/addScorecard/' + round.course.id + '/' + round.course.name + '/' + round.course.par],
          {
            state: {
              data: {
                round,
                tournamentEdit: {
                  tournamentResultId: this.tournamentResult().id,
                  tournamentId: this.tournamentNavigationService.tournament().id,
                  playerId,
                  playerSex: this.tournamentResult().player!.sex
                }
              }
            }
          }
        ).catch(error => console.log(error));
      })
    ).subscribe();

  }

  deleteRound(roundId: number) {

    this.tournamentHttpService.deleteRound(this.tournamentResult().id!, roundId).pipe(
      tap(
        () => {
          this.notify.emit();  
        })
    ).subscribe();

  }
}
