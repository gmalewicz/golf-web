import { FBMPView } from "./fbmp-view";
import { ScorecardHttpService } from "@/scorecard/_services/scorecardHttp.service";
import { HttpService } from "@/_services/http.service";
import { signal, WritableSignal } from "@angular/core";
import { of } from "rxjs";
import { Course } from "@/_models/course";
import { OnlineRound } from "@/scorecard/_models/onlineRound";
import { getOnlineRoundFirstPlayer } from "@/scorecard/_helpers/test.helper";
import { Format } from "@/_models/format";

describe("FBMPView", () => {
  let view: FBMPView;
  let scorecardHttpService: jasmine.SpyObj<ScorecardHttpService>;
  let httpService: jasmine.SpyObj<HttpService>;

  beforeEach(() => {
    scorecardHttpService = jasmine.createSpyObj<ScorecardHttpService>(
      "ScorecardHttpService",
      ["getOnlineRound"],
    );

    httpService = jasmine.createSpyObj<HttpService>("HttpService", [
      "getHoles",
    ]);

    view = new FBMPView(scorecardHttpService, httpService);
  });

  function createOnlineRound(
    id: string,
    strokes: number[],
    mpFormat = 1,
  ): OnlineRound {
    return {
      identifier: id,
      mpFormat,
      courseHCP: 0,
      tee: {
        teeType: "M",
        sr: 113,
        cr: 72,
      },
      player: {
        whs: 10,
      },
      scoreCardAPI: strokes.map((stroke, i) => ({
        hole: i + 1,
        stroke,
        time: "10:00",
      })),
      first9score: 0,
      last9score: 0,
    } as unknown as OnlineRound;
  }

  it("should calculate FB match and update signals", (done) => {
    // -------------------- Arrange --------------------

    const onlineRounds = [
      createOnlineRound("1", Array(18).fill(4)),
      createOnlineRound("2", Array(18).fill(5)),
      createOnlineRound("3", Array(18).fill(6)),
      createOnlineRound("4", Array(18).fill(7)),
    ];

    scorecardHttpService.getOnlineRound.and.returnValue(of(onlineRounds));
    httpService.getHoles.and.returnValue(of(Array(18).fill({ par: 4 })));

    // ✅ SAFE to spy – NOT used directly by FBMPView
    //spyOn(whsRoutines, 'calculateUnroundedCourseHCP').and.returnValue(10);
    //spyOn(whsRoutines, 'createMPResultHistory').and.returnValue([['W', 'L']]);

    const onlineRound = getOnlineRoundFirstPlayer();
    onlineRound.mpFormat = Format.FOUR_BALL_STROKE_PLAY;

    const onlineRoundsSgn: WritableSignal<OnlineRound[]> = signal([
      onlineRound,
    ]);

    const courseSgn: WritableSignal<Course> = signal({
      id: 1,
      par: 72,
      holes: [],
    } as Course);

    const holeHCP: number[][] = Array.from({ length: 4 }, () =>
      Array(18).fill(0),
    );

    const mpScore: number[] = Array(18).fill(0);

    const mpResultHistorySgn = signal<string[][]>([]);
    const lstUpdTimeSgn = signal<string>("09:00");

    const highlightResultSgn = signal<string[][]>([
      Array(18).fill(""),
      Array(18).fill(""),
    ]);

    // -------------------- Act --------------------

    view
      .showFBMatch(
        onlineRoundsSgn,
        courseSgn,
        holeHCP,
        mpScore,
        mpResultHistorySgn,
        lstUpdTimeSgn,
        highlightResultSgn,
      )
      .subscribe({
        error: (err) => done.fail(err),
        complete: () => {
          // -------------------- Assert --------------------

          expect(scorecardHttpService.getOnlineRound).toHaveBeenCalled();
          expect(httpService.getHoles).toHaveBeenCalled();

          expect(courseSgn().holes.length).toBe(18);
          expect(onlineRoundsSgn().length).toBe(4);

          // mp score calculated
          expect(mpScore.some((v) => v !== 0)).toBeTrue();

          // result history updated
          expect(mpResultHistorySgn().length).toBe(2);

          // highlight applied
          const highlights = highlightResultSgn().flat();
          expect(highlights.includes("highlightMPResult")).toBeTrue();

          done();
        },
      });
  });

  it("should set mpScore to 0 when teams tie on a hole", (done) => {
    const onlineRounds = [
      createOnlineRound("1", Array(18).fill(4)),
      createOnlineRound("2", Array(18).fill(4)),
      createOnlineRound("3", Array(18).fill(4)),
      createOnlineRound("4", Array(18).fill(4)),
    ];

    scorecardHttpService.getOnlineRound.and.returnValue(of(onlineRounds));
    httpService.getHoles.and.returnValue(of(Array(18).fill({ par: 4 })));

    const onlineRoundsSgn = signal([createOnlineRound("1", [])]);
    const courseSgn = signal({ id: 1, par: 72, holes: [] } as Course);

    const holeHCP = Array.from({ length: 4 }, () => Array(18).fill(0));
    const mpScore = Array(18).fill(-99);

    const mpResultHistorySgn = signal<string[][]>([]);
    const lstUpdTimeSgn = signal("09:00");
    const highlightResultSgn = signal<string[][]>([
      Array(18).fill(""),
      Array(18).fill(""),
    ]);

    view
      .showFBMatch(
        onlineRoundsSgn,
        courseSgn,
        holeHCP,
        mpScore,
        mpResultHistorySgn,
        lstUpdTimeSgn,
        highlightResultSgn,
      )
      .subscribe({
        complete: () => {
          mpScore.forEach((score) => expect(score).toBe(0));

          const highlights = highlightResultSgn().flat();
          expect(highlights.every((h) => h === "")).toBeTrue();

          done();
        },
        error: (err) => done.fail(err),
      });
  });

  it("should highlight second team and set mpScore to 1 when second team wins", (done) => {
    const onlineRounds = [
      createOnlineRound("1", Array(18).fill(6)), // team 1 worse
      createOnlineRound("2", Array(18).fill(6)),
      createOnlineRound("3", Array(18).fill(4)), // team 2 better
      createOnlineRound("4", Array(18).fill(4)),
    ];

    scorecardHttpService.getOnlineRound.and.returnValue(of(onlineRounds));
    httpService.getHoles.and.returnValue(of(Array(18).fill({ par: 4 })));

    const onlineRoundsSgn = signal([createOnlineRound("1", [])]);
    const courseSgn = signal({ id: 1, par: 72, holes: [] } as Course);

    const holeHCP = Array.from({ length: 4 }, () => Array(18).fill(0));
    const mpScore = Array(18).fill(0);

    const mpResultHistorySgn = signal<string[][]>([]);
    const lstUpdTimeSgn = signal("09:00");

    const highlightResultSgn = signal<string[][]>([
      Array(18).fill(""),
      Array(18).fill(""),
    ]);

    view
      .showFBMatch(
        onlineRoundsSgn,
        courseSgn,
        holeHCP,
        mpScore,
        mpResultHistorySgn,
        lstUpdTimeSgn,
        highlightResultSgn,
      )
      .subscribe({
        complete: () => {
          mpScore.forEach((score) => expect(score).toBe(1));

          highlightResultSgn()[1].forEach((h) =>
            expect(h).toBe("highlightMPResult"),
          );

          done();
        },
        error: (err) => done.fail(err),
      });
  });

  it("should skip hole calculation when any scoreCardAPI entry is null", (done) => {
    const strokes = Array(18).fill(4);

    const r1 = createOnlineRound("1", [...strokes]);
    const r2 = createOnlineRound("2", [...strokes]);
    const r3 = createOnlineRound("3", [...strokes]);
    const r4 = createOnlineRound("4", [...strokes]);

    // 👇 Force null score on hole index 4 (hole 5)
    delete r3.scoreCardAPI[4];

    scorecardHttpService.getOnlineRound.and.returnValue(of([r1, r2, r3, r4]));
    httpService.getHoles.and.returnValue(of(Array(18).fill({ par: 4 })));

    const onlineRoundsSgn = signal([createOnlineRound("1", [])]);
    const courseSgn = signal({ id: 1, par: 72, holes: [] } as Course);

    const holeHCP = Array.from({ length: 4 }, () => Array(18).fill(0));

    // Initialize mpScore with sentinel values
    const mpScore = Array(18).fill(99);

    const mpResultHistorySgn = signal<string[][]>([]);
    const lstUpdTimeSgn = signal("09:00");

    const highlightResultSgn = signal<string[][]>([
      Array(18).fill(""),
      Array(18).fill(""),
    ]);

    view
      .showFBMatch(
        onlineRoundsSgn,
        courseSgn,
        holeHCP,
        mpScore,
        mpResultHistorySgn,
        lstUpdTimeSgn,
        highlightResultSgn,
      )
      .subscribe({
        complete: () => {
          // ✅ Hole 5 (index 4) must be untouched
          expect(mpScore[4]).toBe(99);
          expect(highlightResultSgn()[0][4]).toBe("");
          expect(highlightResultSgn()[1][4]).toBe("");

          // ✅ Other holes should be processed
          const processedHoles = mpScore.filter((v) => v !== 99);
          expect(processedHoles.length).toBeGreaterThan(0);

          done();
        },
        error: (err) => done.fail(err),
      });
  });
});
