import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService, AlertService, HttpService } from '@/_services';
import { Player } from '@/_models';
import { map, mergeMap, tap } from 'rxjs/operators';
import { NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-update-player',
    templateUrl: './update-player.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, NgClass, RouterLink]
})
export class UpdatePlayerComponent implements OnInit {

  updateForm: FormGroup;
  loading: boolean;
  submitted: boolean;
  display: boolean;
  removeEmail: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private readonly httpService: HttpService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit() {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.display = true;
      this.removeEmail = false;
      this.loading = false;
      this.submitted = false;
      this.updateForm = this.formBuilder.group({
        password: ['', Validators.minLength(6)],
        // tslint:disable-next-line: max-line-length
        whs: ['', [ Validators.pattern('(-5(\\.|,)0|-[0-4](,|\\.)\\d|\\d(\\.|,)\\d|[1-4]\\d(\\.|,)\\d|5[0-4](\\.|,)\\d)|\\d\\d|\\d'), Validators.min(-5), Validators.max(54)]],
        email: ['', Validators.email],
        removeEmail: [false]
      });
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.updateForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.updateForm.invalid) {
      return;
    }

    // if nothing is provided show error
    if (this.f.whs.value === '' && this.f.password.value === '' && this.f.email.value === '') {
      this.alertService.success($localize`:@@updatePlayer-noData:Handicap, password or email must be provided`, false);
      return;
    }

    this.loading = true;

    let whs = this.f.whs.value;
    if (whs !== '') {
      whs = whs.replace(/,/gi, '.');
    }

    const player: Player = {
      id: this.authenticationService.currentPlayerValue.id,
    };

    if (this.f.password.value !== '') {
      player.password = this.f.password.value;
    }

    if (whs !== '') {
      player.whs = this.authenticationService.currentPlayerValue.whs = +whs;
    }

    if (this.f.email.value !== '') {
      player.email = this.f.email.value;
    }

    this.httpService.updatePlayer(player).pipe(
      tap(
        () => {
          // log out if password changed
          if (this.f.password.value !== '') {
            this.authenticationService.logout();
          } else if (whs !== '') {
            this.authenticationService.currentPlayerValue.whs = whs;
            this.authenticationService.updateStorage();
          }
          this.loading = false;
          this.alertService.success($localize`:@@notifications-UpdateMsg:Player data has been updated.`, true);
          this.router.navigate(['/home']).catch(error => console.log(error));
        })
    ).subscribe();
  }

  onRemove() {
    this.f.removeEmail.setValue(true);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = $localize`:@@updatePlayer-RemoveEmailConf:Are you sure you want to remove email?`;

    dialogRef.afterClosed()
    .pipe(
      mergeMap((result: boolean) => {
        if (result) {
          this.removeEmail = true;
          return firstValueFrom(this.httpService.deleteEmail().pipe(map(() => true)));

        }
        return Promise.resolve(false);
      })
    ).subscribe((status: boolean) => {
      this.removeEmail = false;
      this.f.removeEmail.setValue(false);
      if (status === true) {
        this.alertService.success($localize`:@@notifications-DeleteEmailMsg:Email has been deleted.`, true);
        this.router.navigate(['/home']).catch(error => console.log(error));
      }
    });
  }
}

