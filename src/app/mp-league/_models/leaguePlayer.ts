import { League } from "./league";

export interface LeaguePlayer {
  id?: number;
  playerId: number;
  nick: string;
  league: League;
}
