import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Component({
  selector: 'app-anonymize-cycle',
  imports: [ReactiveFormsModule,  NgClass],
  templateUrl: './anonymize-cycle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnonymizeCycleComponent implements OnInit {

  anonymizeCycleForm: FormGroup;
  submittedAnonymizeCycle: boolean;
  anonymizeLoading: boolean;

  constructor(private readonly formBuilder: FormBuilder,
              private readonly alertService: AlertService,
              private readonly httpService: HttpService,
              private readonly router: Router) { }

  ngOnInit(): void {

    this.anonymizeCycleForm = this.formBuilder.group({
      cycleId: ['', [Validators.required, Validators.pattern('[1-9]\\d{0,9}')]],
    });
  }

  // convenience getter for easy access to form fields
  get fAnonymize() { return this.anonymizeCycleForm.controls; }

  onSubmitAnonymize() {

    this.submittedAnonymizeCycle = true;

    // stop here if form is invalid
    if (this.anonymizeCycleForm.invalid) {
      return;
    }

    this.anonymizeLoading = true;

    this.httpService.anonymizeCycleRsults(this.fAnonymize.cycleId.value).pipe(
      tap(
        () => {
          this.alertService.success('Anonymization has been done', true);
          this.anonymizeLoading = false;
          this.router.navigate(['/home']).catch(error => console.log(error));
        })
    ).subscribe();
  }
}
