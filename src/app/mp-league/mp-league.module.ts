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
import { LeagueComponent } from './league/league.component';
import { LeaguePlayerComponent } from './league-player/league-player.component';
import { NavigationService } from './_services/navigation.service';



@NgModule({
  declarations: [
    MpLeaguesComponent,
    AddLeagueComponent,
    LeagueComponent,
    LeaguePlayerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    routing,
  ],
  providers: [LeagueHttpService,
              NavigationService,
              { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
              { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
              { provide: HTTP_INTERCEPTORS, useClass: SessionRecoveryInterceptor, multi: true },
  ],
})
export class MpLeagueModule { }
