import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Hole, Round, ScoreCard } from '@/_models';

@Injectable()
export class HttpService {

  URL_STR = 'http://localhost:8080/rest/';

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

  addRound(round: Round): Observable<Round> {

    const httpOptions = {
      headers: new HttpHeaders({
        // 'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
    };

    return this.http.post<Round>(this.URL_STR + 'Round', round, httpOptions);
  }

  getScoreCards(roundId: number): Observable<Array<ScoreCard>> {
    return this.http.get<Array<ScoreCard>>(this.URL_STR + 'ScoreCards/' + roundId);
  }
}


