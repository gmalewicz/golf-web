import { NgModule } from '@angular/core';
import { GamesComponent } from './games/games.component';
import { HoleStakeRulesComponent } from './hole-stake-rules/hole-stake-rules.component';
import { BbbGameRulesComponent } from './bbb-game-rules/bbb-game-rules.component';
import { LastGamesDetailsComponent } from './last-games-details/last-games-details.component';
import { LastGamesComponent } from './last-games/last-games.component';
import { ReactiveFormsModule } from '@angular/forms';
import { routing } from './games.routing';
import { GameHttpService } from './_services';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { CommonModule } from '@angular/common';
import { GameSetupComponent } from './game-setup/game-setup.component';
import { BingoHolestakeGamesComponent } from './bingo-holestake-games/bingo-holestake-games.component';
import { IconsModule } from './_helpers/icons.module';
import { SessionRecoveryInterceptor } from '@/_helpers/session.interceptor';

@NgModule({
  declarations: [
    GamesComponent,
    HoleStakeRulesComponent,
    BbbGameRulesComponent,
    LastGamesComponent,
    LastGamesDetailsComponent,
    GameSetupComponent,
    BingoHolestakeGamesComponent
  ],
  imports: [
    routing,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientXsrfModule,
    IconsModule
  ],
  providers: [GameHttpService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SessionRecoveryInterceptor, multi: true },
  ],
  exports: []
})
export class GamesModule {
}
