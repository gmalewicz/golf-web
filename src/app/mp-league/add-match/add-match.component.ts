import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IconDefinition, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { NavigationService } from '../_services/navigation.service';
import { League } from '../_models/league';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { tap } from 'rxjs';
import { AlertService } from '@/_services/alert.service';
import { LeagueMatch } from '../_models';
import { generateResults } from '../_helpers/common';

@Component({
  selector: 'app-add-match',
  templateUrl: './add-match.component.html'
})
export class AddMatchComponent implements OnInit {

  faCheckCircle: IconDefinition;

  matchResultForm: FormGroup;

  private display: WritableSignal<boolean>;
  private submitted: WritableSignal<boolean>;

  playerOptions = [];
  resultOptions = [];

  constructor(private leagueHttpService: LeagueHttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private formBuilder: FormBuilder,
              private navigationService: NavigationService,
              private router: Router) { }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.display = signal(false);
      this.submitted = signal(false);
      this.faCheckCircle = faCheckCircle;

      this.matchResultForm = this.formBuilder.group({
        winnerDropDown : ['', [Validators.required]],
        looserDropDown : ['', [Validators.required]],
        resultDropDown : ['', [Validators.required]]
      });

      // verify if league players needs to be refreshed
      console.log(this.navigationService.players());
      this.prepareDropDowns();
    }
  }

  // this.clear();

  private prepareDropDowns(): void {
    this.navigationService.players().forEach(t => {
      this.playerOptions.push({
        label: t.nick,
        value: t.id,
      });
    });

    this.resultOptions.push({label: 'A/S', value: 'A/S'},
                            {label: '1UP', value: '1UP'},
                            {label: '2UP', value: '2UP'},
                            {label: '2&1', value: '2&1'},
                            {label: '3&1', value: '3&1'},
                            {label: '3&2', value: '3&2'},
                            {label: '4&2', value: '4&3'},
                            {label: '4&3', value: '4&3'},
                            {label: '5&3', value: '5&3'},
                            {label: '5&4', value: '5&4'},
                            {label: '6&4', value: '6&4'},
                            {label: '6&5', value: '6&5'},
                            {label: '7&5', value: '7&5'},
                            {label: '7&6', value: '7&6'},
                            {label: '8&6', value: '8&6'},
                            {label: '8&7', value: '8&7'},
                            {label: '9&7', value: '9&7'},
                            {label: '9&8', value: '9&8'},
                            {label: '10&8', value: '10&8'});

    this.display.set(true);
  }

  addMatchResult() {
    this.submitted.set(true);

    // do nothing if the form is invalid
    if (this.f.winnerDropDown.invalid || this.f.looserDropDown.invalid || this.f.resultDropDown.invalid) {
      return;
    }

    // display an error if winner and looser are th same
    if (this.f.winnerDropDown.value === this.f.looserDropDown.value) {
      this.alertService.error($localize`:@@addMatch-WrongPlayers:Winner and looser must be different players.`, false);
    } else {

      const leagueMatch: LeagueMatch = {
        winnerId: this.f.winnerDropDown.value,
        winnerNick: this.getNickForId(this.f.winnerDropDown.value),
        looserId: this.f.looserDropDown.value,
        looserNick: this.getNickForId(this.f.looserDropDown.value),
        result: this.f.resultDropDown.value,
        leagueId: this.navigationService.getLeague().id
      };

      this.leagueHttpService.addMatch(leagueMatch).pipe(
        tap(() => {
          this.submitted.set(false);
          this.navigationService.matches.mutate(matches => matches.push(leagueMatch));
          generateResults([leagueMatch], this.navigationService.results);
          this.router.navigate(['mpLeagues/league']).catch(error => console.log(error));
        })
      ).subscribe();
    }
  }

   getNickForId(id: number): string {
    return this.navigationService.players().filter(p => p.id === id)[0].nick;
   }

   // convenience getter for easy access to form fields
   get f() {
    return this.matchResultForm.controls;
  }

  isDisplay() {
    return this.display();
  }

  isSubmitted() {
    return this.submitted();
  }

  getLeague() : League {
    return this.navigationService.getLeague();
  }



  clear() {}

  onChange() {
    this.alertService.clear();
  }
}
