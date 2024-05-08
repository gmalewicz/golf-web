import { AlertService, AuthenticationService } from '@/_services';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom, map, mergeMap } from 'rxjs';
import { TournamentHttpService, TournamentNavigationService } from '../_services';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [],
  templateUrl: './notification.component.html'
})
export class NotificationComponent implements OnInit {

  loadingSubscribe: WritableSignal<boolean>;
  loadingUnsubscribe: WritableSignal<boolean>;
  loadingNotify: WritableSignal<boolean>;
  playerId: number;

  constructor(private tournamentHttpService: TournamentHttpService,
    private router: Router,
    private alertService: AlertService,
    private dialog: MatDialog,
    public navigationService: TournamentNavigationService,
    private authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
    this.loadingSubscribe = signal(false);
    this.loadingUnsubscribe = signal(false);
    this.loadingNotify = signal(false);
    this.playerId = this.authenticationService.currentPlayerValue.id;
  }

  onSubscribe(): void {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@notifications-NotifyConf:Are you sure you want to be notified about tournament changes? Make sure you provided email address in account settings.`;
    dialogRef.afterClosed()
      .pipe(
        mergeMap((result: boolean) => {
          if (result) {
            return firstValueFrom(this.tournamentHttpService.subscribe(this.navigationService.tournament().id).pipe(map(() => true)));
          }
          return Promise.resolve(false);
        })
      ).subscribe((status: boolean) => {
        if (status === true) {
          this.alertService.success($localize`:@@notifications-NotifyMsg:ou will be nofified about tournament changes via emails`, true);
          this.router.navigate(['/tournaments']).catch(error => console.log(error));
        }
    });
  }

  onUnsubscribe(): void {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@notifications-UnsubscribeConf:Are you sure you want to unsubscribe from notifications?`;
    dialogRef.afterClosed()
      .pipe(
        mergeMap((result: boolean) => {
          if (result) {
            this.loadingUnsubscribe.set(true);
            return firstValueFrom(this.tournamentHttpService.unsubscribe(this.navigationService.tournament().id).pipe(map(() => true)));
          }
          return Promise.resolve(false);
        })
      ).subscribe((status: boolean) => {
        if (status === true) {
          this.alertService.success($localize`:@@notifications-UnsubscribeMsg:You will not be nofified about tournament changes`, true);
          this.router.navigate(['/tournaments']).catch(error => console.log(error));
        }
    });
  }

  sendNotification(): void {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@notifications-PublishConf:Are you sure you want to send notifications to subscribers?`;
    dialogRef.afterClosed()
    .pipe(
      mergeMap((result: boolean) => {
        if (result) {
          this.loadingNotify.set(true);
          return firstValueFrom(this.tournamentHttpService.notify(this.navigationService.tournament().id).pipe(map(() => true)));
        }
        return Promise.resolve(false);
      })
    ).subscribe((status: boolean) => {
      if (status === true) {
        this.alertService.success($localize`:@@notifications-PublishMsg:Notifications has been sent.`, true);
        this.router.navigate(['/tournaments']).catch(error => console.log(error));
      }
    });
  }
}
