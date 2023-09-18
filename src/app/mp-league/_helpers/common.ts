import { LeagueMatch } from "../_models/leagueMatch";
import { Result } from "../_models/result";
import { WritableSignal } from '@angular/core';

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





export function getDateAndTime(): string[] {

  // construct default teetime and tee date to be automatically assign for the round
  const dateTime = new Date();
  const teeTime = dateTime.toISOString().substring(11, 16);
  const teeDate = dateTime.toISOString().substring(0, 10).replace(/-/gi, '/');
  return [teeDate, teeTime];
}


