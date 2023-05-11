import { routing } from '@/app.routing';
import { Player } from '@/_models/player';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  submittedReset: boolean;
  resetLoading: boolean;

  constructor(private formBuilder: FormBuilder,
              private alertService: AlertService,
              private httpService: HttpService,
              private router: Router) { }

  ngOnInit(): void {

    this.resetPasswordForm = this.formBuilder.group({
      nick: ['', [Validators.required, Validators.maxLength(10)]],
      password: ['', Validators.minLength(6)]
    });
  }

  // convenience getter for easy access to form fields
  get fReset() { return this.resetPasswordForm.controls; }

  onSubmitResetPassword() {

    this.submittedReset = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.resetLoading = true;

    const player: Player = {
      nick: this.fReset.nick.value,
      password: this.fReset.password.value,
      whs: 0
    };

    this.httpService.resetPassword(player).pipe(
      tap(
        () => {
          this.alertService.success('Password successfully reset', true);
          this.resetLoading = false;
          this.router.navigate(['/home']).catch(error => console.log(error));
        })
    ).subscribe();
  }
}

@NgModule({
  declarations: [ResetPasswordComponent],
  imports: [CommonModule, ReactiveFormsModule, routing]
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ResetPasswordModule {}
