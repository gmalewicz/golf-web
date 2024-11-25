import { CycleTournament } from './../_models/cycleTournament';
import { AuthenticationService } from '@/_services/authentication.service';
import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { Cycle } from '../_models/cycle';
import { CycleResult } from '../_models/cycleResult';


@Component({
    selector: 'app-cycle-results',
    templateUrl: './cycle-results.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class CycleResultsComponent implements OnInit {


  cycle = input.required<Cycle>();
  cycleResults = input.required<CycleResult[]>();
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
      this.display = true;
    }
  }

  // helper function to provide verious arrays for html
  counter(i: number) {
    return [...Array(i).keys()];
  }
}
