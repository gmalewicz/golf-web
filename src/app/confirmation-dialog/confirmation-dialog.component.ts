import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class ConfirmationDialogComponent  {

  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) { }

  public confirmMessage: string;
  public makeItDanger: boolean
}
