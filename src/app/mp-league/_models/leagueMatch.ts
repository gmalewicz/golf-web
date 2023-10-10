import { League } from "./league";

export interface LeagueMatch {
  id?: number;
  winnerId: number;
  winnerNick?: string;
  looserId: number;
  looserNick?: string;
  league: League;
  result: string;
}
