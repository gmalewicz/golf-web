import { Player, Round } from '@/_models';
import { TournamentResult } from '.';

export interface Tournament {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  player?: Player;
  rounds?: Round[];
  tournamentResults?: TournamentResult[];
}

