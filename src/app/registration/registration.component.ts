import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService, AlertService, HttpService } from '@/_services';
import { Player } from '@/_models';
import { tap } from 'rxjs/operators';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    imports: [ReactiveFormsModule, NgClass, RecaptchaModule, RecaptchaFormsModule, RouterLink]
})
export class RegistrationComponent implements OnInit {

  registerForm: FormGroup;
  loading: boolean;
  submitted: boolean;

  constructor(
      private readonly formBuilder: FormBuilder,
      private readonly router: Router,
      private readonly authenticationService: AuthenticationService,
      private readonly alertService: AlertService,
      private readonly httpService: HttpService
  ) {}

  ngOnInit() {
      // redirect to home if already logged in
      if (this.authenticationService.currentPlayerValue) {
        this.router.navigate(['/home']).catch(error => console.log(error));
      }

      this.loading = false;
      this.submitted = false;

      this.registerForm = this.formBuilder.group({
        nick: ['', [Validators.required, Validators.maxLength(10)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        // tslint:disable-next-line: max-line-length
        whs: ['', [Validators.required,  Validators.pattern('(-5(\\.|,)0|-[0-4](,|\\.)\\d|\\d(\\.|,)\\d|[1-4]\\d(\\.|,)\\d|5[0-4](\\.|,)\\d)|\\d\\d|\\d'), Validators.min(-5), Validators.max(54)]],
        female: [false],
        male: [true],
        recaptchaReactive: ['', [Validators.required]],
      });
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit() {
      this.submitted = true;

      // stop here if form is invalid
      if (this.registerForm.invalid) {
          return;
      }

      this.loading = true;

      let whs: string = this.f.whs.value;
      whs = whs.toString().replace(/,/gi, '.');

      const player: Player = {nick: this.f.nick.value,
                              password: this.f.password.value,
                              whs: +whs,
                              captcha: this.f.recaptchaReactive.value,
                              sex: this.f.female.value === true};

      this.httpService.addPlayer(player).pipe(
      tap(
        () => {
          this.alertService.success($localize`:@@registration-success:Registration successful. Please log in`, true);
          this.router.navigate(['']).then().catch(error => console.log(error));
        })
    ).subscribe();
  }

  sexClick(sex: boolean) {
    this.f.male.setValue(sex !== true);
    this.f.female.setValue(sex !== false);
  }
}
