import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Hcp34Component } from './hcp34.component';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { CycleHttpService } from '../cycles/_services/cycleHttp.service';
import { Hole } from '@/_models/hole';

const scorecardMock = {
  scorecard: {
    rounds: [
      {
        sum: { stb_netto: '37' },
        holes_out: [
          { number: '1', par: '4', strokes: '4', stb_netto: '3' },
          { number: '2', par: '4', strokes: '4', stb_netto: '3' },
          { number: '3', par: '3', strokes: '3', stb_netto: '3' },
          { number: '4', par: '5', strokes: '5', stb_netto: '2' },
          { number: '5', par: '4', strokes: '5', stb_netto: '2' },
          { number: '6', par: '4', strokes: '6', stb_netto: '1' },
          { number: '7', par: '3', strokes: '4', stb_netto: '2' },
          { number: '8', par: '5', strokes: '5', stb_netto: '3' },
          { number: '9', par: '4', strokes: '4', stb_netto: '3' },
        ],
        holes_in: [
          { number: '10', par: '5', strokes: '5', stb_netto: '2' },
          { number: '11', par: '3', strokes: '4', stb_netto: '2' },
          { number: '12', par: '4', strokes: '5', stb_netto: '1' },
          { number: '13', par: '3', strokes: '4', stb_netto: '2' },
          { number: '14', par: '4', strokes: '7', stb_netto: '0' },
          { number: '15', par: '4', strokes: '5', stb_netto: '2' },
          { number: '16', par: '5', strokes: '5', stb_netto: '3' },
          { number: '17', par: '4', strokes: '4', stb_netto: '2' },
          { number: '18', par: '4', strokes: '6', stb_netto: '1' },
        ],
      },
    ],
  },
};

const holesMock: Hole[] = Array.from({ length: 18 }, (_, i) => ({
  number: i + 1,
  par: scorecardMock.scorecard.rounds[0][i < 9 ? 'holes_out' : 'holes_in'].map((h) => +h.par)[i % 9],
  si: i + 1,
}));

// plus-handicap player: 18 par-4 holes all played to par, playing handicap +2 (-2),
// so strokes are given back on the two easiest holes (stroke index 17 and 18)
const plusHoleScore = (n: number, points: number) => ({
  number: `${n}`,
  par: '4',
  strokes: '4',
  stb_netto: `${points}`,
});

const plusScorecardMock = {
  scorecard: {
    rounds: [
      {
        sum: { stb_netto: '34' },
        holes_out: Array.from({ length: 9 }, (_, i) => plusHoleScore(i + 1, 2)),
        holes_in: Array.from({ length: 9 }, (_, i) => plusHoleScore(i + 10, i + 10 >= 17 ? 1 : 2)),
      },
    ],
  },
};

const plusHolesMock: Hole[] = Array.from({ length: 18 }, (_, i) => ({
  number: i + 1,
  par: 4,
  si: i + 1,
}));

// high-handicap player whose reconstructed playing handicap is 45 (> 36 cap).
// gross 7 on stroke-index 1-9, gross 6 on stroke-index 10-18, all played to net par.
const capScorecardMock = {
  scorecard: {
    rounds: [
      {
        sum: { stb_netto: '36' },
        holes_out: Array.from({ length: 9 }, (_, i) => ({
          number: `${i + 1}`,
          par: '4',
          strokes: '7',
          stb_netto: '2',
        })),
        holes_in: Array.from({ length: 9 }, (_, i) => ({
          number: `${i + 10}`,
          par: '4',
          strokes: '6',
          stb_netto: '2',
        })),
      },
    ],
  },
};

const capHolesMock: Hole[] = Array.from({ length: 18 }, (_, i) => ({
  number: i + 1,
  par: 4,
  si: i + 1,
}));describe('Hcp34Component', () => {
  let component: Hcp34Component;
  let fixture: ComponentFixture<Hcp34Component>;
  let currentPlayerValueSpy: jasmine.Spy<jasmine.Func>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [Hcp34Component],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Hcp34Component);
    component = fixture.componentInstance;
    currentPlayerValueSpy = spyOnProperty(TestBed.inject(AuthenticationService), 'currentPlayerValue');
  });

  it('should create', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should logout when player does not exist', () => {
    currentPlayerValueSpy.and.returnValue(null);
    const authService = TestBed.inject(AuthenticationService);
    const logoutSpy = spyOn(authService, 'logout');
    fixture.detectChanges();
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('should compute full and 3/4 stableford netto', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const cycleHttp = fixture.debugElement.injector.get(CycleHttpService);
    const httpService = TestBed.inject(HttpService);

    spyOn(cycleHttp, 'getEagleStbResults').and.returnValue(
      of({
        items: [
          {
            first_name: 'Krzysztof',
            last_name: 'Lazowski',
            hcp: 12.9,
            player_id: 5,
            r: [37],
            club: 'Royal Golf Club Wilanów',
          },
        ],
      }),
    );
    spyOn(cycleHttp, 'getScoreCard').and.returnValue(of(scorecardMock));
    spyOn(httpService, 'getHoles').and.returnValue(of(holesMock));

    component.selectedCourse.set({ id: 1, name: 'Mazury G&CC 18 - 2024', par: 72 });
    component.form.controls.tournamentNo.setValue('12345');
    component.calculate();

    const results = component.results();
    expect(component.calculated()).toBeTrue();
    expect(results).toHaveSize(1);
    expect(results[0].fullNetto).toBe(37);
    // 3/4 handicap gives fewer strokes, so its netto can never exceed the full-HCP netto
    expect(results[0].netto34).toBeLessThanOrEqual(37);
  });

  it('should compute plus (negative) handicap without inflating the 3/4 netto', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const cycleHttp = fixture.debugElement.injector.get(CycleHttpService);
    const httpService = TestBed.inject(HttpService);

    spyOn(cycleHttp, 'getEagleStbResults').and.returnValue(
      of({
        items: [
          {
            first_name: 'Plus',
            last_name: 'Player',
            hcp: -2,
            player_id: 7,
            r: [34],
            club: 'Royal Golf Club Wilanów',
          },
        ],
      }),
    );
    spyOn(cycleHttp, 'getScoreCard').and.returnValue(of(plusScorecardMock));
    spyOn(httpService, 'getHoles').and.returnValue(of(plusHolesMock));

    component.selectedCourse.set({ id: 2, name: 'Flat Par 4', par: 72 });
    component.form.controls.tournamentNo.setValue('12345');
    component.calculate();

    const results = component.results();
    expect(results).toHaveSize(1);
    expect(results[0].fullNetto).toBe(34);
    // playing hcp -2 -> 3/4 = round(-1.5) = -1, so one fewer stroke is given back: 35
    // (not the pre-fix inflated 36 produced when reconstruction fell back to a handicap of 0)
    expect(results[0].netto34).toBe(35);
  });

  it('should show an error when no course is selected', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();
    const alertService = (component as unknown as { alertService: { error: () => void } }).alertService;
    const errorSpy = spyOn(alertService, 'error');
    component.form.controls.tournamentNo.setValue('12345');
    component.calculate();
    expect(errorSpy).toHaveBeenCalled();
    expect(component.calculated()).toBeFalse();
  });

  it('should cap the playing handicap at 36 when the player handicap exceeds 36', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const cycleHttp = fixture.debugElement.injector.get(CycleHttpService);
    const httpService = TestBed.inject(HttpService);

    spyOn(cycleHttp, 'getEagleStbResults').and.returnValue(
      of({
        items: [
          {
            first_name: 'High',
            last_name: 'Handicap',
            hcp: 45,
            player_id: 9,
            r: [36],
            club: 'Royal Golf Club Wilanów',
          },
        ],
      }),
    );
    spyOn(cycleHttp, 'getScoreCard').and.returnValue(of(capScorecardMock));
    spyOn(httpService, 'getHoles').and.returnValue(of(capHolesMock));

    component.selectedCourse.set({ id: 1, name: 'Mazury G&CC 18 - 2024', par: 72 });
    component.form.controls.tournamentNo.setValue('12345');
    component.calculate();

    const results = component.results();
    expect(results).toHaveSize(1);
    expect(results[0].fullNetto).toBe(36);
    // player hcp 45 > 36, so playing hcp is capped to 36 -> 3/4 = 27; netto for hcp 27 is 18
    expect(results[0].playingHcp).toBe(36);
    expect(results[0].playingHcp34).toBe(27);
    expect(results[0].netto34).toBe(18);
  });

  it('should not cap the playing handicap when the player handicap is 36 or below', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const cycleHttp = fixture.debugElement.injector.get(CycleHttpService);
    const httpService = TestBed.inject(HttpService);

    // player hcp is 36 (not above), so the reconstructed playing hcp (45) is used as-is
    spyOn(cycleHttp, 'getEagleStbResults').and.returnValue(
      of({
        items: [
          {
            first_name: 'On',
            last_name: 'Limit',
            hcp: 36,
            player_id: 10,
            r: [36],
            club: 'Royal Golf Club Wilanów',
          },
        ],
      }),
    );
    spyOn(cycleHttp, 'getScoreCard').and.returnValue(of(capScorecardMock));
    spyOn(httpService, 'getHoles').and.returnValue(of(capHolesMock));

    component.selectedCourse.set({ id: 1, name: 'Mazury G&CC 18 - 2024', par: 72 });
    component.form.controls.tournamentNo.setValue('12345');
    component.calculate();

    const results = component.results();
    expect(results).toHaveSize(1);
    expect(results[0].playingHcp).toBe(45);
    expect(results[0].playingHcp34).toBe(34);
  });

  it('should include only players from Royal Golf Club Wilanów', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const cycleHttp = fixture.debugElement.injector.get(CycleHttpService);
    const httpService = TestBed.inject(HttpService);

    spyOn(cycleHttp, 'getEagleStbResults').and.returnValue(
      of({
        items: [
          {
            first_name: 'Krzysztof',
            last_name: 'Lazowski',
            hcp: 12.9,
            player_id: 5,
            r: [37],
            club: 'Royal Golf Club Wilanów',
          },
          {
            first_name: 'Other',
            last_name: 'Club',
            hcp: 10,
            player_id: 6,
            r: [40],
            club: 'A&A Golf Club',
          },
        ],
      }),
    );
    const scoreCardSpy = spyOn(cycleHttp, 'getScoreCard').and.returnValue(of(scorecardMock));
    spyOn(httpService, 'getHoles').and.returnValue(of(holesMock));

    component.selectedCourse.set({ id: 1, name: 'Mazury G&CC 18 - 2024', par: 72 });
    component.form.controls.tournamentNo.setValue('12345');
    component.calculate();

    const results = component.results();
    expect(results).toHaveSize(1);
    expect(results[0].lastName).toBe('Lazowski');
    // scorecard fetched only for the matching-club player
    expect(scoreCardSpy).toHaveBeenCalledTimes(1);
    expect(scoreCardSpy).toHaveBeenCalledWith(5);
  });

  it('should clear course results without searching when the typed name is shorter than 3 chars', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const httpService = TestBed.inject(HttpService);
    const searchSpy = spyOn(httpService, 'searchForCourse').and.returnValue(of([]));
    component.courseResults.set([{ id: 1, name: 'Stale', par: 72 }]);

    component.form.controls.courseName.setValue('Ma');
    component.onCourseKey();

    expect(searchSpy).not.toHaveBeenCalled();
    expect(component.courseResults()).toHaveSize(0);
    expect(component.searching()).toBeFalse();
  });

  it('should populate course results when the search succeeds', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const httpService = TestBed.inject(HttpService);
    const courses = [{ id: 3, name: 'Mazury G&CC', par: 72 }];
    const searchSpy = spyOn(httpService, 'searchForCourse').and.returnValue(of(courses));

    component.form.controls.courseName.setValue('Maz');
    component.onCourseKey();

    expect(searchSpy).toHaveBeenCalledWith('Maz');
    expect(component.courseResults()).toEqual(courses);
    expect(component.searching()).toBeFalse();
  });

  it('should stop searching when the course search fails', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const httpService = TestBed.inject(HttpService);
    spyOn(httpService, 'searchForCourse').and.returnValue(throwError(() => new Error('boom')));

    component.form.controls.courseName.setValue('Maz');
    component.onCourseKey();

    expect(component.searching()).toBeFalse();
    expect(component.courseResults()).toHaveSize(0);
  });

  it('should select a course, clear the result list and fill the course name', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const course = { id: 4, name: 'Selected Course', par: 72 };
    component.courseResults.set([course]);

    component.selectCourse(course);

    expect(component.selectedCourse()).toBe(course);
    expect(component.courseResults()).toHaveSize(0);
    expect(component.form.controls.courseName.value).toBe('Selected Course');
  });

  it('should show an error when the tournament number is invalid even if a course is selected', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const alertService = (component as unknown as { alertService: { error: () => void } }).alertService;
    const errorSpy = spyOn(alertService, 'error');

    component.selectedCourse.set({ id: 1, name: 'Mazury G&CC 18 - 2024', par: 72 });
    // fails the [1-9][0-9][0-9][0-9] pattern
    component.form.controls.tournamentNo.setValue('0');
    component.calculate();

    expect(errorSpy).toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
    expect(component.calculated()).toBeFalse();
  });

  it('should show a no-players error when no matching-club player has results', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const cycleHttp = fixture.debugElement.injector.get(CycleHttpService);
    const httpService = TestBed.inject(HttpService);
    const alertService = (component as unknown as { alertService: { error: () => void } }).alertService;
    const errorSpy = spyOn(alertService, 'error');

    spyOn(cycleHttp, 'getEagleStbResults').and.returnValue(
      of({
        items: [
          {
            first_name: 'Empty',
            last_name: 'Scores',
            hcp: 20,
            player_id: 8,
            r: [0, 0, 0],
            club: 'Royal Golf Club Wilanów',
          },
        ],
      }),
    );
    const scoreCardSpy = spyOn(cycleHttp, 'getScoreCard').and.returnValue(of(scorecardMock));
    const holesSpy = spyOn(httpService, 'getHoles').and.returnValue(of(holesMock));

    component.selectedCourse.set({ id: 1, name: 'Mazury G&CC 18 - 2024', par: 72 });
    component.form.controls.tournamentNo.setValue('12345');
    component.calculate();

    expect(errorSpy).toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
    expect(component.calculated()).toBeFalse();
    expect(component.results()).toHaveSize(0);
    // no scorecard or holes are fetched when there are no eligible players
    expect(scoreCardSpy).not.toHaveBeenCalled();
    expect(holesSpy).not.toHaveBeenCalled();
  });

  it('should show an error when the eagle results request fails', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const cycleHttp = fixture.debugElement.injector.get(CycleHttpService);
    const alertService = (component as unknown as { alertService: { error: () => void } }).alertService;
    const errorSpy = spyOn(alertService, 'error');

    spyOn(cycleHttp, 'getEagleStbResults').and.returnValue(throwError(() => new Error('network')));

    component.selectedCourse.set({ id: 1, name: 'Mazury G&CC 18 - 2024', par: 72 });
    component.form.controls.tournamentNo.setValue('12345');
    component.calculate();

    expect(errorSpy).toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
    expect(component.calculated()).toBeFalse();
  });

  it('should skip a player whose scorecard has no rounds', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const cycleHttp = fixture.debugElement.injector.get(CycleHttpService);
    const httpService = TestBed.inject(HttpService);

    spyOn(cycleHttp, 'getEagleStbResults').and.returnValue(
      of({
        items: [
          {
            first_name: 'No',
            last_name: 'Rounds',
            hcp: 15,
            player_id: 11,
            r: [30],
            club: 'Royal Golf Club Wilanów',
          },
        ],
      }),
    );
    spyOn(cycleHttp, 'getScoreCard').and.returnValue(of({ scorecard: { rounds: [] } }));
    spyOn(httpService, 'getHoles').and.returnValue(of(holesMock));

    component.selectedCourse.set({ id: 1, name: 'Mazury G&CC 18 - 2024', par: 72 });
    component.form.controls.tournamentNo.setValue('12345');
    component.calculate();

    // the request path completes, but no result row is produced for the round-less scorecard
    expect(component.calculated()).toBeTrue();
    expect(component.results()).toHaveSize(0);
  });

  it('should score a not-played ("x") hole as zero stableford points', () => {
    currentPlayerValueSpy.and.returnValue({ nick: 'test', id: 1 });
    fixture.detectChanges();

    const cycleHttp = fixture.debugElement.injector.get(CycleHttpService);
    const httpService = TestBed.inject(HttpService);

    // clone the base scorecard and mark hole 14 as not played
    const notPlayedScorecard = {
      scorecard: {
        rounds: [
          {
            sum: { stb_netto: '35' },
            holes_out: scorecardMock.scorecard.rounds[0].holes_out.map((h) => ({ ...h })),
            holes_in: scorecardMock.scorecard.rounds[0].holes_in.map((h) =>
              h.number === '14' ? { ...h, strokes: 'x', stb_netto: '0' } : { ...h },
            ),
          },
        ],
      },
    };

    spyOn(cycleHttp, 'getEagleStbResults').and.returnValue(
      of({
        items: [
          {
            first_name: 'Gave',
            last_name: 'Up',
            hcp: 12.9,
            player_id: 12,
            r: [35],
            club: 'Royal Golf Club Wilanów',
          },
        ],
      }),
    );
    spyOn(cycleHttp, 'getScoreCard').and.returnValue(of(notPlayedScorecard));
    spyOn(httpService, 'getHoles').and.returnValue(of(holesMock));

    component.selectedCourse.set({ id: 1, name: 'Mazury G&CC 18 - 2024', par: 72 });
    component.form.controls.tournamentNo.setValue('12345');
    component.calculate();

    const results = component.results();
    expect(results).toHaveSize(1);
    expect(component.calculated()).toBeTrue();
    // tie-break sums always fold into their supersets since per-hole points are non-negative
    expect(results[0].last9).toBeGreaterThanOrEqual(results[0].last6);
    expect(results[0].last6).toBeGreaterThanOrEqual(results[0].last3);
    expect(results[0].last3).toBeGreaterThanOrEqual(results[0].last1);
  });
});
