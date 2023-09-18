export interface LeagueMatch {
  id?: number;
  winnerId: number;
  winnerNick?: string;
  looserId: number;
  looserNick?: string;
  leagueId: number;
  result: string;
}
