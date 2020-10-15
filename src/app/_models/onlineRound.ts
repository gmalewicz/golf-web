import { Course, Player, Tee } from '.';
import { OnlineScoreCard } from './onlineScoreCard';


export interface OnlineRound {
  id?: number;
  course?: Course;
  teeTime?: string;
  player?: Player;
  tee?: Tee;
  scoreCardAPI?: OnlineScoreCard[];
  first9score?: number;
  last9score?: number;
}
