import { AuthenticationService } from '@/_services/authentication.service';
import { ChangeDetectionStrategy, Component, OnInit, input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Cycle } from '../_models/cycle';
import { CycleTournament } from '../_models/cycleTournament';

@Component({
    selector: 'app-cycle-tournament',
    templateUrl: './cycle-tournament.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CycleTournamentComponent implements OnInit {
  authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);


  cycle = input.required<Cycle>();
  cycleTournaments = input.required<CycleTournament[]>();
  display: boolean;

  ngOnInit(): void {
    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.display = true;
    }
  }
}
