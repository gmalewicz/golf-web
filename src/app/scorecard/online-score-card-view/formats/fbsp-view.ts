import { calculateHoleHCP, calculateUnroundedCourseHCP, getPlayedCoursePar } from "@/_helpers/whs.routines";
import { calculateFbspTeamResults, FbspResult } from "@/_helpers/fbsp.routines";
import { Course } from "@/_models/course";
import { HttpService } from "@/_services/http.service";
import { OnlineRound } from "@/scorecard/_models/onlineRound";
import { ScorecardHttpService } from "@/scorecard/_services/scorecardHttp.service";
import { WritableSignal } from "@angular/core";
import { forkJoin, map, Observable, tap } from "rxjs";
import { OnlineScoreCardViewComponent } from "../online-score-card-view.component";
import { updateStartingHole } from "./common";

const HOLES = 18;

export function calculateFbspResult(rounds: OnlineRound[], holeHcp: number[][]): FbspResult {

  return calculateFbspTeamResults(
    (rounds ?? []).map(round => Array.from({ length: HOLES }, (_, hole) => round.scoreCardAPI?.[hole]?.stroke)),
    (rounds ?? []).map(round => round.team),
    holeHcp);
}

export class FBSPView {
  constructor(private readonly scorecardHttpService: ScorecardHttpService,
              private readonly httpService: HttpService,
  ) {}

  showFBSP(onlineRoundsSgn: WritableSignal<OnlineRound[]>,
           courseSgn: WritableSignal<Course>,
           holeHcpSgn: WritableSignal<number[][]>,
           lstUpdTimeSgn: WritableSignal<string>
          ): Observable<void> {

    return forkJoin([
      this.scorecardHttpService.getOnlineRound(onlineRoundsSgn()[0].identifier),
      this.httpService.getHoles(courseSgn().id)])
    .pipe(tap(([retOnlineRounds, retHoles]) => {

      courseSgn().holes = retHoles;

      // always the same sequence of players: by team and then by player
      retOnlineRounds.sort((or1, or2) => or1.team - or2.team || or1.player.id - or2.player.id);

      const holeHcp: number[][] = retOnlineRounds.map(() => new Array(HOLES).fill(0));

      retOnlineRounds.forEach((or, idx) => {

        // allowance is applied to the unrounded course HCP and the result is rounded
        or.courseHCP = Math.round(
          calculateUnroundedCourseHCP(or.tee.teeType,
                                      or.player.whs,
                                      or.tee.sr,
                                      or.tee.cr,
                                      getPlayedCoursePar(retHoles, or.tee.teeType, courseSgn().par)) * (or.mpFormat ?? 1));

        updateStartingHole(or);

        or.scoreCardAPI.filter(sc => sc !== null).forEach(sc =>
          lstUpdTimeSgn.set(OnlineScoreCardViewComponent.compareTime(lstUpdTimeSgn(), sc.time)));

        calculateHoleHCP(idx, or.tee.teeType, or.courseHCP, holeHcp, courseSgn());
      });

      holeHcpSgn.set(holeHcp);
      onlineRoundsSgn.set([...retOnlineRounds]); // trigger change detection
    }),
    map(() => void 0));
  }
}
