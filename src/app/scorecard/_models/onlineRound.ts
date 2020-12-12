import { Course, Player, Tee } from '@/_models';
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
  owner?: number;
  finalized?: boolean;
  putts: boolean;
  penalties: boolean;
  matchPlay: boolean;
  courseHCP?: number;
}
