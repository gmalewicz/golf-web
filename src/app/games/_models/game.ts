import { Player } from '@/_models';

export interface Game {
  id?: number;
  player?: Player;
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
