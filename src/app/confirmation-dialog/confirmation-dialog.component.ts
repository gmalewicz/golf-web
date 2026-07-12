
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogModule, MatButtonModule]
})
export class ConfirmationDialogComponent  {
  dialogRef = inject<MatDialogRef<ConfirmationDialogComponent>>(MatDialogRef);

  public confirmMessage = '';
  public makeItDanger = false;
}
