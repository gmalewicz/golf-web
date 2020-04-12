import { Player } from '.';

export interface ScoreCard {
  hole: number;
  stroke: number;
  pats: number;
  player?: Player;
}
