import { ModuleWithProviders } from '@angular/core';
import { AuthGuard } from '@/_helpers';
import { Routes, RouterModule } from '@angular/router';
import { MpLeaguesComponent } from './mp-leagues/mp-leagues.component';
import { MpLeagueModule } from './mp-league.module';
import { AddLeagueComponent } from './add-league/add-league.component';
import { LeagueComponent } from './league/league.component';
import { LeaguePlayerComponent } from './league-player/league-player.component';

export const routs: Routes = [

  { path: '', component: MpLeaguesComponent, canActivate: [AuthGuard] },
  { path: 'addLeague', component: AddLeagueComponent, canActivate: [AuthGuard] },
  { path: 'league', component: LeagueComponent, canActivate: [AuthGuard] },
  { path: 'playerLeague', component: LeaguePlayerComponent, canActivate: [AuthGuard] },
];

export const routing: ModuleWithProviders<MpLeagueModule> = RouterModule.forChild(routs);

