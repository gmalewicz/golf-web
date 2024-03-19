import { DialogBaseComponent } from '@/_helpers/dialog.base';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatError } from '@angular/material/form-field';

@Component({
    selector: 'app-finish-social-dialog',
    templateUrl: './finish-social-dialog.component.html',
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, ReactiveFormsModule, MatFormField, MatInput, NgIf, MatError, MatCheckbox, MatDialogActions, MatButton]
})
export class FinishSocialDialogComponent extends DialogBaseComponent {

  nick: string;

  constructor(
    protected fb: FormBuilder,
    protected dialogRef: MatDialogRef<FinishSocialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    super(fb, dialogRef, data);
    this.form.addControl('female',  new FormControl(data.sex === true));
    this.form.addControl('male',  new FormControl(data.sex === false));
    this.nick = data.nick;
  }
}
