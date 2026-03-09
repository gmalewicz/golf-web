import { signal, WritableSignal } from '@angular/core';  
import { of } from 'rxjs';  
import { RoundView } from './round-view';  
import { ScorecardHttpService } from '@/scorecard/_services/scorecardHttp.service';  
import { HttpService } from '@/_services/http.service';  
import { OnlineScoreCardViewComponent } from '../online-score-card-view.component';  
import { ballPickedUpStrokes } from '@/_helpers/common';  
import { HALF_HOLES } from '@/scorecard/_helpers/constants';  
import { OnlineRound } from '@/scorecard/_models/onlineRound';  
import { OnlineScoreCard } from '@/scorecard/_models';  
  
describe('RoundView', () => {  
  let roundView: RoundView;  
  let scorecardHttpService: jasmine.SpyObj<ScorecardHttpService>;  
  let httpService: jasmine.SpyObj<HttpService>;  
  
  beforeEach(() => {  
    scorecardHttpService = jasmine.createSpyObj('ScorecardHttpService', [  
      'getOnlineScoreCard'  
    ]);  
    httpService = jasmine.createSpyObj('HttpService', ['getHoles']);  
  
    roundView = new RoundView(scorecardHttpService, httpService);  
  });  
  
  function createSignals() {  
    return {  
      scoreBruttoClassSgn: signal<string[][]>([]),  
      onlineRoundsSgn: signal<OnlineRound[]>([]),  
      first9ballPickedUpSgn: signal<boolean[]>([]),  
      last9ballPickedUpSgn: signal<boolean[]>([]),  
      lstUpdTimeSgn: signal<string>('2024-01-01T10:00:00')  
    };  
  }  
  
  function createRound(): OnlineRound {  
    return {  
      id: 1,  
      course: {  
        id: 100,  
        holes: []  
      },  
      first9score: 0,  
      last9score: 0,  
      scoreCardAPI: []  
    } as unknown as OnlineRound;  
  }  
  
  it('should initialize score class matrix and populate scorecard data', (done) => {  
  const scoreBruttoClassSgn = signal<string[][]>([]);  
  const onlineRoundsSgn = signal<OnlineRound[]>([]);  
  const first9ballPickedUpSgn = signal<boolean[]>([]);  
  const last9ballPickedUpSgn = signal<boolean[]>([]);  
  const lstUpdTimeSgn = signal<string>('2024-01-01T10:00:00');  
  
  const round: OnlineRound = {  
    id: 1,  
    course: {  
      id: 100,  
      holes: []  
    },  
    first9score: 0,  
    last9score: 0,  
    scoreCardAPI: []  
  } as OnlineRound;  
  
  onlineRoundsSgn.set([round]);  
  
  const holes = Array.from({ length: 18 }).map((_, i) => ({  
    par: i < 9 ? 4 : 5  
  }));  
  
  const scoreCards: OnlineScoreCard[] = [  
    {  
      hole: 1,  
      stroke: 4,  
      time: '2024-01-01T10:01:00'  
    },  
    {  
      hole: 10,  
      stroke: 5,  
      time: '2024-01-01T10:02:00'  
    }  
  ] as OnlineScoreCard[];  
  
  scorecardHttpService.getOnlineScoreCard.and.returnValue(of(scoreCards));  
  httpService.getHoles.and.returnValue(of(Array(18).fill({ par: 4 })));   
  
  spyOn(  
    OnlineScoreCardViewComponent,  
    'prepareColoursForResults'  
  ).and.returnValue('birdie');  
  
  // ✅ FIX: realistic compareTime behavior  
  spyOn(  
    OnlineScoreCardViewComponent,  
    'compareTime'  
  ).and.callFake((prev: string, curr: string) => {  
    return new Date(curr) > new Date(prev) ? curr : prev;  
  });  
  
  roundView  
    .showRound(  
      scoreBruttoClassSgn,  
      onlineRoundsSgn,  
      first9ballPickedUpSgn,  
      last9ballPickedUpSgn,  
      lstUpdTimeSgn  
    )  
    .subscribe(() => {  
      // matrix initialized  
      expect(scoreBruttoClassSgn().length).toBe(1);  
      expect(scoreBruttoClassSgn()[0].length).toBe(18);  
  
      // API calls  
      expect(scorecardHttpService.getOnlineScoreCard).toHaveBeenCalledWith(1);  
      expect(httpService.getHoles).toHaveBeenCalledWith(100);  
  
      // scores calculated  
      expect(onlineRoundsSgn()[0].first9score).toBe(4);  
      expect(onlineRoundsSgn()[0].last9score).toBe(5);  
  
      // colours applied  
      expect(scoreBruttoClassSgn()[0][0]).toBe('birdie');  
      expect(scoreBruttoClassSgn()[0][9]).toBe('birdie');  
  
      // ✅ last update time is max value  
      expect(lstUpdTimeSgn()).toBe('2024-01-01T10:02:00');  
  
      done();  
    });  
});  
  
  it('should set ball picked up flags for first and last 9', (done) => {  
    const signals = createSignals();  
    const round = createRound();  
    signals.onlineRoundsSgn.set([round]);  
  
    const holes = Array.from({ length: 18 }).map(() => ({ par: 4 }));  
  
    const scoreCards: OnlineScoreCard[] = [  
      {  
        hole: 3,  
        stroke: ballPickedUpStrokes,  
        time: '2024-01-01T10:01:00'  
      },  
      {  
        hole: HALF_HOLES + 1,  
        stroke: ballPickedUpStrokes,  
        time: '2024-01-01T10:02:00'  
      }  
    ] as OnlineScoreCard[];  
  
    scorecardHttpService.getOnlineScoreCard.and.returnValue(of(scoreCards));  
   httpService.getHoles.and.returnValue(of(Array(18).fill({ par: 4 })));  
  
    spyOn(  
      OnlineScoreCardViewComponent,  
      'prepareColoursForResults'  
    ).and.returnValue('picked');  
  
    spyOn(  
      OnlineScoreCardViewComponent,  
      'compareTime'  
    ).and.returnValue('2024-01-01T10:02:00');  
  
    roundView  
      .showRound(  
        signals.scoreBruttoClassSgn,  
        signals.onlineRoundsSgn,  
        signals.first9ballPickedUpSgn,  
        signals.last9ballPickedUpSgn,  
        signals.lstUpdTimeSgn  
      )  
      .subscribe(() => {  
        expect(signals.first9ballPickedUpSgn()[0]).toBeTrue();  
        expect(signals.last9ballPickedUpSgn()[0]).toBeTrue();  
        done();  
      });  
  });  
  
  it('should correctly map scorecards by hole index', (done) => {  
    const signals = createSignals();  
    const round = createRound();  
    signals.onlineRoundsSgn.set([round]);  
  
    const holes = Array.from({ length: 18 }).map(() => ({ par: 4 }));  
  
    const scoreCards: OnlineScoreCard[] = [  
      { hole: 18, stroke: 6, time: '2024-01-01T10:05:00' }  
    ] as OnlineScoreCard[];  
  
    scorecardHttpService.getOnlineScoreCard.and.returnValue(of(scoreCards));  
    httpService.getHoles.and.returnValue(of(Array(18).fill({ par: 4 })));  
  
    spyOn(  
      OnlineScoreCardViewComponent,  
      'prepareColoursForResults'  
    ).and.returnValue('bogey');  
  
    spyOn(  
      OnlineScoreCardViewComponent,  
      'compareTime'  
    ).and.returnValue('2024-01-01T10:05:00');  
  
    roundView  
      .showRound(  
        signals.scoreBruttoClassSgn,  
        signals.onlineRoundsSgn,  
        signals.first9ballPickedUpSgn,  
        signals.last9ballPickedUpSgn,  
        signals.lstUpdTimeSgn  
      )  
      .subscribe(() => {  
        const api = signals.onlineRoundsSgn()[0].scoreCardAPI;  
        expect(api[17]?.stroke).toBe(6);  
        done();  
      });  
  });  
});  