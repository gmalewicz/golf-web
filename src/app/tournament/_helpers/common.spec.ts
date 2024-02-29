import { signal } from '@angular/core';
import { FlightAssignmentMode, TeeTimeParameters, TeeTimePublishStatus } from '../_models/teeTimeParameters';
import { generateTeeTimes } from './common';
import { TournamentPlayer } from '../_models/tournamentPlayer';
import { getTournamentPlayer, getTournamentResult } from './test.helper';
import { TeeTime } from '../_models/teeTime';
import { TournamentResult } from '../_models/tournamentResult';

describe('Common', () => {

  it('should generate random tee times for two players', () => {

    const teeTimes: TeeTime[] = generateTeeTimes(
        signal<TeeTimeParameters>({ firstTeeTime: "09:00",
                                    teeTimeStep: 10,
                                    flightSize: 4,
                                    published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
                                    flightAssignment: FlightAssignmentMode.MODE_RANDOM}),
        signal<TournamentPlayer[]>([getTournamentPlayer(), {...getTournamentPlayer(), id : 2, playerId: 2, nick: 'test2'}]),
        signal<TournamentResult[]>([getTournamentResult()]));

    expect(teeTimes.length).toBe(2);
  });

  it('should generate tee times by hcp for two players', () => {

    const teeTimes: TeeTime[] = generateTeeTimes(
        signal<TeeTimeParameters>({ firstTeeTime: "09:00",
                                    teeTimeStep: 10,
                                    flightSize: 4,
                                    published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
                                    flightAssignment: FlightAssignmentMode.MODE_HCP}),
        signal<TournamentPlayer[]>([getTournamentPlayer(), {...getTournamentPlayer(), id : 2, playerId: 2, nick: 'test2'}]),
        signal<TournamentResult[]>([getTournamentResult()]));

    expect(teeTimes.length).toBe(2);
  });

  it('should generate tee times by results for two players', () => {

    const teeTimes: TeeTime[] = generateTeeTimes(
        signal<TeeTimeParameters>({ firstTeeTime: "09:00",
                                    teeTimeStep: 10,
                                    flightSize: 4,
                                    published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
                                    flightAssignment: FlightAssignmentMode.MODE_RESULTS}),
        signal<TournamentPlayer[]>([getTournamentPlayer(), {...getTournamentPlayer(), id : 2, playerId: 2, nick: 'test2'}]),
        signal<TournamentResult[]>([getTournamentResult()]));

    expect(teeTimes.length).toBe(2);
  });

  it('should generate tee times by results for two players but no results', () => {

    const teeTimes: TeeTime[] = generateTeeTimes(
        signal<TeeTimeParameters>({ firstTeeTime: "09:00",
                                    teeTimeStep: 10,
                                    flightSize: 4,
                                    published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
                                    flightAssignment: FlightAssignmentMode.MODE_RESULTS}),
        signal<TournamentPlayer[]>([getTournamentPlayer(), {...getTournamentPlayer(), id : 2, playerId: 2, nick: 'test2'}]),
        signal<TournamentResult[]>([]));

    expect(teeTimes.length).toBe(2);
  });

});


