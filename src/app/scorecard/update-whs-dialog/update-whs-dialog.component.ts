import { DialogBaseComponent } from '@/_helpers/dialog.base';
import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-update-whs-dialog',
  templateUrl: './update-whs-dialog.component.html'
})
export class UpdateWhsDialogComponent extends DialogBaseComponent {

  constructor(
    protected fb: FormBuilder,
    protected dialogRef: MatDialogRef<UpdateWhsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
   super(fb, dialogRef, data);
  }
}
