import { EagleResult, EagleResultSet } from './../_models/eagleResult';
import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AddTournamentDialogComponent } from '../add-tournament-dialog/add-tournament-dialog.component';
import { CycleHttpService } from '../_services/cycleHttp.service';
import { AlertService } from '@/_services/alert.service';
import { CycleTournamentComponent } from '../cycle-tournament/cycle-tournament.component';
import { CycleResultsComponent } from '../cycle-results/cycle-results.component';
import { CycleDetailsBase } from '../base/cycle-details-base';


@Component({
    selector: 'app-cycle-details',
    templateUrl: './cycle-details.component.html',
    imports: [CycleResultsComponent, CycleTournamentComponent, RouterLink],
    providers: [CycleHttpService]
})
export class CycleDetailsComponent extends CycleDetailsBase implements OnInit {

  constructor(public authenticationService: AuthenticationService,
              protected readonly router: Router,
              protected readonly dialog: MatDialog,
              protected readonly cycleHttpService: CycleHttpService,
              protected readonly alertService: AlertService
              ) { 
                super(authenticationService, router, dialog, cycleHttpService, alertService);
              }

  ngOnInit(): void {

    this.init();
  }

  addTournament(): void {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '300px';

    const dialogRef = this.dialog.open(
      AddTournamentDialogComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.loadingAddTour = true;
        this.cycleHttpService.getEagleStbResults(result.tournamentNo, 0)
        .pipe(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                r: element.r,
                series: 1
              };

              eagleResultSet.items.push(eagleResult);

            });

            this.cycleHttpService.addCycleTournament(eagleResultSet).pipe(tap(
              () => {
                this.alertService.success($localize`:@@cycleDetails-tourAdded:Cycle tournamnet successfully added`, false);
                this.ngOnInit();
              })
            ).subscribe();
          })
        )
        .subscribe();
      }
    });

  }

  
}
