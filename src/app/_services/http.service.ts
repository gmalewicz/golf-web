import { OnlineScoreCard } from '@/_models/onlineScoreCard';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Hole, Round, ScoreCard, Player, Game, GameSendData, Tee, PlayerRoundDetails,
  Tournament, TournamentResult, TournamentRound } from '@/_models';
import { OnlineRound } from '@/_models/onlineRound';

@Injectable()
export class HttpService {

  // URL_STR = 'http://localhost:8080/rest/'; // local database
  // URL_STR = 'http://dgng.pl/rest/';  // production
  // URL_STR = 'http://localhost:8090/rest/'; // integration database

  constructor(private http: HttpClient) { }

  getCourses(): Observable<Array<Course>> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.get<Array<Course>>('rest/Courses');
  }

  getHoles(id: number): Observable<Array<Hole>> {
    return this.http.get<Array<Hole>>('rest/Holes/' + id);
  }

  addCourse(course: Course): Observable<Course> {

    const httpOptions = {
      headers: new HttpHeaders({
        // 'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<Course>('rest/Course', course, httpOptions);
  }

  deleteCourse(id: number) {
    return this.http.delete('rest/Course/' + id);
  }

  getRounds(id: number): Observable<Array<Round>> {
    return this.http.get<Array<Round>>('rest/Rounds/' + id);
  }

  // add round
  addRound(round: Round): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        // 'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<any>('rest/Round', round, httpOptions);
  }

  getScoreCards(roundId: number): Observable<Array<ScoreCard>> {
    return this.http.get<Array<ScoreCard>>('rest/ScoreCard/' + roundId);
  }

  authenticate(nick: string, password: string): Observable<HttpResponse<Player>> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      }),
      observe: 'response' as 'response'
    };

    // tslint:disable-next-line: max-line-length
    // return this.http.post<any>(environment.URL_STR + 'Authenticate', {nick, password}, {
    return this.http.post<any>('rest/Authenticate', {nick, password}, {
      headers: new HttpHeaders({'Access-Control-Allow-Origin': '*'}), observe: 'response'});
  }

  addPlayer(player: Player): Observable<void> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<void>('rest/AddPlayer', player, httpOptions);
  }

  // delete round
  deleteRound(id: number) {
    return this.http.delete('rest/Round/' + id);
  }

  // update player
  updatePlayer(player: Player): Observable<Player> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.patch<Player>('rest/PatchPlayer/' + player.id, player, httpOptions);
  }

  addGame(game: Game): Observable<void> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<void>('rest/Game', game, httpOptions);
  }

  getGames(player: Player): Observable<Array<Game>> {
    return this.http.get<Array<Game>>('rest/Game/' + player.id);
  }

  sendGame(gameSendData: GameSendData): Observable<void> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<void>('rest/SendGame', gameSendData, httpOptions);
  }

  // delete round (scorecard)
  deleteScoreCard(playerId: number, roundId: number) {
    return this.http.delete('rest/ScoreCard/' + playerId + '/' + roundId);
  }

  // update round
  updateRound(round: Round): Observable<void> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.patch<void>('rest/ScoreCard', round, httpOptions);
  }

  // gets list of tees for course
  getTees(courseId: number): Observable<Array<Tee>> {
    return this.http.get<Array<Tee>>('rest/Tee/' + courseId);
  }

  // gets player round details
  getPlayerRoundDetails(playerId: number, roundId: number): Observable<PlayerRoundDetails> {
    return this.http.get<PlayerRoundDetails>('rest/RoundPlayerDetails/' + playerId + '/' + roundId);
  }

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

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<void>('rest/TournamentRound/' + tournamentId, round, httpOptions);
  }

  addTournament(tournament: Tournament): Observable<void> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<void>('rest/Tournament', tournament, httpOptions);
  }

  // reset password
  resetPassword(adminId: number, player: Player): Observable<HttpResponse<null>> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.patch<HttpResponse<null>>('rest/ResetPassword/' + adminId, player, httpOptions);
  }

  // gets tournamnet rounds
  getTournamentResultRounds(resultId: number): Observable<Array<TournamentRound>> {
    return this.http.get<Array<TournamentRound>>('rest/TournamentResultRound/' + resultId);
  }

  addOnlineRound(onlineRound: OnlineRound): Observable<OnlineRound> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<OnlineRound>('rest/OnlineRound', onlineRound, httpOptions);
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

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<Round>('rest/FinalizeOnlineRound/' + onlineRoundId, httpOptions);
  }

  getOnlineRoundsForCourse(courseId: number): Observable<Array<OnlineRound>> {
    return this.http.get<Array<OnlineRound>>('rest/OnlineRoundCourse/' + courseId);
  }
}


