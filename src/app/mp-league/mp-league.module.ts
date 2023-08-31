import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MpLeaguesComponent } from './mp-leagues/mp-leagues.component';
import { routing } from './mp-league.routing';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { SessionRecoveryInterceptor } from '@/_helpers/session.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LeagueHttpService } from './_services/leagueHttp.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddLeagueComponent } from './add-league/add-league.component';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MpLeaguesComponent,
    AddLeagueComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    routing,
  ],
  providers: [LeagueHttpService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SessionRecoveryInterceptor, multi: true },
  ],
})
export class MpLeagueModule { }
