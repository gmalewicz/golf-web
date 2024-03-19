import { DialogBaseComponent } from '@/_helpers/dialog.base';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatError } from '@angular/material/form-field';

@Component({
    selector: 'app-upd-dialog',
    templateUrl: './upd-dialog.component.html',
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, ReactiveFormsModule, MatFormField, MatInput, NgIf, MatError, MatCheckbox, MatDialogActions, MatButton]
})
export class UpdDialogComponent  extends DialogBaseComponent {

  nick: string;

  constructor(
    protected fb: FormBuilder,
    protected dialogRef: MatDialogRef<UpdDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    super(fb, dialogRef, data);
    this.form.addControl('female',  new FormControl(data.sex === true));
    this.form.addControl('male',  new FormControl(data.sex === false));
    this.form.addControl('nick',  new FormControl(data.nick, [Validators.required, Validators.maxLength(20)]));
    this.nick = data.nick;
    this.f.whs.setValue(data.whs);
  }
}
