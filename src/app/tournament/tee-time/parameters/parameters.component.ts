import { TournamentNavigationService } from '@/tournament/_services';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TeeTimeParameters } from '@/tournament/_models';

@Component({
  selector: 'app-parameters',
  standalone: true,
  imports: [ReactiveFormsModule, MatSelectModule,  MatInputModule, CommonModule],
  templateUrl: './parameters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParametersComponent implements OnInit, OnDestroy {

  parametersForm: FormGroup;
  _formChanges: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    public tournamentNavigationService: TournamentNavigationService
  ) {}

  ngOnDestroy(): void {
    this._formChanges.unsubscribe();
  }

  ngOnInit(): void {

    // form definition
    this.parametersForm = this.formBuilder.group({
      startTeeTime: [
        this.tournamentNavigationService.teeTimeParameters().firstTeeTime, {
        validators: [
          Validators.required,
          Validators.pattern('^([0-1][0-9]|[2][0-3]):([0-5][0-9])$'),
        ],
      }],
      teeTimeStep: [this.tournamentNavigationService.teeTimeParameters().teeTimeStep + '', [Validators.required]],
      flightSize: [this.tournamentNavigationService.teeTimeParameters().flightSize + '', [Validators.required]],
      playerAssignment: [this.tournamentNavigationService.teeTimeParameters().flightAssignment + '', [Validators.required]],
    });

    this._formChanges = this.parametersForm.valueChanges.subscribe(() => {
       if (this.parametersForm.dirty) {
        this.updateParameters();
       }
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.parametersForm.controls;
  }

  updateParameters() {

    const newParameters : TeeTimeParameters = {...this.tournamentNavigationService.teeTimeParameters(),
      firstTeeTime: this.f.startTeeTime.value,
      flightSize: this.f.flightSize.value,
      teeTimeStep: this.f.teeTimeStep.value,
      flightAssignment: this.f.playerAssignment.value
    };
    this.tournamentNavigationService.teeTimeParameters.set(newParameters);
  }

}
