import { WritableSignal } from '@angular/core';
import { DisplayMatch } from './../_models/displayMatch';
import { LeagueMatch } from "../_models/leagueMatch";
import { Result } from "../_models/result";
import { LeaguePlayer } from '../_models/leaguePlayer';

export function generateResults(matches: WritableSignal<LeagueMatch[]>) : Result[] {

  let modifiedResults: Result[] = [];

  matches().forEach(match => {

    // find the small points
    // take the first chaaracter
    let smallPoints = match.result.charAt(0);
    // append the second charatcer if it is "0"
    if (match.result.charAt(1) === "0") {
      smallPoints = smallPoints.concat("0");
    }

    const newResults: Result[] = [];

    // create winner record record if not already exist
    const winnerResultIdx: number = modifiedResults.findIndex(result => result.id === match.winnerId);


    if (winnerResultIdx === -1) {
      const newWinnerResult: Result = {
        id: match.winnerId,
        nick: match.winnerNick,
        big: 1,
        small: +smallPoints,
        matchesPlayed: 1
      }

      // clear winner statistics if it was a tie
      if (match.result === 'A/S') {
        newWinnerResult.big = 0;
        newWinnerResult.small = 0;
      }
      newResults.push(newWinnerResult);
    }

    // create looser record record if not already exist
    const looserResultIdx: number = modifiedResults.findIndex(result => result.id === match.looserId);

    if (looserResultIdx === -1) {
      const newLooserResult: Result = {
        id: match.looserId,
        nick: match.looserNick,
        big: 0,
        small: 0,
        matchesPlayed: 1
      }
      newResults.push(newLooserResult);
    }

    // mutate results signal if array not ampty - add new elements
    if (newResults.length > 0) {
      modifiedResults = modifiedResults.concat(newResults);
    }

    // return when it was the first record for the winner
    if (winnerResultIdx === -1) {

      // if looser record exists update match counter
      if (looserResultIdx !== -1) {
        modifiedResults[looserResultIdx].matchesPlayed += 1;
      }
      return;
    }

    // if it is not tie update winner statistic otherwise update played matches only
    if (match.result !== 'A/S') {
      // update existing winner results record
      modifiedResults[winnerResultIdx].big++;
      modifiedResults[winnerResultIdx].small += +smallPoints;
      modifiedResults[winnerResultIdx].matchesPlayed += 1;
    } else {
      modifiedResults[winnerResultIdx].matchesPlayed += 1;
    }
  });
  // eventually sort results
  modifiedResults.sort((a, b) => b.big - a.big || b.small - a.small);
  return modifiedResults;
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


