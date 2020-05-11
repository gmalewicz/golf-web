import { Player } from '.';

export interface ScoreCard {
  id?: number;
  hole: number;
  stroke: number;
  pats: number;
  player?: Player;
}
