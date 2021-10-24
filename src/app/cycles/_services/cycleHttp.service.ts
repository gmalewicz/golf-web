import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cycle } from '../_models/cycle';
import { CycleTournament } from '../_models/cycleTournament';

@Injectable()
export class CycleHttpService {

  constructor(private http: HttpClient) { }

  // gets cycles
  getCycles(): Observable<Array<Cycle>> {
    return this.http.get<Array<Cycle>>('rest/Cycle');
  }

  // add cycle
  addCycle(cycle: Cycle): Observable<void> {
    return this.http.post<void>('rest/Cycle', cycle);
  }

  // gets cycle tournaments
  getCycleTournaments(cycleId: number): Observable<Array<CycleTournament>> {
    return this.http.get<Array<CycleTournament>>('rest/CycleTournament/' + cycleId);
  }
}


