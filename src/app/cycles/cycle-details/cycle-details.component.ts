import { Cycle } from './../_models/cycle';
import { EagleResult, EagleResultSet } from './../_models/eagleResult';
import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AddTournamentDialogComponent } from '../add-tournament-dialog/add-tournament-dialog.component';
import { CycleHttpService } from '../_services/cycleHttp.service';
import { AlertService } from '@/_services/alert.service';
import { combineLatest } from 'rxjs';
import { CycleResult } from '../_models/cycleResult';
import { CycleTournament } from '../_models/cycleTournament';

@Component({
  selector: 'app-cycle-details',
  templateUrl: './cycle-details.component.html'
})
export class CycleDetailsComponent implements OnInit {

  display: boolean;
  cycle: Cycle;
  cycleResults: CycleResult[];
  cycleTournaments: CycleTournament[];

  constructor(public authenticationService: AuthenticationService,
              private router: Router,
              private dialog: MatDialog,
              private cycleHttpService: CycleHttpService,
              private alertService: AlertService) { }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {

      this.cycle = history.state.data.cycle;
      combineLatest([ this.cycleHttpService.getCycleResults(this.cycle.id),
        this.cycleHttpService.getCycleTournaments(this.cycle.id)]).subscribe(([retCycleResults, retCycleTournamnets]) => {

          this.cycle = history.state.data.cycle;
          this.cycleResults = retCycleResults;
          this.cycleTournaments = retCycleTournamnets;
          this.display = true;
      });
    }
  }

  addTournament(): void {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      cycle: this.cycle
    };
    dialogConfig.width = '300px';



    const dialogRef = this.dialog.open(
      AddTournamentDialogComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {

        this.cycleHttpService.getEagleResults(result.tournamentNo)
        .pipe(
          tap((reareEagleResultSet: any) => {

            const eagleResultSet: EagleResultSet  = {
              items: [],
              name: result.name,
              rounds: result.rounds,
              bestOf: result.bestOf,
              tournamentNo: result.tournamentNo,
              cycle: this.cycle,
            };
            reareEagleResultSet.items.forEach(element => {

              const eagleResult: EagleResult = {
                firstName: element.first_name,
                lastName: element.last_name,
                whs: element.hcp,
                r: element.r
              };

              eagleResultSet.items.push(eagleResult);

            });

            this.cycleHttpService.addCycleTournament(eagleResultSet).pipe(tap(
              () => {
                this.alertService.success('Cycle tournamnet successfully added', true);
                this.router.navigate(['/home']);
              })
            ).subscribe();
          })
        )
        .subscribe();
      }
    });

  }
}
