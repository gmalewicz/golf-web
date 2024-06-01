import { TeeTimeParameters } from '@/tournament/_models';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Round } from '@/_models';
import { Tournament, TournamentPlayer, TournamentResult, TournamentRound } from '../_models';


@Injectable({ providedIn: 'root' })
export class TournamentHttpService {

  constructor(private http: HttpClient) { }

    // gets tournaments
  getTournaments(page: number): Observable<Array<Tournament>> {
    return this.http.get<Array<Tournament>>('rest/Tournament/' + page);
  }

  // gets tournament results
  getTournamentResults(tournamentId: number): Observable<Array<TournamentResult>> {
    return this.http.get<Array<TournamentResult>>('rest/TournamentResult/' + tournamentId);
  }

  // gets rounds that can be added to tournament
  getTournamentRounds(tournamentId: number): Observable<Array<Round>> {
    return this.http.get<Array<Round>>('rest/TournamentRounds/' + tournamentId);
  }

  addRoundToTournament(round: Round, tournamentId: number): Observable<void> {

    return this.http.post<void>('rest/TournamentRound/' + tournamentId, round);
  }

  addTournament(tournament: Tournament): Observable<void> {
    return this.http.post<void>('rest/Tournament', tournament);
  }

  // gets tournamnet rounds
  getTournamentResultRounds(resultId: number): Observable<Array<TournamentRound>> {
    return this.http.get<Array<TournamentRound>>('rest/TournamentResultRound/' + resultId);
  }

  // add round on behalf
  addRoundonBehalf(round: Round, tournamentId: number): Observable<TournamentRound> {

    return this.http.post<TournamentRound>('rest/TournamentRoundOnBehalf/' + tournamentId, round);

  }

  // gets round for given id
  getRound(roundId: number): Observable<Round> {
    return this.http.get<Round>('rest/Round/' + roundId);
  }

  // gets round for given id
  deleteResult(resultId: number): Observable<void> {
    return this.http.delete<void>('rest/TournamentResult/' + resultId);
  }

  // gets eagle results
  closeTournament(tournamentId: number): Observable<void> {

    return this.http.patch<void>('rest/TournamentClose/' + tournamentId, null);
  }

  // deletes tournament for given id
  deleteTournament(tournamentId: number): Observable<void> {
    return this.http.delete<void>('rest/Tournament/' + tournamentId);
  }

  // gets players for given tournament
  getTournamentPlayers(tournamentId: number): Observable<Array<TournamentPlayer>> {
    return this.http.get<Array<TournamentPlayer>>('rest/TournamentPlayer/' + tournamentId);
  }

  // add player to the tournament
  addTournamentPlayer(tournamentPlayer: TournamentPlayer): Observable<void> {
    return this.http.post<void>('rest/TournamentPlayer', tournamentPlayer);
  }

  // deletes tournament player
  deleteTournamentPlayer(tournamentId: number, playerId: number): Observable<void> {
    return this.http.delete<void>('rest/TournamentPlayer/' + tournamentId + '/' + playerId);
  }

  // updates handicap of tournament player
  updateTournamentPlayer(tournamentPlayer: TournamentPlayer): Observable<void> {
    return this.http.patch<void>('rest/TournamentPlayer', tournamentPlayer);
  }

  saveTeeTimes(tournamentId: number, teeTimeParameters: TeeTimeParameters): Observable<void> {
    return this.http.post<void>('rest/Tournament/TeeTime/' + tournamentId, teeTimeParameters);
  }

  getTeeTimes(tournamentId: number): Observable<TeeTimeParameters> {
    return this.http.get<TeeTimeParameters>('rest/Tournament/TeeTime/' + tournamentId);
  }

  deleteTeeTimes(tournamentId: number): Observable<void> {
    return this.http.delete<void>('rest/Tournament/TeeTime/' + tournamentId);
  }

  subscribe(tournamentId: number): Observable<void> {
    return this.http.post<void>('rest/Tournament/AddNotification/' + tournamentId, {});
  }

  unsubscribe(tournamentId: number): Observable<void> {
    return this.http.post<void>('rest/Tournament/RemoveNotification/' + tournamentId, {});
  }

  notify(tournamentId: number, sort: number): Observable<void> {
    return this.http.post<void>('rest/Tournament/Notification/' + tournamentId + "/" + sort, {});
  }
}


