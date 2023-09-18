import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { League, LeagueMatch, LeaguePlayer } from '../_models';

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

   // gets players for given league
   getLeaguePlayers(leagueId: number): Observable<Array<LeaguePlayer>> {
    return this.http.get<Array<LeaguePlayer>>('rest/LeaguePlayer/' + leagueId);
  }

  // add player to the league
  addLeaguePlayer(leaguePlayer: LeaguePlayer): Observable<LeaguePlayer> {

    return this.http.post<LeaguePlayer>('rest/LeaguePlayer', leaguePlayer);

  }

  // deletes league player
  deleteLeaguePlayer(leagueId: number, playerId: number): Observable<void> {
    return this.http.delete<void>('rest/LeaguePlayer/' + leagueId + '/' + playerId);
  }

  // gets eagle results
  closeLeague(leagueId: number): Observable<void> {

    return this.http.patch<void>('rest/LeagueClose/' + leagueId, null);
  }

  // add league Match
  addMatch(leagueMatch: LeagueMatch): Observable<void> {

    return this.http.post<void>('rest/LeagueMatch', leagueMatch);

  }

  // get leagues
  getMatches(leagueId: number): Observable<Array<LeagueMatch>> {
    return this.http.get<Array<LeagueMatch>>('rest/LeagueMatch/' + leagueId);
  }

}


