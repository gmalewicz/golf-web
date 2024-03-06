import { FlightAssignmentMode, TeeTimePublishStatus } from '../_models/teeTimeParameters';
import { getTournamentPlayer, getTournamentResult } from './test.helper';
import { TeeTime } from '../_models/teeTime';
import { updateTeeTimes } from './common';

describe('Common', () => {

  it('should generate random tee times for two players', () => {

    const teeTimes: TeeTime[] = updateTeeTimes(
      { firstTeeTime: "09:00",
        teeTimeStep: 10,
        flightSize: 4,
        published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
        flightAssignment: FlightAssignmentMode.MODE_RANDOM},
        [getTournamentPlayer(), {...getTournamentPlayer(), id : 2, playerId: 2, nick: 'test2'}],
        [getTournamentResult()],
        {},
        false,
        false);

    expect(teeTimes.length).toBe(2);
  });

  it('should generate tee times by hcp for two players', () => {

    const teeTimes: TeeTime[] = updateTeeTimes(
      { firstTeeTime: "09:00",
        teeTimeStep: 10,
        flightSize: 4,
        published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
        flightAssignment: FlightAssignmentMode.MODE_HCP},
        [getTournamentPlayer(), {...getTournamentPlayer(), id : 2, playerId: 2, nick: 'test2'}],
        [getTournamentResult()],
        {},
        false,
        false);

    expect(teeTimes.length).toBe(2);
  });

  it('should generate tee times by results for two players', () => {

    const teeTimes: TeeTime[] = updateTeeTimes(
      { firstTeeTime: "09:00",
        teeTimeStep: 10,
        flightSize: 4,
        published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
        flightAssignment: FlightAssignmentMode.MODE_RESULTS},
        [getTournamentPlayer(), {...getTournamentPlayer(), id : 2, playerId: 2, nick: 'test2'}],
        [getTournamentResult()],
        {},
        false,
        false);

    expect(teeTimes.length).toBe(2);
  });

  it('should generate tee times by results for two players but no results', () => {

    const teeTimes: TeeTime[] = updateTeeTimes(
      { firstTeeTime: "09:00",
        teeTimeStep: 10,
        flightSize: 4,
        published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
        flightAssignment: FlightAssignmentMode.MODE_RESULTS},
        [getTournamentPlayer(), {...getTournamentPlayer(), id : 2, playerId: 2, nick: 'test2'}],
        [],
        {},
        false,
        false);

    expect(teeTimes.length).toBe(2);
  });

  it('should swap 2 players within tee times', () => {

    const teeTimes: TeeTime[] = updateTeeTimes(
      { firstTeeTime: "09:00",
        teeTimeStep: 10,
        flightSize: 4,
        published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
        flightAssignment: FlightAssignmentMode.MODE_RANDOM,
        teeTimes: [{hcp: 1, nick: 'test 1', flight: 1, time: '10:00'}, {hcp: 2, nick: 'test 2', flight: 1, time: '10:00'}]},
        [getTournamentPlayer(), {...getTournamentPlayer(), id : 2, playerId: 2, nick: 'test2'}],
        [getTournamentResult()],
        {firstToSwap: 0, secondToSwap: 1},
        true,
        false);

    expect(teeTimes[0].hcp).toBe(2);
  });

});


