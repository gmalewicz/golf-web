export interface LeagueMatch {
  id?: number;
  winnerId: number;
  winnerNick?: string;
  looserId: string;
  looserNick?: string;
  leagueId: number;
  result: string;
}
