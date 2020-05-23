import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

// import { AlertService, AuthenticationService } from '@/_services';
import { AlertService, AuthenticationService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) {
    console.log('logging out');
    // redirect to home if already logged in
    if (this.authenticationService.currentPlayerValue) {
        this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.alertService.clear();
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // get return url from route parameters or default to '/'
    // this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authenticationService.login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        data => {
          console.log('a');
          this.alertService.success('Welcome ' + this.f.username.value + '. Your WHS is ' +
            data.whs + '. Make sure it is up to date before adding the round.', true);
          this.router.navigate([this.returnUrl]);
        },
        (error: HttpErrorResponse) => {

          if (error.status === 404) {
            this.alertService.error('Your user name was not found', false);
          } else if (error.status === 401) {
            this.alertService.error('You are not authorized to log in', false);
          } else {
            this.alertService.error('Server error', false);
          }
          this.loading = false;
        });

  }
}
