import { DialogBaseComponent } from '@/_helpers/dialog.base';

import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    imports: [FontAwesomeModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatButtonModule],
    selector: 'app-update-tournament-player-whs-dialog',
    templateUrl: './update-tournament-player-whs-dialog.component.html'
})
export class UpdateTournamentPlayerWhsDialogComponent extends DialogBaseComponent {

  constructor() {
    super();
  }
}