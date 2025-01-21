import { CycleTournament } from './../_models/cycleTournament';
import { AuthenticationService } from '@/_services/authentication.service';
import { ChangeDetectionStrategy, Component, OnChanges, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { Cycle } from '../_models/cycle';
import { CycleResult } from '../_models/cycleResult';
import { CycleResultsBase } from '../base/cycle-results-base';


@Component({
    selector: 'app-cycle-results',
    templateUrl: './cycle-results.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class CycleResultsComponent extends CycleResultsBase implements OnInit, OnChanges {

  cycle = input.required<Cycle>();
  cycleResults = input.required<CycleResult[]>();
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
  }
}
