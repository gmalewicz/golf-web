import { Data } from '@angular/router';
import { Player } from '.';

export interface Game {
  player: Player;
  gameId: number;
  stake: number;
  gameDate: string;
  gameData: GameData;
}

export interface GameData {
  playerNicks: string[];
  score: number[];
  gameResult: number[][];
}

export interface GameSendData {
  gameId: number;
  email: string;
}
