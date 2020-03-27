import { Course, Player, ScoreCard } from '.';


export interface Round {
  id?: number;
  course: Course;
  roundDate: Date;
  teeTime: Date;
  player?: Player[];
  scoreCard?: ScoreCard[];
}
