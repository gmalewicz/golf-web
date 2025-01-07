import { Cycle, CycleStatus } from '../_models/cycle';
import { AuthenticationService } from '@/_services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { Router} from '@angular/router';
import { tap } from 'rxjs/operators';
import { CycleHttpService } from '../_services/cycleHttp.service';
import { AlertService } from '@/_services/alert.service';
import { combineLatest } from 'rxjs';
import { CycleResult } from '../_models/cycleResult';
import { CycleTournament } from '../_models/cycleTournament';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';

export abstract class CycleDetailsBase  {

  display: boolean;
  cycle: Cycle;
  cycleResults: CycleResult[];
  cycleTournaments: CycleTournament[];
  statusConst = CycleStatus;
  loadingClose: boolean;
  loadingDeleteTour: boolean;
  loadingAddTour: boolean;
  loadingDeleteCycle: boolean;

  constructor(public authenticationService: AuthenticationService,
              protected readonly router: Router,
              protected readonly dialog: MatDialog,
              protected readonly cycleHttpService: CycleHttpService,
              protected readonly alertService: AlertService
              ) { }

  init(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.loadingClose = false;
      this.loadingDeleteTour = false;
      this.loadingDeleteCycle = false;
      this.loadingAddTour = false;
      this.cycle = history.state.data.cycle;
      combineLatest([ this.cycleHttpService.getCycleResults(this.cycle.id),
        this.cycleHttpService.getCycleTournaments(this.cycle.id)]).subscribe(([retCycleResults, retCycleTournamnets]) => {

          this.cycle = history.state.data.cycle;
          this.cycleResults = retCycleResults;
          this.cycleTournaments = retCycleTournamnets;
          this.display = true;
      });
    }
  }

  closeCycle(): void {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = $localize`:@@cycleDetails-CloseConf:Are you sure you want to close cycle?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingClose = true;
        this.cycleHttpService.closeCycle(this.cycle.id).pipe(tap(
          () => {
            this.cycle.status = CycleStatus.STATUS_CLOSE;
            this.alertService.success($localize`:@@cycleDetails-CloseMsg:Cycle successfully closed`, false);
            this.init();
          })
        ).subscribe();
      }
    });
  }

  deleteLast(): void {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = $localize`:@@cycleDetails-DeleteConf:Are you sure you want to delete the last tournament?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingDeleteTour = true;
        this.cycleHttpService.deleteLastTournament(this.cycle).pipe(tap(
          () => {
            this.alertService.success($localize`:@@cycleDetails-CloseDelTourMsg:The last tournament successfully deleted`, true);
            this.router.navigate(['/cycles']).catch(error => console.log(error));
          })
        ).subscribe();
      }
    });

  }

  deleteCycle(): void {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = $localize`:@@cycleDetails-DelCycleConf:Are you sure you want to delete the cycle?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingDeleteCycle = true;
        this.cycleHttpService.deleteCycle(this.cycle.id).pipe(tap(
          () => {
            this.alertService.success($localize`:@@cycleDetails-DelCycleMsg:Cycle successfully deleted`, true);
            this.router.navigate(['/cycles']).catch(error => console.log(error));
          })
        ).subscribe();
      }
    });
  }
}
