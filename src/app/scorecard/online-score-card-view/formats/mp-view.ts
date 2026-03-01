import { calculateHoleHCP, calculateRoundedCourseHCP, createMPResultHistory, createMPResultText, getPlayedCoursePar } from "@/_helpers/whs.routines";
import { Course } from "@/_models/course";
import { HttpService } from "@/_services/http.service";
import { OnlineRound } from "@/scorecard/_models/onlineRound";
import { ScorecardHttpService } from "@/scorecard/_services/scorecardHttp.service";
import { WritableSignal } from "@angular/core";
import { forkJoin, map, Observable, tap } from "rxjs";
import { OnlineScoreCardViewComponent } from "../online-score-card-view.component";

export class MPView {
    constructor(private readonly scorecardHttpService: ScorecardHttpService,
                private readonly httpService: HttpService,
                
    ) {}

    showMatch(onlineRoundsSgn: WritableSignal<OnlineRound[]>,
              courseSgn: WritableSignal<Course>,
              holeHCP: number[][],
              highlightHCPSgn: WritableSignal<string[][]>,
              mpScore: number[],
              mpResultHistorySgn: WritableSignal<string[][]>,
              lstUpdTimeSgn: WritableSignal<string>) : Observable<void> {

        return forkJoin([
            this.scorecardHttpService.getOnlineRound(onlineRoundsSgn()[0].identifier),
            this.httpService.getHoles(courseSgn().id)])
        .pipe(tap(([retOnlineRounds, retHoles]) => {  

            courseSgn().holes = retHoles;

            retOnlineRounds.forEach(or => {

                or.courseHCP = calculateRoundedCourseHCP(or.tee.teeType,
                or.player.whs,
                or.tee.sr,
                or.tee.cr,
                getPlayedCoursePar(courseSgn().holes , or.tee.teeType, courseSgn().par));

                this.updateStartingHole(or);

            });

            const hcpDiff = retOnlineRounds[0].courseHCP - retOnlineRounds[1].courseHCP;
            let corHcpDiff = Math.abs(hcpDiff * retOnlineRounds[0].mpFormat);

            if (corHcpDiff - Math.floor(corHcpDiff) >= 0.5) {
            corHcpDiff = Math.ceil(corHcpDiff);
            } else {
            corHcpDiff = Math.floor(corHcpDiff);
            }

            if (hcpDiff >= 0) {
            retOnlineRounds[0].courseHCP = corHcpDiff;
            retOnlineRounds[1].courseHCP = 0;
            } else {
            retOnlineRounds[0].courseHCP = 0;
            retOnlineRounds[1].courseHCP = Math.abs(corHcpDiff);
            }

            calculateHoleHCP( 0,
            retOnlineRounds[0].tee.teeType,
            retOnlineRounds[0].courseHCP,
                holeHCP,
                courseSgn());

            calculateHoleHCP( 1,
            retOnlineRounds[1].tee.teeType,
            retOnlineRounds[1].courseHCP,
            holeHCP,
            courseSgn());

            highlightHCPSgn()[0] = holeHCP[0].map(hcp => hcp > 0 ? 'highlightHcp' : 'no-edit');
            highlightHCPSgn()[1] = holeHCP[1].map(hcp => hcp > 0 ? 'highlightHcp' : 'no-edit');  
            
            this.calculateMpResult(retOnlineRounds, holeHCP, mpScore, lstUpdTimeSgn);

            onlineRoundsSgn.set([...retOnlineRounds]); // trigger change detection

            // calculate MP result history
            mpResultHistorySgn.set(...[createMPResultHistory(mpScore)]);
        }),
        map(() => void 0));
    }

    private updateStartingHole(onlineRound: OnlineRound) {

        const retScoreCardAPI = onlineRound.scoreCardAPI;

        onlineRound.scoreCardAPI = Array(18).fill(null);

        onlineRound.first9score = 0;
        onlineRound.last9score = 0;

        retScoreCardAPI.forEach(scoreCardAPI => {
        onlineRound.scoreCardAPI[scoreCardAPI.hole - 1] = scoreCardAPI;
        if (scoreCardAPI.hole < 10) {
            onlineRound.first9score += scoreCardAPI.stroke;
        } else {
            onlineRound.last9score += scoreCardAPI.stroke;
        }

        });
    }

    private calculateMpResult(retOnlineRounds: OnlineRound[],
                              holeHCP: number[][],
                              mpScore: number[],
                              lstUpdTimeSgn: WritableSignal<string>) {

    retOnlineRounds[0].scoreCardAPI.forEach((sc, index) => {

      // calculate mp result
      if (sc !== null && retOnlineRounds[1].scoreCardAPI[index] !== null) {

        const result = sc.stroke - holeHCP[0][index] -
        (retOnlineRounds[1].scoreCardAPI[index].stroke - holeHCP[1][index]);

        if (result < 0) {
          sc.mpResult = 1;
          mpScore[index] = -1;
          retOnlineRounds[1].scoreCardAPI[index].mpResult = 0;
        } else if (result === 0) {
          sc.mpResult = 0;
          mpScore[index] = 0;
          retOnlineRounds[1].scoreCardAPI[index].mpResult = 0;
        } else {
          sc.mpResult = 0;
          mpScore[index] = 1;
          retOnlineRounds[1].scoreCardAPI[index].mpResult = 1;
        }
        lstUpdTimeSgn.set(OnlineScoreCardViewComponent.compareTime(lstUpdTimeSgn(), sc.time));
      }
    });
  }
}