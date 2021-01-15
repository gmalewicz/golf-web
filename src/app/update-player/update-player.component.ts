import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService, AlertService, HttpService } from '@/_services';
import { Player } from '@/_models';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-update-player',
  templateUrl: './update-player.component.html',
  styleUrls: ['./update-player.component.css']
})
export class UpdatePlayerComponent implements OnInit {

  updateForm: FormGroup;
  loading: boolean;
  submitted: boolean;
  submittedReset: boolean;
  role: number;

  resetPasswordForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private httpService: HttpService
  ) {}

  ngOnInit() {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.loading = false;
      this.submitted = false;
      this.submittedReset = false;
      this.role = 0;
      this.updateForm = this.formBuilder.group({
        password: ['', Validators.minLength(6)],
        whs: ['', [Validators.pattern('-?[1-5]?[0-9][.][0-9]?'), Validators.min(-5), Validators.max(54)]]
      });

      this.resetPasswordForm = this.formBuilder.group({
        nick: ['', [Validators.required, Validators.maxLength(10)]],
        password: ['', Validators.minLength(6)]
      });

      // console.log('initialization');
      this.role = this.authenticationService.currentPlayerValue.role;
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.updateForm.controls; }

  // convenience getter for easy access to form fields
  get fReset() { return this.resetPasswordForm.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.updateForm.invalid) {
      return;
    }

    this.loading = true;

    const player: Player = {
      id: this.authenticationService.currentPlayerValue.id,
      nick: this.authenticationService.currentPlayerValue.nick,
      password: this.f.password.value,
      whs: this.f.whs.value
    };

    this.httpService.updatePlayer(player).pipe(
      tap(
        () => {
          // log out if password changed
          if (this.f.password.value !== '') {
            this.authenticationService.logout();
          }
          this.alertService.success('Player successfully updated', true);
          this.loading = false;
          this.router.navigate(['/']);
        })
    ).subscribe();
  }

  onSubmitResetPassword() {

    this.submittedReset = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.loading = true;

    const player: Player = {
      nick: this.fReset.nick.value,
      password: this.fReset.password.value,
      whs: 0
    };

    this.httpService.resetPassword(this.authenticationService.currentPlayerValue.id, player).pipe(
      tap(
        () => {
          this.alertService.success('Password successfully reset', true);
          this.loading = false;
          this.router.navigate(['/']);
        })
    ).subscribe();
  }
}

