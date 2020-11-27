import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Hole, Round, ScoreCard, Player, Tee, PlayerRoundDetails} from '@/_models';


@Injectable()
export class HttpService {

  constructor(private http: HttpClient) { }

  getCourses(): Observable<Array<Course>> {

    return this.http.get<Array<Course>>('rest/Courses');
  }

  getHoles(id: number): Observable<Array<Hole>> {
    return this.http.get<Array<Hole>>('rest/Holes/' + id);
  }

  addCourse(course: Course): Observable<Course> {
    return this.http.post<Course>('rest/Course', course);
  }

  deleteCourse(id: number) {
    return this.http.delete('rest/Course/' + id);
  }

  getRounds(playerId: number, pageId: number): Observable<Array<Round>> {
    return this.http.get<Array<Round>>('rest/Rounds/' + playerId + '/' + pageId);
  }

  // add round
  addRound(round: Round): Observable<any> {

    return this.http.post<any>('rest/Round', round);
  }

  getScoreCards(roundId: number): Observable<Array<ScoreCard>> {
    return this.http.get<Array<ScoreCard>>('rest/ScoreCard/' + roundId);
  }

  authenticate(nick: string, password: string): Observable<HttpResponse<Player>> {

    return this.http.post<any>('rest/Authenticate', {nick, password}, {observe: 'response'});
  }

  addPlayer(player: Player): Observable<void> {

    return this.http.post<void>('rest/AddPlayer', player);
  }

  // delete round
  deleteRound(id: number) {
    return this.http.delete('rest/Round/' + id);
  }

  // update player
  updatePlayer(player: Player): Observable<Player> {

    return this.http.patch<Player>('rest/PatchPlayer/' + player.id, player);
  }

  // delete round (scorecard)
  deleteScoreCard(playerId: number, roundId: number) {
    return this.http.delete('rest/ScoreCard/' + playerId + '/' + roundId);
  }

  // update round
  updateRound(round: Round): Observable<void> {

    return this.http.patch<void>('rest/ScoreCard', round);
  }

  // gets list of tees for course
  getTees(courseId: number): Observable<Array<Tee>> {
    return this.http.get<Array<Tee>>('rest/Tee/' + courseId);
  }

  // gets player round details
  getPlayerRoundDetails(playerId: number, roundId: number): Observable<PlayerRoundDetails> {
    return this.http.get<PlayerRoundDetails>('rest/RoundPlayerDetails/' + playerId + '/' + roundId);
  }

  // reset password
  resetPassword(adminId: number, player: Player): Observable<HttpResponse<null>> {

    return this.http.patch<HttpResponse<null>>('rest/ResetPassword/' + adminId, player);
  }

  getPlayerForNick(nick: string): Observable<Player> {
    return this.http.get<Player>('rest/Player/' + nick);
  }

  getFavouriteCourses(playerId: number): Observable<Array<Course>> {
    return this.http.get<Array<Course>>('rest/FavouriteCourses/' + playerId);
  }

  addToFavouriteCourses(cousre: Course, playerId: number): Observable<HttpResponse<null>> {
    return this.http.post<HttpResponse<null>>('rest/FavouriteCourses/' + playerId, cousre);
  }

  deleteFromFavourites(course: Course, playerId: number): Observable<HttpResponse<null>> {
    return this.http.post<HttpResponse<null>>('rest/DeleteFavouriteCourse/' + playerId, course);
  }
}


