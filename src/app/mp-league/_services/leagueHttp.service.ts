import { Result } from './../_models/result';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { League, LeagueMatch, LeaguePlayer } from '../_models';

@Injectable()
export class LeagueHttpService {

  constructor(private readonly http: HttpClient) { }

  // get leagues
  getLeagues(pageId: number): Observable<Array<League>> {
    return this.http.get<Array<League>>('rest/League/' + pageId);
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
  addLeaguePlayer(leaguePlayer: LeaguePlayer): Observable<void> {

    return this.http.post<void>('rest/LeaguePlayer', leaguePlayer);

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

  // deletes match
  deleteMatch(leagueId: number, winnerId: number, looserId: number): Observable<void> {
    return this.http.delete<void>('rest/LeagueMatch/' + leagueId + '/' + winnerId + '/' + looserId);
  }

  // deletes league
  deleteLeague(leagueId: number): Observable<void> {
    return this.http.delete<void>('rest/League/' + leagueId);
  }

  // sends notifications to players
  notify(leagueId: number, results: Result[]): Observable<void> {

    return this.http.post<void>('rest/League/Notification/' + leagueId, results);

  }

  subscribe(tournamentId: number): Observable<void> {
    return this.http.post<void>('rest/League/AddNotification/' + tournamentId, {});
  }

  unsubscribe(tournamentId: number): Observable<void> {
    return this.http.post<void>('rest/League/RemoveNotification/' + tournamentId, {});
  }
}


