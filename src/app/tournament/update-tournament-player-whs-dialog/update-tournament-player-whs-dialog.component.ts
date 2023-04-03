import { DialogBaseComponent } from '@/_helpers/dialog.base';
import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-update-tournament-player-whs-dialog',
  templateUrl: './update-tournament-player-whs-dialog.component.html'
})
export class UpdateTournamentPlayerWhsDialogComponent extends DialogBaseComponent {

  constructor(
    protected fb: FormBuilder,
    protected dialogRef: MatDialogRef<UpdateTournamentPlayerWhsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) {
   super(fb, dialogRef, data);
  }
}
