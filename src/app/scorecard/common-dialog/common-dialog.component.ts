import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-common-dialog',
  template: `
  <mat-dialog-content [formGroup]="form">
  <mat-form-field>
    <input matInput maxlength="4" placeholder="Player whs (X.X)" formControlName="whs" />
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.required"
      >WHS is required</mat-error
    >
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.max"
      >WHS is caannot be higer than 54</mat-error
    >
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.min"
      >WHS is caannot be lower than -5</mat-error
    >
    <mat-error *ngIf="form.controls.whs.errors && form.controls.whs.errors.pattern"
      >Provide valid value</mat-error
    >
  </mat-form-field>
</mat-dialog-content>
  `
})
export class CommonDialogComponent implements OnInit {

  @Input() form: FormGroup;

  constructor() {
    // This is intentional
  }

  ngOnInit(): void {
    // This is intentional
  }
}


