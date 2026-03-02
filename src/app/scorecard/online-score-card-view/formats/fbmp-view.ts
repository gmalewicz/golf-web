import { calculateHoleHCP, calculateUnroundedCourseHCP, createMPResultHistory } from "@/_helpers/whs.routines";
import { Course } from "@/_models/course";
import { HttpService } from "@/_services/http.service";
import { OnlineRound } from "@/scorecard/_models/onlineRound";
import { ScorecardHttpService } from "@/scorecard/_services/scorecardHttp.service";
import { WritableSignal } from "@angular/core";
import { forkJoin, map, Observable, tap } from "rxjs";
import { OnlineScoreCardViewComponent } from "../online-score-card-view.component";
import { updateStartingHole } from "./common";

export class FBMPView {
  constructor(private readonly scorecardHttpService: ScorecardHttpService,
              private readonly httpService: HttpService,
              
  ) {}

  showFBMatch(onlineRoundsSgn: WritableSignal<OnlineRound[]>,
            courseSgn: WritableSignal<Course>,
            holeHCP: number[][],
            mpScore: number[],
            mpResultHistorySgn: WritableSignal<string[][]>,
            lstUpdTimeSgn: WritableSignal<string>,
            highlightResultSgn: WritableSignal<string[][]>
          ) : Observable<void> {

      return forkJoin([
          this.scorecardHttpService.getOnlineRound(onlineRoundsSgn()[0].identifier),
          this.httpService.getHoles(courseSgn().id)])
      .pipe(tap(([retOnlineRounds, retHoles]) => {  

          courseSgn().holes = retHoles;

          retOnlineRounds.forEach(or => {

              or.courseHCP = calculateUnroundedCourseHCP(or.tee.teeType,
              or.player.whs,
              or.tee.sr,
              or.tee.cr,
              courseSgn().par);

              updateStartingHole(or);

          });
        
          const minHcp = retOnlineRounds.reduce((prevVal, or) => Math.min(or.courseHCP, prevVal), retOnlineRounds[0].courseHCP);
          retOnlineRounds.forEach(or => or.courseHCP -= minHcp);
          retOnlineRounds.forEach(or => or.courseHCP = Math.round(or.courseHCP * or.mpFormat));

          for (let i = 0; i < 4; i++) {
            calculateHoleHCP(
              i,
              retOnlineRounds[i].tee.teeType,
              retOnlineRounds[i].courseHCP,
              holeHCP,
              courseSgn()
            );
          }

          this.calculateMpResult(retOnlineRounds, holeHCP, mpScore, lstUpdTimeSgn, highlightResultSgn);

          onlineRoundsSgn.set([...retOnlineRounds]); // trigger change detection

          // calculate MP result history
          mpResultHistorySgn.set(createMPResultHistory(mpScore));
      }),
      map(() => void 0));
  }



  private calculateMpResult(retOnlineRounds: OnlineRound[],
                            holeHCP: number[][],
                            mpScore: number[],
                            lstUpdTimeSgn: WritableSignal<string>,
                            highlightResultSgn: WritableSignal<string[][]>) {

    retOnlineRounds[0].scoreCardAPI.forEach((sc, index) => {

      if (sc === null || 
          retOnlineRounds[1].scoreCardAPI[index] === null || 
          retOnlineRounds[2].scoreCardAPI[index] === null || 
          retOnlineRounds[3].scoreCardAPI[index] === null ) {
        return;
      }

      const firstTeamResult = Math.min(retOnlineRounds[0].scoreCardAPI[index].stroke - holeHCP[0][index],
                                      retOnlineRounds[1].scoreCardAPI[index].stroke - holeHCP[1][index]);
      const secondTeamResult = Math.min(retOnlineRounds[2].scoreCardAPI[index].stroke - holeHCP[2][index],
                                      retOnlineRounds[3].scoreCardAPI[index].stroke - holeHCP[3][index]);   

      // calculate mp result

      if (firstTeamResult < secondTeamResult) {
        mpScore[index] = -1;
        highlightResultSgn()[0][index] = "highlightMPResult";
        
      } else if (firstTeamResult === secondTeamResult) {
        mpScore[index] = 0;
      } else {
        highlightResultSgn()[1][index] = "highlightMPResult";
        mpScore[index] = 1;
      }
      
      lstUpdTimeSgn.set(OnlineScoreCardViewComponent.compareTime(lstUpdTimeSgn(), sc.time));
      
    });
  }
}