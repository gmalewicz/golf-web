import { CycleTournament } from './../_models/cycleTournament';
import { AuthenticationService } from '@/_services/authentication.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cycle } from '../_models/cycle';
import { CycleResult } from '../_models/cycleResult';

@Component({
  selector: 'app-cycle-results',
  templateUrl: './cycle-results.component.html',
  styleUrls: ['./cycle-results.component.css']
})
export class CycleResultsComponent implements OnInit {

  @Input() cycle: Cycle;
  @Input() cycleResults: CycleResult[];
  @Input() cycleTournaments: CycleTournament[];
  display: boolean;
  rounds: number[];

  constructor(public authenticationService: AuthenticationService,
              private router: Router) { }

  ngOnInit(): void {
    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {

      this.rounds = [];
      if (this.cycleTournaments.length > 0) {

        let offset = 0;
        this.cycleTournaments.map(v => v.rounds).forEach(n => {

          for (let i = 0; i < n; i++) {
            this.rounds.push(offset + i);
          }
          offset += 4;
        });

      }
      console.log(this.rounds);
      this.display = true;
    }
  }

  // helper function to provide verious arrays for html
  counter(i: number) {
    return new Array(i);
  }
}
