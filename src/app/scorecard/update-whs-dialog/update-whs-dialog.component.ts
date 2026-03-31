import { DialogBaseComponent } from '@/_helpers/dialog.base';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { CommonDialogComponent } from '../../dialogs/common-dialog/common-dialog.component';

@Component({
    selector: 'app-update-whs-dialog',
    templateUrl: './update-whs-dialog.component.html',
    imports: [MatDialogTitle, MatDialogContent, ReactiveFormsModule, CommonDialogComponent, MatDialogActions, MatButton]
})
export class UpdateWhsDialogComponent extends DialogBaseComponent {

  constructor() {
    super();
  }
}