import { Player } from '@/_models';
import { Tournament } from '.';


export interface TournamentResult {
  id?: number;
  playedRounds: number;
  player?: Player;
  strokesBrutto: number;
  strokesNetto: number;
  tournament?: Tournament;
  stbNet: number;
  stbGross: number;
}

