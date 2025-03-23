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
  bestRounds?: number;
  status?: boolean,
  playHcpMultiplayer?: number,
  maxPlayHcp?: number
  canUpdateHcp?: boolean
}

export const TournamentStatus = {
  STATUS_OPEN: false,
  STATUS_CLOSE: true
};
