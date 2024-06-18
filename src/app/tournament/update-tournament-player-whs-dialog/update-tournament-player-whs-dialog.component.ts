import { DialogBaseComponent } from '@/_helpers/dialog.base';

import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  standalone: true,
  imports: [FontAwesomeModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatButtonModule],
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
