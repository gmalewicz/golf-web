import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthenticationService, AlertService } from '@/_services';
import { Router, RouterModule } from '@angular/router';
import { TournamentHttpService } from '../_services';
import { Tournament } from '../_models/tournament';
import { tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';


@Component({
    selector: 'app-add-tournament',
    imports: [RouterModule,
        CommonModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatError,
        MatInput],
    providers: [TournamentHttpService],
    templateUrl: './add-tournament.component.html'
})
export class AddTournamentComponent implements OnInit {

  addTournamentForm: FormGroup;
  submitted: boolean;
  loading: boolean;

  constructor(private readonly formBuilder: FormBuilder,
              private readonly authenticationService: AuthenticationService,
              private readonly tournamentHttpService: TournamentHttpService,
              private readonly alertService: AlertService,
              private readonly router: Router) { }

  ngOnInit(): void {

    this.addTournamentForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', [Validators.required, Validators.pattern('([0-9]{4})/([0-9]{1,2})/([0-9]{1,2})')]],
      endDate: ['', [Validators.required, Validators.pattern('([0-9]{4})/([0-9]{1,2})/([0-9]{1,2})')]],
      bestRounds: ['0', [Validators.required,  Validators.min(0), Validators.max(10)]],
      playHcpMultiplayer: ['1', Validators.required],
      maxPlayHcp: ['54', [Validators.required,  Validators.min(0), Validators.max(54), Validators.pattern('^[0-9]$|^[1-4]\\d$|^5[0-4]$')]],
      canUpdateHcp: [false],
    });

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.submitted = false;
      this.loading = false;
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.addTournamentForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.addTournamentForm.invalid) {
      return;
    }

    const tournament: Tournament = {
      player: {id: this.authenticationService.currentPlayerValue.id,
               nick: this.authenticationService.currentPlayerValue.nick,
               whs: this.authenticationService.currentPlayerValue.whs},
      name: this.f.name.value,
      startDate: this.f.startDate.value,
      endDate: this.f.endDate.value,
      bestRounds: this.f.bestRounds.value,
      playHcpMultiplayer: this.f.playHcpMultiplayer.value,
      maxPlayHcp: this.f.maxPlayHcp.value,
      canUpdateHcp: this.f.canUpdateHcp.value
    };

    if (tournament.startDate > tournament.endDate) {
      this.alertService.error($localize`:@@addTour-strtDat:Start date cannot be later than end date`, false);
      return;
    }

    this.loading = true;

    this.tournamentHttpService.addTournament(tournament).pipe(
      tap(
        () => {
          this.alertService.success($localize`:@@addTour-tourSucc:Tournament successfully created`, true);
          this.loading = false;
          this.router.navigate(['/tournaments']).catch(error => console.log(error));
        })
    ).subscribe();
  }
}
