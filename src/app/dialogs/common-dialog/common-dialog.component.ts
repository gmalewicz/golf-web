import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatError } from '@angular/material/form-field';

@Component({
    selector: 'app-common-dialog',
    template: `
  <mat-form-field [formGroup]="form">
    <input matInput maxlength="4" i18n-placeholder="@@scrComDlg-whs" placeholder="Player whs (X.X)" formControlName="whs" />
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.required" i18n="@@scrComDlg-whsReq">WHS is required</mat-error>
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.max" i18n="@@scrComDlg-whsTooHigh">WHS is cannot be higer than 54</mat-error>
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.min" i18n="@@scrComDlg-whsTooLow">WHS is cannot be lower than -5</mat-error>
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.pattern" i18n="@@scrComDlg-patrn">Provide valid value</mat-error>
  </mat-form-field>
  `,
    standalone: true,
    imports: [MatFormField, ReactiveFormsModule, MatInput, NgIf, MatError]
})
export class CommonDialogComponent implements OnInit {

  @Input() form: FormGroup;

  ngOnInit(): void {
    // This is intentional
  }
}


