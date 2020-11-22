import { ModuleWithProviders } from '@angular/core';
import { AuthGuard } from '@/_helpers';

import { Routes, RouterModule } from '@angular/router';
import { OnlineScoreCardComponent } from './online-score-card/online-score-card.component';
import { ScorecardModule } from './scorecard.module';
import { OnlineRoundDefComponent } from './online-round-def/online-round-def.component';
import { OnlineRoundComponent } from './online-round/online-round.component';
import { OnlineScoreCardViewComponent } from './online-score-card-view/online-score-card-view.component';

export const routs: Routes = [

  { path: '', component: OnlineScoreCardComponent, canActivate: [AuthGuard] },
  { path: 'onlineScoreCard', component: OnlineScoreCardComponent, canActivate: [AuthGuard] },
  { path: 'onlineRound', component: OnlineRoundComponent, canActivate: [AuthGuard] },
  { path: 'onlineScoreCardView', component: OnlineScoreCardViewComponent, canActivate: [AuthGuard] },
  { path: 'onlineRoundDef', component: OnlineRoundDefComponent, canActivate: [AuthGuard] },

];
export const routing: ModuleWithProviders<ScorecardModule> = RouterModule.forChild(routs);

