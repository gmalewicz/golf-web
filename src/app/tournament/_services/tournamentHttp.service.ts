import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Round, Tournament, TournamentResult, TournamentRound } from '@/_models';


@Injectable()
export class TournamentHttpService {

  constructor(private http: HttpClient) { }

    // gets tournaments
  getTournaments(): Observable<Array<Tournament>> {
    return this.http.get<Array<Tournament>>('rest/Tournament');
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

}


