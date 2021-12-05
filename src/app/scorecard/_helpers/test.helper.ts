import { OnlineScoreCard } from './../_models/onlineScoreCard';
import { OnlineRound } from '../_models/onlineRound';

export function getOnlineRoundFirstPlayer(): OnlineRound {

  return {
     id: 17,
      course: {id: 1, name: 'Sobienie Królewskie', par: 71, holeNbr: 18},
      teeTime: '20:29',
      player: {id: 1, nick: 'golfer', sex: false, whs: 38.4},
      owner: 1,
      finalized: false,
      putts: false,
      penalties: false,
      matchPlay: true,
      mpFormat: 0.75,
      scoreCardAPI: [
        {
          hole: 1,
          id: 61,
          orId: 0,
          penalty: 0,
          player: {id: 1, nick: 'golfer', sex: false, whs: 38.4},
          putt: 0,
          stroke: 4,
          time: '20:48',
          update: false
        }
      ],
      nick2: 'test',
      tee: {id: 1, tee: 'men red', cr: 66.1, sr: 116, teeType: 0, sex: false}
    };
}

export function getOnlineRoundSecondPlayer(): OnlineRound {

  return {id: 18,
    course: {id: 1, name: 'Sobienie Królewskie' , par: 71, holeNbr: 18},
    teeTime: '20:29',
    player: {id: 2, nick: 'test', sex: false, whs: 12.3},
    owner: 1,
    finalized: false,
    putts: false,
    penalties: false,
    matchPlay: true,
    mpFormat: 0.75,
    scoreCardAPI: [
      {
        hole: 1,
        id: 62,
        orId: 0,
        penalty: 0,
        player: {id: 2, nick: 'test', sex: false, whs: 12.4},
        putt: 0,
        stroke: 4,
        time: '20:48',
        update: false
      }
    ],
    nick2: 'test2',
    tee: {id: 2, tee: 'men yellow', cr: 70.3, sr: 135, teeType: 0, sex: false}
  };
}

export function getOnlineScoreCard(): OnlineScoreCard {

  return {
      hole: 1,
      id: 89,
      orId: 0,
      penalty: 0,
      player: {id: 1, nick: 'golfer', sex: false, whs: 12.4},
      putt: 0,
      stroke: 4,
      time: '12:26',
      update: false
    };
}
