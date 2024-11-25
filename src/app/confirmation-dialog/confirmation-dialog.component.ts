
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    imports: [MatDialogModule, MatButtonModule]
})
export class ConfirmationDialogComponent  {

  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) { }

  public confirmMessage: string;
  public makeItDanger: boolean
}
