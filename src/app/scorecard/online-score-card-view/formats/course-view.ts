import { HttpService } from "@/_services/http.service";
import { OnlineRound } from "@/scorecard/_models/onlineRound";
import { ScorecardHttpService } from "@/scorecard/_services/scorecardHttp.service";
import { WritableSignal } from "@angular/core";
import { forkJoin, map, Observable, tap } from "rxjs";
import { OnlineScoreCardViewComponent } from "../online-score-card-view.component";
import { OnlineScoreCard } from "@/scorecard/_models";
import { ballPickedUpStrokes } from "@/_helpers/common";
import { HALF_HOLES } from "@/scorecard/_helpers/constants";
import { Course } from "@/_models/course";

export class CourseView {
    constructor(private readonly scorecardHttpService: ScorecardHttpService,
                private readonly httpService: HttpService,
                
    ) {}

    showCourse(scoreBruttoClassSgn: WritableSignal<string[][]>,
               onlineRoundsSgn: WritableSignal<OnlineRound[]>,
               courseSgn: WritableSignal<Course>,
               first9ballPickedUpSgn: WritableSignal<boolean[]>,
               last9ballPickedUpSgn: WritableSignal<boolean[]>,
               lstUpdTimeSgn: WritableSignal<string>,
               finalizedSgn: WritableSignal<boolean>
    ) : Observable<void> {

    // initialize colour display class for results
    scoreBruttoClassSgn.set(new Array(1).fill('').map(() => new Array(18).fill('')));

    return forkJoin ([
      this.scorecardHttpService.getOnlineRoundsForCourse(courseSgn().id), 
       this.httpService.getHoles(courseSgn().id)])
    .pipe(tap(([retOnlineRounds, retHoles]) => { 

        first9ballPickedUpSgn.set(Array(retOnlineRounds.length).fill(false));
        last9ballPickedUpSgn.set(Array(retOnlineRounds.length).fill(false));
        courseSgn().holes = retHoles;

        // initialize colour display class for results
        scoreBruttoClassSgn.set(new Array(retOnlineRounds.length).fill('').map(() => new Array(18).fill('')));

        finalizedSgn.set(true);

        retOnlineRounds.forEach((retOnlineRound, idx) => {

          if (!retOnlineRound.finalized) {
            finalizedSgn.set(false);
          }

          const retScoreCardAPI = retOnlineRound.scoreCardAPI;
          retOnlineRound.scoreCardAPI = Array(18).fill(null);
          retOnlineRound.first9score = 0;
          retOnlineRound.last9score = 0;

          let lastIdx = 0;

          retScoreCardAPI.forEach((scoreCardAPI, id) => {
            // set ball picked up for a player
            this.setBallPickUp(scoreCardAPI, idx, first9ballPickedUpSgn, last9ballPickedUpSgn);

            retOnlineRound.scoreCardAPI[scoreCardAPI.hole - 1] = scoreCardAPI;
            if (scoreCardAPI.hole < 10) {
              retOnlineRound.first9score += scoreCardAPI.stroke;
            } else {
              retOnlineRound.last9score += scoreCardAPI.stroke;
            }

            // create colour
            scoreBruttoClassSgn()[idx][scoreCardAPI.hole - 1] =
              OnlineScoreCardViewComponent.prepareColoursForResults(scoreCardAPI.stroke, courseSgn().holes[scoreCardAPI.hole - 1].par);
            scoreBruttoClassSgn.set([...scoreBruttoClassSgn()]); // trigger change detection

            lstUpdTimeSgn.set(OnlineScoreCardViewComponent.compareTime(lstUpdTimeSgn(), scoreCardAPI.time));
            //this.resetCounter();

            if (id > lastIdx) {
              lastIdx = id;
            }
          });
          onlineRoundsSgn.update(() => retOnlineRounds);           
        });

        onlineRoundsSgn.update(() => retOnlineRounds); 
        // create pars for first and last 9
        onlineRoundsSgn.set([...onlineRoundsSgn()]); // trigger change detection
        //startLisenning();
        //this.displaySgn.set(true);
    }),
    map(() => void 0));
  }

  private setBallPickUp(scoreCardAPI: OnlineScoreCard, 
                        idx: number,
                        first9ballPickedUpSgn: WritableSignal<boolean[]>,
                        last9ballPickedUpSgn: WritableSignal<boolean[]>) {

    if (scoreCardAPI.stroke === ballPickedUpStrokes && scoreCardAPI.hole <= HALF_HOLES) {
      first9ballPickedUpSgn()[idx] = true;
      first9ballPickedUpSgn.set([...first9ballPickedUpSgn()]); // trigger change detection
    }
    if (scoreCardAPI.stroke === ballPickedUpStrokes && scoreCardAPI.hole > HALF_HOLES) {
      last9ballPickedUpSgn()[idx] = true;
      last9ballPickedUpSgn.set([...last9ballPickedUpSgn()]); // trigger change detection
    }
  }
}