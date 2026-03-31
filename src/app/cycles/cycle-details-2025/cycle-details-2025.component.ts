import { EagleResult, EagleResultSet } from "../_models/eagleResult";
import { AuthenticationService } from "@/_services/authentication.service";
import { Component, OnInit, inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router, RouterLink } from "@angular/router";
import { CycleHttpService } from "../_services/cycleHttp.service";
import { AlertService } from "@/_services/alert.service";
import { CycleTournamentComponent } from "../cycle-tournament/cycle-tournament.component";
import { CycleResultsComponent } from "../cycle-results/cycle-results.component";
import { CycleDetailsVersionedBase } from "../base/cycle-details-versioned-base";
import { CycleResultsStrokePlayComponent } from "../cycle-results-stroke-play/cycle-results-stroke-play.component";

@Component({
  selector: "app-cycle-details",
  templateUrl: "../base/cycle-details-versioned.component.html",
  imports: [
    CycleResultsComponent,
    CycleTournamentComponent,
    RouterLink,
    CycleResultsStrokePlayComponent,
  ],
  providers: [CycleHttpService],
})
export class CycleDetails2025Component
  extends CycleDetailsVersionedBase
  implements OnInit
{
  authenticationService: AuthenticationService;
  protected readonly router: Router;
  protected readonly dialog: MatDialog;
  protected readonly cycleHttpService: CycleHttpService;
  protected readonly alertService: AlertService;

  protected grandPrixPoints: number[] = [
    20, 17, 14, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
  ];

  constructor() {
    const authenticationService = inject(AuthenticationService);
    const router = inject(Router);
    const dialog = inject(MatDialog);
    const cycleHttpService = inject(CycleHttpService);
    const alertService = inject(AlertService);

    super(
      authenticationService,
      router,
      dialog,
      cycleHttpService,
      alertService,
    );
  
    this.authenticationService = authenticationService;
    this.router = router;
    this.dialog = dialog;
    this.cycleHttpService = cycleHttpService;
    this.alertService = alertService;
  }

  ngOnInit(): void {
    this.init();
  }

  protected processSingleRoundTournament(
    element: any,
    eagleResultSet: EagleResultSet,
  ): void {
    element.items
      .slice(0, this.grandPrixPoints.length)
      .forEach((item, index) => {
        const eagleResult: EagleResult = {
          firstName: item.first_name,
          lastName: item.last_name,
          whs: item.hcp ?? 0,
          r: [this.grandPrixPoints[index], 0, 0, 0],
          series: 1,
        };

        eagleResultSet.items.push(eagleResult);
      });
  }

  protected processMultiRoundTournament(
    eagleResultSet: EagleResultSet,
    reareEagleResultSet: any,
  ): void {
    // perepare r for each player
    reareEagleResultSet.forEach((set) =>
      set.items.forEach((item) => (item.grandPrix = [0, 0, 0, 0])),
    );

    // resolve ties for the first round
    reareEagleResultSet
      .slice(0, 3)
      .forEach((set) => this.resolveTies(set.items, 0));

    reareEagleResultSet.forEach((set) =>
      set.items.forEach(
        (item, index) => (item.grandPrix[0] = this.grandPrixPoints[index]),
      ),
    );

    // resolve ties for the second round

    reareEagleResultSet
      .slice(0, 3)
      .forEach((set) => this.resolveTies(set.items, 1));

    reareEagleResultSet.forEach((set) =>
      set.items.forEach(
        (item, index) => (item.grandPrix[1] = this.grandPrixPoints[index]),
      ),
    );

    reareEagleResultSet.forEach((element) => {
      element.items.forEach((item, index) => {
        const eagleResult: EagleResult = {
          firstName: item.first_name,
          lastName: item.last_name,
          whs: item.hcp ?? 0,
          r: item.grandPrix,
          series: 1,
        };

        if (
          item.grandPrix[0] !== undefined ||
          item.grandPrix[1] !== undefined
        ) {
          eagleResultSet.items.push(eagleResult);
        }
      });
    });
  }
}
