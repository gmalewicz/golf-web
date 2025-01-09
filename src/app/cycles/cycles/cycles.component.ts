import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, Routes } from '@angular/router';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { tap } from 'rxjs/operators';
import { Cycle, CycleStatus } from '../_models/cycle';
import { CycleHttpService } from '../_services/cycleHttp.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AuthGuard } from '@/_helpers/auth.guard';
import { AddCycleComponent } from '../add-cycle/add-cycle.component';
import { CycleDetailsComponent } from '../cycle-details/cycle-details.component';
import { CycleDetails2025Component } from '../cycle-details-2025/cycle-details-2025.component';


@Component({
    selector: 'app-cycles',
    templateUrl: './cycles.component.html',
    imports: [RouterLink, FaIconComponent],
    providers: [CycleHttpService]
})

export class CyclesComponent implements OnInit {

  faSearchPlus: IconDefinition;
  cycles: Cycle[];
  display: boolean;
  statusOpen: boolean = CycleStatus.STATUS_OPEN;
  statusClose: boolean = CycleStatus.STATUS_CLOSE;


  constructor(private readonly cycleHttpService: CycleHttpService,
              public authenticationService: AuthenticationService,
              private readonly router: Router) {}

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

export const cyclesRoutes: Routes = [

  { path: '', component: CyclesComponent, canActivate: [AuthGuard] },
  { path: 'addCycle', component: AddCycleComponent, canActivate: [AuthGuard] },
  { path: 'cycleDetails', component: CycleDetailsComponent, canActivate: [AuthGuard] },
  { path: 'cycleDetails2025', component: CycleDetails2025Component, canActivate: [AuthGuard] },
];
