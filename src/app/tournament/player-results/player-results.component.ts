import { Round } from '@/_models/round';
import { Component, DestroyRef, input, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { faMinusCircle, faPencil, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
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
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './player-results.component.html'
})
export class PlayerResultsComponent {
  private readonly tournamentHttpService = inject(TournamentHttpService);
  private readonly router = inject(Router);
  private readonly httpService = inject(HttpService);
  private readonly destroyRef = inject(DestroyRef);
  readonly tournamentNavigationService = inject(TournamentNavigationService);
  private readonly authenticationService = inject(AuthenticationService);

  readonly notify = output<void>();

  readonly HCP_NOT_SUPPORTED = -90;
  readonly playerId = this.authenticationService.currentPlayerValue.id!;

  readonly tournamentResult = input.required<TournamentResult>();

  readonly faSearchPlus = faSearchPlus;
  readonly faMinusCircle = faMinusCircle;
  readonly faPencil = faPencil;

  showPlayerRound(roundId: number) {

    this.tournamentHttpService.getRound(roundId).pipe(
      tap(
        (round: Round) => {

          this.router.navigate(['/round/'], { state: { data: { round, tournamentRound: true } }});
        }),
      takeUntilDestroyed(this.destroyRef)
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
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

  }

  deleteRound(roundId: number) {

    this.tournamentHttpService.deleteRound(this.tournamentResult().id!, roundId).pipe(
      tap(
        () => {
          this.notify.emit();
        }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

  }
}
