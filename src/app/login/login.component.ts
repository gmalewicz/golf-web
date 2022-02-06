import { HttpService } from '@/_services/http.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, tap } from 'rxjs/operators';
import { AlertService, AuthenticationService } from '@/_services';
import { Player } from '@/_models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  loading: boolean;
  submitted: boolean;
  returnUrl: string;

  //url = 'http://localhost:8080/signin/facebook';
  url = 'http://localhost:8080/oauth2/authorization/facebook';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private httpService: HttpService
  ) { }

  ngOnInit() {

    // redirect to home if already logged in
    if (this.authenticationService.currentPlayerValue) {
      this.router.navigate(['/login']);
    }
    // process social log in
    if (this.route.snapshot.queryParams.token !== undefined) {

      this.processSocialLogin(this.route.snapshot.queryParams.token);
    }

    this.loading = false;
    this.submitted = false;
    this.alertService.clear();
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/home';
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

    this.authenticationService.login(this.f.username.value, this.f.password.value).pipe(
      tap(
        (data) => {
          this.alertService.success('Welcome ' + this.f.username.value + '. Your WHS is ' +
          data.whs + '. Make sure it is up to date before adding the round.', true);
          this.loading = false;
          this.router.navigate([this.returnUrl]);
        })
    ).subscribe();

  }

  processSocialLogin(token: string) {

    this.httpService.getSocialPlayer(token).pipe(
      map(
        (response) => {
          const player: Player = response.body;
          player.refreshToken = response.headers.get('refresh');
          player.token =  token;
          this.authenticationService.loginSocial(player);
          this.alertService.success('Welcome ' + player.nick + '. Your WHS is ' +
          player.whs + '. Make sure it is up to date before adding the round.', true);
          this.loading = false;
          this.router.navigate([this.returnUrl]);
        })
    ).subscribe();
  }
}
