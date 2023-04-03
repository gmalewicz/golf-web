import { DialogBaseComponent } from '@/_helpers/dialog.base';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-finish-social-dialog',
  templateUrl: './finish-social-dialog.component.html'
})
export class FinishSocialDialogComponent extends DialogBaseComponent {

  nick: string;

  constructor(
    protected fb: FormBuilder,
    protected dialogRef: MatDialogRef<FinishSocialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    super(fb, dialogRef, data);
    this.form.addControl('female',  new FormControl(data.sex === true ? true : false));
    this.form.addControl('male',  new FormControl(data.sex === false ? true : false));
    this.nick = data.nick;
  }
}
