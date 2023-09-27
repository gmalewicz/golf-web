import { WritableSignal } from '@angular/core';
import { DisplayMatch } from './../_models/displayMatch';
import { LeagueMatch } from "../_models/leagueMatch";
import { Result } from "../_models/result";
import { LeaguePlayer } from '../_models/leaguePlayer';

export function generateResults(matches: WritableSignal<LeagueMatch[]>, players: WritableSignal<LeaguePlayer[]> ) : Result[] {

  const results: Result[] = [];

  // generate map of idexes
  const playerMap = new Map<number, number>();

  // create list of results
  players().forEach((player, idx) => {
    const result: Result = {
      id: player.playerId,
      nick: player.nick,
      big: 0,
      small: 0,
      matchesPlayed: 0
    }
    playerMap.set(player.playerId, idx);
    results.push(result);
  });

  // update results
  matches().forEach(match => {

    //create small points for a winner
    // take the first chaaracter
    let smallPoints = match.result.charAt(0);
    // append the second charatcer if it is "0"
    if (match.result.charAt(1) === "0") {
      smallPoints = smallPoints.concat("0");
    }

    // increase played matches counters
    results[playerMap.get(match.winnerId)].matchesPlayed += 1;
    results[playerMap.get(match.looserId)].matchesPlayed += 1;


    //handle other results that A/S
    if (match.result !== 'A/S') {
      results[playerMap.get(match.winnerId)].big++;
      results[playerMap.get(match.winnerId)].small += +smallPoints;
    }
  });

  // eventually sort results
  results.sort((a, b) => b.big - a.big || b.small - a.small);
  return results;
}

export function generateDisplayResults(matches: WritableSignal<LeagueMatch[]>, players: WritableSignal<LeaguePlayer[]>): DisplayMatch[][] {

  // initialize winner display array
  const displayMatches: DisplayMatch[][] =
    new Array(players().length).fill({result: "", winner: false}).map(() => new Array(players().length).fill({result: "", winner: false}));

  // generate map of idexes
  const playerMap = new Map<number, number>();
  players().forEach((player, idx) => playerMap.set(player.playerId, idx));

  // player array must be sorted!
  matches().forEach(match => {
    displayMatches[playerMap.get(match.winnerId)][playerMap.get(match.looserId)] = {result: match.result, winner: false};
    displayMatches[playerMap.get(match.looserId)][playerMap.get(match.winnerId)] = {result: match.result, winner: true};
  });

  return displayMatches;
}


