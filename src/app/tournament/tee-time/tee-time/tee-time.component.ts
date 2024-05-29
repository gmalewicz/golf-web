import { FlightAssignmentMode, TeeTimePublishStatus } from './../../_models/teeTimeParameters';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewContainerRef, WritableSignal, signal } from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { ParametersComponent } from '../parameters/parameters.component';
import { TournamentHttpService } from '@/tournament/_services/tournamentHttp.service';
import { firstValueFrom, map, mergeMap, tap } from 'rxjs';
import { TournamentNavigationService } from '@/tournament/_services';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from '@/_services/authentication.service';
import { TeeTimeParameters } from '@/tournament/_models/teeTimeParameters';
import { TournamentPlayer } from '@/tournament/_models';
import { PreviewComponent } from '../preview/preview.component';
import { AlertService } from '@/_services/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { ModificationComponent } from '../modification/modification.component';

@Component({
  selector: 'app-tee-time',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, ParametersComponent, PreviewComponent, ModificationComponent],
  templateUrl: './tee-time.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeeTimeComponent implements OnInit {

  MODE_PLYAYER_TEETIMES_NOT_PUBLISHED: number = 0;
  MODE_PLYAYER_TEETIMES_PUBLISHED: number = 1;
  MODE_ADMIN_TEETIMES_NOT_PUBLISHED: number = 2;
  MODE_ADMIN_TEETIMES_PUBLISHED: number = 3;

  public mode: WritableSignal<number>;
  public deleteInProgress: WritableSignal<boolean>;
  public publishInProgress: WritableSignal<boolean>;
  public saveInProgress: WritableSignal<boolean>;

  @ViewChild('teeTimeContainer', {read: ViewContainerRef}) teeTimeContainerRef: ViewContainerRef;

  constructor(private tournamentHttpService: TournamentHttpService,
              public navigationService: TournamentNavigationService,
              private authenticationService: AuthenticationService,
              private alertService: AlertService,
              private dialog: MatDialog) {}

  ngOnInit(): void {

    //initalize mode
    this.mode = signal(undefined);
    this.deleteInProgress = signal(false);
    this.publishInProgress = signal(false);
    this.saveInProgress = signal(false);

    // first verify database
    if (!this.navigationService.teeTimesChecked()) {
      this.tournamentHttpService.getTeeTimes(this.navigationService.tournament().id).pipe(
        tap(
          (retTeeTimesParamaters: TeeTimeParameters) => {
            if (retTeeTimesParamaters) {
              this.navigationService.loadTeeTimesFlag = true;
              this.navigationService.teeTimesChecked.set(true);
              this.navigationService.teeTimeParameters.set(retTeeTimesParamaters);
            }
            this.setUpMode();
          })
      ).subscribe();
    } else {
      this.setUpMode();
    }
  }

  setUpMode() {
    if (this.navigationService.tournament().player.id !== this.authenticationService.currentPlayerValue.id &&
        (this.navigationService.teeTimeParameters() === undefined ||
         this.navigationService.teeTimeParameters().published === TeeTimePublishStatus.STATUS_NOT_PUBLISHED)) {
      this.mode.set(this.MODE_PLYAYER_TEETIMES_NOT_PUBLISHED);
    } else if (this.navigationService.tournament().player.id !== this.authenticationService.currentPlayerValue.id &&
               this.navigationService.teeTimeParameters().published === TeeTimePublishStatus.STATUS_PUBLISHED) {
      this.mode.set(this.MODE_PLYAYER_TEETIMES_PUBLISHED);
    } else if (this.navigationService.teeTimeParameters() !== undefined &&
               this.navigationService.teeTimeParameters().published === TeeTimePublishStatus.STATUS_PUBLISHED) {
      this.mode.set(this.MODE_ADMIN_TEETIMES_PUBLISHED);
    } else {
      this.mode.set(this.MODE_ADMIN_TEETIMES_NOT_PUBLISHED);
      if (this.navigationService.teeTimeParameters() === undefined) {
        this.navigationService.teeTimeParameters.set({firstTeeTime: "09:00",
                                                      teeTimeStep: 10,
                                                      flightSize: 4,
                                                      published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
                                                      flightAssignment: FlightAssignmentMode.MODE_RANDOM});
      }
      this.getPlayers();
    }
  }


  getPlayers() {
    if (this.navigationService.tournamentPlayers() === undefined) {
      this.tournamentHttpService.getTournamentPlayers(this.navigationService.tournament().id).pipe(
        tap(
          (retTournamentPlayers: TournamentPlayer[]) => {
            this.navigationService.tournamentPlayers.set(retTournamentPlayers);
          })
      ).subscribe();
    }
  }

  saveTeeTimes() {
    this.navigationService.teeTimeParameters().teeTimes = this.navigationService.teeTimes();

    this.tournamentHttpService.saveTeeTimes(this.navigationService.tournament().id, this.navigationService.teeTimeParameters()).subscribe();

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@teeTime-savTeeTimeCnf:Are you sure you want to save tee times?`;
    dialogRef.afterClosed()
      .pipe(
        mergeMap((result: boolean) => {
          if (result) {
            this.saveInProgress.set(true);
            const teeTimeParamatersToSave = {...this.navigationService.teeTimeParameters()};
            teeTimeParamatersToSave.teeTimes = this.navigationService.teeTimes();
            return firstValueFrom(this.tournamentHttpService.saveTeeTimes(this.navigationService.tournament().id, teeTimeParamatersToSave).pipe(map(() => true)));
          }
          return Promise.resolve(false);
        })
      ).subscribe((status: boolean) => {
        if (status === true) {
          this.navigationService.loadTeeTimesFlag = true;
          this.navigationService.teeTimeParameters().teeTimes = this.navigationService.teeTimes();
          this.alertService.success($localize`:@@teeTime-savTimeCnfMsg:Tee times successfuly saved`, false);
          this.saveInProgress.set(false);
        }
    });
  }

  publishTeeTimes() {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@teeTime-pubTeeTimeCnf:Are you sure you want to publish tee times?`;
    dialogRef.afterClosed()
      .pipe(
        mergeMap((result: boolean) => {
          if (result) {
            this.publishInProgress.set(true);
            const teeTimeParamatersToSave = {...this.navigationService.teeTimeParameters()};
            teeTimeParamatersToSave.teeTimes = this.navigationService.teeTimes();
            teeTimeParamatersToSave.published = TeeTimePublishStatus.STATUS_PUBLISHED;
            return firstValueFrom(this.tournamentHttpService.saveTeeTimes(this.navigationService.tournament().id, teeTimeParamatersToSave).pipe(map(() => true)));
          }
          return Promise.resolve(false);
        })
      ).subscribe((status: boolean) => {
        if (status === true) {
          this.navigationService.loadTeeTimesFlag = true;
          this.navigationService.teeTimeParameters().teeTimes = this.navigationService.teeTimes();
          this.navigationService.teeTimeParameters().published = TeeTimePublishStatus.STATUS_PUBLISHED;
          this.mode.set(this.MODE_ADMIN_TEETIMES_PUBLISHED);
          this.alertService.success($localize`:@@teeTime-pubTimeCnfMsg:Tee times successfuly publish`, false);
          this.publishInProgress.set(false);
        }
    });
  }

  async deleteTeeTimes() {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@teeTime-delTeeTimeCnf:Are you sure you want to remove tee times?`;
    dialogRef.afterClosed()
      .pipe(
        mergeMap((result: boolean) => {
          if (result) {
            this.deleteInProgress.set(true);
            return firstValueFrom(this.tournamentHttpService.deleteTeeTimes(this.navigationService.tournament().id).pipe(map(() => true)));
          }
          return Promise.resolve(false);
        })
      ).subscribe((status: boolean) => {
        if (status === true) {
          this.navigationService.loadTeeTimesFlag = false;
          this.getPlayers();
          this.mode.set(this.MODE_ADMIN_TEETIMES_NOT_PUBLISHED);
          this.alertService.success($localize`:@@teeTime-delTeeTimeCnfMsg:Tee times successfuly deleted`, false);
          this.deleteInProgress.set(false);
        }
    });
  }
}
