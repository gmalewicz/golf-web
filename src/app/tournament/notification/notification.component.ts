import { AlertService, AuthenticationService } from '@/_services';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom, map, mergeMap } from 'rxjs';
import { TournamentHttpService, TournamentNavigationService } from '../_services';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-notification',
    imports: [ReactiveFormsModule],
    templateUrl: './notification.component.html'
})
export class NotificationComponent implements OnInit {

  loadingSubscribe: WritableSignal<boolean>;
  loadingUnsubscribe: WritableSignal<boolean>;
  loadingNotify: WritableSignal<boolean>;
  playerId: number;
  notificationForm: FormGroup;

  constructor(private readonly tournamentHttpService: TournamentHttpService,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly dialog: MatDialog,
    public navigationService: TournamentNavigationService,
    private readonly authenticationService: AuthenticationService,
    private readonly formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.loadingSubscribe = signal(false);
    this.loadingUnsubscribe = signal(false);
    this.loadingNotify = signal(false);
    this.playerId = this.authenticationService.currentPlayerValue.id;

    this.notificationForm = this.formBuilder.group({
      sort: ['3', Validators.required]
    });
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
          this.alertService.success($localize`:@@notifications-NotifyMsg:You will be nofified about tournament changes via emails`, true);
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

   // convenience getter for easy access to form fields
  get f() {
    return this.notificationForm.controls;
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
          return firstValueFrom(this.tournamentHttpService.notify(this.navigationService.tournament().id, this.f.sort.value).pipe(map(() => true)));
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
