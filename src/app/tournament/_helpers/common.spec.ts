import { signal } from '@angular/core';
import { TeeTimeParameters, TeeTimePublishStatus } from '../_models/teeTimeParameters';
import { generateTeeTimes } from './common';
import { TournamentPlayer } from '../_models/tournamentPlayer';
import { getTournamentPlayer } from './test.helper';
import { TeeTime } from '../_models/teeTime';

describe('Common', () => {

  it('should generate tee times for two players', () => {

    const teeTimes: TeeTime[] = generateTeeTimes(
        signal<TeeTimeParameters>({firstTeeTime: "09:00", teeTimeStep: 10, flightSize: 4, published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED}),
        signal<TournamentPlayer[]>([getTournamentPlayer(), {...getTournamentPlayer(), id : 2, nick: 'test2'}]));

    expect(teeTimes.length).toBe(2);
  });



});


