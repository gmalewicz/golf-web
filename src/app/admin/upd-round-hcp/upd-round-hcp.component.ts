import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-upd-round-hcp',
    templateUrl: './upd-round-hcp.component.html',
    standalone: true,
    imports: [ReactiveFormsModule, NgClass, NgIf, RouterLink]
})
export class UpdRoundHcpComponent implements OnInit {

  updRoundHcpForm: FormGroup;
  submittedUpdRoundHcp: boolean;
  updRoundHcpLoading: boolean;

  constructor(private formBuilder: FormBuilder,
              private alertService: AlertService,
              private httpService: HttpService,
              private router: Router) { }

  ngOnInit(): void {
    this.updRoundHcpForm = this.formBuilder.group({
      playerId: ['', [Validators.required, Validators.pattern('[1-9][0-9]{0,5}?')]],
      roundId: ['', [Validators.required, Validators.pattern('[1-9][0-9]{0,5}?')]],
      // tslint:disable-next-line: max-line-length
      whs: ['', [Validators.required,  Validators.pattern('(-5(\\.|,)0|-[0-4](,|\\.)\\d|\\d(\\.|,)\\d|[1-4]\\d(\\.|,)\\d|5[0-4](\\.|,)\\d)|\\d\\d|\\d'), Validators.min(-5), Validators.max(54)]]
    });
  }

  // convenience getter for easy access to form fields
  get fupdRoundHcp() { return this.updRoundHcpForm.controls; }

  onSubmitUpdRoundHcp() {

    this.submittedUpdRoundHcp = true;

    // stop here if form is invalid
    if (this.updRoundHcpForm.invalid) {
      return;
    }

    this.updRoundHcpLoading = true;

    let whs = this.fupdRoundHcp.whs.value;

    if (whs !== '') {
      whs = whs.replace(/,/gi, '.');
    }

    this.httpService
        .updatePlayerRoundWHS(this.fupdRoundHcp.playerId.value, this.fupdRoundHcp.roundId.value, whs).pipe(
      tap(
        () => {
          this.alertService.success('WHS for round successfully updated', true);
          this.updRoundHcpLoading = false;
          this.router.navigate(['/home']).catch(error => console.log(error));
        })
    ).subscribe();

  }
}


