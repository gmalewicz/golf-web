import { DisplayMatch } from './../_models/displayMatch';
import { LeagueMatch } from "../_models/leagueMatch";
import { Result } from "../_models/result";
import { WritableSignal } from '@angular/core';
import { LeaguePlayer } from '../_models/leaguePlayer';

export function  generateResults(matches: LeagueMatch[], results: WritableSignal<Result[]>) {
  matches.forEach(match => {

    // only for matches that have a winner
    if (match.result !== "A/S") {

      // find the small points
      // take the first chaaracter
      let smallPoints = match.result.charAt(0);
      // append the second charatcer if it is "0"
      if (match.result.charAt(1) === "0") {
        smallPoints = smallPoints.concat("0");
      }

      const resultIdx: number = results().findIndex(result => result.id === match.winnerId);

      // create result record if not already exist
      if (resultIdx === -1) {
        const newResult: Result = {
          id: match.winnerId,
          nick: match.winnerNick,
          big: 1,
          small: +smallPoints,
          matchesPlayed: 1
        }
        results.mutate(results => results.push(newResult));
        // otherwise update existing results record
      } else {
        results.mutate(results => {
          results[resultIdx].big++;
          results[resultIdx].small += +smallPoints;
          results[resultIdx].matchesPlayed++;
        });
      }

      // eventually sort results
      results.mutate(results => results.sort((a, b) => b.big - a.big || b.small - a.small));
    }
  });
}

export function generateDisplayResults(matches: LeagueMatch[], players: LeaguePlayer[]): DisplayMatch[][] {

  // initialize winner display array
  const displayMatches: DisplayMatch[][] =
    new Array(players.length).fill({result: "", winner: false}).map(() => new Array(players.length).fill({result: "", winner: false}));

  // generate map of idexes
  const playerMap = new Map<number, number>();
  players.forEach((player, idx) => playerMap.set(player.playerId, idx));

  // player array must be sorted!
  matches.forEach(match => {
    displayMatches[playerMap.get(match.winnerId)][playerMap.get(match.looserId)] = {result: match.result, winner: false};
    displayMatches[playerMap.get(match.looserId)][playerMap.get(match.winnerId)] = {result: match.result, winner: true};
  });
  return displayMatches;
}


