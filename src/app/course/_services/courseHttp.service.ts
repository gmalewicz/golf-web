import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tee } from '@/_models/tee';


@Injectable()
export class CourseHttpService {

  constructor(private http: HttpClient) { }

  // add cycle
  addTee(tee: Tee, courseId: number): Observable<void> {
    return this.http.post<void>('rest/Tee/' + courseId, tee);
  }


}


