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
        this.router.navigate(['/home']);
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

      // reset alerts on submit
      this.alertService.clear();

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
                              sex: this.f.female.value ? true : false};

      this.httpService.addPlayer(player).pipe(
      tap(
        () => {
          this.alertService.success($localize`:@@registration-success:Registration successful. Please log in`, true);
          this.router.navigate(['']);
        })
    ).subscribe();
  }

  sexClick(sex: boolean) {
    if (sex) {
      this.f.male.setValue(false);
    } else {
      this.f.female.setValue(false);
    }
  }
}
