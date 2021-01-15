
import { Player } from '@/_models';

export interface OnlineScoreCard {
  id?: number;
  hole: number;
  stroke: number;
  player: Player;
  orId: number;
  update?: boolean;
  putt: number;
  penalty: number;
  mpResult?: number;
}
