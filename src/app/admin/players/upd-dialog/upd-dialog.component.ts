import { DialogBaseComponent } from '@/_helpers/dialog.base';
import { Component, inject } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';

import { MatInput } from '@angular/material/input';
import { MatFormField, MatError } from '@angular/material/form-field';

@Component({
    selector: 'app-upd-dialog',
    templateUrl: './upd-dialog.component.html',
    imports: [MatDialogTitle, MatDialogContent, ReactiveFormsModule, MatFormField, MatInput, MatError, MatCheckbox, MatDialogActions, MatButton]
})
export class UpdDialogComponent  extends DialogBaseComponent {

  nick: string;

  constructor() {
    super();
    const data = inject(MAT_DIALOG_DATA);

    this.form.addControl('female',  new FormControl(data.sex === true));
    this.form.addControl('male',  new FormControl(data.sex === false));
    this.form.addControl('nick',  new FormControl(data.nick, [Validators.required, Validators.maxLength(20)]));
    this.nick = data.nick;
    this.f.whs.setValue(data.whs);
  }
}