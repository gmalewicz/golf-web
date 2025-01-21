import { CycleTournament } from '../_models/cycleTournament';
import { AuthenticationService } from '@/_services/authentication.service';
import { ChangeDetectionStrategy, Component, OnChanges, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { Cycle } from '../_models/cycle';
import { CycleResult } from '../_models/cycleResult';
import { CycleResultsBase } from '../base/cycle-results-base';


@Component({
    selector: 'app-cycle-results-stroke-play',
    templateUrl: './cycle-results-stroke-play.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class CycleResultsStrokePlayComponent extends CycleResultsBase implements OnInit, OnChanges {

  cycle = input.required<Cycle>();
  cycleResults = input.required<CycleResult[]>();
  strokePlayResults = [];
  cycleTournaments = input.required<CycleTournament[]>();
  
  constructor(public authenticationService: AuthenticationService,
              protected readonly router: Router) { 
                
    super(authenticationService, router);
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnChanges(): void {
    
    this.changes();

    this.cycleResults().forEach(v => {v.played =  v.r.reduce((a, b) => a + (b > 0 ? 1 : 0), 0)});
    const bestRoundsAchieved = this.cycleResults().filter(v => v.series === 2 && v.played >= this.cycle().bestRounds);
    const bestRoundsNotAchieved = this.cycleResults().filter(v => v.series === 2 && v.played < this.cycle().bestRounds);
    
    // sort ascending using strokes bestRoundsAchieved
    bestRoundsAchieved.sort((a, b) => a.cycleResult - b.cycleResult);
    // sort descending using played rounds and ascending using strokes bestRoundsNotAchieved
    bestRoundsNotAchieved.sort((a, b) =>  b.played - a.played || a.cycleResult - b.cycleResult);

    this.strokePlayResults = bestRoundsAchieved.concat(bestRoundsNotAchieved);
  }
}
