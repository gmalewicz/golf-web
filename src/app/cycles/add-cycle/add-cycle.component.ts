import { AlertService } from '@/_services/alert.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Cycle, CycleStatus } from '../_models/cycle';
import { CycleHttpService } from '../_services/cycleHttp.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-add-cycle',
    templateUrl: './add-cycle.component.html',
    imports: [ReactiveFormsModule, NgClass, RouterLink],
    providers: [CycleHttpService]
})
export class AddCycleComponent implements OnInit {

  addCycleForm: FormGroup;
  submitted: boolean;
  loading: boolean;
  display: boolean;

  constructor(private readonly formBuilder: FormBuilder,
              private readonly authenticationService: AuthenticationService,
              private readonly cycleHttpService: CycleHttpService,
              private readonly alertService: AlertService,
              private readonly router: Router) { }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      this.addCycleForm = this.formBuilder.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        bestRounds: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
        maxWhs: ['54.0', [Validators.required,  Validators.pattern('(-5(\\.|,)0|-[0-4](,|\\.)\\d|\\d(\\.|,)\\d|[1-4]\\d(\\.|,)\\d|5[0-4](\\.|,)\\d)|\\d\\d|\\d'), Validators.min(-5), Validators.max(54)]]
      });

      this.submitted = false;
      this.loading = false;
      this.display = true;
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.addCycleForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.addCycleForm.invalid) {
      return;
    }

    this.loading = true;

    const cycle: Cycle = {
      player: {id: this.authenticationService.currentPlayerValue.id,
               nick: this.authenticationService.currentPlayerValue.nick,
               whs: this.authenticationService.currentPlayerValue.whs},
      name: this.f.name.value,
      status: CycleStatus.STATUS_OPEN,
      bestRounds: this.f.bestRounds.value,
      maxWhs: this.f.maxWhs.value,
    };

    this.cycleHttpService.addCycle(cycle).pipe(tap(
      () => {
        this.alertService.success($localize`:@@addCycle-cycleAddedMsg:Cycle successfully created`, true);
        this.loading = false;
        this.router.navigate(['/cycles']).catch(error => console.log(error));
      })
    ).subscribe();
  }
}
