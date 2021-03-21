import { Course, Player, ScoreCard } from '.';


export interface Round {
  id?: number;
  course: Course;
  roundDate: string;
  player?: Player[];
  scoreCard?: ScoreCard[];
  matchPlay: boolean;
  mpFormat?: number;
}
