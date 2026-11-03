import { calculateFbspResult, FBSPView } from "./fbsp-view";
import { ScorecardHttpService } from "@/scorecard/_services/scorecardHttp.service";
import { HttpService } from "@/_services/http.service";
import { signal } from "@angular/core";
import { of } from "rxjs";
import { Course } from "@/_models/course";
import { Hole } from "@/_models/hole";
import { OnlineRound } from "@/scorecard/_models/onlineRound";

describe("FBSPView", () => {

  function createRound(id: number, team: number, strokes: number[]): OnlineRound {
    return {
      id,
      identifier: 1,
      team,
      mpFormat: 0.85,
      tee: { teeType: 0, sr: 113, cr: 72 },
      player: { id, whs: 10 },
      scoreCardAPI: strokes.map((stroke, i) => ({ hole: i + 1, stroke, time: "10:0" + i })),
    } as unknown as OnlineRound;
  }

  function createScoreCards(strokes: number[]): (object | null)[] {
    const sc = new Array(18).fill(null);
    strokes.forEach((stroke, i) => sc[i] = { hole: i + 1, stroke, time: "10:00" });
    return sc;
  }

  function createCalculatedRound(id: number, team: number, strokes: number[]): OnlineRound {
    const round = createRound(id, team, []);
    round.scoreCardAPI = createScoreCards(strokes) as OnlineRound["scoreCardAPI"];
    return round;
  }

  const noHcp = () => Array.from({ length: 4 }, () => new Array(18).fill(0));

  it("should calculate team net as best net score and mark counting players", () => {
    const rounds = [
      createCalculatedRound(1, 1, [5, 4]),
      createCalculatedRound(2, 1, [5, 6]),
      createCalculatedRound(3, 2, [4, 4]),
      createCalculatedRound(4, 2, [6, 7]),
    ];
    const hcp = noHcp();
    hcp[1][0] = 1;

    const result = calculateFbspResult(rounds, hcp);

    expect(result.teams.length).toBe(2);
    expect(result.teams[0].holes.slice(0, 2)).toEqual([4, 4]);
    expect(result.teams[1].holes.slice(0, 2)).toEqual([4, 4]);
    expect(result.teams[0].total).toBe(8);
    expect(result.counting[0][0]).toBeFalse();
    expect(result.counting[1][0]).toBeTrue();
    expect(result.counting[0][1]).toBeTrue();
    expect(result.counting[2][1]).toBeTrue();
  });

  it("should not calculate team result until all team players have a score", () => {
    const rounds = [
      createCalculatedRound(1, 1, [5, 4]),
      createCalculatedRound(2, 1, [5]),
    ];

    const result = calculateFbspResult(rounds, noHcp());

    expect(result.teams[0].holes[0]).toBe(5);
    expect(result.teams[0].holes[1]).toBeUndefined();
    expect(result.teams[0].total).toBe(5);
  });

  it("should ignore picked up ball unless all team players picked up", () => {
    const rounds = [
      createCalculatedRound(1, 1, [16, 16]),
      createCalculatedRound(2, 1, [6, 16]),
    ];

    const result = calculateFbspResult(rounds, noHcp());

    expect(result.teams[0].holes[0]).toBe(6);
    expect(result.teams[0].holes[1]).toBeUndefined();
    expect(result.counting[0][0]).toBeFalse();
    expect(result.counting[1][0]).toBeTrue();
  });

  it("should load rounds, apply allowance and calculate hole handicaps", (done) => {
    const scorecardHttpService = jasmine.createSpyObj<ScorecardHttpService>("ScorecardHttpService", ["getOnlineRound"]);
    const httpService = jasmine.createSpyObj<HttpService>("HttpService", ["getHoles"]);

    const rounds = [
      createRound(2, 2, [4]),
      createRound(1, 1, [5]),
    ];
    scorecardHttpService.getOnlineRound.and.returnValue(of(rounds));
    httpService.getHoles.and.returnValue(of(Array.from({ length: 18 }, (_, i) => ({ number: i + 1, par: 4, si: i + 1 }) as unknown as Hole)));

    const onlineRoundsSgn = signal<OnlineRound[]>([rounds[0]]);
    const courseSgn = signal({ id: 1, par: 72, holes: [] } as unknown as Course);
    const holeHcpSgn = signal<number[][]>([]);
    const lstUpdTimeSgn = signal("09:00");

    new FBSPView(scorecardHttpService, httpService)
      .showFBSP(onlineRoundsSgn, courseSgn, holeHcpSgn, lstUpdTimeSgn)
      .subscribe({
        error: (err) => done.fail(err),
        complete: () => {
          // sorted by team
          expect(onlineRoundsSgn()[0].team).toBe(1);
          // 10 * 113 / 113 + 72 - 72 = 10, 85% => 8.5 => 9
          expect(onlineRoundsSgn()[0].courseHCP).toBe(9);
          expect(holeHcpSgn().length).toBe(2);
          expect(holeHcpSgn()[0].reduce((p, n) => p + n, 0)).toBe(9);
          expect(lstUpdTimeSgn()).toBe("10:00");
          done();
        }
      });
  });
});
