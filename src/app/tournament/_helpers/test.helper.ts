import { TournamentPlayer } from '../_models/tournamentPlayer';
import { TournamentResult } from '../_models/tournamentResult';

export function getTournamentResult(): TournamentResult {
  return {
    id: 1,
    playedRounds: 1,
    player: {id: 1},
    strokesBrutto: 1,
    strokesNetto: 1,
    stbNet: 1,
    stbGross: 1,
    strokeRounds: 1
  };
}

export function getTournamentResult2(): TournamentResult {
  return {
    id: 2,
    playedRounds: 1,
    player: {id: 1},
    strokesBrutto: 2,
    strokesNetto: 2,
    stbNet: 2,
    stbGross: 2,
    strokeRounds: 1
  };
}

export function getTournamentPlayer(): TournamentPlayer {
  return {
    id: 1,
    playerId: 1,
    nick: 'test',
    whs: 10.0,
    tournamentId: 1
  };
}
