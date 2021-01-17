import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Tournament } from '@/_models';
import { AuthenticationService, AlertService } from '@/_services';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TournamentHttpService } from '../_services';

@Component({
  selector: 'app-add-tournament',
  templateUrl: './add-tournament.component.html'
})
export class AddTournamentComponent implements OnInit {

  addTournamentForm: FormGroup;
  submitted: boolean;
  loading: boolean;

  constructor(private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private tournamentHttpService: TournamentHttpService,
              private alertService: AlertService,
              private router: Router) { }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.addTournamentForm = this.formBuilder.group({
        name: ['', Validators.minLength(3)],
        startDate: ['', [Validators.required, Validators.pattern('([0-9]{4})\/([0-9]{1,2})\/([0-9]{1,2})')]],
        endDate: ['', [Validators.required, Validators.pattern('([0-9]{4})\/([0-9]{1,2})\/([0-9]{1,2})')]]
      });
      // console.log('initialization');

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

    this.loading = true;

    const tournament: Tournament = {
      player: {id: this.authenticationService.currentPlayerValue.id,
               nick: this.authenticationService.currentPlayerValue.nick,
               whs: this.authenticationService.currentPlayerValue.whs},
      name: this.f.name.value,
      startDate: this.f.startDate.value,
      endDate: this.f.endDate.value
    };

    if (tournament.startDate > tournament.endDate) {
      this.alertService.error('Start date cannot be later than end date', false);
      return;
    }

    this.tournamentHttpService.addTournament(tournament).subscribe(data => {

      this.alertService.success('Tournament successfully created', true);
      this.loading = false;
      this.router.navigate(['/']);
    },
      (error: HttpErrorResponse) => {
        this.alertService.error('Tournament creation failed', true);
        this.loading = false;
        this.router.navigate(['/']);
      });
  }
}
