import { GameSetup, Game } from '@/_models';
import { Injectable } from '@angular/core';

@Injectable()
export class GameService {

  gameSetup: GameSetup;
  game: Game;

  public setGameSetup(gameSetup: GameSetup) {
    this.gameSetup = gameSetup;
  }

  public getGameSetup(): GameSetup  {
    return this.gameSetup;
  }

  public setGame(game: Game) {
    this.game = game;
  }

  public getGame(): Game  {
    return this.game;
  }
}
