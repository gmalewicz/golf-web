import { Player } from '@/_models/player';

export interface League {
  id?: number;
  name: string;
  status: boolean;
  player?: Player;
}

export const LeagueStatus = {
  STATUS_OPEN: false,
  STATUS_CLOSE: true
};
