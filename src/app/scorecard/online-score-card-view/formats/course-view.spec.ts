import { of } from 'rxjs';  
import { signal } from '@angular/core';  
import { CourseView } from './course-view';  
  
import { ScorecardHttpService } from '@/scorecard/_services/scorecardHttp.service';  
import { HttpService } from '@/_services/http.service';  
import { OnlineRound } from '@/scorecard/_models/onlineRound';  
import { OnlineScoreCard } from '@/scorecard/_models';  
import { Course } from '@/_models/course';  
import { OnlineScoreCardViewComponent } from '../online-score-card-view.component';  
import { ballPickedUpStrokes } from '@/_helpers/common';  
import { HALF_HOLES } from '@/scorecard/_helpers/constants';  
  
describe('CourseView', () => {  
  let courseView: CourseView;  
  
  let scorecardHttpServiceSpy: jasmine.SpyObj<ScorecardHttpService>;  
  let httpServiceSpy: jasmine.SpyObj<HttpService>;  
  
  beforeEach(() => {  
    scorecardHttpServiceSpy = jasmine.createSpyObj('ScorecardHttpService', [  
      'getOnlineRoundsForCourse'  
    ]);  
  
    httpServiceSpy = jasmine.createSpyObj('HttpService', [  
      'getHoles'  
    ]);  
  
    courseView = new CourseView(scorecardHttpServiceSpy, httpServiceSpy);  
  
    spyOn(OnlineScoreCardViewComponent, 'prepareColoursForResults')  
      .and.returnValue('par');  
  
    spyOn(OnlineScoreCardViewComponent, 'compareTime')  
      .and.callFake((oldTime: string, newTime: string) =>  
        oldTime > newTime ? oldTime : newTime  
      );  
  });  
  
  function createSignals() {  
    return {  
      scoreBruttoClassSgn: signal<string[][]>([]),  
      onlineRoundsSgn: signal<OnlineRound[]>([]),  
      courseSgn: signal<Course>({ id: 1, holes: [] } as Course),  
      first9ballPickedUpSgn: signal<boolean[]>([]),  
      last9ballPickedUpSgn: signal<boolean[]>([]),  
      lstUpdTimeSgn: signal<string>(''),  
      finalizedSgn: signal<boolean>(true)  
    };  
  }  
  
  function mockOnlineRound(finalized = true): OnlineRound {  
    return {  
      finalized,  
      scoreCardAPI: [  
        {  
          hole: 1,  
          stroke: 4,  
          time: '10:00'  
        } as OnlineScoreCard,  
        {  
          hole: HALF_HOLES + 1,  
          stroke: ballPickedUpStrokes,  
          time: '10:05'  
        } as OnlineScoreCard  
      ]  
    } as OnlineRound;  
  }  
  
  it('should initialize signals and load course data', (done) => {  
    const signals = createSignals();  
  
    const rounds = [mockOnlineRound()];  
    const holes = Array(18).fill(4);  
  
    scorecardHttpServiceSpy.getOnlineRoundsForCourse  
      .and.returnValue(of(rounds));  
  
    httpServiceSpy.getHoles  
      .and.returnValue(of(holes));  
  
    courseView.showCourse(  
      signals.scoreBruttoClassSgn,  
      signals.onlineRoundsSgn,  
      signals.courseSgn,  
      signals.first9ballPickedUpSgn,  
      signals.last9ballPickedUpSgn,  
      signals.lstUpdTimeSgn,  
      signals.finalizedSgn  
    ).subscribe(() => {  
      expect(signals.courseSgn().holes).toEqual(holes);  
      expect(signals.onlineRoundsSgn().length).toBe(1);  
  
      expect(signals.scoreBruttoClassSgn().length).toBe(1);  
      expect(signals.scoreBruttoClassSgn()[0].length).toBe(18);  
  
      expect(signals.finalizedSgn()).toBeTrue();  
      done();  
    });  
  });  
  
  it('should mark finalized false if any round is not finalized', (done) => {  
    const signals = createSignals();  
  
    scorecardHttpServiceSpy.getOnlineRoundsForCourse  
      .and.returnValue(of([mockOnlineRound(false)]));  
  
    httpServiceSpy.getHoles  
      .and.returnValue(of(  
        Array(18).fill({ par: 4 })  
      ));  
  
    courseView.showCourse(  
      signals.scoreBruttoClassSgn,  
      signals.onlineRoundsSgn,  
      signals.courseSgn,  
      signals.first9ballPickedUpSgn,  
      signals.last9ballPickedUpSgn,  
      signals.lstUpdTimeSgn,  
      signals.finalizedSgn  
    ).subscribe(() => {  
      expect(signals.finalizedSgn()).toBeFalse();  
      done();  
    });  
  });  
  
  it('should calculate first9 and last9 scores correctly', (done) => {  
    const signals = createSignals();  
    const round = mockOnlineRound();  
  
    scorecardHttpServiceSpy.getOnlineRoundsForCourse  
      .and.returnValue(of([round]));  
  
    httpServiceSpy.getHoles  
      .and.returnValue(of(  
        Array(18).fill({ par: 4 })  
      ));  
  
    courseView.showCourse(  
      signals.scoreBruttoClassSgn,  
      signals.onlineRoundsSgn,  
      signals.courseSgn,  
      signals.first9ballPickedUpSgn,  
      signals.last9ballPickedUpSgn,  
      signals.lstUpdTimeSgn,  
      signals.finalizedSgn  
    ).subscribe(() => {  
      const updatedRound = signals.onlineRoundsSgn()[0];  
  
      expect(updatedRound.first9score).toBe(4);  
      expect(updatedRound.last9score).toBe(ballPickedUpStrokes);  
  
      done();  
    });  
  });  
  
  it('should set ball picked up flags correctly', (done) => {  
    const signals = createSignals();  
  
    scorecardHttpServiceSpy.getOnlineRoundsForCourse  
      .and.returnValue(of([mockOnlineRound()]));  
  
    httpServiceSpy.getHoles  
      .and.returnValue(of(  
        Array(18).fill({ par: 4 })  
      ));  
  
    courseView.showCourse(  
      signals.scoreBruttoClassSgn,  
      signals.onlineRoundsSgn,  
      signals.courseSgn,  
      signals.first9ballPickedUpSgn,  
      signals.last9ballPickedUpSgn,  
      signals.lstUpdTimeSgn,  
      signals.finalizedSgn  
    ).subscribe(() => {  
      expect(signals.first9ballPickedUpSgn()[0]).toBeFalse();  
      expect(signals.last9ballPickedUpSgn()[0]).toBeTrue();  
      done();  
    });  
  });  
  
  it('should call prepareColoursForResults for each score', (done) => {  
    const signals = createSignals();  
  
    scorecardHttpServiceSpy.getOnlineRoundsForCourse  
      .and.returnValue(of([mockOnlineRound()]));  
  
    httpServiceSpy.getHoles  
      .and.returnValue(of(  
        Array(18).fill({ par: 4 })  
      ));  
  
    courseView.showCourse(  
      signals.scoreBruttoClassSgn,  
      signals.onlineRoundsSgn,  
      signals.courseSgn,  
      signals.first9ballPickedUpSgn,  
      signals.last9ballPickedUpSgn,  
      signals.lstUpdTimeSgn,  
      signals.finalizedSgn  
    ).subscribe(() => {  
      expect(  
        OnlineScoreCardViewComponent.prepareColoursForResults  
      ).toHaveBeenCalled();  
      done();  
    });  
  });  

  it('should set first9ballPickedUpSgn to true when stroke is ballPickedUpStrokes and hole is 9 (HALF_HOLES)', (done) => {  
  const signals = createSignals();  
  
  const round: OnlineRound = {  
    finalized: true,  
    scoreCardAPI: [  
      {  
        hole: 9, // boundary value  
        stroke: ballPickedUpStrokes,  
        time: '11:00'  
      } as OnlineScoreCard  
    ]  
  } as OnlineRound;  
  
  scorecardHttpServiceSpy.getOnlineRoundsForCourse  
    .and.returnValue(of([round]));  
  
  httpServiceSpy.getHoles  
    .and.returnValue(of(  
      Array(18).fill({ par: 4 })  
    ));  
  
  courseView.showCourse(  
    signals.scoreBruttoClassSgn,  
    signals.onlineRoundsSgn,  
    signals.courseSgn,  
    signals.first9ballPickedUpSgn,  
    signals.last9ballPickedUpSgn,  
    signals.lstUpdTimeSgn,  
    signals.finalizedSgn  
  ).subscribe(() => {  
  
    //  first 9 must be marked  
    expect(signals.first9ballPickedUpSgn()[0]).toBeTrue();  
  
    // last 9 must NOT be marked  
    expect(signals.last9ballPickedUpSgn()[0]).toBeFalse();  
  
    done();  
  });  
}); 
});  