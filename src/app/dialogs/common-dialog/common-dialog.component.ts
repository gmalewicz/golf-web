import { Component, OnInit, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatInput } from '@angular/material/input';
import { MatFormField, MatError } from '@angular/material/form-field';

@Component({
    selector: 'app-common-dialog',
    template: `
  <mat-form-field [formGroup]="form()">
    <input matInput maxlength="4" i18n-placeholder="@@scrComDlg-whs" placeholder="Player whs (X.X)" formControlName="whs" />
    @if (form().controls.whs.errors && form().controls.whs.errors.required) {
      <mat-error i18n="@@scrComDlg-whsReq">WHS is required</mat-error>
    }
    @if (form().controls.whs.errors && form().controls.whs.errors.max) {
      <mat-error i18n="@@scrComDlg-whsTooHigh">WHS is cannot be higer than 54</mat-error>
    }
    @if (form().controls.whs.errors && form().controls.whs.errors.min) {
      <mat-error i18n="@@scrComDlg-whsTooLow">WHS is cannot be lower than -5</mat-error>
    }
    @if (form().controls.whs.errors && form().controls.whs.errors.pattern) {
      <mat-error i18n="@@scrComDlg-patrn">Provide valid value</mat-error>
    }
  </mat-form-field>
  `,
    imports: [MatFormField, ReactiveFormsModule, MatInput, MatError]
})
export class CommonDialogComponent implements OnInit {

  form = input.required<FormGroup>();

  ngOnInit(): void {
    // This is intentional
  }
}


