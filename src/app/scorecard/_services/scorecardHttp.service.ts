import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Round} from '@/_models';
import { OnlineRound } from '../_models/onlineRound';
import { OnlineScoreCard } from '../_models/onlineScoreCard';


@Injectable()
export class ScorecardHttpService {

  constructor(private http: HttpClient) { }

  getOnlineRounds(): Observable<Array<OnlineRound>> {
    return this.http.get<Array<OnlineRound>>('rest/OnlineRound');
  }

  getOnlineScoreCard(onlineRoundId: number): Observable<Array<OnlineScoreCard>> {
    return this.http.get<Array<OnlineScoreCard>>('rest/OnlineScoreCard/'  + onlineRoundId);
  }

  getOnlineRoundsForCourse(courseId: number): Observable<Array<OnlineRound>> {
    return this.http.get<Array<OnlineRound>>('rest/OnlineRoundCourse/' + courseId);
  }

  addOnlineRounds(onlineRounds: Array<OnlineRound>): Observable<Array<OnlineRound>> {

    return this.http.post<Array<OnlineRound>>('rest/OnlineRounds', onlineRounds);
  }

  deleteOnlineRoundForOwner(ownerId: number) {
    return this.http.delete('rest/OnlineRoundForOwner/' + ownerId);
  }

  finalizeOnlineOwnerRound(ownerId: number): Observable<HttpResponse<null>> {

    return this.http.post<HttpResponse<null>>('rest/FinalizeOnlineOwnerRounds/', ownerId);
  }

  getOnlineRoundsForOwner(ownerId: number): Observable<Array<OnlineRound>> {
    return this.http.get<Array<OnlineRound>>('rest/OnlineRoundOwner/' + ownerId);
  }
}


