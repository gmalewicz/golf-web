import { Cycle } from './cycle';

export interface CycleTournament {
  id?: number;
  cycle?: Cycle;
  name: string;
  rounds: number;
  bestOf: boolean;
}
