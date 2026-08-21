import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
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
    expect(results.length).toBe(1);
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
    expect(results.length).toBe(1);
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
    expect(results.length).toBe(1);
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
    expect(results.length).toBe(1);
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
    expect(results.length).toBe(1);
    expect(results[0].lastName).toBe('Lazowski');
    // scorecard fetched only for the matching-club player
    expect(scoreCardSpy).toHaveBeenCalledTimes(1);
    expect(scoreCardSpy).toHaveBeenCalledWith(5);
  });
});
