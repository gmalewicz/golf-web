import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-upd-player-rnd',
    templateUrl: './upd-player-rnd.component.html',
    imports: [ReactiveFormsModule, NgClass]
})
export class UpdPlayerRndComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly alertService = inject(AlertService);
  private readonly httpService = inject(HttpService);
  private readonly router = inject(Router);


  upPlrRndForm: FormGroup;
  submittedUpdPlrRnd: boolean;
  updPlrRndLoading: boolean;

  ngOnInit(): void {
    this.upPlrRndForm = this.formBuilder.group({
      oldPlrId: ['', [Validators.required, Validators.pattern('[1-9][0-9]{0,5}?')]],
      newPlrId: ['', [Validators.required, Validators.pattern('[1-9][0-9]{0,5}?')]],
      roundId: ['', [Validators.required, Validators.pattern('[1-9][0-9]{0,5}?')]],
    });
  }

  // convenience getter for easy access to form fields
  get fupdPlrRnd() { return this.upPlrRndForm.controls; }

  onSubmitUpdPlrRnd() {

    this.submittedUpdPlrRnd = true;

    // stop here if form is invalid
    if (this.upPlrRndForm.invalid) {
      return;
    }

    this.updPlrRndLoading = true;

    this.httpService
        .updatePlayerRnd(this.fupdPlrRnd.oldPlrId.value, this.fupdPlrRnd.newPlrId.value, this.fupdPlrRnd.roundId.value).pipe(
      tap(
        () => {
          this.alertService.success('Player succesfully swapped for round', true);
          this.updPlrRndLoading = false;
          this.router.navigate(['/home']).catch(error => console.log(error));
        })
    ).subscribe();

  }
}


