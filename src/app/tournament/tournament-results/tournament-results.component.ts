import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AlertService, AuthenticationService } from '@/_services';
import { faSearchPlus, faSearchMinus, IconDefinition, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterModule } from '@angular/router';
import { TournamentHttpService, TournamentNavigationService } from '../_services';
import { map, mergeMap, tap } from 'rxjs/operators';
import { TournamentPlayer, TournamentResult, TournamentRound, TournamentStatus } from '../_models';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlayerResultsComponent } from '../player-results/player-results.component';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-tournament-results',
    imports: [
        CommonModule,
        FontAwesomeModule,
        RouterModule,
        PlayerResultsComponent
    ],
    templateUrl: './tournament-results.component.html'
})
export class TournamentResultsComponent implements OnInit {

  faSearchPlus: IconDefinition;
  faSearchMinus: IconDefinition;
  faMinusCircle: IconDefinition;

  playerId: number;
  displayRound: Array<boolean>;

  display: boolean;
  rndSpinner: boolean[];

  loadingClose: boolean;
  loadingDelete: boolean;

  @ViewChild('tournamentContainer', {read: ViewContainerRef}) tournamentContainerRef: ViewContainerRef;
  @ViewChild('teeTimeContainer', {read: ViewContainerRef}) teeTimeContainerRef: ViewContainerRef;
  @ViewChild('notificationContainer', {read: ViewContainerRef}) notificationContainerRef: ViewContainerRef;

  constructor(private readonly tournamentHttpService: TournamentHttpService,
              private readonly authenticationService: AuthenticationService,
              private readonly router: Router,
              private readonly alertService: AlertService,
              private readonly dialog: MatDialog,
              public navigationService: TournamentNavigationService) {}

  ngOnInit(): void {
    if (this.authenticationService.currentPlayerValue === null || this.navigationService.tournament() === undefined) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.display = false;

      this.loadingClose = false;
      this.loadingDelete = false;

      this.faSearchPlus = faSearchPlus;
      this.faSearchMinus = faSearchMinus;
      this.faMinusCircle = faMinusCircle;

      this.playerId = this.authenticationService.currentPlayerValue.id;
      this.tournamentHttpService.getTournamentResults(this.navigationService.tournament().id).pipe(
        tap(
          (retTournamentResults: TournamentResult[]) => {
            this.navigationService.tournamentResults.set(retTournamentResults);
            this.displayRound = Array(this.navigationService.tournamentResults().length).fill(false);
            this.rndSpinner = Array(this.navigationService.tournamentResults().length).fill(false);
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
        this.navigationService.tournamentResults.update(results => [...results].sort((a, b) => b.stbNet - a.stbNet));
        break;
      case 1: // stb
        this.navigationService.tournamentResults.update(results => [...results].sort((a, b) => b.stbGross - a.stbGross));
        break;
      case 2: // strokes
        this.navigationService.tournamentResults.update(results => [...results].sort((a, b) => a.strokesBrutto - b.strokesBrutto));
        break;
      case 3: // net strokes
        this.navigationService.tournamentResults.update(results => [...results].sort((a, b) => a.strokesNetto - b.strokesNetto));
        break;
    }

    if  (this.navigationService.tournament().bestRounds === 0 && action > 1) {
      this.navigationService.tournamentResults.update(results => [...results].sort((a, b) => b.strokeRounds - a.strokeRounds));
    } else if (this.navigationService.tournament().bestRounds !== 0 &&  action > 1) {
      const tempLst = this.navigationService.tournamentResults().filter(r => r.strokeRounds >= this.navigationService.tournament().bestRounds);
      this.navigationService.tournamentResults.set(tempLst.concat((this.navigationService.tournamentResults()
        .filter(r => r.strokeRounds < this.navigationService.tournament().bestRounds)).sort((a, b) => b.strokeRounds - a.strokeRounds)));
    }
  }

  deleteResult(resultId: number) {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@tourRes-delConf:Are you sure you want to delete result?`;
    dialogRef.afterClosed()
    .pipe(
      mergeMap((result: boolean) => {
        if (result) {
          return firstValueFrom(this.tournamentHttpService.deleteResult(resultId).pipe(map(() => true)));
        }
        return Promise.resolve(false);
      }
    )).subscribe((status: boolean) => {
      if (status) {
        this.alertService.success($localize`:@@tourRes-delSucc:Result successfuly deleted`, false);
        this.navigationService.tournamentResults.update(results => [...results].filter(rs => rs.id !== resultId));
      }
    })
  }

  closeTournament(): void {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = $localize`:@@tourRunds-CloseConf:Are you sure you want to close tournament?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingClose = true;
        this.tournamentHttpService.closeTournament(this.navigationService.tournament().id).pipe(tap(
          () => {
            this.navigationService.tournament().status = TournamentStatus.STATUS_CLOSE;
            this.alertService.success($localize`:@@tourRunds-CloseMsg:Tournament successfully closed`, false);
            this.loadingClose = false;
          })
        ).subscribe();
      }
    });
  }

  deleteTournament(): void {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = $localize`:@@tourRunds-DeleteConf:Are you sure you want to delete entire tournament?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingDelete = true;
        this.tournamentHttpService.deleteTournament(this.navigationService.tournament().id).pipe(tap(
          () => {
            this.alertService.success($localize`:@@tourRunds-DeleteMsg:Tournament successfully deleted`, true);
            this.router.navigate(['/tournaments']).catch(error => console.log(error));
          })
        ).subscribe();
      }
    });
  }

  async loadComponent(comp: number) {

    if (this.tournamentContainerRef !== undefined) {
      this.tournamentContainerRef.clear();
    }
    if (this.teeTimeContainerRef !== undefined) {
      this.teeTimeContainerRef.clear();
    }
    if (this.notificationContainerRef !== undefined) {
      this.notificationContainerRef.clear();
    }

    if (comp === 0) {
      const {TournamentPlayersComponent} = await import('../tournament-players/tournament-players.component');
      this.tournamentContainerRef.createComponent(TournamentPlayersComponent);
    } else if (comp === 1) {
      const {TeeTimeComponent} = await import('../tee-time/tee-time/tee-time.component');
      this.teeTimeContainerRef.createComponent(TeeTimeComponent);
    } else if (comp === 2) {
      const {NotificationComponent} = await import('../notification/notification.component');
      this.notificationContainerRef.createComponent(NotificationComponent);
    }

  }

  courseInfo() {

    if (this.navigationService.tournamentPlayers() == undefined) {
    
      this.tournamentHttpService.getTournamentPlayers(this.navigationService.tournament().id).pipe(
        tap(
          (retTournamentPlayers: TournamentPlayer[]) => {
            this.navigationService.tournamentPlayers.set(retTournamentPlayers);
            this.router.navigate(['courses'], { state: { data: { parent: 'tournament'}}} ).catch(error => console.log(error));
          })
      ).subscribe();
    } else {
      this.router.navigate(['courses'], { state: { data: { parent: 'tournament'}}} ).catch(error => console.log(error));
    }
  }

  onCancel() {
    this.router.navigate(['tournaments']).catch(error => console.log(error));
  }
}
