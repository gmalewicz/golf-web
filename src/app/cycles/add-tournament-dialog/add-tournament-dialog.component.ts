import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-tournament-dialog',
  templateUrl: './add-tournament-dialog.component.html'
})
export class AddTournamentDialogComponent implements OnInit {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTournamentDialogComponent>,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(30)]],
      rounds: ['1', [ Validators.required, Validators.min(1), Validators.max(4)]],
      bestOf: [false],
      tournamentNo: ['', [Validators.required, Validators.pattern('[1-9][0-9][0-9][0-9][0-9]{0,1}')]],
    });
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
