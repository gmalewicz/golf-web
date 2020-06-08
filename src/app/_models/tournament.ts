import { Round, TournamentResult } from '.';

export interface Tournament {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  rounds?: Round[];
  tournamentResults?: TournamentResult[];
}

