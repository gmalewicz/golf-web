import { Course } from './course';
import { Player } from './player';
import { ScoreCard } from './scoreCard';


export interface Round {
  id?: number;
  course: Course;
  roundDate: string;
  player?: Player[];
  scoreCard?: ScoreCard[];
  format: number;
  mpFormat?: number;
  teeId?: number;
}
