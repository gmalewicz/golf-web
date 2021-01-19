import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesComponent } from './games/games.component';
import { HoleStakeRulesComponent } from './hole-stake-rules/hole-stake-rules.component';
import { BbbGameRulesComponent } from './bbb-game-rules/bbb-game-rules.component';
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
import { GameSetupComponent } from './game-setup/game-setup.component';
import { BingoHolestakeGamesComponent } from './bingo-holestake-games/bingo-holestake-games.component';


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
