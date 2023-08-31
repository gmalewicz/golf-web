import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { League } from '../_models';


@Injectable()
export class LeagueHttpService {

  constructor(private http: HttpClient) { }

  // get leagues
  getLeagues(): Observable<Array<League>> {
    return this.http.get<Array<League>>('rest/League');
  }

  // add league
  addLeague(league: League): Observable<void> {
    return this.http.post<void>('rest/League', league);
  }
}


