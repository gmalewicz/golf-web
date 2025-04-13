import { EagleResult, EagleResultSet } from '../_models/eagleResult';
import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { AddTournamentDialogComponent } from '../add-tournament-dialog/add-tournament-dialog.component';
import { CycleHttpService } from '../_services/cycleHttp.service';
import { AlertService } from '@/_services/alert.service';
import { CycleTournamentComponent } from '../cycle-tournament/cycle-tournament.component';
import { CycleResultsComponent } from '../cycle-results/cycle-results.component';
import { CycleDetailsBase } from '../base/cycle-details-base';
import { combineLatest, Observable } from 'rxjs';
import { CycleResultsStrokePlayComponent } from '../cycle-results-stroke-play/cycle-results-stroke-play.component';

@Component({
    selector: 'app-cycle-details',
    templateUrl: './cycle-details-2025.component.html',
    imports: [CycleResultsComponent, CycleTournamentComponent, RouterLink, CycleResultsStrokePlayComponent],
    providers: [CycleHttpService]
})
export class CycleDetails2025Component extends CycleDetailsBase implements OnInit {

  grandPrixPoints: number[] = [20, 17, 14, 12, 11, 10, 9, 8, 7, 6 , 5, 4, 3, 2, 1];

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

  protected sortResults(): void {
    this.cycleResults.forEach(result => {
      // first slice is to prevent sorting in place
      const sortedBestResults: number[] = result.r.slice().sort((a, b) => b - a).slice(0, this.cycle.bestRounds);
      result.sequence = '';
      sortedBestResults.forEach(score => {
        if (score <= 9) {
          result.sequence += '0' + score;
        } else {
          result.sequence += score;
        }
      });
    });

    this.cycleResults.sort((a, b) => a.series - b.series || 
                         b.cycleResult - a.cycleResult ||
                         +b.sequence - +a.sequence ||
                         +a.hcp[a.hcp.length - 1] - +b.hcp[b.hcp.length - 1]);

  };

  addTournament(): void {

    const dialogConfig = new MatDialogConfig();
    let resultData: any;
    let loadedReareEagleResultSet: any[];
    let loadedStrokePlayResultSet: any;

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '300px';

    const dialogRef = this.dialog.open(
      AddTournamentDialogComponent,
      dialogConfig
    );

    dialogRef.afterClosed()
      .pipe(
          // process dialog result
          mergeMap((result) => {
            if (result !== undefined) {
              resultData = result;
              this.loadingAddTour = true;
              return this.cycleHttpService.getEagleTournament(result.tournamentNo);
            } 
            return Promise.resolve(undefined);
          }),
          // process tournament data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mergeMap((reareEagleTournament: any) => {
          
            if (reareEagleTournament === undefined) {
              return Promise.resolve(undefined);
            }

            let classificationsIds: number[] = [];

            reareEagleTournament.tournament.classifications.forEach(element => {

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

            const calls: Observable<any>[] = [];
            classificationsIds.forEach(element => {
              calls.push(this.cycleHttpService.getEagleStbResults(resultData.tournamentNo, element));
            });

            // grab stroke play category
            calls.push(this.cycleHttpService.getStrokePlay(resultData.tournamentNo));
            
            return combineLatest(calls);
          }),
          // load scorecards for each player in case of multi round tournament
          mergeMap((reareEagleResultSet: any[]) => {
            if (reareEagleResultSet === undefined) {
              return Promise.resolve(undefined);
            }

            loadedReareEagleResultSet = reareEagleResultSet.slice(0, reareEagleResultSet.length - 1);
            loadedStrokePlayResultSet = reareEagleResultSet[reareEagleResultSet.length - 1];

            // for single round tournament the last one is stroke play category
            if (resultData.rounds === 1) {  
              return Promise.resolve(null);
            } 

            const calls: Observable<any>[] = Array();
            loadedReareEagleResultSet.forEach(element => {
              element.items.forEach(item => {
                calls.push(this.cycleHttpService.getScoreCard(item.player_id));
              });
            });
            
            return combineLatest(calls);

          }),
          // merge scorcards with rest of data
          mergeMap((scorecards: any[]) => {

            if (scorecards === undefined && (resultData === undefined || resultData.rounds > 1)) {
              return Promise.resolve(undefined);
            } else if (loadedReareEagleResultSet === undefined) { 
              return Promise.resolve(undefined);
            } else if (resultData.rounds === 1) {
              return Promise.resolve(loadedReareEagleResultSet);
            }
            
            let pos = 0;
            loadedReareEagleResultSet.forEach((element, index) => {
              element.items.forEach(item => {
                item.scorecard = scorecards[pos++];
                this.prepareTieArray(item, resultData.rounds);
              });
            });
            return Promise.resolve(loadedReareEagleResultSet);
          }),

          // generate eagle result set for each classification and save it
          mergeMap((reareEagleResultSet: any[]) => {

            if (reareEagleResultSet === undefined) {
              return Promise.resolve(undefined);
            }

            const eagleResultSet: EagleResultSet  = {
              items: [],
              name: resultData.name,
              rounds: resultData.rounds,
              bestOf: resultData.bestOf,
              tournamentNo: resultData.tournamentNo,
              cycle: this.cycle,
            };

            if (resultData.rounds === 1) {
              reareEagleResultSet.forEach(element => {
                  this.processSingleRoundTournament(element, eagleResultSet);           
              });
            } else {
              this.processMultiRoundTournament(eagleResultSet, reareEagleResultSet);
            }

            // create the second series for stroke play category
            this.processStrokePlaySeries(loadedStrokePlayResultSet, eagleResultSet);

            return this.cycleHttpService.addCycleTournament(eagleResultSet);
          }),
      )
    .subscribe((status: any) => {
      if (status != undefined) {
        this.alertService.success($localize`:@@cycleDetails-tourAdded:Cycle tournamnet successfully added`, false);
      } else if (resultData !== undefined) {
        this.alertService.error($localize`:@@cycleDetails-tourAddedFailure:Adding tournament to cycle failed`, false);
      }

      this.init();
    });
  }

  private processSingleRoundTournament(element: any, eagleResultSet: EagleResultSet): void {
    element.items.slice(0, this.grandPrixPoints.length).forEach((item, index) => {
      const eagleResult: EagleResult = {
        firstName: item.first_name,
        lastName: item.last_name,
        whs: item.hcp ? item.hcp : 0,
        r: [this.grandPrixPoints[index],0,0,0],
        series: 1
      };

      


      eagleResultSet.items.push(eagleResult);
    })
  }

  private processStrokePlaySeries(element: any, eagleResultSet: EagleResultSet): void {

      element.items.forEach( item => {
        
        // skip players without results
        if (item.r.reduce((a, b) => a + b) === 0) {
          return;
        }
        const eagleResult: EagleResult = {
          firstName: item.first_name,
          lastName: item.last_name,
          whs: item.hcp ? item.hcp : 0,
          r: item.r,
          series: 2
        };
        eagleResultSet.items.push(eagleResult);
      });   
  }

  private processMultiRoundTournament(eagleResultSet: EagleResultSet, reareEagleResultSet: any): void {  

    // perepare r for each player
    reareEagleResultSet.forEach(set => set.items.forEach(item => item.grandPrix= [0,0,0,0]));

    // resolve ties for the first round
    reareEagleResultSet.slice(0, 3).forEach(set => this.resolveTies(set.items, 0));

    reareEagleResultSet.forEach(set => set.items.forEach((item, index) => item.grandPrix[0]= this.grandPrixPoints[index]));

    // resolve ties for the second round

    reareEagleResultSet.slice(0, 3).forEach(set => this.resolveTies(set.items, 1));

    reareEagleResultSet.forEach(set => set.items.forEach((item, index) => item.grandPrix[1]= this.grandPrixPoints[index]));

  
    reareEagleResultSet.forEach((element) => {

      element.items.forEach((item, index) => {
        const eagleResult: EagleResult = {
          firstName: item.first_name,
          lastName: item.last_name,
          whs: item.hcp ? item.hcp : 0,
          r: item.grandPrix,
          series: 1
        };;

        if (item.grandPrix[0] !== undefined || item.grandPrix[1] !== undefined) {
          eagleResultSet.items.push(eagleResult);
        }
    
      });
    });
  }

  private prepareTieArray(item: any, round: number): void {

    item.tieArray = [round];
    for (let i = 0; i < round; i++) {
      item.tieArray[i] = [];
      // stb net
      item.tieArray[i].push(item.r[i]);
      // last round 
      item.tieArray[i].push(item.scorecard.scorecard.rounds[i].sum.strokes);
      // last 9
      item.tieArray[i].push(item.scorecard.scorecard.rounds[i].in.strokes);
      // last 6
      item.tieArray[i].push(+item.scorecard.scorecard.rounds[i].holes_in[8].strokes + 
        +item.scorecard.scorecard.rounds[i].holes_out[7].strokes + 
        +item.scorecard.scorecard.rounds[i].holes_out[6].strokes + 
        +item.scorecard.scorecard.rounds[i].holes_out[5].strokes +
        +item.scorecard.scorecard.rounds[i].holes_out[4].strokes +
        +item.scorecard.scorecard.rounds[i].holes_out[3].strokes);
      // last 3
      item.tieArray[i].push(+item.scorecard.scorecard.rounds[i].holes_in[8].strokes + 
                          +item.scorecard.scorecard.rounds[i].holes_out[7].strokes + 
                          +item.scorecard.scorecard.rounds[i].holes_out[6].strokes);
      // last 1
      item.tieArray[i].push(item.scorecard.scorecard.rounds[i].holes_in[8].strokes);  
      // lower hcp
      item.tieArray[i].push(item.hcp);
    };
  }

  private resolveTies(items: any, round: number): void {

    items.sort((a, b) => b.tieArray[round][0] - a.tieArray[round][0] || 
                         a.tieArray[round][1] - b.tieArray[round][1] ||
                         a.tieArray[round][2] - b.tieArray[round][2] ||
                         a.tieArray[round][3] - b.tieArray[round][3] ||
                         a.tieArray[round][4] - b.tieArray[round][4] ||
                         a.tieArray[round][5] - b.tieArray[round][5]);

  };
}
