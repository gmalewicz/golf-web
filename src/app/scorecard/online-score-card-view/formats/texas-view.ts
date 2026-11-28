import { buildTexasTeams, calculateTexasHoleHcp, calculateTexasPlayerHcp, TexasTeam } from "@/_helpers/texas-scramble.routines";
import { Course } from "@/_models/course";
import { HttpService } from "@/_services/http.service";
import { OnlineRound } from "@/scorecard/_models/onlineRound";
import { ScorecardHttpService } from "@/scorecard/_services/scorecardHttp.service";
import { WritableSignal } from "@angular/core";
import { forkJoin, map, Observable, tap } from "rxjs";
import { OnlineScoreCardViewComponent } from "../online-score-card-view.component";
import { updateStartingHole } from "./common";

const HOLES = 18;

/**
 * Gross strokes [player][hole] of the rounds, undefined if the score is not entered.
 */
export function getTexasStrokes(rounds: OnlineRound[]): (number | undefined)[][] {

  return (rounds ?? []).map(round => Array.from({ length: HOLES }, (_, hole) => round.scoreCardAPI?.[hole]?.stroke));
}

export class TexasView {
  constructor(private readonly scorecardHttpService: ScorecardHttpService,
              private readonly httpService: HttpService,
  ) {}

  showTexas(onlineRoundsSgn: WritableSignal<OnlineRound[]>,
            courseSgn: WritableSignal<Course>,
            teamsSgn: WritableSignal<TexasTeam[]>,
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

      retOnlineRounds.forEach(or => {

        updateStartingHole(or);

        or.scoreCardAPI.filter(sc => sc !== null).forEach(sc =>
          lstUpdTimeSgn.set(OnlineScoreCardViewComponent.compareTime(lstUpdTimeSgn(), sc.time)));
      });

      const teams = buildTexasTeams(retOnlineRounds.map(or => ({
        team: or.team,
        teeType: or.tee.teeType,
        hcp: calculateTexasPlayerHcp(or.tee.teeType, or.player.whs, or.tee.sr, or.tee.cr, retHoles, courseSgn().par)
      })));

      teamsSgn.set(teams);
      holeHcpSgn.set(calculateTexasHoleHcp(teams, courseSgn()));
      onlineRoundsSgn.set([...retOnlineRounds]); // trigger change detection
    }),
    map(() => void 0));
  }
}
