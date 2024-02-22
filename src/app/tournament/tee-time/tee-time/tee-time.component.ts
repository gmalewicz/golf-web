import { TeeTimePublishStatus } from './../../_models/teeTimeParameters';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef, WritableSignal, signal } from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { ParametersComponent } from '../parameters/parameters.component';
import { TournamentHttpService } from '@/tournament/_services/tournamentHttp.service';
import { tap } from 'rxjs';
import { TournamentNavigationService } from '@/tournament/_services';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService } from '@/_services/authentication.service';
import { TeeTimeParameters } from '@/tournament/_models/teeTimeParameters';
import { TournamentPlayer } from '@/tournament/_models';
import { PreviewComponent } from '../preview/preview.component';

@Component({
  selector: 'app-tee-time',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatTabsModule, ParametersComponent, PreviewComponent],
  templateUrl: './tee-time.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeeTimeComponent implements OnInit {

  MODE_PLYAYER_TEETIMES_NOT_PUBLISHED: number = 0;
  MODE_PLYAYER_TEETIMES_PUBLISHED: number = 1;
  MODE_ADMIN_TEETIMES_NOT_PUBLISHED: number = 2;
  MODE_ADMIN_TEETIMES_PUBLISHED: number = 3;

  public mode: WritableSignal<number>;

  @ViewChild('teeTimeContainer', {read: ViewContainerRef}) teeTimeContainerRef: ViewContainerRef;

  constructor(private tournamentHttpService: TournamentHttpService,
              public navigationService: TournamentNavigationService,
              private authenticationService: AuthenticationService,
              private ref: ChangeDetectorRef) {}

  ngOnInit(): void {

    //initalize mode
    this.mode = signal(undefined);

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
        this.navigationService.teeTimeParameters.set({firstTeeTime: "09:00", teeTimeStep: 10, flightSize: 4, published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED});
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
  }

  publishTeeTimes() {

    this.navigationService.teeTimeParameters().teeTimes = this.navigationService.teeTimes();
    this.navigationService.teeTimeParameters().published = TeeTimePublishStatus.STATUS_PUBLISHED;
    this.mode.set(this.MODE_ADMIN_TEETIMES_PUBLISHED);
    this.tournamentHttpService.saveTeeTimes(this.navigationService.tournament().id, this.navigationService.teeTimeParameters()).subscribe();
  }

  deleteTeeTimes() {
    this.tournamentHttpService.deleteTeeTimes(this.navigationService.tournament().id).pipe(
      tap(
        () => {
          this.navigationService.teeTimeParameters.set({firstTeeTime: "09:00", teeTimeStep: 10, flightSize: 4, published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED});
          this.getPlayers();
          this.mode.set(this.MODE_ADMIN_TEETIMES_NOT_PUBLISHED);
        })
    ).subscribe();
  }
}
