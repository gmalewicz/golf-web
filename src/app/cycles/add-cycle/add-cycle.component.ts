import { AlertService } from '@/_services/alert.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Cycle, cycleRule, cycleStatus } from '../_models/cycle';
import { CycleHttpService } from '../_services/cycleHttp.service';

@Component({
  selector: 'app-add-cycle',
  templateUrl: './add-cycle.component.html'
})
export class AddCycleComponent implements OnInit {

  addCycleForm: FormGroup;
  submitted: boolean;
  loading: boolean;
  rule: { label: string; value: number; }[];

  constructor(private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private cycleHttpService: CycleHttpService,
              private alertService: AlertService,
              private router: Router) { }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {

      this.rule = [{ label: 'STB netto sum', value:  cycleRule.RULE_STANDARD},
                   { label: 'Volvo 2021', value:  cycleRule.RULE_VOLVO_2021 }];

      this.addCycleForm = this.formBuilder.group({
        name: ['', [Validators.required,Validators.minLength(3)]],
        ruleDropDown: ['', [Validators.required]]
      });

      this.submitted = false;
      this.loading = false;
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
      rule: this.f.ruleDropDown.value,
      status: cycleStatus.STATUS_OPEN
    };

    this.cycleHttpService.addCycle(cycle).subscribe(() => {

      this.alertService.success('Cycle successfully created', true);
      this.loading = false;
      this.router.navigate(['/home']);
    },
      () => {
        this.alertService.error('Cycle creation failed', true);
        this.loading = false;
        this.router.navigate(['/home']);
      });
  }

}
