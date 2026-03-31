import { EagleResult, EagleResultSet } from '../_models/eagleResult';
import { AuthenticationService } from '@/_services/authentication.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { AddTournamentDialogComponent } from '../add-tournament-dialog/add-tournament-dialog.component';
import { CycleHttpService } from '../_services/cycleHttp.service';
import { AlertService } from '@/_services/alert.service';
import { CycleDetailsBase } from './cycle-details-base';
import { combineLatest, Observable } from 'rxjs';

// Eagle API response interfaces (external system)
interface EagleClassification {
  id: number;
  name: string;
}

interface EagleTournamentResponse {
  tournament: {
    classifications: EagleClassification[];
  };
}

export interface EagleApiItem {
  first_name: string;
  last_name: string;
  hcp: number;
  r: number[];
  player_id: number;
  scorecard?: EagleScorecard;
  tieArray?: number[][];
  grandPrix?: number[];
}

interface EagleScorecard {
  scorecard: {
    rounds: {
      sum: { stb_netto: number };
      in: { stb_netto: number };
      holes_in: { stb_netto: number }[];
      holes_out: { stb_netto: number }[];
    }[];
  };
}

export interface EagleApiResultSet {
  items: EagleApiItem[];
}

interface DialogResult {
  tournamentNo: number;
  name: string;
  rounds: number;
  bestOf: boolean;
}


export abstract class CycleDetailsVersionedBase extends CycleDetailsBase {

  protected abstract grandPrixPoints: number[];

  constructor(
    public authenticationService: AuthenticationService,
    protected readonly router: Router,
    protected readonly dialog: MatDialog,
    protected readonly cycleHttpService: CycleHttpService,
    protected readonly alertService: AlertService,
  ) {
    super(authenticationService, router, dialog, cycleHttpService, alertService);
  }

  protected abstract processSingleRoundTournament(element: EagleApiResultSet, eagleResultSet: EagleResultSet): void;
  protected abstract processMultiRoundTournament(eagleResultSet: EagleResultSet, reareEagleResultSet: EagleApiResultSet[]): void;

  protected sortResults(): void {
    this.cycleResults.forEach((result) => {
      // first slice is to prevent sorting in place
      const sortedBestResults: number[] = result.r
        .slice()
        .sort((a, b) => b - a)
        .slice(0, this.cycle.bestRounds);
      result.sequence = '';
      sortedBestResults.forEach((score) => {
        if (score <= 9) {
          result.sequence += '0' + score;
        } else {
          result.sequence += score;
        }
      });
    });

    this.cycleResults.sort(
      (a, b) =>
        a.series - b.series ||
        b.cycleResult - a.cycleResult ||
        +b.sequence - +a.sequence ||
        +a.hcp.at(-1) - +b.hcp.at(-1)
    );
  }

  addTournament(): void {
    const dialogConfig = new MatDialogConfig();
    let resultData: DialogResult;
    let loadedReareEagleResultSet: EagleApiResultSet[];
    let loadedStrokePlayResultSet: EagleApiResultSet;

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '300px';

    const dialogRef = this.dialog.open(
      AddTournamentDialogComponent,
      dialogConfig,
    );

    dialogRef
      .afterClosed()
      .pipe(
        // process dialog result
        mergeMap((result) => {
          if (result !== undefined) {
            resultData = result;
            this.loadingAddTour = true;
            return this.cycleHttpService.getEagleTournament(
              result.tournamentNo,
            );
          }
          return Promise.resolve(undefined);
        }),
        // process tournament data
        mergeMap((reareEagleTournament: EagleTournamentResponse) => {
          if (reareEagleTournament === undefined) {
            return Promise.resolve(undefined);
          }

          const classificationsIds: number[] = [];

          reareEagleTournament.tournament.classifications.forEach((element) => {
            const name: string = element.name;

            if (name.includes('HCP') && /[ABC]/.exec(name)) {
              classificationsIds.push(element.id);
            }
          });

          return Promise.resolve(classificationsIds);
        }),
        // load data per classification
        mergeMap((classificationsIds: number[]) => {
          if (classificationsIds === undefined) {
            return Promise.resolve(undefined);
          }

          const calls: Observable<unknown>[] = [];
          classificationsIds.forEach((element) => {
            calls.push(
              this.cycleHttpService.getEagleStbResults(
                resultData.tournamentNo,
                element,
              ),
            );
          });

          // grab stroke play category
          calls.push(
            this.cycleHttpService.getStrokePlay(resultData.tournamentNo),
          );

          return combineLatest(calls);
        }),
        // load scorecards for each player in case of multi round tournament
        mergeMap((reareEagleResultSet: EagleApiResultSet[]) => {
          if (reareEagleResultSet === undefined) {
            return Promise.resolve(undefined);
          }

          loadedReareEagleResultSet = reareEagleResultSet.slice(0, -1);
          loadedStrokePlayResultSet = reareEagleResultSet.at(-1);

          // for single round tournament the last one is stroke play category
          if (resultData.rounds === 1) {
            return Promise.resolve(null);
          }

          const calls: Observable<unknown>[] = [];
          loadedReareEagleResultSet.forEach((element) => {
            element.items.forEach((item) => {
              calls.push(this.cycleHttpService.getScoreCard(item.player_id));
            });
          });

          return combineLatest(calls);
        }),
        // merge scorecards with rest of data
        mergeMap((scorecards: EagleScorecard[]) => {
          if (
            scorecards === undefined &&
            (resultData === undefined || resultData.rounds > 1)
          ) {
            return Promise.resolve(undefined);
          } else if (loadedReareEagleResultSet === undefined) {
            return Promise.resolve(undefined);
          } else if (resultData.rounds === 1) {
            return Promise.resolve(loadedReareEagleResultSet);
          }

          let pos = 0;
          loadedReareEagleResultSet.forEach((element) => {
            element.items.forEach((item) => {
              item.scorecard = scorecards[pos++];
              this.prepareTieArray(item, resultData.rounds);
            });
          });
          return Promise.resolve(loadedReareEagleResultSet);
        }),

        // generate eagle result set for each classification and save it
        mergeMap((reareEagleResultSet: EagleApiResultSet[]) => {
          if (reareEagleResultSet === undefined) {
            return Promise.resolve(undefined);
          }

          const eagleResultSet: EagleResultSet = {
            items: [],
            name: resultData.name,
            rounds: resultData.rounds,
            bestOf: resultData.bestOf,
            tournamentNo: resultData.tournamentNo,
            cycle: this.cycle,
          };

          if (resultData.rounds === 1) {
            reareEagleResultSet.forEach((element) => {
              this.processSingleRoundTournament(element, eagleResultSet);
            });
          } else {
            this.processMultiRoundTournament(
              eagleResultSet,
              reareEagleResultSet,
            );
          }

          // create the second series for stroke play category
          this.processStrokePlaySeries(
            loadedStrokePlayResultSet,
            eagleResultSet,
          );

          return this.cycleHttpService.addCycleTournament(eagleResultSet);
        }),
      )
      .subscribe((status: unknown) => {
        if (status != undefined) {
          this.alertService.success(
            $localize`:@@cycleDetails-tourAdded:Cycle tournamnet successfully added`,
            false,
          );
        } else if (resultData !== undefined) {
          this.alertService.error(
            $localize`:@@cycleDetails-tourAddedFailure:Adding tournament to cycle failed`,
            false,
          );
        }

        this.init();
      });
  }

  private processStrokePlaySeries(
    element: EagleApiResultSet,
    eagleResultSet: EagleResultSet,
  ): void {
    element.items.forEach((item) => {
      // skip players without results
      if (item.r.reduce((a, b) => a + b) === 0) {
        return;
      }
      const eagleResult: EagleResult = {
        firstName: item.first_name,
        lastName: item.last_name,
        whs: item.hcp ?? 0,
        r: item.r,
        series: 2,
      };
      eagleResultSet.items.push(eagleResult);
    });
  }

  protected prepareTieArray(item: EagleApiItem, round: number): void {
    item.tieArray = new Array(round);
    for (let i = 0; i < round; i++) {
      item.tieArray[i] = [];
      item.tieArray[i].push(
        item.r[i], // stb net
        item.scorecard.scorecard.rounds[i].sum.stb_netto, // last round
        item.scorecard.scorecard.rounds[i].in.stb_netto, // last 9
        +item.scorecard.scorecard.rounds[i].holes_in[8].stb_netto +
          +item.scorecard.scorecard.rounds[i].holes_out[7].stb_netto +
          +item.scorecard.scorecard.rounds[i].holes_out[6].stb_netto +
          +item.scorecard.scorecard.rounds[i].holes_out[5].stb_netto +
          +item.scorecard.scorecard.rounds[i].holes_out[4].stb_netto +
          +item.scorecard.scorecard.rounds[i].holes_out[3].stb_netto, // last 6
        +item.scorecard.scorecard.rounds[i].holes_in[8].stb_netto +
          +item.scorecard.scorecard.rounds[i].holes_out[7].stb_netto +
          +item.scorecard.scorecard.rounds[i].holes_out[6].stb_netto, // last 3
        item.scorecard.scorecard.rounds[i].holes_in[8].stb_netto, // last 1
        item.hcp, // lower hcp
      );
    }
  }

  protected resolveTies(items: EagleApiItem[], round: number): void {
    items.sort(
      (a, b) =>
        b.tieArray[round][0] - a.tieArray[round][0] ||
        b.tieArray[round][1] - a.tieArray[round][1] ||
        b.tieArray[round][2] - a.tieArray[round][2] ||
        b.tieArray[round][3] - a.tieArray[round][3] ||
        b.tieArray[round][4] - a.tieArray[round][4] ||
        a.tieArray[round][5] - b.tieArray[round][5],
    );
  }
}
