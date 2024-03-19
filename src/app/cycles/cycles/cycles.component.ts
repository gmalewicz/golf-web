import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { tap } from 'rxjs/operators';
import { Cycle, CycleStatus } from '../_models/cycle';
import { CycleHttpService } from '../_services/cycleHttp.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-cycles',
    templateUrl: './cycles.component.html',
    standalone: true,
    imports: [NgIf, NgFor, RouterLink, FaIconComponent]
})

export class CyclesComponent implements OnInit {

  faSearchPlus: IconDefinition;
  cycles: Cycle[];
  display: boolean;
  statusOpen: boolean = CycleStatus.STATUS_OPEN;
  statusClose: boolean = CycleStatus.STATUS_CLOSE;


  constructor(private cycleHttpService: CycleHttpService,
              public authenticationService: AuthenticationService,
              private router: Router) {}

  ngOnInit(): void {

    this.display = false;


    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
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
