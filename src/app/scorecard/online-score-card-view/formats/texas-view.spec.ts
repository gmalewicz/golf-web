import { getTexasStrokes, TexasView } from "./texas-view";
import { ScorecardHttpService } from "@/scorecard/_services/scorecardHttp.service";
import { HttpService } from "@/_services/http.service";
import { signal } from "@angular/core";
import { of } from "rxjs";
import { Course } from "@/_models/course";
import { Hole } from "@/_models/hole";
import { OnlineRound } from "@/scorecard/_models/onlineRound";
import { TexasTeam } from "@/_helpers/texas-scramble.routines";

describe("TexasView", () => {

  function createRound(id: number, team: number, whs: number, strokes: number[], timePrefix = "10:0"): OnlineRound {
    return {
      id,
      identifier: 1,
      team,
      tee: { teeType: 0, sr: 113, cr: 72 },
      player: { id, nick: "p" + id, whs },
      scoreCardAPI: strokes.map((stroke, i) => ({ hole: i + 1, stroke, time: timePrefix + i })),
    } as unknown as OnlineRound;
  }

  function createHoles(): Hole[] {
    return Array.from({ length: 18 }, (_, i) => ({ number: i + 1, par: 4, si: i + 1 }) as unknown as Hole);
  }

  describe("getTexasStrokes", () => {

    it("should return an empty array when there are no rounds", () => {
      expect(getTexasStrokes(undefined as unknown as OnlineRound[])).toEqual([]);
    });

    it("should return strokes per hole and undefined for holes that are not played", () => {
      const round = createRound(1, 1, 10, [4, 5]);
      round.scoreCardAPI = [round.scoreCardAPI![0], null as never, round.scoreCardAPI![1]];

      const strokes = getTexasStrokes([round]);

      expect(strokes).toHaveSize(1);
      expect(strokes[0]).toHaveSize(18);
      expect(strokes[0].slice(0, 4)).toEqual([4, undefined, 5, undefined]);
    });
  });

  describe("showTexas", () => {

    let scorecardHttpService: jasmine.SpyObj<ScorecardHttpService>;
    let httpService: jasmine.SpyObj<HttpService>;

    beforeEach(() => {
      scorecardHttpService = jasmine.createSpyObj<ScorecardHttpService>("ScorecardHttpService", ["getOnlineRound"]);
      httpService = jasmine.createSpyObj<HttpService>("HttpService", ["getHoles"]);
      httpService.getHoles.and.returnValue(of(createHoles()));
    });

    function show(rounds: OnlineRound[], lstUpdTime: string) {
      scorecardHttpService.getOnlineRound.and.returnValue(of(rounds));

      const onlineRoundsSgn = signal<OnlineRound[]>([rounds[0]]);
      const courseSgn = signal({ id: 1, par: 72, holes: [] } as unknown as Course);
      const teamsSgn = signal<TexasTeam[]>([]);
      const holeHcpSgn = signal<number[][]>([]);
      const lstUpdTimeSgn = signal(lstUpdTime);

      return new Promise<{
        onlineRoundsSgn: typeof onlineRoundsSgn;
        courseSgn: typeof courseSgn;
        teamsSgn: typeof teamsSgn;
        holeHcpSgn: typeof holeHcpSgn;
        lstUpdTimeSgn: typeof lstUpdTimeSgn;
      }>((resolve, reject) => {
        new TexasView(scorecardHttpService, httpService)
          .showTexas(onlineRoundsSgn, courseSgn, teamsSgn, holeHcpSgn, lstUpdTimeSgn)
          .subscribe({
            error: reject,
            complete: () => resolve({ onlineRoundsSgn, courseSgn, teamsSgn, holeHcpSgn, lstUpdTimeSgn })
          });
      });
    }

    it("should load the round by identifier and the holes of the course", async () => {
      const rounds = [createRound(1, 1, 10, [4]), createRound(2, 1, 20, [4])];

      const result = await show(rounds, "09:00");

      expect(scorecardHttpService.getOnlineRound).toHaveBeenCalledWith(1);
      expect(httpService.getHoles).toHaveBeenCalledWith(1);
      expect(result.courseSgn().holes).toHaveSize(18);
    });

    it("should sort players by team and player and keep 18 holes per player", async () => {
      const rounds = [createRound(4, 2, 10, [4, 5]), createRound(1, 1, 10, [4]),
                      createRound(3, 2, 10, [4]), createRound(2, 1, 10, [4])];

      const result = await show(rounds, "09:00");

      expect(result.onlineRoundsSgn().map(round => round.player!.id)).toEqual([1, 2, 3, 4]);
      expect(result.onlineRoundsSgn()[3].scoreCardAPI).toHaveSize(18);
      expect(result.onlineRoundsSgn()[3].scoreCardAPI![1]!.stroke).toBe(5);
      expect(result.onlineRoundsSgn()[3].first9score).toBe(9);
    });

    it("should build the teams with the team handicap and hole handicap strokes", async () => {
      const rounds = [createRound(1, 1, 10, [4]), createRound(2, 1, 20, [4]),
                      createRound(3, 2, 30, [4]), createRound(4, 2, 30, [4])];

      const result = await show(rounds, "09:00");

      expect(result.teamsSgn().map(team => team.team)).toEqual([1, 2]);
      expect(result.teamsSgn().map(team => team.players)).toEqual([[0, 1], [2, 3]]);
      // 10 * 0.35 + 20 * 0.15 = 6.5 => 7
      expect(result.teamsSgn()[0].hcp).toBe(7);
      // 30 * 0.35 + 30 * 0.15 = 15
      expect(result.teamsSgn()[1].hcp).toBe(15);
      expect(result.holeHcpSgn()).toHaveSize(2);
      expect(result.holeHcpSgn()[0].reduce((p, n) => p + n, 0)).toBe(7);
      expect(result.holeHcpSgn()[1].reduce((p, n) => p + n, 0)).toBe(15);
    });

    it("should use the latest score time as the last update time", async () => {
      const rounds = [createRound(1, 1, 10, [4, 4, 4], "10:0"), createRound(2, 1, 10, [4], "11:0")];

      const result = await show(rounds, "09:00");

      expect(result.lstUpdTimeSgn()).toBe("11:00");
    });

    it("should keep the last update time when it is later than the scores", async () => {
      const rounds = [createRound(1, 1, 10, [4]), createRound(2, 1, 10, [4])];

      const result = await show(rounds, "23:59");

      expect(result.lstUpdTimeSgn()).toBe("23:59");
    });
  });
});
