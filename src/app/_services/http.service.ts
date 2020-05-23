import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Hole, Round, ScoreCard, Player, Game, GameSendData, Tee, PlayerRoundDetails } from '@/_models';

@Injectable()
export class HttpService {

  URL_STR = 'http://localhost:8080/rest/';
  // URL_STR = 'http://dgng.pl/rest/';

  constructor(private http: HttpClient) { }

  getCourses(): Observable<Array<Course>> {
    return this.http.get<Array<Course>>(this.URL_STR + 'Courses');
  }

  getHoles(id: number): Observable<Array<Hole>> {
    return this.http.get<Array<Hole>>(this.URL_STR + 'Holes/' + id);
  }

  addCourse(course: Course): Observable<Course> {

    const httpOptions = {
      headers: new HttpHeaders({
        // 'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<Course>(this.URL_STR + 'Course', course, httpOptions);
  }

  deleteCourse(id: number) {
    return this.http.delete(this.URL_STR + 'Course/' + id);
  }

  getRounds(id: number): Observable<Array<Round>> {
    return this.http.get<Array<Round>>(this.URL_STR + 'Rounds/' + id);
  }

  // add round
  addRound(round: Round): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        // 'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<any>(this.URL_STR + 'Round', round, httpOptions);
  }

  getScoreCards(roundId: number): Observable<Array<ScoreCard>> {
    return this.http.get<Array<ScoreCard>>(this.URL_STR + 'ScoreCard/' + roundId);
  }

  authenticate(nick: string, password: string): Observable<HttpResponse<Player>> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      }),
      observe: 'response' as 'response'
    };

    // tslint:disable-next-line: max-line-length
    return this.http.post<any>(this.URL_STR + 'Authenticate', {nick, password}, {
      headers: new HttpHeaders({'Access-Control-Allow-Origin': '*'}), observe: 'response'});
  }

  addPlayer(player: Player): Observable<void> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<void>(this.URL_STR + 'AddPlayer', player, httpOptions);
  }

  // delete round
  deleteRound(id: number) {
    return this.http.delete(this.URL_STR + 'Round/' + id);
  }

  // update player
  updatePlayer(player: Player): Observable<Player> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.patch<Player>(this.URL_STR + 'PatchPlayer/' + player.id, player, httpOptions);
  }

  addGame(game: Game): Observable<void> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<void>(this.URL_STR + 'Game', game, httpOptions);
  }

  getGames(player: Player): Observable<Array<Game>> {
    return this.http.get<Array<Game>>(this.URL_STR + 'Game/' + player.id);
  }

  sendGame(gameSendData: GameSendData): Observable<void> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<void>(this.URL_STR + 'SendGame', gameSendData, httpOptions);
  }

  // delete round (scorecard)
  deleteScoreCard(playerId: number, roundId: number) {
    return this.http.delete(this.URL_STR + 'ScoreCard/' + playerId + '/' + roundId);
  }

  // update round
  updateRound(round: Round): Observable<void> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.patch<void>(this.URL_STR + 'ScoreCard', round, httpOptions);
  }

  // gets list of tees for course
  getTees(courseId: number): Observable<Array<Tee>> {
    return this.http.get<Array<Tee>>(this.URL_STR + 'Tee/' + courseId);
  }

  // gets player round details
  getPlayerRoundDetails(playerId: number, roundId: number): Observable<PlayerRoundDetails> {
    return this.http.get<PlayerRoundDetails>(this.URL_STR + 'RoundPlayerDetails/' + playerId + '/' + roundId);
  }

}


