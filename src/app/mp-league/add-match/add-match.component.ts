import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconDefinition, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { NavigationService } from '../_services/navigation.service';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { tap } from 'rxjs';
import { AlertService } from '@/_services/alert.service';
import { LeagueMatch } from '../_models';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';


@Component({
    selector: 'app-add-match',
    templateUrl: './add-match.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatError, RouterLink]
})
export class AddMatchComponent implements OnInit {

  faCheckCircle: IconDefinition;

  matchResultForm: FormGroup;

  private display: WritableSignal<boolean>;

  playerOptions = [];
  resultOptions = [];

  constructor(private leagueHttpService: LeagueHttpService,
              private alertService: AlertService,
              public authenticationService: AuthenticationService,
              private formBuilder: FormBuilder,
              public navigationService: NavigationService,
              private router: Router) {
                // This is intentional
              }

  ngOnInit(): void {

    this.display = signal(false);

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.faCheckCircle = faCheckCircle;

      this.matchResultForm = this.formBuilder.group({
        winnerDropDown : ['', [Validators.required]],
        looserDropDown : ['', [Validators.required]],
        resultDropDown : ['', [Validators.required]]
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

    this.matchResultForm.markAllAsTouched();

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
        league: this.navigationService.league()
      };
      this.leagueHttpService.addMatch(leagueMatch).pipe(
        tap(() => {
          this.navigationService.matches.update(matches => [...matches, leagueMatch]);
          this.router.navigate(['mpLeagues/league']).catch(error => console.log(error));
        })
      ).subscribe();
    }
  }

   private getNickForId(id: number): string {
    return this.navigationService.players().filter(p => p.playerId === id)[0].nick;
   }

   // convenience getter for easy access to form fields
   get f() {
    return this.matchResultForm.controls;
  }

  isDisplay() {
    return this.display();
  }

  clear() {

    this.f.winnerDropDown.setValue(undefined);
    this.f.looserDropDown.setValue(undefined);
    this.f.resultDropDown.setValue(undefined);

    this.matchResultForm.markAsUntouched();
  }
}
