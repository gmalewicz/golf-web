import { Player } from '@/_models/player';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-update-whs-dialog',
  templateUrl: './update-whs-dialog.component.html'
})
export class UpdateWhsDialogComponent implements OnInit {
  form: FormGroup;
  player: Player;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateWhsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.form = this.fb.group({
      whs: [
        '',
        [
          Validators.required,
          Validators.pattern('-?[1-5][0-9]?.?[0-9]?$'),
          Validators.min(-5),
          Validators.max(54),
        ],
      ],
    });
    this.player = data.player;
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

  close() {
    this.dialogRef.close();
  }
}
