import { Player } from '@/_models/player';

export interface Cycle {
  id?: number;
  name: string;
  status: boolean;
  player?: Player;
  // 0 - all rounds are applicable
  // if not 0: number of best rounds from cycle to be included in the result
  bestRounds: number;
  maxWhs: number;
  // 0 - cycle rules up to 2024, 
  // 1 - cycle from 2025
  version: number;
  series: number;
}

export const CycleStatus = {
  STATUS_OPEN: false,
  STATUS_CLOSE: true
};