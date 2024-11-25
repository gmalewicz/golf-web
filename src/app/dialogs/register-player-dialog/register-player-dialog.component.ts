import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { CommonDialogComponent } from '../common-dialog/common-dialog.component';

import { MatInput } from '@angular/material/input';
import { MatFormField, MatError } from '@angular/material/form-field';

@Component({
    selector: 'app-register-player-dialog',
    templateUrl: './register-player-dialog.component.html',
    imports: [MatDialogTitle, MatDialogContent, ReactiveFormsModule, MatFormField, MatInput, MatError, CommonDialogComponent, MatCheckbox, MatDialogActions, MatButton]
})
export class RegisterPlayerDialogComponent implements OnInit {
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<RegisterPlayerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.form = this.fb.group({
      nick: [data.nick, [Validators.required, Validators.maxLength(10)]],
      whs: [
        '',
        [
          Validators.required,
          Validators.pattern('(-5(\\.|,)0|-[0-4](,|\\.)\\d|\\d(\\.|,)\\d|[1-4]\\d(\\.|,)\\d|5[0-4](\\.|,)\\d)|\\d\\d|\\d'),
          Validators.min(-5),
          Validators.max(54),
        ],
      ],
      female: [false],
      male: [true],
    });
  }

  ngOnInit() {
     // This is intentional
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  maleClick() {
    this.f.female.setValue(false);
  }

  femaleClick() {
    this.f.male.setValue(false);
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }
}
