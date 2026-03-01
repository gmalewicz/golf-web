import { HttpService } from "@/_services/http.service";
import { OnlineRound } from "@/scorecard/_models/onlineRound";
import { ScorecardHttpService } from "@/scorecard/_services/scorecardHttp.service";
import { WritableSignal } from "@angular/core";
import { forkJoin, map, Observable, tap } from "rxjs";
import { OnlineScoreCardViewComponent } from "../online-score-card-view.component";
import { OnlineScoreCard } from "@/scorecard/_models";
import { ballPickedUpStrokes } from "@/_helpers/common";
import { HALF_HOLES } from "@/scorecard/_helpers/constants";

export class RoundView {
    constructor(private readonly scorecardHttpService: ScorecardHttpService,
                private readonly httpService: HttpService,
                
    ) {}

    showRound(scoreBruttoClassSgn: WritableSignal<string[][]>,
              onlineRoundsSgn: WritableSignal<OnlineRound[]>,
              first9ballPickedUpSgn: WritableSignal<boolean[]>,
              last9ballPickedUpSgn: WritableSignal<boolean[]>,
              lstUpdTimeSgn: WritableSignal<string>
    ) : Observable<void> {

    // initialize colour display class for results
    scoreBruttoClassSgn.set(new Array(1).fill('').map(() => new Array(18).fill('')));

    return forkJoin ([
      this.scorecardHttpService.getOnlineScoreCard(onlineRoundsSgn()[0].id), 
      this.httpService.getHoles(onlineRoundsSgn()[0].course.id)])
    .pipe(tap(([retScoreCards, retHoles]) => { 

        first9ballPickedUpSgn.set(new Array(onlineRoundsSgn().length).fill(false));
        last9ballPickedUpSgn.set(new Array(onlineRoundsSgn().length).fill(false));

        const onlineScoreCards: OnlineScoreCard[] = new Array(18);

        onlineRoundsSgn()[0].course.holes = retHoles;
        onlineRoundsSgn()[0].first9score = 0;
        onlineRoundsSgn()[0].last9score = 0;

        let idx = retScoreCards.length;

        while (idx > 0) {
          onlineScoreCards[retScoreCards[idx - 1].hole - 1] = retScoreCards[idx - 1];

          // set ball picked up for a player
          if (retScoreCards[idx - 1].stroke === ballPickedUpStrokes && retScoreCards[idx - 1].hole <= HALF_HOLES) {
            first9ballPickedUpSgn()[0] = true;
            first9ballPickedUpSgn.set([...first9ballPickedUpSgn()]); // trigger change detection
          }
          if (retScoreCards[idx - 1].stroke === ballPickedUpStrokes && retScoreCards[idx - 1].hole > HALF_HOLES) {
            last9ballPickedUpSgn()[0] = true;
            last9ballPickedUpSgn.set([...last9ballPickedUpSgn()]); // trigger change detection
          }

          // initiate first and last 9 total strokes
          if (retScoreCards[idx - 1].hole < 10) {
            onlineRoundsSgn()[0].first9score += retScoreCards[idx - 1].stroke;
          } else {
            onlineRoundsSgn()[0].last9score += retScoreCards[idx - 1].stroke;
          }
          // create colour
          scoreBruttoClassSgn()[0][retScoreCards[idx - 1].hole - 1] =
            OnlineScoreCardViewComponent.prepareColoursForResults(retScoreCards[idx - 1].stroke, onlineRoundsSgn()[0].course.holes[retScoreCards[idx - 1].hole - 1].par);
          scoreBruttoClassSgn.set([...scoreBruttoClassSgn()]); // trigger change detection

          lstUpdTimeSgn.set(OnlineScoreCardViewComponent.compareTime(lstUpdTimeSgn(), retScoreCards[idx - 1].time));
          idx--;
        }

        onlineRoundsSgn()[0].scoreCardAPI = onlineScoreCards;
        onlineRoundsSgn.set([...onlineRoundsSgn()]); // trigger change detection
    }),
    map(() => void 0));
  }
}