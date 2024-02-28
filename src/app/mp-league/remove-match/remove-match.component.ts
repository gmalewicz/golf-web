import { LeagueHttpService } from './../_services/leagueHttp.service';
import { LeagueMatch } from './../_models/leagueMatch';
import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavigationService } from '../_services/navigation.service';
import { AlertService } from '@/_services/alert.service';
import { tap } from 'rxjs';


@Component({
  selector: 'app-remove-match',
  templateUrl: './remove-match.component.html'
})
export class RemoveMatchComponent implements OnInit {

  matchRemoveForm: FormGroup;

  private display: WritableSignal<boolean>;

  playerOptions = [];

  constructor(private alertService: AlertService,
              public authenticationService: AuthenticationService,
              private formBuilder: FormBuilder,
              public navigationService: NavigationService,
              private router: Router,
              private leagueHttpService: LeagueHttpService) { }

  ngOnInit(): void {

    this.display = signal(false);
    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      this.matchRemoveForm = this.formBuilder.group({
        winnerDropDown : ['', [Validators.required]],
        looserDropDown : ['', [Validators.required]],
      });

      this.prepareDropDowns();
    }
  }

  private prepareDropDowns(): void {
    this.navigationService.players().forEach(t => {
      this.playerOptions.push({
        label: t.nick,
        value: t.playerId,
      });
    });

    this.display.set(true);
  }

  removeMatchResult() {

    this.matchRemoveForm.markAllAsTouched();

    // do nothing if the form is invalid
    if (this.f.winnerDropDown.invalid || this.f.looserDropDown.invalid) {
      return;
    }

    // display an error if winner and looser are th same
    if (this.f.winnerDropDown.value === this.f.looserDropDown.value) {
      this.alertService.error($localize`:@@removeMatch-WrongPlayers:Winner and looser must be different players.`, false);
      return;
    }

    let match: LeagueMatch =
      this.navigationService.matches().find(match => match.winnerId === this.f.winnerDropDown.value && match.looserId === this.f.looserDropDown.value);

    if (match === undefined) {
      match = this.navigationService.matches().find(match => match.winnerId === this.f.looserDropDown.value && match.looserId === this.f.winnerDropDown.value);
    }

    if (match === undefined) {
      this.alertService.error($localize`:@@removeMatch-WrongMatch:Match does not exists.`, false);
      return;
    }

    this.leagueHttpService.deleteMatch(match.league.id, match.winnerId, match.looserId).pipe(
      tap(() => {
        this.navigationService.matches.set(this.navigationService.matches().filter(m => !(m.winnerId === match.winnerId && m.looserId === match.looserId)));
        this.router.navigate(['mpLeagues/league']).catch(error => console.log(error));
      })
    ).subscribe();
  }

   // convenience getter for easy access to form fields
   get f() {
    return this.matchRemoveForm.controls;
  }

  isDisplay() {
    return this.display();
  }

  clear() {
    this.f.winnerDropDown.setValue(undefined);
    this.f.looserDropDown.setValue(undefined);
    this.matchRemoveForm.markAsUntouched();
  }
}
