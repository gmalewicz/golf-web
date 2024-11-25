import { DialogBaseComponent } from '@/_helpers/dialog.base';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { CommonDialogComponent } from '../../dialogs/common-dialog/common-dialog.component';

@Component({
    selector: 'app-update-whs-dialog',
    templateUrl: './update-whs-dialog.component.html',
    imports: [MatDialogTitle, MatDialogContent, ReactiveFormsModule, CommonDialogComponent, MatDialogActions, MatButton]
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
