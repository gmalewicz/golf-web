import { AlertService, AuthenticationService } from '@/_services';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom, map, mergeMap } from 'rxjs';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { NavigationService } from '../_services/navigation.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [],
  templateUrl: './notification.component.html'
})
export class NotificationComponent implements OnInit {

  loadingSubscribe: WritableSignal<boolean>;
  loadingUnsubscribe: WritableSignal<boolean>;
  playerId: number;

  constructor(private leagueHttpService: LeagueHttpService,
    private router: Router,
    private alertService: AlertService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    public navigationService: NavigationService) {
  }

  ngOnInit(): void {
    this.loadingSubscribe = signal(false);
    this.loadingUnsubscribe = signal(false);
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
            return firstValueFrom(this.leagueHttpService.subscribe(this.navigationService.league().id).pipe(map(() => true)));
          }
          return Promise.resolve(false);
        })
      ).subscribe((status: boolean) => {
        if (status === true) {
          this.alertService.success($localize`:@@notifications-NotifyMsg:You will be nofified about changes via emails`, true);
          this.router.navigate(['/leagues']).catch(error => console.log(error));
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
            return firstValueFrom(this.leagueHttpService.unsubscribe(this.navigationService.league().id).pipe(map(() => true)));
          }
          return Promise.resolve(false);
        })
      ).subscribe((status: boolean) => {
        if (status === true) {
          this.alertService.success($localize`:@@notifications-UnsubscribeMsg:You will not be nofified about changes`, true);
          this.router.navigate(['/leagues']).catch(error => console.log(error));
        }
    });
  }
}
