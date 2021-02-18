import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService, AlertService, HttpService } from '@/_services';
import { Player } from '@/_models';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html'
})
export class RegistrationComponent implements OnInit {

  registerForm: FormGroup;
  loading: boolean;
  submitted: boolean;

  constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private authenticationService: AuthenticationService,
      private alertService: AlertService,
      private httpService: HttpService
  ) {}

  ngOnInit() {

      // redirect to home if already logged in
      if (this.authenticationService.currentPlayerValue) {
        this.router.navigate(['/']);
      }

      this.loading = false;
      this.submitted = false;

      this.registerForm = this.formBuilder.group({
        nick: ['', [Validators.required, Validators.maxLength(10)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        whs: ['', [Validators.required, Validators.pattern('-?[1-5][0-9]?.?[0-9]?$'), Validators.min(-5), Validators.max(54)]],
        recaptchaReactive: ['', [Validators.required]],
      });
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit() {
      this.submitted = true;

      // reset alerts on submit
      this.alertService.clear();

      // stop here if form is invalid
      if (this.registerForm.invalid) {
          return;
      }

      this.loading = true;

      const player: Player = {nick: this.f.nick.value,
                              password: this.f.password.value,
                              whs: this.f.whs.value,
                              captcha: this.f.recaptchaReactive.value};

      this.httpService.addPlayer(player).pipe(
      tap(
        () => {
          this.alertService.success('Registration successful. Please log in', true);
          this.router.navigate(['/']);
        })
    ).subscribe();
  }
}
