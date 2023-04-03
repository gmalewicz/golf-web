import { DialogBaseComponent } from '@/_helpers/dialog.base';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-upd-dialog',
  templateUrl: './upd-dialog.component.html'
})
export class UpdDialogComponent  extends DialogBaseComponent {

  nick: string;

  constructor(
    protected fb: FormBuilder,
    protected dialogRef: MatDialogRef<UpdDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    super(fb, dialogRef, data);
    this.form.addControl('female',  new FormControl(data.sex === true ? true : false));
    this.form.addControl('male',  new FormControl(data.sex === false ? true : false));
    this.form.addControl('nick',  new FormControl(data.nick, [Validators.required, Validators.maxLength(20)]));
    this.nick = data.nick;
    this.f.whs.setValue(data.whs);
  }
}
