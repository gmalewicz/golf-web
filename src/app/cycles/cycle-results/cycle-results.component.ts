import { CycleTournament } from './../_models/cycleTournament';
import { AuthenticationService } from '@/_services/authentication.service';
import { ChangeDetectionStrategy, Component, OnChanges, OnInit, input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Cycle } from '../_models/cycle';
import { CycleResult } from '../_models/cycleResult';
import { CycleResultsBase } from '../base/cycle-results-base';
import { RangePipe } from "../../_helpers/range";


@Component({
    selector: 'app-cycle-results',
    templateUrl: './cycle-results.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RangePipe]
})
export class CycleResultsComponent extends CycleResultsBase implements OnInit, OnChanges {
  authenticationService: AuthenticationService;
  protected readonly router: Router;


  cycle = input.required<Cycle>();
  cycleResults = input.required<CycleResult[]>();
  cycleTournaments = input.required<CycleTournament[]>();


  constructor() {
    const authenticationService = inject(AuthenticationService);
    const router = inject(Router);
 
      
    super(authenticationService, router);
  
    this.authenticationService = authenticationService;
    this.router = router;
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnChanges(): void {
    this.changes();
  }
}
