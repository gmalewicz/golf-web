import { GameSetup } from '@/_models';
import { Injectable } from '@angular/core';

@Injectable()
export class GameSetupService {

  gameSetup: GameSetup;

  public setGameSetup(gameSetup: GameSetup) {
    this.gameSetup = gameSetup;
  }

  public getGameSetup(): GameSetup  {
    return this.gameSetup;
  }
}
