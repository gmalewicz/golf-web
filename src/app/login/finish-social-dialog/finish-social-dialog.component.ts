import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-finish-social-dialog',
  templateUrl: './finish-social-dialog.component.html'
})
export class FinishSocialDialogComponent implements OnInit {
  form: FormGroup;
  nick: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FinishSocialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.form = this.fb.group({
      whs: [
        '54.0',
        [
          Validators.required,
          Validators.pattern('(-5(\\.|,)0|-[0-4](,|\\.)\\d|\\d(\\.|,)\\d|[1-4]\\d(\\.|,)\\d|5[0-4](\\.|,)\\d)'),
          Validators.min(-5),
          Validators.max(54),
        ],
      ],
      female: [data.sex === true ? true : false],
      male: [data.sex === false ? true : false]
    });
    this.nick = data.nick;
  }

  ngOnInit() {
     // This is intentional
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    this.dialogRef.close(this.form.value);
  }

  sexClick(sex: boolean) {
    if (sex) {
      this.f.male.setValue(false);
    } else {
      this.f.female.setValue(false);
    }
  }
}
