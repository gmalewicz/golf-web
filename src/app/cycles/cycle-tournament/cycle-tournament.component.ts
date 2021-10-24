import { AuthenticationService } from '@/_services/authentication.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/internal/operators/tap';
import { Cycle } from '../_models/cycle';
import { CycleTournament } from '../_models/cycleTournament';
import { CycleHttpService } from '../_services/cycleHttp.service';

@Component({
  selector: 'app-cycle-tournament',
  templateUrl: './cycle-tournament.component.html'
})
export class CycleTournamentComponent implements OnInit {

  @Input() cycle: Cycle;
  cycleTournaments: CycleTournament[];
  display: boolean;

  constructor(public authenticationService: AuthenticationService,
              private router: Router,
              private cycleHttpService: CycleHttpService) { }

  ngOnInit(): void {
    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {

      this.cycleHttpService.getCycleTournaments(this.cycle.id).pipe(
        tap (
          (retCycleTournaments: CycleTournament[]) => {
            this.cycleTournaments = retCycleTournaments;
            this.display = true;
        })
      ).subscribe();
    }
  }

}
