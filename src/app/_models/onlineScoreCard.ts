import { Player } from '.';
import { OnlineRound } from './onlineRound';

export interface OnlineScoreCard {
  id?: number;
  hole: number;
  stroke: number;
  player: Player;
  onlineRoundId: number;
  update?: boolean;
}
