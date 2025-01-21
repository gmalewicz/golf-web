import { CycleTournament } from '../_models/cycleTournament';
import { AuthenticationService } from '@/_services/authentication.service';
import { ChangeDetectionStrategy, Component, OnChanges, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { Cycle } from '../_models/cycle';
import { CycleResult } from '../_models/cycleResult';


@Component({
    selector: 'app-cycle-results-stroke-play',
    templateUrl: './cycle-results-stroke-play.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class CycleResultsStrokePlayComponent implements OnInit, OnChanges {

  cycle = input.required<Cycle>();
  cycleResults = input.required<CycleResult[]>();
  strokePlayResults = [];
  cycleTournaments = input.required<CycleTournament[]>();
  display: boolean;
  rounds: number[];
  names: number[];

  constructor(public authenticationService: AuthenticationService,
              private readonly router: Router) { }

  ngOnInit(): void {
    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      
      this.display = true;
    }
  }

  ngOnChanges(): void {
    this.rounds = [];
    this.names = [];
    if (this.cycleTournaments().length > 0) {

      let offset = 0;
      this.cycleTournaments().map(v => v.rounds).forEach((n, idx) => {

        for (let i = 0; i < n; i++) {
          this.rounds.push(offset + i);
          this.names.push(idx);
        }
        offset += 4;
      });
    }

    
    this.cycleResults().forEach(v => {v.played =  v.r.reduce((a, b) => a + (b > 0 ? 1 : 0), 0)});
    const bestRoundsAchieved = this.cycleResults().filter(v => v.series === 2 && v.played >= this.cycle().bestRounds);
    const bestRoundsNotAchieved = this.cycleResults().filter(v => v.series === 2 && v.played < this.cycle().bestRounds);
    
    // sort ascending using strokes bestRoundsAchieved
    bestRoundsAchieved.sort((a, b) => a.cycleResult - b.cycleResult);
    // sort descending using played rounds and ascending using strokes bestRoundsNotAchieved
    bestRoundsNotAchieved.sort((a, b) =>  b.played - a.played || a.cycleResult - b.cycleResult);

    this.strokePlayResults = bestRoundsAchieved.concat(bestRoundsNotAchieved);
  }


  // helper function to provide verious arrays for html
  counter(i: number) {
    return [...Array(i).keys()];
  }
}
