import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService, AlertService, HttpService } from '@/_services';
import { Player } from '@/_models';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-update-player',
  templateUrl: './update-player.component.html'
})
export class UpdatePlayerComponent implements OnInit {

  updateForm: FormGroup;
  loading: boolean;
  submitted: boolean;
  display: boolean;

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
      this.router.navigate(['/login']);
    } else {
      this.display = true;
      this.loading = false;
      this.submitted = false;
      this.updateForm = this.formBuilder.group({
        password: ['', Validators.minLength(6)],
        // tslint:disable-next-line: max-line-length
        whs: ['', [ Validators.pattern('(-5(\\.|,)0|-[0-4](,|\\.)\\d|\\d(\\.|,)\\d|[1-4]\\d(\\.|,)\\d|5[0-4](\\.|,)\\d)|\\d\\d|\\d'), Validators.min(-5), Validators.max(54)]]
      });
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.updateForm.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.updateForm.invalid) {
      return;
    }

    // if nothing is provided show error
    if (this.f.whs.value === '' && this.f.password.value === '') {
      this.alertService.success($localize`:@@updatePlayer-noData:Handicap or password must be provided`, false);
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

    this.httpService.updatePlayer(player).pipe(
      tap(
        () => {
          // log out if password changed
          if (this.f.password.value !== '') {
            this.authenticationService.logout();
          } else {
            this.authenticationService.currentPlayerValue.whs = whs;
            this.authenticationService.updateStorage();
          }
          this.loading = false;
          this.router.navigate(['/home']);
        })
    ).subscribe();
  }
}

