import { TeeTimeModification } from './../_models/teeTimeModification';
import { TournamentPlayer } from './../_models/tournamentPlayer';
import { FlightAssignmentMode, TeeTimeParameters } from './../_models/teeTimeParameters';
import { TeeTime } from "../_models/teeTime";
import { TournamentResult } from '../_models/tournamentResult';

export function updateTeeTimes(teeTimeParameters: TeeTimeParameters,
                               tournamentPlayers: TournamentPlayer[],
                               tournamentResults: TournamentResult[],
                               teeTimeModification: TeeTimeModification,
                               modification: boolean,
                               loadTeeTimesFlag: boolean): TeeTime[] {

  if (loadTeeTimesFlag) {
    return teeTimeParameters.teeTimes
  } else if (modification) {
    return modifyTeeTimes(teeTimeModification, teeTimeParameters.teeTimes);
  }

  return generateTeeTimes(teeTimeParameters, tournamentPlayers, tournamentResults);
}


function generateTeeTimes(teeTimeParameters: TeeTimeParameters,
                          tournamentPlayers: TournamentPlayer[],
                          tournamentResults: TournamentResult[]): TeeTime[] {


  if (teeTimeParameters != undefined && tournamentPlayers != undefined) {
    const teeTimes: TeeTime[] = [];

    let mixedTournamentPlayers: TournamentPlayer[];

    if (teeTimeParameters.flightAssignment == FlightAssignmentMode.MODE_RANDOM) {
      mixedTournamentPlayers = shuffle([...tournamentPlayers]);
    } else if (teeTimeParameters.flightAssignment == FlightAssignmentMode.MODE_HCP) {
      mixedTournamentPlayers = orderByHcp([...tournamentPlayers]);
    } else {
      mixedTournamentPlayers = orderByResults([...tournamentPlayers], tournamentResults);
    }

    const startMinute = teeTimeParameters.firstTeeTime.substring(3,5);
    const startHour = teeTimeParameters.firstTeeTime.substring(0,2);

    let currentIdx = 0;
    while (mixedTournamentPlayers.length > currentIdx) {

      const teeTimeDelta = Math.floor(currentIdx / teeTimeParameters.flightSize);
      const minutesDelta = (+startMinute + (teeTimeDelta * teeTimeParameters.teeTimeStep)) %60;
      const hourDelta = +startHour + Math.floor((+startMinute + (teeTimeDelta * teeTimeParameters.teeTimeStep)) / 60);

      teeTimes.push({
        nick: mixedTournamentPlayers[currentIdx].nick,
        hcp: mixedTournamentPlayers[currentIdx].whs,
        flight: Math.abs(currentIdx / teeTimeParameters.flightSize) + 1,
        time: hourDelta + ":" + ("0" + minutesDelta).slice(-2)
      })

      currentIdx++;
    }

    return teeTimes;

  }

  return undefined;
}

function orderByHcp (tournamentPlayer: TournamentPlayer[]): TournamentPlayer[] {
  return tournamentPlayer.sort((a,b) => a.whs - b.whs);
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

function orderByResults(tournamentPlayer: TournamentPlayer[], tournamentResults: TournamentResult[]): TournamentPlayer[] {

  if (tournamentResults?.length > 0) {

    const trPlrIds: number[] = tournamentResults.map(tr => tr.player.id);

    const sortedTournamentPlayers: TournamentPlayer[] = [];

    trPlrIds.forEach(trPlrId => {
      sortedTournamentPlayers.push(tournamentPlayer.find(tp => tp.playerId == trPlrId));
    });

    let tournamentPlayerWithoutResults: TournamentPlayer[] = tournamentPlayer.filter(tp => !trPlrIds.includes(tp.playerId));

    tournamentPlayerWithoutResults = shuffle(tournamentPlayerWithoutResults);

    return sortedTournamentPlayers.concat(tournamentPlayerWithoutResults);

  }

  return shuffle(tournamentPlayer);
}

function modifyTeeTimes(teeTimeModification: TeeTimeModification, teeTimes: TeeTime[]): TeeTime[] {

  const originalNick: string = teeTimes[teeTimeModification.firstToSwap].nick;
  const originalHcp: number = teeTimes[teeTimeModification.firstToSwap].hcp;

  teeTimes[teeTimeModification.firstToSwap].nick = teeTimes[teeTimeModification.secondToSwap].nick;
  teeTimes[teeTimeModification.firstToSwap].hcp = teeTimes[teeTimeModification.secondToSwap].hcp;

  teeTimes[teeTimeModification.secondToSwap].nick = originalNick;
  teeTimes[teeTimeModification.secondToSwap].hcp = originalHcp;

  return teeTimes;
}

