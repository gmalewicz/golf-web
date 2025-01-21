import { AuthenticationService } from '@/_services/authentication.service';
import { Router } from '@angular/router';
import { CycleTournament } from '../_models/cycleTournament';
import { InputSignal } from '@angular/core';

export abstract class CycleResultsBase {

  protected cycleTournaments: InputSignal<CycleTournament[]>;

  display: boolean;
  rounds: number[];
  names: number[];

  constructor(public authenticationService: AuthenticationService,
              protected readonly router: Router) { }

  protected init(): void {
    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.display = true;
    }
  }

  protected changes(): void {
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
  }


  // helper function to provide verious arrays for html
  counter(i: number) {
    return [...Array(i).keys()];
  }
}
