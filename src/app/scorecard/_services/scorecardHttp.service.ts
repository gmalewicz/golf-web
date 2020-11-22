import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Round} from '@/_models';
import { OnlineRound } from '../_models/onlineRound';
import { OnlineScoreCard } from '../_models/onlineScoreCard';


@Injectable()
export class ScorecardHttpService {

  constructor(private http: HttpClient) { }

  addOnlineRound(onlineRound: OnlineRound): Observable<OnlineRound> {

    return this.http.post<OnlineRound>('rest/OnlineRound', onlineRound);
  }

  getOnlineRounds(): Observable<Array<OnlineRound>> {
    return this.http.get<Array<OnlineRound>>('rest/OnlineRound');
  }

  getOnlineScoreCard(onlineRoundId: number): Observable<Array<OnlineScoreCard>> {
    return this.http.get<Array<OnlineScoreCard>>('rest/OnlineScoreCard/'  + onlineRoundId);
  }

  deleteOnlineRound(id: number) {
    return this.http.delete('rest/OnlineRound/' + id);
  }

  finalizeOnlineRound(onlineRoundId: number): Observable<Round> {

    return this.http.post<Round>('rest/FinalizeOnlineRound/' + onlineRoundId, null);
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
}


