import { Course, Player, Tee } from '.';


export interface OnlineRound {
  id?: number;
  course?: Course;
  teeTime?: string;
  player?: Player;
  tee?: Tee;
}
