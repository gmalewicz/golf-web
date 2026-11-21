import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-pzg-id-dialog',
  templateUrl: './pzg-id-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, MatDialogContent, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatDialogActions, MatButton]
})
export class PzgIdDialogComponent {

  private readonly dialogRef = inject<MatDialogRef<PzgIdDialogComponent>>(MatDialogRef);

  readonly nick: string;
  readonly form: FormGroup<{ pzgId: FormControl<string> }>;

  constructor() {
    const data = inject(MAT_DIALOG_DATA);

    this.nick = data.nick;
    this.form = new FormGroup({
      pzgId: new FormControl<string>(data.pzgId == null ? '' : String(data.pzgId), {
        nonNullable: true,
        validators: [Validators.pattern(/^[1-9]\d{0,14}$/)]
      })
    });
  }

  save() {
    if (this.form.invalid) {
      return;
    }
    const value = this.form.controls.pzgId.value.trim();
    this.dialogRef.close({ pzgId: value === '' ? null : Number(value) });
  }

  close() {
    this.dialogRef.close();
  }
}
