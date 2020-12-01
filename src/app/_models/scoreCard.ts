import { Player } from '.';

export interface ScoreCard {
  id?: number;
  hole: number;
  stroke: number;
  pats: number;
  player?: Player;
  hcp?: number;
  scoreNetto?: number;
  stbNetto?: number;
  stbBrutto?: number;
  corScoreBrutto?: number;
  penalty?: number;
}
