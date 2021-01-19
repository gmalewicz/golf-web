import { ModuleWithProviders } from '@angular/core';
import { AuthGuard } from '@/_helpers';
import { Routes, RouterModule } from '@angular/router';
import { BbbGameRulesComponent } from './bbb-game-rules/bbb-game-rules.component';
import { GamesComponent } from './games/games.component';
import { HoleStakeRulesComponent } from './hole-stake-rules/hole-stake-rules.component';
import { LastGamesDetailsComponent } from './last-games-details/last-games-details.component';
import { LastGamesComponent } from './last-games/last-games.component';
import { GamesModule } from './games.module';
import { GameSetupComponent } from './game-setup/game-setup.component';
import { BingoHolestakeGamesComponent } from './bingo-holestake-games/bingo-holestake-games.component';


export const routs: Routes = [

  { path: '', component: GamesComponent, canActivate: [AuthGuard] },
  { path: 'games', component: GamesComponent, canActivate: [AuthGuard] },
  { path: 'holeStakeRules', component: HoleStakeRulesComponent, canActivate: [AuthGuard]},
  { path: 'bbbRules', component: BbbGameRulesComponent, canActivate: [AuthGuard] },
  { path: 'bingoHolestakeGames', component:  BingoHolestakeGamesComponent, canActivate: [AuthGuard] },
  { path: 'lastGames', component: LastGamesComponent, canActivate: [AuthGuard] },
  { path: 'gameSetup', component: GameSetupComponent, canActivate: [AuthGuard] },
  { path: 'lastGamesDetails', component: LastGamesDetailsComponent, canActivate: [AuthGuard] },
];

export const routing: ModuleWithProviders<GamesModule> = RouterModule.forChild(routs);

