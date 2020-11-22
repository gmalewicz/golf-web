import { ModuleWithProviders } from '@angular/core';
import { AuthGuard } from '@/_helpers';

import { Routes, RouterModule } from '@angular/router';
import { BbbGameRulesComponent } from './bbb-game-rules/bbb-game-rules.component';
import { BbbGameSetupComponent } from './bbb-game-setup/bbb-game-setup.component';
import { BbbGameComponent } from './bbb-game/bbb-game.component';

import { GamesComponent } from './games/games.component';
import { HoleStakeGameComponent } from './hole-stake-game/hole-stake-game.component';
import { HoleStakeRulesComponent } from './hole-stake-rules/hole-stake-rules.component';
import { HoleStakeSetupComponent } from './hole-stake-setup/hole-stake-setup.component';
import { LastGamesDetailsComponent } from './last-games-details/last-games-details.component';
import { LastGamesComponent } from './last-games/last-games.component';
import { GamesModule } from './games.module';

export const routs: Routes = [

  { path: '', component: GamesComponent, canActivate: [AuthGuard] },
  { path: 'games', component: GamesComponent, canActivate: [AuthGuard] },
  { path: 'holeStakeSetup', component: HoleStakeSetupComponent, canActivate: [AuthGuard] },
  { path: 'holeStakeRules', component: HoleStakeRulesComponent, canActivate: [AuthGuard]},
  { path: 'holeStakeGame', component: HoleStakeGameComponent, canActivate: [AuthGuard] },
  { path: 'bbbRules', component: BbbGameRulesComponent, canActivate: [AuthGuard] },
  { path: 'bbbSetup', component: BbbGameSetupComponent, canActivate: [AuthGuard] },
  { path: 'bbbGame', component: BbbGameComponent, canActivate: [AuthGuard] },
  { path: 'lastGames', component: LastGamesComponent, canActivate: [AuthGuard] },
  { path: 'lastGamesDetails', component: LastGamesDetailsComponent, canActivate: [AuthGuard] },
];

export const routing: ModuleWithProviders<GamesModule> = RouterModule.forChild(routs);

