import { AuthenticationService } from '@/_services/authentication.service';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cycle } from '../_models/cycle';
import { CycleTournament } from '../_models/cycleTournament';

@Component({
  selector: 'app-cycle-tournament',
  templateUrl: './cycle-tournament.component.html'
})
export class CycleTournamentComponent implements OnInit {

  @Input() cycle: Cycle;
  @Input() cycleTournaments: CycleTournament[];
  display: boolean;

  constructor(public authenticationService: AuthenticationService,
              private router: Router) { }

  ngOnInit(): void {
    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {
      this.display = true;
    }
  }
}
