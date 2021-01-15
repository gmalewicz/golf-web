import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesComponent } from './games/games.component';
import { HoleStakeGameComponent } from './hole-stake-game/hole-stake-game.component';
import { HoleStakeRulesComponent } from './hole-stake-rules/hole-stake-rules.component';
import { HoleStakeSetupComponent } from './hole-stake-setup/hole-stake-setup.component';
import { BbbGameRulesComponent } from './bbb-game-rules/bbb-game-rules.component';
import { BbbGameSetupComponent } from './bbb-game-setup/bbb-game-setup.component';
import { BbbGameComponent } from './bbb-game/bbb-game.component';
import { LastGamesDetailsComponent } from './last-games-details/last-games-details.component';
import { LastGamesComponent } from './last-games/last-games.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { routing } from './games.routing';
import { GameHttpService } from './_services';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientXsrfModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';

@NgModule({
  declarations: [
    GamesComponent,
    HoleStakeSetupComponent,
    HoleStakeGameComponent,
    HoleStakeRulesComponent,
    BbbGameRulesComponent,
    BbbGameSetupComponent,
    BbbGameComponent,
    LastGamesComponent,
    LastGamesDetailsComponent,
  ],
  imports: [
    // BrowserModule,
    routing,
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HttpClientModule,
    HttpClientXsrfModule
  ],
  providers: [GameHttpService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  exports: []
})
export class GamesModule { }