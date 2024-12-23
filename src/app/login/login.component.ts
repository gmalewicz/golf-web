import { environment } from 'environments/environment';
import { HttpService } from '@/_services/http.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { catchError, map, tap } from 'rxjs/operators';
import { AlertService, AuthenticationService } from '@/_services';
import { Player } from '@/_models';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FinishSocialDialogComponent } from './finish-social-dialog/finish-social-dialog.component';
import { of } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    imports: [ReactiveFormsModule, NgClass, RouterLink]
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  loading: boolean;
  socialLoading: boolean;
  submitted: boolean;

  urlFacebook: string = environment.URL_STR + 'oauth2/authorization/facebook';
  urlGoogle: string = environment.URL_STR + 'oauth2/authorization/google';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authenticationService: AuthenticationService,
    private readonly alertService: AlertService,
    private readonly httpService: HttpService,
    private readonly dialog: MatDialog
  ) { }

  ngOnInit() {

    this.socialLoading = false;
    this.loading = false;
    this.submitted = false;
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // redirect to home if already logged in
    if (this.authenticationService.currentPlayerValue) {
      this.router.navigate(['/login']).catch(error => console.log(error));
    }
    // process social log in if authenticated correctly
    if (this.route.snapshot.queryParams.token !== undefined) {
      this.processSocialLogin(this.route.snapshot.queryParams.token);
    }
    // process social log in if authentication failed
    if (this.route.snapshot.queryParams.error !== undefined) {
      this.processSocialLoginError(this.route.snapshot.queryParams.error);
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authenticationService.login(this.f.username.value, this.f.password.value).pipe(
      tap(
        (data) => {
          this.alertService.success($localize`:@@login-welcome:Welcome ${this.f.username.value}. Your handicap is
          ${data.whs} Make sure it is up to date before adding the round.`, true);
          this.loading = false;
          this.router.navigate(['/home']).then().catch(error => console.log(error));
        }),
        catchError((err) => {
          this.loading = false;
          return of(err);
        })
    ).subscribe();

  }

  processSocialLogin(token: string) {

    this.httpService.getSocialPlayer(token).pipe(
      map(
        (response) => {
          const player: Player = response.body;

          // process additional details for a new player
          if (this.route.snapshot.queryParams.new_player !== undefined &&
              this.route.snapshot.queryParams.new_player === 'true') {

            const dialogConfig = new MatDialogConfig();

            dialogConfig.disableClose = true;
            dialogConfig.autoFocus = true;
            dialogConfig.data = {
              nick: player.nick,
              sex: player.sex,
            };

            const dialogRef = this.dialog.open(
              FinishSocialDialogComponent,
              dialogConfig
            );

            dialogRef.afterClosed().subscribe((result) => {
              if (result !== undefined) {

                const whs = result.whs.toString().replace(/,/gi, '.');
                player.whs = +whs;
                player.sex = result.female === true;
                player.updateSocial = true;
                this.authenticationService.loginSocial(player);
                this.httpService.updatePlayerOnBehalf(player).pipe(tap(
                  () => {
                    this.finalizeSocialLogin(player);
                  })
                ).subscribe();
              }
            });
          } else {
            this.authenticationService.loginSocial(player);
            this.finalizeSocialLogin(player);
          }
        })
    ).subscribe();
  }

  private finalizeSocialLogin(player: Player) {
    this.alertService.success($localize`:@@login-welcome:Welcome ${player.nick}. Your handicap is
          ${player.whs} Make sure it is up to date before adding the round.`, true);
    this.loading = false;
    this.router.navigate(['/home']).catch(error => console.log(error));
  }

  startSocialLoading() {
    this.socialLoading = true;
  }

  private processSocialLoginError(error: string) {

    if (error === 'authFailed') {
      this.alertService.error($localize`:@@login-socialFailure:Unable to authenticate player via social media`, false);
    } else if (error === 'playerType') {
      this.alertService.error($localize`:@@login-nickInUse:Incorrect way of log in or nick in use. Login in the same way as you registered (e.g. Facebook) or create the new player.`, false);
    }
    this.loading = false;
  }
}


