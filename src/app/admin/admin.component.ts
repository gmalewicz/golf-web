import { Player } from '@/_models/player';
import { AlertService } from '@/_services/alert.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  moveLoading: boolean;
  resetLoading: boolean;
  submittedReset: boolean;
  submittedMoveCourse: boolean;
  resetPasswordForm: FormGroup;
  moveCourseForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {

      this.resetPasswordForm = this.formBuilder.group({
        nick: ['', [Validators.required, Validators.maxLength(10)]],
        password: ['', Validators.minLength(6)]
      });

      this.moveCourseForm = this.formBuilder.group({
        courseId: ['', [Validators.required, Validators.pattern('[1-9]\\d{0,9}')]],
      });
    }
  }

  // convenience getter for easy access to form fields
  get fReset() { return this.resetPasswordForm.controls; }

  // convenience getter for easy access to form fields
  get fMove() { return this.moveCourseForm.controls; }

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
          this.router.navigate(['/home']);
        })
    ).subscribe();
  }

  onSubmitMoveCourse() {

    this.submittedMoveCourse = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.moveCourseForm.invalid) {
      return;
    }

    this.moveLoading = true;

    this.httpService.purgeCourse(this.fMove.courseId.value).pipe(
      tap(
        () => {
          this.alertService.success('Course has been moved to history', true);
          this.moveLoading = false;
          this.router.navigate(['/home']);
        })
    ).subscribe();
  }

}
