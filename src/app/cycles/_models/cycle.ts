import { Player } from '@/_models/player';

export interface Cycle {
  id?: number;
  name: string;
  status: boolean;
  rule: number;
  player?: Player;
}

export const cycleRule = {
  RULE_STANDARD: 0,
  RULE_VOLVO_2021: 1
};

export const cycleStatus = {
  STATUS_OPEN: false,
  STATUS_CLOSE: true
};
