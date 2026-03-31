import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OnlineRound } from '../_models/onlineRound';
import { OnlineScoreCard } from '../_models/onlineScoreCard';
import { AppConfig } from '../_models/appConfig';


@Injectable({ providedIn: 'root' })
export class ScorecardHttpService {
  private readonly http = inject(HttpClient);


  getOnlineRounds(): Observable<Array<OnlineRound>> {
    return this.http.get<Array<OnlineRound>>('rest/OnlineRound/all');
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

  deleteOnlineRound(identifier: number) {
    return this.http.delete('rest/OnlineRound/' + identifier);
  }

  finalize(identifier: number): Observable<HttpResponse<null>> {

    return this.http.post<HttpResponse<null>>('rest/OnlineRound', identifier);
  }

  getOnlineRound(identifier: number): Observable<Array<OnlineRound>> {
    return this.http.get<Array<OnlineRound>>('rest/OnlineRound/Identifier/' + identifier);
  }

  syncOnlineScoreCards(onlineScoreCards: Array<OnlineScoreCard>): Observable<HttpResponse<null>> {

    return this.http.post<HttpResponse<null>>('rest/OnlineScoreCard', onlineScoreCards);
  }

  getAppConfig(): Observable<AppConfig> {

    return this.http.get<AppConfig>('./assets/app-config.json');
  }
}


