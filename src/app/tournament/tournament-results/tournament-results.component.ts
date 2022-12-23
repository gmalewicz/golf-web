import { Component, NgZone, OnInit } from '@angular/core';
import { AlertService, AuthenticationService } from '@/_services';
import { faSearchPlus, faSearchMinus, IconDefinition, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { TournamentHttpService } from '../_services';
import { tap } from 'rxjs/operators';
import { Tournament, TournamentResult, TournamentRound, TournamentStatus } from '../_models';
import { Round } from '@/_models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-tournament-results',
  templateUrl: './tournament-results.component.html'
})
export class TournamentResultsComponent implements OnInit {

  faSearchPlus: IconDefinition;
  faSearchMinus: IconDefinition;
  faMinusCircle: IconDefinition;

  tournament: Tournament;
  playerId: number;
  displayRound: Array<boolean>;

  display: boolean;
  rndSpinner: boolean[];

  tournamentResults: Array<TournamentResult>;

  loadingClose: boolean;

  constructor(private tournamentHttpService: TournamentHttpService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private alertService: AlertService,
              private dialog: MatDialog,
              private ngZone: NgZone) {}

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {

      this.display = false;

      this.loadingClose = false;

      this.faSearchPlus = faSearchPlus;
      this.faSearchMinus = faSearchMinus;
      this.faMinusCircle = faMinusCircle;

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

    if  (this.tournament.bestRounds === 0 && action > 1) {
      this.tournamentResults.sort((a, b) => b.strokeRounds - a.strokeRounds);
    } else if (this.tournament.bestRounds !== 0 &&  action > 1) {
      const tempLst = this.tournamentResults.filter(r => r.strokeRounds >= this.tournament.bestRounds);
      this.tournamentResults =
        tempLst.concat((this.tournamentResults
          .filter(r => r.strokeRounds < this.tournament.bestRounds)).sort((a, b) => b.strokeRounds - a.strokeRounds));
    }
  }

  showPlayerRound(roundId: number) {

    this.tournamentHttpService.getRound(roundId).pipe(
      tap(
        (round: Round) => {
          this.ngZone.run(() => this.router.navigate(['/round/'], { state: { data: { round } }})).then();
        })
    ).subscribe();

  }

  deleteResult(resultId: number) {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@tourRes-delConf:Are you sure you want to delete result?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do confirmation actions
        this.tournamentHttpService.deleteResult(resultId).pipe(
          tap(
            () => {
              this.alertService.success($localize`:@@tourRes-delSucc:Result successfuly deleted`, false);
              this.tournamentResults = this.tournamentResults.filter(rs => rs.id !== resultId);
            })
        ).subscribe();
      }
    });
  }

  closeTournament(): void {

    this.alertService.clear();

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = $localize`:@@tourRunds-CloseConf:Are you sure you want to close tournament?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingClose = true;
        this.tournamentHttpService.closeTournament(this.tournament.id).pipe(tap(
          () => {
            this.tournament.status = TournamentStatus.STATUS_CLOSE;
            this.alertService.success($localize`:@@tourRunds-CloseMsg:Tournament successfully closed`, false);
            this.loadingClose = false;
          })
        ).subscribe();
      }
    });
  }
}
