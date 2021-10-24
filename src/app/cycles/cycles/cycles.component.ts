import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons/faSearchPlus';
import { tap } from 'rxjs/operators';
import { Cycle, cycleStatus } from '../_models/cycle';
import { CycleHttpService } from '../_services/cycleHttp.service';

@Component({
  selector: 'app-cycles',
  templateUrl: './cycles.component.html'
})

export class CyclesComponent implements OnInit {

  faSearchPlus: IconDefinition;
  cycles: Cycle[];
  display: boolean;
  statusOpen: boolean = cycleStatus.STATUS_OPEN;
  statusClose: boolean = cycleStatus.STATUS_CLOSE;


  constructor(private cycleHttpService: CycleHttpService,
              public authenticationService: AuthenticationService,
              private router: Router) {}

  ngOnInit(): void {

    this.display = false;


    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {
      this.faSearchPlus = faSearchPlus;
      this.cycleHttpService.getCycles().pipe(
        tap (
          (retCycles: Cycle[]) => {
            this.cycles = retCycles;
            this.display = true;
        })
      ).subscribe();
    }
  }

}
