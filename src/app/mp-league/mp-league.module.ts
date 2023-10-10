import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MpLeaguesComponent } from './mp-leagues/mp-leagues.component';
import { routing } from './mp-league.routing';
import { LeagueHttpService } from './_services/leagueHttp.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddLeagueComponent } from './add-league/add-league.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LeagueComponent } from './league/league.component';
import { NavigationService } from './_services/navigation.service';
import { AddMatchComponent } from './add-match/add-match.component';
import { DropdownModule } from 'primeng/dropdown';
import { RemoveMatchComponent } from './remove-match/remove-match.component';



@NgModule({
  declarations: [
    MpLeaguesComponent,
    AddLeagueComponent,
    LeagueComponent,
    AddMatchComponent,
    RemoveMatchComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    DropdownModule,
    routing,
  ],
  providers: [LeagueHttpService,
              NavigationService,

  ],
})
export class MpLeagueModule { }
