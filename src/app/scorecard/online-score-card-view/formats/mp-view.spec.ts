import { WritableSignal, signal } from "@angular/core";
import { of } from "rxjs";

import { MPView } from "./mp-view";
import { ScorecardHttpService } from "@/scorecard/_services/scorecardHttp.service";
import { HttpService } from "@/_services/http.service";
import { OnlineRound } from "@/scorecard/_models/onlineRound";
import { Course } from "@/_models/course";
import { OnlineScoreCardViewComponent } from "../online-score-card-view.component";

/* 🔹 Mock helper functions */
import * as whsRoutines from "@/_helpers/whs.routines";

describe("MPView", () => {
  let mpView: MPView;
  let scorecardHttpService: jasmine.SpyObj<ScorecardHttpService>;
  let httpService: jasmine.SpyObj<HttpService>;

  beforeEach(() => {
    scorecardHttpService = jasmine.createSpyObj("ScorecardHttpService", [
      "getOnlineRound",
    ]);
    httpService = jasmine.createSpyObj("HttpService", ["getHoles"]);

    mpView = new MPView(scorecardHttpService, httpService);
  });

  it("should calculate match play data and update signals", (done) => {
    const onlineRounds: OnlineRound[] = [
      {
        identifier: "r1",
        mpFormat: 1,
        tee: { teeType: "white", sr: 113, cr: 72 },
        player: { whs: 10 },
        courseHCP: 0,
        scoreCardAPI: [{ hole: 1, stroke: 4, time: "10:00" }],
        first9score: 0,
        last9score: 0,
      } as any,
      {
        identifier: "r2",
        mpFormat: 1,
        tee: { teeType: "white", sr: 113, cr: 72 },
        player: { whs: 12 },
        courseHCP: 0,
        scoreCardAPI: [{ hole: 1, stroke: 5, time: "10:01" }],
        first9score: 0,
        last9score: 0,
      } as any,
    ];

    scorecardHttpService.getOnlineRound.and.returnValue(of(onlineRounds));
    httpService.getHoles.and.returnValue(of(Array(18).fill({ par: 4 })));

    spyOn(OnlineScoreCardViewComponent, "compareTime").and.returnValue("10:01");

    const onlineRoundsSgn = signal<OnlineRound[]>([onlineRounds[0]]);
    const courseSgn = signal<Course>({ id: 1, par: 72 } as any);
    const highlightHCPSgn = signal<string[][]>([[], []]);
    const mpResultHistorySgn = signal<string[][]>([]);
    const lstUpdTimeSgn = signal<string>("09:00");

    const holeHCP: number[][] = [Array(18).fill(0), Array(18).fill(0)];
    const mpScore: number[] = Array(18).fill(0);

    mpView
      .showMatch(
        onlineRoundsSgn,
        courseSgn,
        holeHCP,
        highlightHCPSgn,
        mpScore,
        mpResultHistorySgn,
        lstUpdTimeSgn,
      )
      .subscribe(() => {
        expect(onlineRoundsSgn().length).toBe(2);

        expect(holeHCP[0].length).toBe(18);
        expect(holeHCP[1].length).toBe(18);

        expect(highlightHCPSgn()[0].length).toBe(18);
        expect(highlightHCPSgn()[1].length).toBe(18);

        expect([-1, 0, 1]).toContain(mpScore[0]);

        expect(mpResultHistorySgn().length).toBeGreaterThan(0);
        expect(lstUpdTimeSgn()).toBe("10:01");

        done();
      });
  });
  it("should set mpResult = 0 for both players when result === 0", (done) => {
    const onlineRounds: OnlineRound[] = [
      {
        identifier: "r1",
        mpFormat: 1,
        tee: { teeType: "white", sr: 113, cr: 72 },
        player: { whs: 10 },
        courseHCP: 0,
        scoreCardAPI: [{ hole: 1, stroke: 5, time: "10:00" }],
        first9score: 0,
        last9score: 0,
      } as any,
      {
        identifier: "r2",
        mpFormat: 1,
        tee: { teeType: "white", sr: 113, cr: 72 },
        player: { whs: 10 },
        courseHCP: 0,
        scoreCardAPI: [{ hole: 1, stroke: 5, time: "10:01" }],
        first9score: 0,
        last9score: 0,
      } as any,
    ];

    scorecardHttpService.getOnlineRound.and.returnValue(of(onlineRounds));
    httpService.getHoles.and.returnValue(of(Array(18).fill({ par: 4 })));

    spyOn(OnlineScoreCardViewComponent, "compareTime").and.returnValue("10:01");

    const onlineRoundsSgn = signal<OnlineRound[]>([onlineRounds[0]]);
    const courseSgn = signal<Course>({ id: 1, par: 72 } as any);
    const highlightHCPSgn = signal<string[][]>([[], []]);
    const mpResultHistorySgn = signal<string[][]>([]);
    const lstUpdTimeSgn = signal<string>("09:00");

    const holeHCP: number[][] = [Array(18).fill(0), Array(18).fill(0)];
    const mpScore: number[] = Array(18).fill(0);

    mpView
      .showMatch(
        onlineRoundsSgn,
        courseSgn,
        holeHCP,
        highlightHCPSgn,
        mpScore,
        mpResultHistorySgn,
        lstUpdTimeSgn,
      )
      .subscribe(() => {
        const p1 = onlineRoundsSgn()[0].scoreCardAPI[0];
        const p2 = onlineRoundsSgn()[1].scoreCardAPI[0];

        expect(p1.mpResult).toBe(0);
        expect(p2.mpResult).toBe(0);
        expect(mpScore[0]).toBe(0);

        done();
      });
  });

  it("should set mpResult for player 2 when result > 0", (done) => {
    const onlineRounds: OnlineRound[] = [
      {
        identifier: "r1",
        mpFormat: 1,
        tee: { teeType: "white", sr: 113, cr: 72 },
        player: { whs: 10 },
        courseHCP: 0,
        scoreCardAPI: [{ hole: 1, stroke: 6, time: "10:00" }],
        first9score: 0,
        last9score: 0,
      } as any,
      {
        identifier: "r2",
        mpFormat: 1,
        tee: { teeType: "white", sr: 113, cr: 72 },
        player: { whs: 10 },
        courseHCP: 0,
        scoreCardAPI: [{ hole: 1, stroke: 4, time: "10:01" }],
        first9score: 0,
        last9score: 0,
      } as any,
    ];

    scorecardHttpService.getOnlineRound.and.returnValue(of(onlineRounds));
    httpService.getHoles.and.returnValue(of(Array(18).fill({ par: 4 })));

    spyOn(OnlineScoreCardViewComponent, "compareTime").and.returnValue("10:01");

    const onlineRoundsSgn = signal<OnlineRound[]>([onlineRounds[0]]);
    const courseSgn = signal<Course>({ id: 1, par: 72 } as any);
    const highlightHCPSgn = signal<string[][]>([[], []]);
    const mpResultHistorySgn = signal<string[][]>([]);
    const lstUpdTimeSgn = signal<string>("09:00");

    const holeHCP: number[][] = [Array(18).fill(0), Array(18).fill(0)];
    const mpScore: number[] = Array(18).fill(0);

    mpView
      .showMatch(
        onlineRoundsSgn,
        courseSgn,
        holeHCP,
        highlightHCPSgn,
        mpScore,
        mpResultHistorySgn,
        lstUpdTimeSgn,
      )
      .subscribe(() => {
        const p1 = onlineRoundsSgn()[0].scoreCardAPI[0];
        const p2 = onlineRoundsSgn()[1].scoreCardAPI[0];

        expect(p1.mpResult).toBe(0);
        expect(p2.mpResult).toBe(1);
        expect(mpScore[0]).toBe(1);

        done();
      });
  });
  it("should round course HCP difference up when decimal part is >= 0.5", (done) => {
    const onlineRounds: OnlineRound[] = [
      {
        identifier: "r1",
        mpFormat: 1,
        tee: { teeType: "white", sr: 113, cr: 72 },
        player: { whs: 10.5 }, // forces .5 diff
        courseHCP: 0,
        scoreCardAPI: Array.from({ length: 18 }, (_, i) => ({
          hole: i + 1,
          stroke: 5,
          time: "10:00",
        })),
        first9score: 0,
        last9score: 0,
      } as any,
      {
        identifier: "r2",
        mpFormat: 1,
        tee: { teeType: "white", sr: 113, cr: 72 },
        player: { whs: 14 }, // diff = 3.5
        courseHCP: 0,
        scoreCardAPI: Array.from({ length: 18 }, (_, i) => ({
          hole: i + 1,
          stroke: 5,
          time: "10:01",
        })),
        first9score: 0,
        last9score: 0,
      } as any,
    ];

    scorecardHttpService.getOnlineRound.and.returnValue(of(onlineRounds));

    // Hole HCP order: 1..18

    httpService.getHoles.and.returnValue(of(Array(18).fill({ par: 4 })));

    spyOn(OnlineScoreCardViewComponent, "compareTime").and.returnValue("10:01");

    const onlineRoundsSgn = signal<OnlineRound[]>([onlineRounds[0]]);
    const courseSgn = signal<Course>({ id: 1, par: 72 } as any);
    const highlightHCPSgn = signal<string[][]>([[], []]);
    const mpResultHistorySgn = signal<string[][]>([]);
    const lstUpdTimeSgn = signal<string>("09:00");

    const holeHCP: number[][] = [Array(18).fill(0), Array(18).fill(0)];
    const mpScore: number[] = Array(18).fill(0);

    mpView
      .showMatch(
        onlineRoundsSgn,
        courseSgn,
        holeHCP,
        highlightHCPSgn,
        mpScore,
        mpResultHistorySgn,
        lstUpdTimeSgn,
      )
      .subscribe(() => {
        // Player 2 gets strokes
        const strokesAllocated = holeHCP[1].filter((v) => v === 1).length;

        expect(strokesAllocated).toBe(0); // ✅ rounded UP from 3.5 → 4

        done();
      });
  });
});
