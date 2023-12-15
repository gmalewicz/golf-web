import { PlayerRndCnt } from './../_models/playerRndCnt';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Hole, Round, ScoreCard, Player, Tee, PlayerRoundDetails, Version} from '@/_models';


@Injectable()
export class HttpService {

  constructor(private http: HttpClient) { }

  getCourses(): Observable<Array<Course>> {

    return this.http.get<Array<Course>>('rest/Courses');
  }

  getHoles(id: number): Observable<Array<Hole>> {
    return this.http.get<Array<Hole>>('rest/Holes/' + id);
  }

  addCourse(course: Course): Observable<HttpResponse<null>> {
    return this.http.post<HttpResponse<null>>('rest/Course', course);
  }

  deleteCourse(id: number) {
    return this.http.delete('rest/Course/' + id);
  }

  getRounds(playerId: number, pageId: number): Observable<Array<Round>> {
    return this.http.get<Array<Round>>('rest/Rounds/' + playerId + '/' + pageId);
  }

  getRecentRounds(pageId: number): Observable<Array<Round>> {
    return this.http.get<Array<Round>>('rest/RecentRounds/' + pageId);
  }

  // add round
  addRound(round: Round): Observable<void> {

    return this.http.post<void>('rest/Round', round);
  }

  getScoreCards(roundId: number): Observable<Array<ScoreCard>> {
    return this.http.get<Array<ScoreCard>>('rest/ScoreCard/' + roundId);
  }

  authenticate(nick: string, password: string): Observable<HttpResponse<Player>> {

    return this.http.post('rest/Authenticate', {nick, password}, {observe: 'response'});
  }

  refresh(playerId: number): Observable<HttpResponse<unknown>>  {

    return this.http.get<HttpResponse<unknown>>('rest/Refresh/' + playerId, {observe: 'response'});
  }

  // v2.20 update JWT not to break on-line round
  refreshOnDemand(playerId: number): Observable<HttpResponse<unknown>>  {

    return this.http.get<HttpResponse<unknown>>('rest/RefreshToken/' + playerId, {observe: 'response'});
  }

  addPlayer(player: Player): Observable<HttpResponse<unknown>> {

    return this.http.post<HttpResponse<unknown>>('rest/AddPlayer', player);
  }

  addPlayerOnBehalf(player: Player): Observable<Player> {

    return this.http.post<Player>('rest/AddPlayerOnBehalf', player);
  }

  // update player
  updatePlayer(player: Player): Observable<void> {

    return this.http.patch<void>('rest/PatchPlayer', player);
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

  // gets player round details
  getPlayersRoundDetails(roundId: number): Observable<Array<PlayerRoundDetails>> {
    return this.http.get<Array<PlayerRoundDetails>>('rest/RoundPlayersDetails/'  + roundId);
  }

  // reset password
  resetPassword(player: Player): Observable<HttpResponse<null>> {

    return this.http.patch<HttpResponse<null>>('rest/ResetPassword', player);
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

  searchForCourse(courseName: string): Observable<Array<Course>> {

    return this.http.post<Array<Course>>('rest/SearchForCourse', {name: courseName});
  }

  getSortedCourses(pageId: number): Observable<Array<Course>> {

    return this.http.get<Array<Course>>('rest/SortedCourses/' +  pageId);
  }

  purgeCourse(courseId: number): Observable<HttpResponse<null>> {
    return this.http.post<HttpResponse<null>>('rest/MoveToHistoryCourse/' + courseId, null);
  }

  updatePlayerRoundWHS(playerId: number, roundId: number, whs: number): Observable<HttpResponse<null>> {
    return this.http.patch<HttpResponse<null>>('rest/UpdatePlayerRound', {playerId, roundId, whs});
  }

  getPlayerRoundCnt(): Observable<Array<PlayerRndCnt>> {

    return this.http.get<Array<PlayerRndCnt>>('rest/PlayerRoundCnt');
  }

  deletePlayer(playerId: number): Observable<HttpResponse<null>> {
    return this.http.post<HttpResponse<null>>('rest/DeletePlayer', {id: playerId});
  }

  updatePlayerOnBehalf(player: Player): Observable<HttpResponse<null>> {
    return this.http.patch<HttpResponse<null>>('rest/UpdatePlayerOnBehalf', player);
  }

  getSocialPlayer(token: string): Observable<HttpResponse<Player>> {

    const headers = new HttpHeaders({Authorization: `Bearer ${token}`});

    return this.http.get<Player>('rest/GetSocialPlayer', {headers, observe: 'response'});
  }

  updatePlayerRnd(oldPlrId: number, newPlrId: number, roundId: number): Observable<HttpResponse<null>> {
    return this.http.patch<HttpResponse<null>>('rest/SwapPlrRnd', {oldPlrId, newPlrId, roundId});
  }

  searchForPlayer(nick: string, page: number): Observable<Array<Player>> {
    return this.http.post<Array<Player>>('rest/SearchForPlayer', {nick, page});
  }

  getVersion(): Observable<Version> {
    return this.http.get<Version>('rest/Version');
  }
}


