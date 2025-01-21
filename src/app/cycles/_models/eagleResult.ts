import { Cycle } from './cycle';

export interface EagleResult {
  firstName: string;
  lastName: string;
  whs: number;
  r: number[];
  series: number;
}

export interface EagleResultSet {
  items: EagleResult[];
  name: string;
  rounds: number;
  bestOf: boolean;
  tournamentNo: number;
  cycle: Cycle;
}
