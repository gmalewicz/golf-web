import { CyclesComponent } from './cycles/cycles.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './cycles.routing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CycleHttpService } from './_services/cycleHttp.service';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from '@/_helpers/error.interceptor';
import { JwtInterceptor } from '@/_helpers/jwt.interceptor';
import { SessionRecoveryInterceptor } from '@/_helpers/session.interceptor';
import { AddCycleComponent } from './add-cycle/add-cycle.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule} from 'primeng/dropdown';
import { CycleDetailsComponent } from './cycle-details/cycle-details.component';
import { CycleResultsComponent } from './cycle-results/cycle-results.component';
import { CycleTournamentComponent } from './cycle-tournament/cycle-tournament.component';
import { AddTournamentDialogComponent } from './add-tournament-dialog/add-tournament-dialog.component';

@NgModule({
  declarations: [
    CyclesComponent,
    AddCycleComponent,
    CycleDetailsComponent,
    CycleResultsComponent,
    CycleTournamentComponent,
    AddTournamentDialogComponent
  ],
  imports: [
    routing,
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    DropdownModule,
    HttpClientModule,
    HttpClientXsrfModule
  ],
  providers: [CycleHttpService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SessionRecoveryInterceptor, multi: true },
  ],
})
export class CyclesModule { }
