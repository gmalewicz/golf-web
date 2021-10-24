import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddTournamentDialogComponent } from '../add-tournament-dialog/add-tournament-dialog.component';
import { Cycle } from '../_models/cycle';

@Component({
  selector: 'app-cycle-details',
  templateUrl: './cycle-details.component.html'
})
export class CycleDetailsComponent implements OnInit {

  display: boolean;
  cycle: Cycle;

  constructor(public authenticationService: AuthenticationService,
              private router: Router,
              private dialog: MatDialog) { }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {
      this.cycle = history.state.data.cycle;
      this.display = true;
    }
  }

  addTournament(): void {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      cycle: this.cycle
    };

    const dialogRef = this.dialog.open(
      AddTournamentDialogComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
      }
    });
  }
}
