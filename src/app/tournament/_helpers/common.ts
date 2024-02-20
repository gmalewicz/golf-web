import { TournamentPlayer } from './../_models/tournamentPlayer';
import { TeeTimeParameters } from './../_models/teeTimeParameters';
import { TeeTime } from "../_models/teeTime";
import { WritableSignal } from '@angular/core';

export function generateTeeTimes(teeTimeParameters: WritableSignal<TeeTimeParameters>,
                                 tournamentPlayers: WritableSignal<TournamentPlayer[]>): TeeTime[] {

  if (teeTimeParameters() != undefined && tournamentPlayers() != undefined) {

    const teeTimes: TeeTime[] = [];

    const mixedTournamentPlayers = shuffle([...tournamentPlayers()]);

    const startMinute = teeTimeParameters().firstTeeTime.substring(3,5);
    const startHour = teeTimeParameters().firstTeeTime.substring(0,2);

    let currentIdx = 0;
    while (mixedTournamentPlayers.length > currentIdx) {

      const teeTimeDelta = Math.floor(currentIdx / teeTimeParameters().flightSize);
      const minutesDelta = (+startMinute + (teeTimeDelta * teeTimeParameters().teeTimeStep)) %60;
      const hourDelta = +startHour + Math.floor((+startMinute + (teeTimeDelta * teeTimeParameters().teeTimeStep)) / 60);

      teeTimes.push({
        nick: mixedTournamentPlayers[currentIdx].nick,
        hcp: mixedTournamentPlayers[currentIdx].whs,
        flight: Math.abs(currentIdx / teeTimeParameters().flightSize) + 1,
        time: hourDelta + ":" + ("0" + minutesDelta).slice(-2)
      })

      currentIdx++;
    }

    return teeTimes;

  }

  return undefined;
}

function shuffle<T>(array: T[]): T[] {

  let currentIndex = array.length, randomIndex: number;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

