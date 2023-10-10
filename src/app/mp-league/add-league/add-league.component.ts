import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { AlertService } from '@/_services/alert.service';
import { Router } from '@angular/router';
import { League, LeagueStatus } from '../_models/league';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-add-league',
  templateUrl: './add-league.component.html'
})
export class AddLeagueComponent implements OnInit {

  addLeagueForm: FormGroup;
  private submitted: WritableSignal<boolean>;
  private loading: WritableSignal<boolean>;
  private display: WritableSignal<boolean>;

  constructor(private formBuilder: FormBuilder,
              public authenticationService: AuthenticationService,
              private leagueHttpService: LeagueHttpService,
              private alertService: AlertService,
              private router: Router) { }

  ngOnInit(): void {

    this.display = signal(false);

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      this.addLeagueForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
      });

      this.submitted = signal(false);
      this.loading = signal(false);
      this.display.set(true);
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.addLeagueForm.controls; }

  onSubmit() {
    this.submitted.set(true);

    // stop here if form is invalid
    if (this.addLeagueForm.invalid) {
      return;
    }

    this.loading.set(true);

    const league: League = {
      player: {id: this.authenticationService.currentPlayerValue.id,
               nick: this.authenticationService.currentPlayerValue.nick,
               whs: this.authenticationService.currentPlayerValue.whs},
      name: this.f.name.value,
      status: LeagueStatus.STATUS_OPEN
    };

    this.leagueHttpService.addLeague(league).pipe(tap(
      () => {
        this.alertService.success($localize`:@@addLeague-leagueAddedMsg:League successfully created`, true);
        this.loading.set(false);
        this.router.navigate(['/mpLeagues']).catch(error => console.log(error));
      })
    ).subscribe();
  }

  isLoading() {
    return this.loading();
  }

  isSubmitted() {
    return this.submitted();
  }

  isDisplay() {
    return this.display();
  }
}
