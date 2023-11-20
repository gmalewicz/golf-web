import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-common-dialog',
  template: `
  <mat-form-field [formGroup]="form">
    <input matInput maxlength="4" i18n-placeholder="@@scrComDlg-whs" placeholder="Player whs (X.X)" formControlName="whs" />
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.required" i18n="@@scrComDlg-whsReq">WHS is required</mat-error>
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.max" i18n="@@scrComDlg-whsTooHigh">WHS is caannot be higer than 54</mat-error>
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.min" i18n="@@scrComDlg-whsTooLow">WHS is caannot be lower than -5</mat-error>
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.pattern" i18n="@@scrComDlg-patrn">Provide valid value</mat-error>
  </mat-form-field>
  `
})
export class CommonDialogComponent implements OnInit {

  @Input() form: FormGroup;

  ngOnInit(): void {
    // This is intentional
  }
}


